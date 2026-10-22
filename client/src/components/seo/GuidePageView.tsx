import Link from "next/link";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PrintLessonButton } from "@/components/seo/PrintLessonButton";
import { GUIDE_UPDATED_LABEL, type GuidePage } from "@/lib/guidePages";
import { QUESTION_COUNT } from "@/lib/quiz/quizConfig";
import { absoluteUrl, breadcrumbJsonLd, ogImagePath, SITE_URL } from "@/lib/seo";

const RELATED_LABELS: Record<string, string> = {
  "/quiz": "Take the free quiz",
  "/methodology": "How the quiz works",
  "/privacy": "What we store",
  "/for-schools": "For schools",
  "/for-parents": "For parents",
  "/for-counselors": "For counselors",
  "/career-quiz-for-teens": "Career quiz for teens",
  "/careers/trades-career-quiz": "Trades career quiz",
  "/careers/creator-careers-quiz": "Creator careers quiz",
  "/personality-quiz-for-students": "Personality quiz for students",
  "/careers": "Career paths",
};

function jsonScript(id: string, data: unknown) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, index) => {
        const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (!match) return <span key={index}>{part}</span>;
        const [, label, href] = match;
        if (href.startsWith("/")) {
          return (
            <Link key={index} href={href}>
              {label}
            </Link>
          );
        }
        if (href.startsWith("mailto:")) {
          return (
            <a key={index} href={href}>
              {label}
            </a>
          );
        }
        return <span key={index}>{label}</span>;
      })}
    </>
  );
}

