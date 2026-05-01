import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { requireAuth } from '@/app/api/_lib/auth';
import { jsonResponse, noContentResponse } from '@/app/api/_lib/security';

export async function OPTIONS() {
  return noContentResponse({
    headers: {
      Allow: 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET /api/premium/status — Get user's premium status
export const GET = requireAuth(async (_req: NextRequest, ctx: { user: { sub: string } }) => {
  try {
    const { data: user, error } = await getSupabaseAdmin()
      .from('users')
      .select('is_premium, premium_purchased_at')
      .eq('id', ctx.user.sub)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[GET /api/premium/status] Error:', error);
      return jsonResponse(
        { error: 'Failed to get premium status' },
        { status: 500 }
      );
    }

    return jsonResponse({
      success: true,
      isPremium: user?.is_premium || false,
      premiumPurchasedAt: user?.premium_purchased_at || null,
    });
  } catch (error) {
    console.error('[GET /api/premium/status] Error:', error);
    return jsonResponse(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
