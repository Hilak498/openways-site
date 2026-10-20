import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { gateConfig, isSignedIn } from "@/lib/crm/auth";
import { LoginForm } from "@/components/crm/login-form";

/** The gate. Rendered on the navy surface, where the gold logo passes AA. */
export default async function CrmLoginPage() {
  if (await isSignedIn()) redirect("/crm");

  const gate = gateConfig();

  return (
    <div id="crm-root" className="hero-navy on-dark flex min-h-svh items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo variant="light-text" />
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-xl">
          <h1 className="text-xl font-bold text-white">כניסה ל-CRM</h1>
          <p className="mt-1 mb-5 text-sm text-white/70">
            הלוח מכיל פרטי לקוחות. הכניסה למשתמשים מורשים בלבד.
          </p>

          {gate.ok ? (
            <LoginForm />
          ) : (
            <div className="rounded-lg border border-gold-300/40 bg-gold-300/10 p-4 text-sm text-white">
              <p className="font-bold text-gold-300">המערכת עוד לא הוגדרה</p>
              <p className="mt-2 text-white/80">
                חסרים משתני סביבה בשרת. יש להגדיר אותם ב-Vercel (או ב-
                <code dir="ltr">.env.local</code> בפיתוח) ולפרוס מחדש:
              </p>
              <ul dir="ltr" className="mt-3 space-y-1 text-left font-mono text-xs text-gold-300">
                {gate.missing.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-gold-300 underline underline-offset-4 hover:text-white">
            חזרה לאתר
          </Link>
        </p>
      </div>
    </div>
  );
}
