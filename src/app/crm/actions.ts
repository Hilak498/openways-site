"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { requireSession, signIn, signOut } from "@/lib/crm/auth";
import * as db from "@/lib/crm/db";
import { csvToLeads } from "@/lib/crm/csv";
import { rateLimit } from "@/lib/rate-limit";
import {
  STAGE_META,
  activityFormSchema,
  leadFormSchema,
  stageMoveSchema,
  type Stage,
} from "@/lib/crm/types";

/**
 * Every action here is reachable by a direct POST, not only through the UI, so
 * each one calls requireSession() before touching data — the password gate in
 * proxy.ts is a redirect for humans, not an authorization boundary.
 */

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/** Turns a thrown DB/validation error into a message the UI can render. */
async function guard(work: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    await requireSession();
    return await work();
  } catch (err) {
    if (err instanceof Error && err.message === "CRM: unauthorized") {
      return { ok: false, error: "פג תוקף ההתחברות. רעננו את העמוד והתחברו מחדש." };
    }
    console.error("[crm] action failed", err);
    return { ok: false, error: "הפעולה נכשלה. נסו שוב, ואם זה חוזר — בדקו את הלוג בשרת." };
  }
}

const text = (data: FormData, key: string): string => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

// -------------------------------------------------------------- the gate ----

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  // Brute-force brake: the password is shared, so a slow guess is the risk.
  const { allowed } = rateLimit(`crm-login:${ip}`, { limit: 8, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return { ok: false, error: "יותר מדי נסיונות. נסו שוב בעוד עשר דקות." };
  }

  const password = text(formData, "password");
  if (!password) return { ok: false, error: "נא להזין סיסמה." };
  if (!(await signIn(password))) {
    return { ok: false, error: "סיסמה שגויה." };
  }
  redirect("/crm");
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/crm/login");
}

// ----------------------------------------------------------------- leads ----

export async function createLeadAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return guard(async () => {
    const parsed = leadFormSchema.safeParse({
      name: text(formData, "name"),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
      service: text(formData, "service"),
      stage: text(formData, "stage") || "new",
      priority: text(formData, "priority") || "normal",
      source: text(formData, "source") || "manual",
      owner: text(formData, "owner"),
      estimatedValue: text(formData, "estimatedValue"),
      nextFollowUpAt: text(formData, "nextFollowUpAt"),
      notes: text(formData, "notes"),
      message: text(formData, "message"),
      lostReason: text(formData, "lostReason"),
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "הפרטים אינם תקינים." };
    }
    const values = parsed.data;
    const lead = await db.insertLead({
      ...values,
      email: values.email ?? "",
      nextFollowUpAt: values.nextFollowUpAt,
    });
    await db.insertActivity({
      leadId: lead.id,
      kind: "system",
      body: "הליד נוצר ב-CRM",
    });
    refresh();
    return { ok: true, message: `${lead.name} נוסף ללוח` };
  });
}

export async function updateLeadAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return guard(async () => {
    const id = text(formData, "id");
    if (!id) return { ok: false, error: "חסר מזהה ליד." };

    const parsed = leadFormSchema.safeParse({
      name: text(formData, "name"),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
      service: text(formData, "service"),
      stage: text(formData, "stage") || "new",
      priority: text(formData, "priority") || "normal",
      source: text(formData, "source") || "manual",
      owner: text(formData, "owner"),
      estimatedValue: text(formData, "estimatedValue"),
      nextFollowUpAt: text(formData, "nextFollowUpAt"),
      notes: text(formData, "notes"),
      message: text(formData, "message"),
      lostReason: text(formData, "lostReason"),
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "הפרטים אינם תקינים." };
    }

    const before = await db.getLead(id);
    const values = parsed.data;
    const lead = await db.updateLead(id, {
      ...values,
      email: values.email ?? "",
    });

    // A stage changed through the edit form is logged like a drag on the board.
    if (before && before.stage !== lead.stage) {
      await db.insertActivity({
        leadId: id,
        kind: "stage_change",
        body: `${STAGE_META[before.stage].label} → ${STAGE_META[lead.stage].label}`,
      });
    }
    refresh();
    return { ok: true, message: "הליד עודכן" };
  });
}

export async function moveLeadAction(input: {
  leadId: string;
  stage: Stage;
  boardOrder?: number;
}): Promise<ActionResult> {
  return guard(async () => {
    const parsed = stageMoveSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "בקשה לא תקינה." };
    const { leadId, stage, boardOrder } = parsed.data;

    const before = await db.getLead(leadId);
    if (!before) return { ok: false, error: "הליד לא נמצא." };

    await db.updateLead(leadId, {
      stage,
      boardOrder: boardOrder ?? before.boardOrder,
      // Reaching a later stage means someone talked to them.
      lastContactedAt:
        stage !== "new" && before.stage === "new"
          ? new Date().toISOString()
          : before.lastContactedAt,
    });

    if (before.stage !== stage) {
      await db.insertActivity({
        leadId,
        kind: "stage_change",
        body: `${STAGE_META[before.stage].label} → ${STAGE_META[stage].label}`,
      });
    }
    refresh();
    return { ok: true };
  });
}

