/**
 * Scoring v3 adjustments as post-score deltas on chosen answers.
 * The question bank text stays identical (forced choice, 28 Q). Calibration
 * profiles stay on the v2 bank so untouched answerers do not drift.
 */
import {
  SHORTFORM_V2_QUESTIONS,
  type ShortformV2Question,
} from "@/data/shortformV2Questions";

export type V3Flags = {
  jRecode: boolean;
  nRebalance: boolean;
};

export const V3_ALL: V3Flags = { jRecode: true, nRebalance: true };

const LETTER_INDEX = { A: 0, B: 1, C: 2, D: 3 } as const;

/** High-D options coded as Perceiving — when chosen, shift raw MBTI toward J. */
const J_RECODE: Array<{ id: number; letter: keyof typeof LETTER_INDEX; dJ: number; dP: number }> = [
  { id: 2, letter: "D", dJ: 1, dP: -1 },
  { id: 7, letter: "C", dJ: 2, dP: -2 },
  { id: 10, letter: "C", dJ: 2, dP: -2 },
  { id: 19, letter: "A", dJ: 2, dP: -1 },
  { id: 20, letter: "A", dJ: 2, dP: -2 },
  { id: 24, letter: "D", dJ: 2, dP: -2 },
  { id: 26, letter: "A", dJ: 1, dP: -2 },
  { id: 27, letter: "B", dJ: 1, dP: -1 },
];

/** Steadiness options that incorrectly lowered N — cancel that N penalty when chosen. */
const N_STEADINESS_CLEAR: Array<{ id: number; letter: keyof typeof LETTER_INDEX; restore: number }> = [
  { id: 14, letter: "D", restore: 1 },
  { id: 17, letter: "C", restore: 1 },
  { id: 19, letter: "B", restore: 1 },
  { id: 24, letter: "C", restore: 1 },
  { id: 27, letter: "C", restore: 1 },
];

/** Core stress-response options — unlock steadiness N-cancel and raise N. */
const N_CORE_ANXIETY: Array<{ id: number; letter: keyof typeof LETTER_INDEX; dN: number }> = [
  { id: 15, letter: "C", dN: 1 },
  { id: 15, letter: "D", dN: 2 },
  { id: 28, letter: "C", dN: 2 },
];
/** Soft correlates — small N bump only, do not unlock steadiness cancel. */
const N_SOFT: Array<{ id: number; letter: keyof typeof LETTER_INDEX; dN: number }> = [
  { id: 16, letter: "B", dN: 1 },
  { id: 14, letter: "C", dN: 1 },
];

export function getShortformQuestionBank(_version: "v2" | "v3"): ShortformV2Question[] {
  // Always the canonical bank; v3 deltas apply after recompute.
  return SHORTFORM_V2_QUESTIONS;
}

export type RawDelta = { dJ: number; dP: number; dN: number };

export function computeV3RawDeltas(
  responses: ReadonlyArray<{ questionId: number; choice: 0 | 1 | 2 | 3 }>,
  flags: V3Flags = V3_ALL,
): RawDelta {
  let dJ = 0, dP = 0, dN = 0;
  const chosen = new Map(responses.map((r) => [r.questionId, r.choice]));
  const letterOf = (choice: number) => (["A", "B", "C", "D"] as const)[choice];

  if (flags.jRecode) {
    for (const rule of J_RECODE) {
      if (chosen.get(rule.id) === LETTER_INDEX[rule.letter]) {
        dJ += rule.dJ;
        dP += rule.dP;
      }
    }
  }
  if (flags.nRebalance) {
    const scattered = chosen.get(15) === LETTER_INDEX.D; // feel scattered under pressure
    const reassure = chosen.get(15) === LETTER_INDEX.C; // seek reassurance under pressure
    const conflictHeavy = chosen.get(28) === LETTER_INDEX.C; // conflict/pressure is anti-fit
    const strongAnxiety = (scattered && conflictHeavy) || (scattered && reassure) || (reassure && conflictHeavy);
    if (strongAnxiety) {
      for (const rule of N_CORE_ANXIETY) {
        if (chosen.get(rule.id) === LETTER_INDEX[rule.letter]) dN += rule.dN;
      }
      for (const rule of N_STEADINESS_CLEAR) {
        if (chosen.get(rule.id) === LETTER_INDEX[rule.letter]) dN += rule.restore;
      }
      for (const rule of N_SOFT) {
        if (chosen.get(rule.id) === LETTER_INDEX[rule.letter]) dN += rule.dN;
      }
    } else if (scattered || conflictHeavy || reassure) {
      dN += 1; // mild only — avoids random single-pick N inflation
    }
  }
  return { dJ, dP, dN };
}

/**
 * Apply v3 deltas to raw score maps before calibration against v2 profiles.
 * J recode only sticks when Dominance evidence is strong (avoids flipping warm ESFJs).
 */
export function applyV3RawDeltas<T extends {
  mbti: Record<string, number>;
  bigFive: Record<string, number>;
  disc: Record<string, number>;
}>(raw: T, deltas: RawDelta): T {
  const discPrimary = (Object.entries(raw.disc) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0];
  const dStrong = discPrimary === "D" || (raw.disc.D ?? 0) >= (raw.disc.C ?? 0) && (raw.disc.D ?? 0) >= (raw.disc.I ?? 0) && (raw.disc.D ?? 0) >= (raw.disc.S ?? 0) && (raw.disc.D ?? 0) >= 8;
  const mbti = { ...raw.mbti };
  if (dStrong) {
    mbti.J = Math.max(0, (mbti.J ?? 0) + deltas.dJ);
    mbti.P = Math.max(0, (mbti.P ?? 0) + deltas.dP);
  }
  const bigFive = { ...raw.bigFive, N: (raw.bigFive.N ?? 0) + deltas.dN };
  return { ...raw, mbti, bigFive };
}
