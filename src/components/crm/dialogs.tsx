"use client";

import { useActionState, useEffect, useRef } from "react";

import { createLeadAction, importCsvAction, type ActionResult } from "@/app/crm/actions";

import { LeadFields } from "./lead-drawer";
import { IconUpload, IconX } from "./ui";

/** Shared modal chrome: centred sheet, Escape to close, scroll-safe body. */
function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy-950/40 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={ref}
        className={`w-full rounded-2xl bg-sand-50 shadow-lift ${wide ? "max-w-2xl" : "max-w-xl"}`}
      >
        <header className="flex items-center justify-between border-b border-navy-900/10 px-5 py-3.5">
          <h2 className="text-base font-bold text-navy-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="rounded-lg p-1.5 text-navy-600 transition hover:bg-sand-200 hover:text-navy-900"
          >
            <IconX className="h-5 w-5" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function NewLeadDialog({
  onClose,
  onDone,
  onError,
}: {
  onClose: () => void;
  onDone: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createLeadAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      onDone(state.message ?? "הליד נוסף");
      onClose();
    } else if (state && !state.ok) {
      onError(state.error);
    }
  }, [state, onClose, onDone, onError]);

  return (
    <Modal title="ליד חדש" onClose={onClose}>
      <form action={action} className="space-y-4">
        <LeadFields />
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="crm-btn-primary flex-1">
            {pending ? "מוסיף…" : "הוספה ללוח"}
          </button>
          <button type="button" onClick={onClose} className="crm-btn">
            ביטול
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ImportDialog({
  onClose,
  onDone,
  onError,
}: {
  onClose: () => void;
  onDone: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    importCsvAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      onDone(state.message ?? "הייבוא הושלם");
      onClose();
    } else if (state && !state.ok) {
      onError(state.error);
    }
  }, [state, onClose, onDone, onError]);

  return (
    <Modal title="ייבוא לידים מקובץ CSV" onClose={onClose} wide>
      <form action={action} className="space-y-4">
        <div className="rounded-xl border border-navy-900/10 bg-white p-4 text-sm leading-6 text-navy-700">
          <p className="font-bold text-navy-800">מה הקובץ צריך להכיל</p>
          <p className="mt-1">
            שורת כותרות, ובה לפחות עמודת <strong>שם</strong> ועמודת <strong>טלפון</strong> (או{" "}
            <strong>אימייל</strong>). שאר העמודות אופציונליות:
          </p>
          <p className="mt-2 text-xs text-navy-600">
            שירות · שלב · עדיפות · מקור · אחראי · שווי משוער · מעקב הבא · קשר אחרון · הערות ·
            סיבת סגירה
          </p>
          <p className="mt-2 text-xs text-navy-600">
            תאריכים ב-<span dir="ltr">YYYY-MM-DD</span> או <span dir="ltr">dd/mm/yyyy</span>. שורה
            בלי שם, או בלי טלפון ובלי אימייל, תדולג ותדווח. עד 1000 שורות ו-2MB בכל ייבוא.
          </p>
          <p className="mt-2 text-xs text-navy-600">
            הדרך הקלה: ייצאו קודם CSV מהלוח, מלאו אותו באקסל וייבאו חזרה — הכותרות תואמות.
          </p>
        </div>

        <div>
          <label htmlFor="import-file" className="crm-label">
            קובץ CSV
          </label>
          <input
            id="import-file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="crm-field file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="crm-btn-primary flex-1">
            <IconUpload />
            {pending ? "מייבא…" : "ייבוא"}
          </button>
          <button type="button" onClick={onClose} className="crm-btn">
            ביטול
          </button>
        </div>
      </form>
    </Modal>
  );
}
