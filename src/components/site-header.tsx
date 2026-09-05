import Link from "next/link";

import { LogoIcon } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getLiveTools, tools } from "@/config/tools";
import { SITE } from "@/config/site";

/** GitHub 仓库地址（右上角图标入口）。 */
const GITHUB_REPO_URL = "https://github.com/zhxqc/json-tool";

/** GitHub 品牌图标（lucide 已移除品牌图标，此处内联官方 mark）。 */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

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
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub 仓库"
            title="GitHub 仓库"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <GithubIcon className="size-[18px]" />
          </a>
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
