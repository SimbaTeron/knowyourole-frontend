import type { MetadataRoute } from "next";
import { noIndexPaths, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: noIndexPaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
