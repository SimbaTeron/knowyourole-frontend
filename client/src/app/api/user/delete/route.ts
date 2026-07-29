import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/_lib/auth';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

// Account erasure is executed by one transactional database function created in
// migration 006. Do not replace this with best-effort sequential deletes.
export const POST = requireAuth(async (_req: NextRequest, ctx) => {
  const { error } = await getSupabaseAdmin().rpc('delete_account_data', { p_user_id: ctx.user.sub });
  if (error) {
    console.error('Account deletion failed:', error);
    return NextResponse.json({ error: 'Failed to delete account data' }, { status: 500 });
  }
  return NextResponse.json({ success: true, message: 'Account and account-linked data deleted' }, {
    headers: { 'Cache-Control': 'no-store' },
  });
});
