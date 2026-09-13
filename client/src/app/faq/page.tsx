'use client';

import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "What is the current KnowYouRole quiz?",
    answer: "KnowYouRole is a free 28-prompt self-reflection quiz for work style and role exploration. It turns your answers into a practical report on preferences, work behavior, trait signals, and career directions worth testing. It is not designed to reduce a person to one permanent label."
  },
  {
    question: "What do I get when I finish?",
    answer: "Your result brings together a Big Five-informed trait read, MBTI-style preference language, DISC-style work behavior, and an evidence-led career direction. Depending on how strongly your answers converge, the report can show one clear direction, two plausible directions, or an exploratory starting point."
  },
  {
    question: "How long does the quiz take?",
    answer: "The current quiz has 28 focused prompts. There is no timer and no trick question. Take enough time to answer for what is usually true in your day-to-day work, study, or project life—not what sounds most impressive."
  },
  {
    question: "Are there right or wrong answers?",
    answer: "No. The useful answer is the one that best describes your usual pattern. Choosing what you think you should be will produce a very polished report about someone else."
  },
  {
    question: "How are results calculated?",
    answer: "Each answer contributes to several signals across Big Five-informed traits, MBTI-style preferences, DISC-style work behavior, and role-fit vectors. KnowYouRole recomputes the result from the complete answer set before showing the report, so the direction reflects the whole pattern rather than one answer or a client-side guess."
  },
  {
    question: "Is this an official MBTI, DISC, or clinical assessment?",
    answer: "No. KnowYouRole uses MBTI-style and DISC-style language as accessible reflection lenses, alongside Big Five-informed trait signals. It is not an official MBTI or DISC instrument, a clinical assessment, a diagnosis, a hiring screen, or a prediction of job performance."
  },
  {
    question: "How accurate is the quiz?",
    answer: "We do not publish an accuracy percentage. The report is a structured reflection on your answers, not a definitive measurement of identity or career fit. Treat close scores, mixed evidence, and role directions as useful hypotheses to test against your skills, values, experience, and real opportunities."
  },
  {
    question: "What are career directions based on?",
    answer: "Career directions combine your answer evidence with trait, preference, work-behavior, and role-fit signals. They are starting points for practical experiments—projects, conversations, classes, shadowing, or job research—not a verdict, hiring recommendation, or life sentence."
  },
  {
    question: "Can I retake the quiz?",
    answer: "Yes. Retake it when you want to compare a genuinely different context or check whether you answered from a temporary mood or pressure state. If you want the most comparable result, answer from a typical week and use the same interpretation of each prompt."
  },
  {
    question: "Do I need an account or have to pay?",
    answer: "No. You can start and complete the core quiz without an account, and the current core experience is free. KnowYouRole does not require a purchase to show your result."
  },
  {
    question: "How is my quiz data handled?",
    answer: "Quiz completion data may be saved to generate and recover a result. KnowYouRole does not sell quiz results. Analytics loads only after you affirmatively opt in through cookie preferences; it does not use your answers, scores, role direction, or result labels. See the Privacy Policy for the current details."
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-warm-gray/10 dark:border-[#A78BFA]/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`}
        className="w-full flex items-center justify-between py-4 text-left"
        data-testid={`button-faq-${question.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`}
      >
        <span className="font-medium text-warm-gray dark:text-[#F8FAFC] pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-warm-gray/50 dark:text-[#94A3B8] flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <p id={`faq-answer-${question.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`} className="pb-4 text-sm text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function Faq() {
  return (
    <div className="min-h-screen bg-soft-cream dark:bg-[#0A0A12] text-warm-gray dark:text-[#F8FAFC]">
      <header className="sticky top-0 z-50 px-6 py-4 bg-soft-cream/90 dark:bg-[#0A0A12]/90 backdrop-blur-sm border-b border-warm-gray/10 dark:border-[#A78BFA]/10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-warm-gray/70 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-faq-title">Frequently Asked Questions</h1>
        <p className="text-warm-gray/60 dark:text-[#94A3B8] mb-8">Everything you need to know about KnowYouRole</p>

        <div className="space-y-0">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </main>
    </div>
  );
}
