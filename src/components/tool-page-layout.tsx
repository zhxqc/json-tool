import type { ReactNode } from "react";

interface ToolPageProps {
  /** H1 shown at the top of the page. */
  title: string;
  /** Short page-level description under the H1. */
  description: string;
  /** The interactive tool UI (client component). */
  children: ReactNode;
}

/** Shared layout for dedicated tool pages: H1 → tool.
 *  Server component; only `children` carries client interactivity. */
export function ToolPage({ title, description, children }: ToolPageProps) {
  return (
    <main className="flex w-full flex-1 flex-col px-4 pb-0 pt-6 sm:px-6">
      <div className="max-w-3xl shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">{children}</div>
    </main>
  );
}
