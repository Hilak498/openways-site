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
// גיוס אשראי עסקי → למה אנחנו → מחשבונים (סדר השירותים נגזר מ-lib/site.ts)
const navLinks: NavLink[] = [
  { href: "/about", label: "נעים להכיר" },
  ...services.map((s) => ({
    href: `/services/${s.slug}`,
    label: s.name,
    children: s.slug === "mortgage-advisory" ? mortgageTracks : undefined,
  })),
  { href: "/#why-us", label: "למה אנחנו" },
  { href: calculatorLinks[0].href, label: "מחשבונים", children: calculatorLinks },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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
      className={`fixed inset-x-0 top-0 z-50 border-b border-navy-900/10 bg-sand-50/95 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled || open ? "shadow-card" : "shadow-sm"
      }`}
    >
      <nav aria-label="ניווט ראשי" className="container-site">
        <div className="flex h-20 items-center justify-between py-3">
          <LogoLink variant="dark-text" imgClassName="h-13 w-auto" />

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.children?.some((c) => pathname === c.href.split("#")[0]) ??
                  false);
              return (
                <li key={link.label} className="group relative">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md text-[0.95rem] font-medium underline-offset-8 transition-all duration-200 ${
                      active
                        ? "border-b-2 border-gold-700 pb-1 text-gold-700"
                        : "text-navy-600 hover:font-semibold hover:text-gold-700 hover:underline hover:decoration-gold-500 hover:decoration-2"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.children ? (
                    /* נפתח במעבר עכבר או בפוקוס מקלדת; pt יוצר גשר רציף להעברת העכבר */
                    <div className="invisible absolute top-full right-0 z-50 pt-4 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="w-72 rounded-2xl border border-navy-900/10 bg-sand-50 p-3 shadow-card">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-xl px-4 py-2.5 text-sm font-medium text-navy-700 transition hover:bg-gold-400/15 hover:text-gold-700"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-navy-900/15 text-navy-800 transition hover:bg-sand-100"
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
          className="border-t border-navy-900/10 pb-6 lg:hidden"
        >
          <ul className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-3 text-lg font-medium transition hover:bg-gold-400/15 hover:text-gold-700 ${
                    pathname === link.href ? "text-gold-700" : "text-navy-800"
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
                          className="block rounded-xl px-3 py-2 text-base font-medium text-navy-600 transition hover:bg-gold-400/15 hover:text-gold-700"
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
