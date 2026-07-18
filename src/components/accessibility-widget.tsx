"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Accessibility widget per Israeli Standard 5568 / WCAG 2.0 AA.
 * Preferences persist in localStorage and are applied as classes on <html>.
 */

interface A11yState {
  textSize: 0 | 1 | 2;
  underlineLinks: boolean;
  highContrast: boolean;
  grayscale: boolean;
  reduceMotion: boolean;
}

const DEFAULT_STATE: A11yState = {
  textSize: 0,
  underlineLinks: false,
  highContrast: false,
  grayscale: false,
  reduceMotion: false,
};

const STORAGE_KEY = "ow-a11y-preferences";

function applyState(state: A11yState) {
  const root = document.documentElement;
  root.classList.toggle("a11y-large-text", state.textSize === 1);
  root.classList.toggle("a11y-larger-text", state.textSize === 2);
  root.classList.toggle("a11y-underline-links", state.underlineLinks);
  root.classList.toggle("a11y-high-contrast", state.highContrast);
  root.classList.toggle("a11y-grayscale", state.grayscale);
  root.classList.toggle("a11y-reduce-motion", state.reduceMotion);
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULT_STATE);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<A11yState>) };
        // Hydration-safe client-only read of persisted preferences
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(saved);
        applyState(saved);
      }
    } catch {
      /* corrupt storage - keep defaults */
    }
  }, []);

  const update = useCallback((patch: Partial<A11yState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      applyState(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    applyState(DEFAULT_STATE);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <div className="fixed bottom-5 left-5 z-[80]">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={open ? "סגירת תפריט נגישות" : "פתיחת תפריט נגישות"}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-navy-800 text-white shadow-soft transition hover:bg-navy-700"
      >
        {/* Universal accessibility icon */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="4.5" r="2" />
          <path d="M12 7.5c-2.6 0-5.1-.4-7.4-1.1a.9.9 0 1 0-.5 1.7c1.7.6 3.6 1 5.4 1.1v3.3c0 .4-.06.9-.2 1.3l-1.9 5a.95.95 0 0 0 1.8.7l1.9-4.6c.15-.35.5-.6.9-.6s.75.25.9.6l1.9 4.6a.95.95 0 1 0 1.8-.7l-1.9-5c-.14-.4-.2-.9-.2-1.3V9.2c1.8-.1 3.7-.5 5.4-1.1a.9.9 0 1 0-.5-1.7c-2.3.7-4.8 1.1-7.4 1.1Z" />
        </svg>
      </button>

      {open ? (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-label="הגדרות נגישות"
          className="absolute bottom-16 left-0 w-72 rounded-2xl border border-navy-800/10 bg-white p-5 shadow-soft"
        >
          <h2 className="text-base font-bold text-navy-800">הגדרות נגישות</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="mb-1.5 font-semibold text-navy-800" id="a11y-text-size-label">
                גודל טקסט
              </p>
              <div role="group" aria-labelledby="a11y-text-size-label" className="flex gap-2">
                {([0, 1, 2] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={state.textSize === size}
                    onClick={() => update({ textSize: size })}
                    className={`flex-1 rounded-lg border px-2 py-2 font-semibold transition ${
                      state.textSize === size
                        ? "border-gold-600 bg-gold-500/15 text-gold-800"
                        : "border-navy-800/15 text-navy-700 hover:border-gold-500"
                    }`}
                  >
                    {size === 0 ? "רגיל" : size === 1 ? "גדול" : "גדול מאוד"}
                  </button>
                ))}
              </div>
            </div>

            {(
              [
                ["underlineLinks", "הדגשת קישורים"],
                ["highContrast", "ניגודיות מוגברת"],
                ["grayscale", "גווני אפור"],
                ["reduceMotion", "הפחתת אנימציות"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <label htmlFor={`a11y-${key}`} className="font-semibold text-navy-800">
                  {label}
                </label>
                <input
                  id={`a11y-${key}`}
                  type="checkbox"
                  checked={state[key]}
                  onChange={(e) => update({ [key]: e.target.checked })}
                  className="h-5 w-5 accent-gold-600"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-navy-800/10 pt-3 text-sm">
            <button
              type="button"
              onClick={reset}
              className="font-semibold text-navy-700 underline underline-offset-2 hover:text-navy-900"
            >
              איפוס הגדרות
            </button>
            <Link
              href="/accessibility-statement"
              className="font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-600"
            >
              הצהרת נגישות
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
