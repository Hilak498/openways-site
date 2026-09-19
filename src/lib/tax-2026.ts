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

/**
 * מדרגות על הכנסה שאינה מיגיעה אישית (פרק ב' בלוח העזר) - למשל הכנסה
 * מהשכרה, מריבית או מדיבידנד. הסולם מתחיל ב-31% ולא ב-10%.
 * למי שמלאו לו 60 חלות מדרגות יגיעה אישית גם על הכנסה זו (סעיף 121(ב)).
 */
export const PASSIVE_MONTHLY_BRACKETS: { upTo: number | null; rate: number }[] = [
  { upTo: 25_100, rate: 0.31 },
  { upTo: 46_690, rate: 0.35 },
  { upTo: null, rate: 0.47 },
];

/** מדרגות שנתיות על הכנסה שאינה מיגיעה אישית. */
export const PASSIVE_ANNUAL_BRACKETS: { upTo: number | null; rate: number }[] = [
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
 * ביטוח לאומי ומס בריאות - שיעורים רשמיים של המוסד לביטוח לאומי,
 * החל ב-01.01.2026.
 *
 * מדרגת הגבייה המופחתת: 7,703 ש"ח. ההכנסה המרבית החייבת: 51,910 ש"ח.
 * השיעורים לכל סוג מבוטח מרוכזים ב-INSURED_TYPES, כל אחד עם הדף שממנו נלקח.
 */
export const nationalInsurance = {
  verified: true,
  /** מדרגת הגבייה המופחתת, החל ב-01.01.2026. */
  reducedRateCeiling: 7_703,
  /** ההכנסה המרבית החייבת בדמי ביטוח, החל ב-01.01.2026. */
  maxIncome: 51_910,
  /** הכנסה מזערית לחיוב בדמי ביטוח (25% מהשכר הממוצע). */
  minIncome: 3_442,
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

export type InsuredType =
  | "employee"
  | "selfEmployed"
  | "selfEmployedYoungOrPensioner"
  | "selfEmployedRetirementAge"
  | "earlyPension"
  | "householdEmployee"
  | "nonWorking";

type Rate = { insurance: number; health: number };

export interface InsuredTypeConfig {
  key: InsuredType;
  /** כותרת מלאה לבורר */
  label: string;
  /** כותרת קצרה לכותרות ולתוויות */
  shortLabel: string;
  /** קבוצה בבורר */
  group: "עבודה" | "פנסיה וגמלאות" | "ללא עבודה";
  /** תווית שדה ההכנסה */
  incomeLabel: string;
  /** תווית התוצאה */
  netLabel: string;
  /** סולם מדרגות המס החל על ההכנסה */
  taxScale: "personal" | "passive";
  /** האם הפקדות לפנסיה ולקרן השתלמות רלוונטיות */
  hasDeposits: boolean;
  /** השיעור כולל כבר דמי ביטוח בריאות - להצגה בשורה אחת */
  combinedRates: boolean;
  /**
   * twoTier - שיעור מופחת עד 7,703 ש"ח ושיעור מלא מעליו;
   * flat - שיעור אחיד על כל השכר.
   */
  rates:
    | { kind: "twoTier"; reduced: Rate; full: Rate }
    | { kind: "flat"; rate: Rate };
  /** תשלום חודשי מזערי בדמי ביטוח (ש"ח) */
  minMonthly?: number;
  /** הערה שמוצגת מתחת לבורר */
  note?: string;
  /** הדף הרשמי שממנו נלקחו השיעורים */
  source: string;
}

const BTL = "https://www.btl.gov.il/Insurance";

/**
 * טבלת סוגי המבוטחים. כל שיעור כאן הועתק מדף השיעורים הרשמי המתאים -
 * אין כאן אף מספר משוער.
 */
export const INSURED_TYPES: Record<InsuredType, InsuredTypeConfig> = {
  employee: {
    key: "employee",
    label: "שכיר/ה (מגיל 18 עד גיל פרישה)",
    shortLabel: "שכיר/ה",
    group: "עבודה",
    incomeLabel: "שכר ברוטו לחודש",
    netLabel: "נטו לחודש",
    taxScale: "personal",
    hasDeposits: true,
    combinedRates: false,
    rates: {
      kind: "twoTier",
      reduced: { insurance: 0.0104, health: 0.0323 },
      full: { insurance: 0.07, health: 0.0517 },
    },
    source: `${BTL}/Rates/Pages/לעובדים%20שכירים.aspx`,
  },
  selfEmployed: {
    key: "selfEmployed",
    label: "עצמאי/ת (מגיל 18 עד גיל פרישה)",
    shortLabel: "עצמאי/ת",
    group: "עבודה",
    incomeLabel: "הכנסה חייבת לחודש",
    netLabel: "נשאר ביד לחודש",
    taxScale: "personal",
    hasDeposits: true,
    combinedRates: false,
    rates: {
      kind: "twoTier",
      reduced: { insurance: 0.0447, health: 0.0323 },
      full: { insurance: 0.1283, health: 0.0517 },
    },
    source: `${BTL}/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx`,
  },
  selfEmployedYoungOrPensioner: {
    key: "selfEmployedYoungOrPensioner",
    label: "עצמאי/ת עד גיל 18, או מקבל/ת קצבת אזרח ותיק",
    shortLabel: "עצמאי/ת עד גיל 18 או מקבל/ת קצבת אזרח ותיק",
    group: "עבודה",
    incomeLabel: "הכנסה חייבת לחודש",
    netLabel: "נשאר ביד לחודש",
    taxScale: "personal",
    hasDeposits: true,
    combinedRates: false,
    rates: {
      kind: "twoTier",
      reduced: { insurance: 0.0026, health: 0 },
      full: { insurance: 0.0078, health: 0 },
    },
    note: 'השיעורים כוללים דמי ביטוח לאומי בלבד. מי שטרם מלאו לו 18 פטור מדמי ביטוח בריאות, ולמקבל/ת קצבת אזרח ותיק מנוכים דמי הבריאות מהקצבה - 237 ש"ח לחודש - ולכן הם אינם מופיעים כאן.',
    source: `${BTL}/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx`,
  },
  selfEmployedRetirementAge: {
    key: "selfEmployedRetirementAge",
    label: "עצמאי/ת בגיל פרישה שאינו/ה מקבל/ת קצבת אזרח ותיק",
    shortLabel: "עצמאי/ת בגיל פרישה",
    group: "עבודה",
    incomeLabel: "הכנסה חייבת לחודש",
    netLabel: "נשאר ביד לחודש",
    taxScale: "personal",
    hasDeposits: true,
    combinedRates: true,
    rates: {
      kind: "twoTier",
      reduced: { insurance: 0.0692, health: 0 },
      full: { insurance: 0.1579, health: 0 },
    },
    note: "הביטוח הלאומי מפרסם לקבוצה הזו שיעור אחד שכולל כבר גם דמי ביטוח בריאות, ולכן הוא מוצג בשורה אחת ולא מפוצל.",
    source: `${BTL}/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx`,
  },
  earlyPension: {
    key: "earlyPension",
    label: "מקבל/ת פנסיה מוקדמת",
    shortLabel: "פנסיה מוקדמת",
    group: "פנסיה וגמלאות",
    incomeLabel: "פנסיה מוקדמת לחודש (ברוטו)",
    netLabel: "נשאר ביד לחודש",
    taxScale: "personal",
    hasDeposits: false,
    combinedRates: false,
    rates: {
      kind: "twoTier",
      reduced: { insurance: 0.0102, health: 0.0323 },
      full: { insurance: 0.0679, health: 0.0517 },
    },
    note: "פנסיה מוקדמת היא פרישה לפני גיל הפרישה. דמי הביטוח מנוכים מהפנסיה על ידי הגוף המשלם.",
    source: `${BTL}/Rates/Pages/למקבלי%20פנסיה%20מוקדמת.aspx`,
  },
  householdEmployee: {
    key: "householdEmployee",
    label: "עובד/ת במשק בית",
    shortLabel: "משק בית",
    group: "עבודה",
    incomeLabel: "שכר ברוטו לחודש",
    netLabel: "נטו לחודש",
    taxScale: "personal",
    hasDeposits: true,
    combinedRates: false,
    rates: {
      kind: "flat",
      rate: { insurance: 0.018, health: 0.01 },
    },
    note: "מוצג חלק העובד/ת בלבד (2.8%), ללא מדרגת גבייה מופחתת. המעסיק משלם בנוסף 6.05% מהשכר.",
    source: `${BTL}/Rates/Pages/עובד%20משק%20בית.aspx`,
  },
  nonWorking: {
    key: "nonWorking",
    label: "מי שאינו/ה עובד/ת, או בעל/ת הכנסה שלא מעבודה",
    shortLabel: "הכנסה שלא מעבודה",
    group: "ללא עבודה",
    incomeLabel: "הכנסה חודשית שלא מעבודה",
    netLabel: "נשאר ביד לחודש",
    taxScale: "passive",
    hasDeposits: false,
    combinedRates: false,
    rates: {
      kind: "twoTier",
      reduced: { insurance: 0.0692, health: 0.0517 },
      full: { insurance: 0.07, health: 0.0517 },
    },
    minMonthly: 266,
    note: 'מי שאינו/ה עובד/ת וללא הכנסות משלם/ת מינימום של 266 ש"ח לחודש (143 ביטוח לאומי ו-123 בריאות). על הכנסה שאינה מיגיעה אישית חלות מדרגות מס שמתחילות ב-31%; למי שמלאו לו 60 חלות המדרגות הרגילות.',
    source: `${BTL}/Rates/Pages/מי%20שאינם%20עובדים%20ובעלי%20הכנסה%20שלא%20מעבודה.aspx`,
  },
};

/** סדר ההצגה בבורר. */
export const INSURED_TYPE_ORDER: InsuredType[] = [
  "employee",
  "selfEmployed",
  "householdEmployee",
  "selfEmployedYoungOrPensioner",
  "selfEmployedRetirementAge",
  "earlyPension",
  "nonWorking",
];
