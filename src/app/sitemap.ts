import type { MetadataRoute } from "next";

import { getLiveTools } from "@/config/tools";
import { SITE } from "@/config/site";

/** Static sitemap generated from the Tool Registry. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return getLiveTools().map((tool) => ({
    url: `${SITE.url}${tool.path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: tool.path === "/" ? 1 : 0.8,
  }));
}
