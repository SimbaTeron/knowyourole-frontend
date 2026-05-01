import { calculatePersonality, validateInput, type ScoresData } from "@/lib/scoring";
import { calculateResult, type PersonalityResult } from "@/components/results/resultsData";

/**
 * Canonical Autonomous Results Engine DTO builder.
 *
 * This file is intentionally UI-free. It is the bridge between the current legacy
 * quiz/scoring objects and the future single source of truth consumed by:
 * results UI, Supabase persistence, premium insights, career matching, analytics,
 * adaptive quiz confidence, and future AI-generated result sections.
 */

export const RESULT_DTO_SCHEMA_VERSION = "1.0.0" as const;
export type ISODateString = string;
export type UUIDString = string;
export type Percent = number;
export type Score = number;

export type AgeTier = "7-12" | "13-18" | "19-25" | "25plus" | "unknown";
export type ResultSource = "live_quiz" | "dev_test" | "randomized_preview" | "imported" | "admin_seed";
export type ResultVisibility = "anonymous" | "authenticated" | "premium" | "admin";
export type MBTILetter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
export type MBTIDimensionKey = "EI" | "SN" | "TF" | "JP";
export type MBTIType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP" | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ" | "ISTP" | "ISFP" | "ESTP" | "ESFP" | "XXXX";
export type DISCStyle = "D" | "I" | "S" | "C" | "Balanced";
export type BigFiveTrait = "O" | "C" | "E" | "A" | "N";
export type ConfidenceLevel = "low" | "medium" | "high";
export type InsightKind =
  | "strength" | "blindspot" | "career" | "growth" | "communication"
  | "relationship" | "work_environment" | "side_hustle" | "dream_role"
  | "energy_productivity" | "custom_ai";
export type GrowthPlanStatus = "not_started" | "active" | "paused" | "completed";

export interface ResultDTOVersion {
  /** DTO contract version. Increment only when the persisted/returned shape changes. */
  schemaVersion: typeof RESULT_DTO_SCHEMA_VERSION;
  /** Deterministic scoring engine version. Used to compare old vs new scoring output. */
  scoringVersion: string;
  /** Optional copy/AI prompt version once narrative generation is introduced. */
  narrativeVersion?: string;
  /** Optional career matching version once role matching is extracted. */
  careerMatchVersion?: string;
}

export interface ResultPersistenceMeta {
  /** Supabase quiz_results id. Generated before persistence so clients can reference it immediately. */
  resultId: UUIDString;
  /** Quiz/session id linking quiz_sessions, quiz_results, analytics, and UI. */
  sessionId: string;
  /** Authenticated user id when known; null for anonymous completions. */
  userId: string | null;
  /** Runtime source: live, dev preview, imported, etc. */
  source: ResultSource;
  /** Access context for downstream UI and analytics. */
  visibility: ResultVisibility;
  /** App/server creation timestamp. */
  createdAt: ISODateString;
  /** App/server update timestamp. Mirrors future Supabase updated_at. */
  updatedAt: ISODateString;
  /** Soft-delete state. Mirrors future Supabase deleted. */
  deleted: boolean;
  /** Optional deployment/debug context. */
  runtime?: { environment?: "local" | "preview" | "production"; domain?: string; buildId?: string; commitSha?: string };
}

export interface RawQuizAnswer {
  /** Stable question id from questions.json or future adaptive generator. */
  questionId: string | number;
  /** Raw selected value: binary, slider, multi-choice, or adaptive answer. */
  value?: unknown;
  /** Current binary/swipe choice. */
  choice?: 0 | 1;
  /** Slider response value where present. */
  sliderValue?: number;
  /** Time spent answering. Used for confidence and analytics. */
  timeSpent?: number;
  /** Swipe direction for mobile interaction analytics. */
  swipeDirection?: "left" | "right" | "none";
  /** Trait/framework tag attached to the question. */
  psych?: string;
  /** Raw scoring weights, if captured. */
  weights?: Partial<{ mbti: Partial<Record<MBTILetter, Score>>; disc: Partial<Record<DISCStyle, Score>>; bigFive: Partial<Record<BigFiveTrait, Score>> }>;
}

