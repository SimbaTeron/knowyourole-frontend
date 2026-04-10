import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/_lib/auth';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

// CCPA Privacy Preferences
export const GET = requireAuth(async (req: NextRequest, ctx) => {
  try {
    const userId = ctx.user.sub;

    const { data: preferences, error } = await getSupabaseAdmin()
      .from('user_privacy_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching privacy preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch privacy preferences' },
        { status: 500 }
      );
    }

    // Default privacy preferences if none exist
    const defaultPreferences = {
      dataCollection: true,
      analytics: true,
      marketing: false,
      dataRetention: 'active', // 'active', '30days', '90days', 'deleted'
      rightToDelete: true,
      rightToKnow: true,
      ccpaOptOut: false,
    };

    return NextResponse.json({
      success: true,
      preferences: preferences || defaultPreferences,
    });
  } catch (error) {
    console.error('Error fetching privacy preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy preferences' },
      { status: 500 }
    );
  }
});
