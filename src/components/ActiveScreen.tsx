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
  for (let j = 0; j <= i; j++) {
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

  // Canvas drawing
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

    // Advance steps
    while (si < steps.length && elapsedMs - stepStart >= steps[si].duration * 1000) {
      stepStart += steps[si].duration * 1000
      si++
      stepIdxRef.current = si
      stepStartMsRef.current = stepStart
      setStepIdx(si)
    }

    if (si >= steps.length) {
      // All done
      finTimeMsRef.current = elapsedMs
      timer.stop()
      releaseWakeLock()
      onFinish(elapsedMs)
      return
    }

    const step = steps[si]
    const stepElapsed = (elapsedMs - stepStart) / 1000
    const prog = Math.min(stepElapsed / step.duration, 1)

    // Canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) drawCircle(ctx, step.type, prog)
    }

    // Grams simulation
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
        setCdCount(0) // shows 'GO' briefly
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

  const curStep = r.steps[stepIdx]
  const nextStep = r.steps[stepIdx + 1]
  const totalWater = scaledWater(r, beans)
  const curTarget = curStep ? stepTargetG(r, stepIdx, beans) : null
  const waterPct = totalWater > 0 ? Math.min(dispGrams / totalWater * 100, 100) : 0

  function getNextLabel() {
    if (!nextStep) return t('all_done')
    if (stepIdx + 1 === r.steps.length - 1) return t('last_step')
    return t('next_step')
  }

  const step0 = r.steps[0]
  const step0Tgt = stepTargetG(r, 0, beans)

  return (
    <div className="screen-active" onClick={overlay === 'none' ? handlePauseResume : undefined}>
      {/* Top bar */}
      <div className="act-top" onClick={e => e.stopPropagation()}>
        <div className="act-rname">{r.meta.title.toUpperCase()}</div>
        <button className="act-pause" onClick={handlePauseResume}>
          {overlay === 'paused' ? t('resume') : t('pause')}
        </button>
      </div>

      {/* Timer */}
      <div className="act-timer-wrap">
        <div className="act-timer">{timerDisplay}</div>
      </div>

      {/* Canvas */}
      <div className="act-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>

      {/* Scale */}
      <div className="act-scale-wrap">
        <div className="scale-bar-outer">
          <div className="scale-bar-inner" style={{ width: `${waterPct.toFixed(1)}%` }} />
        </div>
        <div className="scale-readout">
          <div className="scale-cur-g">{dispGrams.toFixed(1)}</div>
          <div className="scale-slash">/</div>
          <div className="scale-target-g">{curTarget != null ? curTarget.toFixed(1) : '—'}</div>
          <div className="scale-unit-g">g</div>
        </div>
      </div>

      {/* Step info */}
      {overlay === 'none' && curStep && (
        <div className="act-info">
          <div className="act-step-type">
            {curStep.type === 'pour' ? t('step_pour') : t('step_wait')}
          </div>
          <div className="act-tip">{lang === 'ja' ? curStep.tip_ja : curStep.tip}</div>
          <div className="act-stepcnt">
            {t('step_lbl')} {stepIdx + 1} {t('of_lbl')} {r.steps.length}
          </div>
        </div>
      )}

      {/* Next step */}
      {overlay === 'none' && (
        <div className="act-next">
          <div className="act-next-lbl">{getNextLabel()}</div>
          {nextStep && (
            <>
              <div className="act-next-tip">{lang === 'ja' ? nextStep.tip_ja : nextStep.tip}</div>
              <div className="act-next-meta">
                {nextStep.duration}s
                {stepTargetG(r, stepIdx + 1, beans) != null
                  ? `  →  ${stepTargetG(r, stepIdx + 1, beans)!.toFixed(1)}g`
                  : ''}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step progress bar */}
      <div className="act-progbar">
        {r.steps.map((_, i) => (
          <div
            key={i}
            className={`pseg${i < stepIdx ? ' done' : i === stepIdx ? ' cur' : ''}`}
          />
        ))}
      </div>

      <div className="act-hint">{t('tap_hint')}</div>

      {/* Ready overlay */}
      <div className={`overlay${overlay === 'ready' ? ' show' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="ready-title">{t('ready_step1')}</div>
        <div className="ready-step-type">
          {step0?.type === 'pour' ? t('step_pour') : t('step_wait')}
        </div>
        <div className="ready-step-tip">{lang === 'ja' ? step0?.tip_ja : step0?.tip}</div>
        <div className="ready-step-meta">
          {step0?.duration}s{step0Tgt != null ? `  →  ${step0Tgt.toFixed(1)}g` : ''}
        </div>
        <button className="ready-start-btn" onClick={startCountdown}>{t('act_start')}</button>
        <button className="ready-back-btn" onClick={handleStop}>{t('act_back')}</button>
      </div>

      {/* Countdown overlay */}
      <div className={`overlay${overlay === 'countdown' ? ' show' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="cd-num">{cdCount === 0 ? 'GO' : cdCount}</div>
        <div className="cd-lbl">{t('cd_lbl')}</div>
        <button className="cd-cancel" onClick={cancelCountdown}>{t('cd_cancel')}</button>
      </div>

      {/* Paused overlay */}
      <div className={`overlay${overlay === 'paused' ? ' show' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="paused-lbl">{t('paused')}</div>
        <button className="paused-resume" onClick={handlePauseResume}>{t('resume')}</button>
        <button className="paused-stop" onClick={handleStop}>{t('stop')}</button>
      </div>
    </div>
  )
}
