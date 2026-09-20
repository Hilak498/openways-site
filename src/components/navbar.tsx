"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoLink } from "@/components/logo";
import { calculatorLinks, mortgageTracks, services } from "@/lib/site";

interface NavLink {
  href: string;
  label: string;
  /** תת-קישורים הנפתחים במעבר עכבר (דסקטופ) ומוצגים מוזחים בתפריט הנייד */
  children?: readonly { href: string; label: string }[];
}

// סדר הקישורים לפי הלוגו: נעים להכיר → ייעוץ עסקי → ייעוץ משכנתאות →
// גיוס אשראי עסקי → בלוג ומאמרים → מחשבונים (סדר השירותים נגזר מ-lib/site.ts)
const navLinks: NavLink[] = [
  { href: "/about", label: "נעים להכיר" },
  ...services.map((s) => ({
    href: `/services/${s.slug}`,
    label: s.name,
    children: s.slug === "mortgage-advisory" ? mortgageTracks : undefined,
  })),
  { href: "/blog", label: "בלוג ומאמרים" },
  { href: calculatorLinks[0].href, label: "מחשבונים", children: calculatorLinks },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // התפריט הנפתח מנוהל ב-state ולא ב-CSS בלבד: אחרי לחיצה על פריט הוא נסגר,
  // ולא נשאר תקוע פתוח בגלל :focus-within על הקישור שנלחץ.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // ניווט לעמוד אחר סוגר כל תפריט שנשאר פתוח
  useEffect(() => {
    setOpenMenu(null);
    setOpen(false);
  }, [pathname]);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <header
      className={`on-dark fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled || open ? "shadow-card" : "shadow-sm"
      }`}
    >
      <nav aria-label="ניווט ראשי" className="container-site">
        <div className="flex h-20 items-center justify-between py-3">
          <LogoLink variant="light-text" imgClassName="h-13 w-auto" />

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.children?.some((c) => pathname === c.href.split("#")[0]) ??
                  false);
              return (
                <li
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setOpenMenu(link.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setOpenMenu(null);
                    }
                  }}
                >
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={link.children ? openMenu === link.label : undefined}
                    onFocus={() => link.children && setOpenMenu(link.label)}
                    onClick={() => setOpenMenu(null)}
                    className={`rounded-md text-[0.95rem] font-medium underline-offset-8 transition-all duration-200 ${
                      active
                        ? "border-b-2 border-gold-300 pb-1 text-gold-300"
                        : "text-white/80 hover:font-semibold hover:text-gold-300 hover:underline hover:decoration-gold-400 hover:decoration-2"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.children ? (
                    /* נפתח במעבר עכבר או בפוקוס מקלדת; pt יוצר גשר רציף להעברת העכבר */
                    <div
                      className={`absolute top-full right-0 z-50 pt-4 transition duration-200 ${
                        openMenu === link.label
                          ? "visible opacity-100"
                          : "invisible opacity-0"
                      }`}
                    >
                      <ul className="w-72 rounded-2xl border border-white/10 bg-navy-800 p-3 shadow-card">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={(e) => {
                                setOpenMenu(null);
                                e.currentTarget.blur();
                              }}
                              className="block rounded-xl px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-gold-300/15 hover:text-gold-300"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
            <li>
              <Link href="/#contact" className="btn-primary !px-6 !py-2.5 text-sm">
                לתיאום פגישת ייעוץ
              </Link>
            </li>
          </ul>

          {/* Mobile: CTA + hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link
              href="/#contact"
              className="btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex"
            >
              לתיאום פגישה
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white transition hover:bg-white/10"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          hidden={!open}
          className="border-t border-white/10 pb-6 lg:hidden"
        >
          <ul className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-3 text-lg font-medium transition hover:bg-gold-300/15 hover:text-gold-300 ${
                    pathname === link.href ? "text-gold-300" : "text-white"
                  }`}
                >
                  {link.label}
                </Link>
                {link.children ? (
                  <ul className="mr-4 flex flex-col gap-1">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-3 py-2 text-base font-medium text-white/75 transition hover:bg-gold-300/15 hover:text-gold-300"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
            <li className="mt-3 px-3">
              <Link href="/#contact" onClick={() => setOpen(false)} className="btn-primary w-full">
                לתיאום פגישת ייעוץ
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
