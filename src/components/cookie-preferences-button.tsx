"use client";

/** Reopens the cookie preferences dialog (listened to by <CookieConsent/>). */
export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="btn-dark !px-5 !py-2.5 text-sm"
      onClick={() => window.dispatchEvent(new Event("ow-open-cookie-preferences"))}
    >
      פתיחת הגדרות העוגיות
    </button>
  );
}
