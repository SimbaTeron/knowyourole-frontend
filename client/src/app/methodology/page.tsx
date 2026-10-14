import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/methodology");

const citations = [
  {
    title: "Soto, C. J., & John, O. P. (2017). The next Big Five Inventory (BFI-2).",
    href: "https://doi.org/10.1037/pspp0000096",
  },
  {
    title: "Barrick, M. R., & Mount, M. K. (1991). Big Five dimensions and job performance.",
    href: "https://doi.org/10.1111/j.1744-6570.1991.tb00688.x",
  },
  {
    title: "Morgeson et al. (2007). Reconsidering personality tests in personnel selection.",
    href: "https://doi.org/10.1111/j.1744-6570.2007.00089.x",
  },
  {
    title: "Pittenger, D. J. (2005). Cautionary comments regarding the Myers-Briggs Type Indicator.",
    href: "https://doi.org/10.1037/1065-9293.57.3.210",
  },
  {
    title: "American Psychological Association: Understanding assessment limits and context.",
    href: "https://www.apa.org/topics/testing-assessment-measurement/understanding",
  },
];

const cardClass = "rounded-3xl border border-[#12263a]/15 bg-white/70 p-5 shadow-[0_14px_35px_rgba(18,38,58,0.06)] sm:p-7";
const headingClass = "font-display text-2xl font-bold tracking-[-0.025em] text-[#12263a] sm:text-3xl";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#12263a]">
      <style>{`html.kyr-workday header[class*="sticky"] .methodology-primary-cta { color: #fffdf8 !important; font-size: 16px !important; }`}</style>
      <header className="sticky top-0 z-50 border-b border-[#12263a]/10 bg-[#fffaf0]/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#315f74] underline-offset-4 transition hover:text-[#b64d35] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b64d35]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to KnowYouRole
          </Link>
          <Link href="/quiz" className="methodology-primary-cta inline-flex min-h-11 items-center rounded-full bg-[#12263a] px-4 font-bold transition hover:bg-[#24455c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b64d35]">
            Take the quiz
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#b64d35]">Methodology & limits</p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-[#12263a] sm:text-6xl">
          A useful work-style read, not a verdict on a person.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#405f72] sm:text-xl">
          KnowYouRole turns a short set of self-reported work preferences into practical language for reflection and role exploration. It does not diagnose, rank, certify, hire, or predict a person&apos;s future.
        </p>
        <p className="mt-4 text-sm font-medium text-[#617987]">Last reviewed: July 27, 2026 · Questions or corrections: <a className="text-[#315f74] underline underline-offset-4 hover:text-[#b64d35]" href="mailto:info@knowyourole.com">info@knowyourole.com</a></p>

        <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Methodology summary">
          {[
            ["28 prompts", "A fixed short-form assessment: 8 core-style, 8 Big Five, 5 DISC, 5 career-fit, and 2 calibration prompts."],
            ["Four lenses", "Big Five-informed traits, MBTI-style preferences, DISC-style work behavior, and career-evidence themes."],
            ["One purpose", "Generate hypotheses about work patterns and role directions worth testing in real life."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-[#12263a]/12 bg-[#f7eddc] p-5">
              <h2 className="font-display text-xl font-bold text-[#12263a]">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#405f72]">{body}</p>
            </div>
          ))}
        </section>

        <div className="mt-12 space-y-6">
          <section className={cardClass}>
            <h2 className={headingClass}>What the quiz measures</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-bold text-[#12263a]">Big Five-informed traits</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#405f72]">This is KYR&apos;s trait backbone: openness, conscientiousness, extraversion, agreeableness, and emotional reactivity. It provides a way to describe degree rather than force a binary label.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#12263a]">MBTI-style preferences</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#405f72]">This is a readable language layer for energy, information, decisions, and structure. KYR is not the official MBTI assessment and does not claim four letters explain a whole person.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#12263a]">DISC-style work behavior</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#405f72]">This lens describes observable tendencies around directness, influence, steadiness, and precision. It is for work and communication reflection, not clinical measurement.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#12263a]">Career-evidence themes</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#405f72]">Signals such as analysis, people focus, systems, pace, creativity, service, autonomy, and practical work help generate role directions and examples to explore—not job guarantees.</p>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={headingClass}>How a result is formed</h2>
            <ol className="mt-4 grid gap-3 text-sm leading-relaxed text-[#405f72] sm:grid-cols-2">
              {[
                "You answer the 28 prompts based on your usual work pattern—not an ideal self or one unusual week.",
                "Answers contribute weighted signals to the four interpretation lenses above.",
                "The result compares stronger and closer signals, then turns them into plain-English work patterns and role-direction hypotheses.",
                "The report explains a leading direction, supporting evidence, nearby possibilities, and a practical experiment where available.",
              ].map((item, index) => (
                <li key={item} className="flex gap-3 rounded-2xl bg-[#fffaf0] p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#315f74] text-xs font-extrabold text-white">{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-2xl border border-[#d9a441]/35 bg-[#fff5d8] p-4 text-sm leading-relaxed text-[#5a451a]">
              <strong>Important:</strong> research on the Big Five does not validate this exact 28-question KYR implementation, its weighting, or any individual role recommendation. We do not publish an accuracy percentage because we do not have evidence to support one.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-[#405f72]">
              Ready to compare these ideas with your own answers? <Link href="/quiz" className="font-semibold text-[#315f74] underline underline-offset-4 hover:text-[#b64d35]">Take the free 28-question work-style quiz</Link> and use the result as one input to a real-world experiment.
            </p>
          </section>

          <section className={cardClass}>
            <h2 className={headingClass}>Close calls, mixed evidence, and low confidence</h2>
            <p className="mt-4 leading-relaxed text-[#405f72]">A close score is information, not a defect. When preference signals sit close together, KYR uses labels such as <strong>close-call</strong>, <strong>directional</strong>, or <strong>mixed evidence</strong> rather than pretending there is one dramatic, permanent answer.</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#405f72]">
              <li>Read close or mixed outputs as a blend and compare them against your lived experience.</li>
              <li>Use an adjacent role example or a small real-world experiment before making a major career decision.</li>
              <li>Retaking the quiz after a meaningful context change can be useful, but repeated results are still self-report snapshots—not a clinical profile.</li>
              <li>Incomplete, inconsistent, or low-signal responses should reduce confidence, not produce stronger claims.</li>
            </ul>
          </section>

          <section className={cardClass}>
            <h2 className={headingClass}>What a result can—and cannot—do</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#3f7d5b]/25 bg-[#edf7ef] p-5">
                <h3 className="font-bold text-[#245237]">Useful for</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#315f74]">
                  <li>Putting patterns in words</li>
                  <li>Comparing work environments</li>
                  <li>Starting a career conversation</li>
                  <li>Choosing a small experiment to run next</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#b64d35]/25 bg-[#fff0e9] p-5">
                <h3 className="font-bold text-[#853520]">Not designed for</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#6e3d31]">
                  <li>Diagnosis, treatment, or mental-health screening</li>
                  <li>Hiring, admissions, promotion, or eligibility decisions</li>
                  <li>Predicting job performance, income, or satisfaction</li>
                  <li>Replacing qualified career, medical, legal, or financial advice</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={headingClass}>Evidence and references</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#405f72]">These sources inform the way we describe established frameworks and their limits. They are not endorsements of KnowYouRole or proof of individual result accuracy.</p>
            <ol className="mt-5 space-y-3 text-sm leading-relaxed text-[#405f72]">
              {citations.map((citation) => (
                <li key={citation.href} className="flex gap-3">
                  <span className="text-[#b64d35]">•</span>
                  <a href={citation.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 font-semibold text-[#315f74] underline decoration-[#315f74]/35 underline-offset-4 hover:text-[#b64d35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b64d35]">
                    {citation.title}<ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