/**
 * Archive and delete work on the card, and a card is a person — so they cover
 * every enquiry that person sent, not just the row the board happens to edit.
 */
export async function archiveLeadAction(id: string, archived: boolean): Promise<ActionResult> {
  return guard(async () => {
    if (!id) return { ok: false, error: "חסר מזהה ליד." };
    const ids = await db.leadIdsInContact(id);
    await db.updateLeads(ids, { isArchived: archived });
    refresh();
    return { ok: true, message: archived ? "הכרטיס הועבר לארכיון" : "הכרטיס הוחזר מהארכיון" };
  });
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  return guard(async () => {
    if (!id) return { ok: false, error: "חסר מזהה ליד." };
    const ids = await db.leadIdsInContact(id);
    await db.deleteLeads(ids);
    refresh();
    return {
      ok: true,
      message: ids.length > 1 ? `הכרטיס ו-${ids.length} הפניות שלו נמחקו` : "הכרטיס נמחק",
    };
  });
}

/** Snoozes the next follow-up by whole days from today. */
export async function snoozeLeadAction(id: string, days: number): Promise<ActionResult> {
  return guard(async () => {
    if (!id) return { ok: false, error: "חסר מזהה ליד." };
    const safeDays = Math.min(Math.max(Math.round(days), 0), 365);
    const target = new Date();
    target.setDate(target.getDate() + safeDays);
    await db.updateLead(id, { nextFollowUpAt: target.toISOString().slice(0, 10) });
    refresh();
    return { ok: true, message: safeDays === 0 ? "המעקב נקבע להיום" : `המעקב נדחה ב-${safeDays} ימים` };
  });
}

// ------------------------------------------------------------ activities ----

export async function addActivityAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return guard(async () => {
    const parsed = activityFormSchema.safeParse({
      leadId: text(formData, "leadId"),
      kind: text(formData, "kind") || "note",
      body: text(formData, "body"),
      happenedAt: text(formData, "happenedAt"),
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "הפרטים אינם תקינים." };
    }
    const { leadId, kind, body, happenedAt } = parsed.data;

    await db.insertActivity({
      leadId,
      kind,
      body,
      happenedAt: happenedAt ? new Date(happenedAt).toISOString() : new Date().toISOString(),
    });

    // Logging a conversation is also the freshest "last contacted" signal.
    if (kind === "call" || kind === "meeting" || kind === "whatsapp" || kind === "email") {
      await db.updateLead(leadId, {
        lastContactedAt: happenedAt ? new Date(happenedAt).toISOString() : new Date().toISOString(),
      });
    }

    // An optional follow-up date, set straight from the activity form.
    const follow = text(formData, "nextFollowUpAt");
    if (/^\d{4}-\d{2}-\d{2}$/.test(follow)) {
      await db.updateLead(leadId, { nextFollowUpAt: follow });
    }

    refresh();
    return { ok: true, message: "התיעוד נשמר" };
  });
}

export async function deleteActivityAction(id: string): Promise<ActionResult> {
  return guard(async () => {
    if (!id) return { ok: false, error: "חסר מזהה." };
    await db.deleteActivity(id);
    refresh();
    return { ok: true, message: "התיעוד נמחק" };
  });
}

// ---------------------------------------------------------------- import ----

export async function importCsvAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return guard(async () => {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "נא לבחור קובץ CSV." };
    }
    if (file.size > 2 * 1024 * 1024) {
      return { ok: false, error: "הקובץ גדול מ-2MB. פצלו אותו לקבצים קטנים יותר." };
    }

    const parsed = csvToLeads(await file.text());
    if (parsed.rows.length === 0) {
      const reason = parsed.skipped[0]?.reason ?? "לא נמצאו שורות תקינות";
      return { ok: false, error: `הייבוא נעצר: ${reason}.` };
    }
    if (parsed.rows.length > 1000) {
      return { ok: false, error: "עד 1000 שורות בייבוא אחד." };
    }

    const inserted = await db.insertLeads(
      parsed.rows.map((row) => ({ ...row, email: row.email ?? "" })),
    );

    refresh();
    const skipped = parsed.skipped.length;
    return {
      ok: true,
      message:
        `יובאו ${inserted} לידים` +
        (skipped > 0 ? ` · ${skipped} שורות דולגו (שם או פרטי קשר חסרים)` : ""),
    };
  });
}
