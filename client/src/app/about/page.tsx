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
            KnowYouRole was built to make personality science accessible, fun, and genuinely useful. Whether you're a teenager exploring who you are, a young adult choosing a career path, or someone looking for deeper self-understanding, our platform delivers personalized insights grounded in well-established psychological frameworks.
          </p>
          <p className="text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            We believe everyone deserves to understand their strengths, tendencies, and potential — without jargon, paywalls, or guesswork.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Why We Built This
          </h2>
          <div className="space-y-4 text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            <p>
              KnowYouRole started from a simple frustration: most personality tools online are either oversimplified clickbait or locked behind expensive paywalls. The good science exists — Big Five, MBTI, DISC — but it's scattered across academic papers that most people will never read. We wanted to change that.
            </p>
            <p>
              We noticed something else, too. A 10-year-old and a 35-year-old shouldn't get the same quiz. The questions that spark self-reflection for a teenager are different from the ones that resonate with a career-changer in their thirties. So we built age-tiered assessments from the ground up — questions written for where you actually are in life, not a one-size-fits-all template.
            </p>
            <p>
              The career matching came from watching too many people feel stuck. When you can see that your unique blend of traits — say, high Openness combined with Steadiness — maps naturally to roles you may never have considered, it opens doors. We've mapped 150+ careers across industries, from creative arts to healthcare to skilled trades, because every personality type has work that fits.
            </p>
            <p>
              This project is a labor of love. We keep the core experience completely free because we believe everyone — especially young people just starting to figure things out — deserves access to genuine self-insight. If this tool helps even one person see themselves more clearly, it's worth every line of code.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Our Science
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/10">
              <h3 className="font-semibold mb-1">Big Five (OCEAN)</h3>
              <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                The most widely validated personality model in academic psychology, measuring Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. Used in thousands of peer-reviewed studies worldwide.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/10">
              <h3 className="font-semibold mb-1">MBTI-Inspired</h3>
              <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                Based on Jungian cognitive function theory, our MBTI-style assessment helps you understand how you process information, make decisions, and interact with the world through 16 personality types.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/10">
              <h3 className="font-semibold mb-1">DISC</h3>
              <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                A behavioral assessment focusing on Dominance, Influence, Steadiness, and Conscientiousness — widely used in professional development and career coaching contexts.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Our Mission
          </h2>
          <p className="text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            We're on a mission to help people of all ages discover what makes them unique — and use that knowledge to make better decisions about careers, relationships, and personal growth. Our age-tiered approach ensures the experience is appropriate and engaging for every stage of life.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Who We Are
          </h2>
          <p className="text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            KnowYouRole was created by a team passionate about making personality psychology practical and fun. We combine expertise in behavioral science, education, and technology to deliver an experience that's both scientifically informed and genuinely enjoyable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
            Research-Informed
          </h2>
          <p className="text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
            Our assessments draw on decades of published research in personality psychology. While no online quiz can replace a clinical evaluation, our tools are designed to give you meaningful, research-informed insights that can guide your self-discovery journey.
          </p>
        </section>
      </main>
    </div>
  );
}
