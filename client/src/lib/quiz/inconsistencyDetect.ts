/**
 * Gentle inconsistency / low-conviction detector for scoring v4.
 * Targets ~8–15% realistic and ~45–60% random flag rates.
 */

export type InconsistencyReport = {
  flagged: boolean;
  reasons: string[];
  contradictionPairs: number;
  entropy: number;
  safeDefaultCount: number;
  note: string;
};

const LETTER = ["A", "B", "C", "D"] as const;

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
  // Quiet deep-pace / alone recovery vs people-content work (contradictory mix)
  if (
    (chosen.get(12) === "C" && (chosen.get(22) === "B" || chosen.get(23) === "B")) ||
    (chosen.get(24) === "A" && chosen.get(8) === "D" && chosen.get(18) === "A")
  ) {
    contradictionPairs += 1;
    pairHits.push("quiet_vs_people");
  }

  // Structure vs people tug (common contradictory pattern)
  if (
    (chosen.get(13) === "C" || chosen.get(21) === "B") &&
    (chosen.get(18) === "A" || chosen.get(22) === "B" || chosen.get(23) === "B")
  ) {
    contradictionPairs += 1;
    pairHits.push("structure_vs_people");
  }

  const entropy = letterEntropy(letters);
  const safeDefaultCount = SAFE_DEFAULTS.filter((s) => chosen.get(s.q) === s.letter).length;
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const L of letters) counts[L] += 1;
  const maxShare = Math.max(...Object.values(counts)) / letters.length;

  const reasons: string[] = [];
  const randomLike = entropy >= 1.94 && maxShare <= 0.31;
  const contradictory = contradictionPairs >= 2;
  const mildContradictScatter = contradictionPairs >= 1 && entropy >= 1.94 && maxShare <= 0.37;
  // Guarded: many safe defaults, not a single-letter steamroller, and at least one soft contradiction
  const guarded =
    safeDefaultCount >= 6 && maxShare >= 0.35 && maxShare <= 0.46 && contradictionPairs >= 1 && entropy >= 1.70 && entropy <= 1.82;

  if (contradictory) reasons.push(`opposite_pairs:${[...new Set(pairHits)].join("+")}`);
  if (randomLike) reasons.push("high_entropy");
  if (mildContradictScatter && !randomLike && !contradictory) reasons.push("scatter_contradiction");
  if (guarded) reasons.push("safe_default");

  const flagged = contradictory || randomLike || mildContradictScatter || guarded;

  const note = flagged
    ? guarded && !contradictory && !randomLike && !mildContradictScatter
      ? "Your answers leaned on the “reliable default” options — useful as a starting sketch, but leave room to explore."
      : "Some answers pulled in opposite directions — treat this as a rough sketch, not a hard label."
    : "";

  return {
    flagged,
    reasons,
    contradictionPairs,
    entropy: Math.round(entropy * 100) / 100,
    safeDefaultCount,
    note,
  };
}