export interface ResultRawInputs {
  /** Age tier controls question selection and copy tone. */
  tier: AgeTier;
  /** Selected mood. */
  mood?: string;
  /** Mood mixer blend. */
  moodBlend?: string;
  /** Playful mode flag. */
  funMode?: boolean;
  /** Location/theme context used for optional personalization. */
  locality?: { city?: string; state?: string; country?: string; postalCode?: string; landmark?: string; theme?: string };
  /** Replayable answer source for recomputation and audits. */
  responses: RawQuizAnswer[];
  /** Legacy score object retained during migration. */
  legacyScores?: unknown;
  /** Dev/test context. Never treat as live behavior. */
  devContext?: { forcedMBTI?: string; randomizedSeed?: string; randomizeButtonUsed?: boolean; testPremium?: boolean };
}

export interface FrameworkScore<TCode extends string> {
  /** Stable framework code. */
  code: TCode;
  /** Raw answer-derived score. */
  raw: Score;
  /** 0-100 UI/persistence score. */
  normalized: Percent;
  /** 0-100 reliability estimate. */
  confidence: Percent;
  /** UI-friendly confidence bucket. */
  confidenceLevel: ConfidenceLevel;
}

export interface MBTIDimensionScore {
  /** Dimension key. */
  dimension: MBTIDimensionKey;
  left: MBTILetter;
  right: MBTILetter;
  leftRaw: Score;
  rightRaw: Score;
  /** Winning pole or X when ambiguous. */
  dominant: MBTILetter | "X";
  /** Absolute strength away from center. */
  dominance: Percent;
  /** Reliability for adaptive follow-up. */
  confidence: Percent;
  /** True when scores are too close to call. */
  isHybrid: boolean;
}

export interface BipolarBarDTO {
  /** Bar dimension key. */
  dimension: MBTIDimensionKey;
  leftLabel: string;
  rightLabel: string;
  leftCode: MBTILetter;
  rightCode: MBTILetter;
  /** -100 favors left, +100 favors right. */
  position: number;
  /** Absolute distance from center, 0-100. */
  strength: Percent;
  /** One-line UI summary. */
  summary: string;
  /** Bar confidence. */
  confidence: Percent;
}

export interface MBTIResult {
  /** Final 4-letter MBTI type. */
  type: MBTIType;
  variant?: "A" | "T";
  title: string;
  spark: string;
  scores: Record<MBTILetter, FrameworkScore<MBTILetter>>;
  dimensions: Record<MBTIDimensionKey, MBTIDimensionScore>;
  confidence: Percent;
}

export interface DISCResult {
  /** Primary DISC code. */
  primary: DISCStyle;
  secondary?: DISCStyle;
  title: string;
  summary: string;
  scores: Record<DISCStyle, FrameworkScore<DISCStyle>>;
  confidence: Percent;
}

export interface BigFiveTraitResult extends FrameworkScore<BigFiveTrait> {
  label: string;
  tier: "low" | "medium" | "high";
  summary: string;
}

export interface BigFiveResult {
  traits: Record<BigFiveTrait, BigFiveTraitResult>;
  dominantTrait: BigFiveTrait;
  topTraits: BigFiveTrait[];
  confidence: Percent;
}

export interface AdaptiveConfidenceDTO {
  /** Overall confidence used by future real-time adaptive quiz stopping logic. */
  completionConfidence: Percent;
  /** Weak dimensions/traits future adaptive quiz should probe. */
  weakSignals: Array<MBTIDimensionKey | DISCStyle | BigFiveTrait>;
  /** Future question generator targets. */
  recommendedQuestionTargets: string[];
  answeredCount: number;
  incompleteCount?: number;
  averageResponseTime?: number;
}

export interface PersonalityScoresDTO {
  mbti: MBTIResult;
  disc: DISCResult;
  bigFive: BigFiveResult;
  bipolarBars: Record<MBTIDimensionKey, BipolarBarDTO>;
  adaptive: AdaptiveConfidenceDTO;
  /** Namespaced future framework scores. */
  extensions?: Record<string, unknown>;
}

export interface NarrativeCopyDTO {
  headline: string;
  shortSummary: string;
  quickGlimpse: string;
  fullPortrait: string;
  premiumNexus?: string;
  communicationStyle?: string;
  workStyle?: string;
  relationshipStyle?: string;
  confidenceNote?: string;
  /** Future AI-generated sections with model/prompt provenance. */
  aiSections?: Array<{ id: string; title: string; body: string; model?: string; promptVersion?: string }>;
}

