import type { Metadata } from "next";
import Link from "next/link";
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

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={faqSchema(service)} />

      {/* Secondary hero */}
      <section className="on-dark relative isolate overflow-hidden bg-navy-900 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(900px_420px_at_85%_-10%,rgba(185,153,95,0.16),transparent)]"
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
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-300">
                  <ServiceIcon icon={service.icon} className="h-8 w-8" />
                </span>
                <h1 className="mt-6 max-w-2xl text-4xl leading-[1.15] font-extrabold sm:text-5xl">
                  {service.hero.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
                  {service.hero.subtitle}
                </p>
                <div className="mt-9 flex flex-wrap gap-4">
                  <Link href="/#contact" className="btn-primary">
                    לתיאום פגישת ייעוץ
                  </Link>
                  <a href="#process" className="btn-ghost-dark">
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
            <aside className="card sticky top-28 bg-sand-50 p-8">
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

      {/* Process */}
      <section id="process" className="on-dark scroll-mt-24 bg-navy-900 py-24 text-white">
        <div className="container-site">
          <SectionHeading onDark eyebrow="תהליך העבודה" title={service.process.title} />
          <ol className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.steps.map((step, i) => (
              <Reveal key={step.title} as="li" delay={i * 0.1} className="h-full">
                <div className="glass-dark relative h-full p-6 pt-8">
                  <span
                    className="absolute -top-4 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-sm font-extrabold text-navy-900"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-sand-50 py-24">
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
            <div className="on-dark relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-14 text-center text-white sm:px-14">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_120%,rgba(185,153,95,0.25),transparent)]"
              />
              <div className="relative">
                <h2 className="text-3xl font-extrabold sm:text-4xl">
                  מוכנים לצעד הראשון?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/75">
                  פגישת היכרות ראשונית — ללא עלות וללא התחייבות. נבין את הצורך,
                  נציג את הדרך ותחליטו בנחת.
                </p>
                <Link href="/#contact" className="btn-primary mt-8">
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
