/**
 * v5 clarity on top of v4.1.
 *
 * Two separate, honest signals:
 *  - Speed (soft): answer timing comes from the browser, so it is sanity-checked and can
 *    only ever soften a result. Speed alone never makes a result Broad; it adds a note.
 *    Very fast AND uneven answers (low agreement) are treated as a rough sketch (Broad).
 *  - Scattered (answer content): see scatterV5.ts. Picking both sides of the same
 *    explicit opposite 3+ times caps the result at Mixed; random-like answering is Broad.
 *  - Broad for "flat" profiles only: every Big Five trait close together.
 */
import { adjustClarityV41, type InconsistencyReport } from "@/lib/quiz/inconsistencyDetect";
import { scatterCheckV5, type ScatterV5 } from "@/lib/quiz/scatterV5";
import { deriveV5LaneScores } from "@/lib/results/workDirectionV5";

export type ClarityLevel = "clear" | "mixed" | "broad";
type Resp = { questionId?: unknown; choice?: unknown; timeSpent?: unknown };

const AXES: Array<[string, string]> = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];

export const V5_FAST_NOTE = "You answered very quickly. If you skimmed some questions, try again when you have about 5 minutes for a sharper result.";
export const V5_FAST_UNEVEN_NOTE = "You answered very quickly and some answers didn't line up, so this is only a rough sketch. Try again when you have about 5 minutes.";
export const V5_SCATTERED_NOTE = "Some of your answers pointed in opposite directions (for example, both wanting clear rules and wanting no rules). Treat this as a rough sketch, not a label.";
export const V5_RANDOM_NOTE = "Your answers didn't form a clear pattern, so this is only a rough sketch. Try again when you can answer slowly and honestly.";
/** Back-compat export. */
export const V5_QUICK_NOTE = V5_FAST_UNEVEN_NOTE;

/** Median seconds per answer, or null when timing is missing or implausible (never trusted blindly). */
export function medianSeconds(responses: ReadonlyArray<Resp> | null | undefined): number | null {
  const all = (responses ?? []).map((r) => Number(r?.timeSpent));
  const t = all.filter((n) => Number.isFinite(n) && n >= 0.2 && n <= 600).sort((a, b) => a - b);
  if (t.length < 24 || t.length < all.length * 0.8) return null;
  // Scripted or broken timers report the same value for everything: ignore.
  const distinct = new Set(t.map((n) => Math.round(n * 10))).size;
  if (distinct <= 2 && t.length >= 24) return null;
  return t[Math.floor(t.length / 2)];
}

/** Very fast = under ~1.2 s per question on median (too fast to read most questions). */
export const V5_FAST_MEDIAN_SECONDS = 1.2;

/** "Flat" = all five traits within a narrow band (spread-based, not a fixed 38–61 window). */
export function isFlatProfile(bigFive: Record<string, number>, career?: Partial<Record<string, number>> | null): boolean {
  const vals = ["O", "C", "E", "A", "N"].map((k) => Number(bigFive[k]) || 0);
  const top = Math.max(...vals);
  const bottom = Math.min(...vals);
  if (top - bottom <= 14) return true;
  // Mid-range traits only count as "flat" when the work answers are flat too
  // (hands-on people often have mid-range traits but a very clear work pull).
  if (career && top <= 60 && top - bottom <= 26) {
    const lanes = Object.values(deriveV5LaneScores(career)).sort((a, b) => b - a);
    return lanes[0] < 50 || lanes[0] - lanes[1] <= 8;
  }
  return false;
}

export type ClarityV5Result = {
  level: ClarityLevel;
  /** Kept for callers: true when the note is a "rough sketch" (fast+uneven, random, or scattered). */
  quickOrScattered: boolean;
  fast: boolean;
  scattered: boolean;
  randomLike: boolean;
  /** Broad because the profile is genuinely flat (vs. random / fast-and-uneven). */
  flat: boolean;
  note: string;
  scatter: ScatterV5;
};

export function adjustClarityV5(
  level: ClarityLevel,
  report: InconsistencyReport,
  bigFive: Record<string, number>,
  rawMbti: Record<string, number> | undefined,
  responses?: ReadonlyArray<Resp> | null,
  career?: Partial<Record<string, number>> | null,
): ClarityV5Result {
  const evidence = (responses ?? [])
    .filter((r) => typeof r?.questionId === "number" && typeof r?.choice === "number")
    .map((r) => ({ questionId: r.questionId as number, choice: r.choice as 0 | 1 | 2 | 3 }));
  const scatter = scatterCheckV5(evidence, report.meanCoherence);
  const median = medianSeconds(responses);
  const fast = median !== null && median < V5_FAST_MEDIAN_SECONDS;
  // Strict on purpose: most honest answer sets look a bit uneven, and speed must stay a soft signal.
  const uneven = scatter.meanCoherence < 0.25 && scatter.agreement < 0.03;

  // Start from v4.1, but v4.1's old "flagged" contradiction rule is replaced by scatterV5.
  let next = adjustClarityV41(level, { ...report, flagged: false }, bigFive, rawMbti);
  // v4.1 sends many consistent answerers to Broad on raw coherence alone; v5 only uses "flat".
  const flat = isFlatProfile(bigFive, career);
  if (next === "broad" && level !== "broad" && !flat) next = "mixed";

  const vals = ["O", "C", "E", "A", "N"].map((k) => Number(bigFive[k]) || 0);
  const top = Math.max(...vals);

  if (flat) next = "broad";
  else if (next === "broad") next = "mixed";

  if (next === "mixed" && !report.guarded && !scatter.contradictory && rawMbti) {
    const coherence = AXES.map(([a, b]) => Math.abs((rawMbti[a] ?? 0) - (rawMbti[b] ?? 0)) / Math.max(1, (rawMbti[a] ?? 0) + (rawMbti[b] ?? 0)));
    const nearEven = coherence.filter((c) => c < 0.25).length;
    const sorted = [...vals].sort((a, b) => b - a);
    // Clear when the type is consistent and one trait stands out (strongly, or clearly ahead of the rest).
    // Work answers that point one way very clearly also make the overall result clear.
    let workClear = false;
    if (career) {
      const lanes = Object.values(deriveV5LaneScores(career)).sort((x, y) => y - x);
      workClear = lanes[0] >= 70 && lanes[0] - lanes[1] >= 15;
    }
    if (
      (nearEven <= 1 && top >= 64) ||
      (nearEven === 0 && top >= 56 && sorted[0] - sorted[1] >= 6) ||
      (top >= 70 && sorted[0] - sorted[1] >= 10) ||
      (nearEven <= 1 && workClear)
    ) next = "clear";
  }

  let note = "";
  let roughSketch = false;
  if (scatter.randomLike) {
    next = "broad";
    note = V5_RANDOM_NOTE;
    roughSketch = true;
  } else if (fast && (uneven || scatter.contradictory)) {
    next = "broad";
    note = V5_FAST_UNEVEN_NOTE;
    roughSketch = true;
  } else if (scatter.contradictory) {
    if (next === "clear") next = "mixed";
    note = V5_SCATTERED_NOTE;
    roughSketch = true;
  } else if (fast) {
    // Speed alone: soft note only, the result is not downgraded.
    note = V5_FAST_NOTE;
  }

  return { level: next, quickOrScattered: roughSketch, fast, scattered: scatter.contradictory, randomLike: scatter.randomLike, flat, note, scatter };
}
