"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { trackEvent } from "@/lib/analytics";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

/**
 * Consent-gated analytics loader.
 * Nothing is injected until the visitor explicitly approved analytics cookies
 * in the cookie banner, and only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(readConsent()?.analytics === true);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  // One delegated listener covers every phone and WhatsApp link on the site
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) {
        trackEvent("phone_click", { number: href.slice(4), page: location.pathname });
      } else if (href.includes("wa.me/")) {
        trackEvent("whatsapp_click", { page: location.pathname });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!gaId || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
