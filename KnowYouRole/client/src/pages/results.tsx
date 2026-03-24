import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassTabs } from '@/components/glass/GlassTabs';
import { NeonButton } from '@/components/glass/NeonButton';
import { NeonText } from '@/components/glass/NeonText';

const traits = [
  { label: 'Openness', value: 92, color: 'purple' },
  { label: 'Conscientiousness', value: 74, color: 'blue' },
  { label: 'Extraversion', value: 61, color: 'green' },
  { label: 'Agreeableness', value: 55, color: 'green' },
  { label: 'Neuroticism', value: 68, color: 'red' },
];

const careers = [
  {
    title: 'Software Architect',
    match: 94,
    salary: '$120K – $180K',
    trend: '↑ 18% growth',
    desc: 'Design systems that scale. Lead technical direction.',
  },
  {
    title: 'Data Scientist',
    match: 91,
    salary: '$100K – $160K',
    trend: '↑ 22% growth',
    desc: 'Find patterns in chaos. Turn data into decisions.',
  },
  {
    title: 'Strategy Consultant',
    match: 88,
    salary: '$90K – $150K',
    trend: '↑ 12% growth',
    desc: 'Shape decisions at the highest levels.',
  },
  {
    title: 'Product Manager',
    match: 85,
    salary: '$110K – $170K',
    trend: '↑ 15% growth',
    desc: 'Bridge technical and human. Ship things that matter.',
  },
  {
    title: 'Research Analyst',
    match: 82,
    salary: '$75K – $120K',
    trend: '↑ 8% growth',
    desc: 'Uncover insights that drive smarter decisions.',
  },
  {
    title: 'UX Researcher',
    match: 79,
    salary: '$85K – $130K',
    trend: '↑ 10% growth',
    desc: 'Understand people deeply. Make products better.',
  },
];

const growthItems = [
  {
    date: 'Openness — Age 16',
    text: 'You scored 78% — Already showing strong curiosity and creative thinking',
  },
  {
    date: 'Conscientiousness — Age 22',
    text: 'You scored 85% — Career focus sharpened your discipline significantly',
  },
  {
    date: 'Emotional Stability — Age 28',
    text: 'You scored 68% — Life experience has helped build resilience',
  },
  {
    date: 'Current',
    text: 'Your pattern suggests continued growth in strategic thinking and leadership',
  },
];

const tabs = ['Personality', 'Careers', 'Growth'];

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState('Personality');

  const traitColorClass: Record<string, string> = {
    purple: 'bg-gradient-to-r from-purple-500 to-violet-400',
    blue: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    green: 'bg-gradient-to-r from-green-400 to-emerald-500',
    red: 'bg-gradient-to-r from-red-400 to-orange-500',
  };

  return (
    <PageContainer>
      <AppHeader />
      <div className="container-sm mx-auto px-4 pt-28 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl md:text-5xl font-black font-display tracking-tight mb-3"
            style={{ letterSpacing: '-0.03em' }}
          >
            Your Results
          </h1>
          {/* Personality Badge */}
          <div
            className="inline-block px-8 py-3 rounded-full text-2xl md:text-3xl font-black mb-4"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
              boxShadow: '0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(123,47,255,0.2)',
            }}
          >
            INTJ-A
          </div>
          <p className="text-lg text-[var(--text-secondary)]">
            The Architect — Strategic, independent, and determined
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <GlassTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'Personality' && (
          <div>
            <GlassCard className="mb-6">
              <h2 className="text-xl font-bold mb-1">Big Five Profile</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Your personality across the five major dimensions
              </p>

              <div className="flex flex-col gap-5">
                {traits.map((trait) => (
                  <div key={trait.label} className="trait-meter">
                    <div className="trait-meter-label">
                      <span className="font-medium">{trait.label}</span>
                      <span className="font-bold">{trait.value}%</span>
                    </div>
                    <div className="trait-meter-bar">
                      <div
                        className={`trait-meter-fill ${traitColorClass[trait.color]}`}
                        style={{ width: `${trait.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard variant="selected">
              <h3 className="text-lg font-bold mb-2">Your Personality Type</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                As an INTJ-A, you&rsquo;re a strategic visionary with a rare combination
                of analytical brilliance and quiet confidence. You see patterns others
                miss, question assumptions that others take for granted, and quietly
                build systems and visions that reshape the world around you.
              </p>
            </GlassCard>
          </div>
        )}

        {activeTab === 'Careers' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Your Career Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careers.map((career) => (
                <GlassCard key={career.title} variant="interactive" className="relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold">{career.title}</h3>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: career.match >= 90
                          ? 'linear-gradient(135deg, #00D4FF, #7B2FFF)'
                          : career.match >= 80
                          ? 'rgba(0,212,255,0.15)'
                          : 'rgba(255,255,255,0.08)',
                        color: career.match >= 90 ? '#fff' : career.match >= 80 ? '#00D4FF' : 'rgba(255,255,255,0.6)',
                        border: career.match < 90 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                      }}
                    >
                      {career.match}%
                    </span>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs mb-2">{career.salary}</p>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
                    {career.desc}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: '#39FF14' }}>
                    {career.trend}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Growth' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Your Growth Journey</h2>
            <GlassCard>
              <div
                className="relative pl-6"
                style={{
                  borderLeft: '2px solid transparent',
                  borderImage: 'linear-gradient(180deg, #00D4FF, #7B2FFF) 1',
                }}
              >
                {growthItems.map((item, i) => (
                  <div
                    key={i}
                    className="relative mb-8 last:mb-0"
                    style={{ paddingLeft: '4px' }}
                  >
                    {/* Dot */}
                    <div
                      className="absolute w-3 h-3 rounded-full -left-[21px] top-1"
                      style={{
                        background: '#00D4FF',
                        boxShadow: '0 0 10px #00D4FF',
                      }}
                    />
                    <p className="text-xs font-bold mb-1" style={{ color: '#00D4FF' }}>
                      {item.date}
                    </p>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Premium Unlock */}
        <div
          className="mt-12 rounded-2xl p-6 md:p-8 text-center"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg, #00D4FF, #7B2FFF) 1',
          }}
        >
          <h3
            className="text-2xl font-black mb-3"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Unlock Your Full Report
          </h3>
          <p className="text-[var(--text-secondary)] mb-6 text-sm">
            Deep dive into your personality with premium insights
          </p>
          <ul className="text-left max-w-sm mx-auto mb-6 space-y-3">
            {[
              'Complete 50-page personality report',
              'Relationship compatibility analysis',
              'Career path deep dive with salary data',
              'Personal growth action plan',
              'Shareable PDF report',
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm font-medium"
              >
                <span style={{ color: '#39FF14', fontWeight: 900 }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mb-4">
            <span className="text-3xl font-black">$9.99</span>
            <span className="text-[var(--text-muted)] text-sm ml-1">/month</span>
          </div>
          <NeonButton
            variant="success"
            size="lg"
            onClick={() => alert('Premium signup — connect your backend!')}
          >
            Start Free Trial
          </NeonButton>
        </div>
      </div>
    </PageContainer>
  );
}
