/**
 * נתוני מס לשנת המס 2026 - מקור רשמי.
 *
 * מס הכנסה: "לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה לחודש ינואר 2026
 * ואילך", רשות המסים בישראל, מעודכן לאפריל 2026 (אחרי חוק ההתייעלות
 * הכלכלית 2026 שריווח את מדרגות המס ב-31.3.2026).
 * https://www.gov.il/he/pages/income-tax-monthly-deductions-booklet
 *
 * ⚠️ ביטוח לאומי ומס בריאות אינם מופיעים בחוברת של רשות המסים - הם באחריות
 * המוסד לביטוח לאומי. הערכים כאן טרם אומתו מול חוזר ביטוח לאומי 2026,
 * ולכן `nationalInsurance.verified` עדיין false והמחשבון מציג אזהרה.
 * לאימות: https://www.btl.gov.il/Insurance/Rates/Pages/default.aspx
 *
 * בינואר של כל שנה: לעדכן את הקובץ הזה בלבד - שאר הקוד נגזר ממנו.
 */

export const TAX_YEAR = 2026;

export const TAX_SOURCE = {
  incomeTax: {
    title: "לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה - ינואר 2026",
    publisher: "רשות המסים בישראל",
    updated: "אפריל 2026",
    url: "https://www.gov.il/he/pages/income-tax-monthly-deductions-booklet",
    verified: true,
  },
  nationalInsurance: {
    title: "שיעורי דמי ביטוח לאומי ודמי ביטוח בריאות",
    publisher: "המוסד לביטוח לאומי",
    updated: "טרם אומת",
    url: "https://www.btl.gov.il/Insurance/Rates/Pages/default.aspx",
    verified: false,
  },
} as const;

/**
 * מדרגות מס חודשיות על הכנסה מיגיעה אישית, 2026.
 * פרק ב' בלוח העזר. `upTo` הוא הגבול העליון של המדרגה (null = ומעלה).
 */
export const MONTHLY_BRACKETS: { upTo: number | null; rate: number }[] = [
  { upTo: 7_010, rate: 0.1 },
  { upTo: 10_060, rate: 0.14 },
  { upTo: 19_000, rate: 0.2 },
  { upTo: 25_100, rate: 0.31 },
  { upTo: 46_690, rate: 0.35 },
  { upTo: null, rate: 0.47 },
];

/** מדרגות שנתיות - אותו סולם, לחישוב שנתי (פרק ב'). */
export const ANNUAL_BRACKETS: { upTo: number | null; rate: number }[] = [
  { upTo: 84_120, rate: 0.1 },
  { upTo: 120_720, rate: 0.14 },
  { upTo: 228_000, rate: 0.2 },
  { upTo: 301_200, rate: 0.31 },
  { upTo: 560_280, rate: 0.35 },
  { upTo: null, rate: 0.47 },
];

/** נקודת זיכוי - סעיף 33א, פרק ג' בלוח העזר. */
export const CREDIT_POINT_MONTHLY = 242;

/** מס נוסף (מס יסף) - סעיף 121ב: 3% מעל התקרה. */
export const SURTAX = {
  rate: 0.03,
  monthlyThreshold: 60_130,
  annualThreshold: 721_560,
};

/** תקרת הכנסה מזכה להפקדות לקופת גמל - סעיף 47(א1)(1), פרק ג'. */
export const PENSION_ELIGIBLE_CEILING_MONTHLY = 9_700;

/** שיעור הזיכוי בגין הפקדות עובד לתגמולים - סעיף 45א. */
export const PENSION_CREDIT_RATE = 0.35;

/** שכר ממוצע במשק - פרק ג'. */
export const AVERAGE_WAGE = 13_769;

/**
 * ביטוח לאומי ומס בריאות - שיעורי עובד שכיר ועצמאי.
 * ⚠️ טרם אומת מול המוסד לביטוח לאומי. ראו הערה בראש הקובץ.
 */
export const nationalInsurance = {
  verified: false,
  /** השכר שעד אליו חל השיעור המופחת (60% מהשכר הממוצע). */
  reducedRateCeiling: 7_703,
  /** התקרה שמעליה לא משלמים דמי ביטוח כלל. */
  maxIncome: 51_910,
  employee: {
    reduced: { insurance: 0.004, health: 0.031 },
    full: { insurance: 0.07, health: 0.05 },
  },
  selfEmployed: {
    reduced: { insurance: 0.0287, health: 0.031 },
    full: { insurance: 0.1283, health: 0.05 },
  },
} as const;
