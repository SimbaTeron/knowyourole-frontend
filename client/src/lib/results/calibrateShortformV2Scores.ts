import { SHORTFORM_V2_QUESTIONS } from "@/data/shortformV2Questions";

type CalibratableShortformScores = {
  mbti: Record<string, number>;
  disc: Record<string, number>;
  bigFive: Record<string, number>;
};

type ScoreFamily = "mbti" | "disc" | "bigFive";
type ScoreProfile = { expected: number; variance: number };

const SCORE_KEYS: Record<ScoreFamily, string[]> = {
  mbti: ["E", "I", "S", "N", "T", "F", "J", "P"],
  disc: ["D", "I", "S", "C"],
  bigFive: ["O", "C", "E", "A", "N"],
};

const SHORTFORM_SCORE_PROFILES = (Object.keys(SCORE_KEYS) as ScoreFamily[]).reduce((families, family) => {
  families[family] = SCORE_KEYS[family].reduce((profiles, key) => {
    profiles[key] = SHORTFORM_V2_QUESTIONS.reduce<ScoreProfile>((profile, question) => {
      const values = question.answers.map(answer => Number(answer.scores[family]?.[key as never] ?? 0));
      const expected = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
      profile.expected += expected;
      profile.variance += values.reduce((sum, value) => sum + (value - expected) ** 2, 0) / Math.max(1, values.length);
      return profile;
    }, { expected: 0, variance: 0 });
    return profiles;
  }, {} as Record<string, ScoreProfile>);
  return families;
}, {} as Record<ScoreFamily, Record<string, ScoreProfile>>);

function calibrateValue(raw: number, profile: ScoreProfile): number {
  const safeRaw = Number.isFinite(raw) ? raw : profile.expected;
  const standardDeviation = Math.max(0.5, Math.sqrt(profile.variance));
  const standardized = (safeRaw - profile.expected) / standardDeviation;
  return Math.max(15, Math.min(85, Math.round(50 + standardized * 10)));
}

/**
 * Corrects unequal scoring opportunities in the fixed 28-question shortform.
 * Random/neutral choices center near 50 for every signal; strong evidence can
 * move toward 8 or 92. Career totals remain raw because role matching applies
 * separate opportunity normalization to the 13-dimensional career vector.
 */
export function calibrateShortformV2Scores<T extends CalibratableShortformScores>(scores: T): T {
  const calibrated = {
    ...scores,
    mbti: { ...scores.mbti },
    disc: { ...scores.disc },
    bigFive: { ...scores.bigFive },
  };

  for (const family of Object.keys(SCORE_KEYS) as ScoreFamily[]) {
    const target = calibrated[family] as Record<string, number>;
    for (const key of SCORE_KEYS[family]) {
      target[key] = calibrateValue(target[key] ?? 0, SHORTFORM_SCORE_PROFILES[family][key]);
    }
  }

  return calibrated;
}

export { SHORTFORM_SCORE_PROFILES };
