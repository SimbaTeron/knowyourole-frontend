import type { MetadataRoute } from "next";
import { publicPages, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((page) => ({
    // Match canonical URLs exactly (home canonical has no trailing slash).
    url: page.path === "/" ? SITE_URL : `${SITE_URL}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
