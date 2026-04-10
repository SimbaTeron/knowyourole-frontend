import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { requireAuth } from '@/app/api/_lib/auth';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET /api/premium/status — Get user's premium status
export const GET = requireAuth(async (req: Request, ctx: { user: { sub: string } }) => {
  try {
    const { data: user, error } = await getSupabaseAdmin()
      .from('users')
      .select('is_premium, premium_purchased_at')
      .eq('id', ctx.user.sub)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[GET /api/premium/status] Error:', error);
      return NextResponse.json(
        { error: 'Failed to get premium status' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      isPremium: user?.is_premium || false,
      premiumPurchasedAt: user?.premium_purchased_at || null,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[GET /api/premium/status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});
