import { NextRequest } from "next/server";
import { canAccessResult } from "@/app/api/_lib/anonymous-result-capability";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { getAppOrigin, jsonResponse } from "@/app/api/_lib/security";
import { readPersistedQuizResultDTO } from "@/lib/results/persistedQuizResult";
import {
  RESULT_FIT_MAX_BYTES,
  buildResultFitFeedbackRow,
  consumeResultFitRate,
  parseResultFitFeedbackRequest,
  planResultFitWrite,
  resultFitLinkFromDto,
  resultFitRateKey,
  type ExistingResultFit,
  type ResultFitLink,
  type ResultFitRating,
  type ResultFitWritePlan,
  type StoredResultFit,
} from "@/lib/feedback/resultFitFeedback";

export const dynamic = "force-dynamic";

type FitResultRecord = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  responses: unknown;
  deleted: boolean | null;
};

export type ResultFitDeps = {
  findResult: (resultId: string) => Promise<
    | { ok: true; row: FitResultRecord }
    | { ok: false; status: 404 | 409 | 503 }
  >;
  canAccess: (req: NextRequest, result: { user_id: string | null; session_id: string | null }) => Promise<boolean>;
  readLink: (row: FitResultRecord) => ResultFitLink | null;
  loadExisting: (resultId: string) => Promise<ExistingResultFit | null | "error">;
  save: (plan: Extract<ResultFitWritePlan, { action: "insert" | "update" }>) => Promise<
    | { ok: true; id: string }
    | { ok: false; conflict?: boolean }
  >;
};

function isStoredFit(value: unknown): value is StoredResultFit {
  return value === "yes" || value === "somewhat" || value === "no";
}

