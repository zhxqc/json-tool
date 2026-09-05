"use client";

import type { JsonErrorInfo } from "@/features/json/core";

/** Renders a detailed JSON error: message, line/column and the offending line
 *  with a caret pointing at the exact column. */
export function JsonErrorPanel({ error }: { error: JsonErrorInfo }) {
  const caretLength = Math.max(0, Math.min(error.column - 1, error.lineText.length));
  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4" role="alert">
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-destructive-foreground"
          aria-hidden="true"
        >
          !
        </span>
        <div>
          <p className="text-sm font-semibold text-destructive">无效 JSON</p>
          <p className="mt-0.5 text-sm text-foreground">{error.message}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        错误位于第 {error.line} 行，第 {error.column} 列。
      </p>
      <div className="overflow-hidden rounded-md border border-border bg-muted/40">
        <pre className="json-mono overflow-auto p-3 text-[13px] leading-[1.6] text-foreground">
          <code>{error.lineText || " "}</code>
        </pre>
        <pre
          aria-hidden="true"
          className="json-mono overflow-hidden px-3 pb-3 text-[13px] leading-none text-destructive"
        >
          {" ".repeat(caretLength)}
          {"^"}
        </pre>
      </div>
    </div>
  );
}
