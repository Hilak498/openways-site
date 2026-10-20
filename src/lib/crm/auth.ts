import "server-only";

import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single shared password for /crm. The CRM holds customer PII, so the gate is
 * the only thing between the public internet and the data:
 *
 * - CRM_PASSWORD      the password itself (server-side only).
 * - CRM_SESSION_SECRET signing key for the session cookie. Without it the
 *                      gate refuses to issue sessions rather than falling
 *                      back to an unsigned (forgeable) cookie.
 *
 * The cookie carries an expiry and an HMAC over it; there is no server-side
 * session store, so a leaked cookie stays valid until it expires. Rotating
 * CRM_SESSION_SECRET invalidates every session at once.
 */

export const CRM_COOKIE = "ow_crm";

const SESSION_DAYS = 14;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Constant-time compare that tolerates differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still spend the comparison so length alone is not a timing signal.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export type GateConfig =
  | { ok: true; password: string; secret: string }
  | { ok: false; missing: string[] };

export function gateConfig(): GateConfig {
  const password = process.env.CRM_PASSWORD;
  const secret = process.env.CRM_SESSION_SECRET;
  const missing: string[] = [];
  if (!password) missing.push("CRM_PASSWORD");
  if (!secret) missing.push("CRM_SESSION_SECRET");
  if (!password || !secret) return { ok: false, missing };
  return { ok: true, password, secret };
}

/**
 * `<expiry-ms>.<nonce>.<hmac>` — self-contained, so no session table is needed.
 * Exported (with tokenIsValid) because this pair is the security boundary and
 * is worth testing directly.
 */
export function issueToken(secret: string): string {
  const expiresAt = Date.now() + SESSION_MS;
  // A nonce keeps two logins in the same millisecond from sharing a token.
  const payload = `${expiresAt}.${randomBytes(8).toString("base64url")}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function tokenIsValid(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expiresAt, nonce, mac] = parts;
  if (!safeEqual(mac, sign(`${expiresAt}.${nonce}`, secret))) return false;
  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > Date.now();
}

/** True when the request carries a valid, unexpired CRM session. */
export async function isSignedIn(): Promise<boolean> {
  const config = gateConfig();
  if (!config.ok) return false;
  const jar = await cookies();
  return tokenIsValid(jar.get(CRM_COOKIE)?.value, config.secret);
}

/** Checks the submitted password and, on success, sets the session cookie. */
export async function signIn(submitted: string): Promise<boolean> {
  const config = gateConfig();
  if (!config.ok) return false;
  if (!safeEqual(submitted, config.password)) return false;

  const jar = await cookies();
  jar.set(CRM_COOKIE, issueToken(config.secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/crm",
    maxAge: SESSION_MS / 1000,
  });
  return true;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: CRM_COOKIE, path: "/crm" });
}

/**
 * Guard for every server action and page under /crm. Throws rather than
 * returning a value, so forgetting to check the result cannot leak data.
 */
export async function requireSession(): Promise<void> {
  if (!(await isSignedIn())) {
    throw new Error("CRM: unauthorized");
  }
}
