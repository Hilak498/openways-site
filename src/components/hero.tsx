import Link from "next/link";
import { Hero3D } from "@/components/hero-3d";
import { LogoVideo } from "@/components/logo-video";
import { Reveal } from "@/components/reveal";

const stats = [
  { value: "‏15+", label: "שנות ניסיון" }, // TODO: נתון אמיתי
  { value: "‏350+", label: "לקוחות מרוצים" }, // TODO: נתון אמיתי
  { value: "‏₪120M+", label: "אשראי שגויס" }, // TODO: נתון אמיתי
];

export function Hero() {
  return (
    <section className="on-dark hero-navy relative isolate overflow-hidden text-white">
      {/* Ambient glow blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-12 h-[500px] w-[500px] rounded-full bg-gold-300/10 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-12 h-[400px] w-[400px] rounded-full bg-white/5 blur-[100px]"
      />

      <div className="container-site relative grid min-h-[90svh] items-center gap-14 pt-32 pb-20 lg:grid-cols-12 lg:gap-8">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-7">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-gold-400/10 px-4 py-1.5 text-sm font-medium text-gold-300 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              ייעוץ עסקי · גיוס אשראי · משכנתאות
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-2xl text-4xl leading-[1.2] font-bold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              פותחים לכם דרך
              <span className="text-gold-300"> להחלטות פיננסיות נכונות</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              Open Ways מלווה עסקים ומשקי בית בצמתים הפיננסיים החשובים באמת:
              אסטרטגיה עסקית, גיוס אשראי בתנאים מיטביים ומשכנתא חכמה — בשקיפות
              מלאה ובאחריות אישית לתוצאה.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/#contact" className="btn-primary !px-8 !py-4">
                לתיאום פגישת ייעוץ
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="-scale-x-100"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link href="/#services" className="btn-ghost-dark !px-8 !py-4">
                להכיר את השירותים
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-sm text-white/70">{s.label}</dt>
                  <dd className="font-display text-xl font-bold text-gold-300 sm:text-2xl">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Focal: animated logo in a tilted glass card over the 3D network */}
        <div className="relative z-10 hidden min-h-[440px] lg:col-span-5 lg:block">
          <Hero3D className="absolute -inset-16" />
          <Reveal delay={0.2} className="relative flex h-full items-center justify-center">
            <div className="glass-dark flex aspect-square w-full max-w-[400px] rotate-2 items-center justify-center !rounded-[2.5rem] p-10 shadow-lift transition-transform duration-500 hover:rotate-0">
              <LogoVideo className="h-full w-full" />
            </div>
          </Reveal>
        </div>

        {/* Mobile: logo animation without the 3D layer */}
        <Reveal className="relative z-10 lg:hidden">
          <div className="glass-dark mx-auto flex aspect-[4/3] w-full max-w-sm items-center justify-center !rounded-[2rem] p-8">
            <LogoVideo className="h-full w-full" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
