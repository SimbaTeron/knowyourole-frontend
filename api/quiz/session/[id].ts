import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../_lib/supabase';

export const config = { runtime: 'nodejs' };

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('quiz_sessions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}