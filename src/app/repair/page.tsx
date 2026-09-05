import type { Metadata } from "next";

import { ToolPage } from "@/components/tool-page-layout";
import { SITE } from "@/config/site";
import { MiniJsonTool } from "@/features/json/mini/mini-tools";

export const metadata: Metadata = {
  title: "JSON 修复",
  description:
    "自动修复损坏的 JSON：尾逗号、单引号、未加引号的键、注释、缺少引号等常见错误。100% 在浏览器中运行。",
  alternates: { canonical: "/repair" },
  openGraph: {
    title: "JSON 修复",
    description: "自动修复损坏的 JSON：尾逗号、单引号、未加引号的键、注释等。",
    url: `${SITE.url}/repair`,
  },
};

export default function RepairPage() {
  return (
    <ToolPage
      title="JSON 修复"
      description="把损坏的 JSON 粘贴到下方并点击“修复”，自动处理尾逗号、单引号、未加引号的键、注释等常见错误。"
    >
      <MiniJsonTool variant="repair" />
    </ToolPage>
  );
}
