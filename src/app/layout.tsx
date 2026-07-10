import type { Metadata } from "next";
import { Assistant, Inter } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Open Ways | ייעוץ עסקי, משכנתאות ואשראי עסקי",
  description:
    "Open Ways מספקת ייעוץ עסקי, ייעוץ משכנתאות ליועצי משכנתאות וגיוס אשראי עסקי – בצורה מקצועית, שקופה ויעילה.",
  metadataBase: new URL("https://openways.co.il"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Open Ways",
    description: "ייעוץ עסקי, משכנתאות ואשראי עסקי",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${assistant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main" className="skip-link sr-only focus:not-sr-only">דלג לתוכן</a>
        {children}
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  );
}
