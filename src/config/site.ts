/**
 * Global site constants. Single source of truth for branding and the public
 * URL. All canonical URLs, sitemap entries, robots and structured data derive
 * from this file so they can never drift from the real deployment.
 */

export const SITE = {
  /** Short text brand. */
  name: "JSON 工具",
  /** Secondary brand shown alongside the primary domain. */
  shortName: "JSON",
  /** Human readable tagline used in headers and OG descriptions. */
  tagline: "快速、私密、简洁的开发者 JSON 工具。",
  /** Public production origin — never localhost, never a preview URL. */
  url: "https://json.imnice.top",
  /** Bare domain used in footers and short labels. */
  domain: "json.imnice.top",
  /** Parent brand linked from the footer. */
  parentBrand: "imnice.top",
  parentUrl: "https://imnice.top",
  /** Default language / locale. */
  locale: "zh-CN",
  /** Privacy promise shown across the site. */
  privacyStatement: "您的 JSON 只保存在浏览器中，不会上传到任何服务器。",
  /** Copyright year. */
  year: "2026",
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${normalized === "/" ? "/" : normalized}`;
}
