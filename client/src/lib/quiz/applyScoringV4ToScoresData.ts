import type { ScoresData } from "@/lib/scoring";
import { applyV3RawDeltas, computeV3RawDeltas, V3_ALL } from "@/lib/quiz/shortformV3Adjustments";
import { applyV4OptionRemaps } from "@/lib/quiz/shortformV4Adjustments";
import { calibrateShortformV2Scores } from "@/lib/results/calibrateShortformV2Scores";
import { SCORING_VERSION_V4, CAREER_MATCH_VERSION_V4, NARRATIVE_VERSION_V4 } from "@/lib/quiz/scoringVersions";

export function applyScoringV4(scores: ScoresData): ScoresData {
  const responses = (scores.responses ?? [])
    .filter((r) => typeof r.questionId === "number" && typeof r.choice === "number")
    .map((r) => ({ questionId: r.questionId as number, choice: r.choice as 0 | 1 | 2 | 3 }));
  const deltas = computeV3RawDeltas(responses, V3_ALL);
  const afterV3 = applyV3RawDeltas(
    {
      mbti: { ...(scores.mbti as Record<string, number>) },
      disc: { ...(scores.disc as Record<string, number>) },
      bigFive: { ...(scores.bigFive as Record<string, number>) },
      career: { ...((scores.career as Record<string, number>) || {}) },
    },
    deltas,
  );
  const adjusted = applyV4OptionRemaps(afterV3, responses);
  const recalibrated = calibrateShortformV2Scores({
    ...scores,
    mbti: adjusted.mbti,
    disc: adjusted.disc,
    bigFive: adjusted.bigFive,
    career: adjusted.career,
  } as ScoresData);
  return {
    ...recalibrated,
    career: adjusted.career,
    quizVersion: scores.quizVersion ?? "shortform-v2-fixed-28",
    scoringVersion: SCORING_VERSION_V4,
    careerMatchVersion: CAREER_MATCH_VERSION_V4,
    narrativeVersion: NARRATIVE_VERSION_V4,
  } as ScoresData;
}
