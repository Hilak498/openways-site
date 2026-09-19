/**
 * חישוב שכר נטו לפי סוג המבוטח, על בסיס נתוני 2026 שב-tax-2026.ts.
 *
 * המודל תואם למה שמקובל במחשבוני שכר: מס הכנסה לפי מדרגות בניכוי נקודות
 * זיכוי וזיכוי בגין הפקדות לפנסיה, דמי ביטוח לאומי ובריאות לפי השיעורים
 * שחלים על סוג המבוטח, וניכוי הפקדות העובד. זהו חישוב להמחשה - תלוש אמיתי
 * כולל רכיבים נוספים (שווי שימוש, זקיפות, תיאומי מס, הטבות יישוב) שאינם כאן.
 */
import {
  CREDIT_POINT_MONTHLY,
  INSURED_TYPES,
  MONTHLY_BRACKETS,
  PASSIVE_MONTHLY_BRACKETS,
  PENSION_CREDIT_RATE,
  PENSION_ELIGIBLE_CEILING_MONTHLY,
  SURTAX,
  nationalInsurance,
  type InsuredType,
} from "./tax-2026";

/** מס לפי סולם מדרגות - כל מדרגה על החלק שבתוכה בלבד. */
export function taxByBrackets(
  income: number,
  brackets: { upTo: number | null; rate: number }[],
): number {
  let tax = 0;
  let floor = 0;
  for (const { upTo, rate } of brackets) {
    if (income <= floor) break;
    const ceiling = upTo ?? Infinity;
    tax += (Math.min(income, ceiling) - floor) * rate;
    floor = ceiling;
  }
  return tax;
}

/**
 * דמי ביטוח לאומי ובריאות לפי סוג המבוטח.
 *
 * twoTier: שיעור מופחת עד מדרגת הגבייה (7,703) ושיעור מלא מעליה ועד התקרה.
 * flat: שיעור אחיד על כל השכר עד התקרה (עובד/ת משק בית).
 * minMonthly: רצפת תשלום חודשית, אם הביטוח הלאומי קבע כזו לסוג הזה.
 */
export function socialInsurance(
  income: number,
  type: InsuredType,
): { insurance: number; health: number; total: number } {
  const cfg = INSURED_TYPES[type];
  const capped = Math.min(Math.max(0, income), nationalInsurance.maxIncome);

  let insurance: number;
  let health: number;

  if (cfg.rates.kind === "flat") {
    insurance = capped * cfg.rates.rate.insurance;
    health = capped * cfg.rates.rate.health;
  } else {
    const low = Math.min(capped, nationalInsurance.reducedRateCeiling);
    const high = Math.max(0, capped - nationalInsurance.reducedRateCeiling);
    insurance =
      low * cfg.rates.reduced.insurance + high * cfg.rates.full.insurance;
    health = low * cfg.rates.reduced.health + high * cfg.rates.full.health;
  }

  // רצפת תשלום: מעלים את שני הרכיבים ביחס שנשמר, ואם אין הכנסה כלל -
  // לפי הפיצול שהביטוח הלאומי מפרסם (143 ביטוח לאומי ו-123 בריאות).
  if (cfg.minMonthly && insurance + health < cfg.minMonthly) {
    const total = insurance + health;
    if (total > 0) {
      const factor = cfg.minMonthly / total;
      insurance *= factor;
      health *= factor;
    } else {
      insurance = 143;
      health = 123;
    }
  }

  return { insurance, health, total: insurance + health };
}

export interface SalaryInput {
  /** ברוטו חודשי (לעצמאי: הכנסה חייבת חודשית). */
  gross: number;
  /** נקודות זיכוי. רווק/ה תושב/ת ישראל: 2.25 לגבר, 2.75 לאישה. */
  creditPoints: number;
  /** שיעור הפקדת העובד לתגמולי פנסיה (למשל 6 עבור 6%). */
  pensionRate: number;
  /** שיעור הפקדת העובד לקרן השתלמות (למשל 2.5). */
  studyFundRate: number;
  type: InsuredType;
}

export interface SalaryResult {
  gross: number;
  incomeTaxBeforeCredits: number;
  creditPointsValue: number;
  pensionCredit: number;
  surtax: number;
  incomeTax: number;
  insurance: number;
  health: number;
  pension: number;
  studyFund: number;
  totalDeductions: number;
  net: number;
  /** שיעור המס האפקטיבי על הברוטו. */
  effectiveRate: number;
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  const cfg = INSURED_TYPES[input.type];
  const gross = Math.max(0, input.gross);

  // בפנסיה מוקדמת ובהכנסה שלא מעבודה אין הפקדות עובד
  const pension = cfg.hasDeposits
    ? (gross * Math.max(0, input.pensionRate)) / 100
    : 0;
  const studyFund = cfg.hasDeposits
    ? (gross * Math.max(0, input.studyFundRate)) / 100
    : 0;

  // מס לפי מדרגות - יגיעה אישית או הכנסה שאינה מיגיעה אישית - ועליו מס יסף
  const brackets =
    cfg.taxScale === "passive" ? PASSIVE_MONTHLY_BRACKETS : MONTHLY_BRACKETS;
  const incomeTaxBeforeCredits = taxByBrackets(gross, brackets);
  const surtax =
    gross > SURTAX.monthlyThreshold
      ? (gross - SURTAX.monthlyThreshold) * SURTAX.rate
      : 0;

  // זיכויים: נקודות זיכוי, וזיכוי 35% על הפקדות לתגמולים עד תקרת ההכנסה המזכה
  const creditPointsValue =
    Math.max(0, input.creditPoints) * CREDIT_POINT_MONTHLY;
  const eligiblePension = Math.min(
    pension,
    (PENSION_ELIGIBLE_CEILING_MONTHLY * Math.max(0, input.pensionRate)) / 100,
  );
  const pensionCredit = cfg.hasDeposits ? eligiblePension * PENSION_CREDIT_RATE : 0;

  // זיכויים לא יוצרים החזר - המס לא יורד מתחת לאפס
  const incomeTax = Math.max(
    0,
    incomeTaxBeforeCredits + surtax - creditPointsValue - pensionCredit,
  );

  const { insurance, health } = socialInsurance(gross, input.type);
  const totalDeductions = incomeTax + insurance + health + pension + studyFund;

  return {
    gross,
    incomeTaxBeforeCredits,
    creditPointsValue,
    pensionCredit,
    surtax,
    incomeTax,
    insurance,
    health,
    pension,
    studyFund,
    totalDeductions,
    net: gross - totalDeductions,
    effectiveRate: gross > 0 ? (incomeTax + insurance + health) / gross : 0,
  };
}
