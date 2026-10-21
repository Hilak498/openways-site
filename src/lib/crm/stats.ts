import type { Contact } from "./contacts";
import { OPEN_STAGES, STAGES, followUpState, type Lead, type Stage } from "./types";

/**
 * Dashboard figures.
 *
 * Two different units, deliberately kept apart so no number is quietly wrong:
 * pipeline figures count **contacts** (a person in "הצעה" is one opportunity,
 * however many times they wrote in), while intake figures count **enquiries**
 * (how much work came through the door). Every label says which.
 */

export type StageBucket = {
  stage: Stage;
  count: number;
  value: number;
};

export type CrmStats = {
  /** Contacts. */
  total: number;
  byStage: StageBucket[];
  openCount: number;
  openValue: number;
  wonCount: number;
  wonValue: number;
  lostCount: number;
  /** Won / (won + lost), as a percentage of decided contacts. */
  closeRate: number;
  overdueCount: number;
  todayCount: number;
  noFollowUpCount: number;
  returningCount: number;
  /** Enquiries (rows), not contacts. */
  enquiryTotal: number;
  newThisMonth: number;
  newLast30Days: number;
  byService: { service: string; count: number }[];
  bySource: { source: string; count: number }[];
};

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function computeStats(contacts: Contact[], now = new Date()): CrmStats {
  const cards = contacts.map((contact) => contact.lead);
  const enquiries: Lead[] = contacts.flatMap((contact) => contact.enquiries);

  const byStage: StageBucket[] = STAGES.map((stage) => {
    const inStage = cards.filter((lead) => lead.stage === stage);
    return {
      stage,
      count: inStage.length,
      value: sum(inStage.map((lead) => lead.estimatedValue ?? 0)),
    };
  });

  const open = cards.filter((lead) => OPEN_STAGES.includes(lead.stage));
  const won = cards.filter((lead) => lead.stage === "won");
  const lost = cards.filter((lead) => lead.stage === "lost");
  const decided = won.length + lost.length;

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const counter = (values: (string | null)[]) => {
    const map = new Map<string, number>();
    for (const value of values) {
      const key = value ?? "—";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    total: contacts.length,
    byStage,
    openCount: open.length,
    openValue: sum(open.map((lead) => lead.estimatedValue ?? 0)),
    wonCount: won.length,
    wonValue: sum(won.map((lead) => lead.estimatedValue ?? 0)),
    lostCount: lost.length,
    closeRate: decided === 0 ? 0 : Math.round((won.length / decided) * 100),
    overdueCount: open.filter((lead) => followUpState(lead.nextFollowUpAt, now) === "overdue")
      .length,
    todayCount: open.filter((lead) => followUpState(lead.nextFollowUpAt, now) === "today").length,
    noFollowUpCount: open.filter((lead) => !lead.nextFollowUpAt).length,
    returningCount: contacts.filter((contact) => contact.isReturning).length,
    enquiryTotal: enquiries.length,
    newThisMonth: enquiries.filter((lead) => new Date(lead.createdAt) >= monthStart).length,
    newLast30Days: enquiries.filter((lead) => new Date(lead.createdAt) >= thirtyDaysAgo).length,
    byService: counter(enquiries.map((lead) => lead.service)).map(({ key, count }) => ({
      service: key,
      count,
    })),
    bySource: counter(enquiries.map((lead) => lead.source)).map(({ key, count }) => ({
      source: key,
      count,
    })),
  };
}

/** Contacts that need attention, soonest first. */
export function followUpQueue(contacts: Contact[], now = new Date()): Contact[] {
  return contacts
    .filter((contact) => OPEN_STAGES.includes(contact.lead.stage))
    .filter((contact) => {
      const state = followUpState(contact.lead.nextFollowUpAt, now);
      return state === "overdue" || state === "today";
    })
    .sort((a, b) =>
      (a.lead.nextFollowUpAt ?? "").localeCompare(b.lead.nextFollowUpAt ?? ""),
    );
}
