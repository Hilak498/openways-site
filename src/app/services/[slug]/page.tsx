import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ServiceIcon } from "@/components/service-icon";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { faqSchema, serviceSchema } from "@/lib/schema";
import { getService, services } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `/services/${service.slug}`,
      type: "website",
      locale: "he_IL",
    },
  };
}

export default async function ServicePage({
  params,
}: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  // Optional per-service hero photo: public/images/service-<slug>.jpg is
  // composited under a navy overlay when present (see README).
  const heroBg = `/images/service-${service.slug}.jpg`;
  const heroBgExists = existsSync(
    path.join(process.cwd(), "public", "images", `service-${service.slug}.jpg`),
  );

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={faqSchema(service)} />

      {/* Secondary hero */}
      <section className="on-dark hero-navy relative isolate overflow-hidden text-white">
        {heroBgExists ? (
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
                <Link href="/#services" className="transition hover:text-gold-300">
                  שירותים
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-gold-300">
                {service.name}
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 text-gold-300 shadow-sm ring-1 ring-white/10">
                  <ServiceIcon icon={service.icon} className="h-8 w-8" />
                </span>
                <h1 className="mt-6 max-w-2xl text-4xl leading-[1.2] font-bold tracking-tight sm:text-5xl">
                  {service.hero.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
                  {service.hero.subtitle}
                </p>
                <div className="mt-9 flex flex-wrap gap-4">
                  <Link href="/#contact" className="btn-primary !px-8 !py-4">
                    לתיאום פגישת ייעוץ
                  </Link>
                  <a href="#process" className="btn-ghost-dark !px-8 !py-4">
                    איך זה עובד?
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation */}
      <section className="py-24">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">על השירות</p>
              <h2 className="mt-3 text-3xl font-extrabold text-navy-800 sm:text-4xl">
                {service.explanation.title}
              </h2>
            </Reveal>
            <div className="mt-7 space-y-5">
              {service.explanation.paragraphs.map((p, i) => (
                <Reveal key={i} delay={0.05 * (i + 1)}>
                  <p className="text-lg leading-8 text-navy-600">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Who it's for */}
          <Reveal delay={0.15} className="lg:col-span-5">
            <aside className="card sticky top-28 bg-sand-100 p-8">
              <h2 className="text-xl font-bold text-navy-800">
                {service.audience.title}
              </h2>
              <ul className="mt-5 space-y-4">
                {service.audience.items.map((item) => (
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
              <Link href="/#contact" className="btn-dark mt-7 w-full text-center">
                נשמע מוכר? דברו איתנו
              </Link>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Process — numbered circles with a vertical connector, per the design */}
      <section id="process" className="scroll-mt-24 bg-sand-50 py-24">
        <div className="container-site">
          <SectionHeading eyebrow="תהליך העבודה" title={service.process.title} />
          <ol className="relative mx-auto mt-14 max-w-2xl space-y-12">
            <div
              aria-hidden="true"
              className="absolute top-4 bottom-4 right-[27px] w-1 rounded-full bg-sand-300"
            />
            {service.process.steps.map((step, i) => (
              <Reveal key={step.title} as="li" delay={i * 0.08}>
                <div className="group relative flex items-start gap-6 pr-20">
                  <span
                    className={`absolute top-0 right-0 z-10 flex h-14 w-14 items-center justify-center rounded-full font-display text-lg font-bold shadow-soft transition-transform group-hover:scale-110 ${
                      i % 2 === 0
                        ? "bg-navy-900 text-white"
                        : "bg-gold-400 text-gold-ink"
                    }`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-navy-800">{step.title}</h3>
                    <p className="mt-2 leading-7 text-navy-600">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-sand-100 py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="שאלות נפוצות"
            title={`כל מה שרציתם לדעת על ${service.name}`}
          />
          <div className="mt-12">
            <Faq items={service.faq} />
          </div>
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
                <h2 className="text-3xl font-bold sm:text-4xl">מוכנים לצעד הראשון?</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/90">
                  פגישת היכרות ראשונית — ללא עלות וללא התחייבות. נבין את הצורך,
                  נציג את הדרך ותחליטו בנחת.
                </p>
                <Link href="/#contact" className="btn-primary mt-8 !px-8 !py-4">
                  לתיאום פגישת ייעוץ
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
