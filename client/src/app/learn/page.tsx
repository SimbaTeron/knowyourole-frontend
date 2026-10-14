import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { SeoContentPage } from "@/components/seo/SeoContentPage";
import { learnIndex, learnPages } from "@/lib/seo-pages";

export const metadata: Metadata = publicPageMetadata("/learn");
export default function Page() { return <SeoContentPage page={learnIndex} indexPages={learnPages} />; }