function isRating(value: unknown): value is ResultFitRating {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function existingFromRow(data: { id: string; fit: unknown; rating: number | null; comment: string | null }): ExistingResultFit | "error" {
  if (!isStoredFit(data.fit)) return "error";
  if (data.rating != null && !isRating(data.rating)) return "error";
  return { id: data.id, fit: data.fit, rating: data.rating, comment: data.comment };
}

function defaultDeps(): ResultFitDeps {
  return {
    async findResult(resultId) {
      const { data, error } = await getSupabaseAdmin()
        .from("quiz_results")
        .select("id, user_id, session_id, responses, deleted")
        .eq("id", resultId)
        .maybeSingle();
      if (error) {
        console.error("[POST /api/results/fit-feedback] result lookup failed", error.code);
        return { ok: false, status: 503 };
      }
      if (!data || data.deleted) return { ok: false, status: 404 };
      return { ok: true, row: data as FitResultRecord };
    },
    canAccess: canAccessResult,
    readLink(row) {
      try {
        return resultFitLinkFromDto(readPersistedQuizResultDTO(row));
      } catch (error) {
        console.error("[POST /api/results/fit-feedback] invalid persisted result", error instanceof Error ? error.name : "error");
        return null;
      }
    },
    async loadExisting(resultId) {
      const { data, error } = await getSupabaseAdmin()
        .from("result_fit_feedback")
        .select("id, fit, rating, comment")
        .eq("result_id", resultId)
        .maybeSingle();
      if (error) {
        console.error("[POST /api/results/fit-feedback] existing lookup failed", error.code);
        return "error";
      }
      if (!data) return null;
      return existingFromRow(data);
    },
    async save(plan) {
      const supabase = getSupabaseAdmin();
      if (plan.action === "insert") {
        const { data, error } = await supabase
          .from("result_fit_feedback")
          .insert(plan.row)
          .select("id")
          .maybeSingle();
        if (!error && data) return { ok: true, id: data.id };
        if (error?.code !== "23505") {
          console.error("[POST /api/results/fit-feedback] insert failed", error?.code);
          return { ok: false };
        }
        const { data: raced, error: racedError } = await supabase
          .from("result_fit_feedback")
          .select("id, fit, rating, comment")
          .eq("result_id", plan.row.result_id)
          .maybeSingle();
        if (racedError || !raced) return { ok: false };
        const existing = existingFromRow(raced);
        if (existing === "error") return { ok: false };
        const retry = planResultFitWrite(existing, plan.row);
        if (retry.action === "conflict") return { ok: false, conflict: true };
        if (retry.action === "noop") return { ok: true, id: existing.id };
        return defaultDeps().save(retry);
      }
      const { data, error } = await supabase
        .from("result_fit_feedback")
        .update({ rating: plan.rating, comment: plan.comment, updated_at: new Date().toISOString() })
        .eq("result_id", plan.resultId)
        .eq("fit", plan.fit)
        .select("id")
        .maybeSingle();
      if (error) {
        console.error("[POST /api/results/fit-feedback] update failed", error.code);
        return { ok: false };
      }
      if (!data) return { ok: false, conflict: true };
      return { ok: true, id: data.id };
    },
  };
}

export async function postResultFitFeedback(req: NextRequest, deps?: ResultFitDeps) {
  const origin = req.headers.get("origin");
  if (origin && origin !== getAppOrigin(req)) {
    return jsonResponse({ success: false, error: "Invalid request origin" }, { status: 403 });
  }
  if (consumeResultFitRate(resultFitRateKey(req.headers))) {
    return jsonResponse({ success: false, error: "Please wait a moment before trying again." }, { status: 429 });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > RESULT_FIT_MAX_BYTES) {
    return jsonResponse({ success: false, error: "Feedback payload is too large" }, { status: 413 });
  }

  const raw = await req.text();
  if (raw.length > RESULT_FIT_MAX_BYTES) {
    return jsonResponse({ success: false, error: "Feedback payload is too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonResponse({ success: false, error: "Invalid feedback payload" }, { status: 400 });
  }

  const parsed = parseResultFitFeedbackRequest(body);
  if (!parsed.ok) {
    return jsonResponse({ success: false, error: "Invalid feedback payload" }, { status: 400 });
  }

  const resolved = deps ?? defaultDeps();
  const found = await resolved.findResult(parsed.value.resultId);
  if (!found.ok) {
    const error = found.status === 404 ? "That result is unavailable" : found.status === 409 ? "That result is unavailable" : "Feedback is temporarily unavailable";
    return jsonResponse({ success: false, error }, { status: found.status });
  }
  if (!await resolved.canAccess(req, found.row)) {
    return jsonResponse({ success: false, error: "You do not have access to this result" }, { status: 403 });
  }

  const link = resolved.readLink(found.row);
  if (!link || !found.row.session_id || found.row.session_id !== link.sessionId) {
    return jsonResponse({ success: false, error: "That result is unavailable" }, { status: 409 });
  }

  const row = buildResultFitFeedbackRow(parsed.value, { ...link, userId: found.row.user_id }, found.row.id);
  if (!row) {
    return jsonResponse({ success: false, error: "That result is unavailable" }, { status: 409 });
  }

  const existing = await resolved.loadExisting(found.row.id);
  if (existing === "error") {
    return jsonResponse({ success: false, error: "Feedback is temporarily unavailable" }, { status: 503 });
  }

  const plan = planResultFitWrite(existing, row);
  if (plan.action === "conflict") {
    return jsonResponse({ success: false, error: "That result already has a different answer." }, { status: 409 });
  }
  if (plan.action === "noop") {
    return jsonResponse({ success: true, id: existing?.id ?? null, alreadySubmitted: true });
  }

  const saved = await resolved.save(plan);
  if (!saved.ok && saved.conflict) {
    return jsonResponse({ success: false, error: "That result already has a different answer." }, { status: 409 });
  }
  if (!saved.ok) {
    return jsonResponse({ success: false, error: "Could not save feedback. Please try again." }, { status: 503 });
  }
  const created = plan.action === "insert";
  return jsonResponse(
    { success: true, id: saved.id, alreadySubmitted: !created },
    { status: created ? 201 : 200 },
  );
}

export async function POST(req: NextRequest) {
  return postResultFitFeedback(req);
}
