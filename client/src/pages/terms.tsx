import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
        <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-terms-title">Terms of Service</h1>
        <p className="text-sm text-warm-gray/50 dark:text-[#64748B] mb-8">Last updated: March 2026</p>

        <div className="space-y-8 text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Acceptance of Terms</h2>
            <p>
              By accessing and using KnowYouRole ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Description of Service</h2>
            <p>
              KnowYouRole provides personality assessments based on established psychological frameworks (Big Five, MBTI, and DISC), along with career matching recommendations. The Service is available for users of all ages, with age-appropriate content tiers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Use of the Service</h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Provide accurate information when selecting your age tier</li>
              <li>Use the Service for personal, non-commercial purposes</li>
              <li>Not attempt to manipulate or reverse-engineer our assessment algorithms</li>
              <li>Not use automated means to access or interact with the Service</li>
              <li>Respect the intellectual property rights of KnowYouRole</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Assessment Results Disclaimer</h2>
            <p>
              The personality assessments and career recommendations provided by KnowYouRole are for informational and educational purposes only. They are not a substitute for professional psychological evaluation, career counseling, or medical advice. Results should be considered as one of many inputs in your self-discovery journey, not as definitive classifications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Accounts</h2>
            <p>
              You may use the Service without creating an account. If you choose to create an account, you are responsible for maintaining the security of your login credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Intellectual Property</h2>
            <p>
              All content on KnowYouRole, including but not limited to text, graphics, logos, assessment questions, and algorithms, is the property of KnowYouRole and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Limitation of Liability</h2>
            <p>
              KnowYouRole is provided "as is" without warranties of any kind. We are not liable for any decisions you make based on your assessment results. In no event shall KnowYouRole be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Modifications</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated revision date. Continued use of the Service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at legal@knowyourole.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
