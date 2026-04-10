import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { requireAuth } from '@/app/api/_lib/auth';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/premium/insights — requires auth (premium feature)
export const POST = requireAuth(async (req: Request, ctx: { user: { sub: string } }) => {
  try {
    const body = await req.json();
    const { mbtiType, discStyle, bigFive, tier } = body;

    if (!mbtiType || !bigFive) {
      return NextResponse.json(
        { error: 'mbtiType and bigFive are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Look up archetype insights from premium_insights table
    const { data: insights } = await getSupabaseAdmin()
      .from('premium_insights')
      .select('*')
      .ilike('archetype', `%${mbtiType}%`)
      .limit(1);

    // Placeholder response until real data is seeded
    return NextResponse.json({
      success: true,
      insights: insights?.[0] || {
        archetype: mbtiType,
        side_hustles: [{ title: 'Consulting', description: 'Use your natural analytical strengths', income_estimate: '$5k-$20k/mo' }],
        blindspots: [{ title: 'Overthinking', description: 'Action beats perfection', remedy: 'Set time limits on decisions' }],
        career_paths: [{ title: 'Strategic Consulting', description: 'High-leverage use of your planning ability', salary_range: '$100k-$250k' }],
        growth_tips: [{ title: 'Delegate more', description: "Your way isn't always the fastest way", action: 'Identify 3 tasks to offload this week' }],
        strengths: [{ title: 'Systems thinking', description: 'You see how pieces connect' }],
        communication: [{ title: 'Direct and precise', description: 'Give context before jumping to conclusions' }],
        environments: [{ title: 'Autonomous', description: 'Minimal micromanagement, maximum trust' }],
        relationships: [{ title: 'Seek feedback', description: 'Your introversion can blur blind spots' }],
      },
      message: 'Using placeholder insights. Seed premium_insights table to activate.',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/premium/insights] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get insights' },
      { status: 500, headers: corsHeaders }
    );
  }
});
