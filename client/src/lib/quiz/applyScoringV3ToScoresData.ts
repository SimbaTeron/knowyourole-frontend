/**
 * Applies v3 raw deltas onto a ScoresData object (post authoritative recompute,
 * pre ResultDTO build). Calibration profiles remain the v2 bank.
 */
import type { ScoresData } from "@/lib/scoring";
import { applyV3RawDeltas, computeV3RawDeltas, V3_ALL } from "@/lib/quiz/shortformV3Adjustments";
import { calibrateShortformV2Scores } from "@/lib/results/calibrateShortformV2Scores";
import { SCORING_VERSION_V3, CAREER_MATCH_VERSION_V3, NARRATIVE_VERSION_V3 } from "@/lib/quiz/scoringVersions";

export function applyScoringV3(scores: ScoresData): ScoresData {
  const responses = (scores.responses ?? [])
    .filter((r) => typeof r.questionId === "number" && typeof r.choice === "number")
    .map((r) => ({ questionId: r.questionId as number, choice: r.choice as 0 | 1 | 2 | 3 }));
  const deltas = computeV3RawDeltas(responses, V3_ALL);
  const adjusted = applyV3RawDeltas(
    {
      mbti: { ...(scores.mbti as Record<string, number>) },
      disc: { ...(scores.disc as Record<string, number>) },
      bigFive: { ...(scores.bigFive as Record<string, number>) },
    },
    deltas,
  );
  // Re-calibrate mbti/disc/bigFive from adjusted raw totals using v2 profiles
  // (calibrateShortformV2Scores reads SHORTFORM_V2_QUESTIONS profiles).
  const recalibrated = calibrateShortformV2Scores({
    ...scores,
    mbti: adjusted.mbti,
    disc: adjusted.disc,
    bigFive: adjusted.bigFive,
  } as ScoresData);
  return {
    ...recalibrated,
    career: scores.career,
    quizVersion: scores.quizVersion ?? "shortform-v2-fixed-28",
    scoringVersion: SCORING_VERSION_V3,
    careerMatchVersion: CAREER_MATCH_VERSION_V3,
    narrativeVersion: NARRATIVE_VERSION_V3,
  } as ScoresData;
}
