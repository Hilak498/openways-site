"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent, type ConsentState } from "@/lib/consent";

/**
 * Cookie banner + preferences manager.
 * No tracking script loads before the user gives explicit consent - the
 * <Analytics/> component listens for the consent event and only then injects
 * anything.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      // Hydration-safe client-only read: the banner can only appear after
      // mount, since consent lives in localStorage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
    // Allow reopening the preferences from the footer/a11y widget if needed
    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener("ow-open-cookie-preferences", reopen);
    return () => window.removeEventListener("ow-open-cookie-preferences", reopen);
  }, []);

  function decide(consent: Omit<ConsentState, "necessary" | "decidedAt">) {
    writeConsent(consent);
    setVisible(false);
    setShowPrefs(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-2xl border border-navy-800/10 bg-white p-5 shadow-soft sm:inset-x-6 sm:p-6"
    >
      <h2 id="cookie-banner-title" className="text-lg font-bold text-navy-800">
        שימוש בעוגיות באתר
      </h2>
      <p className="mt-2 text-sm leading-6 text-navy-700">
        אנחנו משתמשים בעוגיות הכרחיות לתפקוד האתר. עוגיות סטטיסטיקה ושיווק
        יופעלו רק בהסכמתכם המפורשת, ותוכלו לשנות את הבחירה בכל עת בעמוד{" "}
        <Link href="/cookies" className="font-semibold text-gold-700 underline underline-offset-2">
          מדיניות העוגיות
        </Link>
        .
      </p>

      {showPrefs ? (
        <fieldset className="mt-4 space-y-3 rounded-xl bg-sand-50 p-4">
          <legend className="sr-only">העדפות עוגיות</legend>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-navy-800">עוגיות הכרחיות</p>
              <p className="text-sm text-navy-600">נדרשות לאבטחה ולתפקוד בסיסי של האתר.</p>
            </div>
            <span className="text-sm font-semibold text-navy-600">פעילות תמיד</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="consent-analytics" className="cursor-pointer">
              <span className="font-semibold text-navy-800">עוגיות סטטיסטיקה</span>
              <span className="block text-sm text-navy-600">
                מדידת שימוש אנונימית לשיפור האתר (Google Analytics).
              </span>
            </label>
            <input
              id="consent-analytics"
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="h-5 w-5 accent-gold-600"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="consent-marketing" className="cursor-pointer">
              <span className="font-semibold text-navy-800">עוגיות שיווק</span>
              <span className="block text-sm text-navy-600">
                התאמת מסרים שיווקיים (למשל פיקסל של רשתות חברתיות).
              </span>
            </label>
            <input
              id="consent-marketing"
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="h-5 w-5 accent-gold-600"
            />
          </div>
        </fieldset>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-dark !px-5 !py-2.5 text-sm"
          onClick={() => decide({ analytics: true, marketing: true })}
        >
          אישור הכול
        </button>
        {showPrefs ? (
          <button
            type="button"
            className="btn-primary !px-5 !py-2.5 text-sm"
            onClick={() => decide({ analytics, marketing })}
          >
            שמירת הבחירה שלי
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary !px-5 !py-2.5 text-sm"
            onClick={() => setShowPrefs(true)}
          >
            הגדרות מתקדמות
          </button>
        )}
        <button
          type="button"
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900"
          onClick={() => decide({ analytics: false, marketing: false })}
        >
          רק עוגיות הכרחיות
        </button>
      </div>
    </div>
  );
}
