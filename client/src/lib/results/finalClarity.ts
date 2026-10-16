/**
 * Single source of truth for the clarity shown on EVERY results view (main, Big Five tab,
 * decision brief, report). Display-only: reproduces scoring-v4.1 clarity from stored
 * scores + answer evidence; never changes scores.
 */
import { resolveResultClarityDisplay, type ResultClarityDisplay } from "@/lib/results/resultClarity";
import { isScoringV3, isScoringV4, isScoringV5 } from "@/lib/quiz/scoringVersions";
import { adjustClarityV5, V5_CLEAR_BODY, type ClarityV5Result } from "@/lib/quiz/clarityV5";
import { applyV5Raw, V5_STRESS_SHOW } from "@/lib/quiz/shortformV5Adjustments";
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
  /** v5: note shown when answers were very quick or scattered. */
  v5Note?: string;
  /** v5: full clarity details (fast / scattered / random flags). */
  v5?: ClarityV5Result;
};

type Resp = { questionId?: unknown; choice?: unknown };

export function resolveFinalClarity(
  bigFive: Record<string, number>,
  responses: ReadonlyArray<Resp> | null | undefined,
  scoringVersion: string | null | undefined,
  maxCareer?: number,
  career?: Partial<Record<string, number>> | null,
): FinalClarity {
  const v3 = isScoringV3(scoringVersion);
  const base = resolveResultClarityDisplay(bigFive, responses as any, v3 ? { version: "v3", maxCareer } : {});
  let level = base.clarity.level as FinalClarityLevel;
  let display = base;
  let report: InconsistencyReport | null = null;
  let rawMbti: Record<string, number> | undefined;
  let v5Note: string | undefined;
  let v5: ClarityV5Result | undefined;
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
      report = detectInconsistency(evidence.filter((r) => r.questionId <= 28));
      if (isScoringV5(scoringVersion)) {
        // Same raw maps as the scorer (scoreShortformVersioned v5).
        try {
          rawMbti = applyV5Raw(recomputeShortformV2ScoreMaps(evidence) as any, evidence).mbti;
        } catch {
          /* keep */
        }
      } else if (rawMbti) {
        rawMbti = applyV4OptionRemaps({ mbti: { ...rawMbti }, disc: {}, bigFive: {}, career: {} }, evidence).mbti;
      }
      if (isScoringV5(scoringVersion)) {
        v5 = adjustClarityV5(level, report, bigFive, rawMbti, responses, career);
        level = v5.level;
        v5Note = v5.note || undefined;
      } else {
        level = adjustClarityV41(level, report, bigFive, rawMbti);
      }
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
  if (v5 && display.kind === "flat") {
    // v5 has its own pattern detector and notes; always keep the "Result clarity" line.
    const copy = RESULT_CLARITY_COPY_V41[level];
    display = { ...display, kind: level, heading: `Result clarity: ${copy.label}`, body: copy.body, clarity: { ...display.clarity, level, label: copy.label, body: copy.body } };
  }
  if (v5 && level === "clear") {
    const body = V5_CLEAR_BODY;
    display = { ...display, kind: "clear", body, clarity: { ...display.clarity, body } };
  }
  if (v5 && level === "broad" && !v5.flat && display.kind !== "flat") {
    const body = "Your answers didn't settle into one clear pattern, so read your top trait and type as a light lean, not a label.";
    display = { ...display, kind: "broad", heading: "Result clarity: Broad", body, clarity: { ...display.clarity, level: "broad", label: "Broad", body } };
  }
  return { display, level, report: v5 && report ? { ...report, flagged: v5.scattered || v5.randomLike } : report, rawMbti, v5Note, v5 };
}

/** Stress secondary note: N high AND not the top or co-top (within 5 pts) trait. */
export function shouldShowStressSecondary(bigFive: Record<string, number>, scoringVersion: string | null | undefined): boolean {
  if (!isScoringV4(scoringVersion)) return false;
  const n = Number(bigFive.N ?? 0);
  // v5: stress is gated on explicit stress answers, so show it on the main result whenever it is high.
  if (isScoringV5(scoringVersion)) return n >= V5_STRESS_SHOW;
  if (n < 67) return false;
  const others = Object.entries(bigFive).filter(([k]) => k !== "N").map(([, v]) => Number(v) || 0);
  const top = Math.max(...others);
  return top - n > 5;
}
