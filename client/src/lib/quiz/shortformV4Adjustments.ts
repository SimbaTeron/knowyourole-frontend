/**
 * Scoring v4 remaps as additive deltas on chosen options.
 * Applied after v3 J/N adjustments. Calibration profiles stay on the live bank.
 * E-trims intentionally exclude Q23D so decisive leaders (P12) keep ENTJ.
 */
export type V4Maps = {
  mbti: Record<string, number>;
  bigFive: Record<string, number>;
  disc: Record<string, number>;
  career: Record<string, number>;
};

type FamilyDelta = Partial<{
  mbti: Partial<Record<string, number>>;
  bigFive: Partial<Record<string, number>>;
  disc: Partial<Record<string, number>>;
  career: Partial<Record<string, number>>;
}>;

const LETTER = ["A", "B", "C", "D"] as const;

/** Key = `${questionId}:${letter}` */
export const V4_OPTION_REMAPS: Record<string, FamilyDelta> = {
  // Reword-linked (text changed in bank; score nudge here)
  "1:D": { mbti: { I: 1 } },
  "9:D": { mbti: { P: 1 } },
  // N / Structure (anxious achiever) + N∩A decoupling (calm caregivers)
  "20:B": { bigFive: { C: -1 } }, // v4.1: N moved to conditional rule (calm structured people)
  "15:C": { bigFive: { N: -1 } },
  "28:C": { bigFive: { N: -1 } },
  "16:B": { bigFive: { N: -1 } },
  "27:C": { bigFive: { C: -1 } },
  // Light C trim
  "21:B": { bigFive: { C: -1 }, career: { handsOn: -2, operations: 1, leadership: 1 } },
  "4:A": { bigFive: { C: -1 } },
  "19:B": { bigFive: { C: -1 } },
  "26:B": { bigFive: { C: -1 } },
  // J→P for intellectual / low-closure paths
  "13:C": { mbti: { J: -1 }, bigFive: { C: -1 } },
  "23:A": { mbti: { J: -1, P: 1 } },
  "25:A": { mbti: { J: -1, P: 1 } },
  "3:A": { mbti: { J: -1 } },
  "16:A": { mbti: { J: -1 } },
  // S boost on practical-people options (ESFP)
  "8:D": { mbti: { S: 1 } },
  "23:B": { mbti: { S: 1 } },
  "22:B": { mbti: { S: 1 } },
  "11:D": { mbti: { S: 1 } },
  // E trim scoped away from Q23D (P12/P27 hit that)
  "13:A": { mbti: { E: -1 } },
  "18:A": { mbti: { E: -1 } },
  "21:C": { mbti: { E: -1 } },
  "7:D": { mbti: { E: -1, I: 1 } },
  "19:D": { mbti: { E: -1 } },
  "24:D": { mbti: { E: -1, I: 1 } },
  "8:B": { career: { handsOn: -1, operations: 1 } },
  "20:D": { career: { creative: 2, analysis: -1 } },
};

export function applyV4OptionRemaps<T extends V4Maps>(
  raw: T,
  responses: ReadonlyArray<{ questionId: number; choice: 0 | 1 | 2 | 3 }>,
): T {
  const mbti = { ...raw.mbti };
  const bigFive = { ...raw.bigFive };
  const disc = { ...raw.disc };
  const career = { ...raw.career };
  for (const r of responses) {
    const key = `${r.questionId}:${LETTER[r.choice]}`;
    const delta = V4_OPTION_REMAPS[key];
    if (!delta) continue;
    for (const [k, v] of Object.entries(delta.mbti || {})) mbti[k] = (mbti[k] || 0) + (v as number);
    for (const [k, v] of Object.entries(delta.bigFive || {})) bigFive[k] = (bigFive[k] || 0) + (v as number);
    for (const [k, v] of Object.entries(delta.disc || {})) disc[k] = (disc[k] || 0) + (v as number);
    for (const [k, v] of Object.entries(delta.career || {})) career[k] = (career[k] || 0) + (v as number);
  }
  // v4.1 conditional N: duty/perfection options read as stress only when the person also
  // picked an explicit worry/overwhelm option (Q15D, "I feel scattered under pressure"). Calm structured people unaffected.
  const chosen = new Set(responses.map((r) => `${r.questionId}:${LETTER[r.choice]}`));
  const worry = chosen.has("15:D");
  if (worry) {
    if (chosen.has("20:B")) bigFive.N = (bigFive.N || 0) + 2;
    if (chosen.has("9:A")) bigFive.N = (bigFive.N || 0) + 1;
  }
  return { ...raw, mbti, bigFive, disc, career };
}
