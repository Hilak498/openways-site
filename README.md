# Open Ways — אתר תדמית

אתר עסקי בעברית (RTL) לחברת ייעוץ המציעה שלושה שירותים: **ייעוץ עסקי**,
**גיוס אשראי עסקי** ו**ייעוץ משכנתאות**.

- Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
- עיצוב לפי סקיצת Stitch: הירו עם תמונת רקע וכרטיס תמונה מוטה, כפתורי גרדיאנט זהב
- Framer Motion — חשיפות גלילה עדינות
- פונט Heebo (Google Fonts, self-hosted דרך `next/font`)
- נגישות לפי ת"י 5568 / WCAG 2.0 AA, כולל רכיב נגישות והצהרת נגישות
- פרטיות לפי חוק הגנת הפרטיות + תיקון 13, באנר עוגיות עם מנהל העדפות
- אבטחה: Zod, rate limiting, הגנת CSRF, honeypot, reCAPTCHA (אופציונלי), כותרות CSP/HSTS

## התקנה והרצה

```bash
npm install
cp .env.example .env.local   # ולמלא ערכים לפי הצורך
npm run dev                  # http://localhost:3000
```

בנייה לפרודקשן:

```bash
npm run build
npm run start
```

## סרטון הלוגו — התקנה והמרות ffmpeg

קובץ המקור (`.mov`) אינו נשמר ברפוזיטורי. יש להמיר אותו ולהניח את התוצרים
ב־`public/video/`:

| קובץ | תפקיד |
| --- | --- |
| `public/video/logo-animation.webm` | VP9 עם שקיפות — Chrome / Firefox / Edge |
| `public/video/logo-animation.mov` | HEVC עם שקיפות — Safari |
| `public/video/logo-poster.png` | תמונת פוסטר (פריים ראשון או אחרון) |

### אם ל־.mov יש ערוץ אלפא (שקיפות)

```bash
# 1) WebM (VP9 + alpha) — לכרום/פיירפוקס/אדג'
ffmpeg -i logo-source.mov \
  -c:v libvpx-vp9 -pix_fmt yuva420p \
  -b:v 0 -crf 34 -row-mt 1 -an \
  -vf "scale=800:-2:flags=lanczos" \
  public/video/logo-animation.webm

# 2) HEVC + alpha — לספארי (דורש macOS, הקודק videotoolbox)
ffmpeg -i logo-source.mov \
  -c:v hevc_videotoolbox -allow_sw 1 -alpha_quality 0.75 \
  -vtag hvc1 -b:v 1200k -an \
  -vf "scale=800:-2:flags=lanczos" \
  public/video/logo-animation.mov
```

> ההמרה ל־HEVC עם אלפא נתמכת רק ב־ffmpeg על macOS (VideoToolbox).
> אין Mac זמין? אפשר להשתמש בשירות כמו rotato.app/tools/converter או Shutter Encoder.

### אם אין ערוץ אלפא

```bash
# MP4 (H.264) — קובץ אחד לכל הדפדפנים; הרכיב יציג אותו על רקע ההירו הכהה
ffmpeg -i logo-source.mov \
  -c:v libx264 -crf 23 -preset slow -movflags +faststart -an \
  -vf "scale=800:-2:flags=lanczos" \
  public/video/logo-animation.mp4
```

במקרה כזה עדכנו את מקורות הווידאו ב־`src/components/logo-video.tsx`
(`<source src="/video/logo-animation.mp4" type="video/mp4" />`) — עדיף גם
לצבוע את רקע הסרטון בצבע ההירו (`#0b1220`) בתוכנת העריכה כדי שההרכבה תיראה
חלקה.

### תמונת פוסטר

```bash
# פריים ראשון
ffmpeg -i logo-source.mov -frames:v 1 public/video/logo-poster.png
# או הפריים האחרון (עדיף אם האנימציה "נעצרת" על הלוגו המלא)
ffmpeg -sseof -0.1 -i logo-source.mov -frames:v 1 -update 1 public/video/logo-poster.png
```

### התנהגות הרכיב

- הווידאו נטען בעצלתיים (IntersectionObserver + `preload="none"`) ולא חוסם LCP.
- תחת `prefers-reduced-motion` הווידאו לא נטען כלל ומוצג לוגו סטטי.
- אם הקבצים חסרים או שהקודק לא נתמך — הלוגו הסטטי נשאר. אין UI שבור.
- מטרת גודל: WebM עד ~1.5MB, HEVC עד ~2MB (משך 3–6 שניות, 800px רוחב).

