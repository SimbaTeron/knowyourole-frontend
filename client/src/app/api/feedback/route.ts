import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { getAppOrigin } from '@/app/api/_lib/security';
import {
  FEEDBACK_MAX_BYTES,
  consumeFeedbackRate,
  feedbackRateKey,
  feedbackRequestSchema,
  toFeedbackInsert,
} from '@/lib/feedback/feedbackSubmission';

const corsHeaders = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

// POST /api/feedback — public feedback form and the legacy results modal.
// GET was an unused admin dump and is intentionally not implemented (405).
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== getAppOrigin(req)) {
      return json({ error: 'Invalid request origin' }, 403);
    }
    if (consumeFeedbackRate(feedbackRateKey(req.headers))) {
      return json({ error: 'Please wait a moment before trying again.' }, 429);
    }

    const contentLength = Number(req.headers.get('content-length') || 0);
    if (Number.isFinite(contentLength) && contentLength > FEEDBACK_MAX_BYTES) {
      return json({ error: 'Feedback payload is too large' }, 413);
    }

    const raw = await req.text();
    if (raw.length > FEEDBACK_MAX_BYTES) {
      return json({ error: 'Feedback payload is too large' }, 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'Invalid feedback payload' }, 400);
    }

    const parsed = feedbackRequestSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Invalid feedback payload' }, 400);
    }

    const { data, error } = await getSupabaseAdmin()
      .from('feedback')
      .insert(toFeedbackInsert(parsed.data))
      .select()
      .single();

    if (error) {
      console.error('[POST /api/feedback] Error:', error);
      return json({ error: 'Failed to save feedback' }, 500);
    }

    return json({ success: true, id: data.id });
  } catch (error) {
    console.error('[POST /api/feedback] Error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}
