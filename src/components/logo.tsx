import Link from "next/link";

/** The logo's path symbol (three "open ways" arcs) as a crisp inline SVG. */
export function LogoMark({
  className = "h-9 w-auto",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 170 128"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M40 104 C40 58 92 20 150 20"
        stroke="#b9995f"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M26 104 C26 66 78 34 136 34"
        stroke="#a9834a"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 104 C40 74 92 46 140 46"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Full logo lockup: mark + wordmark. `variant` switches between usage on
 * light backgrounds (navbar) and dark backgrounds (hero, footer).
 */
export function Logo({
  variant = "dark-text",
  withTagline = false,
  className = "",
}: {
  variant?: "dark-text" | "light-text";
  withTagline?: boolean;
  className?: string;
}) {
  const wordColor = variant === "light-text" ? "text-white" : "text-navy-800";
  const markColor = variant === "light-text" ? "text-white" : "text-navy-800";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className={`h-9 w-auto shrink-0 ${markColor}`} />
      <span className="flex flex-col leading-none" dir="ltr">
        <span className={`text-[0.95rem] font-bold tracking-[0.18em] text-gold-600`}>
          OPEN
        </span>
        <span className={`text-[1.35rem] font-extrabold tracking-wide ${wordColor}`}>
          WAYS
        </span>
        {withTagline ? (
          <span
            dir="rtl"
            className={`mt-1.5 text-xs font-medium ${
              variant === "light-text" ? "text-white/70" : "text-navy-600"
            }`}
          >
            ייעוץ עסקי · אשראי עסקי · משכנתאות
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function LogoLink({
  variant = "dark-text",
  className = "",
}: {
  variant?: "dark-text" | "light-text";
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`rounded-lg ${className}`}
      aria-label="Open Ways – לעמוד הבית"
    >
      <Logo variant={variant} />
    </Link>
  );
}
