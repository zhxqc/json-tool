import Link from "next/link";

import { getLiveTools } from "@/config/tools";
import { SITE } from "@/config/site";

/** Global site footer: brand + domain + privacy promise on the left, tool
 *  links on the right. Rendered on the server. */
export function SiteFooter() {
  const liveTools = getLiveTools();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="leading-relaxed">
          <span className="font-semibold text-foreground">{SITE.name}</span>
          {" · "}
          <span className="font-mono">{SITE.domain.replace("https://", "")}</span>
        </p>
        <nav aria-label="工具导航（页脚）" className="flex flex-wrap gap-x-4 gap-y-1">
          {liveTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.path}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {tool.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
