import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "ייעוץ עסקי | Open Ways",
  description: "ייעוץ עסקי מקצועי, אסטרטגיה, תכנון צמיחה ותהליכי עבודה מותאמים לעסקים.",
};

export default function BusinessAdvisoryPage() {
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">ייעוץ עסקי</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-950">תכנון אסטרטגי, פתרונות מעשיים ומסלול צמיחה ברור</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">אנו מסייעים לעסקים להבין את המצב הנוכחי, לזהות את הפערים ולבנות מסלול פעולה עם תובנות מעשיות, בדיקות רלוונטיות ותיאום ציפיות ברור.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">ניתוח מצב עסקי</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">תכנון צמיחה</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">שיפור תהליכים</span>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">מה כולל השירות</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li>• הבנה מעמיקה של המודל העסקי והאתגרים הקיימים</li>
              <li>• תכנון אסטרטגי מותאם לצרכים ולסיטואציה</li>
              <li>• התאמה של תהליכים, תפקידים ופעולות לרוח הצמיחה</li>
              <li>• גישה מקצועית שמחברת בין שיקול עסקי לבין מידת היישום</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">למי זה מתאים</h3>
            <p className="mt-4 text-sm leading-8 text-slate-600">לבעלי עסקים, מנהלים, צוותי הנהלה ויזמים שמעוניינים לשפר את התמונה הכוללת ולבנות מסלול פעולה יציב וממוקד.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">מה תקבלו</h3>
            <p className="mt-4 text-sm leading-8 text-slate-600">הכוונה ברורה, תהליך מסודר, מבט כולל על המצב והצעת צעדים מעשיים שמובילים לקראת מימוש המטרות.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">צרו קשר</p>
            <h2 className="mt-3 text-3xl font-semibold">נשמח להכיר את המצב שלכם ולהציע מסלול עבודה מתאים</h2>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
