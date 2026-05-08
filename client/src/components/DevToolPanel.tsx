'use client';

import { useEffect, useState } from 'react';
import { useDevStore, type DevMood, type DevTier } from '@/stores/devStore';
import { getFakeDiscStyle, getFakeMBTIType, getFakeScores } from '@/utils/devTest';

const MBTI_OPTIONS = [
  'Auto',
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const;

const TIER_OPTIONS: { value: DevTier; label: string }[] = [
  { value: '25plus', label: '25+ Adults' },
  { value: '19-25', label: '18-25 Young Adult' },
  { value: '13-18', label: '13-17 Teen' },
];

const MOOD_OPTIONS: { value: DevMood; label: string }[] = [
  { value: 'focused', label: '🎯 Focused' },
  { value: 'chill', label: '😌 Chill' },
  { value: 'adventurous', label: '🚀 Adventurous' },
  { value: 'romantic', label: '💕 Romantic' },
  { value: 'reflective', label: '🤔 Reflective' },
  { value: 'creative', label: '🎨 Creative' },
];

const RANDOM_TIERS: DevTier[] = ['13-18', '19-25', '25plus'];
const RANDOM_MOODS: DevMood[] = ['focused', 'chill', 'adventurous', 'romantic', 'reflective', 'creative'];
const RANDOM_MBTI = MBTI_OPTIONS.filter((type) => type !== 'Auto');

const PREVIEW_STORAGE_KEYS = [
  'kyr_tier',
  'kyr_quiz_tier',
  'kyr_fake_scores',
  'kyr_real_scores',
  'kyr_fake_mbti',
  'kyr_fake_type',
  'kyr_result_dto',
  'kyr_premium_unlocked',
  'knowrole-tier',
  'knowrole-mood',
];

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tierToParam(tier: string) {
  return tier === '25plus' ? '25+' : tier;
}

function buildRandomizedScores(tier: DevTier, mbti: string) {
  const scores = getFakeScores(tier, mbti);
  const primaryDisc = pickRandom(['D', 'I', 'S', 'C'] as const);

  scores.disc = {
    D: primaryDisc === 'D' ? 4 : randomInt(1, 3),
    I: primaryDisc === 'I' ? 4 : randomInt(1, 3),
    S: primaryDisc === 'S' ? 4 : randomInt(1, 3),
    C: primaryDisc === 'C' ? 4 : randomInt(1, 3),
  };

  scores.bigFive = {
    O: randomInt(35, 95),
    C: randomInt(35, 95),
    E: randomInt(35, 95),
    A: randomInt(35, 95),
    N: randomInt(20, 80),
  };

  scores.responses = Array.from({ length: randomInt(24, 32) }, (_, i) => ({
    questionId: i + 1,
    response: randomInt(0, 1),
    time: randomInt(1800, 7600),
  }));
  scores.averageSwipeTime = Math.round((randomInt(22, 68) / 10) * 10) / 10;
  scores.engagement = randomInt(62, 98);
  scores.criticalWildcard = randomInt(0, 4);
  scores.firstPrinciplesWildcard = randomInt(0, 4);

  return scores;
}

function writeFakeDataToSession(
  tier: DevTier,
  mbtiOverride: string,
  mood: DevMood,
  forcePremium: boolean,
  injectedScores?: ReturnType<typeof getFakeScores>,
) {
  const fakeScores = injectedScores ?? getFakeScores(tier, mbtiOverride || null);
  const resolvedMBTI = mbtiOverride || getFakeMBTIType(fakeScores);
  const resolvedDisc = getFakeDiscStyle(fakeScores);
  const tierParam = tierToParam(tier);

  sessionStorage.setItem('kyr_tier', tierParam);
  sessionStorage.setItem('kyr_quiz_tier', tierParam);
  sessionStorage.setItem('kyr_fake_scores', JSON.stringify(fakeScores));
  sessionStorage.setItem('kyr_real_scores', JSON.stringify(fakeScores));
  sessionStorage.setItem('kyr_fake_mbti', resolvedMBTI);
  sessionStorage.setItem('kyr_fake_type', `${resolvedMBTI}-${resolvedDisc}`);
  sessionStorage.setItem('knowrole-tier', tierParam);
  sessionStorage.setItem('knowrole-mood', mood);

  if (forcePremium) {
    sessionStorage.setItem('kyr_premium_unlocked', 'true');
  } else {
    sessionStorage.removeItem('kyr_premium_unlocked');
  }

  return { scores: fakeScores, mbtiType: resolvedMBTI, discStyle: resolvedDisc, tierParam };
}

function clearPreviewStorage() {
  PREVIEW_STORAGE_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        width: '100%', background: 'rgba(255,255,255,0.035)', border: '1px solid #1e293b',
        borderRadius: 8, color: '#cbd5e1', padding: '7px 8px', cursor: 'pointer',
        fontFamily: "'Outfit', sans-serif", fontSize: 11,
      }}
    >
      <span>{label}</span>
      <span style={{
        width: 34, height: 18, borderRadius: 999, background: value ? '#00c8ff' : '#334155',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute',
          top: 2, left: value ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.45)',
        }} />
      </span>
    </button>
  );
}

