import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import {
  anonymousResultRetentionCutoff,
  purgeExpiredAnonymousResults,
  selectAnonymousFitFeedbackForPurge,
  type AnonymousFitFeedbackForPurge,
  type AnonymousSessionForPurge,
} from "@/lib/privacy/retentionPolicy";

export const dynamic = "force-dynamic";

const PAGE = 500;

type SessionRow = { id: string; user_id: string | null; created_at: string };
type ResultRow = { session_id: string | null };
type FitFeedbackRow = { id: string; user_id: string | null; created_at: string };

function isMissingFitFeedbackTable(error: { code?: string; message?: string }) {
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const message = error.message ?? "";
  return message.includes("result_fit_feedback") && /does not exist|schema cache/i.test(message);
}

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Sessions older than the shared retention constant.
 * Ownership is enforced again inside delete_anonymous_result_data, the same
 * lock the on-request delete uses, so an account-linked row is left in place.
 */
async function listExpiredAnonymousSessions(now: Date): Promise<AnonymousSessionForPurge[]> {
  const supabase = getSupabaseAdmin();
  const cutoff = anonymousResultRetentionCutoff(now).toISOString();
  const sessions: SessionRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("quiz_sessions")
      .select("id, user_id, created_at")
      .is("user_id", null)
      .lt("created_at", cutoff)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as SessionRow[];
    sessions.push(...page);
    if (page.length < PAGE) break;
  }

  const resultCounts = new Map<string, number>();
  const ids = sessions.map((session) => session.id);
  for (let index = 0; index < ids.length; index += 100) {
    const chunk = ids.slice(index, index + 100);
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("session_id")
        .in("session_id", chunk)
        .is("user_id", null)
        .range(from, from + 999);
      if (error) throw new Error(error.message);
      const page = (data ?? []) as ResultRow[];
      for (const row of page) {
        if (!row.session_id) continue;
        resultCounts.set(row.session_id, (resultCounts.get(row.session_id) ?? 0) + 1);
      }
      if (page.length < 1000) break;
    }
  }

  return sessions.map((session) => ({
    id: session.id,
    userId: session.user_id,
    createdAt: session.created_at,
    ownedByUser: false,
    anonymousResultCount: resultCounts.get(session.id) ?? 0,
  }));
}

/**
 * Anonymous fit notes older than the shared retention window.
 * delete_anonymous_result_data already removes notes with the result. This
 * sweep also removes orphaned anonymous notes once they are 30 days old.
 * A missing table means the migration is not applied yet; result purge continues.
 */
async function purgeAgedAnonymousFitFeedback(now: Date): Promise<number> {
  const supabase = getSupabaseAdmin();
  const cutoff = anonymousResultRetentionCutoff(now).toISOString();
  const rows: AnonymousFitFeedbackForPurge[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("result_fit_feedback")
      .select("id, user_id, created_at")
      .is("user_id", null)
      .lt("created_at", cutoff)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      if (isMissingFitFeedbackTable(error)) {
        console.warn("[anonymous retention purge] result_fit_feedback is not available yet");
        return 0;
      }
      throw new Error(error.message);
    }
    const page = (data ?? []) as FitFeedbackRow[];
    rows.push(...page.map((row) => ({ id: row.id, userId: row.user_id, createdAt: row.created_at })));
    if (page.length < PAGE) break;
  }

  const selected = selectAnonymousFitFeedbackForPurge(rows, now);
  for (let index = 0; index < selected.length; index += 100) {
    const ids = selected.slice(index, index + 100).map((row) => row.id);
    if (ids.length === 0) continue;
    const { error } = await supabase.from("result_fit_feedback").delete().in("id", ids);
    if (error) throw new Error(error.message);
  }
  return selected.length;
}

export async function GET(req: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!configuredSecret || authorization !== `Bearer ${configuredSecret}`) {
    return noStore({ error: "Unauthorized" }, 401);
  }
  try {
    const now = new Date();
    const rows = await listExpiredAnonymousSessions(now);
    const supabase = getSupabaseAdmin();
    const purge = await purgeExpiredAnonymousResults(rows, async (id) => {
      const { data, error } = await supabase.rpc("delete_anonymous_result_data", { p_session_id: id });
      if (error) throw new Error(error.message);
      return data === true;
    }, now);
    const deletedFitFeedback = await purgeAgedAnonymousFitFeedback(now);
    return noStore({ success: true, purge: [purge], deleted_fit_feedback: deletedFitFeedback });
  } catch (error) {
    console.error("[anonymous retention purge] failed", error);
    return noStore({ error: "Purge failed" }, 500);
  }
}
