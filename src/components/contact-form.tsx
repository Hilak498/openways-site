"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = encodeURIComponent(`פנייה חדשה מאתר Open Ways`);
    const body = encodeURIComponent(
      `שם: ${data.get("name") || ""}\nEmail: ${data.get("email") || ""}\nטלפון: ${data.get("phone") || ""}\nהודעה: ${data.get("message") || ""}`,
    );
    window.location.href = `mailto:hello@openways.co.il?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 card p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          <span className="mb-2 block font-medium text-slate-900">שם</span>
          <input name="name" required placeholder="שם מלא" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-200" />
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-2 block font-medium text-slate-900">אימייל</span>
          <input type="email" name="email" required placeholder="email@domain.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-200" />
        </label>
      </div>
      <label className="block text-sm text-slate-700">
        <span className="mb-2 block font-medium text-slate-900">טלפון</span>
        <input name="phone" placeholder="050-1234567" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-200" />
      </label>
      <label className="block text-sm text-slate-700">
        <span className="mb-2 block font-medium text-slate-900">מה תרצו לבדוק?</span>
        <textarea name="message" rows={5} required placeholder="פרטו בקצרה את הצורך או השאלה" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-200" />
      </label>
      <div className="flex items-center justify-between gap-4">
        <button type="submit" className="btn-primary">שלח פנייה</button>
        <p className="text-xs text-slate-500">נשמור על סודיות המידע ואנו לא מעבירים אותו לגורם חיצוני.</p>
      </div>
      {submitted ? <p className="text-sm text-emerald-700">תודה! נפתח את תיבת המייל שלכם ונחזור אליכם בהקדם.</p> : null}
    </form>
  );
}
