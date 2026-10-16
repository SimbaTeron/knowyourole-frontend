/**
 * Versioned Shortform scoring used by compute (v3) and the persona harness (v2/v3).
 */
import type { ShortformV2Question } from "@/data/shortformV2Questions";
import { CAREER_SCORE_KEYS, SHORTFORM_V2_QUESTIONS, type CareerKey } from "@/data/shortformV2Questions";
import {
  applyV3RawDeltas,
  computeV3RawDeltas,
  type V3Flags,
  V3_ALL,
} from "@/lib/quiz/shortformV3Adjustments";
import { applyV4OptionRemaps } from "@/lib/quiz/shortformV4Adjustments";
import { detectInconsistency, type InconsistencyReport } from "@/lib/quiz/inconsistencyDetect";
import {
  SCORING_VERSION_V2,
  SCORING_VERSION_V3,
  SCORING_VERSION_V4,
  CAREER_MATCH_VERSION_V2,
  CAREER_MATCH_VERSION_V3,
  CAREER_MATCH_VERSION_V4,
} from "@/lib/quiz/scoringVersions";
import {
  deriveWorkDirection,
  deriveWorkLaneScores,
  deriveWorkDirectionV3,
  type WorkDirection,
  type WorkLaneKey,
  type WorkLaneScores,
} from "@/lib/results/workLanes";
import { getResultClarity, detectFlatAnswerPattern, resolveResultClarityDisplay } from "@/lib/results/resultClarity";
import { getMbtiConfidence, type MbtiConfidence } from "@/lib/quiz/mbtiConfidence";

export type ScoreVersion = "v2" | "v3" | "v4";
export type VersionedResponse = { questionId: number; choice: 0 | 1 | 2 | 3; timeSpent?: number };

export type VersionedScoreMaps = {
  mbti: Record<"E" | "I" | "S" | "N" | "T" | "F" | "J" | "P", number>;
  disc: Record<"D" | "I" | "S" | "C", number>;
  bigFive: Record<"O" | "C" | "E" | "A" | "N", number>;
  career: Record<CareerKey, number>;
};

function emptyMaps(): VersionedScoreMaps {
  return {
    mbti: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
    disc: { D: 0, I: 0, S: 0, C: 0 },
    bigFive: { O: 0, C: 0, E: 0, A: 0, N: 0 },
    career: Object.fromEntries(CAREER_SCORE_KEYS.map((k) => [k, 0])) as Record<CareerKey, number>,
  };
}

type Profile = { expected: number; variance: number };

function buildProfiles(bank: readonly ShortformV2Question[]) {
  const keys = {
    mbti: ["E", "I", "S", "N", "T", "F", "J", "P"],
    disc: ["D", "I", "S", "C"],
    bigFive: ["O", "C", "E", "A", "N"],
  } as const;
  const out: Record<string, Record<string, Profile>> = { mbti: {}, disc: {}, bigFive: {} };
  for (const family of Object.keys(keys) as (keyof typeof keys)[]) {
    for (const key of keys[family]) {
      out[family][key] = bank.reduce(
        (profile, question) => {
          const values = question.answers.map((a) => Number((a.scores as any)[family]?.[key] ?? 0));
          const expected = values.reduce((s, v) => s + v, 0) / Math.max(1, values.length);
          profile.expected += expected;
          profile.variance += values.reduce((s, v) => s + (v - expected) ** 2, 0) / Math.max(1, values.length);
          return profile;
        },
        { expected: 0, variance: 0 },
      );
    }
  }
  return out;
}

const V2_PROFILES = buildProfiles(SHORTFORM_V2_QUESTIONS);

function calibrateValue(raw: number, profile: Profile): number {
  const safe = Number.isFinite(raw) ? raw : profile.expected;
  const sd = Math.max(0.5, Math.sqrt(profile.variance));
  return Math.max(15, Math.min(85, Math.round(50 + ((safe - profile.expected) / sd) * 10)));
}

