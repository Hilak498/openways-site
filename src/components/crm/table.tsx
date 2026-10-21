"use client";

import { useState } from "react";

import type { Contact } from "@/lib/crm/contacts";
import { SOURCE_LABELS, serviceLabel } from "@/lib/crm/types";

import {
  ConsentChip,
  FollowUpChip,
  Money,
  PriorityChip,
  RepeatChip,
  StageChip,
  formatDay,
} from "./ui";

/**
 * Table view — the same leads the board shows, sortable, for scanning many
 * rows at once. Sorting is client-side: the whole list is already in memory.
 */

type SortKey = "name" | "createdAt" | "stage" | "estimatedValue" | "nextFollowUpAt";

const COLUMNS: { key: SortKey | null; label: string; align?: "start" | "end" }[] = [
  { key: "name", label: "שם" },
  { key: null, label: "קשר" },
  { key: null, label: "שירות" },
  { key: "stage", label: "שלב" },
  { key: "estimatedValue", label: "שווי", align: "end" },
  { key: "nextFollowUpAt", label: "מעקב" },
  { key: null, label: "אחראי" },
  { key: null, label: "מקור" },
  { key: "createdAt", label: "פנייה אחרונה" },
  { key: null, label: "דיוור" },
];

export function LeadTable({
  contacts,
  onOpen,
}: {
  contacts: Contact[];
  onOpen: (leadId: string) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  });

  const sorted = [...contacts].sort((first, second) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const a = first.lead;
    const b = second.lead;
    switch (sort.key) {
      case "name":
        return a.name.localeCompare(b.name, "he") * dir;
      case "estimatedValue":
        return ((a.estimatedValue ?? 0) - (b.estimatedValue ?? 0)) * dir;
      case "nextFollowUpAt":
        // Contacts with no follow-up date sort last in both directions.
        if (!a.nextFollowUpAt) return 1;
        if (!b.nextFollowUpAt) return -1;
        return a.nextFollowUpAt.localeCompare(b.nextFollowUpAt) * dir;
      case "stage":
        return a.stage.localeCompare(b.stage) * dir;
      default:
        return first.latestEnquiryAt.localeCompare(second.latestEnquiryAt) * dir;
    }
  });

  const toggle = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="card overflow-hidden">
        <table className="w-full text-right text-sm">
          <caption className="sr-only">רשימת כל הלידים, עם מיון לפי עמודות</caption>
          <thead className="bg-sand-200/80 text-xs">
            <tr>
              {COLUMNS.map((column) => {
                const active = column.key && sort.key === column.key;
                return (
                  <th
                    key={column.label}
                    scope="col"
                    className={`px-3 py-2.5 font-bold text-navy-800 ${
                      column.align === "end" ? "text-left" : "text-right"
                    }`}
                    aria-sort={
                      active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                    }
                  >
                    {column.key ? (
                      <button
                        type="button"
                        onClick={() => toggle(column.key as SortKey)}
                        className="inline-flex items-center gap-1 hover:text-gold-700"
                      >
                        {column.label}
                        <span aria-hidden="true" className="text-[10px]">
                          {active ? (sort.dir === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((contact) => {
              const lead = contact.lead;
              return (
              <tr
                key={contact.key}
                className="border-t border-navy-900/5 transition hover:bg-sand-100/70"
              >
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onOpen(lead.id)}
                    className="font-bold text-navy-900 underline-offset-4 hover:underline"
                  >
                    {lead.name}
                  </button>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    <PriorityChip priority={lead.priority} />
                    <RepeatChip count={contact.enquiryCount} />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <a
                    href={`tel:${lead.phone}`}
                    className="crm-num block text-navy-700 hover:text-gold-700"
                    dir="ltr"
                  >
                    {lead.phone}
                  </a>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="block text-xs text-navy-600 hover:text-gold-700"
                      dir="ltr"
                    >
                      {lead.email}
                    </a>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-navy-700">
                  {contact.services.length > 0
                    ? contact.services.map(serviceLabel).join(" · ")
                    : serviceLabel(null)}
                </td>
                <td className="px-3 py-2.5">
                  <StageChip stage={lead.stage} />
                </td>
                <td className="px-3 py-2.5 text-left font-semibold text-navy-800">
                  <Money value={lead.estimatedValue} />
                </td>
                <td className="px-3 py-2.5">
                  <FollowUpChip value={lead.nextFollowUpAt} />
                  {!lead.nextFollowUpAt ? <span className="text-navy-600">—</span> : null}
                </td>
                <td className="px-3 py-2.5 text-navy-700">{lead.owner ?? "—"}</td>
                <td className="px-3 py-2.5 text-xs text-navy-600">
                  {SOURCE_LABELS[lead.source] ?? lead.source}
                </td>
                <td className="crm-num px-3 py-2.5 text-xs text-navy-600">
                  {formatDay(contact.latestEnquiryAt)}
                </td>
                <td className="px-3 py-2.5">
                  <ConsentChip granted={contact.marketingConsent} />
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-navy-600">אין אנשי קשר להצגה.</p>
        ) : null}
      </div>
    </div>
  );
}
