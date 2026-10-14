import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { SeoContentPage } from "@/components/seo/SeoContentPage";
import { resourcesIndex, resourcePages } from "@/lib/seo-pages";

export const metadata: Metadata = publicPageMetadata("/resources");
export default function Page() { return <SeoContentPage page={resourcesIndex} indexPages={resourcePages} />; }