function Select<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          background: '#0d0d1a', border: '1px solid #1e293b', borderRadius: 7,
          color: '#e2e8f0', padding: '7px 8px', fontSize: 11, cursor: 'pointer', outline: 'none', width: '100%',
        }}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Button({ children, onClick, variant = 'secondary', disabled = false }: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const bg = variant === 'primary'
    ? 'linear-gradient(135deg, #00c8ff, #7800ff)'
    : variant === 'danger'
      ? 'rgba(248,113,113,0.12)'
      : 'rgba(255,255,255,0.045)';
  const border = variant === 'primary'
    ? '1px solid rgba(255,255,255,0.18)'
    : variant === 'danger'
      ? '1px solid rgba(248,113,113,0.35)'
      : '1px solid rgba(255,255,255,0.08)';
  const color = variant === 'danger' ? '#fca5a5' : '#e2e8f0';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg, border, borderRadius: 8, color, cursor: disabled ? 'wait' : 'pointer',
        fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 800, padding: '8px 9px',
        width: '100%', opacity: disabled ? 0.65 : 1, textAlign: 'center',
      }}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 13 }}>
      <div style={{
        color: '#00c8ff', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em',
        fontWeight: 900, paddingBottom: 4, borderBottom: '1px solid #1e293b',
      }}>
        {title}
      </div>
      {children}
    </section>
  );
}

