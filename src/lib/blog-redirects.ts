/**
 * מיפוי כתובות מאמרים: slug שמגיע מ-Soro -> הכתובת באנגלית שבה המאמר
 * מתפרסם באתר. lib/blog.ts מחליף את ה-slug כבר בקריאת הפיד, כך שהכתובת
 * החדשה מופיעה בכל מקום (עמוד, canonical, og:url, sitemap, רשימת הבלוג
 * וה-schema). מכל slug ישן נבנית ב-next.config.ts הפניה קבועה (308), בשתי
 * צורות: עם /blog ובלי (כמו שהקישורים של Soro פורסמו), וגם כ-UTF-8 גולמי
 * וגם מקודדת (percent-encoded), כי דפדפנים ושרתים שולחים את הנתיב בשתיהן.
 *
 * מאמר חדש מ-Soro עם slug בעברית או בתעתיק עברי מייצר אזהרה בלוג הבנייה
 * ("[blog] slug not in English") - מוסיפים לו כאן שורה.
 */
export const slugOverrides: Record<string, string> = {
  "איך-לגייס-אשראי-לעסק": "raising-business-credit",
  "ניהול-משא-ומתן-מול-בנקים": "bank-negotiation-business-credit",
  "איך-לשפר-תזרים-מזומנים-בעסק": "improve-business-cash-flow",
  "eich-leshaper-revachiyut-baesek": "improve-business-profitability",
};

export function blogSlugRedirects() {
  return Object.entries(slugOverrides).flatMap(([from, to]) => {
    const forms = [...new Set([from, encodeURIComponent(from)])];
    return forms.flatMap((slug) =>
      [`/blog/${slug}`, `/${slug}`].map((source) => ({
        source,
        destination: `/blog/${to}`,
        permanent: true,
      })),
    );
  });
}

// מילים ותבניות נפוצות של עברית בתעתיק לטיני. היוריסטיקה בלבד: מטרתה
// להתריע, לא לחסום, ולכן התראת שווא היא רק שורה מיותרת בלוג.
const TRANSLITERATED_WORDS = new Set([
  "eich", "eych", "ech", "ich", "lama", "kama", "keitzad", "keytzad", "ma",
  "mah", "shel", "im", "al", "bli", "et", "ze", "zo", "lo", "ken", "yoter",
  "pachot", "esek", "baesek", "haesek", "asakim", "ashrai", "mashkanta",
  "tazrim", "revach", "revachim", "bankim",
]);
const TRANSLITERATION_PATTERN = /(iyut|iyot|tz|kh)/;

/** True when a feed slug is Hebrew, or Latin that reads like transliterated Hebrew. */
export function looksUntranslated(slug: string): boolean {
  if (/[^a-z0-9-]/.test(slug)) return true;
  return slug
    .split("-")
    .some((word) => TRANSLITERATED_WORDS.has(word) || TRANSLITERATION_PATTERN.test(word));
}
