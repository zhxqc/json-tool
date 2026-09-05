import type { Metadata } from "next";

import { ToolPage } from "@/components/tool-page-layout";
import { SITE } from "@/config/site";
import { MiniJsonTool } from "@/features/json/mini/mini-tools";

export const metadata: Metadata = {
  title: "JSON 压缩",
  description:
    "去除所有无意义的空白，把 JSON 压缩到最小体积，适合接口请求体、日志和存储。100% 在浏览器中运行。",
  alternates: { canonical: "/minify" },
  openGraph: {
    title: "JSON 压缩",
    description: "去除所有无意义的空白，把 JSON 压缩到最小体积。",
    url: `${SITE.url}/minify`,
  },
};

export default function MinifyPage() {
  return (
    <ToolPage
      title="JSON 压缩"
      description="把 JSON 粘贴到下方，压缩到最小体积——适合接口请求体、日志和存储。一切都在本地运行。"
    >
      <MiniJsonTool variant="minify" />
    </ToolPage>
  );
}
