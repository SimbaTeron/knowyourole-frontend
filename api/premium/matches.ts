import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';
import { getJobMatches } from '../../_lib/job-matching';
import type { QuizScores } from '../../_lib/scoring';

export const config = { runtime: 'nodejs' };

// POST /api/job-matches — public (no auth required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mbtiType, discStyle, bigFive, limit = 5 } = body;

    if (!mbtiType || !discStyle || !bigFive) {
      return NextResponse.json({ error: 'mbtiType, discStyle, and bigFive are required' }, { status: 400 });
    }

    const scores: QuizScores = {
      mbti: { E: 50, I: 50, S: 50, N: 50, T: 50, F: 50, J: 50, P: 50 },
      disc: { D: 50, I: 50, S: 50, C: 50 },
      bigFive,
    };

    // Try to extract actual MBTI from mbtiType string
    if (typeof mbtiType === 'string' && mbtiType.length >= 4) {
      const [E, S, T, J] = mbtiType.split('');
      scores.mbti = {
        E: ['E'].includes(E) ? 75 : 25,
        I: E === 'I' ? 75 : 25,
        S: ['S'].includes(S) ? 75 : 25,
        N: S === 'N' ? 75 : 25,
        T: ['T'].includes(T) ? 75 : 25,
        F: T === 'F' ? 75 : 25,
        J: ['J'].includes(J) ? 75 : 25,
        P: J === 'P' ? 75 : 25,
      };
    }

    if (typeof discStyle === 'string' && ['D', 'I', 'S', 'C'].includes(discStyle)) {
      const discMap = { D: 80, I: 60, S: 40, C: 20 };
      scores.disc = {
        D: discStyle === 'D' ? 80 : 30,
        I: discStyle === 'I' ? 80 : 30,
        S: discStyle === 'S' ? 80 : 30,
        C: discStyle === 'C' ? 80 : 30,
      };
    }

    const matches = await getJobMatches(supabaseAdmin, scores, Number(limit));

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('[POST /api/job-matches] Error:', error);
    return NextResponse.json({ error: 'Failed to get job matches' }, { status: 500 });
  }
}