import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/for-schools");

const principles = [
  ["A conversation starter", "KnowYouRole uses a fixed 28-question reflection to give students language for discussing interests, work preferences, strengths, and possible directions to explore."],
  ["Not a label or decision tool", "It is not a clinical assessment, diagnosis, official MBTI instrument, hiring tool, admissions screen, prediction engine, or substitute for professional judgment."],
  ["Private by default", "Students can complete the quiz without creating an account or providing an email address. Analytics is optional and only loads after affirmative cookie consent."],
  ["Built for guided use", "A counselor, teacher, or caregiver can sit with a student, clarify questions, and use the result as one input to a broader conversation—not as an answer about who the student is."],
] as const;

export default function ForSchoolsPage() {
  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#12263a]">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b64d35]">For schools, counselors & educators</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.05em] sm:text-6xl">A short, structured way to start a better student conversation.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#405f72] sm:text-xl">
          KnowYouRole is a free work-style reflection and career-exploration tool. In about 15 minutes, students answer 28 fixed questions and receive practical language they can discuss with a counselor, teacher, parent, or caregiver.
        </p>

        <section className="mt-12 grid gap-4 sm:grid-cols-2" aria-label="How KnowYouRole is intended to be used">
          {principles.map(([title, body], index) => (
            <article key={title} className="rounded-3xl border border-[#12263a]/12 bg-white/75 p-6 shadow-[0_14px_35px_rgba(18,38,58,0.06)] sm:p-7">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7eddc] text-sm font-extrabold text-[#b64d35]">0{index + 1}</span>
              <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.025em]">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#405f72]">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-5 rounded-3xl border border-[#315f74]/20 bg-[#edf5f4] p-6 sm:grid-cols-[1.1fr_0.9fr] sm:p-9">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#315f74]">For technology teams</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em]">What this website is—and is not.</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#405f72]">KnowYouRole is an HTTPS-protected public education and career-reflection website. It does not contain adult content, gambling, user-generated content, chat, or a user-facing generative-AI feature. It does not ask students to provide a name, school, address, or email to complete the quiz.</p>
          </div>
          <div className="rounded-2xl border border-[#315f74]/15 bg-white/80 p-5 text-sm leading-relaxed text-[#405f72]">
            <h3 className="font-bold text-[#12263a]">If your network blocks the site</h3>
            <p className="mt-2">Please review or allowlist the canonical domains for educational and career-guidance use:</p>
            <ul className="mt-3 space-y-2 font-semibold text-[#315f74]">
              <li>knowyourole.com</li>
              <li>www.knowyourole.com</li>
            </ul>
            <p className="mt-4">For a technical, privacy, or classification question, contact <a className="font-semibold text-[#315f74] underline underline-offset-4" href="mailto:info@knowyourole.com">info@knowyourole.com</a>.</p>
          </div>
        </section>

        <section className="mt-12 grid gap-5 sm:grid-cols-2">
          <article className="rounded-3xl border border-[#12263a]/12 bg-white/70 p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">Suggested use</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#405f72]">
              <li>Use it as a one-to-one counseling conversation starter.</li>
              <li>Invite students to compare the result with their lived experience and interests.</li>
              <li>Connect possible directions to courses, activities, informational interviews, or small real-world experiments.</li>
              <li>Keep the result in context: it is a self-report snapshot, not a permanent identity.</li>
            </ul>
          </article>
          <article className="rounded-3xl border border-[#12263a]/12 bg-[#fff5d8] p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">Review before use</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#5a451a]">Educators and technology teams can review our privacy and methodology information before a pilot. A district’s own student-data, accessibility, and acceptable-use requirements always control.</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
              <Link className="text-[#315f74] underline underline-offset-4" href="/privacy">Privacy policy</Link>
              <Link className="text-[#315f74] underline underline-offset-4" href="/methodology">Methodology & limits</Link>
              <Link className="text-[#315f74] underline underline-offset-4" href="/contact">Contact</Link>
            </div>
          </article>
        </section>

        <section className="mt-12 rounded-3xl bg-[#12263a] p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-10">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-[-0.035em]">Explore the student experience.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c5d8dc]">Try the same fixed-question experience a student would see. No account is required.</p>
          </div>
          <Link href="/quiz" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#ffca42] px-5 text-sm font-bold text-[#12263a] transition hover:bg-[#ffe08a] sm:mt-0">Take the quiz</Link>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}