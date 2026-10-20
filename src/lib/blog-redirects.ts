/**
 * כתובות מאמרים שהשתנו (מעברית לאנגלית, 20.10.26). ההפניות נבנות
 * ב-next.config.ts כ-301, לכל כתובת ישנה בשתי צורות: עם /blog ובלי (כמו
 * שהקישורים של Soro פורסמו בעבר), וגם כ-UTF-8 גולמי וגם מקודדת (percent-
 * encoded), כי דפדפנים ושרתים שולחים את הנתיב בשתי הצורות.
 */
export const renamedBlogSlugs: Record<string, string> = {
  "איך-לגייס-אשראי-לעסק": "raising-business-credit",
  "ניהול-משא-ומתן-מול-בנקים": "bank-negotiation-business-credit",
  "איך-לשפר-תזרים-מזומנים-בעסק": "improve-business-cash-flow",
};

export function blogSlugRedirects() {
  return Object.entries(renamedBlogSlugs).flatMap(([from, to]) => {
    const forms = [...new Set([from, encodeURIComponent(from)])];
    return forms.flatMap((slug) =>
      [`/blog/${slug}`, `/${slug}`].map((source) => ({
        source,
        destination: `/blog/${to}`,
        statusCode: 301 as const,
      })),
    );
  });
}
