'use client';

import { ChevronDown } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { useState } from "react";

import { FAQ_ITEMS } from "./faqItems";

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
      {(
        <p hidden={!isOpen} id={`faq-answer-${question.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`} className="pb-4 text-sm text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function Faq() {
  return (
    <div className="workday-simple-page min-h-screen bg-soft-cream text-warm-gray">
      <AppHeader />
      <main className="workday-simple-wrap max-w-2xl px-6 py-32">
        <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-faq-title">Frequently Asked Questions</h1>
        <p className="text-warm-gray/60 dark:text-[#94A3B8] mb-8">Everything you need to know about KnowYouRole</p>

        <div className="space-y-0">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
