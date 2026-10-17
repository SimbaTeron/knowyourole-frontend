import type { MetadataRoute } from "next";
import { CONTENT_LAST_UPDATED, publicPages, SITE_URL } from "@/lib/seo";

// Google ignores changefreq/priority, so the sitemap only carries URL + lastmod.
export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((page) => ({
    // Match canonical URLs exactly (home canonical has no trailing slash).
    url: page.path === "/" ? SITE_URL : `${SITE_URL}${page.path}`,
    lastModified: page.lastModified ?? CONTENT_LAST_UPDATED,
  }));
}
