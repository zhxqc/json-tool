# JSON Tools · json.imnice.top

快速、私密、简洁的开发者 JSON 工具（全中文界面）。

**json.imnice.top** 是 **imnice.top** 旗下的 JSON 垂直工具站。首页即完整的
JSON 格式化与查看工具；独立的页面分别负责校验、压缩和修复。所有处理
**100% 在浏览器本地完成** —— 不会上传到任何服务器。

> [!IMPORTANT]
> 隐私优先：你的 JSON 只保存在浏览器中。这是一个无后端、无账号、无追踪、
> 无 API 的纯静态站点。

## Highlights

- **JSON 格式化与查看**（首页）— 格式化（2 / 4 空格 / Tab）、压缩、修复、
  树形 & 文本视图、复制、清空、暗色模式。界面极简，无搜索框等干扰元素。
  树形视图可逐节点展开/收起 `{}`、`[]`，并支持「展开全部 / 收起全部」。
- 精确错误提示 — 行号、列号、原因说明，并在出错行用 `^` 标出位置，
  而不是笼统的“无效 JSON”。
- **Tool Registry**（`src/config/tools.ts`）— 单一事实源，统一驱动导航与 sitemap。
- **SEO-first** — 服务端渲染内容、canonical URL、robots.txt、sitemap.xml、
  Open Graph / Twitter 元数据与 JSON-LD 结构化数据（WebSite、
  SoftwareApplication）。页面刻意保持精简（无功能介绍、使用说明、FAQ 等
  营销区块），工具即页面主体。
- 自研轻量 JSON 树形查看器（逐节点展开/收起、全部展开/收起）；极小的 JS
  bundle。

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, static-first) |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4, shadcn/ui (button only) |
| Icons | lucide-react |
| JSON tree view | custom `JsonTreeView` (client-only, expand/collapse) |
| JSON repair | jsonrepair |
| Tests | Vitest + React Testing Library (jsdom) |
| Quality | ESLint, Prettier, Lighthouse, Lighthouse CI |
| Package manager | pnpm |

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit + component tests |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build (port 3000) |
| `pnpm quality` | lint + typecheck + test + build |
| `pnpm quality:ci` | build + Lighthouse CI audit (port 4321) |
| `pnpm quality:lighthouse` | Lighthouse HTML report against `localhost:3000` (run `pnpm start` first) |

## Project structure

```
src/
├── app/                # routes, layout, sitemap.ts, robots.ts, metadata
├── components/         # site chrome: header, footer, related, UI
├── config/             # site constants + Tool Registry (single source of truth)
├── features/json/
│   ├── core/           # pure JSON logic (parse/format/validate/minify/repair)
│   ├── tree/           # JSON tree viewer (client-only, expand/collapse)
│   ├── formatter/      # homepage tool
│   ├── mini/           # validator / minify / repair tools
│   └── components/     # shared error panel
├── lib/                # cn(), JSON syntax highlighter, clipboard helpers
└── test/               # test setup
```

## Deployment — EdgeOne Pages

Target production origin: **https://json.imnice.top** via EdgeOne Pages.

- The codebase is deployment-agnostic: it uses only standard Next.js / Web
  Platform features (no Vercel-specific APIs), so it can run on EdgeOne Pages
  or any Node-compatible host.
- Default build (`next build` + `next start`) is a Node server.
- The site is fully static. If EdgeOne Pages hosting is used in pure-static
  mode, enable static export by adding `output: "export"` to
  `next.config.ts` and verify `pnpm build` produces `out/`. Toggle and verify
  this per your EdgeOne Pages setup — do not assume server-side rendering
  features are available in static mode.

Canonical URLs are pinned to `https://json.imnice.top/<path>` in
`src/config/site.ts` — update nothing else when the domain changes.

## License / status

Early development (phase 1). See `AGENTS.md` for the Definition of Done used
for every public page change.
