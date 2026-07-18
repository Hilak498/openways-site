import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";

export const metadata: Metadata = {
  title: "מדיניות עוגיות",
  description: "מדיניות העוגיות של אתר Open Ways וניהול העדפות מעקב.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="מדיניות עוגיות" updated="ינואר 2026">
      <p>
        עוגיות (Cookies) הן קבצי טקסט קטנים הנשמרים בדפדפן. מדיניות זו מסבירה
        באילו עוגיות אנחנו משתמשים ואיך שולטים בהן. עוגיות שאינן הכרחיות
        מופעלות אך ורק לאחר הסכמה מפורשת שלכם בבאנר העוגיות.
      </p>

      <h2>סוגי העוגיות באתר</h2>
      <h3>עוגיות הכרחיות</h3>
      <ul>
        <li>
          <strong>ow-cookie-consent</strong> - שמירת בחירת ההסכמה שלכם (12 חודשים).
        </li>
        <li>
          <strong>ow-a11y-preferences</strong> - שמירת הגדרות הנגישות שבחרתם.
        </li>
      </ul>
      <h3>עוגיות סטטיסטיקה (בהסכמה בלבד)</h3>
      <ul>
        <li>
          <strong>Google Analytics (‎_ga, _gid)</strong> - מדידת שימוש אנונימית
          לשיפור האתר. נטענות רק אם אישרתם עוגיות סטטיסטיקה.
        </li>
      </ul>
      <h3>עוגיות שיווק (בהסכמה בלבד)</h3>
      <p>
        ככל שיופעלו כלי פרסום (למשל Meta Pixel), הם ייטענו רק לאחר הסכמה מפורשת
        לעוגיות שיווק.
      </p>

      <h2>ניהול ההעדפות</h2>
      <p>ניתן לשנות את הבחירה בכל עת:</p>
      <CookiePreferencesButton />
      <p className="mt-4">
        בנוסף, ניתן למחוק או לחסום עוגיות דרך הגדרות הדפדפן. חסימת עוגיות
        הכרחיות עלולה לפגוע בתפקוד האתר.
      </p>

      <h2>מידע נוסף</h2>
      <p>
        פרטים על עיבוד מידע אישי מופיעים ב
        <Link href="/privacy-policy">מדיניות הפרטיות</Link>.
      </p>
    </LegalPage>
  );
}
