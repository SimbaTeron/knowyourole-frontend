import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { SeoContentPage } from "@/components/seo/SeoContentPage";
import { resultTypeIndex, resultTypePages } from "@/lib/seo-pages";

export const metadata: Metadata = publicPageMetadata("/results/types");
export default function Page() { return <SeoContentPage page={resultTypeIndex} indexPages={resultTypePages} />; }
