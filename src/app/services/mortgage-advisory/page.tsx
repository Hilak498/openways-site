import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "ייעוץ משכנתאות | Open Ways",
  description: "ייעוץ מקצועי ליועצי משכנתאות עם גישה שוקית, תהליכית ופרקטית.",
};

export default function MortgageAdvisoryPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <SiteLogo />
          <Link href="/" className="text-sm font-semibold text-slate-700 transition hover:text-slate-950">בחזרה לעמוד הבית</Link>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">ייעוץ משכנתאות</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-950">תמיכה מקצועית ליועצי משכנתאות המבקשים להעמיק את הידע וההכוונה</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">הדרך להצלחה בשוק המשכנתאות דורשת הבנה עמוקה, גישה שיטתית ותשומת לב לפרטים. אנו מסייעים ליועצים לבנות בסיס מקצועי חזק יותר, להרחיב את ההבנה ולהתאים את הגישה למצב הספציפי.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">הכוונה מקצועית</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">הבנה של השוק</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">שיפור תהליכים</span>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">מה זה כולל</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li>• הבנה מעמיקה של ההקשר והדרישות בשטח</li>
              <li>• עזרה בהתמודדות עם דילמות יישומיות בשוק</li>
              <li>• תמיכה בהתאמת הייעוץ לצרכים המשתנים</li>
              <li>• שיפור היכולת לעבוד בצורה מסודרת, חכמה ויעילה</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">צרו קשר</p>
            <h2 className="mt-3 text-3xl font-semibold">אפשר להתחיל משיחה מקצועית ולבחון יחד את הדרך הנכונה</h2>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
