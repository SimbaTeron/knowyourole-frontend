import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
        <p className="text-sm text-warm-gray/50 dark:text-[#64748B] mb-8">Last updated: March 2026</p>

        <div className="space-y-8 text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Overview</h2>
            <p>
              KnowYouRole ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our personality assessment platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Information We Collect</h2>
            <p className="mb-2">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Assessment responses (personality quiz answers)</li>
              <li>Age tier selection (to provide age-appropriate content)</li>
              <li>Account information if you choose to sign in (name, email)</li>
              <li>Usage data (pages visited, features used)</li>
              <li>Device and browser information for platform optimization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>To generate your personality assessment results</li>
              <li>To provide personalized career matching recommendations</li>
              <li>To save your results if you create an account</li>
              <li>To improve our assessment algorithms and user experience</li>
              <li>To communicate important updates about the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Data Protection</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. Your assessment data is encrypted in transit and at rest. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Children's Privacy</h2>
            <p>
              We are committed to protecting the privacy of children. Our platform offers age-appropriate content for users ages 7-12 (Mini Explorer tier). We do not knowingly collect personal information from children under 13 without parental consent. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Cookies & Local Storage</h2>
            <p>
              We use browser local storage and session storage to save your preferences (such as theme selection) and maintain your session state during assessments. This data stays on your device and is not transmitted to our servers unless you create an account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of non-essential data collection</li>
              <li>Export your assessment results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, please contact us at privacy@knowyourole.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
