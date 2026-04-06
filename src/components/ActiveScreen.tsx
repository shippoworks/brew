import { useEffect, useRef, useState, useCallback } from 'react'
import { Recipe } from '../data/recipes'
import { Lang, useT } from '../i18n'
import { useTimer } from '../hooks/useTimer'

interface Props {
  recipe: Recipe
  beans: number
  lang: Lang
  onFinish: (elapsedMs: number) => void
  onBack: () => void
}

type Overlay = 'ready' | 'countdown' | 'paused' | 'none'

function scaledWater(r: Recipe, beans: number) {
  return Math.round((beans / r.base.beans) * r.base.water * 10) / 10
}

function stepTargetG(r: Recipe, i: number, beans: number): number | null {
  const step = r.steps[i]
  if (step.target_ratio == null) return null
  return Math.round(step.target_ratio * scaledWater(r, beans) * 10) / 10
}

function prevCumulG(r: Recipe, i: number, beans: number): number {
  let last = 0
  for (let j = 0; j < i; j++) {
    const tg = stepTargetG(r, j, beans)
    if (tg !== null) last = tg
  }
  return last
}

function fmtTime(ms: number) {
  const s = ms / 1000
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  const d = Math.floor((ms % 1000) / 100)
  return `${m}:${String(sec).padStart(2, '0')}.${d}`
}

function stepEndSec(r: Recipe, i: number): number {
  return r.steps.slice(0, i + 1).reduce((sum, s) => sum + s.duration, 0)
}

