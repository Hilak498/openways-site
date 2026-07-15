import Link from "next/link";
import { Logo } from "@/components/logo";
import { services, site } from "@/lib/site";

const legalLinks = [
  { href: "/privacy-policy", label: "מדיניות פרטיות" },
  { href: "/terms", label: "תנאי שימוש" },
  { href: "/accessibility-statement", label: "הצהרת נגישות" },
  { href: "/cookies", label: "מדיניות עוגיות" },
];

export function Footer() {
  return (
    <footer className="on-dark bg-navy-900 text-white" role="contentinfo">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="light-text" withTagline />
          <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
            {site.description}
          </p>
        </div>

        <nav aria-label="שירותים">
          <h2 className="text-sm font-bold tracking-widest text-gold-400">
            השירותים שלנו
          </h2>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-white/80 transition hover:text-gold-300"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="מידע משפטי">
          <h2 className="text-sm font-bold tracking-widest text-gold-400">מידע ומדיניות</h2>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-white/80 transition hover:text-gold-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold tracking-widest text-gold-400">יצירת קשר</h2>
          <ul className="mt-4 space-y-3 text-[0.95rem] text-white/80">
            <li>
              <a
                href={`tel:${site.phone}`}
                className="transition hover:text-gold-300"
                dir="ltr"
              >
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="transition hover:text-gold-300"
                dir="ltr"
              >
                {site.email}
              </a>
            </li>
            <li>
              {site.address.street}, {site.address.city}
            </li>
          </ul>
          <Link href="/#contact" className="btn-primary mt-6 !px-5 !py-2.5 text-sm">
            לתיאום פגישת ייעוץ
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-sm text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. כל הזכויות שמורות.
          </p>
          <p>
            האמור באתר אינו מהווה ייעוץ פיננסי, משפטי או המלצה להשקעה.
          </p>
        </div>
      </div>
    </footer>
  );
}
