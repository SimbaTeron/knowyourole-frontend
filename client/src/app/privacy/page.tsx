'use client';

import { AppHeader } from "@/components/layout/AppHeader";
import { COOKIE_PREFERENCES_EVENT } from "@/components/CookieConsentBanner";

const sectionClass = "space-y-3";
const headingClass = "text-lg font-semibold text-warm-gray dark:text-[#F8FAFC]";
const listClass = "list-disc space-y-1 pl-5 text-sm";

export default function Privacy() {
  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT));
  };

  return (
    <div className="workday-simple-page min-h-screen bg-soft-cream text-warm-gray">
      <AppHeader />
      <main className="workday-simple-wrap max-w-2xl px-6 py-32">
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
              <li>Email address, selected result-summary fields, consent, and delivery status when you explicitly request that a result summary be emailed.</li>
              <li>Feedback you submit voluntarily.</li>
              <li>Device, browser, referral, and performance data when analytics is enabled through cookie preferences.</li>
              <li>Browser storage used for quiz state, consent preferences, and session continuity.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>How we use information</h2>
            <ul className={listClass}>
              <li>Generate and save your personality profile and career-fit recommendations.</li>
              <li>Send a requested result summary when delivery is available and you explicitly opt in to that one-time request.</li>
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
            <h2 className={headingClass}>Requested result email</h2>
            <p>
              If you choose “Email this result,” KnowYouRole stores your email address, result/session identifiers, the visible summary fields needed for the email (such as the MBTI-style pattern, DISC-style result, and primary role title), your explicit request to send the summary, and delivery status. Raw quiz answers are not included in the email-request record or the emailed summary.
            </p>
            <p>
              This is a one-time result-delivery request, not marketing enrollment. Marketing consent is off by default and is not collected by this form. If result-email delivery is unavailable, the form tells you to use the existing PDF or sharing options instead of silently treating an email request as delivered.
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
              To request deletion, export, or correction, email <a href="mailto:info@knowyourole.com" className="text-terracotta dark:text-[#A78BFA] underline">info@knowyourole.com</a>. Include enough detail for us to locate the relevant record, such as the result/session identifier if available. We may need to verify the request before acting on it.
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
