import Link from "next/link";

import { LogoIcon } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getLiveTools, tools } from "@/config/tools";
import { SITE } from "@/config/site";

/** Global site header: brand + tool navigation (from the registry) + theme
 *  toggle, spanning the full viewport width. The homepage is the formatter
 *  itself, so the formatter is not repeated in the nav. Rendered on the
 *  server. */
export function SiteHeader() {
  const navTools = getLiveTools().filter((tool) => tool.id !== "formatter");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          aria-label={`${SITE.name} — 首页`}
        >
          <LogoIcon className="size-7 shrink-0 rounded-md" />
          <span className="hidden sm:inline">{SITE.name}</span>
          <span className="sm:hidden">{SITE.shortName}</span>
        </Link>

        <nav aria-label="工具导航" className="hidden items-center gap-1 md:flex">
          {navTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.path}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {tool.shortName}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav — never more than the live tools. */}
      <nav
        aria-label="工具导航（移动端）"
        className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-1.5 md:hidden"
      >
        {tools
          .filter((t) => t.status === "live" && t.id !== "formatter")
          .map((tool) => (
            <Link
              key={tool.id}
              href={tool.path}
              className="shrink-0 rounded-md px-2.5 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {tool.shortName}
            </Link>
          ))}
      </nav>
    </header>
  );
}
