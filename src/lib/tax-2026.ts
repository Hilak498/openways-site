/**
 * נתוני מס לשנת המס 2026 - מקור רשמי.
 *
 * מס הכנסה: "לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה לחודש ינואר 2026
 * ואילך", רשות המסים בישראל, מעודכן לאפריל 2026 (אחרי חוק ההתייעלות
 * הכלכלית 2026 שריווח את מדרגות המס ב-31.3.2026).
 * https://www.gov.il/he/pages/income-tax-monthly-deductions-booklet
 *
 * ביטוח לאומי ובריאות: אינם בחוברת של רשות המסים - הם באחריות המוסד לביטוח
 * לאומי. השיעורים כאן לקוחים מדפי השיעורים הרשמיים של הביטוח הלאומי
 * (לעובדים שכירים ולעובד עצמאי), עם מדרגת הגבייה המופחתת 7,703 ש"ח וההכנסה
 * המרבית החייבת 51,910 ש"ח - שתיהן החל ב-01.01.2026.
 * https://www.btl.gov.il/Insurance/Rates/Pages/לעובדים%20שכירים.aspx
 * https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx
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
    updated: "מדרגות 2026",
    url: "https://www.btl.gov.il/Insurance/Rates/Pages/default.aspx",
    verified: true,
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
 * ביטוח לאומי ומס בריאות.
 *
 * שכיר (מגיל 18 עד גיל פרישה): מופחת - ביטוח לאומי 1.04% ובריאות 3.23%
 * (סה"כ 4.27%); מלא - ביטוח לאומי 7% ובריאות 5.17% (סה"כ 12.17%).
 * עצמאי (אותם גילאים): מופחת - 4.47% ו-3.23% (סה"כ 7.7%);
 * מלא - 12.83% ו-5.17% (סה"כ 18%).
 *
 * הביטוח הלאומי מפרסם שיעורים נפרדים לקבוצות נוספות (מקבלי פנסיה מוקדמת,
 * עובדי משק בית, מי שאינם עובדים ובעלי הכנסה שלא מעבודה, מתחת לגיל 18 ומעל
 * גיל פרישה). המחשבון מכסה שכיר ועצמאי בגילאי 18 עד גיל פרישה בלבד.
 *
 * החישוב לעצמאי אינו כולל את הניכוי בשל דמי ביטוח לאומי מההכנסה החייבת -
 * ראו selfEmployedNiDeduction.
 */
export const nationalInsurance = {
  verified: true,
  /** מדרגת הגבייה המופחתת, החל ב-01.01.2026. */
  reducedRateCeiling: 7_703,
  /** ההכנסה המרבית החייבת בדמי ביטוח, החל ב-01.01.2026. */
  maxIncome: 51_910,
  employee: {
    reduced: { insurance: 0.0104, health: 0.0323 },
    full: { insurance: 0.07, health: 0.0517 },
  },
  selfEmployed: {
    reduced: { insurance: 0.0447, health: 0.0323 },
    full: { insurance: 0.1283, health: 0.0517 },
  },
} as const;

/**
 * לעצמאי מותר ניכוי מההכנסה החייבת בגובה 52% מדמי הביטוח הלאומי ששולמו
 * (לא כולל דמי ביטוח בריאות). זה הנתון היחיד במחשבון שלא נלקח מדף רשמי
 * שנמסר לנו, ולכן הוא כבוי עד לאישור רואה חשבון. להפעלה: applied = true.
 */
export const selfEmployedNiDeduction = {
  applied: false,
  rate: 0.52,
} as const;
