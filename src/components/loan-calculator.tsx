"use client";

import { useId, useState } from "react";
import Link from "next/link";

/**
 * מחשבון הלוואה כללי (לוח שפיצר): החזר חודשי, סך תשלום וסך ריבית.
 * משמש גם את מחשבון המשכנתא וגם את מחשבון גיוס האשראי - ההבדל בברירות המחדל.
 */
export interface LoanCalculatorProps {
  amountLabel: string;
  defaultAmount: number;
  maxAmount: number;
  amountStep: number;
  defaultRate: number;
  defaultYears: number;
  maxYears: number;
}

function monthlyPayment(amount: number, annualRatePct: number, years: number): number {
  const n = years * 12;
  if (n <= 0 || amount <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return amount / n;
  return (amount * r) / (1 - Math.pow(1 + r, -n));
}

const nis = (value: number) =>
  `₪${Math.round(value).toLocaleString("he-IL")}`;

export function LoanCalculator({
  amountLabel,
  defaultAmount,
  maxAmount,
  amountStep,
  defaultRate,
  defaultYears,
  maxYears,
}: LoanCalculatorProps) {
  const id = useId();
  const [amount, setAmount] = useState(defaultAmount);
  const [rate, setRate] = useState(defaultRate);
  const [years, setYears] = useState(defaultYears);

  const monthly = monthlyPayment(amount, rate, years);
  const total = monthly * years * 12;
  const interest = total - amount;

  const fields = [
    {
      key: "amount",
      label: amountLabel,
      value: amount,
      set: (v: number) => setAmount(v),
      min: amountStep,
      max: maxAmount,
      step: amountStep,
      display: nis(amount),
    },
    {
      key: "rate",
      label: "ריבית שנתית ממוצעת",
      value: rate,
      set: (v: number) => setRate(v),
      min: 0,
      max: 15,
      step: 0.1,
      display: `${rate.toLocaleString("he-IL")}%`,
    },
    {
      key: "years",
      label: "תקופת ההלוואה (שנים)",
      value: years,
      set: (v: number) => setYears(v),
      min: 1,
      max: maxYears,
      step: 1,
      display: `${years} שנים`,
    },
  ] as const;

  return (
    <div className="card p-8 md:p-10">
      <div className="space-y-8">
        {fields.map((f) => (
          <div key={f.key}>
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor={`${id}-${f.key}`}
                className="text-sm font-semibold text-navy-800"
              >
                {f.label}
              </label>
              <output
                htmlFor={`${id}-${f.key}`}
                className="font-display text-lg font-bold whitespace-nowrap text-gold-700"
                dir="ltr"
              >
                {f.display}
              </output>
            </div>
            <input
              id={`${id}-${f.key}`}
              type="range"
              dir="ltr"
              min={f.min}
              max={f.max}
              step={f.step}
              value={f.value}
              onChange={(e) => f.set(Number(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-300 accent-gold-600"
            />
          </div>
        ))}
      </div>

      <dl className="mt-10 grid gap-4 border-t border-navy-800/10 pt-8 sm:grid-cols-3">
        <div className="rounded-2xl bg-navy-800 p-5 text-center">
          <dt className="text-xs font-semibold text-white/80">החזר חודשי משוער</dt>
          <dd className="mt-1 font-display text-2xl font-bold text-gold-300" dir="ltr">
            {nis(monthly)}
          </dd>
        </div>
        <div className="rounded-2xl bg-sand-100 p-5 text-center">
          <dt className="text-xs font-semibold text-navy-600">סך התשלומים</dt>
          <dd className="mt-1 font-display text-2xl font-bold text-navy-800" dir="ltr">
            {nis(total)}
          </dd>
        </div>
        <div className="rounded-2xl bg-sand-100 p-5 text-center">
          <dt className="text-xs font-semibold text-navy-600">סך הריבית</dt>
          <dd className="mt-1 font-display text-2xl font-bold text-navy-800" dir="ltr">
            {nis(interest)}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-xs leading-5 text-navy-600">
        החישוב מבוסס על לוח שפיצר בריבית קבועה, לצורך המחשה בלבד. הוא אינו מהווה
        הצעה, התחייבות או ייעוץ, והתנאים בפועל נקבעים על ידי הגוף המממן.{" "}
        <Link
          href="/#contact"
          className="font-semibold text-gold-700 underline underline-offset-2"
        >
          דברו איתנו
        </Link>{" "}
        לבדיקה מדויקת ואישית.
      </p>
    </div>
  );
}
