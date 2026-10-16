/**
 * v5 clarity on top of v4.1:
 *  - Quick or scattered answering gets Broad plus a plain "retake" note (no confident headline).
 *  - Honest all-middle answers get Broad.
 *  - Consistent answerers with a clear lead trait get Clear more often.
 */
import { adjustClarityV41, type InconsistencyReport } from "@/lib/quiz/inconsistencyDetect";

export type ClarityLevel = "clear" | "mixed" | "broad";
type Resp = { questionId?: unknown; choice?: unknown; timeSpent?: unknown };

const AXES: Array<[string, string]> = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];

export const V5_QUICK_NOTE = "Your answers came in very fast or pointed in many directions, so this is only a rough sketch. Try again when you have about 5 minutes.";

export function medianSeconds(responses: ReadonlyArray<Resp> | null | undefined): number | null {
  const t = (responses ?? []).map((r) => Number(r?.timeSpent)).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (t.length < 20) return null;
  return t[Math.floor(t.length / 2)];
}

export function adjustClarityV5(
  level: ClarityLevel,
  report: InconsistencyReport,
  bigFive: Record<string, number>,
  rawMbti: Record<string, number> | undefined,
  responses?: ReadonlyArray<Resp> | null,
): { level: ClarityLevel; quickOrScattered: boolean; note: string } {
  let next = adjustClarityV41(level, report, bigFive, rawMbti);
  const median = medianSeconds(responses);
  const quick = median !== null && median < 1.6;
  const scattered = report.flagged && report.meanCoherence < 0.32;
  if (quick || scattered) return { level: "broad", quickOrScattered: true, note: V5_QUICK_NOTE };

  const vals = Object.values(bigFive).map((v) => Number(v) || 0);
  const top = Math.max(...vals);
  const bottom = Math.min(...vals);
  if (top <= 61 && bottom >= 38) next = "broad";

  if (next === "mixed" && !report.flagged && !report.guarded && rawMbti) {
    const coherence = AXES.map(([a, b]) => Math.abs((rawMbti[a] ?? 0) - (rawMbti[b] ?? 0)) / Math.max(1, (rawMbti[a] ?? 0) + (rawMbti[b] ?? 0)));
    const nearEven = coherence.filter((c) => c < 0.3).length;
    if (nearEven === 0 && top >= 64) next = "clear";
  }
  return { level: next, quickOrScattered: false, note: "" };
}
