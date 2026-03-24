import { Link } from 'wouter';
import { PageContainer } from '@/components/layout/PageContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { GlassCard } from '@/components/glass/GlassCard';
import { NeonButton } from '@/components/glass/NeonButton';
import { NeonText } from '@/components/glass/NeonText';
import { GlassBadge } from '@/components/glass/GlassBadge';

export default function AboutPage() {
  const steps = [
    {
      num: '01',
      title: 'Take the Quiz',
      desc: 'Answer simple questions about how you think, feel, and act. Takes just 3-5 minutes.',
    },
    {
      num: '02',
      title: 'Get Your Profile',
      desc: 'Receive your detailed personality breakdown based on the Big Five model.',
    },
    {
      num: '03',
      title: 'Explore Your Path',
      desc: 'Discover career matches, growth insights, and personalized recommendations.',
    },
  ];

  return (
    <PageContainer>
      <AppHeader />
      
      {/* Hero */}
      <div className="container mx-auto px-4 pt-28 pb-12 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          About <span className="text-gradient">KnowYouRole</span>
        </h1>
        <p className="text-lg text-white/60">
          Personality science made fun, fast, and genuinely useful.
        </p>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-display font-bold text-white text-center mb-10">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <GlassCard key={i} variant="default" className="p-6 text-center">
              <div className="text-4xl font-display font-bold text-glow-blue mb-4">
                {step.num}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/60">{step.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* The Science */}
      <div className="container mx-auto px-4 pb-16">
        <GlassCard variant="default" className="p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-white mb-4 text-center">
            The Science Behind It
          </h2>
          <p className="text-white/70 text-center mb-8 leading-relaxed">
            Based on the Big Five personality model — the most validated psychological framework 
            for understanding human personality. Used by researchers, therapists, and Fortune 500 
            companies alike.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <NeonText color="blue" size="xl">50+</NeonText>
              <p className="text-xs text-white/40 mt-1">years of research</p>
            </div>
            <div className="text-center p-4">
              <NeonText color="purple" size="xl">500K+</NeonText>
              <p className="text-xs text-white/40 mt-1">peer-reviewed studies</p>
            </div>
            <div className="text-center p-4">
              <NeonText color="green" size="xl">100+</NeonText>
              <p className="text-xs text-white/40 mt-1">cultures validated</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 pb-20 text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-4">
          Ready to discover yourself?
        </h2>
        <p className="text-white/60 mb-8">
          Join millions who have unlocked their potential.
        </p>
        <Link href="/quiz">
          <NeonButton size="lg">Start Your Journey →</NeonButton>
        </Link>
      </div>

      <AppFooter />
    </PageContainer>
  );
}
