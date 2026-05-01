import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';

export const config = { runtime: 'nodejs' };

// GET /api/traits/vibes — public
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trait = searchParams.get('trait'); // openness, conscientiousness, extraversion, agreeableness, neuroticism

    let query = supabaseAdmin.from('trait_vibes').select('*');
    if (trait) {
      query = query.eq('trait', trait);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch trait vibes' }, { status: 500 });
    }

    return NextResponse.json({ success: true, vibes: data || [] });
  } catch (error) {
    console.error('[GET /api/traits/vibes] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}