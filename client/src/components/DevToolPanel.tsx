'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useDevStore, type DevMood, type DevTier } from '@/stores/devStore';
import questionsData from '@/data/questions.json';
import { getFakeScores } from '@/utils/devTest';

const MBTI_OPTIONS = [
  'Auto',
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const;

type MbtiOption = (typeof MBTI_OPTIONS)[number];
type DiscOption = 'Auto' | 'D' | 'I' | 'S' | 'C';
type BigFiveKey = 'O' | 'C' | 'E' | 'A' | 'N';
type PresetKey = 'balanced' | 'founder' | 'creative' | 'analyst' | 'helper' | 'overachiever';
type ResultPage = 'main' | 'role' | 'mbti' | 'disc' | 'bigfive';
type ResultDestination = ResultPage | 'share';

const TIER_OPTIONS: { value: DevTier; label: string }[] = [
  { value: '25plus', label: '25+ Adult' },
  { value: '19-25', label: '18-25' },
  { value: '13-18', label: '13-17' },
];

const MOOD_OPTIONS: { value: DevMood; label: string }[] = [
  { value: 'focused', label: 'Focused' },
  { value: 'chill', label: 'Chill' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'reflective', label: 'Reflective' },
  { value: 'creative', label: 'Creative' },
];

const DISC_OPTIONS: DiscOption[] = ['Auto', 'D', 'I', 'S', 'C'];
const RANDOM_TIERS: DevTier[] = ['13-18', '19-25', '25plus'];
const RANDOM_MOODS: DevMood[] = ['focused', 'chill', 'adventurous', 'romantic', 'reflective', 'creative'];
const RANDOM_MBTI = MBTI_OPTIONS.filter((type) => type !== 'Auto');
const BIG_FIVE_KEYS: BigFiveKey[] = ['O', 'C', 'E', 'A', 'N'];

const RESULT_DESTINATIONS: { page: ResultDestination; label: string }[] = [
  { page: 'main', label: 'Portrait' },
  { page: 'role', label: 'Role' },
  { page: 'mbti', label: 'MBTI' },
  { page: 'disc', label: 'DISC' },
  { page: 'bigfive', label: 'Big 5' },
  { page: 'share', label: 'Share' },
];

const RESULT_PAGE_LABELS: Record<ResultPage, string> = {
  main: 'Portrait',
  role: 'Role',
  mbti: 'MBTI',
  disc: 'DISC',
  bigfive: 'Big 5',
};

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

const KYR_STORAGE_PREFIXES = ['kyr_', 'knowrole', 'knowrole-', 'knowyourole'];

const PRESETS: Record<PresetKey, {
  label: string;
  tier: DevTier;
  mood: DevMood;
  mbti: Exclude<MbtiOption, 'Auto'>;
  disc: Exclude<DiscOption, 'Auto'>;
  bigFive: Record<BigFiveKey, number>;
}> = {
  balanced: {
    label: 'Balanced', tier: '25plus', mood: 'focused', mbti: 'ENFJ', disc: 'S',
    bigFive: { O: 62, C: 64, E: 58, A: 67, N: 38 },
  },
  founder: {
    label: 'Founder', tier: '25plus', mood: 'focused', mbti: 'ENTJ', disc: 'D',
    bigFive: { O: 82, C: 76, E: 70, A: 48, N: 28 },
  },
  creative: {
    label: 'Creative', tier: '19-25', mood: 'creative', mbti: 'ENFP', disc: 'I',
    bigFive: { O: 92, C: 42, E: 74, A: 72, N: 46 },
  },
  analyst: {
    label: 'Analyst', tier: '25plus', mood: 'reflective', mbti: 'INTJ', disc: 'C',
    bigFive: { O: 78, C: 86, E: 34, A: 52, N: 32 },
  },
  helper: {
    label: 'Helper', tier: '19-25', mood: 'chill', mbti: 'INFJ', disc: 'S',
    bigFive: { O: 74, C: 68, E: 42, A: 88, N: 44 },
  },
  overachiever: {
    label: 'Overachiever', tier: '13-18', mood: 'focused', mbti: 'ESTJ', disc: 'D',
    bigFive: { O: 56, C: 92, E: 66, A: 45, N: 58 },
  },
};

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tierToParam(tier: string) {
  return tier === '25plus' ? '25+' : tier;
}

function discScores(primary: DiscOption) {
  if (primary === 'Auto') return null;
  return {
    D: primary === 'D' ? 5 : 2,
    I: primary === 'I' ? 5 : 2,
    S: primary === 'S' ? 5 : 2,
    C: primary === 'C' ? 5 : 2,
  };
}

function normalizeMbti(mbti: string): string {
  return mbti && mbti !== 'Auto' ? mbti : '';
}

function buildScores(
  tier: DevTier,
  mbtiOverride: string,
  discOverride: DiscOption,
  bigFive: Record<BigFiveKey, number>,
  responseCount = 45,
) {
  const scores = getFakeScores(tier, normalizeMbti(mbtiOverride));
  const forcedDisc = discScores(discOverride);

  if (forcedDisc) scores.disc = forcedDisc;
  scores.bigFive = { ...bigFive };
  const responses = Array.from({ length: responseCount }, (_, i) => ({
    questionId: i + 1,
    response: i % 3 === 0 ? 1 : i % 2,
    choice: i % 3 === 0 ? 1 : i % 2,
    time: randomInt(1800, 7600),
    timeSpent: Math.round((randomInt(18, 76) / 10) * 10) / 10,
  }));
  const swipeTimes = responses.map((response) => Number(response.timeSpent ?? 3.2));

  return {
    ...scores,
    responses,
    swipeTimes,
    averageSwipeTime: Math.round((swipeTimes.reduce((sum, n) => sum + n, 0) / swipeTimes.length) * 10) / 10,
    engagement: randomInt(68, 98),
    criticalWildcard: randomInt(0, 4),
    firstPrinciplesWildcard: randomInt(0, 4),
  };
}

function getMbtiType(scores: { mbti: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number } }) {
  return [
    scores.mbti.E >= scores.mbti.I ? 'E' : 'I',
    scores.mbti.S >= scores.mbti.N ? 'S' : 'N',
    scores.mbti.T >= scores.mbti.F ? 'T' : 'F',
    scores.mbti.J >= scores.mbti.P ? 'J' : 'P',
  ].join('');
}

