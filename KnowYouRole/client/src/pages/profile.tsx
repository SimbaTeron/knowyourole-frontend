import { useState } from 'react';
import { Link } from 'wouter';
import { PageContainer } from '@/components/layout/PageContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { GlassCard } from '@/components/glass/GlassCard';
import { NeonButton } from '@/components/glass/NeonButton';
import { GlassBadge } from '@/components/glass/GlassBadge';

function Toggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
      <span className="text-white/70 text-sm">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`w-11 h-6 rounded-full transition-all ${on ? 'bg-[#00D4FF]' : 'bg-white/20'}`}
        aria-pressed={on}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const isLoggedIn = false; // Replace with: const { user } = useAuth();

  if (!isLoggedIn) {
    return (
      <PageContainer>
        <AppHeader />
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-28">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-display font-bold text-white mb-3">Sign in to view your profile</h1>
          <p className="text-white/50 mb-8">Track your quiz history, moods, and insights.</p>
          <Link href="/auth">
            <NeonButton size="lg">Sign In →</NeonButton>
          </Link>
        </div>
        <AppFooter />
      </PageContainer>
    );
  }

  const stats = [
    { label: 'Quizzes Taken', value: '3', icon: '📝' },
    { label: 'Day Streak', value: '7', icon: '🔥' },
    { label: 'Top Trait', value: 'Openness', icon: '🧠' },
  ];

  const recentResults = [
    { date: 'Mar 20, 2026', type: 'INTJ-A', name: 'The Architect' },
    { date: 'Mar 15, 2026', type: 'ENFP-A', name: 'The Campaigner' },
    { date: 'Mar 10, 2026', type: 'ISTJ-A', name: 'The Logistician' },
  ];

  return (
    <PageContainer>
      <AppHeader />
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        {/* Profile Card */}
        <GlassCard variant="default" className="p-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center text-2xl font-bold text-black">
              AC
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">Alex Chen</h1>
              <p className="text-white/50 text-sm">alex@example.com</p>
              <p className="text-white/30 text-xs mt-1">Member since Jan 2026</p>
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <GlassCard key={i} variant="default" className="p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-display font-bold text-glow-blue">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Recent Results */}
        <div className="mb-8">
          <h2 className="text-lg font-display font-semibold text-white mb-4">Recent Results</h2>
          <div className="space-y-3">
            {recentResults.map((r, i) => (
              <GlassCard key={i} variant="default" className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{r.type}</div>
                  <div className="text-xs text-white/40">{r.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">{r.name}</span>
                  <span className="text-glow-blue">→</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h2 className="text-lg font-display font-semibold text-white mb-4">Settings</h2>
          <GlassCard variant="default" className="p-4">
            <Toggle label="Notifications" />
            <Toggle label="Dark Mode" defaultOn />
            <Toggle label="Data Export" />
          </GlassCard>
        </div>
      </div>
      <AppFooter />
    </PageContainer>
  );
}