export interface CareerMatchDTO {
  roleId: string;
  title: string;
  matchPercent: Percent;
  reasoning: string;
  drivers: string[];
  cautions?: string[];
  marketData?: { salaryRange?: string; demand?: "low" | "medium" | "high"; remoteFriendly?: boolean; region?: string };
  nextSteps?: string[];
}

export interface PremiumInsightDTO {
  id: string;
  kind: InsightKind;
  title: string;
  body: string;
  action?: string;
  relevance: Percent;
  gated: boolean;
  aiMeta?: { model?: string; promptVersion?: string; generatedAt?: ISODateString };
}

export interface EnergyProductivityPatternDTO {
  /** Future energy/productivity pattern layer; not EV-specific unless product pivots. */
  pattern: string;
  bestEnvironment?: string;
  cadence?: string;
  risks?: string[];
  recommendations?: string[];
}

export interface GrowthPlanDTO {
  /** Skeleton for future personal growth/career agent. */
  status: GrowthPlanStatus;
  goalType?: "career" | "self_awareness" | "relationships" | "productivity" | "leadership" | "custom";
  targets: string[];
  recommendedActions: Array<{ id: string; title: string; description: string; effort: "low" | "medium" | "high"; timeframe: "today" | "this_week" | "this_month" | "ongoing" }>;
  weeklyCheckins?: Array<{ week: number; prompt: string; metric?: string }>;
  agentContext?: Record<string, unknown>;
}

export interface ResultAuditDTO {
  overallConfidence: Percent;
  warnings: string[];
  recoverableErrors: string[];
  usedFallbacks: boolean;
  fallbackFields?: string[];
  trace?: { requestId?: string; computeId?: string; persistenceAttemptId?: string };
  scoringAudit?: { totalQuestions: number; scoredQuestions: number; skippedQuestions: number; hybridDimensions: MBTIDimensionKey[]; normalizationApplied: boolean };
}

export interface ResultDTO {
  version: ResultDTOVersion;
  meta: ResultPersistenceMeta;
  raw: ResultRawInputs;
  scores: PersonalityScoresDTO;
  narrative: NarrativeCopyDTO;
  careerMatches: CareerMatchDTO[];
  premiumInsights: PremiumInsightDTO[];
  growthPlan: GrowthPlanDTO;
  energyProductivity?: EnergyProductivityPatternDTO;
  audit: ResultAuditDTO;
  extensions?: Record<string, unknown>;
}

export interface ResultDTOValidationResult { ok: boolean; errors: string[] }

export interface BuildResultDTOInput {
  /** Current raw quiz payload shape. Usually the POST body sent by /api/results/compute. */
  scores: ScoresData;
  tier?: string;
  mood?: string;
  moodBlend?: string;
  funMode?: boolean;
  landmark?: string;
  theme?: string;
  sessionId?: string;
  userId?: string | null;
  source?: ResultSource;
  visibility?: ResultVisibility;
  legacyResult?: PersonalityResult;
  requestId?: string;
  runtime?: ResultPersistenceMeta["runtime"];
}

export interface BuildResultDTOOutput {
  result: ResultDTO;
  validation: ResultDTOValidationResult;
}

const MBTI_PAIRS: Array<{ dimension: MBTIDimensionKey; left: MBTILetter; right: MBTILetter; leftLabel: string; rightLabel: string }> = [
  { dimension: "EI", left: "E", right: "I", leftLabel: "Extraversion", rightLabel: "Introversion" },
  { dimension: "SN", left: "S", right: "N", leftLabel: "Sensing", rightLabel: "Intuition" },
  { dimension: "TF", left: "T", right: "F", leftLabel: "Thinking", rightLabel: "Feeling" },
  { dimension: "JP", left: "J", right: "P", leftLabel: "Judging", rightLabel: "Perceiving" },
];

const BIG_FIVE_LABELS: Record<BigFiveTrait, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Neuroticism",
};

