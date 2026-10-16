import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "/results",
  "Quiz Results | KnowYouRole",
  "See your work style starting point: personality signals and career directions to explore. Take the free 30-question quiz, no sign-up needed.",
  "My work style starting point",
);

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
