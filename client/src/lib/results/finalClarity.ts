/**
 * Single source of truth for the clarity shown on EVERY results view (main, Big Five tab,
 * decision brief, report). Display-only: reproduces scoring-v4.1 clarity from stored
 * scores + answer evidence; never changes scores.
 */
import { resolveResultClarityDisplay, type ResultClarityDisplay } from "@/lib/results/resultClarity";
import { isScoringV3, isScoringV4 } from "@/lib/quiz/scoringVersions";
import { detectInconsistency, adjustClarityV41, RESULT_CLARITY_COPY_V41, type InconsistencyReport } from "@/lib/quiz/inconsistencyDetect";
import { applyV4OptionRemaps } from "@/lib/quiz/shortformV4Adjustments";
import { recomputeShortformV2ScoreMaps } from "@/lib/quiz/shortformV2Scoring";
import { applyV3RawDeltas, computeV3RawDeltas, V3_ALL } from "@/lib/quiz/shortformV3Adjustments";

export type FinalClarityLevel = "clear" | "mixed" | "broad";
export type FinalClarity = {
  /** What every view must render. */
  display: ResultClarityDisplay;
  /** Final level (flat answer pattern keeps the underlying Big Five level). */
  level: FinalClarityLevel;
  report: InconsistencyReport | null;
  rawMbti?: Record<string, number>;
};

type Resp = { questionId?: unknown; choice?: unknown };

export function resolveFinalClarity(
  bigFive: Record<string, number>,
  responses: ReadonlyArray<Resp> | null | undefined,
  scoringVersion: string | null | undefined,
  maxCareer?: number,
): FinalClarity {
  const v3 = isScoringV3(scoringVersion);
  const base = resolveResultClarityDisplay(bigFive, responses as any, v3 ? { version: "v3", maxCareer } : {});
  let level = base.clarity.level as FinalClarityLevel;
  let display = base;
  let report: InconsistencyReport | null = null;
  let rawMbti: Record<string, number> | undefined;
  const evidence = (responses ?? [])
    .filter((r) => typeof r?.questionId === "number" && typeof r?.choice === "number")
    .map((r) => ({ questionId: r.questionId as number, choice: r.choice as 0 | 1 | 2 | 3 }));
  if (v3 && evidence.length >= 28) {
    try {
      rawMbti = applyV3RawDeltas(recomputeShortformV2ScoreMaps(evidence), computeV3RawDeltas(evidence, V3_ALL)).mbti;
    } catch {
      rawMbti = undefined;
    }
  }
  if (isScoringV4(scoringVersion) && evidence.length >= 28) {
    try {
      report = detectInconsistency(evidence);
      if (rawMbti) {
        rawMbti = applyV4OptionRemaps({ mbti: { ...rawMbti }, disc: {}, bigFive: {}, career: {} }, evidence).mbti;
      }
      level = adjustClarityV41(level, report, bigFive, rawMbti);
      if (base.kind !== "flat" && level !== base.clarity.level) {
        const copy = RESULT_CLARITY_COPY_V41[level];
        display = {
          ...base,
          kind: level,
          heading: `Result clarity: ${copy.label}`,
          body: copy.body,
          clarity: { ...base.clarity, level, label: copy.label, body: copy.body },
        };
      } else if (level !== base.clarity.level) {
        display = { ...base, clarity: { ...base.clarity, level } };
      }
    } catch {
      /* keep base */
    }
  }
  return { display, level, report, rawMbti };
}

/** Stress secondary note: N high AND not the top or co-top (within 5 pts) trait. */
export function shouldShowStressSecondary(bigFive: Record<string, number>, scoringVersion: string | null | undefined): boolean {
  if (!isScoringV4(scoringVersion)) return false;
  const n = Number(bigFive.N ?? 0);
  if (n < 67) return false;
  const others = Object.entries(bigFive).filter(([k]) => k !== "N").map(([, v]) => Number(v) || 0);
  const top = Math.max(...others);
  return top - n > 5;
}
