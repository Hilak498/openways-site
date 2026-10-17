import type { MetadataRoute } from "next";
import { getPosts, postUrl } from "@/lib/blog";
import { services, showAdvisorsTrack, site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPosts();

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
    ...(showAdvisorsTrack
      ? [
          {
            url: `${site.url}/services/mortgage-advisory/advisors`,
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.8,
          },
        ]
      : []),
    {
      url: `${site.url}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...["/calculators/mortgage", "/calculators/salary", "/calculators/business-credit"].map((path) => ({
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
