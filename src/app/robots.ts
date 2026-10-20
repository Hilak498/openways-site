import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /crm is the internal lead board - password-gated, never indexed.
      disallow: ["/api/", "/crm"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
