import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassTabs } from '@/components/glass/GlassTabs';
import { NeonButton } from '@/components/glass/NeonButton';
import { NeonText } from '@/components/glass/NeonText';
import { ProgressBar } from '@/components/glass/ProgressBar';

const TRAITS = [
  { label: 'Openness', value: 92, color: '#A78BFA' },
  { label: 'Conscientiousness', value: 74, color: '#60A5FA' },
  { label: 'Extraversion', value: 61, color: '#34D399' },
  { label: 'Agreeableness', value: 55, color: '#34D399' },
  { label: 'Neuroticism', value: 68, color: '#F87171' },
];

const CAREERS = [
  { title: 'Software Architect', match: 94, salary: '$120K – $180K', trend: '↑ 18% growth', desc: 'Design systems that scale. Lead technical direction.' },
  { title: 'Data Scientist', match: 91, salary: '$100K – $160K', trend: '↑ 22% growth', desc: 'Find patterns in chaos. Turn data into decisions.' },
  { title: 'Strategy Consultant', match: 88, salary: '$90K – $150K', trend: '↑ 12% growth', desc: 'Shape decisions at the highest levels.' },
  { title: 'Product Manager', match: 85, salary: '$110K – $170K', trend: '↑ 15% growth', desc: 'Bridge technical and human. Ship things that matter.' },
];

const GROWTH = [
  { label: 'Age 16', text: 'Openness scored 78% — already showing strong curiosity and creative thinking.' },
  { label: 'Age 22', text: 'Conscientiousness at 85% — career focus sharpened your discipline.' },
  { label: 'Age 28', text: 'Emotional Stability at 68% — life experience built real resilience.' },
  { label: 'Today', text: 'Pattern shows continued growth in strategic thinking and leadership.' },
];

export default function ResultsPage() {
  const [tab, setTab] = useState('Personality');
  const tabs = ['Personality', 'Careers', 'Growth'];

  return (
    <PageContainer>
      <AppHeader />
      <div className="container mx-auto max-w-2xl px-4 pt-28 pb-20">

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-5">
            Your Results
          </h1>
          <div
            className="inline-block text-3xl md:text-4xl font-black px-6 py-2 rounded-2xl text-white"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
              boxShadow: '0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(123,47,255,0.2)',
            }}
          >
            INTJ-A
          </div>
          <p className="text-base text-white/50 mt-4">The Architect — Strategic, independent, and determined</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <GlassTabs tabs={tabs} activeTab={tab} onChange={setTab} />
        </div>

        {/* Personality Tab */}
        {tab === 'Personality' && (
          <div className="space-y-5">
            <GlassCard className="p-6">
              <h2 className="text-base font-display font-bold text-white/40 uppercase tracking-wider mb-5">
                Big Five Profile
              </h2>
              <div className="space-y-5">
                {TRAITS.map((t) => (
                  <div key={t.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-white">{t.label}</span>
                      <span className="font-bold" style={{ color: t.color }}>{t.value}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${t.value}%`, background: t.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-display font-bold text-white mb-3">
                Your Personality Type
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                As an INTJ-A, you're a strategic visionary with a rare combination of
                analytical brilliance and quiet confidence. You see patterns others miss,
                question assumptions that others take for granted, and quietly build systems
                and visions that reshape the world around you.
              </p>
            </GlassCard>
          </div>
        )}

        {/* Careers Tab */}
        {tab === 'Careers' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white mb-2">Dream Roles</h2>
            {CAREERS.map((c) => (
              <GlassCard key={c.title} variant="interactive" className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white">{c.title}</h3>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: c.match >= 90 ? 'linear-gradient(135deg, #00D4FF, #7B2FFF)' : 'rgba(0,212,255,0.15)',
                      color: c.match >= 90 ? '#fff' : '#00D4FF',
                    }}
                  >
                    {c.match}%
                  </span>
                </div>
                <p className="text-xs text-white/40 mb-2">{c.salary}</p>
                <p className="text-sm text-white/60 mb-2">{c.desc}</p>
                <p className="text-xs font-semibold" style={{ color: '#39FF14' }}>{c.trend}</p>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Growth Tab */}
        {tab === 'Growth' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white mb-2">Your Growth Journey</h2>
            {GROWTH.map((g, i) => (
              <GlassCard key={i} className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ background: '#00D4FF', boxShadow: '0 0 8px #00D4FF' }}
                  />
                  <div>
                    <p className="text-xs font-bold text-glow-blue mb-1">{g.label}</p>
                    <p className="text-sm text-white/60">{g.text}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Premium Unlock */}
        <div
          className="mt-10 rounded-2xl p-6 text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg, #00D4FF, #7B2FFF) 1',
          }}
        >
          <h3 className="text-xl font-display font-black mb-2 text-gradient">Unlock Your Full Report</h3>
          <p className="text-sm text-white/50 mb-6">Deep dive into your personality with premium insights</p>
          <ul className="text-left text-sm space-y-2 mb-6 max-w-xs mx-auto">
            {['50-page personality report', 'Relationship compatibility analysis', 'Career path deep dive', 'Personal growth action plan', 'Shareable PDF report'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-white/70">
                <span style={{ color: '#39FF14' }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <div className="mb-4">
            <span className="text-3xl font-black text-white">$9.99</span>
            <span className="text-white/40 text-sm ml-1">/month</span>
          </div>
          <NeonButton variant="success" size="lg">
            Start Free Trial →
          </NeonButton>
        </div>

      </div>
    </PageContainer>
  );
}