const DISC_TITLES: Record<DISCStyle, string> = {
  D: "Direct Driver",
  I: "Inspiring Influencer",
  S: "Steady Supporter",
  C: "Careful Analyst",
  Balanced: "Balanced Style",
};

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
const pct = (value: number): Percent => Math.round(clamp(value));
const confidenceLevel = (confidence: Percent): ConfidenceLevel => confidence >= 75 ? "high" : confidence >= 45 ? "medium" : "low";
const createId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function frameworkScore<TCode extends string>(code: TCode, raw: number, normalized?: number, confidence?: number): FrameworkScore<TCode> {
  const finalConfidence = pct(confidence ?? Math.min(95, Math.max(35, Math.abs(raw) * 12)));
  return { code, raw, normalized: pct(normalized ?? raw), confidence: finalConfidence, confidenceLevel: confidenceLevel(finalConfidence) };
}

function buildMbti(scores: ScoresData, legacy: PersonalityResult, advanced: any): MBTIResult {
  const raw = scores.mbti as Record<MBTILetter, number>;
  const scoreMap = Object.fromEntries(([
    "E", "I", "S", "N", "T", "F", "J", "P",
  ] as MBTILetter[]).map((letter) => [letter, frameworkScore(letter, raw[letter] ?? 0, raw[letter] ?? 0)])) as Record<MBTILetter, FrameworkScore<MBTILetter>>;

  const dimensions = Object.fromEntries(MBTI_PAIRS.map((pair) => {
    const leftRaw = raw[pair.left] ?? 0;
    const rightRaw = raw[pair.right] ?? 0;
    const total = Math.max(1, Math.abs(leftRaw) + Math.abs(rightRaw));
    const diff = leftRaw - rightRaw;
    const strength = pct((Math.abs(diff) / total) * 100);
    const isHybrid = strength < 15;
    const dominant = isHybrid ? "X" : diff >= 0 ? pair.left : pair.right;
    return [pair.dimension, { dimension: pair.dimension, left: pair.left, right: pair.right, leftRaw, rightRaw, dominant, dominance: strength, confidence: pct(Math.max(35, strength)), isHybrid }];
  })) as Record<MBTIDimensionKey, MBTIDimensionScore>;

  const dimensionConfidences = Object.values(dimensions).map((d) => d.confidence);
  return {
    type: normalizeMBTIType(legacy.mbtiType || advanced?.mbtiType),
    title: legacy.mbtiLabel || advanced?.title || "Personality Profile",
    spark: legacy.spark || advanced?.spark || legacy.mbtiDesc || "A distinctive blend of traits and motivations.",
    scores: scoreMap,
    dimensions,
    confidence: pct(dimensionConfidences.reduce((a, b) => a + b, 0) / dimensionConfidences.length),
  };
}

function buildBipolarBars(mbti: MBTIResult): Record<MBTIDimensionKey, BipolarBarDTO> {
  return Object.fromEntries(MBTI_PAIRS.map((pair) => {
    const dimension = mbti.dimensions[pair.dimension];
    const position = dimension.dominant === "X" ? 0 : dimension.dominant === pair.left ? -dimension.dominance : dimension.dominance;
    const favored = position < 0 ? pair.leftLabel : position > 0 ? pair.rightLabel : "Balanced";
    return [pair.dimension, { dimension: pair.dimension, leftLabel: pair.leftLabel, rightLabel: pair.rightLabel, leftCode: pair.left, rightCode: pair.right, position, strength: dimension.dominance, summary: `${favored} signal (${dimension.dominance}%)`, confidence: dimension.confidence }];
  })) as Record<MBTIDimensionKey, BipolarBarDTO>;
}

function buildDisc(scores: ScoresData, legacy: PersonalityResult): DISCResult {
  const raw = scores.disc as Record<DISCStyle, number>;
  const codes: DISCStyle[] = ["D", "I", "S", "C"];
  const total = Math.max(1, codes.reduce((sum, code) => sum + Math.max(0, raw[code] ?? 0), 0));
  const primary = normalizeDISC((legacy.discStyle?.length === 1 ? legacy.discStyle : undefined) || codes.reduce((a, b) => (raw[a] ?? 0) >= (raw[b] ?? 0) ? a : b));
  const scoreMap = Object.fromEntries(codes.map((code) => [code, frameworkScore(code, raw[code] ?? 0, ((raw[code] ?? 0) / total) * 100)])) as Record<DISCStyle, FrameworkScore<DISCStyle>>;
  scoreMap.Balanced = frameworkScore("Balanced", 0, 0, 50);
  return { primary, title: legacy.discLabel || DISC_TITLES[primary], summary: legacy.discDesc || DISC_TITLES[primary], scores: scoreMap, confidence: scoreMap[primary].normalized };
}

