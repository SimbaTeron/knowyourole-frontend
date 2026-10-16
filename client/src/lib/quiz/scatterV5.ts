/**
 * v5 answer-consistency check ("scattered" detector).
 *
 * Idea: a real person's answers mostly agree with each other. For each question we ask
 * "does the option you picked agree with the profile built from all your OTHER answers
 * better than the other three options would?" and average that over the quiz.
 * Random clicking averages out near 0; consistent answering is clearly positive.
 *
 * Uses every scored question, including the v5 work-content items (Q22–Q25, Q29),
 * across type letters, Big Five, DISC and work-interest keys.
 * Threshold is calibrated against simulated random answer sets (see tests).
 */
import { SHORTFORM_V2_QUESTIONS, INTEREST_KEYS } from "@/data/shortformV2Questions";

type Resp = { questionId: number; choice: 0 | 1 | 2 | 3 };

const DIMS = [
  "EI", "SN", "TF", "JP",
  "b:O", "b:C", "b:E", "b:A", "b:N",
  "d:D", "d:I", "d:S", "d:C",
  ...INTEREST_KEYS.map((k) => `c:${k}`),
] as const;

function optionVector(qid: number, choice: number): number[] {
  const q = SHORTFORM_V2_QUESTIONS.find((x) => x.id === qid);
  const sc = q?.answers[choice]?.scores;
  if (!sc) return DIMS.map(() => 0);
  const m = (sc.mbti ?? {}) as Record<string, number>;
  const b = (sc.bigFive ?? {}) as Record<string, number>;
  const d = (sc.disc ?? {}) as Record<string, number>;
  const c = (sc.career ?? {}) as Record<string, number>;
  return DIMS.map((dim) => {
    if (dim === "EI") return (m.E ?? 0) - (m.I ?? 0);
    if (dim === "SN") return (m.S ?? 0) - (m.N ?? 0);
    if (dim === "TF") return (m.T ?? 0) - (m.F ?? 0);
    if (dim === "JP") return (m.J ?? 0) - (m.P ?? 0);
    const [fam, key] = dim.split(":");
    const src = fam === "b" ? b : fam === "d" ? d : c;
    return Number(src[key] ?? 0);
  });
}

const VEC_CACHE = new Map<string, number[]>();
function vec(qid: number, choice: number): number[] {
  const k = `${qid}:${choice}`;
  let v = VEC_CACHE.get(k);
  if (!v) {
    v = optionVector(qid, choice);
    VEC_CACHE.set(k, v);
  }
  return v;
}

function cos(a: number[], b: number[]): number {
  let ab = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
  return aa && bb ? ab / Math.sqrt(aa * bb) : 0;
}

/** Mean leave-one-out agreement. ~0 for random answering, higher for consistent answering. */
export function answerAgreementV5(responses: ReadonlyArray<Resp>): number {
  const scored = responses.filter((r) => {
    const q = SHORTFORM_V2_QUESTIONS.find((x) => x.id === r.questionId);
    return q && q.answers.some((a) => Object.keys(a.scores ?? {}).length > 0) && r.questionId !== 30;
  });
  if (scored.length < 20) return 1;
  const total = DIMS.map(() => 0);
  for (const r of scored) vec(r.questionId, r.choice).forEach((x, i) => (total[i] += x));
  let sum = 0;
  for (const r of scored) {
    const own = vec(r.questionId, r.choice);
    const loo = total.map((x, i) => x - own[i]);
    const q = SHORTFORM_V2_QUESTIONS.find((x) => x.id === r.questionId)!;
    const sims = q.answers.map((_, k) => cos(vec(r.questionId, k), loo));
    const mean = sims.reduce((a, b) => a + b, 0) / sims.length;
    sum += sims[r.choice] - mean;
  }
  return Math.round((sum / scored.length) * 1000) / 1000;
}

/**
 * Explicit opposite statements. If someone picks three or more on BOTH sides of the same
 * axis (e.g. "frustrated by vague expectations" and "frustrated by rigid rules"), the answers
 * really do contradict each other. Random clicking hits this only ~3% of the time.
 */
const OPPOSITES: Record<string, [string[], string[]]> = {
  social: [["1A", "12C", "19C", "24A", "28A", "5A"], ["1B", "12A", "19D", "24B", "5B"]],
  decisive: [["15A", "17A", "21A", "14B", "16D"], ["28C", "14C", "15D"]],
  structure: [["4A", "7A", "19B", "26B", "28D", "10A", "21B"], ["4B", "28B", "9D", "10C", "3D"]],
};
const LET = ["A", "B", "C", "D"];

export function oppositeSplits(responses: ReadonlyArray<Resp>): Record<string, [number, number]> {
  const chosen = new Set(responses.map((r) => `${r.questionId}${LET[r.choice]}`));
  const out: Record<string, [number, number]> = {};
  for (const [axis, [a, b]] of Object.entries(OPPOSITES)) {
    out[axis] = [a.filter((x) => chosen.has(x)).length, b.filter((x) => chosen.has(x)).length];
  }
  return out;
}

/**
 * Patterned answering: clicking in a fixed sequence (A-B-C-D-A-B…, or the same letter every time).
 * Real answer sets never repeat at a fixed lag this often; random clicking matches ~25% of the time
 * (99.9th percentile ≈ 0.6), so 0.8 is a safe line. Long repeated runs of 4 answers are the same signal.
 */
export function answerPatternScore(responses: ReadonlyArray<Resp>): { lag: number; repeats: number } {
  const a = [...responses].sort((x, y) => x.questionId - y.questionId).map((r) => r.choice);
  let lag = 0;
  for (let p = 1; p <= 4; p++) {
    let hit = 0;
    for (let i = p; i < a.length; i++) if (a[i] === a[i - p]) hit++;
    if (a.length > p) lag = Math.max(lag, hit / (a.length - p));
  }
  const seen = new Map<string, number>();
  for (let i = 0; i + 4 <= a.length; i++) {
    const k = a.slice(i, i + 4).join("");
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  let repeats = 0;
  for (const v of seen.values()) if (v > 1) repeats += v - 1;
  return { lag: Math.round(lag * 100) / 100, repeats };
}

export type ScatterV5 = {
  /** Answers follow a mechanical sequence (A-B-C-D…, same letter every time). */
  patterned: boolean;
  /** Picked both sides of an explicit opposite at least 3 times each. */
  contradictory: boolean;
  /** Answers don't hang together at all (random-like). */
  randomLike: boolean;
  agreement: number;
  meanCoherence: number;
  splits: Record<string, [number, number]>;
};

export function scatterCheckV5(responses: ReadonlyArray<Resp>, meanCoherence: number): ScatterV5 {
  const splits = oppositeSplits(responses);
  const agreement = answerAgreementV5(responses);
  const contradictory = Object.values(splits).some(([a, b]) => Math.min(a, b) >= 3);
  const oppositeTotal = Object.values(splits).reduce((sum, [a, b]) => sum + Math.min(a, b), 0);
  const randomLike = meanCoherence < 0.12 && agreement < 0 && oppositeTotal >= 3;
  const pat = responses.length >= 24 ? answerPatternScore(responses) : { lag: 0, repeats: 0 };
  const patterned = pat.lag >= 0.8 || pat.repeats >= 18;
  return { patterned, contradictory, randomLike, agreement, meanCoherence, splits };
}
