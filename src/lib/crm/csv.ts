import {
  PRIORITIES,
  PRIORITY_LABELS,
  SERVICE_LABELS,
  SOURCES,
  SOURCE_LABELS,
  STAGES,
  STAGE_META,
  type Lead,
  type Priority,
  type Source,
  type Stage,
} from "./types";

/**
 * CSV in and out, in Hebrew, for Excel.
 *
 * Export writes a UTF-8 BOM — without it Excel on Windows reads Hebrew as
 * mojibake. Import accepts either the Hebrew headers this file writes or the
 * raw English column names, so a round-trip works and so does a hand-built
 * sheet.
 */

const COLUMNS: { header: string; read: (lead: Lead) => string }[] = [
  { header: "שם", read: (l) => l.name },
  { header: "טלפון", read: (l) => l.phone },
  { header: "אימייל", read: (l) => l.email },
  { header: "שירות", read: (l) => (l.service ? SERVICE_LABELS[l.service] ?? l.service : "") },
  { header: "שלב", read: (l) => STAGE_META[l.stage].label },
  { header: "עדיפות", read: (l) => PRIORITY_LABELS[l.priority] },
  { header: "מקור", read: (l) => SOURCE_LABELS[l.source] ?? l.source },
  { header: "אחראי", read: (l) => l.owner ?? "" },
  { header: "שווי משוער", read: (l) => (l.estimatedValue === null ? "" : String(l.estimatedValue)) },
  { header: "מעקב הבא", read: (l) => isoDay(l.nextFollowUpAt) },
  { header: "קשר אחרון", read: (l) => isoDay(l.lastContactedAt) },
  { header: "נכנס בתאריך", read: (l) => isoDay(l.createdAt) },
  { header: "הסכמה לדיוור", read: (l) => (l.marketingConsent ? "כן" : "לא") },
  { header: "עמוד מקור", read: (l) => l.sourcePage ?? "" },
  { header: "סיבת סגירה", read: (l) => l.lostReason ?? "" },
  { header: "הודעה מהטופס", read: (l) => l.message ?? "" },
  { header: "הערות", read: (l) => l.notes ?? "" },
];

function isoDay(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(date);
}

/** Quotes a field, and defuses values Excel would run as a formula. */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function leadsToCsv(leads: Lead[]): string {
  const head = COLUMNS.map((c) => cell(c.header)).join(",");
  const body = leads.map((lead) => COLUMNS.map((c) => cell(c.read(lead))).join(","));
  return `﻿${[head, ...body].join("\r\n")}\r\n`;
}

// ---------------------------------------------------------------- import ----

/** Splits CSV text into rows, honouring quotes, "" escapes and CRLF. */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];
    if (quoted) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r") {
      // handled by the \n branch
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((value) => value.trim() !== ""));
}

/** Header aliases -> internal field. Hebrew first, English as a fallback. */
const HEADER_ALIASES: Record<string, string> = {
  שם: "name",
  "שם מלא": "name",
  name: "name",
  טלפון: "phone",
  נייד: "phone",
  phone: "phone",
  אימייל: "email",
  מייל: "email",
  'דוא"ל': "email",
  email: "email",
  שירות: "service",
  service: "service",
  שלב: "stage",
  סטטוס: "stage",
  stage: "stage",
  עדיפות: "priority",
  priority: "priority",
  מקור: "source",
  source: "source",
  אחראי: "owner",
  owner: "owner",
  "שווי משוער": "estimatedValue",
  שווי: "estimatedValue",
  estimated_value: "estimatedValue",
  "מעקב הבא": "nextFollowUpAt",
  מעקב: "nextFollowUpAt",
  next_follow_up_at: "nextFollowUpAt",
  "קשר אחרון": "lastContactedAt",
  last_contacted_at: "lastContactedAt",
  "סיבת סגירה": "lostReason",
  lost_reason: "lostReason",
  "הודעה מהטופס": "message",
  הודעה: "message",
  message: "message",
  הערות: "notes",
  הערה: "notes",
  notes: "notes",
};

/**
 * Columns the export writes that the import deliberately does not apply:
 * created_at is the DB's own, and marketing consent is a legal record under
 * §30A of the Communications Law — it is given by the person, never by a
 * spreadsheet. Listed here so a round-tripped file reports no unknown headers.
 */