function fmtSec(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const CSIZE = 240
const RMAX = 108

export default function ActiveScreen({ recipe: r, beans, lang, onFinish, onBack }: Props) {
  const t = useT(lang)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stepIdxRef = useRef(0)
  const stepStartMsRef = useRef(0)
  const finTimeMsRef = useRef(0)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const [overlay, setOverlay] = useState<Overlay>('ready')
  const [timerDisplay, setTimerDisplay] = useState('0:00.0')
  const [cdCount, setCdCount] = useState(5)
  const [stepIdx, setStepIdx] = useState(0)
  const [dispGrams, setDispGrams] = useState(0)
  const cdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // step index to display (0 during ready/countdown, current during active)
  const displayIdx = overlay === 'none' ? stepIdx : 0

  function buildInstruction(si: number): string {
    const step = r.steps[si]
    const tgt = stepTargetG(r, si, beans)
    const endTime = fmtSec(stepEndSec(r, si))
    if (lang === 'ja') {
      if (step.type === 'pour') {
        return tgt != null
          ? `${endTime}${t('by_time')} ${tgt.toFixed(1)}g ${t('pour_to')}`
          : `${endTime}${t('pour_until')}`
      }
      return `${endTime}${t('wait_until')}`
    } else {
      if (step.type === 'pour') {
        return tgt != null
          ? `${t('pour_to')} ${tgt.toFixed(1)}g ${t('by_time')} ${endTime}`
          : `${t('pour_until')} ${endTime}`
      }
      return `${t('wait_until')} ${endTime}`
    }
  }

  function drawIdle(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, CSIZE, CSIZE)
    const cx = CSIZE / 2, cy = CSIZE / 2
    ctx.beginPath(); ctx.arc(cx, cy, RMAX, 0, Math.PI * 2)
    ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 1; ctx.stroke()
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6); ctx.stroke()
  }

  function drawCircle(ctx: CanvasRenderingContext2D, phase: 'pour' | 'wait', prog: number) {
    ctx.clearRect(0, 0, CSIZE, CSIZE)
    const cx = CSIZE / 2, cy = CSIZE / 2
    ctx.beginPath(); ctx.arc(cx, cy, RMAX, 0, Math.PI * 2)
    ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 1; ctx.stroke()
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6); ctx.stroke()
    const rad = RMAX * Math.max(0, Math.min(1, prog))
    if (rad < 1) return
    if (phase === 'pour') {
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke()
      const a = -Math.PI / 2
      ctx.beginPath(); ctx.arc(cx, cy, rad + 3, a, a + Math.PI * 2 * prog)
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
    } else {
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2; ctx.stroke()
      const a = -Math.PI / 2
      ctx.beginPath(); ctx.arc(cx, cy, rad, a, a + Math.PI * 2 * prog)
      ctx.strokeStyle = '#777'; ctx.lineWidth = 2; ctx.stroke()
    }
  }

  const onTick = useCallback((elapsedMs: number) => {
    setTimerDisplay(fmtTime(elapsedMs))

    const steps = r.steps
    let si = stepIdxRef.current
    let stepStart = stepStartMsRef.current

    while (si < steps.length && elapsedMs - stepStart >= steps[si].duration * 1000) {
      stepStart += steps[si].duration * 1000
      si++
      stepIdxRef.current = si
      stepStartMsRef.current = stepStart
      setStepIdx(si)
    }

    if (si >= steps.length) {
      finTimeMsRef.current = elapsedMs
      timer.stop()
      releaseWakeLock()
      onFinish(elapsedMs)
      return
    }

    const step = steps[si]
    const stepElapsed = (elapsedMs - stepStart) / 1000
    const prog = Math.min(stepElapsed / step.duration, 1)

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) drawCircle(ctx, step.type, prog)
    }

    const prev = prevCumulG(r, si, beans)
    if (step.type === 'pour' && step.target_ratio != null) {
      const thisTgt = stepTargetG(r, si, beans)!
      const g = prev + (thisTgt - prev) * Math.min(stepElapsed / step.duration, 1)
      setDispGrams(g)
    } else {
      setDispGrams(prev)
    }
  }, [r, beans, onFinish])

  const timer = useTimer(onTick)

  function acquireWakeLock() {
    if ('wakeLock' in navigator) {
      (navigator as Navigator & { wakeLock: { request: (t: string) => Promise<WakeLockSentinel> } })
        .wakeLock.request('screen')
        .then(wl => { wakeLockRef.current = wl })
        .catch(() => { /* ignore */ })
    }
  }

  function releaseWakeLock() {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => { /* ignore */ })
      wakeLockRef.current = null
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = CSIZE
      canvas.height = CSIZE
      const ctx = canvas.getContext('2d')
      if (ctx) drawIdle(ctx)
    }
    acquireWakeLock()
    return () => {
      timer.stop()
      releaseWakeLock()
      if (cdIntervalRef.current) clearInterval(cdIntervalRef.current)
    }
  }, [])

  function startCountdown() {
    setOverlay('countdown')
    setCdCount(5)
    let count = 5
    cdIntervalRef.current = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(cdIntervalRef.current!)
        cdIntervalRef.current = null
        setCdCount(0)
        setTimeout(() => {
          setOverlay('none')
          stepIdxRef.current = 0
          stepStartMsRef.current = 0
          setStepIdx(0)
          timer.start()
        }, 600)
      } else {
        setCdCount(count)
      }
    }, 1000)
  }

  function cancelCountdown() {
    if (cdIntervalRef.current) { clearInterval(cdIntervalRef.current); cdIntervalRef.current = null }
    setCdCount(5)
    setOverlay('ready')
  }

  function handlePauseResume() {
    if (overlay === 'paused') {
      timer.resume()
      setOverlay('none')
    } else {
      timer.pause()
      setOverlay('paused')
    }
  }

  function handleStop() {
    timer.stop()
    releaseWakeLock()
    onBack()
  }

  const curStep = r.steps[displayIdx]
  const nextStep = overlay === 'none' ? r.steps[stepIdx + 1] : r.steps[1]
  const nextStepIdx = overlay === 'none' ? stepIdx + 1 : 1

  return (
    <div className="screen-active" onClick={overlay === 'none' ? handlePauseResume : undefined}>

      {/* ── HEADER ── */}
      <div className="act-top" onClick={e => e.stopPropagation()}>
        <div className="act-rname">{r.meta.title.toUpperCase()}</div>
        {overlay === 'none' && (
          <button className="act-pause" onClick={handlePauseResume}>{t('pause')}</button>
        )}
        {overlay === 'ready' && (
          <button className="act-pause" onClick={handleStop}>{t('act_back')}</button>
        )}
        {overlay === 'countdown' && (
          <button className="act-pause" onClick={cancelCountdown}>{t('cd_cancel')}</button>
        )}
      </div>

      {/* ── CANVAS (with countdown overlay) ── */}
      <div className="act-canvas-wrap">
        <canvas ref={canvasRef} />
        {overlay === 'countdown' && (
          <div className="act-cd-badge">
            <div className="act-cd-num">{cdCount === 0 ? 'GO' : cdCount}</div>
            <div className="act-cd-lbl">{t('cd_lbl')}</div>
          </div>
        )}
      </div>

      {/* ── STEP LABEL ── */}
      <div className="act-step-label">
        <span className="act-step-type-badge">
          {curStep?.type === 'pour' ? t('step_pour') : t('step_wait')}
        </span>
        <span className="act-step-count">
          {t('step_lbl')} {displayIdx + 1}{t('of_lbl')}{r.steps.length}
        </span>
      </div>

      {/* ── INSTRUCTION ── */}
      <div className="act-instruction">{buildInstruction(displayIdx)}</div>
      <div className="act-tip-text">{lang === 'ja' ? curStep?.tip_ja : curStep?.tip}</div>

      {/* ── SPACER ── */}
      <div style={{ flex: 1 }} />

      {/* ── SCALE DISPLAY: TIME | WEIGHT ── */}
      <div className="act-scale-display" onClick={e => e.stopPropagation()}>
        <div className="act-scale-col">
          <div className="act-scale-lbl">{t('time_lbl')}</div>
          <div className="act-scale-val">{timerDisplay}</div>
        </div>
        <div className="act-scale-divider" />
        <div className="act-scale-col">
          <div className="act-scale-lbl">{t('weight_lbl')}</div>
          <div className="act-scale-val">
            {dispGrams.toFixed(1)}<span className="act-scale-unit">g</span>
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="act-progbar">
        {r.steps.map((_, i) => (
          <div key={i} className={`pseg${i < stepIdx ? ' done' : i === stepIdx && overlay === 'none' ? ' cur' : ''}`} />
        ))}
      </div>

      {/* ── NEXT STEP ── */}
      <div className="act-next" onClick={e => e.stopPropagation()}>
        <div className="act-next-lbl">
          {!nextStep ? t('all_done') : nextStepIdx === r.steps.length - 1 ? t('last_step') : t('next_step')}
        </div>
        {nextStep && (
          <>
            <div className="act-next-instruction">{buildInstruction(nextStepIdx)}</div>
            <div className="act-next-tip-text">{lang === 'ja' ? nextStep.tip_ja : nextStep.tip}</div>
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      {overlay === 'ready' ? (
        <div className="act-ready-actions" onClick={e => e.stopPropagation()}>
          <button className="act-start-btn" onClick={startCountdown}>{t('act_start')}</button>
        </div>
      ) : (
        <div className="act-hint">{overlay === 'countdown' ? t('cd_cancel') : t('tap_hint')}</div>
      )}

      {/* ── PAUSED OVERLAY ── */}
      <div className={`overlay${overlay === 'paused' ? ' show' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="paused-lbl">{t('paused')}</div>
        <button className="paused-resume" onClick={handlePauseResume}>{t('resume')}</button>
        <button className="paused-stop" onClick={handleStop}>{t('stop')}</button>
      </div>

    </div>
  )
}
