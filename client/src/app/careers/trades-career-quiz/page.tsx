import type { Metadata } from "next";
import { GuidePageView } from "@/components/seo/GuidePageView";
import { getGuidePage } from "@/lib/guidePages";
import { publicPageMetadata } from "@/lib/seo";

const path = "/careers/trades-career-quiz";

export const metadata: Metadata = publicPageMetadata(path);

export default function TradesCareerQuizPage() {
  return <GuidePageView page={getGuidePage(path)} />;
}
