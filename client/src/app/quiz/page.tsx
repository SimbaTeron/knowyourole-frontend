import QuizPageClient from './QuizPageClient';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

const quizJsonLd = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  name: "KnowYouRole Free Personality Quiz",
  description:
    "Take a free personality quiz that combines Big Five traits, MBTI-style patterns, DISC work style, and career-fit guidance into one practical result.",
  educationalLevel: "general",
  assesses: [
    "Big Five personality traits",
    "MBTI-style preference patterns",
    "DISC-style work behavior",
    "work style",
    "career fit",
    "communication style",
  ],
  isAccessibleForFree: true,
  url: `${SITE_URL}/quiz`,
  // Reference the site-wide Organization from BaseJsonLd instead of re-declaring it.
  provider: { "@id": `${SITE_URL}/#organization` },
};

const quizBreadcrumbJsonLd = breadcrumbJsonLd([{ name: "Quiz", path: "/quiz" }]);

export default function QuizPage() {
  return (
    <>
      <script
        id="kyr-quiz-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        id="kyr-quiz-breadcrumb-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizBreadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <QuizPageClient />
    </>
  );
}
