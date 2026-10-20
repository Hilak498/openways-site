import {
  PRIORITY_LABELS,
  STAGE_META,
  followUpState,
  type Priority,
  type Stage,
} from "@/lib/crm/types";

/**
 * Shared presentation bits for the CRM.
 *
 * Status is never carried by colour alone: every chip pairs its colour with an
 * icon and a word, which is what keeps the red/green pair readable for a
 * colourblind reader (and in forced-colours mode).
 */

/** Hebrew-formatted shekels, forced LTR so the ₪ and digits don't flip. */
export function Money({ value }: { value: number | null }) {
  if (value === null || value === 0) return <span className="text-navy-600">—</span>;
  return (
    <span className="crm-num">
      {`₪${Math.round(value).toLocaleString("he-IL")}`}
    </span>
  );
}

const dayFormat = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Jerusalem",
});

const fullFormat = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jerusalem",
});

export function formatDay(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dayFormat.format(date);
}

export function formatFull(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : fullFormat.format(date);
}

/** "לפני 3 ימים" / "מחר" — relative, in whole days. */
export function relativeDays(value: string | null): string {
  if (!value) return "";
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return "";
  const dayMs = 24 * 60 * 60 * 1000;
  const startOf = (d: Date) => Math.floor(d.getTime() / dayMs);
  const diff = startOf(target) - startOf(new Date());
  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff === -1) return "אתמול";
  if (diff < 0) return `לפני ${Math.abs(diff)} ימים`;
  return `בעוד ${diff} ימים`;
}

// ----------------------------------------------------------------- icons ----

type IconProps = { className?: string };

const svg = (path: React.ReactNode, filled = false) =>
  function Icon({ className = "h-4 w-4" }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };

export const IconCheck = svg(<path d="m5 13 4 4L19 7" />);
export const IconAlert = svg(
  <>
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </>,
);
export const IconClock = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);
export const IconX = svg(<path d="M18 6 6 18M6 6l12 12" />);
export const IconPhone = svg(
  <path d="M15.5 21A13.5 13.5 0 0 1 3 8.5 3 3 0 0 1 6 5.5h1.5a1 1 0 0 1 1 .9l.5 3a1 1 0 0 1-.5 1l-1.3.9a10 10 0 0 0 4.5 4.5l.9-1.3a1 1 0 0 1 1-.5l3 .5a1 1 0 0 1 .9 1V18a3 3 0 0 1-3 3Z" />,
);
export const IconMail = svg(
  <>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>,
);
export const IconCalendar = svg(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 11h18" />
  </>,
);
export const IconNote = svg(
  <>
    <path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v6h6" />
  </>,
);
export const IconArrow = svg(<path d="M19 12H5m7-7-7 7 7 7" />);
export const IconGear = svg(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" />
  </>,
);
export const IconWhatsapp = svg(
  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" />,
);
export const IconPlus = svg(<path d="M12 5v14M5 12h14" />);
export const IconSearch = svg(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
);
export const IconDownload = svg(<path d="M12 4v11m0 0 4-4m-4 4-4-4M4 19h16" />);
export const IconUpload = svg(<path d="M12 20V9m0 0 4 4m-4-4-4 4M4 5h16" />);
export const IconTrash = svg(
  <>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
  </>,
);
export const IconArchive = svg(
  <>
    <rect x="3" y="4" width="18" height="5" rx="1" />
    <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" />
  </>,
);

export const ACTIVITY_ICONS = {
  note: IconNote,
  call: IconPhone,
  meeting: IconCalendar,
  email: IconMail,
  whatsapp: IconWhatsapp,
  stage_change: IconArrow,
  system: IconGear,
} as const;

// ----------------------------------------------------------------- chips ----

const STAGE_CHIP: Record<Stage, string> = {
  new: "bg-navy-900/8 text-navy-800",
  contacted: "bg-navy-900/8 text-navy-800",
  meeting: "bg-navy-900/8 text-navy-800",
  proposal: "bg-gold-300/35 text-gold-800",
  won: "bg-ok-700/12 text-ok-700",
  lost: "bg-navy-600/12 text-navy-600",
};

export function StageChip({ stage }: { stage: Stage }) {
  const meta = STAGE_META[stage];
  const Icon = stage === "won" ? IconCheck : stage === "lost" ? IconX : IconArrow;
  return (
    <span className={`crm-chip ${STAGE_CHIP[stage]}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: Priority }) {
  if (priority === "normal") return null;
  const high = priority === "high";
  return (
    <span
      className={`crm-chip ${high ? "bg-danger-700/10 text-danger-700" : "bg-navy-600/10 text-navy-600"}`}
    >
      {high ? <IconAlert className="h-3 w-3" /> : <IconArrow className="h-3 w-3 rotate-90" />}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

/**
 * Follow-up badge. "Overdue" is the only red state; "today" stays neutral ink
 * with a clock, because red-vs-amber is indistinguishable in deuteranopia
 * (ΔE 0.7) — see the token comment in globals.css.
 */
export function FollowUpChip({ value }: { value: string | null }) {
  const state = followUpState(value);
  if (state === "none") return null;
  if (state === "upcoming") {
    return (
      <span className="crm-chip bg-navy-900/6 text-navy-600">
        <IconClock className="h-3 w-3" />
        {relativeDays(value)}
      </span>
    );
  }
  if (state === "today") {
    return (
      <span className="crm-chip bg-navy-900/10 font-bold text-navy-900">
        <IconClock className="h-3 w-3" />
        מעקב היום
      </span>
    );
  }
  return (
    <span className="crm-chip bg-danger-700/10 font-bold text-danger-700">
      <IconAlert className="h-3 w-3" />
      באיחור · {relativeDays(value)}
    </span>
  );
}
