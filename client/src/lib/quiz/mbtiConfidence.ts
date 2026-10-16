/**
 * MBTI letter-confidence helpers for scoring v3 display.
 * Always keep a full 4-letter type; never substitute X. Close dichotomies get a
 * short plain-language note and optional "light lean" markers.
 */

export type MbtiAxis = "EI" | "SN" | "TF" | "JP";

export const MBTI_AXIS_PAIRS: Record<MbtiAxis, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

export const MBTI_AXIS_LABELS: Record<MbtiAxis, string> = {
  EI: "E/I (energy)",
  SN: "S/N (information)",
  TF: "T/F (decisions)",
  JP: "J/P (structure)",
};

/** Calibrated gap below this = light lean on that axis. Tuned so ~10–20% of realistic (persona+1-flip) answerers see a close-letter note. */
export const WEAK_CAL_GAP = 2;
/** Raw gap below this also counts as light lean. */
export const WEAK_RAW_GAP = 2;

export type MbtiConfidence = {
  /** Always a full 4-letter type (no X). */
  type: string;
  /** Axes that were close. */
  weakAxes: MbtiAxis[];
  /** Letters in the type that were the close-side winners (for visual markers). */
  lightLeanLetters: string[];
  /** Short plain sentence for the UI. Empty when all axes are clear. */
  note: string;
  /** Compact badge text, e.g. "light lean on S/N". Empty when clear. */
  badge: string;
};

function gap(mbti: Record<string, number>, a: string, b: string): number {
  return Math.abs(Number(mbti[a] ?? 0) - Number(mbti[b] ?? 0));
}

function winner(mbti: Record<string, number>, a: string, b: string): string {
  return Number(mbti[a] ?? 0) >= Number(mbti[b] ?? 0) ? a : b;
}

export function fullMbtiType(mbti: Record<string, number>): string {
  return (
    winner(mbti, "E", "I") +
    winner(mbti, "S", "N") +
    winner(mbti, "T", "F") +
    winner(mbti, "J", "P")
  );
}

export function getMbtiConfidence(
  calibrated: Record<string, number>,
  raw?: Record<string, number>,
  options?: { broad?: boolean; displayType?: string },
): MbtiConfidence {
  // When the UI shows a type computed elsewhere, notes and light-lean markers must use
  // that same type so the letters never contradict the note (QuizQA R6 P63/P73).
  const displayType = options?.displayType && /^[EI][SN][TF][JP]$/.test(options.displayType) ? options.displayType : undefined;
  const type = displayType ?? fullMbtiType(calibrated);
  const weakAxes: MbtiAxis[] = [];
  const lightLeanLetters: string[] = [];

  (Object.keys(MBTI_AXIS_PAIRS) as MbtiAxis[]).forEach((axis) => {
    const [a, b] = MBTI_AXIS_PAIRS[axis];
    const calClose = gap(calibrated, a, b) < WEAK_CAL_GAP;
    const rawClose = raw ? gap(raw, a, b) < WEAK_RAW_GAP : false;
    if (calClose || rawClose) {
      weakAxes.push(axis);
      const idx = (Object.keys(MBTI_AXIS_PAIRS) as MbtiAxis[]).indexOf(axis);
      lightLeanLetters.push(displayType ? displayType[idx] : winner(calibrated, a, b));
    }
  });

  if (weakAxes.length === 0 && !options?.broad) {
    return { type, weakAxes, lightLeanLetters, note: "", badge: "" };
  }

  if (options?.broad && weakAxes.length === 0) {
    return {
      type,
      weakAxes,
      lightLeanLetters,
      badge: "directional sketch",
      note: "This type is a directional sketch — your trait pattern was broad, so treat it as a starting point, not a hard label.",
    };
  }

  if (weakAxes.length === 1) {
    const axis = weakAxes[0];
    const label = MBTI_AXIS_LABELS[axis];
    return {
      type,
      weakAxes,
      lightLeanLetters,
      badge: `light lean on ${axis[0]}/${axis[1]}`,
      note: options?.broad
        ? `Your ${label} lean was light, and your overall pattern was broad — read ${type} as a sketch, not a hard label.`
        : `Your ${label} lean was light — both sides showed up, so that letter is a soft preference.`,
    };
  }

  const axisList = weakAxes.map((a) => `${a[0]}/${a[1]}`).join(", ");
  return {
    type,
    weakAxes,
    lightLeanLetters,
    badge: "some light leans",
    note: options?.broad
      ? `A few letters were close (${axisList}). ${type} is still your best full type, but read those letters as light leans — and explore more than one work direction.`
      : `A few letters were close (${axisList}). ${type} is still your best full type; treat the close letters as light leans, not hard labels.`,
  };
}
