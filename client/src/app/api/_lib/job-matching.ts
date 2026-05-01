// Job matching library — matches personality profile to job roles
// Uses Supabase to query job_roles table

import type { SupabaseClient } from '@supabase/supabase-js';

export interface JobMatch {
  roleName: string;
  roleNumber?: number;
  category: string;
  description: string;
  matchScore: number;
  explanation: string;
  traitHighlights: string[];
  jobCollar?: string;
  salary?: string;
  reason?: string;
  growth?: string;
  personalityFit?: string;
  strengthsUsed?: string[];
  dayInLife?: string;
}

export interface QuizScores {
  mbtiType: string;
  disc: string;
  bigFive: { O: number; C: number; E: number; A: number; N: number };
}

// Score MBTI match (0-100)
function mbtiScore(mbtiType: string, roleBest: string[], roleAvoid: string[]): number {
  if (roleBest.includes(mbtiType)) return 100;
  if (roleAvoid?.includes(mbtiType)) return 0;
  // Partial match based on shared letters
  let shared = 0;
  for (const letter of mbtiType) {
    if (roleBest.some(r => r.includes(letter))) shared++;
  }
  return Math.round((shared / 4) * 70);
}

// Score DISC match
function discScore(discStyle: string, discPrefs: string[]): number {
  if (!discPrefs || discPrefs.length === 0) return 50;
  if (discPrefs.includes(discStyle)) return 100;
  return 50;
}

// Score Big Five match — handles JSONB column (raw DB value) and plain object
function bigFiveScore(
  bigFive: { O: number; C: number; E: number; A: number; N: number },
  roleBigFive: unknown
): number {
  if (!roleBigFive) return 50;
  // Supabase JSONB stores as {O, C, E, A, N} with 1-5 scale, convert to 1-100
  const b5 = roleBigFive as { O?: number; C?: number; E?: number; A?: number; N?: number };
  const diff = Math.abs(bigFive.O - ((b5.O ?? 3) / 5 * 100)) +
    Math.abs(bigFive.C - ((b5.C ?? 3) / 5 * 100)) +
    Math.abs(bigFive.E - ((b5.E ?? 3) / 5 * 100)) +
    Math.abs(bigFive.A - ((b5.A ?? 3) / 5 * 100)) +
    Math.abs(bigFive.N - ((b5.N ?? 3) / 5 * 100));
  const maxDiff = 5 * 100;
  return Math.round(100 - (diff / maxDiff) * 100);
}

export async function getJobMatches(
  supabase: SupabaseClient,
  scores: QuizScores,
  limit = 5,
  diversityBoost = false
): Promise<JobMatch[]> {
  const { data: roles, error } = await supabase
    .from('job_roles')
    .select('*')
    .limit(150);

  if (error || !roles) return [];

  const scored: JobMatch[] = roles.map(role => {
    const mbtiScoreVal = mbtiScore(scores.mbtiType, role.mbti_best || [], role.mbti_avoid || []);
    const discScoreVal = discScore(scores.disc, role.disc_prefs || []);
    const bigFiveScoreVal = bigFiveScore(scores.bigFive, role.big_five_avg);
    const totalScore = Math.round((mbtiScoreVal * 0.4) + (discScoreVal * 0.3) + (bigFiveScoreVal * 0.3));
    const salaryMin = Number(role.salary_min || 0);
    const salaryMax = Number(role.salary_max || 0);
    const salary = salaryMin && salaryMax
      ? `$${Math.round(salaryMin / 1000)}k-$${Math.round(salaryMax / 1000)}k`
      : undefined;
    const description = role.description || '';

    return {
      roleName: role.role_name,
      roleNumber: role.role_number,
      category: role.category || 'General',
      description,
      matchScore: totalScore,
      explanation: description || `Your personality pattern aligns well with ${role.role_name}.`,
      traitHighlights: [
        `${scores.mbtiType} thinking style`,
        `${scores.disc} DISC energy`,
        'Big Five profile fit',
      ],
      // Track diversity by job collar (category maps to collar)
      jobCollar: role.category || 'white',
      salary,
      reason: description || `Strong ${scores.mbtiType}/${scores.disc} alignment with this career path.`,
      growth: role.growth_rate || 'Moderate',
      personalityFit: `Matched from MBTI (${scores.mbtiType}), DISC (${scores.disc}), and Big Five profile fit.`,
      strengthsUsed: [scores.mbtiType, scores.disc, 'Personality fit'],
      dayInLife: description || undefined,
    };
  });

  const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);

  if (!diversityBoost) {
    return sorted.slice(0, limit);
  }

  // Diversity boost: pick top role per collar, then fill with remaining
  const selected: typeof scored = [];
  const collarUsed = new Set<string>();
  const remaining: typeof scored = [];

  for (const role of sorted) {
    const collar = role.jobCollar || 'General';
    if (!collarUsed.has(collar)) {
      selected.push(role);
      collarUsed.add(collar);
      if (selected.length >= limit) break;
    } else {
      remaining.push(role);
    }
  }

  // Fill remaining slots
  if (selected.length < limit) {
    for (const role of remaining) {
      selected.push(role);
      if (selected.length >= limit) break;
    }
  }

  return selected.slice(0, limit);
}
