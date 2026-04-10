import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';
import { requireAuth } from '../../_lib/auth';

export const config = { runtime: 'nodejs' };

// GET /api/premium/arc-evolution — requires auth
export const GET = requireAuth(async (_req: Request, ctx: { user: { sub: string } }) => {
  try {
    const userId = ctx.user.sub;

    const { data: results, error } = await supabaseAdmin
      .from('quiz_results')
      .select('id, created_at, tier, mbti_type, big_five_o, big_five_c, big_five_e, big_five_a, big_five_n')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    if (!results || results.length < 2) {
      return NextResponse.json({
        success: true,
        arcData: null,
        message: 'Need at least 2 quiz sessions to generate arc evolution',
      });
    }

    // Calculate arc: compare first vs latest session
    const first = results[0];
    const latest = results[results.length - 1];

    return NextResponse.json({
      success: true,
      arcData: {
        sessions: results.length,
        dimensionChanges: {
          openness: latest.big_five_o - first.big_five_o,
          conscientiousness: latest.big_five_c - first.big_five_c,
          extraversion: latest.big_five_e - first.big_five_e,
          agreeableness: latest.big_five_a - first.big_five_a,
          neuroticism: latest.big_five_n - first.big_five_n,
        },
        archetypeEvolution: first.mbti_type !== latest.mbti_type
          ? `${first.mbti_type} → ${latest.mbti_type}`
          : first.mbti_type,
        insights: 'Placeholder — needs real data + Auth0 wired',
      },
    });
  } catch (error) {
    console.error('[GET /api/premium/arc-evolution] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});