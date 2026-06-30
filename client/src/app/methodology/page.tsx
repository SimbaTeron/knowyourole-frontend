import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology | KnowYouRole",
  description: "How KnowYouRole combines Big Five traits, MBTI-style personality language, DISC-style communication insights, and career-fit guidance for self-reflection.",
};

const citations = [
  {
    title: "John, O. P., & Srivastava, S. (1999). The Big Five trait taxonomy: History, measurement, and theoretical perspectives.",
    href: "https://pages.uoregon.edu/sanjay/pubs/bigfive.pdf",
  },
  {
    title: "Goldberg, L. R. (1990). An alternative description of personality: The Big-Five factor structure.",
    href: "https://doi.org/10.1037/0022-3514.59.6.1216",
  },
  {
    title: "McCrae, R. R., & Costa, P. T. (1997). Personality trait structure as a human universal.",
    href: "https://doi.org/10.1037/0003-066X.52.5.509",
  },
  {
    title: "Soto, C. J., & John, O. P. (2017). The next Big Five Inventory: Developing and assessing the BFI-2.",
    href: "https://doi.org/10.1037/pspp0000096",
  },
  {
    title: "Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis.",
    href: "https://doi.org/10.1111/j.1744-6570.1991.tb00688.x",
  },
  {
    title: "Morgeson et al. (2007). Reconsidering the use of personality tests in personnel selection contexts.",
    href: "https://doi.org/10.1111/j.1744-6570.2007.00089.x",
  },
  {
    title: "Pittenger, D. J. (2005). Cautionary comments regarding the Myers-Briggs Type Indicator.",
    href: "https://doi.org/10.1037/1065-9293.57.3.210",
  },
  {
    title: "Myers & Briggs Foundation: MBTI basics and type descriptions.",
    href: "https://www.myersbriggs.org/my-mbti-personality-type/mbti-basics/",
  },
  {
    title: "Marston, W. M. (1928). Emotions of Normal People — historical source behind DISC-style language.",
    href: "https://archive.org/details/emotionsofnormal032195mbp",
  },
  {
    title: "American Psychological Association: Understanding psychological assessment limits and context.",
    href: "https://www.apa.org/topics/testing-assessment-measurement/understanding",
  },
];

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.04] p-5";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050510]/90 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-[#00C8FF]">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#00C8FF]">Methodology</p>
        <h1 className="mb-3 text-4xl font-black tracking-tight sm:text-5xl">How KnowYouRole interprets your results</h1>
        <p className="mb-2 text-sm text-white/45">Last updated: June 2026</p>
        <p className="mb-8 text-lg leading-relaxed text-white/70">
          KnowYouRole combines a research-backed trait backbone with plain-English personality and work-style language. It is built for self-reflection and career exploration, not diagnosis, hiring decisions, or clinical evaluation.
        </p>

        <section className="mb-8 rounded-2xl border border-[#00C8FF]/20 bg-[#00C8FF]/10 p-5">
          <h2 className="mb-2 text-xl font-bold">The short version</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/75">
            <li><strong>Big Five</strong> is the scientific backbone because it has stronger research support than type-based systems.</li>
            <li><strong>MBTI-style patterns</strong> are used as an interpretive language layer, not as a claim that everyone fits a perfect four-letter box.</li>
            <li><strong>DISC-style insights</strong> are used for communication and work-style reflection, not as clinical measurement.</li>
            <li><strong>Career matching</strong> is guidance based on trait fit and work preferences, not a diagnosis or employment recommendation.</li>
          </ul>
        </section>

        <div className="space-y-8 text-white/75">
          <section className={cardClass}>
            <h2 className="mb-3 text-2xl font-bold text-white">1. Big Five: the backbone</h2>
            <p className="leading-relaxed">
              The Big Five model describes personality across five broad traits: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism/emotional reactivity. In KnowYouRole, these dimensions help anchor the result in a trait model with substantial academic support.
            </p>
            <p className="mt-3 leading-relaxed">
              We treat Big Five scores as tendencies, not destiny. A high or low score does not mean "good" or "bad"; it describes the kinds of situations, habits, and environments that may feel more natural or more effortful.
            </p>
          </section>

          <section className={cardClass}>
            <h2 className="mb-3 text-2xl font-bold text-white">2. MBTI-style patterns: personality language</h2>
            <p className="leading-relaxed">
              KnowYouRole uses MBTI-style language because many people find type descriptions memorable and useful for reflection. We use careful language such as "style," "pattern," and "preference" rather than claiming that the type layer is as scientifically validated as Big Five trait measurement.
            </p>
            <p className="mt-3 leading-relaxed">
              Close scores should be read as uncertainty. If you land near the middle of a dimension, the report should treat that as a blend or situational preference, not force a dramatic identity claim.
            </p>
          </section>

          <section className={cardClass}>
            <h2 className="mb-3 text-2xl font-bold text-white">3. DISC-style insights: communication and work style</h2>
            <p className="leading-relaxed">
              DISC-style categories are used as a practical communication lens: how you may assert yourself, influence others, seek stability, or prefer structure. This layer is meant to make results easier to apply in team, school, and career contexts.
            </p>
            <p className="mt-3 leading-relaxed">
              DISC-style output is not a clinical instrument. It is best read as a language for work-style reflection and conversation.
            </p>
          </section>

          <section className={cardClass}>
            <h2 className="mb-3 text-2xl font-bold text-white">4. Career matching: guidance, not diagnosis</h2>
            <p className="leading-relaxed">
              Career recommendations are generated from patterns across traits, communication style, energy, and role themes. They are intended to spark better questions: What environments fit you? What work drains you? What skills are worth building next?
            </p>
            <p className="mt-3 leading-relaxed">
              A career match is not employment-selection advice, a hiring screen, a prediction of success, or a guarantee of satisfaction. Real career decisions should also consider skills, values, location, pay, opportunity, education, health, family needs, and lived experience.
            </p>
          </section>

          <section className={cardClass}>
            <h2 className="mb-3 text-2xl font-bold text-white">Plain-English scoring</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              <li>You answer quiz prompts designed to reveal preferences, reactions, and work-style tendencies.</li>
              <li>Answers add weight to Big Five traits, MBTI-style preference dimensions, and DISC-style communication signals.</li>
              <li>Scores are normalized into readable percentages and interpreted as ranges, not exact measurements.</li>
              <li>The report combines strong signals, close-score uncertainty, and career-fit themes into a practical summary.</li>
              <li>Results can improve over time as the question bank, scoring calibration, and explanation quality are refined.</li>
            </ol>
          </section>

          <section className={cardClass}>
            <h2 className="mb-3 text-2xl font-bold text-white">Limits and disclaimers</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              <li>KnowYouRole is not medical, psychiatric, psychological, legal, financial, or employment-selection advice.</li>
              <li>The quiz is not designed to diagnose mental health conditions or determine fitness for a job.</li>
              <li>Self-report answers can be affected by mood, context, self-awareness, social desirability, and wording.</li>
              <li>Personality changes across age, experience, stress, culture, and environment.</li>
              <li>Use results as a reflection tool, not a label you must obey.</li>
            </ul>
          </section>

          <section className={cardClass}>
            <h2 className="mb-3 text-2xl font-bold text-white">Resources and citations</h2>
            <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed">
              {citations.map((citation) => (
                <li key={citation.href}>
                  <a href={citation.href} target="_blank" rel="noopener noreferrer" className="text-[#00C8FF] underline underline-offset-4">
                    {citation.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
            <h2 className="mb-2 text-lg font-bold text-white">Changelog</h2>
            <p><strong>June 2026:</strong> Updated public methodology language, clarified Big Five as the backbone, separated MBTI-style and DISC-style layers from scientific validation claims, added limitations and citation links.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
