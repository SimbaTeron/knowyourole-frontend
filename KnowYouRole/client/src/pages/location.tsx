import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/glass/NeonText";
import { NeonButton } from "@/components/glass/NeonButton";

export default function LocationPage() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <AppHeader />
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <NeonText size="xl" className="mb-8 text-center">Get in Touch</NeonText>
          
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#00C8FF' }}>Email</h3>
              <p className="text-white/70 mb-4">
                For general inquiries and support
              </p>
              <a href="mailto:hello@knowyourole.com" className="text-white/90 hover:text-white transition">
                hello@knowyourole.com
              </a>
            </GlassCard>
            
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7800FF' }}>Social</h3>
              <p className="text-white/70 mb-4">
                Follow us for updates and personality insights
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-white/90 hover:text-white transition">Twitter</a>
                <a href="#" className="block text-white/90 hover:text-white transition">Instagram</a>
                <a href="#" className="block text-white/90 hover:text-white transition">LinkedIn</a>
              </div>
            </GlassCard>
          </div>
          
          <GlassCard className="p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#39FF14' }}>Headquarters</h3>
            <p className="text-white/70">
              KnowYouRole<br />
              San Francisco, CA<br />
              United States
            </p>
          </GlassCard>
          
          <div className="text-center mt-8">
            <Link href="/">
              <NeonButton variant="secondary">Back to Home</NeonButton>
            </Link>
          </div>
        </div>
      </PageContainer>
      <AppFooter />
    </div>
  );
}