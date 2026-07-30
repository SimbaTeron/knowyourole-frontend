import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { SeoContentPage } from "@/components/seo/SeoContentPage";
import { getSeoPage } from "@/lib/seo-pages";

export const metadata: Metadata = publicPageMetadata("/mbti-style-test");

export default function Page() {
  return <SeoContentPage page={getSeoPage("/mbti-style-test")!} />;
}
