'use client';

import { useEffect } from 'react';
import { useDevStore } from '@/stores/devStore';
import { getFakeScores } from '@/utils/devTest';

// ── Control primitives ───────────────────────────────────────────────────────

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '2px 0' }}>
      <span style={{ color: '#94a3b8', fontSize: 11, flex: 1 }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 32, height: 18, borderRadius: 9,
          background: value ? '#00c8ff' : '#334155',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 14, height: 14, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: value ? 14 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
    </label>
  );
}

function Select({ label, value, options, onChange }: {
  label: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: '#0d0d1a', border: '1px solid #1e293b',
          borderRadius: 5, color: '#e2e8f0', padding: '4px 6px',
          fontSize: 11, cursor: 'pointer', outline: 'none', width: '100%',
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: '#0d0d1a', border: '1px solid #1e293b', borderRadius: 5,
          color: '#e2e8f0', padding: '4px 6px', fontSize: 11, outline: 'none',
          width: '100%', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        color: '#00c8ff', fontSize: 9, textTransform: 'uppercase',
        letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8,
        paddingBottom: 4, borderBottom: '1px solid #1e293b',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

// ── Write fake data to sessionStorage ─────────────────────────────────────────

function writeFakeDataToSession(tier: string, mbti: string, mood: string, forcePremium: boolean) {
  const fakeScores = getFakeScores(tier, mbti || null);
  const tierKey = tier === '25plus' ? '25+' : tier;

  sessionStorage.setItem('kyr_tier', tierKey);
  sessionStorage.setItem('kyr_fake_scores', JSON.stringify(fakeScores));
  sessionStorage.setItem('kyr_fake_mbti', mbti || 'INTJ');
  sessionStorage.setItem('kyr_fake_type', (mbti || 'INTJ') + '-A');
  sessionStorage.setItem('knowrole-tier', tierKey);
  sessionStorage.setItem('knowrole-mood', mood);

  if (forcePremium) {
    sessionStorage.setItem('kyr_premium_unlocked', 'true');
  }

  return fakeScores;
}

// ── Main DevToolPanel ────────────────────────────────────────────────────────

export default function DevToolPanel() {
  const store = useDevStore();

  // Always visible on localhost — check hostname
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.startsWith('192.168.'));

  if (!isLocalhost) return null;

  // Sync fake data to sessionStorage whenever dev store changes
  useEffect(() => {
    if (store.devMode && store.fakeDataEnabled) {
      writeFakeDataToSession(store.tier, store.mbtiOverride, store.mood, store.forcePremium);
    }
  }, [store.devMode, store.fakeDataEnabled, store.tier, store.mbtiOverride, store.mood, store.forcePremium]);

  const NAV_PATHS = [
    { path: '/', label: 'Landing' },
    { path: '/crossroads', label: 'Crossroads' },
    { path: '/mood', label: 'Mood Selector' },
    { path: '/quiz', label: 'Quiz' },
    { path: '/results', label: 'Results' },
    { path: '/checkout-success', label: 'Checkout ✓' },
    { path: '/auth', label: 'Auth' },
    { path: '/profile', label: 'Profile' },
    { path: '/about', label: 'About' },
    { path: '/faq', label: 'FAQ' },
  ];

  const handleNavigate = (path: string) => {
    if (store.devMode && store.fakeDataEnabled) {
      writeFakeDataToSession(store.tier, store.mbtiOverride, store.mood, store.forcePremium);
    }
    const params = new URLSearchParams();
    params.set('test', 'true');
    if (store.tier) {
      const tierMap: Record<string, string> = { '25plus': '25+', '19-25': '19-25', '13-18': '13-18' };
      params.set('tier', tierMap[store.tier] || store.tier);
    }
    window.location.href = `${path}?${params.toString()}`;
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const TIER_OPTIONS = [
    { value: '25plus', label: '25+ Adults' },
    { value: '19-25', label: '18-25 Young Adult' },
    { value: '13-18', label: '13-17 Teen' },
  ];

  const MOOD_OPTIONS = [
    { value: 'focused', label: '🎯 Focused' },
    { value: 'chill', label: '😌 Chill' },
    { value: 'adventurous', label: '🚀 Adventurous' },
    { value: 'romantic', label: '💕 Romantic' },
    { value: 'reflective', label: '🤔 Reflective' },
    { value: 'creative', label: '🎨 Creative' },
  ];

  const ARCHETYPE_OPTIONS = [
    { value: 'The Sage', label: 'The Sage' },
    { value: 'The Explorer', label: 'The Explorer' },
    { value: 'The Hero', label: 'The Hero' },
    { value: 'The Rebel', label: 'The Rebel' },
    { value: 'The Lover', label: 'The Lover' },
    { value: 'The Magician', label: 'The Magician' },
  ];

  return (
    <div
      style={{
        position: 'fixed', top: 10, left: 10, zIndex: 99999,
        width: 260, background: 'rgba(10, 10, 25, 0.97)',
        border: '1.5px solid #00c8ff55',
        borderRadius: 10,
        boxShadow: '0 0 30px rgba(0, 200, 255, 0.12), 0 8px 32px rgba(0,0,0,0.6)',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 12, color: '#e2e8f0',
        maxHeight: '94vh', overflowY: 'auto',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        background: 'linear-gradient(90deg, #00c8ff15, #7800ff10)',
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 1,
        borderRadius: '9px 9px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: '#00c8ff',
            boxShadow: '0 0 6px #00c8ff',
          }} />
          <span style={{ color: '#00c8ff', fontWeight: 900, fontSize: 11, letterSpacing: '0.08em' }}>
            DEV PANEL
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={store.reset}
            title="Reset all"
            style={{
              background: 'transparent', border: '1px solid #334155',
              borderRadius: 4, color: '#64748b', fontSize: 9,
              padding: '2px 5px', cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            RESET
          </button>
          <span style={{ color: '#334155', fontSize: 10, alignSelf: 'center' }}>
            Ctrl+Shift+D
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 12 }}>

        {/* Current page indicator */}
        <div style={{
          background: '#0d0d1a', borderRadius: 6, padding: '5px 8px', marginBottom: 12,
          border: '1px solid #1e293b',
        }}>
          <div style={{ color: '#475569', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Current Page
          </div>
          <div style={{ color: '#00c8ff', fontWeight: 700, fontSize: 12 }}>{currentPath}</div>
        </div>

        {/* Global toggles */}
        <Section title="Global">
          <Toggle label="Dev Mode" value={store.devMode} onChange={store.setDevMode} />
          <Toggle label="Inject Fake Data" value={store.fakeDataEnabled} onChange={store.setFakeDataEnabled} />
          <Toggle label="Skip Quiz → Results" value={store.skipToResults} onChange={store.setSkipToResults} />
          <Toggle label="Mock Auth (auto-login)" value={store.mockAuthEnabled} onChange={store.setMockAuthEnabled} />
          <Toggle label="Force Premium (no paywall)" value={store.forcePremium} onChange={store.setForcePremium} />
        </Section>

        {/* Quiz config */}
        <Section title="Quiz Config">
          <Select label="Tier" value={store.tier} options={TIER_OPTIONS} onChange={(v) => store.setTier(v as any)} />
          <Select label="Mood" value={store.mood} options={MOOD_OPTIONS} onChange={(v) => store.setMood(v as any)} />
        </Section>

        {/* Results config */}
        <Section title="Results Config">
          <TextInput
            label="MBTI Override (e.g. ENTJ)"
            value={store.mbtiOverride}
            onChange={store.setMbtiOverride}
            placeholder="Auto"
          />
          <Select
            label="Archetype"
            value={store.archetype}
            options={ARCHETYPE_OPTIONS}
            onChange={(v) => store.setArchetype(v as any)}
          />
        </Section>

        {/* Auth mock */}
        <Section title="Auth Mock">
          <Toggle label="Auto-login Test User" value={store.mockAuthEnabled} onChange={store.setMockAuthEnabled} />
          <TextInput
            label="Mock Email"
            value={store.mockUserEmail}
            onChange={store.setMockUserEmail}
          />
        </Section>

        {/* Navigation */}
        <Section title="Navigate">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {NAV_PATHS.map((np) => (
              <button
                key={np.path}
                onClick={() => handleNavigate(np.path)}
                style={{
                  background: currentPath === np.path ? 'rgba(0,200,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${currentPath === np.path ? '#00c8ff66' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 5, padding: '4px 7px',
                  color: currentPath === np.path ? '#00c8ff' : '#94a3b8',
                  cursor: 'pointer', textAlign: 'left', fontSize: 10,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#00c8ff66';
                  (e.currentTarget as HTMLElement).style.color = '#00c8ff';
                }}
                onMouseLeave={(e) => {
                  if (currentPath !== np.path) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                  }
                }}
              >
                → {np.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Status bar */}
        <div style={{
          padding: '6px 8px', background: '#0d0d1a', borderRadius: 6,
          border: '1px solid #1e293b', fontSize: 10, color: '#475569',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px',
        }}>
          <div><span style={{ color: '#00c8ff' }}>Tier</span> {store.tier === '25plus' ? '25+' : store.tier}</div>
          <div><span style={{ color: '#00c8ff' }}>Mood</span> {store.mood}</div>
          <div><span style={{ color: '#00c8ff' }}>MBTI</span> {store.mbtiOverride || 'auto'}</div>
          <div><span style={{ color: '#00c8ff' }}>Prem</span> {store.forcePremium ? '✓' : '✗'}</div>
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { width: 3px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        select option { background: #0d0d1a; color: #e2e8f0; }
      `}</style>
    </div>
  );
}
