'use client';

import { useDevStore, DevTier, DevMood, DevArchetype } from '@/stores/devStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ── Individual control components ───────────────────────────────────────────

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <span style={{ color: '#94a3b8', fontSize: 12 }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10,
          background: value ? '#00c8ff' : '#334155',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: value ? 18 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 6,
          color: '#e2e8f0', padding: '4px 8px', fontSize: 12, cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 6,
          color: '#e2e8f0', padding: '4px 8px', fontSize: 12, outline: 'none',
        }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderBottom: '1px solid #1e293b', paddingBottom: 12, marginBottom: 12,
    }}>
      <div style={{
        color: '#00c8ff', fontSize: 10, textTransform: 'uppercase',
        letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10,
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function NavButton({ path, label }: { path: string; label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(path)}
      style={{
        background: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
        border: '1px solid #00c8ff33', borderRadius: 6,
        color: '#94c8ff', padding: '5px 10px', fontSize: 11,
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.borderColor = '#00c8ff';
        (e.target as HTMLElement).style.color = '#00c8ff';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.borderColor = '#00c8ff33';
        (e.target as HTMLElement).style.color = '#94c8ff';
      }}
    >
      → {label}
    </button>
  );
}

// ── Main DevPanel ────────────────────────────────────────────────────────────

export function DevPanel() {
  const store = useDevStore();
  const router = useRouter();

  // Keyboard shortcut: Ctrl+Shift+D to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        store.toggleOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Redirect if page override is set
  useEffect(() => {
    if (store.currentPageOverride) {
      router.push(store.currentPageOverride);
      store.setCurrentPageOverride(null);
    }
  }, [store.currentPageOverride]);

  if (!store.isOpen) {
    return (
      <button
        onClick={store.toggleOpen}
        title="Open Dev Panel (Ctrl+Shift+D)"
        style={{
          position: 'fixed', bottom: 20, right: 20,
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00c8ff22, #7800ff22)',
          border: '1.5px solid #00c8ff66',
          backdropFilter: 'blur(10px)',
          color: '#00c8ff', fontSize: 16, fontWeight: 900,
          cursor: 'pointer', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px #00c8ff33',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.boxShadow = '0 0 30px #00c8ff66';
          (e.target as HTMLElement).style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.boxShadow = '0 0 20px #00c8ff33';
          (e.target as HTMLElement).style.transform = 'scale(1)';
        }}
      >
        DEV
      </button>
    );
  }

  const TIER_OPTIONS: { value: DevTier; label: string }[] = [
    { value: '13-18', label: '13-18' },
    { value: '19-25', label: '19-25' },
    { value: '25plus', label: '25+' },
  ];

  const MOOD_OPTIONS: { value: DevMood; label: string }[] = [
    { value: 'focused', label: '🎯 Focused' },
    { value: 'chill', label: '😌 Chill' },
    { value: 'adventurous', label: '🚀 Adventurous' },
    { value: 'romantic', label: '💕 Romantic' },
    { value: 'reflective', label: '🤔 Reflective' },
    { value: 'creative', label: '🎨 Creative' },
  ];

  const ARCHETYPE_OPTIONS: { value: DevArchetype; label: string }[] = [
    { value: 'The Sage', label: 'The Sage' },
    { value: 'The Explorer', label: 'The Explorer' },
    { value: 'The Hero', label: 'The Hero' },
    { value: 'The Rebel', label: 'The Rebel' },
    { value: 'The Lover', label: 'The Lover' },
    { value: 'The Magician', label: 'The Magician' },
  ];

  const NAV_PATHS = [
    { path: '/', label: 'Landing' },
    { path: '/crossroads', label: 'Crossroads' },
    { path: '/mood', label: 'Mood' },
    { path: '/quiz', label: 'Quiz' },
    { path: '/results', label: 'Results' },
    { path: '/checkout-success', label: 'Checkout Success' },
    { path: '/auth', label: 'Auth' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <div
      style={{
        position: 'fixed', bottom: 20, right: 20,
        width: 320, maxHeight: '80vh',
        background: 'rgba(5, 5, 16, 0.95)',
        border: '1px solid #00c8ff44',
        borderRadius: 12,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 40px rgba(0, 200, 255, 0.15), 0 20px 60px rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(90deg, #00c8ff11, #7800ff11)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#00c8ff',
            boxShadow: '0 0 8px #00c8ff', animation: 'pulse 2s infinite',
          }} />
          <span style={{ color: '#00c8ff', fontWeight: 900, fontSize: 13, letterSpacing: '0.05em' }}>
            DEV PANEL
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={store.reset}
            title="Reset all"
            style={{
              background: 'transparent', border: '1px solid #334155',
              borderRadius: 4, color: '#64748b', fontSize: 10,
              padding: '2px 6px', cursor: 'pointer',
            }}
          >
            RESET
          </button>
          <button
            onClick={store.toggleOpen}
            style={{
              background: 'transparent', border: 'none',
              color: '#475569', fontSize: 16, cursor: 'pointer', lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ padding: 14, overflowY: 'auto', flex: 1 }}>

        {/* Global toggles */}
        <Section title="Global">
          <Toggle label="Dev Mode" value={store.devMode} onChange={store.setDevMode} />
          <Toggle label="Fake Data" value={store.fakeDataEnabled} onChange={store.setFakeDataEnabled} />
          <Toggle label="Skip to Results" value={store.skipToResults} onChange={store.setSkipToResults} />
          <Toggle label="Mock Auth (auto-login)" value={store.mockAuthEnabled} onChange={store.setMockAuthEnabled} />
        </Section>

        {/* Quiz config */}
        <Section title="Quiz Config">
          <Select label="Tier" value={store.tier} options={TIER_OPTIONS} onChange={(v) => store.setTier(v as DevTier)} />
          <Select label="Mood" value={store.mood} options={MOOD_OPTIONS} onChange={(v) => store.setMood(v as DevMood)} />
          <Toggle label="Force Premium (no paywall)" value={store.forcePremium} onChange={store.setForcePremium} />
        </Section>

        {/* Results config */}
        <Section title="Results Config">
          <TextInput
            label="MBTI Override (e.g. ENTJ)"
            value={store.mbtiOverride}
            onChange={store.setMbtiOverride}
            placeholder="Leave empty for default"
          />
          <Select
            label="Archetype"
            value={store.archetype}
            options={ARCHETYPE_OPTIONS}
            onChange={(v) => store.setArchetype(v as DevArchetype)}
          />
        </Section>

        {/* Navigation */}
        <Section title="Navigate">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {NAV_PATHS.map((np) => (
              <NavButton key={np.path} path={np.path} label={np.label} />
            ))}
          </div>
        </Section>

        {/* Mock auth */}
        <Section title="Auth Mock">
          <Toggle label="Auto-login Test User" value={store.mockAuthEnabled} onChange={store.setMockAuthEnabled} />
          <TextInput
            label="Mock User Email"
            value={store.mockUserEmail}
            onChange={store.setMockUserEmail}
          />
        </Section>

        {/* Status */}
        <div style={{
          padding: '8px 10px', background: '#0f172a', borderRadius: 6,
          border: '1px solid #1e3a5f', fontSize: 11, color: '#475569',
          lineHeight: 1.6,
        }}>
          <div><span style={{ color: '#00c8ff' }}>Tier:</span> {store.tier}</div>
          <div><span style={{ color: '#00c8ff' }}>Mood:</span> {store.mood}</div>
          <div><span style={{ color: '#00c8ff' }}>MBTI:</span> {store.mbtiOverride || 'default'}</div>
          <div><span style={{ color: '#00c8ff' }}>Premium:</span> {store.forcePremium ? '✓' : '✗'}</div>
          <div style={{ marginTop: 4, color: '#334155' }}>
            Ctrl+Shift+D to toggle
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        /* Scrollbar styling */
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        select option { background: #0f172a; color: #e2e8f0; }
      `}</style>
    </div>
  );
}
