import { NextRequest } from "next/server";
import { z } from "zod";
import { getOptionalAuthUser } from "@/app/api/_lib/auth";
import { canAccessResult } from "@/app/api/_lib/anonymous-result-capability";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { getAppOrigin, jsonResponse } from "@/app/api/_lib/security";
import { readPersistedQuizResultDTO } from "@/lib/results/persistedQuizResult";

export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 8_192;
const MAX_RECENT_REQUESTS = 12;
const RATE_WINDOW_MS = 60_000;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

const optionalRecommendation = z
  .union([z.string().trim().min(1).max(180), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" && value.length ? value : null));

const pilotFeedbackSchema = z.object({
  resultId: z.string().trim().min(8).max(160),
  accuracyRating: z.number().int().min(1).max(5),
  mostUsefulRecommendation: optionalRecommendation,
  leastUsefulRecommendation: optionalRecommendation,
  improvementNote: z
    .union([z.string().trim().max(500), z.literal(""), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" && value.length ? value : null)),
}).superRefine((value, context) => {
  if (value.mostUsefulRecommendation && value.mostUsefulRecommendation === value.leastUsefulRecommendation) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["leastUsefulRecommendation"],
      message: "Choose different recommendations for most and least useful.",
    });
  }
});

function requestKey(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

function isRateLimited(req: NextRequest) {
  const now = Date.now();
  const key = requestKey(req);
  const bucket = requestBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_RECENT_REQUESTS;
}

function recommendationTitles(dto: ReturnType<typeof readPersistedQuizResultDTO>) {
  return Array.from(new Set([
    dto.careerDirection.title,
    ...dto.careerDirection.examples.map((role) => role.title),
    ...dto.careerMatches.map((role) => role.title),
  ].filter((title): title is string => typeof title === "string" && title.length > 0))).slice(0, 8);
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== getAppOrigin(req)) {
    return jsonResponse({ success: false, error: "Invalid request origin" }, { status: 403 });
  }
  if (isRateLimited(req)) {
    return jsonResponse({ success: false, error: "Please wait a moment before trying again." }, { status: 429 });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ success: false, error: "Feedback payload is too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = pilotFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ success: false, error: "Invalid feedback payload" }, { status: 400 });
  }

  const feedback = parsed.data;
  const supabase = getSupabaseAdmin();
  const { data: result, error: resultError } = await supabase
    .from("quiz_results")
    .select("id, user_id, session_id, responses, deleted")
    .eq("id", feedback.resultId)
    .maybeSingle();

  if (resultError) {
    console.error("[POST /api/results/pilot-feedback] result lookup failed", resultError);
    return jsonResponse({ success: false, error: "Feedback is temporarily unavailable" }, { status: 503 });
  }
  if (!result || result.deleted) {
    return jsonResponse({ success: false, error: "That result is unavailable" }, { status: 404 });
  }
  if (!await canAccessResult(req, result)) {
    return jsonResponse({ success: false, error: "You do not have access to this result" }, { status: 403 });
  }

  let dto: ReturnType<typeof readPersistedQuizResultDTO>;
  try {
    dto = readPersistedQuizResultDTO(result);
  } catch (error) {
    console.error("[POST /api/results/pilot-feedback] invalid persisted ResultDTO", error);
    return jsonResponse({ success: false, error: "That result is unavailable" }, { status: 409 });
  }

  const allowedRecommendations = recommendationTitles(dto);
  for (const choice of [feedback.mostUsefulRecommendation, feedback.leastUsefulRecommendation]) {
    if (choice && !allowedRecommendations.includes(choice)) {
      return jsonResponse({ success: false, error: "Choose a recommendation shown in your result" }, { status: 400 });
    }
  }
  if (!result.session_id || result.session_id !== dto.meta.sessionId) {
    console.error("[POST /api/results/pilot-feedback] result/session mismatch", { resultId: result.id });
    return jsonResponse({ success: false, error: "That result is unavailable" }, { status: 409 });
  }

  const authUser = await getOptionalAuthUser(req);
  const insert = {
    result_id: result.id,
    session_id: result.session_id,
    user_id: result.user_id ?? authUser?.sub ?? null,
    direction_title: dto.careerDirection.title,
    accuracy_rating: feedback.accuracyRating,
    most_useful_recommendation: feedback.mostUsefulRecommendation,
    least_useful_recommendation: feedback.leastUsefulRecommendation,
    improvement_note: feedback.improvementNote,
    source: "shortform_v2_controlled_pilot",
  };

  const { data, error } = await supabase
    .from("pilot_direction_feedback")
    .insert(insert)
    .select("id, submitted_at")
    .maybeSingle();

  if (!error && data) {
    return jsonResponse({ success: true, id: data.id, submittedAt: data.submitted_at, alreadySubmitted: false }, { status: 201 });
  }
  if (error?.code === "23505") {
    const { data: existing, error: existingError } = await supabase
      .from("pilot_direction_feedback")
      .select("id, submitted_at")
      .eq("result_id", result.id)
      .maybeSingle();
    if (!existingError && existing) {
      return jsonResponse({ success: true, id: existing.id, submittedAt: existing.submitted_at, alreadySubmitted: true });
    }
  }

  console.error("[POST /api/results/pilot-feedback] insert failed", error);
  return jsonResponse({ success: false, error: "Could not save feedback. Please try again." }, { status: 503 });
}
