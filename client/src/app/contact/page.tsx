import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact KnowYouRole | Personality Quiz Support",
  description: "Contact KnowYouRole for questions about the personality quiz, privacy, methodology, career-fit results, partnerships, or support.",
});

export default function ContactPage() {
  return (
    <main className="workday-simple-page min-h-screen">
      <AppHeader />
      <section className="workday-simple-wrap max-w-3xl px-6 py-32">
        <p className="workday-simple-eyebrow">Contact</p>
        <h1>Questions, corrections, or support.</h1>
        <p className="workday-simple-intro">Contact KnowYouRole about the quiz, your result, privacy, methodology, partnerships, or a site issue. Include the page you were on and what you expected to happen when reporting a problem.</p>
        <div className="workday-simple-grid">
          <article>
            <p>Support</p>
            <h2>Quiz and result questions</h2>
            <span>Tell us which screen you reached, what surprised you, and what would have been more useful.</span>
          </article>
          <article>
            <p>Privacy</p>
            <h2>Data, export, or deletion requests</h2>
            <span>Review the Privacy Policy first, then send your request through the listed support channel.</span>
          </article>
        </div>
        <div className="workday-simple-callout">
          <strong>KnowYouRole is a self-reflection and career-fit tool—not a clinical assessment, diagnosis, or hiring screen.</strong>
        </div>
        <a className="workday-simple-email" href="mailto:info@knowyourole.com">Email info@knowyourole.com <span>↗</span></a>
      </section>
    </main>
  );
}
