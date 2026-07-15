"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoLink } from "@/components/logo";
import { services } from "@/lib/site";

const navLinks = [
  ...services.map((s) => ({ href: `/services/${s.slug}`, label: s.name })),
  { href: "/#why-us", label: "למה אנחנו" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Escape closes the menu; basic focus containment for keyboard users
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-navy-800/5 bg-white/85 shadow-card backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <nav aria-label="ניווט ראשי" className="container-site">
        <div className="flex h-18 items-center justify-between py-3">
          <LogoLink variant={solid ? "dark-text" : "light-text"} />

          {/* Desktop links */}
          <ul className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md text-[0.95rem] font-medium transition ${
                      solid
                        ? active
                          ? "text-gold-700"
                          : "text-navy-700 hover:text-gold-700"
                        : active
                          ? "text-gold-300"
                          : "text-white/85 hover:text-gold-300"
                    }`}
                  >
                    {link.label}
                  </Link>
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
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                solid
                  ? "border-navy-800/10 text-navy-800"
                  : "border-white/25 text-white"
              }`}
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
          ref={menuRef}
          hidden={!open}
          className="border-t border-navy-800/5 pb-6 lg:hidden"
        >
          <ul className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-lg font-medium text-navy-800 transition hover:bg-sand-100"
                >
                  {link.label}
                </Link>
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
