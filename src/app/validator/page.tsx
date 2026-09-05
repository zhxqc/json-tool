import type { Metadata } from "next";

import { ToolPage } from "@/components/tool-page-layout";
import { SITE } from "@/config/site";
import { MiniJsonTool } from "@/features/json/mini/mini-tools";

export const metadata: Metadata = {
  title: "JSON 校验器",
  description:
    "检查 JSON 是否有效，并给出带行号、列号和上下文的高精度错误信息。100% 在浏览器中运行，不会上传任何内容。",
  alternates: { canonical: "/validator" },
  openGraph: {
    title: "JSON 校验器",
    description: "检查 JSON 是否有效，并给出带行号、列号和上下文的高精度错误信息。",
    url: `${SITE.url}/validator`,
  },
};

export default function ValidatorPage() {
  return (
    <ToolPage
      title="JSON 校验器"
      description="把 JSON 粘贴到下方即可检查是否有效。错误会报告准确的行号、列号，并用 ^ 标出问题所在。"
    >
      <MiniJsonTool variant="validate" />
    </ToolPage>
  );
}
