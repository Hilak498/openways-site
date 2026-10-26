import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { StarDialButton } from "@/components/star-dial-button";
import { RelatedLinks, type RelatedLink } from "@/components/related-links";
import { formatPostDate, getPost, getPosts, postUrl } from "@/lib/blog";
import { site } from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";

// Articles in the feed at build time are prerendered; newer ones are rendered
// on first visit and cached. Both regenerate in the background hourly.
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const url = `/blog/${encodeURIComponent(post.slug)}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: pageOpenGraph(url, post.title, post.excerpt, {
      type: "article",
      publishedTime: post.date,
      authors: [author.name],
      ...(post.image ? { images: [{ url: post.image, alt: post.title }] } : {}),
    }),
    twitter: {
      card: post.image ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : undefined,
    },
  };
}

// כל המאמרים קשורים לאשראי עסקי, חוץ ממה שממופה כאן לשירות אחר
const advisoryArticles = new Set(["improve-business-profitability"]);

function relatedFor(slug: string): RelatedLink[] {
  if (advisoryArticles.has(slug)) {
    return [{ href: "/services/business-advisory", label: "ייעוץ עסקי", description: "אבחון, תוכנית עבודה וליווי ביישום." }];
  }
  return [
    { href: "/services/business-credit", label: "גיוס אשראי עסקי", description: "המימון הנכון לעסק, בתנאים הנכונים." },
    { href: "/calculators/business-credit", label: "מחשבון גיוס אשראי", description: "החזר חודשי ועלות כוללת של הלוואה לעסק.", cta: "למחשבון" },
  ];
}

const author = {
  name: "אושרי קירשנפלד",
  role: "מייסד Open Ways Group",
  bio: "כעשור בבנקאות, בתחומי האשראי המסחרי והמשכנתאות, ובעל תואר MBA. מלווה עסקים ומשקי בית בהחלטות פיננסיות, מגיוס אשראי ועד אסטרטגיה עסקית.",
};

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = postUrl(post.slug);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.excerpt,
    image: post.image ? [post.image] : [`${site.url}/og.png`],
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "he-IL",
    author: {
      "@type": "Person",
      name: author.name,
      jobTitle: author.role,
      url: `${site.url}/about`,
      sameAs: [site.linkedin],
    },
    publisher: { "@id": `${site.url}/#organization` },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "דף הבית", item: site.url },
      { "@type": "ListItem", position: 2, name: "בלוג ומאמרים", item: `${site.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <article>
        <header className="on-dark hero-navy relative isolate overflow-hidden text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-12 h-[400px] w-[400px] rounded-full bg-gold-300/10 blur-[100px]"
          />
          <div className="container-site relative max-w-4xl pt-36 pb-16">
            <nav aria-label="פירורי לחם" className="text-sm text-white/80">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition hover:text-gold-300">
                    דף הבית
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="transition hover:text-gold-300">
                    בלוג ומאמרים
                  </Link>
                </li>
              </ol>
            </nav>
            <h1 className="mt-6 text-3xl leading-[1.25] font-bold sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/85">
              <span>{author.name}</span>
              <span aria-hidden="true" className="text-gold-300">·</span>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </p>
          </div>
        </header>

        <div className="container-site max-w-4xl py-16">
          {post.image ? (
            <div className="relative -mt-4 mb-12 aspect-[16/9] w-full overflow-hidden rounded-[2rem] shadow-lift">
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div
            className="prose-article"
            // Sanitized with an allow-list in lib/blog.ts before it gets here
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <RelatedLinks links={relatedFor(post.slug)} className="mt-16" />

          {/* About the author */}
          <aside
            aria-labelledby="author-heading"
            className="card mt-16 flex flex-col gap-6 p-8 sm:flex-row sm:items-center"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-gold-300/40">
              <Image
                src="/images/owner.jpg"
                alt={author.name}
                fill
                sizes="6rem"
                className="object-cover"
              />
            </div>
            <div>
              <p className="eyebrow !text-base">על הכותב</p>
              <h2 id="author-heading" className="mt-1 text-2xl font-bold text-navy-800">
                {author.name}
              </h2>
              <p className="font-semibold text-gold-700">{author.role}</p>
              <p className="mt-3 leading-7 text-navy-600">{author.bio}</p>
              <Link
                href="/about"
                className="mt-4 inline-flex items-center gap-2 font-bold text-gold-700 underline underline-offset-4"
              >
                עוד על אושרי ועל Open Ways
              </Link>
            </div>
          </aside>
        </div>
      </article>

      {/* Call to action */}
      <section className="on-dark hero-navy relative overflow-hidden py-20 text-white">
        <div className="container-site max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            רוצים לבדוק מה נכון <span className="text-gold-300">לעסק שלכם?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/90">
            שיחת היכרות ראשונית, ללא עלות וללא התחייבות. נחזור אליכם בתוך יום עסקים.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/#contact" className="btn-primary !px-8 !py-4">
              לתיאום שיחת ייעוץ
            </Link>
            <StarDialButton className="btn-ghost-dark !px-8 !py-4" />
          </div>
        </div>
      </section>
    </>
  );
}
