import type { MetadataRoute } from "next";
import { getPosts, postUrl } from "@/lib/blog";
import { services, showAdvisorsTrack, site } from "@/lib/site";
import { nationalInsurance } from "@/lib/tax-2026";

// Regenerated in the background at most once an hour, from the same feed as
// the blog, so new Soro articles appear without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const newestPost = posts[0]?.date;

  // Static pages carry no lastmod: a build time would claim every page
  // changed on each deploy, which search engines learn to ignore.
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.8 },
    ...services.map((s) => ({
      url: `${site.url}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...(showAdvisorsTrack
      ? [
          {
            url: `${site.url}/services/mortgage-advisory/advisors`,
            changeFrequency: "monthly" as const,
            priority: 0.8,
          },
        ]
      : []),
    {
      url: `${site.url}/blog`,
      ...(newestPost ? { lastModified: new Date(newestPost) } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...[
      "/calculators/mortgage",
      // The salary calculator is noindex until its rates are verified
      ...(nationalInsurance.verified ? ["/calculators/salary"] : []),
      "/calculators/business-credit",
    ].map((path) => ({
      url: `${site.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...["/privacy-policy", "/terms", "/cookies", "/accessibility-statement"].map(
      (path) => ({
        url: `${site.url}${path}`,
        changeFrequency: "yearly" as const,
        priority: 0.4,
      }),
    ),
  ];
}
