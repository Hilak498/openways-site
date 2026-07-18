import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { contactSchema } from "@/lib/contact-schema";
import { rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";

/**
 * Contact form endpoint. All secrets stay server-side; the client only ever
 * talks to this route.
 *
 * Protections:
 * - Same-origin check (CSRF) - Origin header must match the request host
 * - Rate limiting per IP (5 requests / 10 minutes)
 * - Honeypot field + minimum-fill-time trap
 * - Zod validation + input sanitization
 * - Optional Google reCAPTCHA v3 verification (enabled by env vars)
 */

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const MIN_FILL_TIME_MS = 3_000;

/** Strip control characters and HTML-significant characters. */
function sanitize(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .trim();
}

async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // Not configured - skip (honeypot + rate limit still apply)
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean; score?: number };
    return data.success && (data.score === undefined || data.score >= 0.5);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const headerList = await headers();

  // --- CSRF: enforce same-origin for state-changing requests ---
  const origin = headerList.get("origin");
  const host = headerList.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "בקשה לא מורשית." }, { status: 403 });
  }

  // --- Rate limit by client IP ---
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";
  const { allowed } = rateLimit(`contact:${ip}`, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "נשלחו יותר מדי פניות. נסו שוב בעוד מספר דקות." },
      { status: 429 },
    );
  }

  // --- Parse & validate ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "הפרטים שנשלחו אינם תקינים. בדקו את השדות ונסו שוב." },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // --- Bot traps: honeypot + minimum fill time ---
  const tooFast = Date.now() - data.renderedAt < MIN_FILL_TIME_MS;
  if (data.company || tooFast) {
    // Pretend success so bots learn nothing
    return NextResponse.json({ ok: true });
  }

  // --- Optional reCAPTCHA v3 ---
  const recaptchaToken = (body as Record<string, unknown>).recaptchaToken as
    | string
    | undefined;
  if (!(await verifyRecaptcha(recaptchaToken))) {
    return NextResponse.json({ error: "אימות אנושיות נכשל." }, { status: 403 });
  }

  const submission = {
    name: sanitize(data.name),
    phone: sanitize(data.phone),
    email: sanitize(data.email),
    service: data.service ?? "לא צוין",
    message: sanitize(data.message),
    marketingConsent: data.marketingConsent,
    receivedAt: new Date().toISOString(),
    // Consent audit trail (Amendment 13): what was agreed to and when
    consentRecord: data.marketingConsent
      ? { type: "marketing-opt-in", at: new Date().toISOString(), source: "contact-form" }
      : null,
  };

  // --- Delivery ---
  // TODO: חברו כאן ספק אימייל (Resend / SendGrid / SES) או CRM.
  // המפתחות נשמרים ב-.env בלבד ואינם נחשפים ללקוח. דוגמה עם Resend:
  //
  //   await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       from: "site@openways.co.il",
  //       to: process.env.CONTACT_INBOX ?? site.email,
  //       subject: `פנייה חדשה מהאתר: ${submission.name}`,
  //       text: JSON.stringify(submission, null, 2),
  //     }),
  //   });
  console.info("[contact] new submission for", site.name, {
    ...submission,
    // Avoid logging full PII in production logs
    email: submission.email.replace(/(.{2}).+(@.*)/, "$1***$2"),
    phone: submission.phone.slice(0, 3) + "****",
  });

  return NextResponse.json({ ok: true });
}
