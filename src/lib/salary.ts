/**
 * חישוב שכר נטו לשכיר ולעצמאי, לפי נתוני 2026 שב-tax-2026.ts.
 *
 * המודל תואם למה שמקובל במחשבוני שכר: מס הכנסה לפי מדרגות בניכוי נקודות
 * זיכוי וזיכוי בגין הפקדות לפנסיה, דמי ביטוח לאומי ובריאות בשתי מדרגות,
 * וניכוי הפקדות העובד. זהו חישוב להמחשה - תלוש אמיתי כולל רכיבים נוספים
 * (שווי שימוש, זקיפות, תיאומי מס, הטבות יישוב) שאינם כאן.
 */
import {
  CREDIT_POINT_MONTHLY,
  MONTHLY_BRACKETS,
  PENSION_CREDIT_RATE,
  PENSION_ELIGIBLE_CEILING_MONTHLY,
  SURTAX,
  nationalInsurance,
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

/** דמי ביטוח לאומי ובריאות, שתי מדרגות עד התקרה. */
export function socialInsurance(
  income: number,
  who: "employee" | "selfEmployed",
): { insurance: number; health: number; total: number } {
  const cfg = nationalInsurance;
  const rates = cfg[who];
  const capped = Math.min(income, cfg.maxIncome);
  const low = Math.min(capped, cfg.reducedRateCeiling);
  const high = Math.max(0, capped - cfg.reducedRateCeiling);

  const insurance = low * rates.reduced.insurance + high * rates.full.insurance;
  const health = low * rates.reduced.health + high * rates.full.health;
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
  who: "employee" | "selfEmployed";
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
  const gross = Math.max(0, input.gross);
  const pension = gross * Math.max(0, input.pensionRate) / 100;
  const studyFund = gross * Math.max(0, input.studyFundRate) / 100;

  // מס לפי מדרגות, ועליו מס יסף על החלק שמעל התקרה
  const incomeTaxBeforeCredits = taxByBrackets(gross, MONTHLY_BRACKETS);
  const surtax =
    gross > SURTAX.monthlyThreshold
      ? (gross - SURTAX.monthlyThreshold) * SURTAX.rate
      : 0;

  // זיכויים: נקודות זיכוי, וזיכוי 35% על הפקדות לתגמולים עד תקרת ההכנסה המזכה
  const creditPointsValue = Math.max(0, input.creditPoints) * CREDIT_POINT_MONTHLY;
  const eligiblePension = Math.min(
    pension,
    PENSION_ELIGIBLE_CEILING_MONTHLY * Math.max(0, input.pensionRate) / 100,
  );
  const pensionCredit = eligiblePension * PENSION_CREDIT_RATE;

  // זיכויים לא יוצרים החזר - המס לא יורד מתחת לאפס
  const incomeTax = Math.max(
    0,
    incomeTaxBeforeCredits + surtax - creditPointsValue - pensionCredit,
  );

  const { insurance, health } = socialInsurance(gross, input.who);
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
