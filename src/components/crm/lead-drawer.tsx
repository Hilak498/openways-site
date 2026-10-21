"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  addActivityAction,
  archiveLeadAction,
  deleteActivityAction,
  deleteLeadAction,
  snoozeLeadAction,
  updateLeadAction,
  type ActionResult,
} from "@/app/crm/actions";
import type { Contact } from "@/lib/crm/contacts";
import {
  ACTIVITY_META,
  LOGGABLE_KINDS,
  PRIORITIES,
  PRIORITY_LABELS,
  SERVICE_LABELS,
  SOURCES,
  SOURCE_LABELS,
  STAGES,
  STAGE_META,
  type Activity,
  serviceLabel,
  type Lead,
} from "@/lib/crm/types";

import { waNumber } from "./board";
import {
  ACTIVITY_ICONS,
  ConsentChip,
  FollowUpChip,
  IconArchive,
  IconMail,
  IconPhone,
  IconTrash,
  IconWhatsapp,
  IconX,
  Money,
  RepeatChip,
  formatDay,
  formatFull,
} from "./ui";

/**
 * Lead detail panel. Three stacked jobs: act on the lead now (call, log,
 * snooze), edit its fields, and read what happened so far.
 *
 * Rendered as a right-edge sheet. Escape closes it, focus moves in on open and
 * the backdrop traps nothing — a plain, keyboard-friendly panel.
 */

type TimelineEntry =
  | { type: "enquiry"; at: string; enquiry: Lead }
  | { type: "activity"; at: string; activity: Activity };

const dayInput = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(date);
};