const IGNORED_HEADERS = new Set([
  "נכנס בתאריך",
  "הסכמה לדיוור",
  "עמוד מקור",
  "created_at",
  "marketing_consent",
  "source_page",
]);

/** Hebrew label -> key, for the vocabulary columns. */
function labelToKey<T extends string>(
  value: string,
  keys: readonly T[],
  labels: Record<string, string>,
): T | null {
  const needle = value.trim();
  if (!needle) return null;
  const direct = keys.find((key) => key === needle);
  if (direct) return direct;
  const byLabel = keys.find((key) => labels[key] === needle);
  return byLabel ?? null;
}

export type ImportRow = {
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  stage: Stage;
  priority: Priority;
  source: Source;
  owner: string | null;
  estimatedValue: number | null;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  lostReason: string | null;
  message: string | null;
  notes: string | null;
};

export type ImportResult = {
  rows: ImportRow[];
  /** 1-based line numbers that were skipped, with the reason. */
  skipped: { line: number; reason: string }[];
  unknownHeaders: string[];
};

function toDay(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  // ISO first, then the Israeli dd/mm/yyyy a spreadsheet is likely to hold.
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const match = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function toMoney(value: string): number | null {
  const n = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

export function csvToLeads(text: string): ImportResult {
  const rows = parseCsv(text);
  const skipped: { line: number; reason: string }[] = [];
  if (rows.length === 0) {
    return { rows: [], skipped: [{ line: 1, reason: "הקובץ ריק" }], unknownHeaders: [] };
  }

  const headers = rows[0].map((h) => h.trim());
  const fields = headers.map((h) => HEADER_ALIASES[h] ?? HEADER_ALIASES[h.toLowerCase()] ?? null);
  const unknownHeaders = headers.filter(
    (h, i) => h !== "" && fields[i] === null && !IGNORED_HEADERS.has(h),
  );

  if (!fields.includes("name")) {
    return {
      rows: [],
      skipped: [{ line: 1, reason: 'לא נמצאה עמודת "שם" בשורת הכותרות' }],
      unknownHeaders,
    };
  }

  const out: ImportRow[] = [];
  for (let r = 1; r < rows.length; r += 1) {
    const values: Record<string, string> = {};
    rows[r].forEach((value, i) => {
      const field = fields[i];
      if (field) values[field] = value.trim();
    });

    const name = values.name ?? "";
    const phone = values.phone ?? "";
    if (name.length < 2) {
      skipped.push({ line: r + 1, reason: "שם חסר" });
      continue;
    }
    if (!phone && !values.email) {
      skipped.push({ line: r + 1, reason: "אין טלפון ואין אימייל" });
      continue;
    }

    out.push({
      name: name.slice(0, 100),
      phone: phone.slice(0, 20),
      email: values.email ? values.email.slice(0, 254) : null,
      service:
        Object.keys(SERVICE_LABELS).find(
          (key) => key === values.service || SERVICE_LABELS[key] === values.service,
        ) ?? null,
      stage: labelToKey(values.stage ?? "", STAGES, stageLabels()) ?? "new",
      priority: labelToKey(values.priority ?? "", PRIORITIES, PRIORITY_LABELS) ?? "normal",
      source: labelToKey(values.source ?? "", SOURCES, SOURCE_LABELS) ?? "import",
      owner: values.owner ? values.owner.slice(0, 100) : null,
      estimatedValue: values.estimatedValue ? toMoney(values.estimatedValue) : null,
      nextFollowUpAt: values.nextFollowUpAt ? toDay(values.nextFollowUpAt) : null,
      lastContactedAt: values.lastContactedAt ? toDay(values.lastContactedAt) : null,
      lostReason: values.lostReason ? values.lostReason.slice(0, 500) : null,
      message: values.message ? values.message.slice(0, 5000) : null,
      notes: values.notes ? values.notes.slice(0, 5000) : null,
    });
  }

  return { rows: out, skipped, unknownHeaders };
}

function stageLabels(): Record<string, string> {
  return Object.fromEntries(STAGES.map((stage) => [stage, STAGE_META[stage].label]));
}
