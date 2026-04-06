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
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
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

// Catmull-Rom スプラインで滑らかな有機的ブロブを描く
function blobPath(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number,
  rotation: number,
  seed: number
) {
  const n = 6
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 + rotation
    const d = 1
      + Math.sin(i * 1.7 + seed) * 0.03
      + Math.cos(i * 2.9 + seed * 0.8) * 0.015
    pts.push({ x: cx + Math.cos(angle) * r * d, y: cy + Math.sin(angle) * r * d })
  }
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    if (i === 0) ctx.moveTo(p1.x, p1.y)
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
  }
  ctx.closePath()
}

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
    drawOrganic(ctx, 'wait', 0, 0)
  }

  function drawOrganic(ctx: CanvasRenderingContext2D, phase: 'pour' | 'wait', prog: number, elapsedMs: number) {
    ctx.clearRect(0, 0, CSIZE, CSIZE)
    const cx = CSIZE / 2, cy = CSIZE / 2
    const sec = elapsedMs / 1000

    // ── 外側の固定リング（ペースメーター） ──
    ctx.beginPath()
    ctx.arc(cx, cy, RMAX, 0, Math.PI * 2)
    ctx.strokeStyle = '#1e1e1e'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // プログレスアーク（外リング固定、進捗だけ変化）
    if (prog > 0.01) {
      const a = -Math.PI / 2
      ctx.beginPath()
      ctx.arc(cx, cy, RMAX, a, a + Math.PI * 2 * prog)
      ctx.strokeStyle = phase === 'pour' ? 'rgba(255,255,255,0.80)' : 'rgba(110,110,110,0.65)'
      ctx.lineWidth = 2.5
      ctx.stroke()
    }

    const maxR = RMAX * 0.80
    // pour: 拡大（0→1）  wait: 縮小（1→0）
    const baseR = phase === 'pour' ? maxR * prog : maxR * (1 - prog)
    if (baseR < 2) return

    // ── 3層の有機的ブロブ（それぞれ独立した回転速度） ──
    // blob 1（背面・左上にオフセット）
    const rot1 = sec * -1.10
    const r1 = baseR * 0.92
    const ox1 = baseR * -0.12, oy1 = baseR * -0.10
    blobPath(ctx, cx + ox1, cy + oy1, r1, rot1, 1.4)
    ctx.fillStyle = phase === 'pour' ? 'rgba(95,95,95,0.38)' : 'rgba(55,55,55,0.45)'
    ctx.fill()

    // blob 2（中間・右上にオフセット）
    const rot2 = sec * 0.84
    const r2 = baseR * 0.95
    const ox2 = baseR * 0.10, oy2 = baseR * -0.12
    blobPath(ctx, cx + ox2, cy + oy2, r2, rot2, 3.8)
    ctx.fillStyle = phase === 'pour' ? 'rgba(80,80,80,0.30)' : 'rgba(50,50,50,0.38)'
    ctx.fill()

    // blob 3（前面・中央・グラデーション）
    const rot3 = sec * 0.56
    blobPath(ctx, cx, cy, baseR, rot3, 6.2)
    if (phase === 'pour') {
      const g = ctx.createRadialGradient(
        cx - baseR * 0.10, cy - baseR * 0.08, 0,
        cx, cy, baseR
      )
      g.addColorStop(0,    'rgba(255,255,255,1.00)')
      g.addColorStop(0.42, 'rgba(242,242,242,0.97)')
      g.addColorStop(0.76, 'rgba(195,195,195,0.90)')
      g.addColorStop(1,    'rgba(140,140,140,0.68)')
      ctx.fillStyle = g
    } else {
      ctx.fillStyle = 'rgba(48,48,48,0.60)'
    }
    ctx.fill()
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
      if (ctx) drawOrganic(ctx, step.type, prog, elapsedMs)
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

  const curStep = r.steps[stepIdx]
  const nextStep = r.steps[stepIdx + 1]
  const nextStepIdx = stepIdx + 1
  const step0 = r.steps[0]
  const step0Tgt = stepTargetG(r, 0, beans)

  return (
    <div className="screen-active" onClick={overlay === 'none' ? handlePauseResume : undefined}>

      {/* ── HEADER ── */}
      <div className="act-top" onClick={e => e.stopPropagation()}>
        <div className="act-rname">{(lang === 'ja' ? r.meta.title_ja : r.meta.title).toUpperCase()}</div>
        <button className="act-pause" onClick={handlePauseResume}>
          {overlay === 'paused' ? t('resume') : t('pause')}
        </button>
      </div>

      {/* ── TOP HALF: CANVAS ── */}
      <div className="act-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>

      {/* ── BOTTOM HALF: TEXT INFO ── */}
      <div className="act-bottom">
        {/* Scale display */}
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

        {/* Step label */}
        <div className="act-step-label">
          <span className="act-step-type-badge">
            {curStep?.type === 'pour' ? t('step_pour') : t('step_wait')}
          </span>
          <span className="act-step-count">
            {t('step_lbl')} {stepIdx + 1}{t('of_lbl')}{r.steps.length}
          </span>
        </div>

        {/* Instruction + tip */}
        <div className="act-instruction">{buildInstruction(stepIdx)}</div>
        <div className="act-tip-text">{lang === 'ja' ? curStep?.tip_ja : curStep?.tip}</div>

        {/* Progress bar */}
        <div className="act-progbar">
          {r.steps.map((_, i) => (
            <div key={i} className={`pseg${i < stepIdx ? ' done' : i === stepIdx ? ' cur' : ''}`} />
          ))}
        </div>

        {/* Next step */}
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

        {/* Footer */}
        <div className="act-hint">{t('tap_hint')}</div>
      </div>

      {/* ── READY OVERLAY ── */}
      <div className={`overlay${overlay === 'ready' ? ' show' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="ready-label">{t('ready_step1')}</div>
        <div className="ready-type-badge">
          {step0?.type === 'pour' ? t('step_pour') : t('step_wait')}
        </div>
        <div className="ready-instruction">{buildInstruction(0)}</div>
        <div className="ready-tip">{lang === 'ja' ? step0?.tip_ja : step0?.tip}</div>
        <button className="ready-start-btn" onClick={startCountdown}>{t('act_start')}</button>
        <button className="ready-back-btn" onClick={handleStop}>{t('act_back')}</button>
      </div>

      {/* ── COUNTDOWN OVERLAY ── */}
      <div className={`overlay${overlay === 'countdown' ? ' show' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="cd-num">{cdCount === 0 ? 'GO' : cdCount}</div>
        <div className="cd-lbl">{t('cd_lbl')}</div>
        <div className="cd-step-divider" />
        <div className="ready-type-badge">
          {step0?.type === 'pour' ? t('step_pour') : t('step_wait')}
        </div>
        <div className="ready-instruction">{buildInstruction(0)}</div>
        <div className="ready-tip">{lang === 'ja' ? step0?.tip_ja : step0?.tip}</div>
        <button className="cd-cancel" onClick={cancelCountdown}>{t('cd_cancel')}</button>
      </div>

      {/* ── PAUSED OVERLAY ── */}
      <div className={`overlay${overlay === 'paused' ? ' show' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="paused-lbl">{t('paused')}</div>
        <button className="paused-resume" onClick={handlePauseResume}>{t('resume')}</button>
        <button className="paused-stop" onClick={handleStop}>{t('stop')}</button>
      </div>

    </div>
  )
}