## מבנה הפרויקט

```
src/
  app/
    layout.tsx                  # שלד, פונט Heebo, מטא-דאטה, ניווט/פוטר/עוגיות/נגישות
    page.tsx                    # עמוד הבית
    services/[slug]/page.tsx    # שלושת עמודי השירות (business-advisory / business-credit / mortgage-advisory)
    privacy-policy/ terms/ cookies/ accessibility-statement/
    api/contact/route.ts        # קליטת טופס — ולידציה, rate limit, CSRF, honeypot
    sitemap.ts robots.ts not-found.tsx
  components/                   # רכיבים (ניווט, הירו, וידאו לוגו, טופס, עוגיות, נגישות...)
  lib/
    site.ts                     # ⚙️ כל התוכן והפרטים העסקיים — נקודת עריכה מרכזית
    contact-schema.ts schema.ts consent.ts rate-limit.ts
public/
  logo.svg Logo.eps             # נכסי לוגו
  video/                        # ← קובצי סרטון הלוגו (ראו למעלה)
```

## רשימת תכנים להשלמה לפני עלייה לאוויר

הכול מרוכז כמעט לגמרי ב־`src/lib/site.ts`:

1. **פרטי העסק** — שם משפטי, טלפון, אימייל, כתובת (`site` ב־`src/lib/site.ts`).
2. **ממונה הגנת הפרטיות** — שם ואימייל (`site.privacyOfficer`).
3. **נתוני הירו** — שנות ניסיון, מספר לקוחות, היקף אשראי (`stats` ב־`src/components/hero.tsx`).
4. **המלצות לקוחות** — ציטוטים אמיתיים + אישור פרסום בכתב (`testimonials` ב־`src/lib/site.ts`).
5. **תוכן שלושת השירותים** — לעבור על הטקסטים, השאלות הנפוצות והתהליכים (`services` ב־`src/lib/site.ts`).
6. **עמודים משפטיים** — לעיון עו"ד: מדיניות פרטיות, תנאי שימוש, עוגיות. לעדכן את שם רכז/ת הנגישות בהצהרת הנגישות.
7. **סרטון הלוגו** — קובצי הווידאו והפוסטר (ראו סעיף ההמרות).
8. **תמונת OG** — להניח `public/og.png` בגודל 1200×630 (כרגע מפנה לקובץ שטרם קיים).
9. **דומיין** — לעדכן את `site.url` אם הדומיין שונה מ־`openways.co.il`.
10. **משלוח הטופס** — לחבר ספק אימייל/CRM ב־`src/app/api/contact/route.ts` (יש דוגמה ל־Resend), ולהגדיר מפתחות ב־`.env.local`.
11. **Analytics / reCAPTCHA** — למלא מפתחות ב־`.env.local` (אופציונלי; האתר עובד גם בלעדיהם).
12. **מנגנון הסרה מדיוור** — אם מפעילים דיוור שיווקי, לוודא שלכל הודעה יש קישור הסרה (דרישת סעיף 30א לחוק התקשורת).

## אבטחה — מה מיושם

- **ולידציה בצד שרת** — Zod (`src/lib/contact-schema.ts`) + סניטיזציה של קלט.
- **CSRF** — אכיפת Same-Origin על `POST /api/contact` + `form-action 'self'` ב־CSP.
- **Rate limiting** — 5 פניות / 10 דקות לכל IP (in-memory; לסקייל — Upstash Redis).
- **בוטים** — honeypot + מלכודת זמן מילוי + reCAPTCHA v3 אופציונלי (מופעל אוטומטית כשמוגדר `RECAPTCHA_SECRET_KEY`).
- **כותרות אבטחה** (`next.config.ts`) — CSP (מתיר גם את וידאו הלוגו), HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **סודות** — בצד שרת בלבד, דרך `.env` (ראו `.env.example`). אין מפתחות בצד לקוח.
- הערה: ל־CSP מבוסס nonce (ללא `'unsafe-inline'`) יש להוסיף `proxy.ts` לפי
  מדריך ה־CSP של Next.js.

## פריסה (Vercel)

הפרויקט מקושר ל־Vercel (`openways-site`). כל דחיפה ל־main יוצרת פריסה.
יש להגדיר את משתני הסביבה מ־`.env.example` בהגדרות הפרויקט ב־Vercel.