function buildBigFive(scores: ScoresData, legacy: PersonalityResult): BigFiveResult {
  const raw = scores.bigFive as Record<BigFiveTrait, number>;
  const normalized = legacy.bigFiveProfile;
  const traits = Object.fromEntries(([
    "O", "C", "E", "A", "N",
  ] as BigFiveTrait[]).map((code) => {
    const value = pct(normalized?.[code] ?? raw[code] ?? 50);
    const tier: BigFiveTraitResult["tier"] = value >= 67 ? "high" : value <= 33 ? "low" : "medium";
    return [code, { ...frameworkScore(code, raw[code] ?? value, value, Math.max(45, Math.abs(value - 50) * 1.5)), label: BIG_FIVE_LABELS[code], tier, summary: legacy.bigFiveLabels?.[code]?.[tier === "low" ? "low" : "high"] || `${BIG_FIVE_LABELS[code]} is ${tier}.` }];
  })) as Record<BigFiveTrait, BigFiveTraitResult>;
  const topTraits = (Object.keys(traits) as BigFiveTrait[]).sort((a, b) => traits[b].normalized - traits[a].normalized);
  return { traits, dominantTrait: topTraits[0], topTraits, confidence: pct(topTraits.reduce((sum, code) => sum + traits[code].confidence, 0) / topTraits.length) };
}

function buildAdaptive(scores: ScoresData, mbti: MBTIResult, disc: DISCResult, bigFive: BigFiveResult, advanced: any): AdaptiveConfidenceDTO {
  const weakSignals: AdaptiveConfidenceDTO["weakSignals"] = [];
  Object.values(mbti.dimensions).forEach((d) => { if (d.confidence < 45) weakSignals.push(d.dimension); });
  if (disc.confidence < 35) weakSignals.push(disc.primary);
  Object.values(bigFive.traits).forEach((t) => { if (t.confidence < 45) weakSignals.push(t.code); });
  return {
    completionConfidence: pct((mbti.confidence + disc.confidence + bigFive.confidence) / 3),
    weakSignals,
    recommendedQuestionTargets: weakSignals.map(String),
    answeredCount: scores.responses?.length ?? advanced?.totalQuestions ?? 0,
    incompleteCount: 0,
    averageResponseTime: advanced?.avgResponseTime ?? scores.averageSwipeTime,
  };
}

function buildCareerMatches(legacy: PersonalityResult, scores: PersonalityScoresDTO): CareerMatchDTO[] {
  const primaryTitle = legacy.primaryRole?.title || "Personalized Career Match";
  const secondaryTitle = legacy.secondaryRole?.title || "Secondary Career Match";
  return [
    { roleId: slugify(primaryTitle), title: primaryTitle, matchPercent: pct(88), reasoning: legacy.primaryRole?.desc || `Strong fit for ${scores.mbti.type}/${scores.disc.primary} with ${scores.bigFive.dominantTrait} dominance.`, drivers: [scores.mbti.type, scores.disc.primary, scores.bigFive.dominantTrait], marketData: { salaryRange: legacy.primaryRole?.salary } },
    { roleId: slugify(secondaryTitle), title: secondaryTitle, matchPercent: pct(76), reasoning: legacy.secondaryRole?.desc || "Secondary fit based on adjacent trait strengths.", drivers: [scores.mbti.type, scores.bigFive.topTraits[1] ?? scores.bigFive.dominantTrait], marketData: { salaryRange: legacy.secondaryRole?.salary } },
  ];
}

function normalizeMBTIType(value: unknown): MBTIType {
  const v = typeof value === "string" ? value.replace(/[^A-Z]/g, "").slice(0, 4) : "XXXX";
  return (/^[EI][SN][TF][JP]$/.test(v) ? v : "XXXX") as MBTIType;
}