function getDiscStyle(scores: { disc: { D: number; I: number; S: number; C: number } }) {
  const entries = Object.entries(scores.disc) as [Exclude<DiscOption, 'Auto'>, number][];
  return entries.reduce((best, current) => (current[1] > best[1] ? current : best))[0];
}

function writeScoresToSession(
  tier: DevTier,
  mood: DevMood,
  mbtiOverride: string,
  discOverride: DiscOption,
  bigFive: Record<BigFiveKey, number>,
  forcePremium: boolean,
) {
  const scores = buildScores(tier, mbtiOverride, discOverride, bigFive);
  const mbtiType = getMbtiType(scores);
  const discStyle = getDiscStyle(scores);
  const tierParam = tierToParam(tier);

  sessionStorage.setItem('kyr_tier', tierParam);
  sessionStorage.setItem('kyr_quiz_tier', tierParam);
  sessionStorage.setItem('kyr_fake_scores', JSON.stringify(scores));
  sessionStorage.setItem('kyr_real_scores', JSON.stringify(scores));
  sessionStorage.setItem('kyr_fake_mbti', mbtiType);
  sessionStorage.setItem('kyr_fake_type', `${mbtiType}-${discStyle}`);
  sessionStorage.setItem('knowrole-tier', tierParam);
  sessionStorage.setItem('knowrole-mood', mood);

  if (forcePremium) {
    sessionStorage.setItem('kyr_premium_unlocked', 'true');
  } else {
    sessionStorage.removeItem('kyr_premium_unlocked');
  }

  return { scores, mbtiType, discStyle, tierParam };
}

