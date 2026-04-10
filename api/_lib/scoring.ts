// Scoring library — extracts MBTI, DISC, Big Five from quiz responses
// Mirrors the logic currently embedded in the React frontend

export interface QuizScores {
  mbti: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  disc: { D: number; I: number; S: number; C: number };
  bigFive: { O: number; C: number; E: number; A: number; N: number };
}

export interface PersonalityResult {
  mbtiType: string;
  mbtiBlend: string;
  discStyle: 'D' | 'I' | 'S' | 'C';
  bigFive: { O: number; C: number; E: number; A: number; N: number };
  bigFiveProfile: string;
  title: string;
  spark: string;
  proxyNudge: string;
  engagement: { score: number; totalQuestions: number; avgResponseTime: number };
}

// ─── MBTI letter from dimension score (0-100) ───────────────────────────────
function mbtiLetter(score: number, highLetter: string, lowLetter: string): string {
  return score >= 50 ? highLetter : lowLetter;
}

// ─── Big Five profile label ──────────────────────────────────────────────────
function bigFiveProfile(scores: { O: number; C: number; E: number; A: number; N: number }): string {
  const { O, C, E, A, N } = scores;
  // Simplified categorization
  const openness = O >= 70 ? 'Curious' : O >= 40 ? 'Balanced' : 'Practical';
  const conscientious = C >= 70 ? 'Organized' : C >= 40 ? 'Flexible' : 'Spontaneous';
  const extraversion = E >= 70 ? 'Outgoing' : E >= 40 ? 'Measured' : 'Reserved';
  const agreeableness = A >= 70 ? 'Warm' : A >= 40 ? 'Independent' : 'Challenging';
  const stability = N >= 60 ? 'Reactive' : N >= 30 ? 'Steady' : 'Calm';
  return `${openness} · ${conscientious} · ${extraversion} · ${agreeableness} · ${stability}`;
}

// ─── Disc style from scores ──────────────────────────────────────────────────
function discStyle(scores: { D: number; I: number; S: number; C: number }): 'D' | 'I' | 'S' | 'C' {
  const top = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a));
  return top[0] as 'D' | 'I' | 'S' | 'C';
}

// ─── Primary function for proxy nudge ───────────────────────────────────────
export function calculatePersonality(scores: QuizScores): PersonalityResult {
  const { mbti: m, disc, bigFive } = scores;

  // MBTI type string
  const mbtiType =
    mbtiLetter(m.E, 'E', 'I') +
    mbtiLetter(m.S, 'S', 'N') +
    mbtiLetter(m.T, 'T', 'F') +
    mbtiLetter(m.J, 'J', 'P');

  // MBTI blend (dominant + adjacent)
  const letters = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
  const vals = [m.E, m.I, m.S, m.N, m.T, m.F, m.J, m.P];
  const topTwoIndices = vals
    .map((v, i) => [v, i] as [number, number])
    .sort((a, b) => b[0] - a[0])
    .slice(0, 2)
    .map(x => x[1]);
  const topTwoLetters = topTwoIndices.map(i => letters[i]).sort().join('');
  const mbtiBlend = mbtiType + '-' + topTwoLetters;

  // DISC
  const style = discStyle(disc);

  // Big Five profile
  const profile = bigFiveProfile(bigFive);

  // Proxy dimensions (for app-specific scoring)
  const criticalThinking = Math.round(0.4 * m.T + 0.4 * bigFive.O + 0.2 * disc.C);
  const firstPrinciples = Math.round(0.4 * m.N + 0.4 * bigFive.O + 0.2 * disc.I);

  // Placeholder title (would come from job_roles lookup in real impl)
  const titles: Record<string, string> = {
    'INTJ': 'The Architect', 'ENTJ': 'The Commander', 'INTP': 'The Thinker',
    'ENTP': 'The Debater', 'INFJ': 'The Advocate', 'INFP': 'The Mediator',
    'ISFJ': 'The Protector', 'ESFJ': 'The Champion', 'ISTJ': 'The Inspector',
    'ESTJ': 'The Director', 'ISFP': 'The Artist', 'ESFP': 'The Performer',
  };
  const title = titles[mbtiType] || 'The Explorer';

  const sparks: Record<string, string> = {
    'INTJ': 'Sees systems where others see chaos',
    'ENTJ': 'Naturally rallies people toward big goals',
    'INTP': 'Drawn to understanding the underlying mechanics',
    'ENTP': 'Generates possibilities faster than anyone',
    'INFJ': 'Exists to help people grow into who they're meant to be',
    'INFP': 'Deeply idealistic — will fight for what they believe is right',
    'ISFJ': 'Gives quietly and constantly — the backbone of everyone',
    'ESFJ': 'Makes sure everyone feels like they belong',
    'ISTJ': 'Reliable beyond measure — does what they say',
    'ESTJ': 'Takes charge and gets things done properly',
    'ISFP': 'Lives in the moment, makes things beautiful',
    'ESFP': 'Brings energy and excitement everywhere they go',
  };
  const spark = sparks[mbtiType] || 'Built different';

  return {
    mbtiType,
    mbtiBlend,
    discStyle: style,
    bigFive,
    bigFiveProfile: profile,
    title,
    spark,
    proxyNudge: `Critical Thinking: ${criticalThinking} | First Principles: ${firstPrinciples}`,
    engagement: { score: 82, totalQuestions: 60, avgResponseTime: 4.2 },
  };
}