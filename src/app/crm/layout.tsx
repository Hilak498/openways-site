import type { Metadata } from "next";

/**
 * The CRM is a private tool that happens to live in the marketing site, so it
 * opts out of the public chrome: no navbar, no footer, no cookie banner, and
 * no indexing. The root layout still supplies <html dir="rtl"> and the fonts.
 */

/**
 * Never prerender anything under /crm.
 *
 * Without this the build can bake a static answer: if CRM_PASSWORD is absent
 * at build time, the gate short-circuits before it reads the cookie, the page
 * looks static, and /crm ends up a cached redirect to the login screen for
 * everyone — session or not. A password-gated page is per-request by nature.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CRM · Open Ways",
  description: "ניהול לידים ומעקב - למשתמשים מורשים בלבד.",
  robots: { index: false, follow: false, nocache: true },
};

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-sand-100">{children}</div>;
}
