/** Scoring version tags written onto ResultDTO.version.scoringVersion */
export const SCORING_VERSION_V2 = "shortform-v2-scoring-v2";
export const SCORING_VERSION_V3 = "shortform-v2-scoring-v3";
export const SCORING_VERSION_V4 = "shortform-v2-scoring-v4";
export const CAREER_MATCH_VERSION_V2 = "work-lanes-v2";
export const CAREER_MATCH_VERSION_V3 = "work-lanes-v3-leadership";
export const CAREER_MATCH_VERSION_V4 = "work-lanes-v4-coord";
export const NARRATIVE_VERSION_V3 = "result-narrative-v3";
export const NARRATIVE_VERSION_V4 = "result-narrative-v4";

export function isScoringV3(version: string | null | undefined): boolean {
  return version === SCORING_VERSION_V3 || version === "v3" || isScoringV4(version);
}

export function isScoringV4(version: string | null | undefined): boolean {
  return version === SCORING_VERSION_V4 || version === "v4";
}
