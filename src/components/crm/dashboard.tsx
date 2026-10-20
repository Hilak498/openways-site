"use client";

import {
  SERVICE_LABELS,
  SOURCE_LABELS,
  STAGES,
  STAGE_META,
  type Lead,
} from "@/lib/crm/types";
import type { CrmStats } from "@/lib/crm/stats";

import { IconAlert, IconCheck, IconClock, Money } from "./ui";

/** The stats rows carry plain strings, including the "—" bucket for no value. */
const sourceLabel = (source: string): string =>
  (SOURCE_LABELS as Record<string, string>)[source] ?? (source === "—" ? "לא צוין" : source);

/**
 * Dashboard.
 *
 * Every figure is one measure of one series, so the charts are single-hue bars
 * with the number written on each row — no categorical palette, no legend, and
 * nothing that depends on telling two colours apart. The only colour that
 * carries meaning is the overdue count, and it ships with an icon and a word.
 */

function Tile({
  label,
  value,
  hint,
  tone = "plain",
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "plain" | "good" | "alert";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const toneClass =
    tone === "good" ? "text-ok-700" : tone === "alert" ? "text-danger-700" : "text-navy-900";
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-600">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </div>
      <p className={`mt-1.5 text-2xl font-bold ${toneClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-navy-600">{hint}</p> : null}
    </div>
  );
}

/** Horizontal bars, RTL: anchored at the right edge, growing left. */
function BarRow({
  label,
  count,
  max,
  secondary,
}: {
  label: string;
  count: number;
  max: number;
  secondary?: React.ReactNode;
}) {
  const pct = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 py-1">
      <span className="truncate text-xs font-semibold text-navy-700" title={label}>
        {label}
      </span>
      <span className="h-5 w-full bg-sand-200/70" aria-hidden="true">
        <span
          className="block h-full rounded-s-none rounded-e-[4px] bg-navy-800"
          style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
          title={`${label}: ${count}`}
        />
      </span>
      <span className="crm-num min-w-16 text-left text-xs font-bold text-navy-800">
        {count}
        {secondary ? <span className="font-normal text-navy-600"> · {secondary}</span> : null}
      </span>
    </div>
  );
}

export function Dashboard({ stats, leads }: { stats: CrmStats; leads: Lead[] }) {
  const stageMax = Math.max(...stats.byStage.map((bucket) => bucket.count), 1);
  const serviceMax = Math.max(...stats.byService.map((row) => row.count), 1);
  const sourceMax = Math.max(...stats.bySource.map((row) => row.count), 1);

  // Average days from arrival to a won deal — the only derived figure the
  // stats module doesn't carry, since it needs the won rows themselves.
  const wonLeads = leads.filter((lead) => lead.stage === "won" && lead.updatedAt);
  const avgDaysToWin =
    wonLeads.length === 0
      ? null
      : Math.round(
          wonLeads.reduce((sum, lead) => {
            const start = new Date(lead.createdAt).getTime();
            const end = new Date(lead.updatedAt as string).getTime();
            return sum + Math.max(0, (end - start) / (24 * 60 * 60 * 1000));
          }, 0) / wonLeads.length,
        );

  return (
    <div className="flex-1 space-y-5 overflow-y-auto p-4">
      <section>
        <h2 className="mb-3 text-sm font-bold text-navy-800">מצב הצינור</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            label="לידים פתוחים"
            value={stats.openCount}
            hint={`מתוך ${stats.total} בסך הכול`}
          />
          <Tile
            label="שווי פתוח משוער"
            value={<Money value={stats.openValue} />}
            hint="סכום השווי בלידים שלא נסגרו"
          />
          <Tile
            label="אחוז סגירה"
            value={`${stats.closeRate}%`}
            hint={`${stats.wonCount} נסגרו · ${stats.lostCount} לא יצאו לפועל`}
            tone={stats.closeRate >= 50 ? "good" : "plain"}
            icon={IconCheck}
          />
          <Tile
            label="מעקבים באיחור"
            value={stats.overdueCount}
            hint={
              stats.todayCount > 0
                ? `ועוד ${stats.todayCount} לטיפול היום`
                : "אין מעקבים להיום"
            }
            tone={stats.overdueCount > 0 ? "alert" : "good"}
            icon={stats.overdueCount > 0 ? IconAlert : IconCheck}
          />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="text-sm font-bold text-navy-800">לידים לפי שלב</h2>
          <p className="mt-0.5 mb-3 text-xs text-navy-600">
            מספר הלידים בכל שלב, ולצידו השווי המשוער שנצבר בו.
          </p>
          <div>
            {STAGES.map((stage) => {
              const bucket = stats.byStage.find((item) => item.stage === stage);
              return (
                <BarRow
                  key={stage}
                  label={STAGE_META[stage].label}
                  count={bucket?.count ?? 0}
                  max={stageMax}
                  secondary={
                    bucket && bucket.value > 0 ? <Money value={bucket.value} /> : undefined
                  }
                />
              );
            })}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-sm font-bold text-navy-800">לידים לפי שירות</h2>
          <p className="mt-0.5 mb-3 text-xs text-navy-600">
            איזה שירות מביא את מרב הפניות.
          </p>
          <div>
            {stats.byService.map((row) => (
              <BarRow
                key={row.service}
                label={SERVICE_LABELS[row.service] ?? (row.service === "—" ? "לא צוין" : row.service)}
                count={row.count}
                max={serviceMax}
              />
            ))}
            {stats.byService.length === 0 ? (
              <p className="py-4 text-center text-xs text-navy-600">אין נתונים.</p>
            ) : null}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-sm font-bold text-navy-800">מאיפה הם מגיעים</h2>
          <p className="mt-0.5 mb-3 text-xs text-navy-600">מקור הליד, כולל טופס האתר.</p>
          <div>
            {stats.bySource.map((row) => (
              <BarRow
                key={row.source}
                label={sourceLabel(row.source)}
                count={row.count}
                max={sourceMax}
              />
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="mb-3 text-sm font-bold text-navy-800">קצב ועומס</h2>
          <dl className="space-y-2.5 text-sm">
            {[
              { label: "נכנסו החודש", value: String(stats.newThisMonth) },
              { label: "נכנסו ב-30 הימים האחרונים", value: String(stats.newLast30Days) },
              {
                label: "נסגרו בהצלחה",
                value: `${stats.wonCount}`,
                extra: stats.wonValue > 0 ? <Money value={stats.wonValue} /> : null,
              },
              {
                label: "ימים בממוצע עד סגירה",
                value: avgDaysToWin === null ? "—" : String(avgDaysToWin),
              },
              {
                label: "לידים פתוחים בלי תאריך מעקב",
                value: String(stats.noFollowUpCount),
                warn: stats.noFollowUpCount > 0,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b border-navy-900/5 pb-2 last:border-0"
              >
                <dt className="flex items-center gap-1.5 text-navy-700">
                  {row.warn ? <IconClock className="h-3.5 w-3.5 text-navy-600" /> : null}
                  {row.label}
                </dt>
                <dd
                  className={`crm-num font-bold ${row.warn ? "text-navy-900" : "text-navy-800"}`}
                >
                  {row.value}
                  {row.extra ? (
                    <span className="font-normal text-navy-600"> · {row.extra}</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
