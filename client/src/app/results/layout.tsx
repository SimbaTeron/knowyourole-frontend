import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("/results", "Quiz Results | KnowYouRole");

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
