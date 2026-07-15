/** Renders a Schema.org JSON-LD block. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be embedded as a raw script; "<" is escaped to prevent
      // breaking out of the tag with crafted content.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
