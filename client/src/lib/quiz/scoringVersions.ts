/** Scoring version tags written onto ResultDTO.version.scoringVersion */
export const SCORING_VERSION_V2 = "shortform-v2-scoring-v2";
export const SCORING_VERSION_V3 = "shortform-v2-scoring-v3";
export const CAREER_MATCH_VERSION_V2 = "work-lanes-v2";
export const CAREER_MATCH_VERSION_V3 = "work-lanes-v3-leadership";
export const NARRATIVE_VERSION_V3 = "result-narrative-v3";

export function isScoringV3(version: string | null | undefined): boolean {
  return version === SCORING_VERSION_V3 || version === "v3";
}