function calibrate(maps: VersionedScoreMaps): VersionedScoreMaps {
  const out: VersionedScoreMaps = {
    mbti: { ...maps.mbti },
    disc: { ...maps.disc },
    bigFive: { ...maps.bigFive },
    career: { ...maps.career },
  };
  for (const key of Object.keys(out.mbti) as (keyof typeof out.mbti)[]) out.mbti[key] = calibrateValue(out.mbti[key], V2_PROFILES.mbti[key]);
  for (const key of Object.keys(out.disc) as (keyof typeof out.disc)[]) out.disc[key] = calibrateValue(out.disc[key], V2_PROFILES.disc[key]);
  for (const key of Object.keys(out.bigFive) as (keyof typeof out.bigFive)[]) out.bigFive[key] = calibrateValue(out.bigFive[key], V2_PROFILES.bigFive[key]);
  return out;
}

function recompute(responses: VersionedResponse[], bank: readonly ShortformV2Question[]): VersionedScoreMaps {
  const byId = new Map(bank.map((q) => [q.id, q]));
  const scores = emptyMaps();
  for (const response of responses) {
    const q = byId.get(response.questionId);
    if (!q) throw new Error(`unknown question ${response.questionId}`);
    const answer = q.answers[response.choice];
    if (!answer) throw new Error(`missing answer for ${response.questionId}`);
    for (const [k, v] of Object.entries(answer.scores.mbti ?? {})) scores.mbti[k as keyof typeof scores.mbti] += v ?? 0;
    for (const [k, v] of Object.entries(answer.scores.disc ?? {})) scores.disc[k as keyof typeof scores.disc] += v ?? 0;
    for (const [k, v] of Object.entries(answer.scores.bigFive ?? {})) scores.bigFive[k as keyof typeof scores.bigFive] += v ?? 0;
    for (const [k, v] of Object.entries(answer.scores.career ?? {})) scores.career[k as CareerKey] += v ?? 0;
  }
  return scores;
}

function mbtiType(
  m: VersionedScoreMaps["mbti"],
  softAxes = false,
  softGap = 12,
  raw?: VersionedScoreMaps["mbti"],
  rawGap = 8,
): string {
  const axis = (a: keyof typeof m, b: keyof typeof m) => {
    if (softAxes) {
      const calClose = Math.abs(m[a] - m[b]) < softGap;
      const rawClose = raw ? Math.abs(raw[a] - raw[b]) < rawGap : false;
      if (calClose || rawClose) return "X";
    }
    return m[a] >= m[b] ? a : b;
  };
  return axis("E", "I") + axis("S", "N") + axis("T", "F") + axis("J", "P");
}

