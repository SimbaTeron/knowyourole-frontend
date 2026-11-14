import QuizPageClient from './QuizPageClient';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

const quizJsonLd = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  name: "What Career Fits Free Career Quiz",
  description:
    "Take a free personality quiz that combines Big Five traits, MBTI-style patterns, DISC work style, and career-fit guidance into one practical result.",
  educationalLevel: "general",
  assesses: [
    "Big Five personality traits",
    "MBTI-style preference patterns",
    "DISC-style work behavior",
    "work style",
    "communication style",
  ],
  isAccessibleForFree: true,
  url: `${SITE_URL}/quiz`,
  // Reference the site-wide Organization from BaseJsonLd instead of re-declaring it.
  provider: { "@id": `${SITE_URL}/#organization` },
};

const quizFaqs = [
  {
    q: "What career fits me?",
    a: "Take this free 30-question quiz to get a starting picture of careers that may fit how you like to work. It is not a diagnosis or a decision. Use the result to explore a class, a conversation, or a small experiment.",
  },
  {
    q: "Is there a free career quiz for teens?",
    a: "Yes. The quiz is free, and no account or name is needed. It is built for junior high and high school students, and a parent or counselor can sit with them. It suggests directions to explore. It does not pick a job.",
  },
  {
    q: "Is this a work style quiz or a career quiz?",
    a: "Both. The questions look at how you like to work — focus, decisions, people, and pressure — then suggest career directions to explore. Work style is how the quiz reads you. “What career fits me” is the question it helps you start answering.",
  },
  {
    q: "Do I need an account to take the career quiz?",
    a: "No. You can finish without an account and without your name. Your result is saved with a random session ID and deleted automatically after 30 days.",
  },
  {
    q: "Is this quiz a test I can fail, or a diagnosis?",
    a: "No. It is a self-report reflection tool, not a clinical assessment, hiring screen, or placement test. There are no right answers, and it does not tell you what job you must do.",
  },
] as const;

const quizFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: quizFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
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
      <script
        id="kyr-quiz-faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizFaqJsonLd).replace(/</g, "\\u003c") }}
      />
      <QuizPageClient />
    </>
  );
}
