import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/_lib/auth';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

// GDPR: Right to Data Portability - export all user data
export const GET = requireAuth(async (req: NextRequest, ctx) => {
  try {
    const userId = ctx.user.sub;

    // Fetch user profile
    const { data: user, error: userError } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Fetch quiz results
    const { data: quizResults, error: quizError } = await getSupabaseAdmin()
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId);

    // Fetch privacy preferences
    const { data: privacyPrefs, error: privacyError } = await getSupabaseAdmin()
      .from('user_privacy_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user
        ? {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            isPremium: user.isPremium,
            // Exclude sensitive fields
          }
        : null,
      quizResults: quizResults || [],
      privacyPreferences: privacyPrefs || null,
    };

    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    );
  }
});
