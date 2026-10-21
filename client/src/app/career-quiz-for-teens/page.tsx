import type { Metadata } from "next";
import { GuidePageView } from "@/components/seo/GuidePageView";
import { getGuidePage } from "@/lib/guidePages";
import { publicPageMetadata } from "@/lib/seo";

const path = "/career-quiz-for-teens";

export const metadata: Metadata = publicPageMetadata(path);

export default function CareerQuizForTeensPage() {
  return <GuidePageView page={getGuidePage(path)} />;
}
