import { useState } from 'react';
import { Link } from 'wouter';
import { PageContainer } from '@/components/layout/PageContainer';
import { CompactHeader } from '@/components/layout/CompactHeader';
import { GlassCard } from '@/components/glass/GlassCard';
import { NeonButton } from '@/components/glass/NeonButton';

const tiers = [
  { id: '13-15', emoji: '🎉', title: 'Young Teens (13-15)', subtitle: 'Quick, fun quiz made just for you' },
  { id: '16-17', emoji: '👦', title: 'Teens (16-17)', subtitle: 'Full quiz with career insights' },
  { id: '18-24', emoji: '🧑', title: 'Young Adults (18-24)', subtitle: 'Complete personality + career matching' },
  { id: '25+', emoji: '👴', title: 'Adults (25+)', subtitle: 'Full experience with premium features' },
];

export default function QuizGatewayPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  return (
    <PageContainer padded={false} className="font-outfit">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        
        .font-outfit * {
          font-family: 'Outfit', sans-serif;
        }
        
        .tier-card {
          transition: all 0.25s ease;
        }
        
        .tier-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(0, 200, 255, 0.25);
          transform: translateY(-2px);
        }
        
        .tier-card.selected {
          background: rgba(0, 200, 255, 0.08);
          border-color: rgba(0, 200, 255, 0.7);
          box-shadow: 0 0 28px rgba(0, 200, 255, 0.35), 0 0 60px rgba(0, 200, 255, 0.15), inset 0 0 20px rgba(0, 200, 255, 0.05);
          transform: translateY(-2px);
        }
        
        .tier-card .arrow {
          transition: all 0.25s ease;
          opacity: 0.4;
        }
        
        .tier-card:hover .arrow,
        .tier-card.selected .arrow {
          opacity: 1;
          transform: translateX(4px);
        }
      `}</style>

      <CompactHeader onBack={() => history.back()} onMenu={() => {}} />

      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-12"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(120,0,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(0,200,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(255,0,229,0.05) 0%, transparent 50%)',
        }}
      >
        {/* Section label */}
        <p
          className="text-xs font-bold tracking-[0.25em] uppercase text-white/40 mb-5"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Before We Start
        </p>

        {/* Main heading */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.95] text-white text-center mb-4"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Who are you?
        </h1>

        {/* Subtitle */}
        <p
          className="text-base text-white/50 text-center mb-12 max-w-sm"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Choose the option that fits you best.
        </p>

        {/* 2x2 grid of tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px] mb-12">
          {tiers.map((tier) => (
            <GlassCard
              key={tier.id}
              variant="interactive"
              className={`tier-card cursor-pointer border border-white/10 relative ${
                selectedTier === tier.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedTier(tier.id)}
              style={{
                padding: '20px 20px 20px 20px',
                borderRadius: '20px',
                border: selectedTier === tier.id
                  ? '1px solid rgba(0, 200, 255, 0.7)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-start gap-4">
                {/* Emoji */}
                <div
                  className="text-3xl flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {tier.emoji}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-bold text-white leading-tight mb-1"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {tier.title}
                  </p>
                  <p
                    className="text-xs text-white/45 leading-relaxed"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {tier.subtitle}
                  </p>
                </div>

                {/* Arrow */}
                <div
                  className="arrow text-lg text-[#00C8FF] flex-shrink-0 flex items-center"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  →
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Continue button */}
        <NeonButton
          variant="primary"
          size="lg"
          disabled={!selectedTier}
          onClick={() => {
            if (selectedTier) {
              window.location.href = `/quiz?tier=${selectedTier}`;
            }
          }}
          style={{
            background: selectedTier
              ? 'linear-gradient(90deg, #00C8FF, #7800FF)'
              : 'rgba(255,255,255,0.08)',
            boxShadow: selectedTier
              ? '0 0 30px rgba(0,200,255,0.4)'
              : 'none',
            padding: '16px 48px',
            fontSize: '1rem',
            borderRadius: '16px',
            fontFamily: "'Outfit', sans-serif",
            cursor: selectedTier ? 'pointer' : 'not-allowed',
            opacity: selectedTier ? 1 : 0.5,
            border: 'none',
            color: selectedTier ? 'white' : 'rgba(255,255,255,0.3)',
          }}
        >
          Continue →
        </NeonButton>
      </div>
    </PageContainer>
  );
}
