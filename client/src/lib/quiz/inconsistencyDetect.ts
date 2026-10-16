/**
 * Gentle inconsistency detector for scoring v4.1.
 * Contradiction = split-half letter disagreement or random-like spread (not safe defaults).
 * Safe-default stacks are reported separately as `guarded` (softens clarity only).
 */

export type InconsistencyReport = {
  flagged: boolean;
  reasons: string[];
  contradictionPairs: number;
  entropy: number;
  safeDefaultCount: number;
  /** Safe-default stack: soften clarity, but not a contradiction. */
  guarded: boolean;
  splitHalf: number;
  meanCoherence: number;
  coherence: number[];
  note: string;
};

import { SHORTFORM_V2_QUESTIONS } from "@/data/shortformV2Questions";

const LETTER = ["A", "B", "C", "D"] as const;
const AXES: Array<[string, string]> = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
type Resp = { questionId: number; choice: 0 | 1 | 2 | 3 };

function rawMbti(responses: ReadonlyArray<Resp>, pick: (q: number) => boolean) {
  const m: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const r of responses) {
    if (!pick(r.questionId)) continue;
    const q = SHORTFORM_V2_QUESTIONS.find((x) => x.id === r.questionId);
    const sc = q?.answers[r.choice]?.scores.mbti ?? {};
    for (const [k, v] of Object.entries(sc)) m[k] += Number(v) || 0;
  }
  return m;
}

/** Per-axis |a-b|/(a+b) on raw bank letter weights (1 = one-sided, 0 = even split). */
export function mbtiAxisCoherence(responses: ReadonlyArray<Resp>): number[] {
  const m = rawMbti(responses, () => true);
  return AXES.map(([a, b]) => Math.round((Math.abs(m[a] - m[b]) / Math.max(1, m[a] + m[b])) * 100) / 100);
}

/** Max over 3 fixed splits of summed opposite-sign MBTI margins between the halves. */
export function splitHalfDisagreement(responses: ReadonlyArray<Resp>): number {
  const splits: Array<(q: number) => boolean> = [(q) => q % 2 === 1, (q) => q <= 14, (q) => q % 4 < 2];
  let best = 0;
  for (const pick of splits) {
    const a = rawMbti(responses, pick);
    const b = rawMbti(responses, (q) => !pick(q));
    let s = 0;
    for (const [x, y] of AXES) {
      const ma = a[x] - a[y];
      const mb = b[x] - b[y];
      if (Math.sign(ma) * Math.sign(mb) < 0) s += Math.min(Math.abs(ma), Math.abs(mb));
    }
    best = Math.max(best, s);
  }
  return best;
}

/**
 * v4.1 clarity adjustment shared by scorer and results UI.
 * - flagged or guarded or ≥2 near-even MBTI axes: Clear → Mixed
 * - honest moderates (no Big Five trait ≥67 and mean MBTI coherence < 0.45): → Broad
 */
export function adjustClarityV41(
  level: "clear" | "mixed" | "broad",
  report: InconsistencyReport,
  bigFive: Record<string, number>,
  rawMbti?: Record<string, number>,
): "clear" | "mixed" | "broad" {
  const coherence = rawMbti
    ? AXES.map(([a, b]) => Math.abs((rawMbti[a] ?? 0) - (rawMbti[b] ?? 0)) / Math.max(1, (rawMbti[a] ?? 0) + (rawMbti[b] ?? 0)))
    : report.coherence;
  const meanCoh = coherence.reduce((x, y) => x + y, 0) / 4;
  const topTrait = Math.max(...Object.values(bigFive).map((v) => Number(v) || 0));
  if (level !== "broad" && !report.flagged && topTrait < 67 && meanCoh < 0.45) return "broad";
  const nearEvenAxes = coherence.filter((c) => c < 0.4).length;
  if (level === "clear" && (report.flagged || report.guarded || nearEvenAxes >= 2)) return "mixed";
  return level;
}

type Pair = { id: string; left: Array<{ q: number; letters: string }>; right: Array<{ q: number; letters: string }> };

const PAIRS: Pair[] = [
  {
    id: "closure",
    left: [
      { q: 4, letters: "A" },
      { q: 9, letters: "A" },
    ],
    right: [
      { q: 4, letters: "B" },
      { q: 9, letters: "D" },
    ],
  },
  {
    id: "energy",
    left: [
      { q: 12, letters: "A" },
      { q: 24, letters: "B" },
    ],
    right: [
      { q: 12, letters: "C" },
      { q: 24, letters: "A" },
    ],
  },
  {
    id: "conflict",
    left: [{ q: 14, letters: "B" }],
    right: [
      { q: 14, letters: "C" },
      { q: 28, letters: "C" },
    ],
  },
  {
    id: "pace",
    left: [{ q: 19, letters: "A" }],
    right: [{ q: 19, letters: "C" }],
  },
  {
    id: "evidence_vs_story",
    left: [{ q: 18, letters: "B" }],
    right: [{ q: 18, letters: "A" }],
  },
];

