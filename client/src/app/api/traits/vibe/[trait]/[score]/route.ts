import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET /api/traits/vibe/[trait]/[score]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trait: string; score: string }> }
) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { trait, score } = await params;
    const scoreNum = parseInt(score);

    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return NextResponse.json(
        { error: 'Score must be a number between 0 and 100' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from('trait_vibes')
      .select('*')
      .eq('trait', trait.toLowerCase())
      .lte('score_min', scoreNum)
      .gte('score_max', scoreNum)
      .limit(1);

    if (error) {
      console.error('[GET /api/traits/vibe] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trait vibe' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Trait vibe not found for the given score range' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(data[0], { headers: corsHeaders });
  } catch (error) {
    console.error('[GET /api/traits/vibe] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
