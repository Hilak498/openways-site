import {
  OPEN_STAGES,
  STAGES,
  followUpState,
  type Lead,
  type Stage,
} from "./types";

/**
 * Dashboard figures, derived from the lead list already loaded for the board —
 * no extra round trip, and the numbers always match what the board shows.
 */

export type StageBucket = {
  stage: Stage;
  count: number;
  value: number;
};

export type CrmStats = {
  total: number;
  byStage: StageBucket[];
  /** Open opportunities: everything not won and not lost. */
  openCount: number;
  openValue: number;
  wonCount: number;
  wonValue: number;
  lostCount: number;
  /** Won / (won + lost), as a percentage of decided leads. 0 when none decided. */
  closeRate: number;
  overdueCount: number;
  todayCount: number;
  /** Open leads with no follow-up date — the ones that quietly go cold. */
  noFollowUpCount: number;
  newThisMonth: number;
  newLast30Days: number;
  byService: { service: string; count: number }[];
  bySource: { source: string; count: number }[];
};

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function computeStats(leads: Lead[], now = new Date()): CrmStats {
  const byStage: StageBucket[] = STAGES.map((stage) => {
    const inStage = leads.filter((lead) => lead.stage === stage);
    return {
      stage,
      count: inStage.length,
      value: sum(inStage.map((lead) => lead.estimatedValue ?? 0)),
    };
  });

  const open = leads.filter((lead) => OPEN_STAGES.includes(lead.stage));
  const won = leads.filter((lead) => lead.stage === "won");
  const lost = leads.filter((lead) => lead.stage === "lost");
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
    total: leads.length,
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
    newThisMonth: leads.filter((lead) => new Date(lead.createdAt) >= monthStart).length,
    newLast30Days: leads.filter((lead) => new Date(lead.createdAt) >= thirtyDaysAgo).length,
    byService: counter(leads.map((lead) => lead.service)).map(({ key, count }) => ({
      service: key,
      count,
    })),
    bySource: counter(leads.map((lead) => lead.source)).map(({ key, count }) => ({
      source: key,
      count,
    })),
  };
}

/** Open leads that need attention, soonest first; undated ones last. */
export function followUpQueue(leads: Lead[], now = new Date()): Lead[] {
  return leads
    .filter((lead) => OPEN_STAGES.includes(lead.stage))
    .filter((lead) => {
      const state = followUpState(lead.nextFollowUpAt, now);
      return state === "overdue" || state === "today";
    })
    .sort((a, b) => (a.nextFollowUpAt ?? "").localeCompare(b.nextFollowUpAt ?? ""));
}
