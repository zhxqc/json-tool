/**
 * Tool Registry — the single source of truth for every JSON tool on the site.
 *
 * Header navigation, the search box, related-tool links, the homepage tool
 * grid and (future) a command palette all render from this one list. Never
 * hand-write a second copy of the tool list in a component.
 *
 * URL strategy: `json.imnice.top` already expresses "JSON", so paths stay
 * short (`/`, `/validator`, `/minify`, `/repair`). We deliberately avoid
 * duplicate-intent URLs like `/json-formatter` or `/json-beautifier`.
 */

export type ToolCategory =
  | "Format"
  | "Validate"
  | "Convert"
  | "Generate";

export type ToolStatus = "live" | "planned";

export interface ToolDefinition {
  id: string;
  name: string;
  /** Short label for compact navigation / buttons. */
  shortName: string;
  path: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  /** "planned" tools are registered for navigation/SEO growth but not built yet. */
  status: ToolStatus;
}

export const tools: ToolDefinition[] = [
  {
    id: "formatter",
    name: "JSON 格式化与查看",
    shortName: "格式化",
    path: "/",
    description: "在浏览器中完成 JSON 的格式化、校验、压缩、修复与树形/文本查看，全程本地运行。",
    category: "Format",
    keywords: [
      "json formatter",
      "json viewer",
      "json beautifier",
      "pretty print json",
      "json tree",
      "json prettier",
      "json 格式化",
      "json 美化",
      "json 查看",
    ],
    status: "live",
  },
  {
    id: "validator",
    name: "JSON 校验器",
    shortName: "校验",
    path: "/validator",
    description: "检查 JSON 是否有效，并给出带行号、列号与上下文的精确错误信息。",
    category: "Validate",
    keywords: ["json validate", "json checker", "valid json", "json syntax", "json 校验", "json 检查", "json 是否有效"],
    status: "live",
  },
  {
    id: "repair",
    name: "JSON 修复",
    shortName: "修复",
    path: "/repair",
    description: "自动修复常见 JSON 错误：尾逗号、单引号、未加引号的键、注释等。",
    category: "Validate",
    keywords: ["json repair", "fix json", "broken json", "json 修复", "json 纠错", "修复损坏的 json"],
    status: "live",
  },
  {
    id: "minify",
    name: "JSON 压缩",
    shortName: "压缩",
    path: "/minify",
    description: "去除所有无意义的空白，将 JSON 压缩到最小体积，适合接口请求与日志。",
    category: "Validate",
    keywords: ["json minify", "json compress", "minified json", "json compact", "json 压缩", "json 去空格"],
    status: "live",
  },
  {
    id: "diff",
    name: "JSON 对比",
    shortName: "对比",
    path: "/diff",
    description: "对比两份 JSON 文档，高亮显示具体差异。",
    category: "Format",
    keywords: ["json diff", "compare json", "json compare", "json changes", "json 对比"],
    status: "planned",
  },
  {
    id: "path",
    name: "JSONPath 查询",
    shortName: "查询",
    path: "/path",
    description: "使用 JSONPath 查询 JSON 文档并查看结果。",
    category: "Generate",
    keywords: ["jsonpath", "json query", "json path finder", "json 查询"],
    status: "planned",
  },
  {
    id: "to-ts",
    name: "JSON 转 TypeScript",
    shortName: "转 TS",
    path: "/to-typescript",
    description: "根据 JSON 示例生成 TypeScript 接口定义。",
    category: "Generate",
    keywords: ["json to typescript", "generate typescript from json", "json to ts", "json 转 typescript"],
    status: "planned",
  },
  {
    id: "to-yaml",
    name: "JSON 转 YAML",
    shortName: "转 YAML",
    path: "/to-yaml",
    description: "在浏览器中完成 JSON 与 YAML 互转，不上传任何数据。",
    category: "Convert",
    keywords: ["json to yaml", "yaml converter", "json yaml", "json 转 yaml"],
    status: "planned",
  },
];

/** Tools that are implemented and published. */
export function getLiveTools(): ToolDefinition[] {
  return tools.filter((tool) => tool.status === "live");
}

/** Tools that are planned but not yet implemented. */
export function getPlannedTools(): ToolDefinition[] {
  return tools.filter((tool) => tool.status === "planned");
}

export function getToolById(id: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === id);
}

export function getToolByPath(path: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.path === path);
}
