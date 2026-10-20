import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (Middleware was renamed in Next.js 16).
 *
 * Its only job here is the redirect a human expects: hitting /crm without a
 * session cookie lands on the login screen instead of a blank board. This is
 * an *optimistic* check — it looks at cookie presence, not its signature —
 * exactly as the Next.js auth guide prescribes. The real authorization lives
 * in the page/layout and in every server action (src/lib/crm/auth.ts), which
 * verify the HMAC. Never rely on this file to keep data safe.
 */

const CRM_COOKIE = "ow_crm";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/crm/login";
  const hasCookie = request.cookies.has(CRM_COOKIE);

  if (!hasCookie && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/crm/login";
    // Remember where they were headed, so login can return them there.
    url.search = pathname === "/crm" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Deliberately no "has a cookie -> skip the login page" redirect here: this
  // file cannot tell a valid cookie from an expired or forged one, and pairing
  // that guess with the page's real check produced a redirect loop (page says
  // "not signed in, go to login", proxy says "has a cookie, go to the board").
  // The login page sends a genuinely signed-in visitor on to /crm itself.

  // Belt-and-braces alongside robots.ts: never let the CRM into an index.
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: "/crm/:path*",
};
