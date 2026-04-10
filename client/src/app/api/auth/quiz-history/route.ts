import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/_lib/auth';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

// Simple arc evolution calculation
function calculateArcEvolution(results: any[]): object | null {
  if (results.length < 2) return null;

  const sorted = [...results].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const personalityChanges = {
    mbtiEvolution: first.mbtiType !== last.mbtiType ? `${first.mbtiType} → ${last.mbtiType}` : null,
    discEvolution: first.discStyle !== last.discStyle ? `${first.discStyle} → ${last.discStyle}` : null,
    bigFiveShifts: {},
  };

  const bigFiveTraits = ['bigFiveO', 'bigFiveC', 'bigFiveE', 'bigFiveA', 'bigFiveN'];
  for (const trait of bigFiveTraits) {
    const firstVal = first[trait];
    const lastVal = last[trait];
    if (firstVal !== undefined && lastVal !== undefined && firstVal !== lastVal) {
      (personalityChanges.bigFiveShifts as any)[trait] = lastVal - firstVal;
    }
  }

  return personalityChanges;
}

export const GET = requireAuth(async (req: NextRequest, ctx) => {
  try {
    const userId = ctx.user.sub;

    const { data: results, error } = await getSupabaseAdmin()
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('createdAt', { ascending: true });

    if (error) {
      console.error('Error fetching quiz history:', error);
      return NextResponse.json(
        { message: 'Failed to fetch quiz history' },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        arcData: null,
        message: 'No quiz history found',
      });
    }

    const arcData = results.length >= 2 ? calculateArcEvolution(results) : null;

    return NextResponse.json({
      success: true,
      results: results.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        mbtiType: r.mbtiType,
        discStyle: r.discStyle,
        bigFive: {
          O: r.bigFiveO,
          C: r.bigFiveC,
          E: r.bigFiveE,
          A: r.bigFiveA,
          N: r.bigFiveN,
        },
        primaryRole: r.primaryRoleTitle,
        criticalThinking: r.criticalThinking,
        firstPrinciples: r.firstPrinciples,
      })),
      arcData,
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch quiz history' },
      { status: 500 }
    );
  }
});
