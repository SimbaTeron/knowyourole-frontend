import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/glass/NeonText";
import { NeonButton } from "@/components/glass/NeonButton";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <AppHeader />
      <PageContainer>
        <div className="max-w-md mx-auto text-center pt-20">
          <div className="text-6xl mb-6">❌</div>
          <NeonText size="xl" className="mb-4">Payment Cancelled</NeonText>
          <GlassCard className="p-6 mb-8">
            <p className="text-white/70 mb-4">
              Your payment was cancelled and no charges were made to your account.
            </p>
            <p className="text-white/50 text-sm">
              You can try again when you're ready, or contact support if you have any questions.
            </p>
          </GlassCard>
          <Link href="/">
            <NeonButton variant="primary">Back to Home</NeonButton>
          </Link>
        </div>
      </PageContainer>
      <AppFooter />
    </div>
  );
}