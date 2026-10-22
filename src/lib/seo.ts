import type { Metadata } from "next";
import { site } from "@/lib/site";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * Open Graph defaults for every page. Next.js replaces a parent's openGraph
 * object instead of merging it, so pages spread these in rather than relying
 * on the root layout (otherwise they lose the image and site name).
 */
export const baseOpenGraph = {
  type: "website",
  locale: "he_IL",
  siteName: site.name,
  images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
} satisfies OpenGraph;

/** Page-level Open Graph: og:url always matches the page's canonical path. */
export function pageOpenGraph(
  path: string,
  title: string,
  description: string,
  overrides: Partial<OpenGraph> = {},
): OpenGraph {
  return { ...baseOpenGraph, url: path, title, description, ...overrides } as OpenGraph;
}

/**
 * Full page metadata from one title/description pair: the exact <title>
 * (no layout template), meta description, canonical, Open Graph and Twitter
 * all stay in sync.
 */
export function pageMetadata({
  path,
  title,
  description,
  image,
}: {
  path: string;
  title: string;
  description: string;
  /** Page-specific 1200x630 share image (defaults to /og.png). */
  image?: { url: string; alt: string };
}): Metadata {
  const images = image ? [{ ...image, width: 1200, height: 630 }] : baseOpenGraph.images;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(path, title, description, { images }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}
