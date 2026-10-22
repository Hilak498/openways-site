"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a GA4 event. gtag only exists after the visitor approved analytics
 * cookies (see components/analytics.tsx), so without consent this is a no-op.
 */
export function trackEvent(name: string, params?: Record<string, string | number>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}
