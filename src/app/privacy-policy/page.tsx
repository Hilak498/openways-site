import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">מדיניות פרטיות</h1>
        <p className="mt-4 text-sm leading-8 text-slate-600">
          אנו אוספים מידע בסיסי לצורך תקשורת, ניהול פניות ויצירת חוויית שימוש מיטבית באתר. המידע יכול לכלול שם, כתובת אימייל, פרטי יצירת קשר ומידע שנמסר במסגרת פנייה ישירה.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-slate-950">אופן השימוש במידע</h2>
        <p className="mt-3 text-sm leading-8 text-slate-600">
          המידע משמש לצורך מענה לפניות, ניהול קשרים, שיפור השירותים ואבטחת האתר. לא נעביר מידע לצדדים שלישיים, אלא אם כן נדרש על פי דין או לצורך מתן שירותים תומכים.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-slate-950">זכויות המשתמש</h2>
        <p className="mt-3 text-sm leading-8 text-slate-600">
          למשתמשים ניתנת האפשרות לבקש לעיין, לתקן או למחוק את המידע האישי שלהם, וכן להעלות בקשה בנוגע לשימוש במידע שנאסף.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          חזרה לעמוד הבית
        </Link>
      </div>
    </main>
  );
}
