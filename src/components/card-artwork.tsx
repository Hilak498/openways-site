/**
 * תמונת רקע ממותגת לראש כרטיס.
 *
 * במקום תצלומי סטוק שלא מדברים את שפת המותג, האיור נגזר מהלוגו עצמו:
 * הקשתות של Open Ways על רקע נייבי, עם זוהר זהב. כל כרטיס מקבל וריאציה
 * משלו (זווית, מספר קשתות, מיקום הזוהר) לפי ה-seed, כך שהרצועות נראות
 * כמשפחה אחת ולא כחזרה על אותה תמונה.
 *
 * הכול SVG - בלי קבצים, בלי בקשות רשת, ומשתנה צבע יחד עם המותג.
 */
/**
 * שתי פלטות, שתיהן מהמותג:
 * navy - נייבי עמוק עם זוהר זהב, לרצועות על רקע בהיר שצריך עוגן כהה.
 * warm - זריחה בגוני הזהב והחול, כשמבקשים רצועה צבעונית שנותנת השראה.
 */
const TONES = {
  navy: {
    bg: ["#152542", "#0a192f"] as const,
    glow: "#fed65b",
    glowOpacity: 0.45,
    arc: ["#ffe088", "#fed65b", "#ffe088"] as const,
    arcOpacity: [0.15, 0.85, 0.2] as const,
  },
  warm: {
    bg: ["#fed65b", "#e9c349"] as const,
    glow: "#fff6d8",
    glowOpacity: 0.85,
    arc: ["#735c00", "#0a192f", "#735c00"] as const,
    arcOpacity: [0.1, 0.55, 0.12] as const,
  },
} as const;

export function CardArtwork({
  seed,
  tone = "navy",
  className = "",
}: {
  seed: number;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const t = TONES[tone];
  // וריאציה דטרמיניסטית: אותו seed תמיד נותן את אותו איור
  const v = (n: number, mod: number) => ((seed * 9301 + n * 49297) % 233280) % mod;
  const arcs = 3 + v(1, 3); // 3-5 קשתות
  const tilt = -18 + v(2, 36); // נטייה
  const glowX = 55 + v(3, 40); // מוקד הזוהר
  const glowY = 10 + v(4, 40);
  const lift = 8 + v(5, 22); // גובה הקשת
  const id = `art-${tone}-${seed}`;

  return (
    <svg
      viewBox="0 0 320 96"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.bg[0]} />
          <stop offset="100%" stopColor={t.bg[1]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx={`${glowX}%`} cy={`${glowY}%`} r="65%">
          <stop offset="0%" stopColor={t.glow} stopOpacity={t.glowOpacity} />
          <stop offset="60%" stopColor={t.glow} stopOpacity={t.glowOpacity * 0.18} />
          <stop offset="100%" stopColor={t.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-arc`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={t.arc[0]} stopOpacity={t.arcOpacity[0]} />
          <stop offset="55%" stopColor={t.arc[1]} stopOpacity={t.arcOpacity[1]} />
          <stop offset="100%" stopColor={t.arc[2]} stopOpacity={t.arcOpacity[2]} />
        </linearGradient>
      </defs>

      <rect width="320" height="96" fill={`url(#${id}-bg)`} />
      <rect width="320" height="96" fill={`url(#${id}-glow)`} />

      <g transform={`rotate(${tilt} 160 48)`}>
        {Array.from({ length: arcs }, (_, i) => {
          const y = 96 - i * 13 - 6;
          const h = lift + i * 7;
          const w = 0.6 + i * 0.35;
          const o = 0.75 - i * 0.13;
          return (
            <path
              key={i}
              d={`M-40 ${y} C 70 ${y - h} 210 ${y - h} 360 ${y - h * 0.35}`}
              fill="none"
              stroke={`url(#${id}-arc)`}
              strokeWidth={w * 2.4}
              strokeLinecap="round"
              opacity={o}
            />
          );
        })}
      </g>
    </svg>
  );
}
