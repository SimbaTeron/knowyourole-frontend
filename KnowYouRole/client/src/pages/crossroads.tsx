import { Link } from 'wouter';
import { PageContainer } from '@/components/layout/PageContainer';
import { CompactHeader } from '@/components/layout/CompactHeader';
import { GlassCard } from '@/components/glass/GlassCard';
import { NeonButton } from '@/components/glass/NeonButton';
import { NeonText } from '@/components/glass/NeonText';

export default function CrossroadsPage() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin).catch(() => {});
  };

  const options = [
    {
      emoji: '🎯',
      title: 'Discover Careers',
      desc: 'See which roles match your personality type and strengths.',
      href: '/results',
      icon: '→',
    },
    {
      emoji: '😌',
      title: 'Explore Your Moods',
      desc: 'Track how your emotions shape your days and decisions.',
      href: '/mood-mixer',
      icon: '→',
    },
    {
      emoji: '📊',
      title: 'Deep Dive Premium',
      desc: 'Unlock your full personality report with every detail.',
      href: '/results',
      icon: '→',
      premium: true,
    },
  ];

  return (
    <PageContainer padded={false}>
      <CompactHeader title="What's Next?" onBack={() => history.back()} onMenu={() => {}} />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            <span className="text-gradient">Where to?</span>
          </h1>
          <p className="text-white/60">You completed the quiz. Here's where to go next.</p>
        </div>

        <div className="w-full max-w-lg space-y-4">
          {options.map((opt, i) => (
            <Link key={i} href={opt.href} className="block no-underline">
              <GlassCard
                variant="interactive"
                className="p-6 flex items-center gap-4 cursor-pointer"
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{opt.title}</span>
                    {opt.premium && (
                      <span className="badge badge-green text-xs">Premium</span>
                    )}
                  </div>
                  <p className="text-sm text-white/50 mt-1">{opt.desc}</p>
                </div>
                <span className="text-glow-blue text-xl">{opt.icon}</span>
              </GlassCard>
            </Link>
          ))}

          <button
            onClick={handleShare}
            className="w-full mt-2 p-4 text-center text-white/40 hover:text-white/70 transition-colors cursor-pointer bg-transparent border-none text-sm"
          >
            📤 Share your results
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
