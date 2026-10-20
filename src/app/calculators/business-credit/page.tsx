import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { LoanCalculator } from "@/components/loan-calculator";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { calculatorSchema } from "@/lib/schema";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/calculators/business-credit",
    title: "מחשבון אשראי לעסק - החזר והלוואה | Open Ways",
    description:
      "מחשבון לחישוב החזר הלוואה לעסק לפי סכום, ריבית ותקופה, כדי לבדוק השפעה על התזרים לפני פנייה לגורם מממן.",
  }),
};

export default function BusinessCreditCalculatorPage() {
  return (
    <>
      <JsonLd
        data={calculatorSchema(
          "מחשבון אשראי לעסק",
          "מחשבון לחישוב החזר הלוואה לעסק לפי סכום, ריבית ותקופה, כדי לבדוק השפעה על התזרים לפני פנייה לגורם מממן.",
          "/calculators/business-credit",
        )}
      />
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
            <h1 className="mt-10 max-w-2xl text-4xl leading-[1.2] font-bold sm:text-5xl">
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
              calculatorName="business_credit"
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 text-center">
            <Link href="/#contact" className="btn-dark !px-8 !py-4">
              לשירות גיוס אשראי עסקי
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
