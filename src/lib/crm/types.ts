import { z } from "zod";

/**
 * CRM vocabulary + validation. Shared by the server actions, the data layer
 * and the client components, so a stage or a label exists in exactly one place.
 */

export const STAGES = [
  "new",
  "contacted",
  "meeting",
  "proposal",
  "won",
  "lost",
] as const;

export type Stage = (typeof STAGES)[number];

/** Board columns, right-to-left in pipeline order. */
export const STAGE_META: Record<
  Stage,
  { label: string; hint: string; tone: "open" | "won" | "lost" }
> = {
  new: { label: "ליד חדש", hint: "נכנס ולא טופל", tone: "open" },
  contacted: { label: "יצרנו קשר", hint: "שיחה ראשונה בוצעה", tone: "open" },
  meeting: { label: "פגישה", hint: "פגישה נקבעה או התקיימה", tone: "open" },
  proposal: { label: "הצעה", hint: "הצעה על השולחן", tone: "open" },
  won: { label: "נסגר בהצלחה", hint: "הפך ללקוח", tone: "won" },
  lost: { label: "לא יצא לפועל", hint: "לא ממשיכים", tone: "lost" },
};

/** Stages that still count as an open opportunity. */
export const OPEN_STAGES: Stage[] = ["new", "contacted", "meeting", "proposal"];

export const PRIORITIES = ["low", "normal", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "נמוכה",
  normal: "רגילה",
  high: "גבוהה",
};

export const SOURCES = [
  "website",
  "phone",
  "referral",
  "whatsapp",
  "event",
  "import",
  "manual",
  "other",
] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<Source, string> = {
  website: "טופס באתר",
  phone: "טלפון",
  referral: "המלצה",
  whatsapp: "וואטסאפ",
  event: "אירוע / כנס",
  import: "ייבוא",
  manual: "הוזן ידנית",
  other: "אחר",
};

/** Mirrors the service slugs in src/lib/site.ts, plus the form's "other". */
export const SERVICE_LABELS: Record<string, string> = {
  "business-advisory": "ייעוץ עסקי",
  "business-credit": "גיוס אשראי עסקי",
  "mortgage-advisory": "ייעוץ משכנתאות",
  other: "אחר",
};

export const ACTIVITY_KINDS = [
  "note",
  "call",
  "meeting",
  "email",
  "whatsapp",
  "stage_change",
  "system",
] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

/** The kinds a person can log by hand; stage_change/system are written by the app. */
export const LOGGABLE_KINDS: ActivityKind[] = [
  "call",
  "meeting",
  "whatsapp",
  "email",
  "note",
];

export const ACTIVITY_META: Record<ActivityKind, { label: string; icon: string }> = {
  note: { label: "הערה", icon: "note" },
  call: { label: "שיחת טלפון", icon: "phone" },
  meeting: { label: "פגישה", icon: "calendar" },
  email: { label: "אימייל", icon: "mail" },
  whatsapp: { label: "וואטסאפ", icon: "whatsapp" },
  stage_change: { label: "שינוי שלב", icon: "arrow" },
  system: { label: "מערכת", icon: "gear" },
};

// ------------------------------------------------------------------ rows ----

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  name: string;
  phone: string;
  email: string;
  service: string | null;
  message: string | null;
  notes: string | null;
  marketingConsent: boolean;
  sourcePage: string | null;
  source: Source;
  stage: Stage;
  priority: Priority;
  owner: string | null;
  estimatedValue: number | null;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  lostReason: string | null;
  boardOrder: number | null;
  isArchived: boolean;
  /** Ties repeat enquiries from one person together. Set by a DB trigger. */
  contactKey: string;
};

export type Activity = {
  id: string;
  leadId: string;
  kind: ActivityKind;
  body: string | null;
  happenedAt: string;
  createdAt: string;
  createdBy: string | null;
};

// ------------------------------------------------------------ validation ----

const trimmed = (max: number) => z.string().trim().max(max);

/** Israeli mobile/landline, same rule the public contact form enforces. */
const phoneRule = trimmed(20)
  .min(7, "נא להזין מספר טלפון")
  .regex(/^[\d+\-() ]+$/, "מספר הטלפון מכיל תווים לא חוקיים");

/** "" from an untouched form field means "no value", not an empty string. */
const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((v) => (v ? v : null));

/** A money field arrives as text from the form; "" and garbage become null. */
const optionalMoney = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (!v) return null;
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
  });

/** <input type="date"> gives YYYY-MM-DD; anything else is rejected as empty. */
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null));

export const leadFormSchema = z.object({
  name: trimmed(100).min(2, "נא להזין שם"),
  phone: phoneRule,
  email: z
    .union([z.literal(""), z.email("כתובת אימייל לא תקינה")])
    .optional()
    .transform((v) => v || null),
  service: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v in SERVICE_LABELS ? v : null)),
  stage: z.enum(STAGES).default("new"),
  priority: z.enum(PRIORITIES).default("normal"),
  source: z.enum(SOURCES).default("manual"),
  owner: optionalText(100),
  estimatedValue: optionalMoney,
  nextFollowUpAt: optionalDate,
  notes: optionalText(5000),
  message: optionalText(5000),
  lostReason: optionalText(500),
});

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormValues = z.output<typeof leadFormSchema>;

export const activityFormSchema = z.object({
  leadId: z.uuid(),
  kind: z.enum(ACTIVITY_KINDS).default("note"),
  body: trimmed(5000).min(1, "נא לכתוב מה קרה"),
  happenedAt: optionalDate,
});

export const stageMoveSchema = z.object({
  leadId: z.uuid(),
  stage: z.enum(STAGES),
  /** Position inside the target column; the client sends the midpoint. */
  boardOrder: z.number().finite().optional(),
});

// --------------------------------------------------------------- helpers ----

export function serviceLabel(service: string | null): string {
  if (!service) return "לא צוין";
  return SERVICE_LABELS[service] ?? service;
}

/** Follow-up state, by calendar day in Israel time. */
export function followUpState(
  value: string | null,
  now = new Date(),
): "none" | "overdue" | "today" | "upcoming" {
  if (!value) return "none";
  const day = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(d);
  const target = day(new Date(value));
  const today = day(now);
  if (target < today) return "overdue";
  if (target === today) return "today";
  return "upcoming";
}
