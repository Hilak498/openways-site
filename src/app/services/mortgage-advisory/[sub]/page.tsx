import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { CheckList } from "@/components/check-list";
import { Faq } from "@/components/faq";
import { RelatedLinks } from "@/components/related-links";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, faqSchema, subServiceSchema } from "@/lib/schema";
import { getMortgageSubpage, getService, mortgageSubpages } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

/** Mortgage sub-pages (self-build, rural); content lives in mortgageSubpages. */
export const dynamicParams = false;

export function generateStaticParams() {
  return mortgageSubpages.map((p) => ({ sub: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/mortgage-advisory/[sub]">): Promise<Metadata> {
  const { sub } = await params;
  const page = getMortgageSubpage(sub);
  if (!page) return {};
  return pageMetadata({
    path: `/services/mortgage-advisory/${page.slug}`,
    title: page.metaTitle,
    description: page.metaDescription,
    image: { url: "/og/service-mortgage-advisory.png", alt: page.name },
  });
}

export default async function MortgageSubpage({
  params,
}: PageProps<"/services/mortgage-advisory/[sub]">) {
  const { sub } = await params;
  const page = getMortgageSubpage(sub);
  if (!page) notFound();

  const path = `/services/mortgage-advisory/${page.slug}`;
  const mortgage = getService("mortgage-advisory")!;
  const sibling = mortgageSubpages.find((p) => p.slug !== page.slug);
  const related = [
    { href: "/services/mortgage-advisory", label: mortgage.name, description: mortgage.tagline },
    ...(sibling
      ? [{ href: `/services/mortgage-advisory/${sibling.slug}`, label: sibling.name }]
      : []),
    { href: "/calculators/mortgage", label: "מחשבון משכנתה", cta: "למחשבון" },
  ];

  return (
    <>
      <JsonLd data={subServiceSchema(page.name, page.metaDescription, path)} />
      <JsonLd
        data={breadcrumbSchema([
          ["ראשי", ""],
          [mortgage.name, "/services/mortgage-advisory"],
          [page.name, path],
        ])}
      />
      <JsonLd data={faqSchema(page.faq)} />

      {/* Hero */}
      <section className="on-dark hero-navy relative isolate overflow-hidden text-white">
        <Image
          src={page.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          aria-hidden="true"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-navy-900/85" />
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
                  {mortgage.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-gold-300">
                {page.name}
              </li>
            </ol>
          </nav>

          <Reveal className="mt-10 max-w-3xl">
            <h1 className="text-4xl leading-[1.2] font-bold sm:text-5xl">{page.h1}</h1>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/#contact" className="btn-primary !px-8 !py-4">
                לתיאום פגישת ייעוץ
              </Link>
              <a href="#faq" className="btn-ghost-dark !px-8 !py-4">
                שאלות נפוצות
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Content */}
      <section className="py-24">
        <div className="container-site max-w-3xl space-y-14">
          {page.sections.map((section, i) => (
            <Reveal key={section.title} delay={i * 0.05}>
              <h2 className="text-2xl font-bold text-navy-800 sm:text-3xl">{section.title}</h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-5 text-lg leading-8 text-navy-600">
                  {p}
                </p>
              ))}
              {section.items ? <CheckList items={section.items} /> : null}
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 bg-sand-100 py-24">
        <div className="container-site">
          <SectionHeading eyebrow="שאלות נפוצות" title={`שאלות על ${page.name}`} />
          <div className="mt-12">
            <Faq items={page.faq} />
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
                <h2 className="text-3xl font-bold sm:text-4xl">{page.cta.title}</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/90">
                  {page.cta.text}
                </p>
                <Link href="/#contact" className="btn-primary mt-8 !px-8 !py-4">
                  לתיאום שיחה
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-site max-w-5xl">
          <RelatedLinks links={related} />
        </div>
      </section>
    </>
  );
}
