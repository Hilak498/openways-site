import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  type Activity,
  type ActivityKind,
  type Lead,
  type Priority,
  type Source,
  type Stage,
} from "./types";

/**
 * Server-only Supabase access for the CRM.
 *
 * The public contact form writes with the publishable key and cannot read
 * anything back (see src/lib/leads.ts). The CRM needs full read/write, so it
 * uses the secret key — which must never reach the browser. Everything here
 * runs inside server actions and server components, behind the /crm gate.
 */

const SUPABASE_URL_KEYS = ["SUPABASE_URL"] as const;
const SECRET_KEYS = ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;

/** Accepts either env name for the secret key; Supabase renamed it in 2025. */
function firstEnv(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

export function crmConfigured(): boolean {
  return Boolean(firstEnv(SUPABASE_URL_KEYS) && firstEnv(SECRET_KEYS));
}

/** Names of the env vars that are still missing, for the setup screen. */
export function missingDbEnv(): string[] {
  const missing: string[] = [];
  if (!firstEnv(SUPABASE_URL_KEYS)) missing.push("SUPABASE_URL");
  if (!firstEnv(SECRET_KEYS)) missing.push("SUPABASE_SECRET_KEY");
  return missing;
}

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (client) return client;
  const url = firstEnv(SUPABASE_URL_KEYS);
  const key = firstEnv(SECRET_KEYS);
  if (!url || !key) {
    throw new Error("CRM: Supabase is not configured (SUPABASE_URL / SUPABASE_SECRET_KEY)");
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "openways-crm" } },
  });
  return client;
}

// ----------------------------------------------------------------- shape ----

/** The columns the CRM reads. Listed explicitly so a schema drift is loud. */
const LEAD_COLUMNS = [
  "id",
  "created_at",
  "updated_at",
  "name",
  "phone",
  "email",
  "service",
  "message",
  "notes",
  "marketing_consent",
  "source_page",
  "source",
  "stage",
  "priority",
  "owner",
  "estimated_value",
  "next_follow_up_at",
  "last_contacted_at",
  "lost_reason",
  "board_order",
  "is_archived",
].join(", ");

type LeadRecord = Record<string, unknown>;

const str = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

function toLead(row: LeadRecord): Lead {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: str(row.updated_at),
    name: str(row.name) ?? "",
    phone: str(row.phone) ?? "",
    email: str(row.email) ?? "",
    service: str(row.service),
    message: str(row.message),
    notes: str(row.notes),
    marketingConsent: row.marketing_consent === true,
    sourcePage: str(row.source_page),
    source: (str(row.source) ?? "website") as Source,
    stage: (str(row.stage) ?? "new") as Stage,
    priority: (str(row.priority) ?? "normal") as Priority,
    owner: str(row.owner),
    estimatedValue: num(row.estimated_value),
    nextFollowUpAt: str(row.next_follow_up_at),
    lastContactedAt: str(row.last_contacted_at),
    lostReason: str(row.lost_reason),
    boardOrder: num(row.board_order),
    isArchived: row.is_archived === true,
  };
}

function toActivity(row: LeadRecord): Activity {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    kind: (str(row.kind) ?? "note") as ActivityKind,
    body: str(row.body),
    happenedAt: String(row.happened_at),
    createdAt: String(row.created_at),
    createdBy: str(row.created_by),
  };
}

/** Supabase errors carry PII-free metadata; the message is for server logs. */
function fail(context: string, error: { message: string; code?: string }): never {
  console.error(`[crm] ${context} failed`, { code: error.code, message: error.message });
  throw new Error(`CRM: ${context} failed`);
}

// ------------------------------------------------------------------ reads ----

export async function listLeads(
  options: { includeArchived?: boolean } = {},
): Promise<Lead[]> {
  let query = db()
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("board_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(2000);

  if (!options.includeArchived) query = query.eq("is_archived", false);

  const { data, error } = await query;
  if (error) fail("listLeads", error);
  return (data ?? []).map((row) => toLead(row as unknown as LeadRecord));
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await db()
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) fail("getLead", error);
  return data ? toLead(data as unknown as LeadRecord) : null;
}

