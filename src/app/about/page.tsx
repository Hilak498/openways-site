import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "נעים להכיר",
  description:
    "נעים להכיר את Open Ways Group: מי אנחנו, מי מוביל את החברה, ומה החזון והערכים שמנחים אותנו בייעוץ עסקי, ייעוץ משכנתאות וגיוס אשראי עסקי.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "נעים להכיר - Open Ways Group",
    description:
      "מי אנחנו, מי מוביל את החברה ומה החזון והערכים שמנחים אותנו.",
    url: "/about",
    type: "website",
    locale: "he_IL",
  },
};

// TODO: להשלים ביוגרפיה מלאה של הבעלים ולהעלות תמונה ל-public/images/owner.jpg
const owner = {
  name: "אושרי קירשנפלד",
  role: 'מנכ"ל ובעלים',
  bio: [
    "אושרי קירשנפלד, המנכ\"ל והבעלים של Open Ways Group, מגיע עם רקע בנקאי רחב וניסיון מוכח בייעוץ עסקי, בייעוץ משכנתאות ובגיוס אשראי עסקי.",
    "אחרי שנים \"בצד השני של השולחן\", אושרי יודע בדיוק איך מתקבלות ההחלטות אצל הבנקים ואצל מאשרי האשראי - וידע הזה עומד לרשות כל לקוח וכל תיק שיוצא מאיתנו.",
    "את Open Ways הקים מתוך אמונה פשוטה: כשמלווים אנשים ועסקים במקצועיות, בשקיפות ובאחריות אישית - נפתחות אפשרויות חדשות בדרך להחלטות הנכונות.",
  ],
};

const values = [
  {
    title: "מקצועיות בלתי מתפשרת",
    description:
      "ידע מעמיק ומתעדכן בבנקאות, במימון ובליווי עסקי - כל המלצה מגובה בנתונים ובניסיון מהשטח.",
  },
  {
    title: "שקיפות מלאה",
    description:
      "עלויות ידועות מראש, תוכנית עבודה כתובה ועדכונים שוטפים - בלי אותיות קטנות ובלי הפתעות.",
  },
  {
    title: "אחריות אישית",
    description:
      "יועץ אחד מלווה אתכם מההתחלה ועד התוצאה - זמין, מחויב ואחראי לכל שלב בדרך.",
  },
  {
    title: "יצירתיות בפתרונות",
    description:
      "כשדרך אחת נחסמת, אנחנו מוצאים את הדרך הבאה - פתרונות מגוונים המותאמים בדיוק לצורך שלכם.",
  },
];

const HERO_BG = "/images/hero-bg.jpg";

export default function AboutPage() {
  const heroBgExists = existsSync(
    path.join(process.cwd(), "public", "images", "hero-bg.jpg"),
  );
  const ownerPhotoExists = existsSync(
    path.join(process.cwd(), "public", "images", "owner.jpg"),
  );

  return (
    <>
      {/* Hero */}
      <section className="on-dark hero-navy relative isolate overflow-hidden text-white">
        {heroBgExists ? (
          <>
            <Image
              src={HERO_BG}
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
              <li aria-current="page" className="font-semibold text-gold-300">
                נעים להכיר
              </li>
            </ol>
          </nav>
          <Reveal>
            <h1 className="mt-10 max-w-2xl text-4xl leading-[1.2] font-bold tracking-normal sm:text-5xl">
              נעים להכיר -
              <br />
              <span className="text-gold-300">Open Ways Group</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
              חברת ייעוץ עסקי ופיננסי המלווה עסקים ומשקי בית בשלוש מחלקות:
              ייעוץ עסקי, ייעוץ משכנתאות וגיוס אשראי עסקי - במקצועיות, בשקיפות
              ובאחריות אישית לתוצאה.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Owner */}
      <section className="py-24">
        <div className="container-site grid items-start gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="card relative overflow-hidden !rounded-[2.5rem] p-2 shadow-lift">
              {ownerPhotoExists ? (
                <div className="relative h-[440px] w-full overflow-hidden rounded-[2rem]">
                  <Image
                    src="/images/owner.jpg"
                    alt={`${owner.name}, ${owner.role} של Open Ways Group`}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                /* Placeholder עד להעלאת תמונת הבעלים ל-public/images/owner.jpg */
                <div className="flex h-[440px] w-full items-center justify-center rounded-[2rem] bg-sand-100">
                  <LogoMark className="h-32 w-auto opacity-60" />
                </div>
              )}
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">מי מוביל את הדרך</p>
              <h2 className="mt-3 text-3xl font-extrabold text-navy-800 sm:text-4xl">
                {owner.name}
              </h2>
              <p className="mt-2 text-lg font-semibold text-gold-700">{owner.role}</p>
            </Reveal>
            <div className="mt-7 space-y-5">
              {owner.bio.map((p, i) => (
                <Reveal key={i} delay={0.05 * (i + 1)}>
                  <p className="text-lg leading-8 text-navy-600">{p}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <Link href="/#contact" className="btn-primary mt-9 !px-8 !py-4">
                בואו נכיר
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="on-dark hero-navy py-24 text-white">
        <div className="container-site">
          <SectionHeading
            onDark
            eyebrow="החזון שלנו"
            title="יוצרים אפשרויות בדרך להחלטות עסקיות ופיננסיות נכונות"
            description="אנחנו מאמינים שלכל עסק ולכל משפחה מגיעה דרך פתוחה קדימה: החלטות פיננסיות גדולות לא צריכות להתקבל לבד, בערפל או תחת לחץ. התפקיד שלנו הוא לפתוח בפניכם את מגוון האפשרויות, להנגיש את הידע - וללוות אתכם עד לתוצאה."
          />
        </div>
      </section>

      {/* Values */}
      <section className="bg-sand-50 py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="הערכים שלנו"
            title="הסטנדרטים שמנחים אותנו בכל תיק"
          />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <Reveal key={value.title} as="li" delay={i * 0.08} className="h-full">
                <div className="card card-hover h-full p-8">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/25 font-display text-lg font-bold text-gold-700"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-navy-800">{value.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-navy-600">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
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
                <h2 className="text-3xl font-bold sm:text-4xl">רוצים להכיר מקרוב?</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/90">
                  שיחת היכרות ראשונית - ללא עלות וללא התחייבות. נשמח לשמוע לאן
                  אתם רוצים להגיע, ולהראות איך נפתח לכם את הדרך.
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
