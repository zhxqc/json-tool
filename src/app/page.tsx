import type { Metadata } from "next";

import { JsonLd } from "@/components/structured-data";
import { SITE } from "@/config/site";
import { JsonFormatter } from "@/features/json/formatter/json-formatter";

export const metadata: Metadata = {
  title: {
    absolute: "JSON 格式化与查看 — 快速、私密的在线 JSON 工具",
  },
  description:
    "在浏览器中直接格式化、校验、压缩、修复和查看 JSON，支持树形/文本两种视图。100% 本地运行，内容不会上传到任何服务器。快速、私密、简洁。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JSON 格式化与查看 — 快速、私密的在线 JSON 工具",
    description:
      "在浏览器中直接格式化、校验、压缩、修复和查看 JSON，支持树形/文本两种视图，100% 本地运行。",
    url: SITE.url,
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "JSON 格式化与查看",
  url: `${SITE.url}/`,
  description: "快速、私密、简洁的 JSON 工具：在浏览器中格式化、校验、压缩、修复和查看 JSON。",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CNY",
  },
  featureList: [
    "支持 2/4 空格或 Tab 缩进的 JSON 格式化",
    "带精确行号和列号的 JSON 校验",
    "JSON 压缩",
    "JSON 常见错误修复",
    "树形与文本两种输出视图",
    "暗色 / 浅色模式",
    "100% 本地、私密的处理",
  ],
  inLanguage: "zh-CN",
};

export default function HomePage() {
  return (
    <main className="flex w-full flex-1 flex-col px-4 pb-0 pt-4 sm:px-6">
      {/* Screen-reader-only heading keeps page semantics for SEO/a11y while
       * leaving the full viewport to the editor. */}
      <h1 className="sr-only">JSON 格式化与查看</h1>

      <JsonFormatter />

      <JsonLd data={webAppSchema} />
    </main>
  );
}
