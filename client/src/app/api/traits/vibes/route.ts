import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/traits/vibes
export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = body;

    const getVibe = async (trait: string, score: number) => {
      const { data } = await getSupabaseAdmin()
        .from('trait_vibes')
        .select('*')
        .eq('trait', trait.toLowerCase())
        .lte('score_min', score)
        .gte('score_max', score)
        .limit(1);
      return data?.[0] || null;
    };

    const vibes = {
      openness: await getVibe('openness', openness || 50),
      conscientiousness: await getVibe('conscientiousness', conscientiousness || 50),
      extraversion: await getVibe('extraversion', extraversion || 50),
      agreeableness: await getVibe('agreeableness', agreeableness || 50),
      neuroticism: await getVibe('neuroticism', neuroticism || 50),
    };

    return NextResponse.json(vibes, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/traits/vibes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trait vibes' },
      { status: 500, headers: corsHeaders }
    );
  }
}
