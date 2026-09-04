import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { getOptionalAuthUser } from "@/app/api/_lib/auth";
import { createAnonymousCapability } from "@/app/api/_lib/anonymous-result-capability";
import { buildResultDTO, validateResultDTO, type BuildResultDTOInput, type ResultDTO } from "@/lib/results/buildResultDTO";
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

  // Maintain the existing schema contract first: create/ensure quiz_sessions,
  // then insert quiz_results. The full canonical DTO is stored in responses.dto
  // until dedicated jsonb columns/migrations are added.
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
    }, { onConflict: "id" });

  if (sessionError) {
    console.error("[POST /api/results/compute] quiz_sessions upsert failed", { persistenceAttemptId, error: sessionError });
    throw new Error(`Failed to persist quiz session: ${sessionError.message}`);
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

  const now = new Date().toISOString();
  const primary = result.careerMatches[0];
  const secondary = result.careerMatches[1];
  const { error: resultError } = await supabase
    .from("quiz_results")
    .insert({
      id: result.meta.resultId,
      user_id: result.meta.userId,
      session_id: result.meta.sessionId,
      tier: result.raw.tier,
      mood: result.raw.mood ?? null,
      fun_mode: result.raw.funMode ?? false,
      landmark: result.raw.locality?.landmark ?? null,
      mbti_type: result.scores.mbti.type,
      mbti_blend: `${result.scores.mbti.type}-${result.scores.disc.primary}`,
      disc_style: result.scores.disc.primary,
      primary_role_title: primary?.title ?? null,
      secondary_role_title: secondary?.title ?? null,
      big_five_o: result.scores.bigFive.traits.O.normalized,
      big_five_c: result.scores.bigFive.traits.C.normalized,
      big_five_e: result.scores.bigFive.traits.E.normalized,
      big_five_a: result.scores.bigFive.traits.A.normalized,
      big_five_n: result.scores.bigFive.traits.N.normalized,
      critical_thinking: readNumericExtension(result, "criticalThinking"),
      first_principles: readNumericExtension(result, "firstPrinciples"),
      total_questions: result.audit.scoringAudit?.totalQuestions ?? result.raw.responses.length,
      avg_response_time: result.scores.adaptive.averageResponseTime ?? null,
      engagement_score: readNumericExtension(result, "engagement"),
      created_at: result.meta.createdAt,
      updated_at: now,
      deleted: false,
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

  return { ok: true, resultId: result.meta.resultId, persistenceAttemptId, created: true, result };
}

function readPersistedResultDTO(responses: unknown, resultId: string): ResultDTO {
  const dto = responses && typeof responses === "object" && !Array.isArray(responses)
    ? (responses as { dto?: unknown }).dto
    : undefined;
  const validation = validateResultDTO(dto);
  if (!validation.ok) {
    throw new Error(`Existing result ${resultId} does not contain a valid canonical DTO`);
  }
  return dto as ResultDTO;
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

function readNumericExtension(result: ResultDTO, key: "criticalThinking" | "firstPrinciples" | "engagement"): number | null {
  const legacy = result.scores.extensions?.legacyAdvanced as Record<string, unknown> | undefined;
  const value = legacy?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
