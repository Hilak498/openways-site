"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";

import { moveLeadAction } from "@/app/crm/actions";
import type { Contact } from "@/lib/crm/contacts";
import {
  OPEN_STAGES,
  STAGES,
  STAGE_META,
  serviceLabel,
  type Stage,
} from "@/lib/crm/types";

import {
  ConsentChip,
  FollowUpChip,
  IconPhone,
  IconWhatsapp,
  Money,
  PriorityChip,
  RepeatChip,
} from "./ui";

/**
 * Kanban board.
 *
 * Dragging is an enhancement, not the only way: a focused card also moves with
 * Ctrl/⌘ + ← → (RTL: ← is the next stage), and the drawer's stage field works
 * with any input device. The board is RTL, so the first column sits at the
 * right edge.
 */

type Move = { leadId: string; stage: Stage; boardOrder: number };

export function Board({
  contacts,
  onOpen,
  onError,
}: {
  contacts: Contact[];
  onOpen: (leadId: string) => void;
  onError: (message: string) => void;
}) {
  // The move applies to the card's own row — the first enquiry, which is where
  // the CRM state lives (see lib/crm/contacts.ts).
  const [optimisticContacts, applyMove] = useOptimistic(
    contacts,
    (state: Contact[], move: Move) =>
      state.map((contact) =>
        contact.lead.id === move.leadId
          ? { ...contact, lead: { ...contact.lead, stage: move.stage, boardOrder: move.boardOrder } }
          : contact,
      ),
  );
  const [, startTransition] = useTransition();
  const [dragging, setDragging] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  /** Cards are sorted newest-first, so "top of the column" is the largest order. */
  const dragContact = useRef<Contact | null>(null);

  const byStage = (stage: Stage) =>
    optimisticContacts
      .filter((contact) => contact.lead.stage === stage)
      .sort((a, b) => (b.lead.boardOrder ?? 0) - (a.lead.boardOrder ?? 0));

  /** Moves a card to the top of the target column. */
  function move(contact: Contact, stage: Stage) {
    const column = byStage(stage).filter((item) => item.key !== contact.key);
    const boardOrder = (column[0]?.lead.boardOrder ?? 0) + 1000;
    const leadId = contact.lead.id;

    startTransition(async () => {
      applyMove({ leadId, stage, boardOrder });
      const result = await moveLeadAction({ leadId, stage, boardOrder });
      if (!result.ok) onError(result.error);
    });
  }

  function onCardKeyDown(event: React.KeyboardEvent, contact: Contact) {
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = STAGES.indexOf(contact.lead.stage);
    // RTL board: ArrowLeft advances along the pipeline, ArrowRight goes back.
    const next = event.key === "ArrowLeft" ? index + 1 : index - 1;
    if (next < 0 || next >= STAGES.length) return;
    move(contact, STAGES[next]);
  }

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <p className="sr-only" id="crm-board-help">
        אפשר לגרור כרטיס בין עמודות, או למקד כרטיס וללחוץ Ctrl וחץ שמאלה או ימינה כדי להעביר אותו
        שלב.
      </p>
      <div className="flex min-h-[28rem] items-stretch gap-3" aria-describedby="crm-board-help">
        {STAGES.map((stage) => {
          const column = byStage(stage);
          const total = column.reduce(
            (sum, contact) => sum + (contact.lead.estimatedValue ?? 0),
            0,
          );
          const meta = STAGE_META[stage];

          return (
            <section
              key={stage}
              className="crm-column"
              data-over={overStage === stage ? "true" : "false"}
              aria-label={`${meta.label} — ${column.length} לידים`}
              onDragOver={(event) => {
                event.preventDefault();
                setOverStage(stage);
              }}
              onDragLeave={(event) => {
                // Ignore the events fired while crossing child cards.
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setOverStage((current) => (current === stage ? null : current));
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setOverStage(null);
                const dragged = dragContact.current;
                dragContact.current = null;
                setDragging(null);
                if (dragged) move(dragged, stage);
              }}
            >
              <header className="flex items-baseline justify-between px-2 pt-1 pb-2">
                <h2 className="text-sm font-bold text-navy-800">
                  {meta.label}
                  <span className="crm-num mr-1.5 rounded-full bg-white px-1.5 text-xs font-semibold text-navy-600">
                    {column.length}
                  </span>
                </h2>
                {total > 0 ? (
                  <span className="text-xs font-semibold text-navy-600">
                    <Money value={total} />
                  </span>
                ) : null}
              </header>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {column.map((contact) => {
                  const lead = contact.lead;
                  return (
                  <article
                    key={contact.key}
                    className="crm-card cursor-grab active:cursor-grabbing"
                    draggable
                    data-dragging={dragging === lead.id ? "true" : "false"}
                    onDragStart={(event) => {
                      dragContact.current = contact;
                      setDragging(lead.id);
                      event.dataTransfer.effectAllowed = "move";
                      // Firefox refuses to start a drag without payload.
                      event.dataTransfer.setData("text/plain", lead.id);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOverStage(null);
                    }}
                    onKeyDown={(event) => onCardKeyDown(event, contact)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onOpen(lead.id)}
                        className="text-right text-sm font-bold text-navy-900 underline-offset-4 hover:underline"
                      >
                        {lead.name}
                      </button>
                      <PriorityChip priority={lead.priority} />
                    </div>

                    <p className="mt-1 text-xs text-navy-600">
                      {contact.services.length > 0
                        ? contact.services.map(serviceLabel).join(" · ")
                        : serviceLabel(null)}
                    </p>

                    {lead.estimatedValue ? (
                      <p className="mt-1.5 text-sm font-bold text-navy-800">
                        <Money value={lead.estimatedValue} />
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <FollowUpChip value={lead.nextFollowUpAt} />
                      <RepeatChip count={contact.enquiryCount} />
                      <ConsentChip granted={contact.marketingConsent} compact />
                      {lead.owner ? (
                        <span className="crm-chip bg-navy-900/6 text-navy-600">{lead.owner}</span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-center gap-1 border-t border-navy-900/5 pt-2">
                      <a
                        href={`tel:${lead.phone}`}
                        aria-label={`התקשרות ל${lead.name}`}
                        className="rounded-md p-1.5 text-navy-600 transition hover:bg-sand-100 hover:text-navy-900"
                      >
                        <IconPhone />
                      </a>
                      <a
                        href={`https://wa.me/${waNumber(lead.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`וואטסאפ ל${lead.name}`}
                        className="rounded-md p-1.5 text-navy-600 transition hover:bg-sand-100 hover:text-navy-900"
                      >
                        <IconWhatsapp />
                      </a>
                      <span className="crm-num mr-auto text-[11px] text-navy-600" dir="ltr">
                        {lead.phone}
                      </span>
                    </div>
                  </article>
                  );
                })}

                {column.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-navy-900/15 px-3 py-6 text-center text-xs text-navy-600">
                    {OPEN_STAGES.includes(stage) ? meta.hint : "—"}
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** 054-1234567 -> 972541234567, so wa.me opens the right chat. */
export function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}
