import { NextRequest, NextResponse } from 'next/server';
import { canAccessResult } from '@/app/api/_lib/anonymous-result-capability';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { getAppOrigin } from '@/app/api/_lib/security';
import {
  FEEDBACK_MAX_BYTES,
  consumeFeedbackRate,
  feedbackRateKey,
  feedbackRequestSchema,
  requestedResultId,
  toFeedbackInsert,
  type FeedbackInsert,
} from '@/lib/feedback/feedbackSubmission';
import {
  SCALE_QUIZ_TYPE,
  linkScaleFeedbackToResult,
  normalizeScaleRatings,
  scaleBodyHasExtraFields,
  scaleRatingsAreEmpty,
} from '@/lib/feedback/scaleFeedback';

const corsHeaders = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-kyr-anonymous-capability',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

type FeedbackResultRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  deleted: boolean | null;
};

export type FeedbackDeps = {
  findResult: (resultId: string) => Promise<
    | { ok: true; row: FeedbackResultRow }
    | { ok: false; status: 404 | 503 }
  >;
  canAccess: (req: NextRequest, result: { user_id: string | null; session_id: string | null }) => Promise<boolean>;
  insert: (row: FeedbackInsert) => Promise<{ ok: true; id: string } | { ok: false }>;
};

function defaultDeps(): FeedbackDeps {
  return {
    async findResult(resultId) {
      const { data, error } = await getSupabaseAdmin()
        .from('quiz_results')
        .select('id, user_id, session_id, deleted')
        .eq('id', resultId)
        .maybeSingle();
      if (error) {
        console.error('[POST /api/feedback] result lookup failed', error.code);
        return { ok: false, status: 503 };
      }
      if (!data || data.deleted) return { ok: false, status: 404 };
      return { ok: true, row: data as FeedbackResultRow };
    },
    canAccess: canAccessResult,
    async insert(row) {
      const { data, error } = await getSupabaseAdmin()
        .from('feedback')
        .insert(row)
        .select('id')
        .single();
      if (error || !data?.id) {
        console.error('[POST /api/feedback] insert failed', error?.code);
        return { ok: false };
      }
      return { ok: true, id: data.id };
    },
  };
}

function isScale(body: { quiz_type?: string | null; quizType?: string | null }) {
  return body.quiz_type === SCALE_QUIZ_TYPE || body.quizType === SCALE_QUIZ_TYPE;
}

// POST /api/feedback — public feedback form and the legacy results modal.
// GET was an unused admin dump and is intentionally not implemented (405).
export async function postPublicFeedback(req: NextRequest, deps?: FeedbackDeps) {
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

    let row = toFeedbackInsert(parsed.data);
    if (isScale(parsed.data)) {
      if (scaleBodyHasExtraFields(body)) return json({ error: 'Invalid feedback payload' }, 400);
      const ratings = normalizeScaleRatings(parsed.data);
      if (!ratings.ok || scaleRatingsAreEmpty(ratings.value)) return json({ error: 'Invalid feedback payload' }, 400);
      row = { ...row, ...ratings.value, quiz_type: SCALE_QUIZ_TYPE };
      const resultId = requestedResultId(parsed.data);
      if (resultId) {
        const resolved = deps ?? defaultDeps();
        const found = await resolved.findResult(resultId);
        if (!found.ok) {
          const error = found.status === 404 ? 'That result is unavailable' : 'Feedback is temporarily unavailable';
          return json({ error }, found.status);
        }
        if (!found.row.session_id) {
          return json({ error: 'That result is unavailable' }, 409);
        }
        if (!await resolved.canAccess(req, found.row)) {
          return json({ error: 'You do not have access to this result' }, 403);
        }
        row = linkScaleFeedbackToResult(row, { id: found.row.id, sessionId: found.row.session_id });
      }
    } else if (Object.values(row).every((value) => value == null || value === "")) {
      return json({ error: 'Invalid feedback payload' }, 400);
    }

    const saved = await (deps ?? defaultDeps()).insert(row);
    if (!saved.ok) return json({ error: 'Failed to save feedback' }, 500);
    return json({ success: true, id: saved.id });
  } catch (error) {
    console.error('[POST /api/feedback] Error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  return postPublicFeedback(req);
}