function normalizeDISC(value: unknown): DISCStyle {
  return value === "D" || value === "I" || value === "S" || value === "C" ? value : "Balanced";
}

function normalizeTier(value: unknown): AgeTier {
  return value === "7-12" || value === "13-18" || value === "19-25" || value === "25plus" ? value : "unknown";
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "role-match";
}

/** Lightweight runtime validator for the future /api/results/compute boundary. */
export function validateResultDTO(value: unknown): ResultDTOValidationResult {
  const errors: string[] = [];
  const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
  const isPercent = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;
  if (!isObject(value)) return { ok: false, errors: ["ResultDTO must be an object"] };
  for (const key of ["version", "meta", "raw", "scores", "narrative", "growthPlan", "audit"] as const) if (!isObject(value[key])) errors.push(`Missing object: ${key}`);
  if (!Array.isArray(value.careerMatches)) errors.push("careerMatches must be an array");
  if (!Array.isArray(value.premiumInsights)) errors.push("premiumInsights must be an array");
  if (isObject(value.version) && value.version.schemaVersion !== RESULT_DTO_SCHEMA_VERSION) errors.push(`Unsupported schemaVersion: ${String(value.version.schemaVersion)}`);
  if (isObject(value.meta)) {
    for (const key of ["resultId", "sessionId", "source", "visibility", "createdAt", "updatedAt"] as const) if (typeof value.meta[key] !== "string" || !value.meta[key]) errors.push(`Missing meta.${key}`);
    if (typeof value.meta.deleted !== "boolean") errors.push("meta.deleted must be boolean");
  }
  if (isObject(value.raw) && !Array.isArray(value.raw.responses)) errors.push("raw.responses must be an array");
  const scores = value.scores;
  if (isObject(scores)) {
    if (!isObject(scores.mbti) || !isPercent(scores.mbti.confidence)) errors.push("scores.mbti.confidence must be 0-100");
    if (!isObject(scores.disc) || !isPercent(scores.disc.confidence)) errors.push("scores.disc.confidence must be 0-100");
    if (!isObject(scores.bigFive) || !isPercent(scores.bigFive.confidence)) errors.push("scores.bigFive.confidence must be 0-100");
    if (!isObject(scores.adaptive) || !isPercent(scores.adaptive.completionConfidence)) errors.push("scores.adaptive.completionConfidence must be 0-100");
  }
  if (isObject(value.audit) && !isPercent(value.audit.overallConfidence)) errors.push("audit.overallConfidence must be 0-100");
  return { ok: errors.length === 0, errors };
}

/**
 * Builds the canonical ResultDTO while reusing current deterministic scoring logic.
 * This is the first single-source-of-truth seam: legacy shapes come in, canonical
 * DTO comes out. UI wiring and full persistence normalization happen next.
 */