const SAFE_DEFAULTS: Array<{ q: number; letter: string }> = [
  { q: 4, letter: "A" },
  { q: 7, letter: "A" },
  { q: 9, letter: "A" },
  { q: 13, letter: "C" },
  { q: 16, letter: "A" },
  { q: 19, letter: "B" },
  { q: 20, letter: "B" },
  { q: 21, letter: "B" },
  { q: 26, letter: "B" },
  { q: 27, letter: "C" },
];

function letterEntropy(letters: string[]): number {
  const n = letters.length || 1;
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const L of letters) counts[L] = (counts[L] || 0) + 1;
  let h = 0;
  for (const c of Object.values(counts)) {
    if (!c) continue;
    const p = c / n;
    h -= p * Math.log2(p);
  }
  return h;
}

function hitSide(chosen: Map<number, string>, side: Array<{ q: number; letters: string }>): boolean {
  return side.some((s) => {
    const L = chosen.get(s.q);
    return !!L && s.letters.includes(L);
  });
}

export function detectInconsistency(
  responses: ReadonlyArray<{ questionId: number; choice: 0 | 1 | 2 | 3 }>,
): InconsistencyReport {
  const chosen = new Map(responses.map((r) => [r.questionId, LETTER[r.choice]]));
  const letters = responses
    .slice()
    .sort((a, b) => a.questionId - b.questionId)
    .map((r) => LETTER[r.choice]);

  let contradictionPairs = 0;
  const pairHits: string[] = [];
  for (const pair of PAIRS) {
    // Skip same-question exclusive poles (can't both fire)
    if (pair.left.length === 1 && pair.right.length === 1 && pair.left[0].q === pair.right[0].q) {
      continue;
    }
    if (hitSide(chosen, pair.left) && hitSide(chosen, pair.right)) {
      contradictionPairs += 1;
      pairHits.push(pair.id);
    }
  }

  if ((chosen.get(15) === "A" || chosen.get(15) === "B") && chosen.get(28) === "C") {
    contradictionPairs += 1;
    pairHits.push("pressure_vs_avoid");
  }


  const entropy = letterEntropy(letters);
  const safeDefaultCount = SAFE_DEFAULTS.filter((s) => chosen.get(s.q) === s.letter).length;
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const L of letters) counts[L] += 1;
  const maxShare = Math.max(...Object.values(counts)) / letters.length;

  const coherence = mbtiAxisCoherence(responses);
  const meanCoherence = coherence.reduce((a, b) => a + b, 0) / 4;
  const splitHalf = splitHalfDisagreement(responses);

  // v4.1 rules. Contradiction = the same person's answers point to opposite letters in
  // different halves of the quiz (split-half), or the letter pattern is random-like.
  // Safe-default stacks are NOT contradictions; they are reported via `guarded` instead.
  const scattered = entropy >= 1.94;
  const randomLike = scattered && meanCoherence < 0.3;
  const contradictory = scattered && splitHalf >= 6;
  const guarded = safeDefaultCount >= 5 && contradictionPairs >= 1 && meanCoherence < 0.7;

  const reasons: string[] = [];
  if (contradictory) reasons.push(`split_half:${splitHalf}`);
  if (randomLike) reasons.push("random_like");
  if (guarded) reasons.push("safe_default_guarded");

  const flagged = contradictory || randomLike;
  const note = flagged
    ? "Some answers pulled in opposite directions — treat this as a rough sketch, not a hard label."
    : guarded
      ? "Your answers leaned on the “reliable default” options — useful as a starting sketch, but leave room to explore."
      : "";

  return {
    flagged,
    guarded,
    splitHalf,
    meanCoherence: Math.round(meanCoherence * 100) / 100,
    coherence,
    reasons,
    contradictionPairs,
    entropy: Math.round(entropy * 100) / 100,
    safeDefaultCount,
    note,
  };
}

/** Clarity copy used when v4.1 adjusts the level (the Big Five gap copy would not fit). */
export const RESULT_CLARITY_COPY_V41: Record<"clear" | "mixed" | "broad", { label: string; body: string }> = {
  clear: { label: "Clear", body: "Your top trait stood out from the rest across your answers." },
  mixed: {
    label: "Mixed",
    body: "Your answers leaned in more than one direction, so read your top trait and type as a lean, not a fixed label.",
  },
  broad: {
    label: "Broad",
    body: "Your answers were moderate across the board. That usually means you adapt across situations, so read the top trait as a light lean, not a label.",
  },
};
