import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';
import { calculatePersonality } from '../../_lib/scoring';
import { v4 as uuidv4 } from 'uuid';

// Vercel serverless function
export const config = { runtime: 'nodejs' };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Support both flat body (mbti/disc/bigFive at top level) and nested (inside scores object)
    const mbti = body.mbti ?? body.scores?.mbti;
    const disc = body.disc ?? body.scores?.disc;
    const bigFive = body.bigFive ?? body.scores?.bigFive;
    const { tier, mood, sessionId } = body;

    if (!mbti || !disc || !bigFive || !tier) {
      return NextResponse.json({ error: 'mbti, disc, bigFive, and tier are required' }, { status: 400 });
    }

    const scores = { mbti, disc, bigFive };
    const result = calculatePersonality(scores);

    // Compute thinking-skills scales (not in calculatePersonality return)
    const criticalThinking = Math.round(0.4 * mbti.T + 0.4 * bigFive.O + 0.2 * disc.C);
    const firstPrinciples = Math.round(0.4 * mbti.N + 0.4 * bigFive.O + 0.2 * disc.I);

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
      sessionId: id,
      mbtiType: result.mbtiType,
      mbtiBlend: result.mbtiBlend,
      discStyle: result.discStyle,
      bigFive: result.bigFive,
      bigFiveProfile: result.bigFiveProfile,
      title: result.title,
      spark: result.spark,
      engagement: result.engagement,
      scales: {
        critical: {
          value: criticalThinking,
          traits: `T:${mbti.T} + O:${bigFive.O} + C:${disc.C}`,
          quest: "Apply critical analysis to complex systems",
        },
        firstPrinciples: {
          value: firstPrinciples,
          traits: `N:${mbti.N} + O:${bigFive.O} + I:${disc.I}`,
          quest: "Question assumptions and rebuild from the ground up",
        },
      },
    });
  } catch (error) {
    console.error('[POST /api/score] Error:', error);
    return NextResponse.json({ error: 'Failed to calculate scores' }, { status: 500 });
  }
}