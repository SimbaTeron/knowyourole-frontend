import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Database, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/build");

const sections = [
  {
    icon: Workflow,
    title: "Problem",
    body: "Most personality products stop at a label. KnowYouRole was built to turn a short self-report into usable work-style language, pressure patterns, communication clues, and career directions worth testing in real life.",
  },
  {
    icon: Database,
    title: "Architecture",
    body: "The public app is a Next.js application. A fixed 28-question bank submits answer evidence to a server route, which recomputes the interpretation, builds one canonical result record, and persists it through Supabase before the result is shown.",
  },
  {
    icon: ShieldCheck,
    title: "Data & trust",
    body: "Results are designed as private self-reflection records, with data-access and deletion paths in the product. The quiz is explicit about its limits: it is not a diagnosis, hiring tool, or prediction engine.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted workflow",
    body: "AI assistance accelerates research, implementation, visual review, and regression work. Product scope, claims, privacy constraints, and acceptance criteria remain deliberate human decisions—not outputs accepted on autopilot.",
  },
];

const decisions = [
  ["Canonical results over browser math", "The browser sends answer evidence, not trusted score totals or a result identity. The server recomputes and persists the record before a live result can render."],
  ["Useful uncertainty over fake certainty", "Close calls, mixed evidence, and low-evidence states are surfaced as such. A career direction is a hypothesis to test, not a verdict."],
  ["A resilient public catalog", "Career exploration uses a checked-in 147-role baseline so the public experience does not collapse into a thin directory when managed catalog data is incomplete."],
  ["Verification as a feature", "Type checks, production builds, browser regression tests, and smoke paths are used to catch failures before a release is described as complete."],
];

export default function BuildPage() {
  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#12263a]">
      <header className="sticky top-0 z-50 border-b border-[#12263a]/10 bg-[#fffaf0]/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#315f74] underline-offset-4 transition hover:text-[#b64d35] hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to KnowYouRole
          </Link>
          <Link href="/quiz" className="inline-flex min-h-11 items-center rounded-full bg-[#12263a] px-4 text-sm font-bold !text-white transition hover:bg-[#24455c]">
            Try the product <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b64d35]">Build case study</p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.05em] sm:text-6xl">Building a career-reflection product that refuses to pretend it has all the answers.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#405f72] sm:text-xl">KnowYouRole is a public product experiment in turning self-reported work preferences into practical reflection—while making the system, its limits, and its data responsibilities visible enough to inspect.</p>

        <section className="mt-12 grid gap-4 sm:grid-cols-2" aria-label="Build overview">
          {sections.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-3xl border border-[#12263a]/12 bg-white/75 p-6 shadow-[0_14px_35px_rgba(18,38,58,0.06)]">
            <Icon className="h-6 w-6 text-[#b64d35]" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#405f72]">{body}</p>
          </article>)}
        </section>

        <section className="mt-12 rounded-3xl bg-[#12263a] p-6 text-white sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#67E8F9]">System flow</p>
          <ol className="mt-5 grid gap-3 text-sm leading-relaxed sm:grid-cols-4">
            {["28 fixed prompts", "Answer evidence", "Server recomputation", "Persisted result + reflection"].map((step, index) => <li key={step} className="rounded-2xl border border-white/15 bg-white/5 p-4"><span className="text-[#67E8F9]">0{index + 1}</span><p className="mt-2 font-bold">{step}</p></li>)}
          </ol>
        </section>

        <section className="mt-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b64d35]">Difficult decisions</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl">What was deliberately not optimized away</h2>
          <div className="mt-6 space-y-4">
            {decisions.map(([title, body], index) => <article key={title} className="grid gap-3 rounded-2xl border border-[#12263a]/12 bg-white/70 p-5 sm:grid-cols-[3rem_1fr] sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7eddc] font-bold text-[#b64d35]">{index + 1}</span><div><h3 className="font-display text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#405f72]">{body}</p></div></article>)}
          </div>
        </section>

        <section className="mt-12 grid gap-5 rounded-3xl border border-[#d9a441]/35 bg-[#fff5d8] p-6 sm:grid-cols-2 sm:p-8">
          <div><h2 className="font-display text-2xl font-bold text-[#5a451a]">What I learned</h2><p className="mt-3 text-sm leading-relaxed text-[#5a451a]">A polished product is not the absence of caveats. It is the discipline to make claims proportionate to evidence, keep critical data paths coherent, and turn uncertainty into a useful next action.</p></div>
          <div><h2 className="font-display text-2xl font-bold text-[#5a451a]">What comes next</h2><p className="mt-3 text-sm leading-relaxed text-[#5a451a]">The next public-product phase is privacy-respecting funnel measurement and direct user feedback: learn where people start, abandon, complete, return, and act—then improve the product using observed behavior rather than founder intuition alone.</p></div>
        </section>
      </main>
    </div>
  );
}
