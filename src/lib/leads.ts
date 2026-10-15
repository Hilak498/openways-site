import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Server-only: writes contact-form leads to Supabase (public.leads).
 * Imported only by the /api/contact route, never by client components.
 *
 * Uses the publishable (anon) key. The anon role has INSERT on the columns
 * below and no SELECT, so the insert must not ask for the row back
 * (no .select()). id, created_at, status and notes are filled by the DB.
 */

/** Mirrors the table's constraints, so a bad row fails here and not in the DB. */
const leadRowSchema = z
  .object({
    name: z.string().min(2).max(100),
    phone: z.string().min(7).max(20),
    email: z.email(),
    service: z
      .enum(["business-advisory", "mortgage-advisory", "business-credit", "other"])
      .nullable(),
    message: z.string().min(1).max(5000),
    marketing_consent: z.boolean(),
    source_page: z.string().max(500).nullable(),
  })
  .strict();

export type LeadRow = z.infer<typeof leadRowSchema>;

export type LeadInput = {
  name: string;
  phone: string;
  email: string;
  service?: string;
  message: string;
  marketingConsent: boolean;
  sourcePage?: string;
};

/** Form values -> table row. Returns null if the row breaks a DB limit. */
export function toLeadRow(input: LeadInput): LeadRow | null {
  let service = input.service || null;
  let message = input.message;
  // The table has no value for the advisors track (hidden for now, see
  // showAdvisorsTrack), so it is stored as "other" with a tag in the message.
  if (service === "mortgage-advisors") {
    service = "other";
    message = `[ייעוץ ליועצי משכנתאות] ${message}`;
  }
  const sourcePage = input.sourcePage?.startsWith("/") ? input.sourcePage : null;

  const parsed = leadRowSchema.safeParse({
    name: input.name,
    phone: input.phone,
    email: input.email,
    service,
    message,
    marketing_consent: input.marketingConsent,
    source_page: sourcePage,
  });
  return parsed.success ? parsed.data : null;
}

/**
 * Inserts the lead. Returns false when Supabase isn't configured or the
 * insert fails; the error is logged here (server logs) and never sent to
 * the visitor.
 */
export async function insertLead(row: LeadRow): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("[contact] supabase not configured (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY)");
    return false;
  }
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("leads").insert(row);
    if (error) {
      console.error("[contact] supabase insert failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("[contact] supabase error", err);
    return false;
  }
}
