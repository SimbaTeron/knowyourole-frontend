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
  "24:C": { mbti: { J: -3, P: 1 }, disc: { C: -1, D: 1 }, bigFive: { C: -2, N: 1 }, career: { stability: -3, operations: -2, handsOn: 3 } },
  "24:D": { mbti: { N: 1 }, disc: { D: -2, I: 1 }, bigFive: { O: 2 }, career: { pace: -3, entrepreneurship: -2, creative: 3 } },
  // De-stack S+J on "reliable default" options
  "4:A": { mbti: { J: -1 } },
  "6:A": { mbti: { J: -1 } },
  "7:A": { mbti: { S: -1, J: -1 } },
  "9:A": { mbti: { S: -1 } },
  "10:A": { mbti: { S: -1, J: -1 } },
};

/** Explicit stress picks: pressure scatter / reassurance, conflict anti-fit, sting from feedback, harmony-first conflict. */
export const V5_STRESS_PICKS = ["15:C", "15:D", "28:C", "16:B", "14:C"];

export function countStressPicks(responses: ReadonlyArray<Resp>): number {
  const chosen = new Set(responses.map((r) => `${r.questionId}:${LETTER[r.choice]}`));
  return V5_STRESS_PICKS.filter((k) => chosen.has(k)).length;
}

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
  const picks = countStressPicks(responses);
  const out = { ...bigFive };
  if (picks <= 1) out.N = Math.min(out.N, 60);
  else if (picks >= 3) out.N = Math.max(out.N, 67);
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