function discPrimary(d: VersionedScoreMaps["disc"]): string {
  return (Object.entries(d) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

export type VersionedResult = {
  version: ScoreVersion;
  scoringVersion: string;
  careerMatchVersion: string;
  raw: VersionedScoreMaps;
  calibrated: VersionedScoreMaps;
  mbtiType: string;
  mbtiDisplay: string;
  discPrimary: string;
  topTrait: string;
  topTraits: string[];
  clarity: ReturnType<typeof getResultClarity>;
  flat: ReturnType<typeof detectFlatAnswerPattern>;
  clarityDisplay: ReturnType<typeof resolveResultClarityDisplay>;
  direction: WorkDirection;
  altDirections: WorkDirection[];
  nTier: "low" | "medium" | "high";
  mbtiConfidence: MbtiConfidence;
  inconsistency: InconsistencyReport;
};

export function scoreShortformVersioned(
  responses: VersionedResponse[],
  version: ScoreVersion,
  flags: V3Flags = V3_ALL,
): VersionedResult {
  let raw = recompute(responses, SHORTFORM_V2_QUESTIONS);
  if (version === "v3" || version === "v4") {
    raw = applyV3RawDeltas(raw, computeV3RawDeltas(responses, flags));
  }
  if (version === "v4") {
    raw = applyV4OptionRemaps(raw, responses);
  }
  const calibrated = calibrate(raw);
  const maxCareer = Math.max(...Object.values(calibrated.career).map((v) => Number(v) || 0));
  const useV3Clarity = version === "v3" || version === "v4";
  const clarityOpts = useV3Clarity ? { version: "v3" as const, maxCareer } : {};
  let clarity = getResultClarity(calibrated.bigFive, clarityOpts);
  const flat = detectFlatAnswerPattern(responses);
  const inconsistency = version === "v4"
    ? detectInconsistency(responses)
    : { flagged: false, reasons: [], contradictionPairs: 0, entropy: 0, safeDefaultCount: 0, note: "" };
  // Guarded / contradictory patterns: do not leave a confident Clear label.
  if (version === "v4" && inconsistency.flagged && clarity.level === "clear") {
    clarity = { ...clarity, level: "mixed", label: "Mixed", body: clarity.body };
  }
  let clarityDisplay = resolveResultClarityDisplay(calibrated.bigFive, responses, clarityOpts);
  if (version === "v4" && inconsistency.flagged) {
    clarityDisplay = {
      ...clarityDisplay,
      kind: clarity.level === "broad" ? "broad" : "mixed",
      heading: clarity.level === "broad" ? clarityDisplay.heading : "Result clarity: Mixed",
      body: inconsistency.note || clarityDisplay.body,
    };
  }
  const type = mbtiType(calibrated.mbti, false);
  const broadForConf = clarity.level === "broad" || (version === "v4" && inconsistency.flagged);
  const mbtiConfidence = version === "v3" || version === "v4"
    ? getMbtiConfidence(calibrated.mbti, raw.mbti, { broad: broadForConf })
    : getMbtiConfidence(calibrated.mbti, undefined, { broad: false });
  // Prefer detector note when flagged and confidence note empty / broad-generic
  if (version === "v4" && inconsistency.flagged && inconsistency.note) {
    if (!mbtiConfidence.note || /directional sketch|broad/i.test(mbtiConfidence.note)) {
      mbtiConfidence.note = inconsistency.note;
      if (!mbtiConfidence.badge) mbtiConfidence.badge = "rough sketch";
    }
  }
  const display = mbtiConfidence.type;
  const ranked = (Object.entries(calibrated.bigFive) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const lanes = deriveWorkLaneScores(calibrated.career)!;
  const direction =
    version === "v3" || version === "v4"
      ? deriveWorkDirectionV3(calibrated.career, lanes)
      : deriveWorkDirection(calibrated.career, lanes);
  const altDirections =
    (version === "v3" || version === "v4") && (clarity.level === "broad" || inconsistency.flagged)
      ? buildAltDirections(calibrated.career, lanes, direction)
      : [];
  const n = calibrated.bigFive.N;
  const scoringVersion =
    version === "v4" ? SCORING_VERSION_V4 : version === "v3" ? SCORING_VERSION_V3 : SCORING_VERSION_V2;
  const careerMatchVersion =
    version === "v4" ? CAREER_MATCH_VERSION_V4 : version === "v3" ? CAREER_MATCH_VERSION_V3 : CAREER_MATCH_VERSION_V2;
  return {
    version,
    scoringVersion,
    careerMatchVersion,
    raw,
    calibrated,
    mbtiType: type,
    mbtiDisplay: display,
    discPrimary: discPrimary(calibrated.disc),
    topTrait: ranked[0][0],
    topTraits: ranked.map(([k]) => k),
    clarity,
    flat,
    clarityDisplay,
    direction,
    altDirections,
    nTier: n >= 67 ? "high" : n <= 33 ? "low" : "medium",
    mbtiConfidence,
    inconsistency,
  };
}

function buildAltDirections(
  career: VersionedScoreMaps["career"],
  lanes: WorkLaneScores,
  primary: WorkDirection,
): WorkDirection[] {
  const ranked = (Object.entries(lanes) as [WorkLaneKey, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .filter((k) => k !== primary.laneKey)
    .slice(0, 2);
  const alts: WorkDirection[] = [];
  for (const key of ranked) {
    const d = deriveWorkDirectionV3(career, lanes, key);
    if (d.title !== primary.title) alts.push(d);
  }
  return alts.slice(0, 2);
}
