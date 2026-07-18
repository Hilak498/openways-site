import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Heebo, Inter, Montserrat } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { AccessibilityWidget } from "@/components/accessibility-widget";
import { Analytics } from "@/components/analytics";
import { site } from "@/lib/site";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Latin display/body faces from the approved design; Hebrew glyphs fall back
// to Heebo via the CSS font stacks in globals.css.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ייעוץ עסקי, גיוס אשראי עסקי וייעוץ משכנתאות`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "ייעוץ עסקי",
    "גיוס אשראי עסקי",
    "ייעוץ משכנתאות",
    "מימון לעסקים",
    "מחזור משכנתא",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: site.name,
    title: `${site.name} | ייעוץ עסקי, גיוס אשראי עסקי וייעוץ משכנתאות`,
    description: site.description,
    url: site.url,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${montserrat.variable} ${inter.variable} font-sans`}
    >
      <body className="flex min-h-svh flex-col">
        <a href="#main" className="skip-link">
          דילוג לתוכן המרכזי
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Mobile quick-contact FAB (per the approved design) */}
        <Link
          href="/#contact"
          aria-label="יצירת קשר מהירה"
          className="btn-primary fixed right-5 bottom-5 z-[70] !h-16 !w-16 !rounded-full !p-0 shadow-lift lg:hidden"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l2-5.2a8.4 8.4 0 1 1 16-4.3Z" />
          </svg>
        </Link>
        <AccessibilityWidget />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
