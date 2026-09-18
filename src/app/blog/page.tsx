import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "בלוג ומאמרים",
  description:
    "מאמרים וטיפים מעשיים בייעוץ עסקי, ייעוץ משכנתאות וגיוס אשראי עסקי - מהשטח, בלי סיסמאות.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `בלוג ומאמרים | ${site.name}`,
    description:
      "מאמרים וטיפים מעשיים בייעוץ עסקי, ייעוץ משכנתאות וגיוס אשראי עסקי.",
    url: "/blog",
    type: "website",
    locale: "he_IL",
  },
};

/**
 * רשימת המאמרים. כל עוד היא ריקה, העמוד מציג מצב "בקרוב" מסודר במקום
 * רשת ריקה. להוספת מאמר: להוסיף כאן פריט עם קישור לעמוד המאמר.
 * TODO: לחבר לתוכן האמיתי (ספריית התוכן השיווקי שהוכנה לארבעת תחומי הפעילות).
 */
const posts: {
  title: string;
  excerpt: string;
  href: string;
  category: string;
  date: string;
}[] = [];

export default function BlogPage() {
  return (
    <>
      <section className="on-dark hero-navy relative isolate overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-12 h-[400px] w-[400px] rounded-full bg-gold-300/10 blur-[100px]"
        />
        <div className="container-site relative pt-36 pb-20">
          <Reveal>
            <p className="eyebrow !text-gold-300">בלוג ומאמרים</p>
            <h1 className="mt-3 max-w-2xl text-4xl leading-[1.2] font-bold sm:text-5xl">
              מה שכדאי לדעת <span className="text-gold-300">לפני שמחליטים</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
              מאמרים וטיפים מעשיים מהשטח - על ייעוץ עסקי, משכנתאות וגיוס אשראי.
              בלי סיסמאות, בלי הבטחות: מה שבאמת משפיע על ההחלטה שלכם.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24">
        <div className="container-site">
          {posts.length > 0 ? (
            <ul className="grid gap-8 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.href} as="li" delay={i * 0.08} className="h-full">
                  <article className="card card-hover group relative flex h-full flex-col p-8">
                    <p className="text-sm font-semibold text-gold-700">
                      {post.category}
                    </p>
                    <h2 className="mt-3 text-xl font-bold text-navy-800">
                      {post.title}
                    </h2>
                    <p className="mt-3 flex-1 leading-7 text-navy-600">
                      {post.excerpt}
                    </p>
                    <Link
                      href={post.href}
                      className="mt-6 inline-flex items-center gap-2 font-bold text-gold-700 after:absolute after:inset-0 after:content-['']"
                    >
                      לקריאה
                    </Link>
                  </article>
                </Reveal>
              ))}
            </ul>
          ) : (
            <>
              <SectionHeading
                eyebrow="בקרוב"
                title="המאמרים הראשונים בדרך"
                description="אנחנו כותבים עכשיו את הסדרה הראשונה. בינתיים, אם יש שאלה שמעסיקה אתכם - אפשר פשוט לשאול אותנו ישירות."
              />
              <Reveal delay={0.1}>
                <div className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-4">
                  <Link href="/#contact" className="btn-primary !px-8 !py-4">
                    שאלו אותנו
                  </Link>
                  <Link href="/#services" className="btn-dark !px-8 !py-4">
                    להכיר את השירותים
                  </Link>
                </div>
              </Reveal>
            </>
          )}
        </div>
      </section>
    </>
  );
}
