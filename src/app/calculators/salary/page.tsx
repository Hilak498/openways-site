import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SalaryCalculator } from "@/components/salary-calculator";
import { nationalInsurance } from "@/lib/tax-2026";

export const metadata: Metadata = {
  title: "מחשבון שכר נטו",
  description:
    "מחשבון שכר של Open Ways: מברוטו לנטו לשכירים ולעצמאים, לפי מדרגות המס, נקודות הזיכוי ותקרות ההפקדה של שנת 2026 - לצורך המחשה בלבד.",
  alternates: { canonical: "/calculators/salary" },
  // כל עוד שיעורי הביטוח הלאומי לא אומתו, העמוד לא נכנס לאינדוקס ולא מקושר
  // מהתפריט. לפרסום: לאמת את nationalInsurance ב-tax-2026.ts ולהסיר את זה.
  robots: nationalInsurance.verified ? undefined : { index: false, follow: false },
};

export default function SalaryCalculatorPage() {
  return (
    <>
      <section className="on-dark hero-navy relative isolate overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-12 h-[400px] w-[400px] rounded-full bg-gold-300/10 blur-[100px]"
        />
        <div className="container-site relative pt-36 pb-16">
          <nav aria-label="פירורי לחם" className="text-sm text-white/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-gold-300">
                  ראשי
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-gold-300">
                מחשבון שכר
              </li>
            </ol>
          </nav>
          <Reveal>
            <h1 className="mt-10 max-w-2xl text-4xl leading-[1.2] font-bold sm:text-5xl">
              כמה באמת נכנס לחשבון בסוף החודש
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
              מברוטו לנטו, לשכירים ולעצמאים: מס הכנסה לפי המדרגות, נקודות זיכוי,
              דמי ביטוח לאומי ובריאות והפקדות לפנסיה. הנטו הזה הוא גם המספר
              שהבנק מסתכל עליו כשהוא בוחן בקשת משכנתה.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container-site">
          <Reveal>
            <SalaryCalculator />
          </Reveal>
        </div>
      </section>
    </>
  );
}
