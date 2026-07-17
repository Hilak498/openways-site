import type { ReactNode } from "react";

/** Shared shell for legal/policy pages: dark header band + readable prose. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="on-dark hero-navy text-white">
        <div className="container-site pt-36 pb-14">
          <h1 className="text-4xl font-extrabold">{title}</h1>
          <p className="mt-3 text-sm text-white/60">עדכון אחרון: {updated}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-site">
          <div className="prose-legal max-w-3xl">{children}</div>
        </div>
      </section>
    </>
  );
}
