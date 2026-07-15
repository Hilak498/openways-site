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
  return (
    <Reveal
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow ? (
        <p className={`eyebrow ${onDark ? "!text-gold-400" : ""}`}>{eyebrow}</p>
      ) : null}
      <h2
        className={`mt-3 text-3xl font-extrabold sm:text-4xl ${
          onDark ? "text-white" : "text-navy-800"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-lg leading-8 ${
            onDark ? "text-white/70" : "text-navy-600"
          }`}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