export default function DevToolPanel() {
  const store = useDevStore();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState('Ready');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLocalhost = mounted && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.')
  );

  useEffect(() => {
    if (!mounted || !isLocalhost) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        store.toggleOpen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mounted, isLocalhost, store]);

  useEffect(() => {
    if (!mounted || !isLocalhost) return;
    if (store.devMode && store.fakeDataEnabled) {
      writeFakeDataToSession(store.tier, store.mbtiOverride, store.mood, store.forcePremium);
      setStatus(`Preview active · ${store.mbtiOverride || 'Auto'} · ${store.forcePremium ? 'Premium' : 'Free'}`);
    }
  }, [mounted, isLocalhost, store.devMode, store.fakeDataEnabled, store.tier, store.mbtiOverride, store.mood, store.forcePremium]);

  if (!mounted || !isLocalhost) return null;

  const currentPath = window.location.pathname;
  const busy = status === 'Saving random result…';

  const openPath = (path: string, extraParams?: Record<string, string>) => {
    if (store.devMode && store.fakeDataEnabled) {
      writeFakeDataToSession(store.tier, store.mbtiOverride, store.mood, store.forcePremium);
    }
    const params = new URLSearchParams({ test: 'true', tier: tierToParam(store.tier), ...extraParams });
    window.location.href = `${path}?${params.toString()}`;
  };

  const openResultsPage = (page: '1' | '3') => {
    const preview = writeFakeDataToSession(store.tier, store.mbtiOverride, store.mood, page === '3' || store.forcePremium);
    const params = new URLSearchParams({
      test: 'true',
      force: 'true',
      page,
      tier: preview.tierParam,
      mbtiType: preview.mbtiType,
      discStyle: preview.discStyle,
      scores: btoa(JSON.stringify(preview.scores)),
    });
    window.location.href = `/results?${params.toString()}`;
  };

  const handleRandomizeResults = async () => {
    const tier = pickRandom(RANDOM_TIERS);
    const mood = pickRandom(RANDOM_MOODS);
    const mbti = pickRandom(RANDOM_MBTI);
    const scores = buildRandomizedScores(tier, mbti);
    const discStyle = getFakeDiscStyle(scores);
    const sessionId = `dev-random-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tierParam = tierToParam(tier);

    setStatus('Saving random result…');
    store.setDevMode(true);
    store.setFakeDataEnabled(true);
    store.setForcePremium(true);
    store.setTier(tier);
    store.setMood(mood);
    store.setMbtiOverride(mbti);
    writeFakeDataToSession(tier, mbti, mood, true, scores);

    try {
      const response = await fetch('/api/results/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierParam,
          mood,
          sessionId,
          source: 'randomized_preview',
          visibility: 'anonymous',
          scores,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data?.success || !data?.result) {
        throw new Error(data?.error || data?.validation?.errors?.join(', ') || 'Result persistence failed');
      }

      sessionStorage.setItem('kyr_result_dto', JSON.stringify(data.result));
      setStatus(`Saved ${mbti}-${discStyle}; opening Full Portrait…`);
      const params = new URLSearchParams({
        test: 'true',
        random: 'true',
        tier: tierParam,
        page: '1',
        force: 'true',
        sessionId: data.result?.meta?.sessionId || sessionId,
        mbtiType: mbti,
        discStyle,
        scores: btoa(JSON.stringify(scores)),
      });
      window.location.href = `/results?${params.toString()}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DevPanel] Randomize results failed', error);
      setStatus(`Randomize failed: ${message}`);
      window.alert(`Randomize Results Pages Data failed.\n\n${message}`);
    }
  };

  const handleClearPreview = () => {
    clearPreviewStorage();
    setStatus('Preview storage cleared');
  };

  const handleReset = () => {
    store.reset();
    clearPreviewStorage();
    setStatus('Panel reset + preview storage cleared');
  };

  if (!store.isOpen) {
    return (
      <button
        type="button"
        onClick={store.toggleOpen}
        title="Show Dev Panel (Ctrl+Shift+D)"
        style={{
          position: 'fixed', top: 10, left: 10, zIndex: 99999,
          background: 'linear-gradient(135deg, #00c8ff, #7800ff)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999, padding: '8px 11px',
          fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 900, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45), 0 0 20px rgba(0,200,255,0.22)',
        }}
      >
        DEV
      </button>
    );
  }

  return (
    <aside
      aria-label="Local development panel"
      style={{
        position: 'fixed', top: 10, left: 10, zIndex: 99999,
        width: 260, background: 'rgba(10, 10, 25, 0.97)', border: '1.5px solid #00c8ff55',
        borderRadius: 12, boxShadow: '0 0 30px rgba(0, 200, 255, 0.12), 0 8px 32px rgba(0,0,0,0.6)',
        fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#e2e8f0', maxHeight: '94vh',
        overflowY: 'auto', backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{
        padding: '9px 11px', background: 'linear-gradient(90deg, #00c8ff15, #7800ff10)',
        borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 1, borderRadius: '11px 11px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00c8ff', boxShadow: '0 0 6px #00c8ff' }} />
          <span style={{ color: '#00c8ff', fontWeight: 900, fontSize: 11, letterSpacing: '0.08em' }}>DEV PANEL</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button type="button" onClick={handleReset} title="Reset panel and clear preview data" style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 5, color: '#64748b', fontSize: 9, padding: '3px 5px', cursor: 'pointer' }}>RESET</button>
          <button type="button" onClick={store.toggleOpen} title="Hide Dev Panel" style={{ background: 'rgba(0,200,255,0.12)', border: '1px solid #00c8ff55', borderRadius: 5, color: '#00c8ff', fontSize: 9, padding: '3px 6px', cursor: 'pointer', fontWeight: 900 }}>HIDE</button>
        </div>
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ background: '#0d0d1a', borderRadius: 8, padding: '7px 8px', marginBottom: 12, border: '1px solid #1e293b' }}>
          <div style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Page</div>
          <div style={{ color: '#00c8ff', fontWeight: 800, fontSize: 12 }}>{currentPath}</div>
          <div style={{ color: status.startsWith('Randomize failed') ? '#fca5a5' : '#94a3b8', fontSize: 10, marginTop: 4 }}>{status}</div>
        </div>

        <Section title="Results Preview">
          <Button variant="primary" onClick={handleRandomizeResults} disabled={busy}>🎲 Randomize Results Pages Data</Button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Button onClick={() => openResultsPage('1')}>Full Portrait</Button>
            <Button onClick={() => openResultsPage('3')}>Premium Nexus</Button>
          </div>
          <Toggle label="Premium Preview" value={store.forcePremium} onChange={store.setForcePremium} />
          <Toggle label="Inject Fake Data" value={store.fakeDataEnabled} onChange={store.setFakeDataEnabled} />
        </Section>

        <Section title="Overrides">
          <Select label="Tier" value={store.tier} options={TIER_OPTIONS} onChange={store.setTier} />
          <Select label="Mood" value={store.mood} options={MOOD_OPTIONS} onChange={store.setMood} />
          <Select
            label="MBTI"
            value={(store.mbtiOverride || 'Auto') as (typeof MBTI_OPTIONS)[number]}
            options={MBTI_OPTIONS.map((type) => ({ value: type, label: type }))}
            onChange={(type) => store.setMbtiOverride(type === 'Auto' ? '' : type)}
          />
        </Section>

        <Section title="Real Flow Navigation">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Button onClick={() => openPath('/quiz-gateway')}>Gateway</Button>
            <Button onClick={() => openPath('/mood-mixer')}>Mood Mixer</Button>
            <Button onClick={() => openPath('/quiz')}>Quiz</Button>
            <Button onClick={() => openPath('/checkout-success')}>Checkout ✓</Button>
          </div>
        </Section>

        <Section title="Maintenance">
          <Button onClick={handleClearPreview}>Clear Preview Data</Button>
          <Button variant="danger" onClick={handleReset}>Reset Panel + Storage</Button>
        </Section>

        <div style={{
          padding: '7px 8px', background: '#0d0d1a', borderRadius: 8, border: '1px solid #1e293b',
          fontSize: 10, color: '#64748b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px',
        }}>
          <div><span style={{ color: '#00c8ff' }}>Tier</span> {tierToParam(store.tier)}</div>
          <div><span style={{ color: '#00c8ff' }}>Mood</span> {store.mood}</div>
          <div><span style={{ color: '#00c8ff' }}>MBTI</span> {store.mbtiOverride || 'Auto'}</div>
          <div><span style={{ color: '#00c8ff' }}>Premium</span> {store.forcePremium ? '✓' : '✗'}</div>
        </div>

        <div style={{ color: '#334155', fontSize: 9, marginTop: 8, textAlign: 'center' }}>Hide/show: button or Ctrl+Shift+D</div>
      </div>

      <style>{`
        aside::-webkit-scrollbar { width: 3px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        select option { background: #0d0d1a; color: #e2e8f0; }
      `}</style>
    </aside>
  );
}
