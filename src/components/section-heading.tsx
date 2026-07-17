import { Reveal } from "@/components/reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  onDark = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
  onDark?: boolean;
}) {
  const centered = align === "center";
  return (
    <Reveal className={`max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p className={`eyebrow ${onDark ? "!text-gold-300" : ""}`}>{eyebrow}</p>
      ) : null}
      <h2
        className={`mt-3 text-3xl font-bold sm:text-4xl ${
          onDark ? "text-white" : "text-navy-800"
        }`}
      >
        {title}
      </h2>
      <div
        aria-hidden="true"
        className={`heading-bar ${centered ? "mx-auto" : ""} ${
          onDark ? "bg-gradient-to-l from-gold-700 to-gold-300" : ""
        }`}
      />
      {description ? (
        <p
          className={`mt-5 text-lg leading-8 ${
            onDark ? "text-white/80" : "text-navy-600"
          }`}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
