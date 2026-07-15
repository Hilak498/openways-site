import { site, services, type Service } from "@/lib/site";

/** Schema.org LocalBusiness + FinancialService for the organization. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["FinancialService", "LocalBusiness"],
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/logo.svg`,
    image: `${site.url}/og.png`,
    description: site.description,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
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
    provider: { "@id": `${site.url}/#organization` },
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
