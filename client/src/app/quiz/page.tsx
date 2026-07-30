export const dynamic = 'force-dynamic';

import QuizPageClient from './QuizPageClient';

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
  provider: {
    "@type": "Organization",
    name: "KnowYouRole",
    url: "https://knowyourole.com",
  },
};

const quizFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What will I get from the free personality quiz?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You get a practical result that combines personality pattern, work style, communication clues, pressure behavior, and career-fit direction.",
      },
    },
    {
      "@type": "Question",
      name: "Does KnowYouRole use Big Five, MBTI-style, and DISC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. KnowYouRole combines Big Five trait signals, MBTI-style preference language, and DISC-style work behavior into one readable profile.",
      },
    },
    {
      "@type": "Question",
      name: "Are my quiz answers private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Quiz completion data can be saved to generate and recover your result. KnowYouRole does not sell quiz results; see the Privacy Policy for current storage and consent details.",
      },
    },
  ],
};

export default function QuizPage() {
  return (
    <>
      <script
        id="kyr-quiz-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        id="kyr-quiz-faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizFaqJsonLd).replace(/</g, "\\u003c") }}
      />
      <QuizPageClient />
    </>
  );
}
