'use client';

import { useEffect, useState } from 'react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('openways-cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('openways-cookie-consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6 text-slate-700">
          האתר משתמש בעוגיות לשיפור חוויית הגלישה והצגת שירותים מותאמים. באפשרותך לקבל מידע נוסף במדיניות העוגיות.
        </p>
        <button
          onClick={accept}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          אישור
        </button>
      </div>
    </div>
  );
}
