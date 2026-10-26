import Link from "next/link";
import { Reveal } from "@/components/reveal";

export interface RelatedLink {
  href: string;
  label: string;
  description?: string;
  /** Call-to-action line under the label, e.g. "לקריאת המאמר". */
  cta?: string;
}

/** "עוד בנושא": a short list of internal links (articles, services, calculators). */
export function RelatedLinks({
  links,
  title = "עוד בנושא",
  className = "",
}: {
  links: RelatedLink[];
  title?: string;
  className?: string;
}) {
  if (links.length === 0) return null;
  return (
    <nav aria-label={title} className={className}>
      <Reveal>
        <h2 className="text-2xl font-bold text-navy-800">{title}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="card card-hover flex h-full flex-col p-6 transition-colors"
              >
                <span className="font-bold text-navy-800">{link.label}</span>
                {link.description ? (
                  <span className="mt-1 text-sm leading-6 text-navy-600">
                    {link.description}
                  </span>
                ) : null}
                <span className="mt-auto pt-3 text-sm font-bold text-gold-700">
                  {link.cta ?? "לפרטים"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </nav>
  );
}
