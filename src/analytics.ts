declare function gtag(...args: unknown[]): void

export function trackEvent(name: string, params?: Record<string, string | number>) {
  try {
    gtag('event', name, params)
  } catch { /* ignore if gtag not loaded */ }
}
