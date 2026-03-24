/**
 * Weighted Proxy Calculations for KnowRole
 * Phase 3.1: Enhanced empirical validity with weighted averages
 * 
 * Critical Thinking = 0.4*MBTI_T + 0.4*Big5_O + 0.2*DISC_C
 * First Principles = 0.4*MBTI_N + 0.4*Big5_O + 0.2*DISC_I
 */

export const PROXY_WEIGHTS = {
  critical: { mbtiT: 0.4, big5O: 0.4, discC: 0.2 },
  firstPrinciples: { mbtiN: 0.4, big5O: 0.4, discI: 0.2 },
} as const;

export interface ProxyInputs {
  mbti: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  disc: { D: number; I: number; S: number; C: number };
  bigFive: { O: number; C: number; E: number; A: number; N: number };
}

export interface MoodBoosts {
  critical: number;
  firstPrinciples: number;
}

export interface ProxyResult {
  critical: {
    mbtiT: number;
    big5O: number;
    discC: number;
    weighted: number;
    final: number;
  };
  firstPrinciples: {
    mbtiN: number;
    big5O: number;
    discI: number;
    weighted: number;
    final: number;
  };
}

/**
 * Calculate weighted proxy scores for Critical Thinking and First Principles
 */
export function calculateWeightedProxies(
  inputs: ProxyInputs,
  moodBoosts: MoodBoosts = { critical: 0, firstPrinciples: 0 },
  wildcardBoosts: { critical: number; firstPrinciples: number } = { critical: 0, firstPrinciples: 0 }
): ProxyResult {
  const { mbti, disc, bigFive } = inputs;
  
  const mbtiTotal = mbti.E + mbti.I + mbti.S + mbti.N + mbti.T + mbti.F + mbti.J + mbti.P;
  const discTotal = disc.D + disc.I + disc.S + disc.C;
  
  const mbtiT_pct = mbtiTotal > 0 ? (mbti.T / (mbti.T + mbti.F)) * 100 : 50;
  const mbtiN_pct = mbtiTotal > 0 ? (mbti.N / (mbti.S + mbti.N)) * 100 : 50;
  const big5O_pct = bigFive.O;
  const discC_pct = discTotal > 0 ? (disc.C / discTotal) * 100 : 25;
  const discI_pct = discTotal > 0 ? (disc.I / discTotal) * 100 : 25;
  
  const criticalProxy = (mbtiT_pct * PROXY_WEIGHTS.critical.mbtiT) + 
                        (big5O_pct * PROXY_WEIGHTS.critical.big5O) + 
                        (discC_pct * PROXY_WEIGHTS.critical.discC);
                        
  const firstPrinciplesProxy = (mbtiN_pct * PROXY_WEIGHTS.firstPrinciples.mbtiN) + 
                               (big5O_pct * PROXY_WEIGHTS.firstPrinciples.big5O) + 
                               (discI_pct * PROXY_WEIGHTS.firstPrinciples.discI);
  
  const criticalWildcardBoost = wildcardBoosts.critical * 20;
  const firstPrinciplesWildcardBoost = wildcardBoosts.firstPrinciples * 20;
  
  const criticalRaw = (criticalProxy * 0.8) + (criticalWildcardBoost * 0.2) + moodBoosts.critical;
  const firstPrinciplesRaw = (firstPrinciplesProxy * 0.8) + (firstPrinciplesWildcardBoost * 0.2) + moodBoosts.firstPrinciples;
  
  return {
    critical: {
      mbtiT: Math.round(mbtiT_pct),
      big5O: Math.round(big5O_pct),
      discC: Math.round(discC_pct),
      weighted: Math.round(criticalProxy),
      final: Math.round(Math.max(0, Math.min(100, criticalRaw))),
    },
    firstPrinciples: {
      mbtiN: Math.round(mbtiN_pct),
      big5O: Math.round(big5O_pct),
      discI: Math.round(discI_pct),
      weighted: Math.round(firstPrinciplesProxy),
      final: Math.round(Math.max(0, Math.min(100, firstPrinciplesRaw))),
    },
  };
}

/**
 * Calculate Cronbach's alpha for internal consistency
 * @param responses Array of response values (0-1 for binary, -2 to +2 for slider)
 * @returns Alpha value between 0 and 1, where >0.7 indicates acceptable consistency
 */
export function calculateCronbachAlpha(responses: number[]): number {
  if (responses.length < 2) return 1;
  
  const n = responses.length;
  const mean = responses.reduce((a, b) => a + b, 0) / n;
  const totalVariance = responses.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1) || 1;
  
  const itemVariances = responses.map(item => {
    const itemMean = (item + mean) / 2;
    return Math.pow(item - itemMean, 2);
  });
  const sumItemVariance = itemVariances.reduce((a, b) => a + b, 0) / (n - 1) || 1;
  
  const alpha = (n / (n - 1)) * (1 - sumItemVariance / totalVariance);
  
  return Math.max(0, Math.min(1, alpha));
}

/**
 * Check if a trait group has acceptable internal consistency
 * @param alpha Cronbach's alpha value
 * @returns true if alpha >= 0.7 (acceptable consistency)
 */
export function hasAcceptableConsistency(alpha: number): boolean {
  return alpha >= 0.7;
}

/**
 * Generate consistency warning message
 */
export function getConsistencyWarning(lowConsistencyTraits: string[]): string | null {
  if (lowConsistencyTraits.length === 0) return null;
  return `Balanced View - Retake for clarity on: ${lowConsistencyTraits.join(', ')}`;
}

/**
 * Mood effects lookup for proxy boosts
 * Based on Sheet 15 ('15. Mood Effects', rows 43-50)
 */
export const MOOD_PROXY_BOOSTS: Record<string, { critical: number; firstPrinciples: number }> = {
  happy: { critical: 0, firstPrinciples: 0 },
  calm: { critical: 0, firstPrinciples: 0 },
  curious: { critical: 0, firstPrinciples: 5 },
  determined: { critical: 5, firstPrinciples: 0 },
  creative: { critical: 0, firstPrinciples: 8 },
  social: { critical: 0, firstPrinciples: 0 },
  stuck: { critical: 10, firstPrinciples: 0 },
  reflective: { critical: 0, firstPrinciples: 5 },
  energized: { critical: 0, firstPrinciples: 0 },
};

/**
 * Calculate combined mood boosts for blend moods
 */
export function getMoodProxyBoosts(moodBlend: string): { critical: number; firstPrinciples: number } {
  const moods = moodBlend.toLowerCase().split('+').map(m => m.trim());
  
  let critical = 0;
  let firstPrinciples = 0;
  
  for (const mood of moods) {
    const boosts = MOOD_PROXY_BOOSTS[mood] || { critical: 0, firstPrinciples: 0 };
    critical += boosts.critical;
    firstPrinciples += boosts.firstPrinciples;
  }
  
  return { critical, firstPrinciples };
}

/**
 * Convert percentage to 1-5 scale
 */
export function toScale(pct: number): number {
  return Math.max(1, Math.min(5, Math.round(pct / 20)));
}
