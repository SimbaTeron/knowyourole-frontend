import type { IncomingMessage, ServerResponse } from "node:http";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { buildResultDTO, type BuildResultDTOInput, type ResultDTO } from "./buildResultDTO";

/**
 * Vite dev-server API shim for /api/results/* on localhost:5173.
 *
 * The production/Next implementation lives in src/app/api/results/*.
 * This shim exists only because the pure Vite dev server does not execute
 * Next App Router route handlers, so /api/results/* would otherwise 404.
 */

type JsonRecord = Record<string, unknown>;

type ViteApiResponse = {
  status: number;
  body: JsonRecord;
};

export async function handleViteResultsApi(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = req.method || "GET";
  const url = new URL(req.url || "/", "http://localhost:5173");

  setCorsHeaders(res);

  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    let response: ViteApiResponse;

    if (url.pathname === "/api/results/compute" && method === "POST") {
      response = await compute(await readJsonBody(req), req);
    } else if (url.pathname === "/api/results/smoke" && (method === "GET" || method === "POST")) {
      response = await smoke(req);
    } else {
      response = { status: 404, body: { success: false, error: "Unknown Vite results API route" } };
    }

    writeJson(res, response.status, response.body);
  } catch (error) {
    console.error("[Vite Results API] fatal error", error);
    writeJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : "Internal Vite results API error",
    });
  }
}

async function compute(body: unknown, req: IncomingMessage): Promise<ViteApiResponse> {
  const requestId = req.headers["x-request-id"]?.toString() || `vite-compute-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const input = normalizeComputeInput(body, req, requestId);
  const { result, validation } = buildResultDTO(input);

  console.log("[Vite Results API] /api/results/compute built ResultDTO", {
    requestId,
    valid: validation.ok,
    resultId: result.meta.resultId,
    sessionId: result.meta.sessionId,
  });

  if (!validation.ok) {
    return { status: 422, body: { success: false, requestId, validation } };
  }

  const persistence = await persistResultDTO(result);
  const persistedResult: ResultDTO = {
    ...result,
    meta: {
      ...result.meta,
      resultId: persistence.resultId,
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

  console.log("[Vite Results API] /api/results/compute persisted", {
    requestId,
    resultId: persistedResult.meta.resultId,
    sessionId: persistedResult.meta.sessionId,
  });

  return {
    status: 200,
    body: { success: true, requestId, result: persistedResult, validation, persistence },
  };
}

async function smoke(req: IncomingMessage): Promise<ViteApiResponse> {
  const host = req.headers.host || "localhost:5173";
  const sessionId = `vite-smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    tier: "19-25",
    mood: "focused",
    moodBlend: "focused+creative",
    funMode: false,
    landmark: "vite-local-smoke-test",
    theme: "dark",
    sessionId,
    source: "dev_test",
    scores: {
      mbti: { E: 5, I: 2, S: 2, N: 6, T: 6, F: 2, J: 3, P: 5 },
      disc: { D: 4, I: 3, S: 2, C: 5 },
      bigFive: { O: 6, C: 5, E: 4, A: 4, N: 2 },
      responses: [
        { questionId: 1, choice: 1, timeSpent: 2.1, swipeDirection: "right", psych: "MBTI_N" },
        { questionId: 2, choice: 0, timeSpent: 3.4, swipeDirection: "left", psych: "DISC_C" },
        { questionId: 3, choice: 1, timeSpent: 1.9, swipeDirection: "right", psych: "BIG5_O" },
      ],
      swipeTimes: [2.1, 3.4, 1.9],
      averageSwipeTime: 2.47,
      currentDifficulty: "medium",
      engagement: 3,
      wildcardBoost: false,
      criticalWildcard: 0,
      firstPrinciplesWildcard: 0,
      hybridTypes: [],
    },
  };

  console.log("[Vite Results Smoke] starting", { host, sessionId });
  const computed = await compute(payload, { ...req, headers: { ...req.headers, "x-request-id": sessionId } } as unknown as IncomingMessage);
  const body = computed.body as JsonRecord;
  const result = body.result as ResultDTO | undefined;

  console.log("[Vite Results Smoke] finished", {
    ok: computed.status >= 200 && computed.status < 300,
    resultId: result?.meta?.resultId,
    sessionId: result?.meta?.sessionId,
    validation: body.validation,
  });

  return {
    status: computed.status,
    body: {
      success: computed.status >= 200 && computed.status < 300,
      smoke: true,
      resultId: result?.meta?.resultId,
      sessionId: result?.meta?.sessionId,
      computeStatus: computed.status,
      compute: body,
    },
  };
}

function normalizeComputeInput(body: unknown, req: IncomingMessage, requestId: string): BuildResultDTOInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be an object");
  }

  const b = body as JsonRecord;
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
      environment: "local",
      domain: req.headers.host,
    },
  };
}

async function persistResultDTO(result: ResultDTO): Promise<{ ok: true; resultId: string; persistenceAttemptId: string }> {
  const persistenceAttemptId = `vite-persist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const supabase = getLocalSupabaseClient();

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
    console.error("[Vite Results API] quiz_sessions upsert failed", { persistenceAttemptId, error: sessionError });
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
    console.error("[Vite Results API] quiz_results insert failed", { persistenceAttemptId, error: resultError });
    throw new Error(`Failed to persist quiz result: ${resultError.message}`);
  }

  return { ok: true, resultId: result.meta.resultId, persistenceAttemptId };
}

function getLocalSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL is required for Vite results persistence");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY or Supabase anon key is required for Vite results persistence");

  // Prefer service role when available. Anon key still works for the current local
  // schema because quiz_sessions/quiz_results have permissive insert policies.
  return createClient(url, key, { auth: { persistSession: false } });
}

function normalizeSource(value: unknown): BuildResultDTOInput["source"] {
  return value === "dev_test" || value === "randomized_preview" || value === "imported" || value === "admin_seed" || value === "live_quiz" ? value : "live_quiz";
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

function setCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-request-id");
  res.setHeader("Content-Type", "application/json");
}

function writeJson(res: ServerResponse, status: number, body: JsonRecord) {
  res.statusCode = status;
  res.end(JSON.stringify(body, null, 2));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON body");
  }
}
