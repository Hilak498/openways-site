import Link from "next/link";
import { Logo } from "@/components/logo";
import { services, site } from "@/lib/site";

const legalLinks = [
  { href: "/privacy-policy", label: "מדיניות פרטיות" },
  { href: "/terms", label: "תנאי שימוש" },
  { href: "/accessibility-statement", label: "הצהרת נגישות" },
  { href: "/cookies", label: "מדיניות עוגיות" },
];

/** Light footer per the approved design (surface-container-highest). */
export function Footer() {
  return (
    <footer className="border-t border-navy-900/10 bg-sand-300 text-navy-800" role="contentinfo">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="dark-text" withTagline />
          <p className="mt-5 max-w-xs text-sm leading-7 text-navy-600">
            {site.description}
          </p>
        </div>

        <nav aria-label="שירותים">
          <h2 className="font-display text-sm font-bold tracking-widest text-gold-700">
            השירותים שלנו
          </h2>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-navy-700 transition hover:text-gold-700"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="מידע משפטי">
          <h2 className="font-display text-sm font-bold tracking-widest text-gold-700">
            מידע ומדיניות
          </h2>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-navy-700 transition hover:text-gold-700"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-bold tracking-widest text-gold-700">
            יצירת קשר
          </h2>
          <ul className="mt-4 space-y-3 text-[0.95rem] text-navy-700">
            <li>
              <a
                href={`tel:${site.phone}`}
                className="transition hover:text-gold-700"
                dir="ltr"
              >
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="transition hover:text-gold-700"
                dir="ltr"
              >
                {site.email}
              </a>
            </li>
            <li>
              {site.address.street}, {site.address.city}
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={`tel:${site.phone}`}
              aria-label="חיוג אלינו"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy-800 shadow-sm transition hover:scale-110 hover:bg-gold-400 hover:text-gold-ink"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.27a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2Z" />
              </svg>
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="שליחת אימייל"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy-800 shadow-sm transition hover:scale-110 hover:bg-gold-400 hover:text-gold-ink"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
            </a>
            <Link
              href="/#contact"
              aria-label="לטופס יצירת קשר"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy-800 shadow-sm transition hover:scale-110 hover:bg-gold-400 hover:text-gold-ink"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l2-5.2a8.4 8.4 0 1 1 16-4.3Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-900/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-sm text-navy-600 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. כל הזכויות שמורות.
          </p>
          <p>האמור באתר אינו מהווה ייעוץ פיננסי, משפטי או המלצה להשקעה.</p>
        </div>
      </div>
    </footer>
  );
}
