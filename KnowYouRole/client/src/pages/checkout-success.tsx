import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/glass/NeonText";
import { NeonButton } from "@/components/glass/NeonButton";

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <AppHeader />
      <PageContainer>
        <div className="max-w-md mx-auto text-center pt-20">
          <div className="text-6xl mb-6">✅</div>
          <NeonText size="xl" color="green" className="mb-4">Payment Successful!</NeonText>
          <GlassCard className="p-6 mb-8">
            <p className="text-white/70 mb-4">
              Thank you for upgrading to Premium. Your account has been activated.
            </p>
            <p className="text-white/50 text-sm mb-4">
              You now have access to:
            </p>
            <ul className="text-left text-sm text-white/60 space-y-2">
              <li>✓ 50-page personality report</li>
              <li>✓ Relationship compatibility analysis</li>
              <li>✓ Career path deep dive</li>
              <li>✓ Shareable PDF report</li>
            </ul>
          </GlassCard>
          <div className="space-y-3">
            <Link href="/results">
              <NeonButton variant="primary" fullWidth>View My Results</NeonButton>
            </Link>
            <Link href="/">
              <NeonButton variant="ghost" fullWidth>Back to Home</NeonButton>
            </Link>
          </div>
        </div>
      </PageContainer>
      <AppFooter />
    </div>
  );
}