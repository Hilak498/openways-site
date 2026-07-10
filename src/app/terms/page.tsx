import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">תנאים והגבלות</h1>
        <p className="mt-4 text-sm leading-8 text-slate-600">
          שימוש באתר כפוף לתנאים המפורטים להלן. יש להימנע מהעברת מידע מטעה, שימוש לרעה באתר, או הפרה של זכויות של צדדים שלישיים. כל פנייה תיבחן בהתאם לנסיבות ולמידע המתקבל.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          חזרה לעמוד הבית
        </Link>
      </div>
    </main>
  );
}
