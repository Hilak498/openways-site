import Link from "next/link";
import type { AudienceItem } from "@/lib/site";

/** Bulleted list with gold check marks; an item may carry a related link. */
export function CheckList({ items }: { items: AudienceItem[] }) {
  return (
    <ul className="mt-5 space-y-4">
      {items.map((item) => {
        const text = typeof item === "string" ? item : item.text;
        const link = typeof item === "string" ? null : item.link;
        return (
          <li key={text} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-700"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span className="leading-7 text-navy-700">
              {text}
              {link ? (
                <>
                  {" "}
                  <Link
                    href={link.href}
                    className="font-bold whitespace-nowrap text-gold-700 underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
