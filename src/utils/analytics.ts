/**
 * GA4 event helper. Pushes to the dataLayer only when analytics consent was
 * granted (the GoogleAnalytics component sets window.__ginnytechGaLoaded).
 * Safe no-op otherwise: no data is collected without consent.
 */
export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  try {
    if (!window.__ginnytechGaLoaded) return;
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') {
      gtag('event', name, params);
    }
  } catch {
    // never break the UI for analytics
  }
}
