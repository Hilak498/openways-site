import type { BankCategoryIcon } from "@/lib/site";

/** אייקוני קו לקטגוריות המימון שאינן בנק, באותו סגנון של ServiceIcon. */
export function BankCategoryIconSvg({
  icon,
  className = "h-5 w-5",
}: {
  icon: BankCategoryIcon;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (icon) {
    // קרנות בערבות מדינה - מגן עם וי
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    // גופים מוסדיים - מבנה עמודים
    case "building":
      return (
        <svg {...common}>
          <path d="M3.5 9 12 4l8.5 5" />
          <path d="M5.5 9.5v8M10 9.5v8M14 9.5v8M18.5 9.5v8" />
          <path d="M3.5 20h17" />
        </svg>
      );
    // גופים חוץ-בנקאיים - רשת צמתים
    case "network":
      return (
        <svg {...common}>
          <circle cx="12" cy="5.5" r="2.5" />
          <circle cx="5.5" cy="18" r="2.5" />
          <circle cx="18.5" cy="18" r="2.5" />
          <path d="M10.8 7.7 6.8 15.8M13.2 7.7l4 8.1M8 18h8" />
        </svg>
      );
  }
}
