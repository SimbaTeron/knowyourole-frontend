'use client';

import Link from "next/link";
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

        <div className="p-4 rounded-xl bg-terracotta/5 dark:bg-[#A78BFA]/5 border border-terracotta/10 dark:border-[#A78BFA]/15 mb-8" data-testid="section-no-data-promise">
          <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Our No-Data Promise</h2>
          <p className="text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed text-sm">
            Your personality results are processed in your browser and are not stored on our servers unless you explicitly create an account and choose to save them. We never sell your data to third parties, and we never will. You can take the quiz, get your results, and leave without us keeping a thing.
          </p>
        </div>

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
            <p className="mb-2">
              We use browser local storage and session storage to save your preferences (such as theme selection) and maintain your session state during assessments. This data stays on your device and is not transmitted to our servers unless you create an account.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><span className="font-medium">Theme preference</span> — Remembers your light/dark mode choice</li>
              <li><span className="font-medium">Session state</span> — Keeps your quiz progress if you navigate away</li>
              <li><span className="font-medium">Mood selections</span> — Stores your mood choices during the current session</li>
              <li><span className="font-medium">Analytics cookies</span> — We use Google Analytics to understand general usage patterns (pages visited, time on site). No personally identifiable information is collected through analytics.</li>
            </ul>
            <p className="mt-2 text-sm">
              You can clear all stored data at any time through your browser settings. Clearing this data will reset your theme preference and any in-progress quiz sessions.
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
              If you have questions about this Privacy Policy or your data, please contact us at info@knowyourole.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">CCPA — Your California Privacy Rights</h2>
            <p className="mb-3 text-sm text-warm-gray/80 dark:text-[#94A3B8]">
              If you are a California resident, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-warm-gray/80 dark:text-[#94A3B8]">
              <li>Know what personal information we collect about you</li>
              <li>Request deletion of your personal information</li>
              <li><strong>Opt out of the sale of your personal information</strong> — We do <em>not</em> sell your personal information. You do not need to take any action.</li>
              <li>Non-discrimination for exercising your privacy rights</li>
            </ul>
            <div className="mt-4 p-4 rounded-xl bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
              <p className="text-sm text-sky-800 dark:text-sky-200 font-medium">
                We Do Not Sell Your Data
              </p>
              <p className="text-xs text-sky-700 dark:text-sky-300 mt-1">
                KnowYourRole does not sell, trade, or rent your personal information to third parties. Your data is yours, and we keep it that way.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">GDPR — Your European Privacy Rights</h2>
            <p className="mb-3 text-sm text-warm-gray/80 dark:text-[#94A3B8]">
              If you are located in the European Economic Area, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-warm-gray/80 dark:text-[#94A3B8]">
              <li><strong>Access</strong> — Request a copy of your personal data</li>
              <li><strong>Rectification</strong> — Correct inaccurate personal data</li>
              <li><strong>Erasure</strong> — Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Data Portability</strong> — Receive your data in a structured, machine-readable format</li>
              <li><strong>Restrict processing</strong> — Limit how we use your data</li>
              <li><strong>Object</strong> — Object to certain processing activities</li>
            </ul>
            <p className="mt-3 text-sm text-warm-gray/80 dark:text-[#94A3B8]">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:info@knowyourole.com"
                className="text-terracotta dark:text-[#A78BFA] underline"
              >
                info@knowyourole.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
