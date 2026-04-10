import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';
import { calculatePersonality } from '../../_lib/scoring';
import { v4 as uuidv4 } from 'uuid';

// Vercel serverless function
export const config = { runtime: 'nodejs' };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mbti, disc, bigFive, tier, mood, sessionId } = body;

    if (!mbti || !disc || !bigFive || !tier) {
      return NextResponse.json({ error: 'mbti, disc, bigFive, and tier are required' }, { status: 400 });
    }

    const scores = { mbti, disc, bigFive };
    const result = calculatePersonality(scores);

    // Save to Supabase (fire and forget — non-blocking)
    const id = uuidv4();
    supabaseAdmin
      .from('quiz_results')
      .insert({
        id,
        mbti_type: result.mbtiType,
        mbti_blend: result.mbtiBlend,
        disc_style: result.discStyle,
        big_five_o: result.bigFive.O,
        big_five_c: result.bigFive.C,
        big_five_e: result.bigFive.E,
        big_five_a: result.bigFive.A,
        big_five_n: result.bigFive.N,
        tier,
        mood,
        session_id: sessionId || null,
      })
      .then(({ error }) => {
        if (error) console.error('[POST /api/score] DB insert error:', error);
      });

    return NextResponse.json({
      id,
      mbtiType: result.mbtiType,
      mbtiBlend: result.mbtiBlend,
      discStyle: result.discStyle,
      bigFive: result.bigFive,
      bigFiveProfile: result.bigFiveProfile,
      title: result.title,
      spark: result.spark,
      engagement: result.engagement,
    });
  } catch (error) {
    console.error('[POST /api/score] Error:', error);
    return NextResponse.json({ error: 'Failed to calculate scores' }, { status: 500 });
  }
}