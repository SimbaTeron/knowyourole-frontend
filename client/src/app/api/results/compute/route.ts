import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { buildResultDTO, type BuildResultDTOInput, type ResultDTO } from "@/lib/results/buildResultDTO";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

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
        { status: 400, headers: corsHeaders },
      );
    }

    const input = normalizeComputeInput(body, req, requestId);
    const { result, validation } = buildResultDTO(input);

    if (!validation.ok) {
      console.warn("[POST /api/results/compute] validation failed", { requestId, errors: validation.errors });
      return NextResponse.json(
        { success: false, requestId, validation },
        { status: 422, headers: corsHeaders },
      );
    }

    const persistence = await persistResultDTO(result);
    const persistedResult: ResultDTO = {
      ...result,
      meta: {
        ...result.meta,
        resultId: persistence.resultId ?? result.meta.resultId,
        updatedAt: new Date().toISOString(),
      },
      audit: {
        ...result.audit,
        trace: {
          ...result.audit.trace,
          persistenceAttemptId: persistence.persistenceAttemptId,
        },
      },
    };

    return NextResponse.json(
      { success: true, requestId, result: persistedResult, validation, persistence },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("[POST /api/results/compute] fatal error", { requestId, error });
    return NextResponse.json(
      { success: false, requestId, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}

function normalizeComputeInput(body: unknown, req: NextRequest, requestId: string): BuildResultDTOInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be an object");
  }

  const b = body as Record<string, unknown>;
  const scores = (b.scores ?? b) as BuildResultDTOInput["scores"];

  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new Error("scores object is required");
  }

  return {
    scores,
    tier: typeof b.tier === "string" ? b.tier : undefined,
    mood: typeof b.mood === "string" ? b.mood : undefined,
    moodBlend: typeof b.moodBlend === "string" ? b.moodBlend : undefined,
    funMode: typeof b.funMode === "boolean" ? b.funMode : undefined,
    landmark: typeof b.landmark === "string" ? b.landmark : undefined,
    theme: typeof b.theme === "string" ? b.theme : undefined,
    sessionId: typeof b.sessionId === "string" ? b.sessionId : undefined,
    userId: typeof b.userId === "string" ? b.userId : null,
    source: normalizeSource(b.source),
    visibility: normalizeVisibility(b.visibility, b.userId),
    requestId,
    runtime: {
      environment: process.env.VERCEL_ENV === "production" ? "production" : process.env.VERCEL_ENV === "preview" ? "preview" : "local",
      domain: req.headers.get("host") ?? undefined,
      buildId: process.env.VERCEL_GIT_COMMIT_SHA ?? undefined,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? undefined,
    },
  };
}

async function persistResultDTO(result: ResultDTO): Promise<{ ok: true; resultId: string; persistenceAttemptId: string }> {
  const persistenceAttemptId = `persist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
      responses: {
        raw: result.raw.responses,
        dto: result,
        dto_schema_version: result.version.schemaVersion,
      },
    });

  if (resultError) {
    console.error("[POST /api/results/compute] quiz_results insert failed", { persistenceAttemptId, error: resultError });
    throw new Error(`Failed to persist quiz result: ${resultError.message}`);
  }

  return { ok: true, resultId: result.meta.resultId, persistenceAttemptId };
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
