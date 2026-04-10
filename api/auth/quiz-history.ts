import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';
import { requireAuth } from '../../_lib/auth';

export const config = { runtime: 'nodejs' };

// GET /api/auth/quiz-history — requires Auth0 token
export const GET = requireAuth(async (req: Request, ctx: { user: { sub: string } }) => {
  try {
    const userId = ctx.user.sub;

    const { data: results, error } = await supabaseAdmin
      .from('quiz_results')
      .select('id, created_at, tier, mbti_type, disc_style, big_five_o, big_five_c, big_five_e, big_five_a, big_five_n, primary_role_title, secondary_role_title, critical_thinking, first_principles')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/auth/quiz-history] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch quiz history' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      results: results || [],
      message: 'Auth0 not yet wired — results show placeholder until real auth is configured',
    });
  } catch (error) {
    console.error('[GET /api/auth/quiz-history] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});