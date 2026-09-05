# AGENTS.md

Guidance for AI agents and humans working in this repository.

## Project

`json.imnice.top` — a fast, private, backend-free JSON tools site built with
Next.js (App Router, static-first), TypeScript (strict), Tailwind CSS v4 and
shadcn/ui.

Core principles: **fast · simple · no ads · SEO-first · local-first ·
privacy-first**. All JSON processing happens in the browser. There is no
backend, database, Server Action or API route by design.

## Commands

```bash
pnpm install        # install dependencies
pnpm dev            # start the dev server
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit (strict)
pnpm test           # Vitest + Testing Library (jsdom)
pnpm build          # production build
pnpm start          # run the production build (port 3000)
pnpm quality        # lint + typecheck + test + build in one go
pnpm quality:ci     # build + Lighthouse CI audit on :4321
pnpm quality:lighthouse  # Lighthouse HTML report (requires `pnpm start` running on :3000)
```

## Architecture

- **SEO/content layer** — Server Components only. Every public page's title,
  description, H1, intro, privacy note and structured data must be
  server-rendered / static HTML. Do not put `'use client'` at the top of a
  page file. The site is intentionally lean: no feature cards, how-to steps,
  FAQ or related-tools marketing sections — the tool is the page.
- **Interactive tool layer** — Client Components scoped to the tool area
  (`src/features/json/`). The formatter, mini tools, theme toggle.
- **JSON core** (`src/features/json/core/`) — pure, framework-agnostic
  functions (`parseJSON`, `formatJSON`, `minifyJSON`, `validateJSON`,
  `repairJSON`). No React, no DOM, no network. Everything is unit-tested.
- **Tool Registry** (`src/config/tools.ts`) — the single source of truth for
  every tool. Header nav and sitemap derive from
  it. Never hand-write a second copy of the tool list.
- **JSON tree viewer** (`src/features/json/tree/json-tree.tsx`) — a lightweight
  client-only structural viewer. Every object `{ }` / array `[ ]` node has an
  explicit expand/collapse toggle plus "展开全部"/"收起全部" actions. No third-party
  editor dependency.

## Definition of Done (any public page change)

Do not consider a change done just because lint/build pass. Before finishing
any public page:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build` (production build succeeds)
5. `pnpm start` (run the actual production app)
6. Open the real page in a browser
7. Test the actual interactions (paste → Format / Minify / Repair / Copy /
   Clear, tree view, theme)
8. Check desktop layout
9. Check mobile layout (responsive, stacked panels)
10. Check the rendered HTML (server-rendered content present, no `'use client'`
    leak at page level)
11. Check metadata / canonical / structured data (JSON-LD, OG, robots,
    sitemap)
12. Run Lighthouse (via `pnpm quality:ci` or `pnpm quality:lighthouse`)
13. Fix obvious problems
14. Re-verify

## Constraints

- No backend, no database, no Server Actions, no API routes, no auth, no
  third-party analytics/tracking, no user-data storage. JSON must never be
  sent to a server.
- URL policy: short stable paths only (`/`, `/validator`, `/minify`,
  `/repair`). Do not create duplicate-intent pages such as `/json-formatter`.
- Canonical URLs always use `https://json.imnice.top/<path>` — never
  localhost, preview URLs or default domains.
- Tailwind v4 (CSS-first config in `globals.css`); dark mode via the `.dark`
  class (next-themes). Keep bundle small: import icons per-name, lazy-load
  the editor, no runtime CDN dependencies.
- Follow the existing structure — new JSON logic goes in
  `src/features/json/core`, new UI in `src/features/json`, site chrome in
  `src/components`, config in `src/config`.