function clearPreviewStorage() {
  PREVIEW_STORAGE_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

function clearAllKyrStorage() {
  [sessionStorage, localStorage].forEach((storage) => {
    Object.keys(storage).forEach((key) => {
      if (KYR_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        storage.removeItem(key);
      }
    });
  });
}

function readResultSummary() {
  try {
    const raw = sessionStorage.getItem('kyr_result_dto');
    if (!raw) return null;
    const dto = JSON.parse(raw) as {
      meta?: { resultId?: string; sessionId?: string; source?: string; runtime?: { domain?: string; environment?: string } };
      scores?: { mbti?: { type?: string }; disc?: { primary?: string }; bigFive?: { traits?: Record<string, { normalized?: number }> } };
      raw?: { tier?: string; mood?: string };
    };

    const traits = dto.scores?.bigFive?.traits;
    return {
      resultId: dto.meta?.resultId ?? 'unknown',
      sessionId: dto.meta?.sessionId ?? 'unknown',
      type: `${dto.scores?.mbti?.type ?? 'MBTI?'}-${dto.scores?.disc?.primary ?? 'DISC?'}`,
      tier: dto.raw?.tier ?? 'tier?',
      mood: dto.raw?.mood ?? 'mood?',
      source: dto.meta?.source ?? 'source?',
      domain: dto.meta?.runtime?.domain ?? 'local',
      bigFive: traits ? BIG_FIVE_KEYS.map((key) => `${key}${traits[key]?.normalized ?? '?'}`).join(' ') : 'n/a',
    };
  } catch {
    return null;
  }
}

function getQuestionHealth() {
  const questions = (questionsData as { questions?: unknown[] }).questions ?? [];
  const ids = new Set<string>();
  const tiers: Record<string, number> = {};
  let missingPrompt = 0;
  let missingOptions = 0;
  let duplicateIds = 0;

  questions.forEach((item) => {
    const question = item as { id?: string | number; prompt?: string; options?: unknown[]; tier?: string };
    const id = String(question.id ?? '');
    if (!id) missingPrompt += 1;
    if (ids.has(id)) duplicateIds += 1;
    ids.add(id);
    if (!question.prompt || question.prompt.trim().length < 2) missingPrompt += 1;
    if (!Array.isArray(question.options) || question.options.length < 2) missingOptions += 1;
    tiers[question.tier ?? 'unknown'] = (tiers[question.tier ?? 'unknown'] ?? 0) + 1;
  });

  return {
    total: questions.length,
    duplicateIds,
    missingPrompt,
    missingOptions,
    tiers,
    ok: questions.length > 0 && duplicateIds === 0 && missingPrompt === 0 && missingOptions === 0,
  };
}

function TinyButton({ children, onClick, tone = 'default', disabled = false }: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const styles = {
    primary: { background: 'linear-gradient(135deg, #00c8ff, #7c3aed)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff' },
    danger: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.32)', color: '#fca5a5' },
    default: { background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(148,163,184,0.18)', color: '#dbeafe' },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles,
        borderRadius: 8,
        padding: '7px 8px',
        fontSize: 10,
        fontWeight: 800,
        cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.62 : 1,
        width: '100%',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function MiniSelect<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label style={{ display: 'grid', gap: 3 }}>
      <span style={{ color: '#64748b', fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        style={{
          background: '#080812', border: '1px solid #1e293b', borderRadius: 7, color: '#dbeafe',
          padding: '6px 7px', fontSize: 10, outline: 'none', width: '100%',
        }}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function MiniToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        width: '100%', background: 'rgba(255,255,255,0.035)', border: '1px solid #1e293b',
        borderRadius: 8, color: '#cbd5e1', padding: '7px 8px', cursor: 'pointer', fontSize: 10,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <span>{label}</span>
      <span style={{ width: 30, height: 16, borderRadius: 999, background: value ? '#00c8ff' : '#334155', position: 'relative' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: value ? 16 : 2, transition: 'left 0.16s' }} />
      </span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 7, marginBottom: 12 }}>
      <div style={{ color: '#38bdf8', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 950, borderBottom: '1px solid #1e293b', paddingBottom: 4 }}>
        {title}
      </div>
      {children}
    </section>
  );
}

function StatLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, color: '#94a3b8', fontSize: 9 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: '#cbd5e1', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

export default function DevToolPanel() {
  const store = useDevStore();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [discOverride, setDiscOverride] = useState<DiscOption>('Auto');
  const [bigFive, setBigFive] = useState<Record<BigFiveKey, number>>({ O: 75, C: 70, E: 55, A: 62, N: 38 });
  const [resultSummary, setResultSummary] = useState<ReturnType<typeof readResultSummary>>(null);
  const [health, setHealth] = useState<ReturnType<typeof getQuestionHealth> | null>(null);

  useEffect(() => setMounted(true), []);

  const isLocalhost = mounted && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.')
  );

  const currentPath = mounted ? window.location.pathname : '';
  const busy = status.includes('Saving') || status.includes('Testing');

  const currentProfile = useMemo(() => {
    const scores = buildScores(store.tier, store.mbtiOverride, discOverride, bigFive, 45);
    return {
      mbti: getMbtiType(scores),
      disc: getDiscStyle(scores),
      tier: tierToParam(store.tier),
      mood: store.mood,
      premium: store.forcePremium,
    };
  }, [store.tier, store.mbtiOverride, store.mood, store.forcePremium, discOverride, bigFive]);

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
      writeScoresToSession(store.tier, store.mood, store.mbtiOverride, discOverride, bigFive, store.forcePremium);
      setStatus(`Profile active · ${currentProfile.mbti}-${currentProfile.disc}`);
    }
  }, [mounted, isLocalhost, store.devMode, store.fakeDataEnabled, store.tier, store.mood, store.mbtiOverride, store.forcePremium, discOverride, bigFive, currentProfile.mbti, currentProfile.disc]);

  if (!mounted || !isLocalhost) return null;

  const refreshSummary = () => {
    const summary = readResultSummary();
    setResultSummary(summary);
    setStatus(summary ? `Loaded ${summary.type}` : 'No ResultDTO in storage');
  };

  const openPath = (path: string, clean = false) => {
    if (clean) clearAllKyrStorage();
    if (!clean && store.devMode && store.fakeDataEnabled) {
      writeScoresToSession(store.tier, store.mood, store.mbtiOverride, discOverride, bigFive, store.forcePremium);
    }
    const params = new URLSearchParams({ test: 'true', tier: tierToParam(store.tier) });
    window.location.href = `${path}?${params.toString()}`;
  };

  const openResultsPage = (destination: ResultDestination) => {
    const page: ResultPage = destination === 'share' ? 'share' as ResultPage : destination;
    const preview = writeScoresToSession(store.tier, store.mood, store.mbtiOverride, discOverride, bigFive, store.forcePremium);
    const params = new URLSearchParams({
      test: 'true', force: 'true', page, tier: preview.tierParam,
      mbtiType: preview.mbtiType, discStyle: preview.discStyle,
      scores: btoa(JSON.stringify(preview.scores)),
    });
    window.location.href = `/results?${params.toString()}`;
  };

  const saveAndOpen = async (page: ResultPage, randomize = false) => {
    const tier = randomize ? pickRandom(RANDOM_TIERS) : store.tier;
    const mood = randomize ? pickRandom(RANDOM_MOODS) : store.mood;
    const mbti = randomize ? pickRandom(RANDOM_MBTI) : normalizeMbti(store.mbtiOverride);
    const disc = randomize ? pickRandom(['D', 'I', 'S', 'C'] as const) : discOverride;
    const b5 = randomize
      ? { O: randomInt(35, 95), C: randomInt(35, 95), E: randomInt(35, 95), A: randomInt(35, 95), N: randomInt(20, 80) }
      : bigFive;
    const scores = buildScores(tier, mbti, disc, b5, 45);
    const mbtiType = getMbtiType(scores);
    const discStyle = getDiscStyle(scores);
    const sessionId = `dev-${randomize ? 'random' : 'profile'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tierParam = tierToParam(tier);

    setStatus('Saving ResultDTO…');
    writeScoresToSession(tier, mood, mbti, disc, b5, store.forcePremium);

    try {
      const response = await fetch('/api/results/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierParam, mood, sessionId, source: randomize ? 'randomized_preview' : 'dev_test', visibility: 'anonymous', scores }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success || !data?.result) {
        throw new Error(data?.error || data?.validation?.errors?.join(', ') || 'Result persistence failed');
      }

      sessionStorage.setItem('kyr_result_dto', JSON.stringify(data.result));
      setResultSummary(readResultSummary());
      setStatus(`Saved ${mbtiType}-${discStyle}; opening ${RESULT_PAGE_LABELS[page]}…`);
      const params = new URLSearchParams({
        test: 'true', random: randomize ? 'true' : 'false', tier: tierParam, page, force: store.forcePremium ? 'true' : 'false',
        sessionId: data.result?.meta?.sessionId || sessionId, mbtiType, discStyle, scores: btoa(JSON.stringify(scores)),
      });
      window.location.href = `/results?${params.toString()}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Save failed: ${message}`);
      window.alert(`Dev result save failed.\n\n${message}`);
    }
  };

  const applyPreset = (key: PresetKey) => {
    const preset = PRESETS[key];
    store.setTier(preset.tier);
    store.setMood(preset.mood);
    store.setMbtiOverride(preset.mbti);
    setDiscOverride(preset.disc);
    setBigFive(preset.bigFive);
    setStatus(`Preset loaded · ${preset.label}`);
  };

  const runQuestionHealth = () => {
    const result = getQuestionHealth();
    setHealth(result);
    setStatus(result.ok ? `Question bank OK · ${result.total}` : `Question issues · ${result.total}`);
  };

  const runSupabaseSmoke = async () => {
    setStatus('Testing Supabase save…');
    const scores = buildScores(store.tier, store.mbtiOverride, discOverride, bigFive, 45);
    const sessionId = `dev-db-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const response = await fetch('/api/results/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierToParam(store.tier),
          mood: store.mood,
          sessionId,
          source: 'dev_test',
          visibility: 'anonymous',
          scores,
        }),
      });
      const data = await response.json();
      if (!response.ok || data?.success !== true || data?.persistence?.ok !== true) {
        throw new Error(data?.error || data?.validation?.errors?.join(', ') || 'Compute/save failed');
      }
      sessionStorage.setItem('kyr_result_dto', JSON.stringify(data.result));
      setResultSummary(readResultSummary());
      setStatus(`Supabase OK · ${data.result?.meta?.resultId ?? 'saved'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Supabase failed: ${message}`);
    }
  };

  const handleClearPreview = () => {
    clearPreviewStorage();
    setResultSummary(null);
    setStatus('Preview storage cleared');
  };

  const handleClearAll = () => {
    clearAllKyrStorage();
    setResultSummary(null);
    setStatus('All KYR browser storage cleared');
  };

  const handleReset = () => {
    store.reset();
    setDiscOverride('Auto');
    setBigFive({ O: 75, C: 70, E: 55, A: 62, N: 38 });
    clearPreviewStorage();
    setResultSummary(null);
    setHealth(null);
    setStatus('Panel reset');
  };

  if (!store.isOpen) {
    return (
      <button
        type="button"
        onClick={store.toggleOpen}
        title="Show Dev Panel (Ctrl+Shift+D)"
        style={{
          position: 'fixed', top: 10, left: 10, zIndex: 99999,
          background: 'linear-gradient(135deg, #00c8ff, #7c3aed)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999, padding: '7px 10px',
          fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 950, cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(0,0,0,0.45), 0 0 18px rgba(0,200,255,0.2)',
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
        width: 232, background: 'rgba(6, 8, 18, 0.97)', border: '1px solid rgba(56,189,248,0.32)',
        borderRadius: 13, boxShadow: '0 18px 42px rgba(0,0,0,0.58), 0 0 24px rgba(0,200,255,0.08)',
        fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#e2e8f0', maxHeight: '94vh',
        overflowY: 'auto', backdropFilter: 'blur(18px)',
      }}
    >
      <div style={{
        padding: '8px 9px', background: 'linear-gradient(90deg, rgba(0,200,255,0.1), rgba(124,58,237,0.08))',
        borderBottom: '1px solid #162033', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 1, borderRadius: '12px 12px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 7px #22d3ee' }} />
          <span style={{ color: '#7dd3fc', fontWeight: 950, fontSize: 10, letterSpacing: '0.1em' }}>KYR DEV</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" onClick={handleReset} title="Reset panel" style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 5, color: '#64748b', fontSize: 8, padding: '3px 5px', cursor: 'pointer' }}>RST</button>
          <button type="button" onClick={store.toggleOpen} title="Hide Dev Panel" style={{ background: 'rgba(0,200,255,0.12)', border: '1px solid #00c8ff55', borderRadius: 5, color: '#7dd3fc', fontSize: 8, padding: '3px 6px', cursor: 'pointer', fontWeight: 950 }}>HIDE</button>
        </div>
      </div>

      <div style={{ padding: 10 }}>
        <div style={{ background: '#080812', borderRadius: 9, padding: '7px 8px', marginBottom: 11, border: '1px solid #162033' }}>
          <StatLine label="page" value={currentPath || '/'} />
          <StatLine label="profile" value={`${currentProfile.mbti}-${currentProfile.disc}`} />
          <div style={{ color: status.includes('failed') || status.includes('issues') ? '#fca5a5' : '#8fb5ca', fontSize: 9, marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis' }}>{status}</div>
        </div>

        <Section title="Flow">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <TinyButton onClick={() => openPath('/quiz', true)}>Quiz</TinyButton>
            <TinyButton onClick={() => openPath('/', true)}>Home</TinyButton>
            <TinyButton onClick={() => openPath('/results', true)}>Results</TinyButton>
            <TinyButton onClick={() => openPath('/checkout-success')}>Checkout</TinyButton>
          </div>
        </Section>

        <Section title="Results">
          <TinyButton tone="primary" onClick={() => saveAndOpen('main', true)} disabled={busy}>Random + Save</TinyButton>
          <TinyButton onClick={() => saveAndOpen('main')} disabled={busy}>Save Current</TinyButton>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {RESULT_DESTINATIONS.map((destination) => (
              <TinyButton key={destination.page} onClick={() => openResultsPage(destination.page)}>
                {destination.label}
              </TinyButton>
            ))}
          </div>
          <MiniToggle label="Unlock Preview" value={store.forcePremium} onChange={store.setForcePremium} />
          <MiniToggle label="Inject Fake Data" value={store.fakeDataEnabled} onChange={store.setFakeDataEnabled} />
        </Section>

        <Section title="Persona">
          <MiniSelect label="Tier" value={store.tier} options={TIER_OPTIONS} onChange={store.setTier} />
          <MiniSelect label="Mood" value={store.mood} options={MOOD_OPTIONS} onChange={store.setMood} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.72fr', gap: 6 }}>
            <MiniSelect
              label="MBTI"
              value={(store.mbtiOverride || 'Auto') as MbtiOption}
              options={MBTI_OPTIONS.map((type) => ({ value: type, label: type }))}
              onChange={(type) => store.setMbtiOverride(type === 'Auto' ? '' : type)}
            />
            <MiniSelect label="DISC" value={discOverride} options={DISC_OPTIONS.map((type) => ({ value: type, label: type }))} onChange={setDiscOverride} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
              <TinyButton key={key} onClick={() => applyPreset(key)}>{PRESETS[key].label}</TinyButton>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 5, background: 'rgba(255,255,255,0.025)', border: '1px solid #162033', borderRadius: 8, padding: 7 }}>
            {BIG_FIVE_KEYS.map((key) => (
              <label key={key} style={{ display: 'grid', gridTemplateColumns: '15px 1fr 24px', alignItems: 'center', gap: 5, fontSize: 9, color: '#94a3b8' }}>
                <span style={{ color: '#38bdf8', fontWeight: 900 }}>{key}</span>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={bigFive[key]}
                  onChange={(event) => setBigFive((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
                  style={{ width: '100%', accentColor: '#00c8ff' }}
                />
                <span style={{ textAlign: 'right' }}>{bigFive[key]}</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Data">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <TinyButton onClick={refreshSummary}>DTO</TinyButton>
            <TinyButton onClick={runSupabaseSmoke} disabled={busy}>DB Save</TinyButton>
            <TinyButton onClick={handleClearPreview}>Clear Preview</TinyButton>
            <TinyButton tone="danger" onClick={handleClearAll}>Clear All</TinyButton>
          </div>
          {resultSummary && (
            <div style={{ background: '#080812', border: '1px solid #162033', borderRadius: 8, padding: 7, display: 'grid', gap: 3 }}>
              <StatLine label="type" value={resultSummary.type} />
              <StatLine label="tier" value={`${resultSummary.tier} · ${resultSummary.mood}`} />
              <StatLine label="b5" value={resultSummary.bigFive} />
              <StatLine label="src" value={resultSummary.source} />
            </div>
          )}
        </Section>

        <Section title="QA">
          <TinyButton onClick={runQuestionHealth}>Question Health</TinyButton>
          {health && (
            <div style={{ background: '#080812', border: `1px solid ${health.ok ? '#164e63' : '#7f1d1d'}`, borderRadius: 8, padding: 7, display: 'grid', gap: 3 }}>
              <StatLine label="total" value={health.total} />
              <StatLine label="dupes" value={health.duplicateIds} />
              <StatLine label="missing" value={health.missingPrompt + health.missingOptions} />
              <StatLine label="tiers" value={Object.entries(health.tiers).map(([tier, count]) => `${tier}:${count}`).join(' ')} />
            </div>
          )}
        </Section>

        <div style={{
          padding: '7px 8px', background: '#080812', borderRadius: 8, border: '1px solid #162033',
          fontSize: 9, color: '#64748b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px',
        }}>
          <div><span style={{ color: '#38bdf8' }}>Tier</span> {currentProfile.tier}</div>
          <div><span style={{ color: '#38bdf8' }}>Mood</span> {currentProfile.mood}</div>
          <div><span style={{ color: '#38bdf8' }}>Type</span> {currentProfile.mbti}-{currentProfile.disc}</div>
          <div><span style={{ color: '#38bdf8' }}>Prem</span> {currentProfile.premium ? '✓' : '✗'}</div>
        </div>

        <div style={{ color: '#334155', fontSize: 8, marginTop: 8, textAlign: 'center' }}>Hide/show: pill, HIDE, or Ctrl+Shift+D</div>
      </div>

      <style>{`
        aside::-webkit-scrollbar { width: 3px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        select option { background: #080812; color: #e2e8f0; }
        input[type='range'] { height: 14px; }
      `}</style>
    </aside>
  );
}
