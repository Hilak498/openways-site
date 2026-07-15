"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { services } from "@/lib/site";
import { contactSchema } from "@/lib/contact-schema";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success" }
  | { state: "error"; message: string };

const inputClass =
  "w-full rounded-xl border border-navy-800/15 bg-white px-4 py-3 text-navy-800 placeholder:text-navy-600/50 transition focus:border-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Anti-bot time trap: bots submit instantly, humans don't
  const renderedAt = useRef(0);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      service: (data.get("service") as string) || undefined,
      message: String(data.get("message") ?? ""),
      marketingConsent: data.get("marketingConsent") === "on",
      company: String(data.get("company") ?? ""),
      renderedAt: renderedAt.current,
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setStatus({
        state: "error",
        message: "נא לתקן את השדות המסומנים ולנסות שוב.",
      });
      return;
    }

    setFieldErrors({});
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "אירעה שגיאה בשליחה. נסו שוב מאוחר יותר.");
      }
      form.reset();
      setStatus({ state: "success" });
    } catch (err) {
      setStatus({
        state: "error",
        message:
          err instanceof Error ? err.message : "אירעה שגיאה בשליחה. נסו שוב מאוחר יותר.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold">
            שם מלא <span aria-hidden="true" className="text-gold-700">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            className={inputClass}
            placeholder="ישראל ישראלי"
          />
          {fieldErrors.name ? (
            <p id="contact-name-error" className="mt-1 text-sm font-medium text-red-700">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-semibold">
            טלפון <span aria-hidden="true" className="text-gold-700">*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "contact-phone-error" : undefined}
            className={`${inputClass} text-left`}
            placeholder="050-1234567"
          />
          {fieldErrors.phone ? (
            <p id="contact-phone-error" className="mt-1 text-sm font-medium text-red-700">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold">
          אימייל <span aria-hidden="true" className="text-gold-700">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
          className={`${inputClass} text-left`}
          placeholder="name@example.com"
        />
        {fieldErrors.email ? (
          <p id="contact-email-error" className="mt-1 text-sm font-medium text-red-700">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-service" className="mb-1.5 block text-sm font-semibold">
          תחום הפנייה
        </label>
        <select id="contact-service" name="service" className={inputClass} defaultValue="">
          <option value="">בחרו תחום (לא חובה)</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
          <option value="other">אחר</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold">
          במה נוכל לעזור? <span aria-hidden="true" className="text-gold-700">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          className={inputClass}
          placeholder="ספרו לנו בקצרה על העסק או על הצורך שלכם"
        />
        {fieldErrors.message ? (
          <p id="contact-message-error" className="mt-1 text-sm font-medium text-red-700">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot — visually hidden, ignored by humans, filled by bots */}
      <div className="absolute -z-10 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-company">חברה (להשאיר ריק)</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Explicit marketing opt-in — unchecked by default (Communications Law §30A) */}
      <div className="flex items-start gap-3">
        <input
          id="contact-marketing"
          name="marketingConsent"
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-gold-600"
        />
        <label htmlFor="contact-marketing" className="text-sm leading-6 text-navy-700">
          אני מאשר/ת קבלת עדכונים ותוכן שיווקי מ־Open Ways באימייל וב־SMS. ניתן
          להסיר את ההסכמה בכל עת באמצעות קישור ההסרה שבכל הודעה או בפנייה אלינו.
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status.state === "sending"}
          className="btn-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.state === "sending" ? "שולח…" : "שליחת פנייה"}
        </button>
        <p className="text-xs leading-5 text-navy-600">
          שליחת הטופס כפופה ל
          <Link href="/privacy-policy" className="font-semibold text-gold-700 underline underline-offset-2">
            מדיניות הפרטיות
          </Link>{" "}
          שלנו. הפרטים ישמשו למענה לפנייתכם בלבד.
        </p>
      </div>

      <div aria-live="polite" role="status">
        {status.state === "success" ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            תודה על פנייתכם! נחזור אליכם בתוך יום עסקים אחד.
          </p>
        ) : null}
        {status.state === "error" ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
