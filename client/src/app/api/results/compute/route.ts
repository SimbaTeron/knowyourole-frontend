import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { getOptionalAuthUser } from "@/app/api/_lib/auth";
import { createAnonymousCapability } from "@/app/api/_lib/anonymous-result-capability";
import { buildResultDTO, type BuildResultDTOInput, type ResultDTO } from "@/lib/results/buildResultDTO";
import { readPersistedQuizResultDTO } from "@/lib/results/persistedQuizResult";
import { buildQuizResultReportingProjection } from "@/lib/results/quizResultReportingProjection";
import type { ScoresData } from "@/lib/scoring";
import { calibrateShortformV2Scores } from "@/lib/results/calibrateShortformV2Scores";
import {
  getShortformV2Question,
  recomputeShortformV2ScoreMaps,
  validateShortformV2Responses,
} from "@/lib/quiz/shortformV2Scoring";

export const dynamic = "force-dynamic";

// This endpoint returns personal quiz material. It is intentionally same-origin:
// do not reintroduce wildcard CORS without an authenticated cross-origin contract.
const responseHeaders = { "Cache-Control": "no-store" };

/**
 * POST /api/results/compute
 *
 * Autonomous Results Engine boundary.
 * Accepts the current raw/legacy quiz payload, converts it into the canonical
 * ResultDTO, validates it, persists the result to Supabase quiz_results, and
 * returns the full DTO. This route is the future single source of truth for
 * quiz completion; UI wiring will move here incrementally after this lands.
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `compute-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, requestId, error: "Invalid JSON body" },
        { status: 400, headers: responseHeaders },
      );
    }

    let input: BuildResultDTOInput;
    try {
      input = await normalizeComputeInput(body, req, requestId);
    } catch (error) {
      return NextResponse.json(
        { success: false, requestId, error: error instanceof Error ? error.message : "Invalid compute payload" },
        { status: 400, headers: responseHeaders },
      );
    }
    const { result, validation } = buildResultDTO(input);

    if (!validation.ok) {
      console.warn("[POST /api/results/compute] validation failed", { requestId, errors: validation.errors });
      return NextResponse.json(
        { success: false, requestId, validation },
        { status: 422, headers: responseHeaders },
      );
    }

    const persistence = await persistResultDTOSafely(result);
    if (!persistence.ok) {
      // A live result is canonical only once the server has durably stored it.
      // Returning a successful-but-unpersisted DTO would reintroduce the exact
      // display/persistence split this endpoint exists to eliminate.
      return NextResponse.json(
        { success: false, requestId, error: "Result persistence is temporarily unavailable", persistence },
        { status: 503, headers: responseHeaders },
      );
    }

    const anonymousCapability = !persistence.result.meta.userId && persistence.created
      ? await issueAnonymousCapability(persistence.result.meta.sessionId)
      : null;

    return NextResponse.json(
      {
        success: true,
        requestId,
        result: persistence.result,
        validation,
        persistence: {
          ok: true,
          resultId: persistence.resultId,
          persistenceAttemptId: persistence.persistenceAttemptId,
          created: persistence.created,
        },
        anonymousDeletionCapability: anonymousCapability?.token ?? null,
        anonymousDeletionCapabilityExpiresAt: anonymousCapability?.expiresAt ?? null,
      },
      { status: 200, headers: responseHeaders },
    );
  } catch (error) {
    console.error("[POST /api/results/compute] fatal error", { requestId, error });
    return NextResponse.json(
      { success: false, requestId, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500, headers: responseHeaders },
    );
  }
}

async function normalizeComputeInput(body: unknown, req: NextRequest, requestId: string): Promise<BuildResultDTOInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be an object");
  }

  const b = body as Record<string, unknown>;
  const submittedScores = (b.scores ?? b) as Record<string, unknown>;
  if (!submittedScores || typeof submittedScores !== "object" || Array.isArray(submittedScores)) {
    throw new Error("scores object is required");
  }

  // Scores supplied by a browser are presentation data, not evidence. Rebuild
  // every framework and career vector from the fixed, versioned answer bank.
  const scores = recomputeAuthoritativeShortformScores(submittedScores.responses);
  const verifiedUser = await getOptionalAuthUser(req);
  const verifiedUserId = verifiedUser?.sub ?? null;

  return {
    scores,
    tier: typeof b.tier === "string" ? b.tier : undefined,
    mood: typeof b.mood === "string" ? b.mood : undefined,
    moodBlend: typeof b.moodBlend === "string" ? b.moodBlend : undefined,
    funMode: typeof b.funMode === "boolean" ? b.funMode : undefined,
    landmark: typeof b.landmark === "string" ? b.landmark : undefined,
    theme: typeof b.theme === "string" ? b.theme : undefined,
    sessionId: typeof b.sessionId === "string" ? b.sessionId : undefined,
    userId: verifiedUserId,
    source: normalizeSource(b.source),
    visibility: normalizeVisibility(b.visibility, verifiedUserId),
    requestId,
    runtime: {
      environment: process.env.VERCEL_ENV === "production" ? "production" : process.env.VERCEL_ENV === "preview" ? "preview" : "local",
      domain: req.headers.get("host") ?? undefined,
      buildId: process.env.VERCEL_GIT_COMMIT_SHA ?? undefined,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? undefined,
    },
  };
}

function recomputeAuthoritativeShortformScores(rawResponses: unknown): BuildResultDTOInput["scores"] {
  const responses = validateShortformV2Responses(rawResponses);
  const rawScoreMaps = recomputeShortformV2ScoreMaps(responses);
  const swipeTimes = responses.map((response) => response.timeSpent ?? 0);
  const averageSwipeTime = swipeTimes.reduce((sum, value) => sum + value, 0) / Math.max(1, swipeTimes.length);
  const canonicalResponses = responses.map((response) => {
    const question = getShortformV2Question(response.questionId);
    const answer = question.answers[response.choice];
    return {
      questionId: response.questionId,
      choice: response.choice,
      timeSpent: response.timeSpent ?? 0,
      swipeDirection: response.swipeDirection ?? (response.choice < 2 ? "left" : "right"),
      responseType: "multiChoice" as const,
      psych: question.group,
      selectedOptionMeta: answer.resultSignal,
      selectedOptionLabel: answer.text,
      answerId: answer.id,
    };
  });

  const scoreInput = {
    ...rawScoreMaps,
    responses: canonicalResponses,
    swipeTimes,
    averageSwipeTime,
    currentDifficulty: averageSwipeTime < 2 ? "hard" as const : averageSwipeTime < 5 ? "medium" as const : "easy" as const,
    engagement: canonicalResponses.length,
    wildcardBoost: false,
    criticalWildcard: rawScoreMaps.mbti.T >= rawScoreMaps.mbti.F && rawScoreMaps.bigFive.O > 0 ? 1 : 0,
    firstPrinciplesWildcard: rawScoreMaps.mbti.N >= rawScoreMaps.mbti.S && rawScoreMaps.bigFive.O > 0 ? 1 : 0,
    hybridTypes: [],
    quizVersion: "shortform-v2-fixed-28",
    questionDatabase: "shortformV2Questions.ts",
    deterministicResult: true,
  };

  return calibrateShortformV2Scores(scoreInput) as ScoresData;
}

async function persistResultDTOSafely(result: ResultDTO): Promise<
  | { ok: true; resultId: string; persistenceAttemptId: string; created: boolean; result: ResultDTO }
  | { ok: false; resultId: null; persistenceAttemptId: string; error: string; created: false }
> {
  const persistenceAttemptId = `persist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    return await persistResultDTO(result, persistenceAttemptId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown persistence error";
    console.warn("[POST /api/results/compute] persistence unavailable; returning deterministic DTO fallback", {
      persistenceAttemptId,
      error: message,
    });
    return { ok: false, resultId: null, persistenceAttemptId, error: message, created: false };
  }
}

async function persistResultDTO(result: ResultDTO, persistenceAttemptId: string): Promise<{ ok: true; resultId: string; persistenceAttemptId: string; created: boolean; result: ResultDTO }> {
  const supabase = getSupabaseAdmin();

  // Ensure the session exists without resetting an already-recorded server start.
  // Direct/API callers that bypass the browser start endpoint retain a null start
  // rather than receiving a fabricated duration.
  const { error: sessionError } = await supabase
    .from("quiz_sessions")
    .upsert({
      id: result.meta.sessionId,
      user_id: result.meta.userId,
      tier: result.raw.tier,
      mood: result.raw.mood ?? "neutral",
      fun_mode: result.raw.funMode ?? false,
      landmark: result.raw.locality?.landmark ?? null,
      theme: result.raw.locality?.theme ?? "compass",
    }, { onConflict: "id", ignoreDuplicates: true });

  if (sessionError) {
    console.error("[POST /api/results/compute] quiz_sessions upsert failed", { persistenceAttemptId, error: sessionError });
    throw new Error(`Failed to persist quiz session: ${sessionError.message}`);
  }

  const { data: sessionRecord, error: sessionLookupError } = await supabase
    .from("quiz_sessions")
    .select("started_at")
    .eq("id", result.meta.sessionId)
    .maybeSingle();
  if (sessionLookupError) {
    throw new Error(`Failed to retrieve quiz session timing: ${sessionLookupError.message}`);
  }

  // Idempotency guard: a browser retry must not create another result for the
  // same completion session. The database still needs a unique session_id
  // constraint to close the concurrent-write race; keep this server guard in
  // place regardless so ordinary retries are safe.
  const { data: existingResult, error: existingResultError } = await supabase
    .from("quiz_results")
    .select("id, responses")
    .eq("session_id", result.meta.sessionId)
    .maybeSingle();

  if (existingResultError) {
    throw new Error(`Failed to check existing quiz result: ${existingResultError.message}`);
  }
  if (existingResult) {
    return {
      ok: true,
      resultId: existingResult.id,
      persistenceAttemptId,
      created: false,
      result: readPersistedResultDTO(existingResult.responses, existingResult.id),
    };
  }

  // The DTO is canonical; these reporting columns are server-derived snapshots
  // for admin exports and analysis, never browser-controlled score inputs.
  const reportingProjection = buildQuizResultReportingProjection(result);
  const completedAt = new Date().toISOString();
  const startedAt = sessionRecord?.started_at ?? null;
  const quizDurationSeconds = startedAt
    ? Math.max(0, Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 1000))
    : null;
  const { error: resultError } = await supabase
    .from("quiz_results")
    .insert({
      id: result.meta.resultId,
      user_id: result.meta.userId,
      session_id: result.meta.sessionId,
      created_at: result.meta.createdAt,
      updated_at: completedAt,
      quiz_started_at: startedAt,
      quiz_completed_at: completedAt,
      quiz_duration_seconds: quizDurationSeconds,
      deleted: false,
      ...reportingProjection,
      responses: {
        raw: result.raw.responses,
        dto: result,
        dto_schema_version: result.version.schemaVersion,
      },
    });

  if (resultError) {
    // Two canonical completion requests can both pass the pre-insert lookup.
    // The unique partial index is the final arbiter; if it selects another
    // request as the winner, return that canonical result instead of exposing
    // a misleading persistence fallback to the losing caller.
    const lostConcurrentInsertRace = resultError.code === "23505"
      && resultError.message.includes("quiz_results_one_result_per_session_idx");

    if (lostConcurrentInsertRace) {
      const { data: racedResult, error: racedResultError } = await supabase
        .from("quiz_results")
        .select("id, responses")
        .eq("session_id", result.meta.sessionId)
        .maybeSingle();

      if (racedResultError) {
        throw new Error(`Failed to retrieve concurrently persisted quiz result: ${racedResultError.message}`);
      }
      if (racedResult) {
        return {
          ok: true,
          resultId: racedResult.id,
          persistenceAttemptId,
          created: false,
          result: readPersistedResultDTO(racedResult.responses, racedResult.id),
        };
      }
    }

    console.error("[POST /api/results/compute] quiz_results insert failed", { persistenceAttemptId, error: resultError });
    throw new Error(`Failed to persist quiz result: ${resultError.message}`);
  }

  const { error: completionSessionError } = await supabase
    .from("quiz_sessions")
    .update({ completed_at: completedAt })
    .eq("id", result.meta.sessionId);
  if (completionSessionError) {
    // The immutable result already carries the completion timestamp. Do not turn
    // a successful result into a client-visible failure over a redundant session
    // lifecycle projection; retain the server log for operational follow-up.
    console.error("[POST /api/results/compute] quiz session completion update failed", { persistenceAttemptId, error: completionSessionError });
  }

  return { ok: true, resultId: result.meta.resultId, persistenceAttemptId, created: true, result };
}

function readPersistedResultDTO(responses: unknown, resultId: string): ResultDTO {
  return readPersistedQuizResultDTO({ id: resultId, responses });
}

async function issueAnonymousCapability(sessionId: string): Promise<{ token: string; expiresAt: string } | null> {
  const capability = createAnonymousCapability();
  const { error } = await getSupabaseAdmin()
    .from("anonymous_result_capabilities")
    .insert({ session_id: sessionId, token_hash: capability.tokenHash, expires_at: capability.expiresAt });
  if (!error) return capability;
  // A concurrent retry can win result creation but lose capability creation; the
  // original response already received the only raw capability, so never rotate it.
  if (error.code === "23505") return null;
  throw new Error(`Failed to issue anonymous deletion capability: ${error.message}`);
}

function normalizeSource(value: unknown): BuildResultDTOInput["source"] {
  return value === "dev_test" || value === "randomized_preview" || value === "imported" || value === "admin_seed" || value === "live_quiz"
    ? value
    : "live_quiz";
}

function normalizeVisibility(value: unknown, userId: unknown): BuildResultDTOInput["visibility"] {
  if (value === "premium" || value === "admin" || value === "authenticated" || value === "anonymous") return value;
  return typeof userId === "string" && userId ? "authenticated" : "anonymous";
}
