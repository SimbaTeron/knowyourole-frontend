/**
 * Scoring v5: 30-question bank (Q29 free-class pick, Q30 life stage).
 *
 * Trait weights for Q1–Q28 in the bank are unchanged, so v4 results re-derive exactly.
 * v5 tuning lives here as small deltas on chosen options:
 *  - Q24 now asks about the place you'd like to work (workshop / studio), so the old
 *    "stable routine" (J/C) and "dynamic urgency" (D/pace) weights are corrected.
 *  - "Reliable default" options no longer stack S and J together (ISTJ over-representation).
 *  - Stress Reactivity needs at least two explicit stress picks to read as high, and
 *    two or more explicit picks keep it visible for calm-on-the-outside achievers.
 */
import type { ScoresData } from "@/lib/scoring";
import { applyV3RawDeltas, computeV3RawDeltas, V3_ALL } from "@/lib/quiz/shortformV3Adjustments";
import { applyV4OptionRemaps } from "@/lib/quiz/shortformV4Adjustments";

type Maps = { mbti: Record<string, number>; disc: Record<string, number>; bigFive: Record<string, number>; career: Record<string, number> };
type Resp = { questionId: number; choice: 0 | 1 | 2 | 3 };
type FamilyDelta = Partial<Record<keyof Maps, Record<string, number>>>;

const LETTER = ["A", "B", "C", "D"] as const;

/** Questions whose meaning changed in v5; legacy v3/v4 option rules must not fire on them. */
const V5_LEGACY_EXCLUDED = new Set([24, 29, 30]);

export const V5_OPTION_DELTAS: Record<string, FamilyDelta> = {
  // Q24 meaning change
  "24:C": { mbti: { J: -3 }, disc: { C: -1 }, bigFive: { C: -2, N: 1 }, career: { stability: -3, operations: -2, handsOn: 3 } },
  // Hands-on work picks shouldn't make people bossy (D) or spontaneous (P) by themselves (ISTP / D skew)
  "22:C": { disc: { D: -1 } },
  "23:C": { disc: { D: -1 } },
  // "Fast pace, clear stakes" is a pace preference more than a take-charge style
  "19:A": { disc: { D: -2, I: 1 } },
  // Ambition ("reaching big goals") is not the same as a take-charge style
  "25:C": { disc: { D: -2 } },
  // Q15C now says "I start to worry and want to talk it through" (explicit stress); undo v4's N trim
  "15:C": { bigFive: { N: 1 } },
  "24:D": { mbti: { N: 1 }, disc: { D: -2, I: 1 }, bigFive: { O: 2 }, career: { pace: -3, entrepreneurship: -2, creative: 3 } },
  // De-stack S+J on "reliable default" options
  "4:A": { mbti: { J: -1 } },
  "6:A": { mbti: { J: -1 } },
  "7:A": { mbti: { S: -1, J: -1 } },
  "9:A": { mbti: { S: -1 } },
  "10:A": { mbti: { S: -1, J: -1 } },
};

/**
 * Stress evidence, weighted. Only Q15C ("I start to worry...") and Q15D ("I feel scattered...")
 * say it outright; the others hint at it (feedback stings, conflict drains, harmony first).
 */
// 15C ("I start to worry") is the one explicit stress answer. 15D ("scattered unless I can simplify")
// is about overload/organisation, so it only counts as a hint. 20B is perfectionism ("handing in
// imperfect work feels bad").
export const V5_STRESS_WEIGHTS: Record<string, number> = { "15:C": 1, "15:D": 0.5, "16:B": 0.5, "28:C": 0.5, "20:B": 0.5, "14:C": 0.25 };
/** Kept for callers that only need the explicit-pick list. */
export const V5_STRESS_PICKS = Object.keys(V5_STRESS_WEIGHTS);

export function stressEvidence(responses: ReadonlyArray<Resp>): number {
  const chosen = new Set(responses.map((r) => `${r.questionId}:${LETTER[r.choice]}`));
  return Object.entries(V5_STRESS_WEIGHTS).reduce((sum, [k, w]) => sum + (chosen.has(k) ? w : 0), 0);
}

