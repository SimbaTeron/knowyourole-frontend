import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/_lib/auth';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

// Establish the application account from the verified Auth0 subject. Browser
// identity is never accepted as a database key without server-side JWT proof.
export const GET = requireAuth(async (_req: NextRequest, ctx) => {
  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('users')
    .upsert({ id: ctx.user.sub, email: ctx.user.email ?? null, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    console.error('Error establishing authenticated user:', error);
    return NextResponse.json({ message: 'Failed to establish authenticated user' }, { status: 500 });
  }

  return NextResponse.json(user);
});
