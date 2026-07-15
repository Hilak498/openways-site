"use client";

/** Cookie-consent state shared by the banner and the analytics loader. */
export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

export const CONSENT_STORAGE_KEY = "ow-cookie-consent";
export const CONSENT_EVENT = "ow-consent-changed";

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.analytics !== "boolean") return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: Boolean(parsed.marketing),
      decidedAt: parsed.decidedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeConsent(consent: Omit<ConsentState, "necessary" | "decidedAt">) {
  const state: ConsentState = {
    necessary: true,
    ...consent,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  return state;
}
