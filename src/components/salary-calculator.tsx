"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { calculateSalary } from "@/lib/salary";
import {
  INSURED_TYPES,
  INSURED_TYPE_ORDER,
  TAX_SOURCE,
  TAX_YEAR,
  selfEmployedNiDeduction,
  type InsuredType,
} from "@/lib/tax-2026";

const nis = (v: number) => `₪${Math.round(v).toLocaleString("he-IL")}`;

/** קיבוץ סוגי המבוטחים לתוך optgroup, בסדר שנקבע ב-INSURED_TYPE_ORDER. */
const GROUPS = INSURED_TYPE_ORDER.reduce<
  { group: string; types: InsuredType[] }[]
>((acc, key) => {
  const { group } = INSURED_TYPES[key];
  const bucket = acc.find((g) => g.group === group);
  if (bucket) bucket.types.push(key);
  else acc.push({ group, types: [key] });
  return acc;
}, []);

const SELF_EMPLOYED: InsuredType[] = [
  "selfEmployed",
  "selfEmployedYoungOrPensioner",
  "selfEmployedRetirementAge",
];

export function SalaryCalculator() {
  const id = useId();
  const [type, setType] = useState<InsuredType>("employee");
  const [gross, setGross] = useState(15_000);
  const [creditPoints, setCreditPoints] = useState(2.25);
  const [pensionRate, setPensionRate] = useState(6);
  const [studyFundRate, setStudyFundRate] = useState(0);

  const cfg = INSURED_TYPES[type];
  const r = calculateSalary({
    gross,
    creditPoints,
    pensionRate,
    studyFundRate,
    type,
  });

  const fields = [
    {
      key: "gross",
      label: cfg.incomeLabel,
      value: gross,
      set: setGross,
      min: 0,
      max: 80_000,
      step: 250,
      display: nis(gross),
    },
    {
      key: "points",
      label: "נקודות זיכוי",
      value: creditPoints,
      set: setCreditPoints,
      min: 0,
      max: 10,
      step: 0.25,
      display: creditPoints.toLocaleString("he-IL"),
      hint: "רווק/ה תושב/ת ישראל: 2.25 לגבר, 2.75 לאישה. ילדים מוסיפים נקודות.",
    },
    ...(cfg.hasDeposits
      ? [
          {
            key: "pension",
            label: "הפקדה לפנסיה (חלק העובד/ת)",
            value: pensionRate,
            set: setPensionRate,
            min: 0,
            max: 10,
            step: 0.5,
            display: `${pensionRate}%`,
          },
          {
            key: "study",
            label: "הפקדה לקרן השתלמות (חלק העובד/ת)",
            value: studyFundRate,
            set: setStudyFundRate,
            min: 0,
            max: 5,
            step: 0.5,
            display: `${studyFundRate}%`,
          },
        ]
      : []),
  ];

  const rows = [
    { label: "מס הכנסה", value: r.incomeTax },
    cfg.combinedRates
      ? { label: "דמי ביטוח לאומי ובריאות", value: r.insurance + r.health }
      : { label: "דמי ביטוח לאומי", value: r.insurance },
    ...(!cfg.combinedRates && r.health > 0
      ? [{ label: "דמי ביטוח בריאות", value: r.health }]
      : []),
    ...(r.pension > 0 ? [{ label: "הפקדה לפנסיה", value: r.pension }] : []),
    ...(r.studyFund > 0
      ? [{ label: "הפקדה לקרן השתלמות", value: r.studyFund }]
      : []),
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* קלט */}
      <div className="card p-8 lg:col-span-7">
        <label
          htmlFor={`${id}-type`}
          className="font-semibold text-navy-800"
        >
          סוג המבוטח/ת
        </label>
        <select
          id={`${id}-type`}
          value={type}
          onChange={(e) => setType(e.target.value as InsuredType)}
          className="mt-3 w-full cursor-pointer rounded-xl border border-navy-800/15 bg-sand-100 px-4 py-3 text-sm font-bold text-navy-800 transition outline-none hover:border-gold-600 focus-visible:ring-2 focus-visible:ring-gold-600"
        >
          {GROUPS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.types.map((key) => (
                <option key={key} value={key}>
                  {INSURED_TYPES[key].label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {cfg.note ? (
          <p className="mt-3 rounded-xl bg-sand-100 px-4 py-3 text-xs leading-5 text-navy-600">
            {cfg.note}
          </p>
        ) : null}

        <div className="mt-8 space-y-7">
          {fields.map((f) => (
            <div key={f.key}>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={`${id}-${f.key}`} className="font-semibold text-navy-800">
                  {f.label}
                </label>
                <span className="font-display text-lg font-bold text-gold-700">
                  {f.display}
                </span>
              </div>
              <input
                id={`${id}-${f.key}`}
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={f.value}
                onChange={(e) => f.set(Number(e.target.value))}
                className="mt-3 w-full accent-gold-700"
              />
              {f.hint ? (
                <p className="mt-2 text-xs leading-5 text-navy-600">{f.hint}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* פלט */}
      <div className="lg:col-span-5">
        <div className="on-dark hero-navy card !border-navy-700 p-8 text-white">
          <p className="eyebrow !text-gold-300">{cfg.netLabel}</p>
          <p className="mt-2 font-display text-4xl font-extrabold text-gold-300">
            {nis(r.net)}
          </p>
          <p className="mt-2 text-sm text-white/75">
            מתוך {nis(r.gross)} ברוטו · שיעור מס אפקטיבי{" "}
            {(r.effectiveRate * 100).toFixed(1)}%
          </p>

          <dl className="mt-7 space-y-3 border-t border-white/15 pt-5 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4">
                <dt className="text-white/80">{row.label}</dt>
                <dd className="font-semibold">{nis(row.value)}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-3 font-bold">
              <dt>סך הניכויים</dt>
              <dd className="text-gold-300">{nis(r.totalDeductions)}</dd>
            </div>
          </dl>

          {r.creditPointsValue > 0 ? (
            <p className="mt-5 rounded-xl bg-white/[0.07] px-4 py-3 text-xs leading-5 text-white/80">
              נקודות הזיכוי חוסכות לך {nis(Math.min(r.creditPointsValue, r.incomeTaxBeforeCredits + r.surtax))} מס בחודש
              {r.pensionCredit > 0
                ? `, וההפקדה לפנסיה עוד ${nis(r.pensionCredit)}`
                : ""}
              .
            </p>
          ) : null}

          <Link href="/#contact" className="btn-primary mt-7 w-full">
            לבדיקת התמונה המלאה
          </Link>
        </div>

        <p className="mt-5 text-xs leading-6 text-navy-600">
          החישוב להמחשה בלבד ואינו מהווה ייעוץ מס. מדרגות המס, נקודת הזיכוי
          ותקרות ההפקדה לשנת {TAX_YEAR} לפי {TAX_SOURCE.incomeTax.title},{" "}
          {TAX_SOURCE.incomeTax.publisher}, {TAX_SOURCE.incomeTax.updated}.
          שיעורי דמי ביטוח לאומי ובריאות עבור{" "}
          <a
            href={cfg.source}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gold-700 underline underline-offset-2"
          >
            {cfg.shortLabel}
          </a>{" "}
          לפי {TAX_SOURCE.nationalInsurance.publisher}, החל ב-01.01.2026.
          {SELF_EMPLOYED.includes(type) && !selfEmployedNiDeduction.applied
            ? " החישוב לעצמאי/ת אינו כולל את הניכוי מההכנסה החייבת בשל דמי ביטוח לאומי."
            : ""}{" "}
          תלוש אמיתי כולל רכיבים נוספים (שווי שימוש, זקיפות, תיאומי מס והטבות
          יישוב) שאינם בחישוב.
        </p>
      </div>
    </div>
  );
}
