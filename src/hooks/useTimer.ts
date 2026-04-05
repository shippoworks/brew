import { useRef, useCallback } from 'react'

export interface TimerHandle {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  getElapsedMs: () => number
}

export function useTimer(onTick: (elapsedMs: number) => void): TimerHandle {
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  const totalPausedRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const activeRef = useRef(false)
  const pausedRef = useRef(false)

  const tick = useCallback(() => {
    if (!activeRef.current || pausedRef.current) return
    const elapsed = Date.now() - startTimeRef.current - totalPausedRef.current
    onTick(elapsed)
    rafRef.current = requestAnimationFrame(tick)
  }, [onTick])

  const start = useCallback(() => {
    activeRef.current = true
    pausedRef.current = false
    startTimeRef.current = Date.now()
    totalPausedRef.current = 0
    pausedAtRef.current = 0
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    if (!activeRef.current || pausedRef.current) return
    pausedRef.current = true
    pausedAtRef.current = Date.now()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const resume = useCallback(() => {
    if (!pausedRef.current) return
    totalPausedRef.current += Date.now() - pausedAtRef.current
    pausedRef.current = false
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    activeRef.current = false
    pausedRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const getElapsedMs = useCallback(() => {
    if (!activeRef.current) return 0
    if (pausedRef.current) return pausedAtRef.current - startTimeRef.current - totalPausedRef.current
    return Date.now() - startTimeRef.current - totalPausedRef.current
  }, [])

  return { start, pause, resume, stop, getElapsedMs }
}