export function countStressPicks(responses: ReadonlyArray<Resp>): number {
  const chosen = new Set(responses.map((r) => `${r.questionId}:${LETTER[r.choice]}`));
  return V5_STRESS_PICKS.filter((k) => chosen.has(k)).length;
}

/** Score at or above which Stress Reactivity is called out on the main result. */
export const V5_STRESS_SHOW = 64;

/** Raw maps -> v5 raw maps (before calibration). */
export function applyV5Raw<T extends Maps>(raw: T, responses: ReadonlyArray<Resp>): T {
  const legacy = responses.filter((r) => !V5_LEGACY_EXCLUDED.has(r.questionId));
  let maps = applyV3RawDeltas(
    { mbti: { ...raw.mbti }, disc: { ...raw.disc }, bigFive: { ...raw.bigFive }, career: { ...raw.career } },
    computeV3RawDeltas(legacy, V3_ALL),
  ) as Maps;
  maps = applyV4OptionRemaps({ ...maps, career: { ...raw.career } }, legacy);
  // v5: halve the conditional Q20B stress bump from v4.1 (+2 -> +1)
  const chosen = new Set(responses.map((r) => `${r.questionId}:${LETTER[r.choice]}`));
  if (chosen.has("15:D") && chosen.has("20:B")) maps.bigFive.N = (maps.bigFive.N || 0) - 1;
  for (const key of chosen) {
    const d = V5_OPTION_DELTAS[key];
    if (!d) continue;
    for (const fam of ["mbti", "disc", "bigFive", "career"] as const) {
      for (const [k, v] of Object.entries(d[fam] || {})) maps[fam][k] = (maps[fam][k] || 0) + v;
    }
  }
  return { ...raw, ...maps };
}

/** After calibration: gate Stress Reactivity on explicit evidence. */
export function applyV5StressGate(bigFive: Record<string, number>, responses: ReadonlyArray<Resp>): Record<string, number> {
  const w = stressEvidence(responses);
  const chosen = new Set(responses.map((r) => `${r.questionId}:${LETTER[r.choice]}`));
  const explicit = chosen.has("15:C");
  const out = { ...bigFive };
  const others = Math.max(out.O ?? 0, out.C ?? 0, out.E ?? 0, out.A ?? 0);
  if (w < 0.75) {
    // No real stress evidence: keep it low and never the headline trait.
    out.N = Math.min(out.N, 45, others - 6);
  } else if (!explicit) {
    // Only hints (feedback stings, conflict drains): moderate at most.
    out.N = Math.max(35, Math.min(out.N, 58, others - 3));
  } else if (w >= 1.5) {
    out.N = Math.max(out.N, 67);
  } else {
    // One explicit stress answer: noticeable, not dominant.
    out.N = Math.min(Math.max(out.N, V5_STRESS_SHOW), 70);
  }
  if (explicit && w < 2.5) {
    // Stress shows as a second signal, but only overwhelming evidence makes it the headline trait.
    out.N = Math.min(out.N, others - 1);
  }
  out.N = Math.max(15, Math.min(85, Math.round(out.N)));
  return out;
}

/** Life stage from Q30 (A middle school, B high school, C college/training, D working/other). */
export type LifeStage = "middle" | "high" | "college" | "adult" | "unknown";
export function lifeStageFromResponses(responses: ReadonlyArray<{ questionId?: unknown; choice?: unknown }> | null | undefined, tier?: string): LifeStage {
  const r = (responses ?? []).find((x) => x?.questionId === 30);
  if (r && typeof r.choice === "number") return (["middle", "high", "college", "adult"] as const)[r.choice] ?? "unknown";
  if (tier === "13-18") return "high";
  return "unknown";
}

export function isV5Response(responses: ReadonlyArray<{ questionId?: unknown }> | null | undefined): boolean {
  return (responses ?? []).some((r) => r?.questionId === 30 || r?.questionId === 29);
}

export type { ScoresData };
