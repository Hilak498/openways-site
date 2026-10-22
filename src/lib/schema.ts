import { site, services, socials, type Service } from "@/lib/site";

export const organizationId = `${site.url}/#organization`;

/** Drops null, undefined, empty strings, empty arrays and empty objects, so no JSON-LD block carries empty fields. */
export function compactJsonLd(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(compactJsonLd).filter((v) => !isEmpty(v));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const c = compactJsonLd(v);
      if (!isEmpty(c)) out[k] = c;
    }
    return out;
  }
  return value;
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

/**
 * Schema.org organization. No street address on purpose: there is no walk-in
 * office, meetings happen on Zoom or at the client's place.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["FinancialService", "ProfessionalService"],
    "@id": organizationId,
    name: "Open Ways Group",
    legalName: "Open Ways",
    url: site.url,
    logo: `${site.url}/logo-light-bg.png`,
    image: `${site.url}/og.png`,
    description: site.description,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.city,
      addressCountry: site.address.country,
    },
    sameAs: socials.map((s) => s.href),
    areaServed: { "@type": "Country", name: "Israel" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "שירותי Open Ways",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.summary,
          url: `${site.url}/services/${s.slug}`,
        },
      })),
    },
  };
}

/** Schema.org Service + FAQPage for a single service page. */
export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.metaDescription,
    url: `${site.url}/services/${service.slug}`,
    provider: { "@id": organizationId },
    sameAs: [site.linkedin],
    areaServed: { "@type": "Country", name: "Israel" },
  };
}

export function faqSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Schema.org Person for the founder (about page). */
export function founderSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/about#founder`,
    name: "אושרי קירשנפלד",
    jobTitle: 'מייסד ומנכ"ל',
    url: `${site.url}/about`,
    image: `${site.url}/images/owner.jpg`,
    worksFor: { "@id": organizationId },
    alumniOf: { "@type": "CollegeOrUniversity", name: "University of Haifa" },
    sameAs: [site.linkedin],
  };
}

/** Schema.org WebApplication for a free calculator page. */
export function calculatorSchema(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${site.url}${path}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: "he-IL",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: 0, priceCurrency: "ILS" },
    provider: { "@id": organizationId },
  };
}

/** Schema.org BreadcrumbList from [name, path] pairs. */
export function breadcrumbSchema(items: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${site.url}${path}`,
    })),
  };
}
