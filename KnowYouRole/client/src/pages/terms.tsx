import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/glass/NeonText";

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <AppHeader />
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          <NeonText size="xl" className="mb-8 text-center">Terms of Service</NeonText>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#00C8FF' }}>Acceptance of Terms</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              By using KnowYouRole, you agree to these terms. If you don't agree, please don't use our service.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#7800FF' }}>Use of Service</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              KnowYouRole provides personality assessments for informational purposes only. Our quizzes are not diagnostic tools and should not be used as a substitute for professional advice.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#39FF14' }}>Account Responsibilities</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              You're responsible for maintaining the security of your account. Don't share your login credentials with others. Let us know immediately if you suspect unauthorized access.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#FF00E5' }}>Premium Subscriptions</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Premium subscriptions are billed monthly. You can cancel anytime from your account settings. No refunds for partial months.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#00C8FF' }}>Changes to Terms</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              We may update these terms from time to time. We'll notify you of significant changes. Your continued use means you accept the new terms.
            </p>
          </GlassCard>
          
          <div className="text-center mt-8">
            <Link href="/">
              <button className="btn btn-secondary">Back to Home</button>
            </Link>
          </div>
        </div>
      </PageContainer>
      <AppFooter />
    </div>
  );
}