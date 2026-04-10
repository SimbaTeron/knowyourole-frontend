import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/_lib/auth';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

// GDPR: Right to Erasure - delete all user data
export async function POST(request: NextRequest) {
  // Manual auth check since we're using raw deletion
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json(
      { error: 'Missing authorization token' },
      { status: 401 }
    );
  }

  // Import validateAuth0Token dynamically
  const { validateAuth0Token } = await import('@/app/api/_lib/auth');
  const user = await validateAuth0Token(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  const userId = user.sub;

  try {
    // Delete quiz results first (foreign key constraint)
    const { error: quizError } = await getSupabaseAdmin()
      .from('quiz_results')
      .delete()
      .eq('user_id', userId);

    if (quizError) {
      console.error('Error deleting quiz results:', quizError);
    }

    // Delete privacy preferences
    const { error: privacyError } = await getSupabaseAdmin()
      .from('user_privacy_preferences')
      .delete()
      .eq('user_id', userId);

    if (privacyError) {
      console.error('Error deleting privacy preferences:', privacyError);
    }

    // Delete user profile
    const { error: userError } = await getSupabaseAdmin()
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Error deleting user:', userError);
      return NextResponse.json(
        { error: 'Failed to delete user data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All user data has been deleted',
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json(
      { error: 'Failed to delete user data' },
      { status: 500 }
    );
  }
}
