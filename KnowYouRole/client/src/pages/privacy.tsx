import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/glass/NeonText";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <AppHeader />
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          <NeonText size="xl" className="mb-8 text-center">Privacy Policy</NeonText>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#00C8FF' }}>Your Data, Your Control</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              At KnowYouRole, we take your privacy seriously. We believe your personality data is deeply personal and should remain yours. We never sell, rent, or share your personal information with third parties without your explicit consent.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#7800FF' }}>What We Collect</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              We collect the information you provide when taking our personality quiz - that's it. This includes your quiz responses and any profile information you choose to add. We do not collect any data from your device, location, or browsing activity.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#39FF14' }}>How We Use Your Data</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Your data is used solely to provide you with your personality insights and results. We use it to generate your personality profile, recommend careers that match your traits, and improve our quiz experience.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#FF00E5' }}>Your Rights</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time. Contact us at hello@knowyourole.com and we'll help you with any requests.
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