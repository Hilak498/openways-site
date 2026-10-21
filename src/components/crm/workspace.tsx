"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { logoutAction } from "@/app/crm/actions";
import type { Contact } from "@/lib/crm/contacts";
import {
  OPEN_STAGES,
  SERVICE_LABELS,
  STAGES,
  STAGE_META,
  followUpState,
  type Activity,
  type Stage,
} from "@/lib/crm/types";
import type { CrmStats } from "@/lib/crm/stats";

import { Board } from "./board";
import { Dashboard } from "./dashboard";
import { ImportDialog, NewLeadDialog } from "./dialogs";
import { LeadDrawer } from "./lead-drawer";
import { LeadTable } from "./table";
import {
  FollowUpChip,
  IconAlert,
  IconDownload,
  IconPlus,
  IconSearch,
  IconUpload,
  IconX,
} from "./ui";

/**
 * The CRM shell: view switch, filters, the follow-up queue and the dialogs.
 *
 * All leads arrive from the server in one payload, so filtering, sorting and
 * searching are instant and local; only mutations go back to the server.
 */

type View = "board" | "table" | "dashboard";

export function Workspace({
  contacts,
  activities,
  stats,
  showArchived,
}: {
  contacts: Contact[];
  activities: Activity[];
  stats: CrmStats;
  showArchived: boolean;
}) {
  const [view, setView] = useState<View>("board");
  const [query, setQuery] = useState("");
  const [service, setService] = useState<string>("all");
  const [owner, setOwner] = useState<string>("all");
  const [onlyDue, setOnlyDue] = useState(false);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"new" | "import" | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const owners = useMemo(
    () => [
      ...new Set(
        contacts.map((contact) => contact.lead.owner).filter((v): v is string => Boolean(v)),
      ),
    ],
    [contacts],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return contacts.filter((contact) => {
      const lead = contact.lead;
      // A contact matches a service if any of their enquiries asked about it.
      if (service !== "all" && !contact.services.includes(service)) return false;
      if (owner !== "all" && (lead.owner ?? "") !== owner) return false;
      if (onlyDue) {
        const state = followUpState(lead.nextFollowUpAt);
        if (state !== "overdue" && state !== "today") return false;
        if (!OPEN_STAGES.includes(lead.stage)) return false;
      }
      if (!needle) return true;
      // Search covers every enquiry's text, not just the card's own row.
      return contact.enquiries.some((enquiry) =>
        [enquiry.name, enquiry.phone, enquiry.email, enquiry.notes, enquiry.message, enquiry.owner]
          .filter(Boolean)
          .some((field) => (field as string).toLowerCase().includes(needle)),
      );
    });
  }, [contacts, query, service, owner, onlyDue]);

  // Derived, not stored: a contact that was deleted or archived resolves to
  // null here and the drawer unmounts without any extra bookkeeping.
  const openContact = openLeadId
    ? contacts.find((contact) => contact.lead.id === openLeadId) ?? null
    : null;
  const openActivities = useMemo(() => {
    if (!openContact) return [];
    const ids = new Set(openContact.enquiries.map((enquiry) => enquiry.id));
    return activities.filter((item) => ids.has(item.leadId));
  }, [activities, openContact]);

  const dueContacts = filtered
    .filter((contact) => OPEN_STAGES.includes(contact.lead.stage))
    .filter((contact) => {
      const state = followUpState(contact.lead.nextFollowUpAt);
      return state === "overdue" || state === "today";
    })
    .sort((a, b) =>
      (a.lead.nextFollowUpAt ?? "").localeCompare(b.lead.nextFollowUpAt ?? ""),
    );

  const filtersActive = query !== "" || service !== "all" || owner !== "all" || onlyDue;

  return (
    <div id="crm-root" className="flex min-h-svh flex-col bg-sand-100">
      <header className="sticky top-0 z-40 border-b border-navy-900/10 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-bold text-navy-900">CRM</h1>
            <span className="text-xs text-navy-600">Open Ways · ניהול לידים</span>
          </div>

          <nav aria-label="תצוגה" className="flex rounded-lg bg-sand-200 p-0.5">
            {(
              [
                ["board", "לוח"],
                ["table", "טבלה"],
                ["dashboard", "דשבורד"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-current={view === key ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  view === key
                    ? "bg-white text-navy-900 shadow-sm"
                    : "text-navy-600 hover:text-navy-900"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="mr-auto flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setDialog("new")} className="crm-btn-primary">
              <IconPlus />
              ליד חדש
            </button>
            <button type="button" onClick={() => setDialog("import")} className="crm-btn">
              <IconUpload />
              ייבוא
            </button>
            <a href="/crm/export" className="crm-btn" download>
              <IconDownload />
              ייצוא
            </a>
            <form action={logoutAction}>
              <button type="submit" className="crm-btn">
                יציאה
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-navy-900/5 px-4 py-2">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-2.5 right-2.5 h-4 w-4 text-navy-600" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="חיפוש בשם, טלפון, אימייל או הערה"
              aria-label="חיפוש לידים"
              className="crm-field w-72 pr-8"
            />
          </div>

          <select
            value={service}
            onChange={(event) => setService(event.target.value)}
            aria-label="סינון לפי שירות"
            className="crm-field w-auto"
          >
            <option value="all">כל השירותים</option>
            {Object.entries(SERVICE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {owners.length > 0 ? (
            <select
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              aria-label="סינון לפי אחראי"
              className="crm-field w-auto"
            >
              <option value="all">כל האחראים</option>
              {owners.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          ) : null}

          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm font-semibold text-navy-700 transition has-checked:border-danger-700/40 has-checked:bg-danger-700/5 has-checked:text-danger-700">
            <input
              type="checkbox"
              checked={onlyDue}
              onChange={(event) => setOnlyDue(event.target.checked)}
              className="accent-navy-900"
            />
            <IconAlert className="h-3.5 w-3.5" />
            רק מעקבים לטיפול
            {stats.overdueCount + stats.todayCount > 0 ? (
              <span className="crm-num rounded-full bg-danger-700 px-1.5 text-xs font-bold text-white">
                {stats.overdueCount + stats.todayCount}
              </span>
            ) : null}
          </label>

          {filtersActive ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setService("all");
                setOwner("all");
                setOnlyDue(false);
              }}
              className="crm-btn"
            >
              <IconX className="h-3.5 w-3.5" />
              ניקוי סינון
            </button>
          ) : null}

          <span className="crm-num mr-auto text-xs text-navy-600">
            {filtered.length} מתוך {contacts.length} אנשי קשר
            {stats.enquiryTotal > stats.total ? ` · ${stats.enquiryTotal} פניות` : ""}
          </span>

          <Link
            href={showArchived ? "/crm" : "/crm?archived=1"}
            className="text-xs font-semibold text-navy-600 underline underline-offset-4 hover:text-gold-700"
          >
            {showArchived ? "הסתרת ארכיון" : "הצגת ארכיון"}
          </Link>
        </div>
      </header>

      {dueContacts.length > 0 && view !== "dashboard" ? (
        <section
          aria-label="מעקבים לטיפול"
          className="border-b border-navy-900/10 bg-white px-4 py-2.5"
        >
          <div className="flex items-start gap-3">
            <h2 className="flex shrink-0 items-center gap-1.5 pt-1 text-xs font-bold text-navy-800">
              <IconAlert className="h-3.5 w-3.5 text-danger-700" />
              לטיפול עכשיו
            </h2>
            <ul className="flex flex-wrap gap-2">
              {dueContacts.slice(0, 12).map((contact) => (
                <li key={contact.key}>
                  <button
                    type="button"
                    onClick={() => setOpenLeadId(contact.lead.id)}
                    className="flex items-center gap-2 rounded-lg border border-navy-900/10 bg-sand-50 px-2.5 py-1.5 text-xs font-semibold text-navy-800 transition hover:border-gold-700 hover:bg-gold-300/10"
                  >
                    {contact.lead.name}
                    <FollowUpChip value={contact.lead.nextFollowUpAt} />
                  </button>
                </li>
              ))}
              {dueContacts.length > 12 ? (
                <li className="self-center text-xs text-navy-600">
                  ועוד {dueContacts.length - 12}
                </li>
              ) : null}
            </ul>
          </div>
        </section>
      ) : null}

      {view === "board" ? (
        <Board
          contacts={filtered}
          onOpen={setOpenLeadId}
          onError={(text) => setToast({ kind: "error", text })}
        />
      ) : null}
      {view === "table" ? <LeadTable contacts={filtered} onOpen={setOpenLeadId} /> : null}
      {view === "dashboard" ? <Dashboard stats={stats} contacts={contacts} /> : null}

      {contacts.length === 0 ? (
        <div className="px-4 pb-10">
          <div className="card mx-auto max-w-lg p-6 text-center">
            <h2 className="text-base font-bold text-navy-900">הלוח ריק</h2>
            <p className="mt-2 text-sm leading-6 text-navy-700">
              כל פנייה מטופס יצירת הקשר באתר תיפול לכאן אוטומטית, לעמודה
              &quot;{STAGE_META[STAGES[0]].label}&quot;. עד אז אפשר להוסיף ליד ידנית או לייבא
              רשימה קיימת מאקסל.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" onClick={() => setDialog("new")} className="crm-btn-primary">
                <IconPlus />
                ליד חדש
              </button>
              <button type="button" onClick={() => setDialog("import")} className="crm-btn">
                <IconUpload />
                ייבוא מ-CSV
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {openContact ? (
        <LeadDrawer
          contact={openContact}
          activities={openActivities}
          onClose={() => setOpenLeadId(null)}
          onError={(text) => setToast({ kind: "error", text })}
        />
      ) : null}

      {dialog === "new" ? (
        <NewLeadDialog
          onClose={() => setDialog(null)}
          onDone={(text) => setToast({ kind: "ok", text })}
          onError={(text) => setToast({ kind: "error", text })}
        />
      ) : null}

      {dialog === "import" ? (
        <ImportDialog
          onClose={() => setDialog(null)}
          onDone={(text) => setToast({ kind: "ok", text })}
          onError={(text) => setToast({ kind: "error", text })}
        />
      ) : null}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lift ${
            toast.kind === "ok" ? "bg-navy-900 text-white" : "bg-danger-700 text-white"
          }`}
        >
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

/** Stage order is part of the public contract of the board; re-exported for tests. */
export const BOARD_STAGES: Stage[] = [...STAGES];
