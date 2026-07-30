import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact KnowYouRole | Personality Quiz Support",
  description: "Contact KnowYouRole for questions about the personality quiz, privacy, methodology, career-fit results, partnerships, or support.",
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#05050d] text-white">
      <section className="mx-auto w-[min(900px,calc(100%-32px))] py-24">
        <a href="/" className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-cyan-100/80">KnowYouRole</a>
        <h1 className="mt-10 text-5xl font-black tracking-[-.06em] md:text-7xl">Contact KnowYouRole</h1>
        <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/68">Questions about the personality quiz, privacy, methodology, results, partnerships, or support can start here.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[.045] p-6"><h2 className="text-2xl font-black">Support</h2><p className="mt-3 text-sm font-semibold leading-7 text-white/60">For quiz or result questions, include what page you were on and what you expected to happen.</p></div>
          <div className="rounded-[28px] border border-white/10 bg-white/[.045] p-6"><h2 className="text-2xl font-black">Privacy</h2><p className="mt-3 text-sm font-semibold leading-7 text-white/60">For privacy, export, or deletion questions, review the privacy policy and contact the operator through the available site support channel.</p></div>
        </div>
        <div className="mt-8 rounded-[28px] border border-cyan-200/20 bg-cyan-200/[.08] p-6"><p className="text-sm font-semibold leading-7 text-white/70">KnowYouRole is a self-reflection and career-fit tool. It is not clinical, diagnostic, or a hiring screen.</p></div>
      </section>
    </main>
  );
}