export function LeadDrawer({
  contact,
  activities,
  onClose,
  onError,
}: {
  contact: Contact;
  activities: Activity[];
  onClose: () => void;
  onError: (message: string) => void;
}) {
  // The card's own row: the first enquiry, which carries the CRM state.
  const lead = contact.lead;
  const [tab, setTab] = useState<"activity" | "edit">("activity");
  const panelRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function run(work: () => Promise<ActionResult>, after?: () => void) {
    startTransition(async () => {
      const result = await work();
      if (!result.ok) onError(result.error);
      else after?.();
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex" role="dialog" aria-modal="true" aria-label={`כרטיס הליד ${lead.name}`}>
      <button
        type="button"
        aria-label="סגירת הכרטיס"
        onClick={onClose}
        className="flex-1 bg-navy-950/40 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-sand-50 shadow-lift"
      >
        <header className="border-b border-navy-900/10 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-navy-900">{lead.name}</h2>
              <p className="mt-0.5 text-xs text-navy-600">
                {STAGE_META[lead.stage].label} · פנה לראשונה {formatDay(contact.firstEnquiryAt)}
                {contact.isReturning ? ` · לאחרונה ${formatDay(contact.latestEnquiryAt)}` : ""} ·{" "}
                {SOURCE_LABELS[lead.source] ?? lead.source}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <RepeatChip count={contact.enquiryCount} />
                <ConsentChip granted={contact.marketingConsent} />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              data-autofocus
              aria-label="סגירה"
              className="rounded-lg p-1.5 text-navy-600 transition hover:bg-sand-100 hover:text-navy-900"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a href={`tel:${lead.phone}`} className="crm-btn">
              <IconPhone />
              התקשרות
            </a>
            <a
              href={`https://wa.me/${waNumber(lead.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="crm-btn"
            >
              <IconWhatsapp />
              וואטסאפ
            </a>
            {lead.email ? (
              <a href={`mailto:${lead.email}`} className="crm-btn">
                <IconMail />
                אימייל
              </a>
            ) : null}
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="flex gap-1.5">
              <dt className="text-navy-600">טלפון</dt>
              <dd className="crm-num font-semibold text-navy-800" dir="ltr">
                {lead.phone}
              </dd>
            </div>
            <div className="flex gap-1.5 overflow-hidden">
              <dt className="text-navy-600">אימייל</dt>
              <dd className="truncate font-semibold text-navy-800" dir="ltr">
                {lead.email || "—"}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-navy-600">שווי משוער</dt>
              <dd className="font-semibold text-navy-800">
                <Money value={lead.estimatedValue} />
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-navy-600">קשר אחרון</dt>
              <dd className="font-semibold text-navy-800">{formatDay(lead.lastContactedAt)}</dd>
            </div>
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FollowUpChip value={lead.nextFollowUpAt} />
            <span className="text-xs text-navy-600">דחיית מעקב:</span>
            {[
              { label: "היום", days: 0 },
              { label: "מחר", days: 1 },
              { label: "+3", days: 3 },
              { label: "שבוע", days: 7 },
            ].map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => run(() => snoozeLeadAction(lead.id, option.days))}
                className="rounded-md border border-navy-900/15 bg-white px-2 py-0.5 text-xs font-semibold text-navy-700 transition hover:border-gold-700 hover:text-gold-700"
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex gap-1 border-b border-navy-900/10 bg-white px-5">
          {(
            [
              ["activity", "מה קרה עד כה"],
              ["edit", "עריכת פרטים"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-current={tab === key ? "true" : undefined}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
                tab === key
                  ? "border-gold-700 text-navy-900"
                  : "border-transparent text-navy-600 hover:text-navy-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "activity" ? (
            <ActivityTab
              contact={contact}
              activities={activities}
              onError={onError}
              onDelete={(id) => run(() => deleteActivityAction(id))}
            />
          ) : (
            <EditTab lead={lead} onError={onError} onSaved={() => setTab("activity")} />
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-navy-900/10 bg-white px-5 py-3">
          <button
            type="button"
            onClick={() => run(() => archiveLeadAction(lead.id, !lead.isArchived), onClose)}
            className="crm-btn"
          >
            <IconArchive />
            {lead.isArchived ? "החזרה מהארכיון" : "לארכיון"}
          </button>
          <DeleteButton
            name={lead.name}
            enquiryCount={contact.enquiryCount}
            onConfirm={() => run(() => deleteLeadAction(lead.id), onClose)}
          />
        </footer>
      </div>
    </div>
  );
}

/** Two-step delete: the row is gone for good, so one click is not enough. */
function DeleteButton({
  name,
  enquiryCount,
  onConfirm,
}: {
  name: string;
  enquiryCount: number;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(timer);
  }, [armed]);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="crm-btn !border-danger-700/30 !text-danger-700 hover:!bg-danger-700/5"
      >
        <IconTrash />
        מחיקה
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onConfirm}
      className="inline-flex items-center gap-1.5 rounded-lg bg-danger-700 px-3 py-2 text-sm font-bold text-white transition hover:brightness-110"
    >
      <IconTrash />
      {enquiryCount > 1
        ? `למחוק את ${name} ואת ${enquiryCount} הפניות? לחצו שוב`
        : `למחוק את ${name}? לחצו שוב`}
    </button>
  );
}

// -------------------------------------------------------------- activity ----

function ActivityTab({
  contact,
  activities,
  onError,
  onDelete,
}: {
  contact: Contact;
  activities: Activity[];
  onError: (message: string) => void;
  onDelete: (id: string) => void;
}) {
  const lead = contact.lead;
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addActivityAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
    else if (state && !state.ok) onError(state.error);
  }, [state, onError]);

  /**
   * One stream, newest first: every enquiry this person sent through the site,
   * interleaved with what was logged about them. Seeing "פנייה מהאתר" land
   * between two calls is the whole point of merging repeat enquiries.
   */
  const timeline = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = [
      ...contact.enquiries
        .filter((enquiry) => enquiry.message || enquiry.source === "website")
        .map((enquiry) => ({
          type: "enquiry" as const,
          at: enquiry.createdAt,
          enquiry,
        })),
      ...activities.map((activity) => ({
        type: "activity" as const,
        at: activity.happenedAt,
        activity,
      })),
    ];
    return entries.sort((a, b) => b.at.localeCompare(a.at));
  }, [contact.enquiries, activities]);

  return (
    <div className="space-y-5">
      <form ref={formRef} action={action} className="card space-y-3 p-4">
        <input type="hidden" name="leadId" value={lead.id} />
        <h3 className="text-sm font-bold text-navy-800">תיעוד אינטראקציה</h3>

        <div className="flex flex-wrap gap-1.5">
          {LOGGABLE_KINDS.map((kind, index) => (
            <label
              key={kind}
              className="cursor-pointer rounded-lg border border-navy-900/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition has-checked:border-gold-700 has-checked:bg-gold-300/20 has-checked:text-navy-900"
            >
              <input
                type="radio"
                name="kind"
                value={kind}
                defaultChecked={index === 0}
                className="sr-only"
              />
              {ACTIVITY_META[kind].label}
            </label>
          ))}
        </div>

        <div>
          <label htmlFor="activity-body" className="crm-label">
            מה קרה
          </label>
          <textarea
            id="activity-body"
            name="body"
            rows={3}
            required
            maxLength={5000}
            placeholder="למשל: שיחה ראשונה. מחפש אשראי של 300 אלף להרחבת מחלבה. ביקש הצעה עד סוף השבוע."
            className="crm-field resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="activity-date" className="crm-label">
              תאריך
            </label>
            <input
              id="activity-date"
              name="happenedAt"
              type="date"
              defaultValue={dayInput(new Date().toISOString())}
              className="crm-field"
            />
          </div>
          <div>
            <label htmlFor="activity-follow" className="crm-label">
              מעקב הבא (לא חובה)
            </label>
            <input id="activity-follow" name="nextFollowUpAt" type="date" className="crm-field" />
          </div>
        </div>

        <button type="submit" disabled={pending} className="crm-btn-primary w-full">
          {pending ? "שומר…" : "שמירת תיעוד"}
        </button>
      </form>

      {lead.notes ? (
        <section>
          <h3 className="mb-1.5 text-sm font-bold text-navy-800">הערות</h3>
          <p className="card p-3 text-sm leading-6 whitespace-pre-wrap text-navy-700">
            {lead.notes}
          </p>
        </section>
      ) : null}

      <section>
        <h3 className="mb-2 text-sm font-bold text-navy-800">
          יומן ({timeline.length})
        </h3>
        {timeline.length === 0 ? (
          <p className="card p-4 text-center text-xs text-navy-600">
            עוד לא תועדה אף אינטראקציה.
          </p>
        ) : (
          <ol className="space-y-2">
            {timeline.map((entry) => {
              if (entry.type === "enquiry") {
                const enquiry = entry.enquiry;
                return (
                  <li
                    key={`enquiry-${enquiry.id}`}
                    className="card border-r-4 border-r-gold-700 p-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold text-navy-800">
                        פנייה מהאתר · {serviceLabel(enquiry.service)}
                      </span>
                      <span className="shrink-0 text-[11px] text-navy-600">
                        {formatFull(enquiry.createdAt)}
                      </span>
                    </div>
                    {enquiry.message ? (
                      <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-navy-700">
                        {enquiry.message}
                      </p>
                    ) : null}
                    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-navy-600">
                      {enquiry.sourcePage ? <span dir="ltr">{enquiry.sourcePage}</span> : null}
                      <ConsentChip granted={enquiry.marketingConsent} />
                    </p>
                  </li>
                );
              }

              const activity = entry.activity;
              const meta = ACTIVITY_META[activity.kind];
              const Icon = ACTIVITY_ICONS[activity.kind];
              const manual = activity.kind !== "stage_change" && activity.kind !== "system";
              return (
                <li key={activity.id} className="card flex gap-3 p-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-200 text-navy-700">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold text-navy-800">{meta.label}</span>
                      <span className="shrink-0 text-[11px] text-navy-600">
                        {formatFull(activity.happenedAt)}
                      </span>
                    </div>
                    {activity.body ? (
                      <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-navy-700">
                        {activity.body}
                      </p>
                    ) : null}
                  </div>
                  {manual ? (
                    <button
                      type="button"
                      onClick={() => onDelete(activity.id)}
                      aria-label="מחיקת התיעוד"
                      className="self-start rounded-md p-1 text-navy-600 transition hover:bg-sand-100 hover:text-danger-700"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ edit ----

function EditTab({
  lead,
  onError,
  onSaved,
}: {
  lead: Lead;
  onError: (message: string) => void;
  onSaved: () => void;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateLeadAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) onSaved();
    else if (state && !state.ok) onError(state.error);
  }, [state, onError, onSaved]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={lead.id} />
      <LeadFields lead={lead} />
      <button type="submit" disabled={pending} className="crm-btn-primary w-full">
        {pending ? "שומר…" : "שמירת שינויים"}
      </button>
    </form>
  );
}

/** The field set shared by the edit form and the new-lead dialog. */
export function LeadFields({ lead }: { lead?: Lead }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="crm-label">
            שם מלא *
          </label>
          <input
            id="lead-name"
            name="name"
            required
            maxLength={100}
            defaultValue={lead?.name}
            className="crm-field"
          />
        </div>
        <div>
          <label htmlFor="lead-phone" className="crm-label">
            טלפון *
          </label>
          <input
            id="lead-phone"
            name="phone"
            required
            dir="ltr"
            inputMode="tel"
            maxLength={20}
            defaultValue={lead?.phone}
            className="crm-field text-right"
          />
        </div>
      </div>

      <div>
        <label htmlFor="lead-email" className="crm-label">
          אימייל
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          dir="ltr"
          maxLength={254}
          defaultValue={lead?.email}
          className="crm-field text-right"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-service" className="crm-label">
            שירות
          </label>
          <select
            id="lead-service"
            name="service"
            defaultValue={lead?.service ?? ""}
            className="crm-field"
          >
            <option value="">לא צוין</option>
            {Object.entries(SERVICE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-stage" className="crm-label">
            שלב
          </label>
          <select
            id="lead-stage"
            name="stage"
            defaultValue={lead?.stage ?? "new"}
            className="crm-field"
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_META[stage].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-priority" className="crm-label">
            עדיפות
          </label>
          <select
            id="lead-priority"
            name="priority"
            defaultValue={lead?.priority ?? "normal"}
            className="crm-field"
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-source" className="crm-label">
            מקור
          </label>
          <select
            id="lead-source"
            name="source"
            defaultValue={lead?.source ?? "manual"}
            className="crm-field"
          >
            {SOURCES.map((source) => (
              <option key={source} value={source}>
                {SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-value" className="crm-label">
            שווי משוער (₪)
          </label>
          <input
            id="lead-value"
            name="estimatedValue"
            inputMode="numeric"
            dir="ltr"
            defaultValue={lead?.estimatedValue ?? ""}
            className="crm-field text-right"
          />
        </div>
        <div>
          <label htmlFor="lead-follow" className="crm-label">
            מעקב הבא
          </label>
          <input
            id="lead-follow"
            name="nextFollowUpAt"
            type="date"
            defaultValue={dayInput(lead?.nextFollowUpAt ?? null)}
            className="crm-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="lead-owner" className="crm-label">
          אחראי
        </label>
        <input
          id="lead-owner"
          name="owner"
          maxLength={100}
          defaultValue={lead?.owner ?? ""}
          className="crm-field"
        />
      </div>

      <div>
        <label htmlFor="lead-notes" className="crm-label">
          הערות
        </label>
        <textarea
          id="lead-notes"
          name="notes"
          rows={3}
          maxLength={5000}
          defaultValue={lead?.notes ?? ""}
          className="crm-field resize-y"
        />
      </div>

      <div>
        <label htmlFor="lead-lost" className="crm-label">
          סיבת סגירה (אם לא יצא לפועל)
        </label>
        <input
          id="lead-lost"
          name="lostReason"
          maxLength={500}
          defaultValue={lead?.lostReason ?? ""}
          className="crm-field"
        />
      </div>

      {/* Preserved as-is: the message belongs to the visitor, not to the CRM. */}
      {lead ? <input type="hidden" name="message" value={lead.message ?? ""} /> : null}
    </>
  );
}
