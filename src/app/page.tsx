import Link from "next/link";
import { AnimatedSection } from "@/components/animated-section";
import { AnimatedItem } from "@/components/animated-item";
import Image from "next/image";
import { ParallaxImage } from "@/components/parallax-image";
import { SiteLogo } from "@/components/site-logo";
import { ContactForm } from "@/components/contact-form";
import { ServiceCard } from "@/components/service-card";

const services = [
  {
    title: "ייעוץ עסקי",
    description:
      "אסטרטגיה, תכנון צמיחה, שיפור התנהלות, בניית תהליכים וייעוץ תפעולי שמסייע לעסקים לפעול בצורה חכמה יותר.",
    image: "/images/service-1.svg",
    bullets: ["ניתוח צרכים עסקיים", "תכנון צמיחה", "הנגשת פתרונות מעשיים"],
  },
  {
    title: "ייעוץ משכנתאות ליועצי משכנתאות",
    description:
      "תמיכה מקצועית ליועצי משכנתאות, שילוב של שוק, לוגיסטיקה, תהליכים וכולים שמחזקים את הייעוץ המסחרי והטכני.",
    image: "/images/service-2.svg",
    bullets: ["הכוונה מקצועית", "שיפור תהליכי עבודה", "הבנה מעמיקה של השוק"],
  },
  {
    title: "גיוס אשראי עסקי",
    description:
      "הכוונה למתן מענה פיננסי לעסקים, עם גישה ממוקדת למציאת מסלולי מימון, תיאום ציפיות ויצירת תשתית החלטה נכונה.",
    image: "/images/service-3.svg",
    bullets: ["זיהוי צרכים פיננסיים", "הצעת מסלולי מימון", "תיאום והכוונה"],
  },
];