export function GuidePageView({ page }: { page: GuidePage }) {
  const pageUrl = absoluteUrl(page.path);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.description,
    datePublished: page.lastModified,
    dateModified: page.lastModified,
    image: absoluteUrl(ogImagePath(page.title, page.path)),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: pageUrl,
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="workday-content-page guide-page">
      <AppHeader />
      {jsonScript(`${page.slug}-article`, article)}
      {jsonScript(`${page.slug}-breadcrumb`, breadcrumbJsonLd(page.breadcrumbs))}
      {jsonScript(`${page.slug}-faq`, faq)}
      <style>{`
        .guide-updated { margin: 14px 0 0; color: #28475d; font: 700 13px/1.4 "IBM Plex Sans", "IBM Plex Sans Fallback", sans-serif; }
        .guide-note { margin-top: 22px; max-width: 720px; padding: 14px 16px; border-left: 4px solid #12263a; background: rgba(255,253,248,.82); color: #12263a; font: 650 14px/1.5 "IBM Plex Sans", "IBM Plex Sans Fallback", sans-serif; }
        .guide-crumbs { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 8px; padding: 0; list-style: none; color: #12263a; font: 700 12px/1.4 "IBM Plex Sans", "IBM Plex Sans Fallback", sans-serif; }
        .guide-crumbs a { color: #12263a; }
        .guide-privacy { margin: 14px 0 0; max-width: 680px; color: #28475d; font: 650 14px/1.5 "IBM Plex Sans", "IBM Plex Sans Fallback", sans-serif; }
        .guide-kit { margin-top: 18px; padding: 18px; border: 1px dashed rgba(18,38,58,.35); background: #fffdf8; }
        .guide-kit h3 { margin: 18px 0 8px; font: 700 1.15rem/1.2 "Space Grotesk", "Space Grotesk Fallback", Arial, sans-serif; }
        .guide-kit ol, .guide-kit ul { margin: 8px 0 0; padding-left: 1.2rem; }
        .guide-kit li { margin: 6px 0; color: #28475d; font: 600 14px/1.5 "IBM Plex Sans", "IBM Plex Sans Fallback", sans-serif; }
        .guide-print { margin-top: 12px; min-height: 44px; padding: 0 16px; border: 0; background: #12263a; color: #f8f3e8; font: 800 13px/1 "IBM Plex Sans", "IBM Plex Sans Fallback", sans-serif; cursor: pointer; }
        @media print {
          .workday-header, .workday-footer, .guide-aside, .no-print { display: none !important; }
          .guide-page { background: #fff !important; }
          .workday-content-hero { padding-top: 24px !important; background: #fff !important; }
          .workday-content-grid { display: block !important; }
          .guide-kit { border: 1px solid #12263a; }
        }
      `}</style>
      <section className="workday-content-hero">
        <div className="workday-content-wrap">
          <nav aria-label="Breadcrumb">
            <ol className="guide-crumbs">
              <li>
                <Link href="/">Home</Link>
                <span aria-hidden="true"> / </span>
              </li>
              {page.breadcrumbs.map((crumb, index) => (
                <li key={crumb.path}>
                  {index === page.breadcrumbs.length - 1 ? (
                    <span aria-current="page">{crumb.name}</span>
                  ) : (
                    <>
                      <Link href={crumb.path}>{crumb.name}</Link>
                      <span aria-hidden="true"> / </span>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <p className="workday-content-eyebrow">{page.eyebrow}</p>
          <h1>{page.h1}</h1>
          <p className="guide-updated">Last updated: {GUIDE_UPDATED_LABEL}</p>
          <p className="workday-content-intro">{page.intro}</p>
          <p className="guide-note" role="note">
            This is a reflection tool, not a test you pass or a diagnosis. It suggests directions to explore. It does not tell you what job to do.
          </p>
          <p className="guide-privacy">
            No account or name needed. The quiz is free. See <Link href="/privacy">what we store</Link>.
          </p>
          <div className="workday-content-actions no-print">
            <Link href="/quiz" className="workday-content-primary">
              Take the free quiz <span>↗</span>
            </Link>
            <Link href="/methodology" className="workday-content-secondary">
              How it works
            </Link>
          </div>
        </div>
      </section>
      <section className="workday-content-wrap workday-content-grid">
        <article className="workday-content-body">
          {page.sections.map((section, index) => (
            <section key={section.heading} className="workday-content-section" id={section.heading.startsWith("Printable") ? "lesson-kit" : undefined}>
              <p className="workday-content-count">{String(index + 1).padStart(2, "0")}</p>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>
                  <RichText text={paragraph} />
                </p>
              ))}
              {section.bullets?.length ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.heading.startsWith("Printable") && page.lesson ? <LessonKit lesson={page.lesson} /> : null}
            </section>
          ))}
          <section className="workday-content-section">
            <p className="workday-content-count">FAQ</p>
            <h2>Common questions</h2>
            <div className="workday-content-faq">
              {page.faqs.map((faq) => (
                <details key={faq.q} open>
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>
        <aside className="workday-content-aside guide-aside">
          <div className="workday-content-next">
            <p>One practical next step</p>
            <h2>Get your work-style picture.</h2>
            <span>{`${QUESTION_COUNT} questions. No account or name needed.`}</span>
            <Link href="/quiz">
              Start the quiz <b>↗</b>
            </Link>
          </div>
          <nav className="workday-content-related" aria-label="Related pages">
            <p>Related reading</p>
            {page.related.map((href) => (
              <Link key={href} href={href}>
                {RELATED_LABELS[href] ?? href} <span>↗</span>
              </Link>
            ))}
          </nav>
          <p className="workday-content-trust">
            A useful starting point for a conversation. Not a diagnosis, a grade, or a job assignment.
          </p>
        </aside>
      </section>
      <AppFooter />
    </main>
  );
}

function LessonKit({ lesson }: { lesson: NonNullable<GuidePage["lesson"]> }) {
  return (
    <div className="guide-kit">
      <p className="no-print">
        <PrintLessonButton />
      </p>
      <h3>Lesson steps</h3>
      <ol>
        {lesson.steps.map((step) => (
          <li key={step.name}>
            <strong>{step.name}. </strong>
            {step.detail}
          </li>
        ))}
      </ol>
      {lesson.bands.map((band) => (
        <div key={band.name}>
          <h3>{band.name}</h3>
          <ul>
            {band.prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </div>
      ))}
      <h3>Exit ticket</h3>
      <ul>
        {lesson.exitTicket.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
