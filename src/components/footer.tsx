import Link from "next/link";
import { Logo } from "@/components/logo";
import { mortgageTracks, services, site, socials } from "@/lib/site";

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
              <li
                key={s.slug}
                className={s.slug === "mortgage-advisory" ? "group" : undefined}
              >
                <Link
                  href={`/services/${s.slug}`}
                  className="text-navy-700 transition hover:text-gold-700"
                >
                  {s.name}
                </Link>
                {s.slug === "mortgage-advisory" ? (
                  /* Hover reveals the two mortgage tracks (focus-within keeps it keyboard-accessible) */
                  <ul className="hidden space-y-2 pt-2 pr-4 text-sm group-focus-within:block group-hover:block">
                    {mortgageTracks.map((track) => (
                      <li key={track.href}>
                        <Link
                          href={track.href}
                          className="text-navy-600 transition hover:text-gold-700"
                        >
                          {track.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
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
              {site.address.street} {site.address.zip}
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
            {socials.map((s) => (
              <a
                key={s.icon}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy-800 shadow-sm transition hover:scale-110 hover:bg-gold-400 hover:text-gold-ink"
              >
                {s.icon === "facebook" ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                ) : s.icon === "instagram" ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                    <path d="M17.5 6.5h.01" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22.5 8.2a3 3 0 0 0-2.1-2.1C18.6 5.6 12 5.6 12 5.6s-6.6 0-8.4.5A3 3 0 0 0 1.5 8.2 31 31 0 0 0 1 12a31 31 0 0 0 .5 3.8 3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-3.8Z" />
                    <path d="m9.8 15 5.4-3-5.4-3v6Z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-navy-900/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-sm text-navy-600 sm:flex-row">
          <p>
            © {new Date().getFullYear()} כל הזכויות שמורות לחברת Open Ways Group.
          </p>
          <p>האמור באתר אינו מהווה ייעוץ עסקי, ייעוץ פיננסי, משפטי או המלצה להשקעה.</p>
        </div>
      </div>
    </footer>
  );
}
