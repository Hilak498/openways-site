import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ServiceIcon } from "@/components/service-icon";
import { mortgageAdvisorsPage as page } from "@/lib/site";

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: { canonical: "/services/mortgage-advisory/advisors" },
  openGraph: {
    title: page.metaTitle,
    description: page.metaDescription,
    url: "/services/mortgage-advisory/advisors",
    type: "website",
    locale: "he_IL",
  },
};

// TODO: להעלות תמונת רקע ייעודית לעמוד היועצים ל-public/images/advisors.jpg
const heroCandidates = ["advisors.jpg", "service-mortgage-advisory.jpg"];

export default function MortgageAdvisorsPage() {
  const heroFile = heroCandidates.find((f) =>
    existsSync(path.join(process.cwd(), "public", "images", f)),
  );
  const heroBg = heroFile ? `/images/${heroFile}` : null;

  return (
    <>
      {/* Hero */}
      <section className="on-dark hero-navy relative isolate overflow-hidden text-white">
        {heroBg ? (
          <>
            <Image
              src={heroBg}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              aria-hidden="true"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-navy-900/85" />
          </>
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-12 h-[400px] w-[400px] rounded-full bg-gold-300/10 blur-[100px]"
        />
        <div className="container-site relative pt-36 pb-20">
          <nav aria-label="פירורי לחם" className="text-sm text-white/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-gold-300">
                  ראשי
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/services/mortgage-advisory"
                  className="transition hover:text-gold-300"
                >
                  ייעוץ משכנתאות
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-gold-300">
                ייעוץ ליועצים
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 text-gold-300 shadow-sm ring-1 ring-white/10">
                  <ServiceIcon icon="home" className="h-8 w-8" />
                </span>
                <h1 className="mt-6 max-w-2xl text-4xl leading-[1.2] font-bold tracking-normal sm:text-5xl">
                  {page.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
                  {page.subtitle}
                </p>
                <div className="mt-9 flex flex-wrap gap-4">
                  <Link href="/#contact" className="btn-primary !px-8 !py-4">
                    לשיחת היכרות ליועצים
                  </Link>
                  <a href="#components" className="btn-ghost-dark !px-8 !py-4">
                    מה כוללת המעטפת?
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* The envelope components */}
      <section id="components" className="scroll-mt-24 py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="מה כוללת המעטפת"
            title="כל הרכיבים לעסק ייעוץ מצליח"
          />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page.items.map((item, i) => (
              <Reveal key={item.title} as="li" delay={i * 0.06} className="h-full">
                <div className="card card-hover h-full p-8">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 font-display text-lg font-bold text-gold-300"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-navy-800">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-navy-600">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for + how to join */}
      <section className="bg-sand-50 py-24">
        <div className="container-site grid gap-8 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="card h-full bg-sand-100 p-8">
              <h2 className="text-xl font-bold text-navy-800">{page.audience.title}</h2>
              <ul className="mt-5 space-y-4">
                {page.audience.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-700"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="leading-7 text-navy-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <div className="card h-full p-8">
              <h2 className="text-xl font-bold text-navy-800">איך מצטרפים</h2>
              <ol className="mt-5 space-y-5">
                {page.steps.map((step, i) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400 font-display text-sm font-bold text-gold-ink"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-navy-800">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-navy-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-24">
        <div className="container-site">
          <Reveal>
            <div className="on-dark hero-navy relative overflow-hidden rounded-[2.5rem] px-8 py-14 text-center text-white sm:px-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-gold-400/15 blur-[100px]"
              />
              <div className="relative">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  בואו נבנה יחד את עסק הייעוץ שלכם
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/90">
                  שיחת היכרות ראשונית ליועצים - ללא עלות וללא התחייבות. נכיר,
                  נמפה את הצרכים ונראה איך המעטפת שלנו מקדמת אתכם.
                </p>
                <Link href="/#contact" className="btn-primary mt-8 !px-8 !py-4">
                  לשיחת היכרות ליועצים
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
