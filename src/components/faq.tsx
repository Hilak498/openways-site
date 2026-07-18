import { Reveal } from "@/components/reveal";

/**
 * Accessible FAQ accordion built on native <details>/<summary> -
 * keyboard-operable and screen-reader-friendly out of the box.
 */
export function Faq({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {items.map((item, i) => (
        <Reveal key={item.question} delay={i * 0.05}>
          <details className="group card overflow-hidden px-6 py-1 open:pb-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-bold text-navy-800 marker:hidden [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand-100 text-gold-700 transition-transform duration-300 group-open:rotate-45"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p className="leading-7 text-navy-600">{item.answer}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
