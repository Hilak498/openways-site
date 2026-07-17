import Image from "next/image";
import Link from "next/link";

/**
 * Brand assets extracted from the official Logo.ai:
 * - /logo-light-bg.png  — navy+gold lockup for light backgrounds
 * - /logo-dark-bg.png   — white+gold lockup for dark backgrounds
 * - /logo-mark-*.png    — standalone mark
 * Source vector lives in brand-assets/Logo.ai.
 */

const LOCKUP = { width: 1066, height: 302 };
const MARK = { width: 257, height: 302 };

export function LogoMark({
  variant = "dark-text",
  className = "h-10 w-auto",
}: {
  variant?: "dark-text" | "light-text";
  className?: string;
}) {
  return (
    <Image
      src={variant === "light-text" ? "/logo-mark-dark-bg.png" : "/logo-mark-light-bg.png"}
      alt="הסמל של Open Ways Group"
      width={MARK.width}
      height={MARK.height}
      className={className}
    />
  );
}

/** Full lockup. `variant` matches the background: dark-text → light bg. */
export function Logo({
  variant = "dark-text",
  withTagline = false,
  className = "",
  priority = false,
}: {
  variant?: "dark-text" | "light-text";
  withTagline?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`inline-flex flex-col gap-1.5 ${className}`}>
      <Image
        src={variant === "light-text" ? "/logo-dark-bg.png" : "/logo-light-bg.png"}
        alt="Open Ways Group"
        width={LOCKUP.width}
        height={LOCKUP.height}
        priority={priority}
        className="h-10 w-auto"
      />
      {withTagline ? (
        <span
          className={`text-xs font-medium ${
            variant === "light-text" ? "text-white/70" : "text-navy-600"
          }`}
        >
          ייעוץ עסקי · גיוס אשראי עסקי · ייעוץ משכנתאות
        </span>
      ) : null}
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
      aria-label="Open Ways Group – לעמוד הבית"
    >
      <Logo variant={variant} priority />
    </Link>
  );
}
