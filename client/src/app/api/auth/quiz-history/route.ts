import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { summarizePersistedQuizResult, type PersistedQuizResultRow } from "@/lib/results/persistedQuizResult";

export const dynamic = "force-dynamic";

const RESULT_COLUMNS = "id,user_id,session_id,responses,created_at,updated_at,deleted";

interface HistoryResult {
  id: string;
  createdAt: string | null;
  mbtiType: string;
  discStyle: string;
  bigFive: { O: number; C: number; E: number; A: number; N: number };
  primaryRole: string | null;
  criticalThinking: number | null;
  firstPrinciples: number | null;
}

function calculateArcEvolution(results: HistoryResult[]): object | null {
  if (results.length < 2) return null;
  const sorted = [...results].sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const bigFiveShifts = (Object.keys(first.bigFive) as Array<keyof HistoryResult["bigFive"]>)
    .reduce<Record<string, number>>((changes, trait) => {
      const difference = last.bigFive[trait] - first.bigFive[trait];
      if (difference !== 0) changes[trait] = difference;
      return changes;
    }, {});
  return {
    mbtiEvolution: first.mbtiType !== last.mbtiType ? `${first.mbtiType} → ${last.mbtiType}` : null,
    discEvolution: first.discStyle !== last.discStyle ? `${first.discStyle} → ${last.discStyle}` : null,
    bigFiveShifts,
  };
}

export const GET = requireAuth(async (_req: NextRequest, ctx) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("quiz_results")
      .select(RESULT_COLUMNS)
      .eq("user_id", ctx.user.sub)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[quiz history] fetch failed", error);
      return NextResponse.json({ message: "Failed to fetch quiz history" }, { status: 500 });
    }

    const results = (data ?? []).flatMap((row) => {
      try {
        const summary = summarizePersistedQuizResult(row as PersistedQuizResultRow);
        if (summary.deleted) return [];
        return [{
          id: summary.id,
          createdAt: summary.createdAt,
          mbtiType: summary.mbtiType,
          discStyle: summary.discStyle,
          bigFive: summary.bigFive,
          primaryRole: summary.primaryRoleTitle,
          criticalThinking: summary.criticalThinking,
          firstPrinciples: summary.firstPrinciples,
        } satisfies HistoryResult];
      } catch (readError) {
        console.error("[quiz history] invalid canonical result", { id: row.id, error: readError });
        return [];
      }
    });

    return NextResponse.json({
      success: true,
      results,
      arcData: calculateArcEvolution(results),
      ...(results.length === 0 ? { message: "No quiz history found" } : {}),
    });
  } catch (error) {
    console.error("[quiz history] unexpected error", error);
    return NextResponse.json({ message: "Failed to fetch quiz history" }, { status: 500 });
  }
});
