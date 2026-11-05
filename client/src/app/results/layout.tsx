import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { QUESTION_COUNT } from "@/lib/quiz/quizConfig";

const resultsShareTitle = "My work style starting point";
const resultsMetadata = noIndexMetadata(
  "/results",
  "Quiz Results | KnowYouRole",
  `See your work style starting point: personality signals and career directions to explore. Take the free ${QUESTION_COUNT}-question quiz, no sign-up needed.`,
  resultsShareTitle,
);

export const metadata: Metadata = {
  ...resultsMetadata,
  twitter: {
    ...(typeof resultsMetadata.twitter === "object" && resultsMetadata.twitter ? resultsMetadata.twitter : {}),
    title: resultsShareTitle,
  },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