const steps = [
  "הבנה מעמיקה של המצב העסקי והיעדים",
  "בניית תוכנית פעולה מותאמת",
  "הטמעת פתרונות והנגשת כלים מעשיים",
  "מעקב, התאמות ושיפור מתמשך",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="border-b border-transparent bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between py-5">
          <SiteLogo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <a href="#services" className="transition hover:text-slate-900">השירותים</a>
            <a href="#about" className="transition hover:text-slate-900">מי אנחנו</a>
            <a href="#contact" className="btn-outline">צור קשר</a>
          </nav>
        </div>
      </header>

      <section id="top" className="container mx-auto py-16">
        <div className="hero-primary container mx-auto rounded-xl p-8 lg:p-12 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <AnimatedSection stagger delay={0} forceMotion>
              <AnimatedItem>
                <p className="inline-flex items-center gap-3 rounded-full bg-amber-50/10 px-4 py-1 text-sm font-medium text-amber-300 w-fit">ייעוץ מקצועי, שקוף ופרקטי</p>
              </AnimatedItem>

              <AnimatedItem>
                <h1 className="mt-6 text-4xl leading-tight sm:text-5xl lg:text-6xl font-extrabold">Open Ways – החלטות פיננסיות מושכלות לעסקים ולמנחים במשכנתאות</h1>
              </AnimatedItem>

              <AnimatedItem>
                <p className="mt-6 max-w-2xl text-lg leading-8">אנחנו מאחדים שלוש זרועות מומחיות כדי לספק לכם מסלולים ברורים, מנותחים ומותאמים לשוק הישראלי.</p>
              </AnimatedItem>

              <AnimatedItem>
                <div className="mt-8 flex gap-4">
                  <a href="#contact" className="btn-cta">לקביעת פגישה</a>
                  <a href="#services" className="btn-outline">להכיר את השירותים</a>
                </div>
              </AnimatedItem>
            </AnimatedSection>
          </div>

          <div className="lg:col-span-5 hero-illustration">
            <AnimatedSection variant="revealLeft" delay={0.06} className="flex flex-col gap-6" forceMotion>
              <AnimatedItem>
                  <ParallaxImage src="/logo-light.svg" alt="Open Ways" className="mx-auto max-w-[360px]" intensity={6} />
                </AnimatedItem>

                <AnimatedItem>
                  <div className="card p-8">
                  <h3 className="text-lg font-semibold">מה מקבלים בבדיקה ראשונית</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li>• מפגש אבחון מקצועי</li>
                    <li>• מפת דרכים לפעולה</li>
                    <li>• הערכת שוק ומענה פיננסי ממוקד</li>
                  </ul>
                    <a href="#contact" className="mt-6 inline-block btn-primary">פנייה ראשונית</a>
                </div>
              </AnimatedItem>
            </AnimatedSection>
          </div>
        </div>
      </section>

        {/* Hero illustration below the fold for visual interest */}
        <section className="container mx-auto -mt-8 mb-12">
          <div className="container mx-auto">
            <AnimatedSection stagger className="flex justify-center" forceMotion>
              <AnimatedItem>
                <div className="w-full max-w-[900px] mx-auto">
                  <Image
                    src="/images/hero-optimized.svg"
                    alt="Hero illustration"
                    width={1200}
                    height={320}
                    className="w-full h-auto mx-auto rounded-lg shadow-lg"
                    placeholder="blur"
                    blurDataURL={require("@/lib/blurData").heroBlurDataURL}
                    priority
                  />
                </div>
              </AnimatedItem>
            </AnimatedSection>
          </div>
        </section>

      <section id="services" className="container mx-auto py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">השירותים שלנו</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">פתרונות מקצועיים לכל שלב</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">כל שירות נבנה מתוך הבנה של הצורך העסקי האמיתי, עם גישה מעשית ופרקטית.</p>
        </div>

        <AnimatedSection stagger className="grid gap-6 lg:grid-cols-3" forceMotion>
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              bullets={service.bullets}
              image={service.image}
              href={service.title === "ייעוץ עסקי" ? "/services/business-advisory" : service.title === "ייעוץ משכנתאות ליועצי משכנתאות" ? "/services/mortgage-advisory" : "/services/business-credit"}
            />
          ))}
        </AnimatedSection>
      </section>

      <section id="about" className="container mx-auto py-12">
        <AnimatedSection stagger className="grid gap-8 lg:grid-cols-2" forceMotion>
          <AnimatedItem>
            <h2 className="text-3xl font-semibold text-slate-900">מבט רחב, מענה מדויק</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Open Ways נותנת מענה מקצועי שמחבר בין ההיבטים העסקיים, הפיננסיים והפרקטיים – בצורה שקופה וממוקדת תוצאה.</p>
          </AnimatedItem>

          <AnimatedItem>
            <div className="rounded-2xl bg-amber-50 p-6">
              <h3 className="font-semibold">גישה מותאמת אישית</h3>
              <p className="mt-2 text-sm text-slate-700">אנחנו מבצעים אבחון מעמיק ומציעים פתרונות הניתנים ליישום בזמן אמת.</p>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      </section>

      <section id="contact" className="container mx-auto py-16">
        <AnimatedSection stagger className="grid gap-8 lg:grid-cols-2" forceMotion>
          <AnimatedItem>
            <h2 className="text-3xl font-semibold text-slate-900">נשמח להכיר אתכם ולעזור לבחור את הדרך הנכונה</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">מוזמנים לפנות אלינו לשיחה ראשונית ללא התחייבות.</p>
          </AnimatedItem>

          <AnimatedItem>
            <div className="max-w-md"><ContactForm /></div>
          </AnimatedItem>
        </AnimatedSection>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="container mx-auto flex flex-col gap-4 py-8 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 Open Ways. כל הזכויות שמורות.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy" className="transition hover:text-slate-900">מדיניות פרטיות</Link>
            <Link href="/cookies" className="transition hover:text-slate-900">מדיניות עוגיות</Link>
            <Link href="/terms" className="transition hover:text-slate-900">תנאים והגבלות</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
