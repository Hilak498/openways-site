import type { Service } from "@/lib/site";

/** Simple, consistent line icons for the three services. */
export function ServiceIcon({
  icon,
  className = "h-7 w-7",
}: {
  icon: Service["icon"];
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
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </svg>
      );
    case "credit":
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
          <path d="M2.5 10h19M6.5 14.5h4" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m3.5 10.5 8.5-7 8.5 7" />
          <path d="M5.5 9v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
  }
}