export async function listActivities(leadIds: string[]): Promise<Activity[]> {
  if (leadIds.length === 0) return [];
  const { data, error } = await db()
    .from("lead_activities")
    .select("id, lead_id, kind, body, happened_at, created_at, created_by")
    .in("lead_id", leadIds)
    .order("happened_at", { ascending: false })
    .limit(5000);
  if (error) fail("listActivities", error);
  return (data ?? []).map((row) => toActivity(row as unknown as LeadRecord));
}

// ----------------------------------------------------------------- writes ----

export type LeadWrite = {
  name?: string;
  phone?: string;
  email?: string | null;
  service?: string | null;
  message?: string | null;
  notes?: string | null;
  source?: Source;
  stage?: Stage;
  priority?: Priority;
  owner?: string | null;
  estimatedValue?: number | null;
  nextFollowUpAt?: string | null;
  lastContactedAt?: string | null;
  lostReason?: string | null;
  boardOrder?: number | null;
  isArchived?: boolean;
};

/** camelCase -> column names, skipping keys the caller didn't set. */
function toRow(values: LeadWrite): LeadRecord {
  const row: LeadRecord = {};
  const map: Record<keyof LeadWrite, string> = {
    name: "name",
    phone: "phone",
    email: "email",
    service: "service",
    message: "message",
    notes: "notes",
    source: "source",
    stage: "stage",
    priority: "priority",
    owner: "owner",
    estimatedValue: "estimated_value",
    nextFollowUpAt: "next_follow_up_at",
    lastContactedAt: "last_contacted_at",
    lostReason: "lost_reason",
    boardOrder: "board_order",
    isArchived: "is_archived",
  };
  for (const [key, column] of Object.entries(map)) {
    const value = values[key as keyof LeadWrite];
    if (value !== undefined) row[column] = value;
  }
  return row;
}

export async function insertLead(values: LeadWrite): Promise<Lead> {
  const row = toRow(values);
  // A new card goes to the top of its column: newest first, like the board reads.
  if (row.board_order === undefined) row.board_order = Date.now();
  const { data, error } = await db()
    .from("leads")
    .insert(row)
    .select(LEAD_COLUMNS)
    .single();
  if (error) fail("insertLead", error);
  return toLead(data as unknown as LeadRecord);
}

export async function insertLeads(rows: LeadWrite[]): Promise<number> {
  if (rows.length === 0) return 0;
  const now = Date.now();
  const payload = rows.map((values, index) => {
    const row = toRow(values);
    if (row.board_order === undefined) row.board_order = now - index;
    return row;
  });
  const { error, count } = await db()
    .from("leads")
    .insert(payload, { count: "exact" });
  if (error) fail("insertLeads", error);
  return count ?? payload.length;
}

export async function updateLead(id: string, values: LeadWrite): Promise<Lead> {
  const { data, error } = await db()
    .from("leads")
    .update(toRow(values))
    .eq("id", id)
    .select(LEAD_COLUMNS)
    .single();
  if (error) fail("updateLead", error);
  return toLead(data as unknown as LeadRecord);
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await db().from("leads").delete().eq("id", id);
  if (error) fail("deleteLead", error);
}

export async function insertActivity(values: {
  leadId: string;
  kind: ActivityKind;
  body: string | null;
  happenedAt?: string | null;
  createdBy?: string | null;
}): Promise<void> {
  const { error } = await db().from("lead_activities").insert({
    lead_id: values.leadId,
    kind: values.kind,
    body: values.body,
    happened_at: values.happenedAt ?? new Date().toISOString(),
    created_by: values.createdBy ?? null,
  });
  if (error) fail("insertActivity", error);
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await db().from("lead_activities").delete().eq("id", id);
  if (error) fail("deleteActivity", error);
}

/**
 * Distinguishes "the migration never ran" from any other DB failure, so the
 * setup screen can say which it is instead of showing a blank board.
 */
export async function schemaReady(): Promise<{ ready: boolean; reason?: string }> {
  try {
    const { error } = await db().from("leads").select("id, stage").limit(1);
    if (!error) return { ready: true };
    return { ready: false, reason: error.message };
  } catch (err) {
    return { ready: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}