export function buildResultDTO(input: BuildResultDTOInput): BuildResultDTOOutput {
  const validatedInput = validateInput({ ...input, scores: input.scores });
  if (!validatedInput.valid) {
    throw new Error(validatedInput.error);
  }

  const now = new Date().toISOString();
  const sessionId = input.sessionId || createId("quiz");
  const resultId = createId("result");

  const advanced = calculatePersonality({ tier: input.tier, mood: input.mood, funMode: input.funMode, landmark: input.landmark, theme: input.theme, scores: input.scores });
  const legacy = input.legacyResult ?? calculateResult(input.scores as any);

  const mbti = buildMbti(input.scores, legacy, advanced);
  const disc = buildDisc(input.scores, legacy);
  const bigFive = buildBigFive(input.scores, legacy);
  const bipolarBars = buildBipolarBars(mbti);
  const adaptive = buildAdaptive(input.scores, mbti, disc, bigFive, advanced);
  const scores: PersonalityScoresDTO = { mbti, disc, bigFive, bipolarBars, adaptive, extensions: { legacyAdvanced: advanced } };
  const overallConfidence = pct((mbti.confidence + disc.confidence + bigFive.confidence + adaptive.completionConfidence) / 4);

  const result: ResultDTO = {
    version: { schemaVersion: RESULT_DTO_SCHEMA_VERSION, scoringVersion: "legacy-scoring-adapter-1.0.0", narrativeVersion: "legacy-copy-1.0.0", careerMatchVersion: "legacy-role-match-1.0.0" },
    meta: { resultId, sessionId, userId: input.userId ?? null, source: input.source ?? "live_quiz", visibility: input.visibility ?? (input.userId ? "authenticated" : "anonymous"), createdAt: now, updatedAt: now, deleted: false, runtime: input.runtime },
    raw: { tier: normalizeTier(input.tier), mood: input.mood, moodBlend: input.moodBlend, funMode: input.funMode, locality: { landmark: input.landmark, theme: input.theme }, responses: (input.scores.responses ?? []).map((r) => ({ questionId: r.questionId, value: r.sliderValue ?? r.choice, choice: r.choice, sliderValue: r.sliderValue, timeSpent: r.timeSpent, swipeDirection: r.swipeDirection ?? "none", psych: r.psych })), legacyScores: input.scores },
    scores,
    narrative: {
      headline: `${mbti.type} · ${mbti.title}`,
      shortSummary: legacy.mbtiDesc || mbti.spark,
      quickGlimpse: `${mbti.title} with a ${disc.title} communication style and ${BIG_FIVE_LABELS[bigFive.dominantTrait]} as the dominant Big Five signal.`,
      fullPortrait: legacy.mbtiDesc || "Your result blends personality, behavior, and career fit into one profile.",
      premiumNexus: "Deeper career, growth, communication, and blindspot insights can be generated from this canonical result.",
      communicationStyle: disc.summary,
      workStyle: legacy.primaryRole?.desc,
      confidenceNote: overallConfidence < 55 ? "Some signals were close or low-confidence; adaptive follow-up questions would improve precision." : undefined,
    },
    careerMatches: buildCareerMatches(legacy, scores),
    premiumInsights: [
      { id: "growth-start", kind: "growth", title: "Growth starting point", body: `Start with actions that use your ${BIG_FIVE_LABELS[bigFive.dominantTrait]} strength without over-relying on it.`, action: "Pick one recommended action and test it this week.", relevance: pct(82), gated: false },
    ],
    growthPlan: {
      status: "not_started",
      goalType: "career",
      targets: [legacy.primaryRole?.title || "Clarify best-fit career direction"],
      recommendedActions: [{ id: "career-reflection-1", title: "Validate your top role", description: "Compare your top career match against your current interests, skills, and energy patterns.", effort: "low", timeframe: "this_week" }],
      weeklyCheckins: [{ week: 1, prompt: "Did your top role feel energizing, realistic, and worth exploring?", metric: "career_fit_confidence" }],
    },
    energyProductivity: { pattern: `${mbti.type}/${disc.primary} productivity pattern`, recommendations: ["Use this result to identify work conditions that protect energy and increase follow-through."] },
    audit: { overallConfidence, warnings: adaptive.weakSignals.length ? [`Weak signals: ${adaptive.weakSignals.join(", ")}`] : [], recoverableErrors: [], usedFallbacks: mbti.type === "XXXX", fallbackFields: mbti.type === "XXXX" ? ["scores.mbti.type"] : [], trace: { requestId: input.requestId, computeId: resultId }, scoringAudit: { totalQuestions: input.scores.responses?.length ?? 0, scoredQuestions: input.scores.responses?.length ?? 0, skippedQuestions: 0, hybridDimensions: Object.values(mbti.dimensions).filter((d) => d.isHybrid).map((d) => d.dimension), normalizationApplied: true } },
  };

  return { result, validation: validateResultDTO(result) };
}

/**
 * Smoke-test example for future local/manual use:
 *
 * const smoke = buildResultDTO({
 *   tier: "19-25",
 *   mood: "focused",
 *   scores: {
 *     mbti: { E: 4, I: 2, S: 2, N: 5, T: 5, F: 2, J: 3, P: 4 },
 *     disc: { D: 3, I: 2, S: 1, C: 4 },
 *     bigFive: { O: 6, C: 5, E: 4, A: 3, N: 2 },
 *     responses: [{ questionId: 1, choice: 1, timeSpent: 2.4, psych: "MBTI_N" }],
 *     engagement: 1,
 *     averageSwipeTime: 2.4,
 *   },
 * });
 * console.log(smoke.validation.ok, smoke.result.scores.mbti.type);
 */
