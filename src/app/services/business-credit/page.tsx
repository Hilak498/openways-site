import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "גיוס אשראי עסקי | Open Ways",
  description: "ייעוץ לגיוס אשראי עסקי עם גישה ממוקדת, מקצועית ופרקטית.",
};

export default function BusinessCreditPage() {
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">גיוס אשראי עסקי</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-950">הכוונה למתן מענה פיננסי מותאם, ממוקד ונכון יותר</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">גיוס אשראי עסקי דורש הבנה של הצרכים הפיננסיים, ההקשר העסקי והיכולת להציג את המצב בצורה שתואמת את הציפיות של הגורמים המממנים. אנו מסייעים להגיע למענה מיטבי עם ראייה רחבה, שקופה ופרקטית.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">זיהוי צרכים פיננסיים</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">הצעת מסלולי מימון</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">תיאום והכוונה</span>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">מה זה נותן ללקוח</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li>• הבנה טובה יותר של הצרכים וההזדמנויות</li>
              <li>• מבט כולל על אפשרויות המימון</li>
              <li>• תהליך ברור שמפחית בלבול ומסייע בהחלטה טובה יותר</li>
              <li>• תמיכה מקצועית בכל שלב</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">צרו קשר</p>
            <h2 className="mt-3 text-3xl font-semibold">נשמח להוביל אתכם לתהליך עם ראייה מקצועית ויעילה</h2>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
