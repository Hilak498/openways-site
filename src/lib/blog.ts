import { cache } from "react";
import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";
import { site } from "@/lib/site";
import { looksUntranslated, slugOverrides } from "@/lib/blog-redirects";

/**
 * Blog posts come from the Soro RSS feed. Pages are prerendered as static
 * HTML at build time and regenerated in the background (ISR) at most once per
 * FEED_REVALIDATE_SECONDS, so new articles appear without a redeploy.
 *
 * מבנה הפיד (נבדק ב-17.10.26): התוכן המלא ב-content:encoded (CDATA, עטוף
 * ב-<div dir="rtl">), התקציר ב-description, והתמונה הראשית גם ב-enclosure
 * וגם ב-media:content. אין שדה כותב או קטגוריה.
 */
const FEED_URL =
  process.env.SORO_RSS_URL ??
  "https://app.trysoro.com/api/rss/d9ba4d30-4958-43b9-870b-aab1d131f327";

const FETCH_TIMEOUT_MS = 15_000;

/** Keep in sync with `revalidate` in the blog pages and the sitemap. */
export const FEED_REVALIDATE_SECONDS = 3600;

// Where a feed failure should degrade to "no posts" instead of throwing
const tolerateFeedErrors =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NODE_ENV !== "production";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** Sanitized article HTML. */
  html: string;
  image: string | null;
  /** ISO date string. */
  date: string;
}

type Node = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Article HTML lives in CDATA; keep it as plain text
  htmlEntities: true,
  isArray: (name) => name === "item",
});

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) {
    return text((value as Node)["#text"]);
  }
  return "";
}

function attr(value: unknown, name: string): string {
  const node = Array.isArray(value) ? value[0] : value;
  if (!node || typeof node !== "object") return "";
  return text((node as Node)[`@_${name}`]);
}

function stripTags(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max)}…`;
}

/** Hebrew-friendly slug: keeps letters, digits and dashes. */
function slugify(value: string): string {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Soro links point at www.openways.co.il/<slug>; reuse that slug. */
function slugFromLink(link: string): string {
  try {
    const segments = new URL(link).pathname.split("/").filter(Boolean);
    const last = segments.at(-1);
    return last ? slugify(decodeURIComponent(last)) : "";
  } catch {
    return "";
  }
}

const SITE_HOSTS = new Set(["openways.co.il", "www.openways.co.il"]);

function toSitePath(href: string): string | null {
  try {
    const url = new URL(href);
    if (!SITE_HOSTS.has(url.hostname)) return null;
    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return null;
  }
}

function sanitizeArticle(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "b", "em", "i", "u",
      "a", "blockquote", "br", "hr", "img", "figure", "figcaption", "code",
      "pre", "table", "caption", "thead", "tbody", "tfoot", "tr", "th", "td",
      "div", "span", "sup", "sub",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      "*": ["dir", "lang"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    transformTags: {
      // The page owns the only h1
      h1: "h2",
      a: (tagName, attribs) => {
        // Links back to openways.co.il become relative; others open in a new tab
        const sitePath = attribs.href ? toSitePath(attribs.href) : null;
        const attrs: sanitizeHtml.Attributes = sitePath
          ? { href: sitePath }
          : { ...attribs, target: "_blank", rel: "noopener noreferrer" };
        return { tagName, attribs: attrs };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy", alt: attribs.alt ?? "" },
      }),
    },
    exclusiveFilter: (frame) =>
      // Images must be absolute https URLs (no relative paths from the feed)
      (frame.tag === "img" && !frame.attribs.src?.startsWith("https://")) ||
      (["p", "h2", "h3", "h4", "li"].includes(frame.tag) &&
        !frame.text.trim() &&
        !frame.mediaChildren.length),
  });
}

/** Wraps tables so they can scroll sideways on narrow screens. */
function wrapTables(html: string): string {
  return html
    .replace(/<table/g, '<div class="table-wrap"><table')
    .replace(/<\/table>/g, "</table></div>");
}

function parseItem(item: Node): Omit<Post, "slug"> & { link: string } {
  const title = stripTags(text(item.title));
  const description = text(item.description);
  const content = text(item["content:encoded"]);
  const html = wrapTables(sanitizeArticle(content || description));

  const enclosureType = attr(item.enclosure, "type");
  const image =
    (enclosureType.startsWith("image/") ? attr(item.enclosure, "url") : "") ||
    attr(item["media:content"], "url") ||
    attr(item["media:thumbnail"], "url") ||
    /<img[^>]+src="(https:[^"]+)"/.exec(content)?.[1] ||
    null;

  const parsedDate = new Date(text(item.pubDate));
  const date = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString()
    : parsedDate.toISOString();

  return {
    title,
    excerpt: truncate(stripTags(description) || stripTags(html), 180),
    html,
    image: image && image.startsWith("https://") ? image : null,
    date,
    link: text(item.link),
  };
}

async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch(FEED_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "application/rss+xml, application/xml",
        // Part of the fetch cache key: every deployment reads the feed fresh
        // instead of reusing a Data Cache entry from an earlier deployment
        "X-Deployment": process.env.VERCEL_DEPLOYMENT_ID ?? "local",
      },
      next: { revalidate: FEED_REVALIDATE_SECONDS, tags: ["blog-feed"] },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const feed = parser.parse(await res.text()) as Node;
    const channel = (feed.rss as Node | undefined)?.channel as Node | undefined;
    const items = (channel?.item as Node[] | undefined) ?? [];

    const seen = new Set<string>();
    const posts: Post[] = [];
    for (const item of items) {
      const { link, ...post } = parseItem(item);
      if (!post.title || !post.html) continue;

      const feedSlug = slugFromLink(link) || slugify(post.title) || text(item.guid);
      let slug = slugOverrides[feedSlug] ?? feedSlug;
      if (slug === feedSlug) warnUntranslatedSlug(slug);
      while (seen.has(slug)) slug = `${slug}-2`;
      seen.add(slug);
      posts.push({ slug, ...post });
    }

    return posts.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    // At build time a missing or broken feed must not fail the deploy: the
    // blog is built with whatever is available ("coming soon" when empty).
    // During background regeneration we throw instead, so Next.js keeps
    // serving the last good pages rather than replacing them with an empty
    // blog or 404s.
    if (!tolerateFeedErrors) throw error;
    console.warn(`[blog] RSS feed unavailable, building without posts: ${String(error)}`);
    return [];
  }
}

const warnedSlugs = new Set<string>();

/** Build-log hint that a feed slug needs an English entry in slugOverrides. */
function warnUntranslatedSlug(slug: string) {
  if (warnedSlugs.has(slug) || !looksUntranslated(slug)) return;
  warnedSlugs.add(slug);
  console.warn(
    `[blog] slug not in English: "${slug}" - add it to slugOverrides in src/lib/blog-redirects.ts`,
  );
}

/** Deduplicated per render; the fetch itself is cached by Next.js. */
export const getPosts = cache(fetchPosts);

export async function getPost(slug: string): Promise<Post | undefined> {
  const wanted = slugify(safeDecode(slug));
  return (await getPosts()).find((p) => p.slug === wanted);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function postUrl(slug: string): string {
  return `${site.url}/blog/${encodeURIComponent(slug)}`;
}

export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(iso));
}
