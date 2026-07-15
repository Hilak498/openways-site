import Link from "next/link";
import { Hero3D } from "@/components/hero-3d";
import { LogoVideo } from "@/components/logo-video";
import { Reveal } from "@/components/reveal";

const stats = [
  { value: "‏15+ שנות ניסיון", label: "בייעוץ פיננסי ועסקי" }, // TODO: נתון אמיתי
  { value: "‏350+ לקוחות", label: "עסקים ומשקי בית" }, // TODO: נתון אמיתי
  { value: "‏₪120M+", label: "אשראי שגויס ללקוחותינו" }, // TODO: נתון אמיתי
];

export function Hero() {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-navy-900 text-white">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(1000px_520px_at_82%_-10%,rgba(185,153,95,0.14),transparent),radial-gradient(700px_420px_at_8%_110%,rgba(185,153,95,0.08),transparent)]"
      />

      <div className="container-site relative grid min-h-[92svh] items-center gap-14 pt-32 pb-20 lg:grid-cols-12 lg:gap-8">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-7">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-300">
              <span
                className="h-1.5 w-1.5 rounded-full bg-gold-400"
                aria-hidden="true"
              />
              ייעוץ עסקי · גיוס אשראי · משכנתאות
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-2xl text-4xl leading-[1.15] font-extrabold sm:text-5xl lg:text-[3.4rem]">
              פותחים לכם דרך
              <span className="text-gold-400"> להחלטות פיננסיות נכונות</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              Open Ways מלווה עסקים ומשקי בית בצמתים הפיננסיים החשובים באמת:
              אסטרטגיה עסקית, גיוס אשראי בתנאים מיטביים ומשכנתא חכמה — בשקיפות
              מלאה ובאחריות אישית לתוצאה.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/#contact" className="btn-primary">
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
              <Link href="/#services" className="btn-ghost-dark">
                להכיר את השירותים
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-sm text-white/55">{s.label}</dt>
                  <dd className="text-lg font-bold text-gold-300 sm:text-xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Focal: animated logo over the 3D network */}
        <div className="relative z-10 hidden min-h-[420px] lg:col-span-5 lg:block">
          <Hero3D className="absolute -inset-16" />
          <Reveal delay={0.2} className="relative flex h-full items-center justify-center">
            <div className="glass-dark flex aspect-square w-full max-w-[400px] items-center justify-center p-10 shadow-soft">
              <LogoVideo className="h-full w-full" />
            </div>
          </Reveal>
        </div>

        {/* Mobile: logo animation without the 3D layer */}
        <Reveal className="relative z-10 lg:hidden">
          <div className="glass-dark mx-auto flex aspect-[4/3] w-full max-w-sm items-center justify-center p-8">
            <LogoVideo className="h-full w-full" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
