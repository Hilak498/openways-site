import { notFound, permanentRedirect } from "next/navigation";
import { getPost } from "@/lib/blog";

/**
 * Soro publishes article links at the site root (www.openways.co.il/<slug>),
 * while the articles live under /blog/<slug>. Any single-segment path that
 * matches a feed article gets a permanent (308) redirect there; everything
 * else is a normal 404. Static routes (/about, /blog, ...) always win over
 * this dynamic segment.
 */
export const revalidate = 3600;

export default async function SoroArticleRedirect({
  params,
}: PageProps<"/[slug]">) {
  const { slug } = await params;
  // A feed outage must not turn ordinary 404s into server errors
  const post = await getPost(slug).catch(() => undefined);
  if (!post) notFound();
  permanentRedirect(`/blog/${encodeURIComponent(post.slug)}`);
}
