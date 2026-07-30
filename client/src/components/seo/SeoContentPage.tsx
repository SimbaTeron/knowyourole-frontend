import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import type { SeoPage } from "@/lib/seo-pages";

function jsonLd(page: SeoPage) {
  const url = `https://knowyourole.com${page.path === "/" ? "" : page.path}`;
  const breadcrumbParts = page.path.split("/").filter(Boolean);
  return [
    { "@context": "https://schema.org", "@type": page.phase === "learn" || page.phase === "resource" || page.phase === "result" ? "Article" : "WebPage", headline: page.h1, name: page.h1, description: page.description, url, author: { "@type": "Organization", name: "KnowYouRole" }, publisher: { "@type": "Organization", name: "KnowYouRole", url: "https://knowyourole.com" }, mainEntityOfPage: url },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://knowyourole.com" }, ...breadcrumbParts.map((part, index) => ({ "@type": "ListItem", position: index + 2, name: part.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "), item: `https://knowyourole.com/${breadcrumbParts.slice(0, index + 1).join("/")}` }))] },
    ...(page.faqs?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) }] : []),
  ];
}

/** Shared content architecture for every guide, comparison, career page, and result-type page. */
export function SeoContentPage({ page, indexPages = [] }: { page: SeoPage; indexPages?: SeoPage[] }) {
  const schema = jsonLd(page);
  return (
    <main className="workday-content-page">
      <AppHeader />
      {schema.map((item, index) => <script key={`${page.path}-schema-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }} />)}
      <section className="workday-content-hero">
        <div className="workday-content-wrap">
          <Link href="/" className="workday-content-kicker">KnowYouRole <span>↗</span></Link>
          <p className="workday-content-eyebrow">{page.eyebrow}</p>
          <h1>{page.h1}</h1>
          <p className="workday-content-intro">{page.intro}</p>
          <div className="workday-content-actions">
            <Link href="/quiz" className="workday-content-primary">Take the free quiz <span>↗</span></Link>
            <Link href="/methodology" className="workday-content-secondary">How it works</Link>
          </div>
        </div>
      </section>
      <section className="workday-content-wrap workday-content-grid">
        <article className="workday-content-body">
          {page.sections.map((section, index) => (
            <section key={section.heading} className="workday-content-section">
              <p className="workday-content-count">{String(index + 1).padStart(2, "0")}</p>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
              {section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
            </section>
          ))}
          {indexPages.length ? <section className="workday-content-section"><p className="workday-content-count">Library</p><h2>Keep exploring</h2><div className="workday-content-library">{indexPages.map((item) => <Link key={item.path} href={item.path}><span>{item.eyebrow}</span><strong>{item.h1}</strong><em>{item.description}</em></Link>)}</div></section> : null}
          {page.faqs?.length ? <section className="workday-content-section"><p className="workday-content-count">FAQ</p><h2>Common questions</h2><div className="workday-content-faq">{page.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div></section> : null}
        </article>
        <aside className="workday-content-aside">
          <div className="workday-content-next"><p>One practical next step</p><h2>Get your work-style picture.</h2><span>Five minutes. No account required to start.</span><Link href="/quiz">Start the quiz <b>↗</b></Link></div>
          {page.related?.length ? <nav className="workday-content-related" aria-label="Related pages"><p>Related reading</p>{page.related.map((href) => <Link key={href} href={href}>{href.replaceAll("/", "").replaceAll("-", " ")} <span>↗</span></Link>)}</nav> : null}
          <p className="workday-content-trust">Built for self-reflection and career-fit exploration—not diagnosis, hiring decisions, or a life sentence.</p>
        </aside>
      </section>
    </main>
  );
}
