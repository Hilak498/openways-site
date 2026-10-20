import Link from "next/link";

/**
 * What /crm shows before it has a database: the two things that are missing
 * and where to put them. Better than an empty board that looks broken.
 */

export function CrmSetup({
  reason,
  missing = [],
  detail,
}: {
  reason: "env" | "schema";
  missing?: string[];
  detail?: string;
}) {
  return (
    <div id="crm-root" className="flex min-h-svh items-start justify-center bg-sand-100 p-5 sm:p-10">
      <div className="card w-full max-w-2xl p-6">
        <h1 className="text-xl font-bold text-navy-900">
          {reason === "env" ? "ה-CRM לא מחובר למסד הנתונים" : "הטבלאות עוד לא נוצרו"}
        </h1>

        {reason === "env" ? (
          <>
            <p className="mt-2 text-sm leading-7 text-navy-700">
              חסרים משתני סביבה בשרת. יש להוסיף אותם בהגדרות הפרויקט ב-Vercel (Environment
              Variables), או ב-<code dir="ltr">.env.local</code> בפיתוח, ואז לפרוס מחדש.
            </p>
            <ul dir="ltr" className="mt-4 space-y-1.5 rounded-xl bg-navy-900 p-4 font-mono text-xs text-gold-300">
              {missing.map((name) => (
                <li key={name}>{name}=…</li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-6 text-navy-600">
              <strong>SUPABASE_SECRET_KEY</strong> הוא המפתח הסודי (service role) מתוך
              Project Settings → API Keys באותו פרויקט Supabase שאליו טופס יצירת הקשר כבר כותב.
              הוא עובד רק בצד שרת ואסור לו להגיע לדפדפן — לכן בלי תחילית{" "}
              <code dir="ltr">NEXT_PUBLIC_</code>.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-7 text-navy-700">
              החיבור ל-Supabase עובד, אבל הטבלאות שה-CRM צריך לא קיימות (או שחסרות בהן עמודות).
              יש להריץ את המיגרציה שבריפו — פעם אחת, והיא בטוחה גם בהרצה חוזרת:
            </p>
            <pre
              dir="ltr"
              className="mt-4 overflow-x-auto rounded-xl bg-navy-900 p-4 text-left font-mono text-xs leading-6 text-gold-300"
            >
              supabase/migrations/20261020120000_crm.sql
            </pre>
            <p className="mt-3 text-sm leading-7 text-navy-700">
              הדרך הקצרה: Supabase Dashboard → SQL Editor → להדביק את תוכן הקובץ → Run.
            </p>
            {detail ? (
              <p className="mt-3 rounded-lg bg-sand-200 p-3 font-mono text-[11px] text-navy-700" dir="ltr">
                {detail}
              </p>
            ) : null}
          </>
        )}

        <p className="mt-6 text-sm">
          <Link href="/" className="font-semibold text-gold-700 underline underline-offset-4">
            חזרה לאתר
          </Link>
        </p>
      </div>
    </div>
  );
}
