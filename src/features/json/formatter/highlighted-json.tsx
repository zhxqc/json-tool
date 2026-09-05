"use client";

import { tokenizeJSON } from "@/lib/json/highlight";
import { cn } from "@/lib/utils";

const TOKEN_CLASS: Record<string, string> = {
  key: "text-json-key",
  string: "text-json-string",
  number: "text-json-number",
  boolean: "text-json-boolean",
  null: "text-json-null",
  punctuation: "text-foreground/80",
  whitespace: "",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Renders a JSON string as colored, escaped spans with optional case-insensitive
 * search highlighting. Used for the "Text" output view of the formatter.
 */
export function HighlightedJson({ text, query }: { text: string; query?: string }) {
  const tokens = tokenizeJSON(text);
  const q = query?.trim();
  const queryLower = q?.toLowerCase();

  return (
    <pre
      className="json-mono h-full min-h-full overflow-auto whitespace-pre p-4 text-[13px] leading-[1.6]"
      aria-label="格式化后的 JSON 输出"
    >
      <code>
        {tokens.map((token, index) => {
          const base = cn(TOKEN_CLASS[token.type] ?? "");
          if (!queryLower || token.type === "whitespace" || !token.value) {
            return (
              <span key={index} className={base}>
                {token.value}
              </span>
            );
          }
          // Split token value on the query and highlight each match.
          const parts = splitIgnoreCase(token.value, queryLower);
          return (
            <span key={index} className={base}>
              {parts.map((part, i) =>
                part.match ? (
                  // React escapes JSX text children automatically.
                  <mark key={i} className="rounded-sm bg-amber-200 px-0 text-black dark:bg-amber-500/40 dark:text-amber-100">
                    {part.text}
                  </mark>
                ) : (
                  <span
                    key={i}
                    dangerouslySetInnerHTML={{ __html: escapeHtml(part.text) }}
                  />
                )
              )}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

interface Part {
  text: string;
  match: boolean;
}

function splitIgnoreCase(value: string, queryLower: string): Part[] {
  const parts: Part[] = [];
  const lower = value.toLowerCase();
  let index = 0;
  let cursor = 0;
  while ((index = lower.indexOf(queryLower, cursor)) !== -1) {
    if (index > cursor) parts.push({ text: value.slice(cursor, index), match: false });
    parts.push({ text: value.slice(index, index + queryLower.length), match: true });
    cursor = index + queryLower.length;
  }
  if (cursor < value.length) parts.push({ text: value.slice(cursor), match: false });
  if (parts.length === 0) parts.push({ text: value, match: false });
  return parts;
}
