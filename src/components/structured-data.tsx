import type { JsonValue } from "@/features/json/core";

/** Renders a JSON-LD structured-data block in server-rendered HTML. */
export function JsonLd({ data }: { data: JsonValue | JsonValue[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
