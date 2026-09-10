import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { LoanCalculator } from "@/components/loan-calculator";

export const metadata: Metadata = {
  title: "מחשבון גיוס אשראי עסקי",
  description:
    "מחשבון גיוס אשראי עסקי של Open Ways: הזינו סכום מימון, ריבית ותקופה וקבלו הערכה של ההחזר החודשי והעלות הכוללת - לצורך המחשה בלבד.",
  alternates: { canonical: "/calculators/business-credit" },
};

export default function BusinessCreditCalculatorPage() {
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
                מחשבון גיוס אשראי
              </li>
            </ol>
          </nav>
          <Reveal>
            <h1 className="mt-10 max-w-2xl text-4xl leading-[1.2] font-bold tracking-normal sm:text-5xl">
              מחשבון גיוס אשראי עסקי
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
              הערכה מהירה של ההחזר החודשי על מימון עסקי - לפי סכום, ריבית
              ותקופה. לתנאים מיטביים באמת, נבנה עבורכם תיק אשראי מקצועי.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24">
        <div className="container-site max-w-3xl">
          <Reveal>
            <LoanCalculator
              amountLabel="סכום המימון"
              defaultAmount={500_000}
              maxAmount={3_000_000}
              amountStep={25_000}
              defaultRate={6.5}
              defaultYears={5}
              maxYears={15}
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 text-center">
            <Link href="/services/business-credit" className="btn-dark !px-8 !py-4">
              לשירות גיוס אשראי עסקי
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
