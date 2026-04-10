// Job matching library — matches personality profile to job roles
// Uses Supabase to query job_roles table

import type { SupabaseClient } from '@supabase/supabase-js';
import type { QuizScores } from './scoring';

export interface JobMatch {
  role_name: string;
  category: string;
  description: string;
  match_score: number;
  salary_min: number;
  salary_max: number;
  growth_rate: string;
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
  // Partial
  return 50;
}

// Score Big Five match
function bigFiveScore(
  bigFive: { O: number; C: number; E: number; A: number; N: number },
  roleBigFive: { O: number; C: number; E: number; A: number; N: number } | null
): number {
  if (!roleBigFive) return 50;
  const diff = Math.abs(bigFive.O - (roleBigFive.O || 50)) +
    Math.abs(bigFive.C - (roleBigFive.C || 50)) +
    Math.abs(bigFive.E - (roleBigFive.E || 50)) +
    Math.abs(bigFive.A - (roleBigFive.A || 50)) +
    Math.abs(bigFive.N - (roleBigFive.N || 50));
  const maxDiff = 5 * 100;
  return Math.round(100 - (diff / maxDiff) * 100);
}

export async function getJobMatches(
  supabase: SupabaseClient,
  scores: QuizScores,
  limit = 5
): Promise<JobMatch[]> {
  const { data: roles, error } = await supabase
    .from('job_roles')
    .select('*')
    .limit(100);

  if (error || !roles) return [];

  const scored = roles.map(role => {
    const mbtiScoreVal = mbtiScore(scores.mbtiType, role.mbti_best || [], role.mbti_avoid || []);
    const discScoreVal = discScore(scores.disc, role.disc_prefs || []);
    const bigFiveScoreVal = bigFiveScore(scores.bigFive, role.big_five_avg);
    const totalScore = Math.round((mbtiScoreVal * 0.4) + (discScoreVal * 0.3) + (bigFiveScoreVal * 0.3));

    return {
      role_name: role.role_name,
      category: role.category,
      description: role.description,
      match_score: totalScore,
      salary_min: role.salary_min,
      salary_max: role.salary_max,
      growth_rate: role.growth_rate,
    };
  });

  return scored.sort((a, b) => b.match_score - a.match_score).slice(0, limit);
}