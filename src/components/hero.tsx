import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { Hero3D } from "@/components/hero-3d";

/**
 * Hero per the approved Stitch design: photo backdrop under a navy overlay,
 * copy on the right, and a tilted glass photo card with a floating stat
 * overlay on the left. public/images/hero-bg.jpg powers both layers.
 */
const HERO_BG = "/images/hero-sunset.jpg";
const heroBgExists = existsSync(
  path.join(process.cwd(), "public", "images", "hero-sunset.jpg"),
);

export function Hero() {
  return (
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
          {/* Navy overlay keeps the text AA-readable over the photo */}
          <div aria-hidden="true" className="absolute inset-0 bg-navy-900/85" />
        </>
      ) : null}

      {/* Ambient glow blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-12 h-[500px] w-[500px] rounded-full bg-gold-300/10 blur-[100px]"
      />

      <div className="container-site relative grid min-h-[90svh] items-center gap-14 pt-32 pb-20 md:grid-cols-2 md:gap-8">
        {/* Copy */}
        <div className="relative z-10 space-y-8">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-gold-400/10 px-4 py-1.5 text-sm font-medium text-gold-300 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              ייעוץ עסקי · גיוס אשראי · משכנתאות
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="max-w-2xl text-4xl leading-[1.2] font-bold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              פותחים לכם דרך
              <br />
              <span className="text-gold-300">להחלטות פיננסיות נכונות</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="max-w-xl text-lg leading-8 text-white/90">
              Open Ways מלווה עסקים ומשקי בית בצמתים הפיננסיים החשובים באמת:
              אסטרטגיה עסקית, גיוס אשראי בתנאים מיטביים ומשכנתא חכמה - בשקיפות
              מלאה ובאחריות אישית לתוצאה.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="flex flex-wrap items-center gap-4 pt-2">
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
        </div>

        {/* Tilted glass photo card with floating stat (per the design),
            over the 3D golden-ribbons layer */}
        <Reveal delay={0.2} className="relative z-10 hidden md:block">
          <Hero3D className="absolute -inset-20 -z-10" />
          <div className="glass-dark relative rotate-2 !rounded-[2.5rem] p-4 shadow-lift transition-transform duration-500 hover:rotate-0">
            <div className="relative h-[440px] w-full overflow-hidden rounded-[2rem] lg:h-[520px]">
              <Image
                src={heroBgExists ? HERO_BG : "/logo-dark-bg.png"}
                alt="דרכים נפתחות - Open Ways"
                fill
                priority
                sizes="(min-width: 768px) 45vw, 100vw"
                className={heroBgExists ? "object-cover" : "object-contain p-10"}
              />
            </div>
          </div>
          {/* Stats overlay */}
          <div className="glass-dark absolute -bottom-6 -left-6 z-20 !rounded-2xl border-white/30 p-6 shadow-lift backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-display text-2xl font-bold text-gold-300">‏₪120M+</p>
                <p className="text-sm text-white/90">אשראי שגויס ללקוחותינו</p>
                {/* TODO: נתון אמיתי */}
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-300/25 text-gold-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m22 7-8.5 8.5-5-5L2 17" />
                  <path d="M16 7h6v6" />
                </svg>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
