'use client';

import Link from "next/link";
import { ArrowLeft, Brain, Target, Users, BookOpen, Heart } from "lucide-react";

export default function About() {
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
        <h1 className="text-3xl font-display font-bold mb-6" data-testid="text-about-title">About KnowYouRole</h1>

        <section className="space-y-4 mb-10">
          <p className="text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            KnowYouRole helps people turn personality quiz results into clearer self-understanding, communication language, and career reflection. The goal is not to trap anyone inside a label; it is to give people a sharper mirror and better next questions.
          </p>
          <p className="text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            The site combines Big Five traits, MBTI-style patterns, DISC-style communication insights, and career-fit recommendations in a plain-English experience built for real people, not research jargon.
          </p>
        </section>

        <section className="mb-10 rounded-2xl border border-[#A78BFA]/15 bg-[#A78BFA]/5 p-5">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Founder
          </h2>
          <div className="space-y-3 text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            <p>
              <span className="font-semibold text-warm-gray dark:text-[#F8FAFC]">Sim Teron</span> is the founder of KnowYouRole, building practical personality and career-reflection tools that feel useful without pretending a quiz can explain a whole person.
            </p>
            <p className="text-sm">
              No stock headshot, fake team photo, or placeholder bio is shown here. Founder imagery can be added later if a real image is provided.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Why this exists
          </h2>
          <div className="space-y-4 text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            <p>
              Many personality sites are either shallow entertainment, vague corporate language, or overly confident claims wrapped in pseudo-science. KnowYouRole exists to make self-discovery more practical: what energizes you, how you communicate, what environments fit you, and what career paths are worth exploring.
            </p>
            <p>
              The product is intentionally plain about its limits. A personality quiz can support reflection; it cannot diagnose you, choose your career for you, or replace judgment from qualified professionals.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Mission
          </h2>
          <p className="text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            KnowYouRole's mission is to help people understand their strengths, friction points, communication style, and career-fit themes earlier — so they can make better decisions with more self-awareness and less guesswork.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Our approach
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/10">
              <h3 className="font-semibold mb-1">Big Five backbone</h3>
              <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                The Big Five is used as the strongest research-backed trait layer in the product.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/10">
              <h3 className="font-semibold mb-1">MBTI-style language</h3>
              <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                Type-style language is used as an interpretive layer for self-reflection, not as a claim that everyone fits a fixed box.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/10">
              <h3 className="font-semibold mb-1">DISC-style communication insights</h3>
              <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                DISC-style output helps explain work and communication tendencies in a way people can use in teams, school, and career planning.
              </p>
            </div>
          </div>
          <Link href="/methodology" className="mt-4 inline-block text-sm font-semibold text-terracotta dark:text-[#A78BFA] underline underline-offset-4">
            Read the methodology
          </Link>
        </section>

        <section className="mb-10 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
          <h2 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Important disclaimer
          </h2>
          <p className="text-sm text-warm-gray/80 dark:text-[#FDE68A] leading-relaxed">
            KnowYouRole is for self-discovery and career reflection. It is not a medical, clinical, psychiatric, legal, financial, or employment-selection evaluation. Use it as a starting point for reflection, not as a final verdict on who you are or what you should do.
          </p>
        </section>
      </main>
    </div>
  );
}
