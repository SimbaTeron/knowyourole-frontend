'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { COOKIE_PREFERENCES_EVENT } from "@/components/CookieConsentBanner";

const sectionClass = "space-y-3";
const headingClass = "text-lg font-semibold text-warm-gray dark:text-[#F8FAFC]";
const listClass = "list-disc space-y-1 pl-5 text-sm";

export default function Privacy() {
  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT));
  };

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
        <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-privacy-title">Privacy Policy</h1>
        <p className="text-sm text-warm-gray/50 dark:text-[#64748B] mb-8">Last reviewed: July 27, 2026</p>

        <div className="p-4 rounded-xl bg-terracotta/5 dark:bg-[#A78BFA]/5 border border-terracotta/10 dark:border-[#A78BFA]/15 mb-8" data-testid="section-data-promise">
          <h2 className={headingClass}>Plain-English summary</h2>
          <p className="mt-2 text-sm leading-relaxed text-warm-gray/80 dark:text-[#94A3B8]">
            KnowYouRole saves quiz completions so your result can be generated and recovered. We do not sell quiz results. Analytics is optional; advertising technology is not active today.
          </p>
        </div>

        <div className="space-y-8 text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
          <section className={sectionClass}>
            <h2 className={headingClass}>Overview</h2>
            <p>
              KnowYouRole ("we," "our," or "us") provides personality quiz results, career-fit guidance, and related self-reflection tools. This policy explains what information we collect, how we use it, and how you can ask us to access, correct, export, or delete it.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Information we collect</h2>
            <ul className={listClass}>
              <li>Quiz answers, score outputs, result pages viewed, and result identifiers.</li>
              <li>Age tier selection so quiz copy and experience can be age-appropriate.</li>
              <li>Email address and related delivery metadata if you request report delivery, updates, or account access.</li>
              <li>Feedback you submit voluntarily.</li>
              <li>Device, browser, referral, and performance data when analytics is enabled through cookie preferences.</li>
              <li>Browser storage used for quiz state, consent preferences, and session continuity.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>How we use information</h2>
            <ul className={listClass}>
              <li>Generate and save your personality profile and career-fit recommendations.</li>
              <li>Deliver results or account/report links if you provide an email address.</li>
              <li>Maintain and improve quiz quality, accessibility, and product usability.</li>
              <li>Monitor site performance, abuse prevention, and basic security.</li>
              <li>Measure aggregate usage, such as quiz starts, completions, page views, and share clicks, only when analytics consent is enabled.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Analytics tools</h2>
            <p>
              KnowYouRole supports Google Analytics to understand aggregate site behavior, such as pages visited, quiz starts or completions, and page performance. The Google Analytics script is loaded only after you enable Analytics in cookie preferences. We do not intentionally send quiz answers, email addresses, medical data, or direct identifiers to Google Analytics.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Cookies, local storage, and third-party cookies</h2>
            <p>
              Essential local or session storage keeps quiz state, consent choices, and session continuity available in your browser. Google Analytics may set or read its own technologies only after analytics consent. No advertising cookies, pixels, or ad partners are active in the current product.
            </p>
            <ul className={listClass}>
              <li><span className="font-medium">Essential:</span> required for the site and quiz to function.</li>
              <li><span className="font-medium">Analytics:</span> helps us understand aggregate usage and improve the product.</li>
              <li><span className="font-medium">Advertising:</span> no advertising technology is active today; the preference remains off by default.</li>
            </ul>
            <button
              id="cookie-preferences"
              type="button"
              onClick={openCookiePreferences}
              className="mt-2 rounded-full border border-[#00C8FF]/40 px-4 py-2 text-sm font-semibold text-[#00C8FF] hover:bg-[#00C8FF]/10"
            >
              Manage cookie preferences
            </button>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Advertising status</h2>
            <p>
              KnowYouRole does not currently run advertising technology, advertising pixels, or ad-partner cookies. If that changes, we will update this policy and consent controls before activating it.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Email capture and report delivery</h2>
            <p>
              If you choose “Email this result,” we store your email, result/session identifiers, displayed summary fields (such as the MBTI-style pattern, DISC-style result, and primary role title), consent to send the summary, and delivery status. We use that record to send or queue the requested summary. A separate optional marketing consent exists in the data model, but this current result form submits it as false and does not sign you up for marketing.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Children and teens</h2>
            <p>
              KnowYouRole is designed with age-aware quiz experiences. We do not knowingly collect personal information from children under 13 without appropriate consent. If you are under 13, do not provide an email address or other personal information without a parent or guardian. If a parent or guardian believes a child under 13 provided personal information, contact us and we will review deletion requests promptly.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Your privacy rights</h2>
            <p>
              Depending on where you live, laws such as California's CCPA/CPRA or GDPR-style privacy frameworks may give you rights to access, correct, delete, export, restrict, or object to certain uses of your personal information. We do not claim that every framework applies to every visitor, but we try to honor reasonable privacy requests.
            </p>
            <ul className={listClass}>
              <li>Request a copy or export of personal data reasonably linked to you.</li>
              <li>Request correction of inaccurate account or report-delivery information.</li>
              <li>Request deletion of personal data reasonably linked to you, subject to security, legal, and operational limits.</li>
              <li>Opt out of non-essential analytics or advertising cookies.</li>
              <li>Ask whether we share or sell personal information. We do not sell quiz results.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Data deletion, export, and correction requests</h2>
            <p>
              To request deletion, export, or correction, email <a href="mailto:info@knowyourole.com" className="text-terracotta dark:text-[#A78BFA] underline">info@knowyourole.com</a>. Include enough detail for us to locate your record, such as the email you used for report delivery or the result/session identifier if available. We may need to verify the request before acting on it.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Data protection</h2>
            <p>
              We use reasonable technical and organizational safeguards for the current stage of the product, including encrypted transport and restricted access to backend systems. No website can guarantee perfect security, so avoid entering sensitive medical, psychiatric, financial, or government-identification information into quiz answers or feedback fields.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Contact</h2>
            <p>
              Questions or privacy requests: <a href="mailto:info@knowyourole.com" className="text-terracotta dark:text-[#A78BFA] underline">info@knowyourole.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
