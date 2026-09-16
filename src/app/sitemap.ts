import type { MetadataRoute } from "next";
import { services, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: `${site.url}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...services.map((s) => ({
      url: `${site.url}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    {
      url: `${site.url}/services/mortgage-advisory/advisors`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...["/calculators/mortgage", "/calculators/business-credit"].map((path) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...["/privacy-policy", "/terms", "/cookies", "/accessibility-statement"].map(
      (path) => ({
        url: `${site.url}${path}`,
        lastModified: now,
        changeFrequency: "yearly" as const,
        priority: 0.4,
      }),
    ),
  ];
}
