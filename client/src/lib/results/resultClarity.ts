/**
 * Display-only result clarity helpers. These never change score values; they
 * only describe how sharply the existing Big Five scores separate and whether
 * the answer pattern looks flat (e.g. the same letter picked almost every time).
 */

export type ResultClarityLevel = "clear" | "mixed" | "broad";

export type ResultClarity = {
  level: ResultClarityLevel;
  label: string;
  body: string;
  topKey: string;
  secondKey: string;
  gap: number;
  /** True when the top two traits are close enough to present as "X + Y". */
  blended: boolean;
};

/** Gap (in score points) at or below which the top two traits are shown together. */
export const BLEND_GAP = 5;
/** Matches the result DTO tiers: <=33 low, >=67 high, otherwise medium. */
export const MEDIUM_MIN = 34;
export const MEDIUM_MAX = 66;
/** Same-letter count (out of 28) that triggers the gentle flat-pattern note. */
export const FLAT_PATTERN_THRESHOLD = 20;

const CLARITY_COPY: Record<ResultClarityLevel, { label: string; body: string }> = {
  clear: {
    label: "Clear",
    body: "Your top trait stood out from the rest across your answers.",
  },
  mixed: {
    label: "Mixed",
    body: "Your top two traits came out close, so we show them together. Both are part of your pattern.",
  },
  broad: {
    label: "Broad",
    body: "Your traits all landed in the middle range. That usually means you adapt across situations, so read the top trait as a light lean, not a label.",
  },
};

export function getResultClarity(bigFive: Record<string, number>): ResultClarity {
  const ranked = Object.entries(bigFive)
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = ranked[0] ?? ["", 0];
  const [secondKey, secondValue] = ranked[1] ?? ["", 0];
  const gap = Math.round((topValue - secondValue) * 10) / 10;
  const allMedium = ranked.length > 0 && ranked.every(([, value]) => value >= MEDIUM_MIN && value <= MEDIUM_MAX);
  const blended = ranked.length > 1 && gap <= BLEND_GAP;
  const level: ResultClarityLevel = allMedium ? "broad" : blended ? "mixed" : "clear";
  return { level, ...CLARITY_COPY[level], topKey, secondKey, gap, blended };
}

export type FlatPatternResult = {
  flagged: boolean;
  dominantLetter: string | null;
  dominantCount: number;
  total: number;
  note: string | null;
};

const LETTERS = ["A", "B", "C", "D"];

export const FLAT_PATTERN_NOTE =
  "Many of your answers used the same option, so these results may be less precise. If you rushed, retaking the quiz with your first honest reaction to each question can sharpen them.";

export function detectFlatAnswerPattern(
  responses: ReadonlyArray<{ choice?: unknown }> | null | undefined,
  threshold = FLAT_PATTERN_THRESHOLD,
): FlatPatternResult {
  const counts = [0, 0, 0, 0];
  let total = 0;
  for (const response of responses ?? []) {
    const choice = response?.choice;
    if (typeof choice === "number" && Number.isInteger(choice) && choice >= 0 && choice <= 3) {
      counts[choice] += 1;
      total += 1;
    }
  }
  let dominant = 0;
  for (let i = 1; i < 4; i += 1) if (counts[i] > counts[dominant]) dominant = i;
  const dominantCount = counts[dominant];
  const flagged = total >= threshold && dominantCount >= threshold;
  return {
    flagged,
    dominantLetter: total ? LETTERS[dominant] : null,
    dominantCount,
    total,
    note: flagged ? FLAT_PATTERN_NOTE : null,
  };
}

/**
 * What to show in the clarity box. When the same-letter / flat-pattern caution
 * triggers, it REPLACES Clear, Mixed, or Broad — never shown alongside them.
 */
export type ResultClarityDisplay = {
  /** "flat" when the caution replaces the clarity note; otherwise the clarity level. */
  kind: ResultClarityLevel | "flat";
  heading: string;
  body: string;
  /** Kept from the underlying clarity so blended "X + Y" labels still work. */
  clarity: ResultClarity;
  flat: FlatPatternResult;
};

export function resolveResultClarityDisplay(
  bigFive: Record<string, number>,
  responses: ReadonlyArray<{ choice?: unknown }> | null | undefined,
): ResultClarityDisplay {
  const clarity = getResultClarity(bigFive);
  const flat = detectFlatAnswerPattern(responses);
  if (flat.flagged && flat.note) {
    return {
      kind: "flat",
      heading: "Answer pattern note",
      body: flat.note,
      clarity,
      flat,
    };
  }
  return {
    kind: clarity.level,
    heading: `Result clarity: ${clarity.label}`,
    body: clarity.body,
    clarity,
    flat,
  };
}

/** "Openness + Agreeableness" when blended, otherwise just the top label. */
export function formatTopTraitLabel(clarity: ResultClarity, labelFor: (key: string) => string): string {
  return clarity.blended ? `${labelFor(clarity.topKey)} + ${labelFor(clarity.secondKey)}` : labelFor(clarity.topKey);
}
