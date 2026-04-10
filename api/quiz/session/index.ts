import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../_lib/supabase';

export const config = { runtime: 'nodejs' };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, mood, funMode, theme } = body;

    const { data, error } = await supabaseAdmin
      .from('quiz_sessions')
      .insert({ tier, mood: mood || 'neutral', fun_mode: funMode || false, theme: theme || 'compass' })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/session] Error:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[POST /api/session] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}