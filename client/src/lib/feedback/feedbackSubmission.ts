import { z } from "zod";

/** Matches the previous route cap. Also applied to the raw body, not only Content-Length. */
export const FEEDBACK_MAX_BYTES = 16_384;
export const FEEDBACK_RATE_LIMIT = 8;
export const FEEDBACK_RATE_WINDOW_MS = 60_000;

const text = z.string().trim().max(1_000);
const optionalText = text.nullish();
const score = z.number().finite().min(0).max(10).nullish();
const flag = z.boolean().nullish();

/**
 * Optional address from the /feedback "stay in the loop" field.
 * Blank is allowed and stored as null. Anything that is not an email is rejected.
 */
const optionalEmail = z.union([z.string().trim().email().max(254), z.literal("")]).nullish();

export const feedbackRequestSchema = z
  .object({
    session_id: optionalText,
    sessionId: optionalText,
    useful_app: optionalText,
    usefulApp: optionalText,
    results_accurate: optionalText,
    resultsAccurate: optionalText,
    questions_engaging: optionalText,
    questionsEngaging: optionalText,
    would_share: optionalText,
    wouldShare: optionalText,
    suggestions: optionalText,
    mbti_type: optionalText,
    mbtiType: optionalText,
    disc_style: optionalText,
    discStyle: optionalText,
    primary_role: optionalText,
    primaryRole: optionalText,
    tier: optionalText,
    mood: optionalText,
    fun_mode: flag,
    funMode: flag,
    timestamp: z.string().trim().max(40).nullish(),
    first_reaction: optionalText,
    firstReaction: optionalText,
    first_reaction_text: optionalText,
    firstReactionText: optionalText,
    accuracy_score: score,
    accuracyScore: score,
    accuracy_surprise: optionalText,
    accuracySurprise: optionalText,
    personality_rating: score,
    personalityRating: score,
    career_rating: score,
    careerRating: score,
    mood_lab_rating: score,
    moodLabRating: score,
    visual_rating: score,
    visualRating: score,
    share_card_rating: score,
    shareCardRating: score,
    most_valuable_feature: optionalText,
    mostValuableFeature: optionalText,
    retake_quiz: optionalText,
    retakeQuiz: optionalText,
    shared_results: optionalText,
    sharedResults: optionalText,
    nps_score: score,
    npsScore: score,
    career_relevance: score,
    careerRelevance: score,
    feels_designed_for_you: optionalText,
    feelsDesignedForYou: optionalText,
    college_suggestions: optionalText,
    collegeSuggestions: optionalText,
    bugs_issues: optionalText,
    bugsIssues: optionalText,
    email: optionalEmail,
    anything_else: optionalText,
    anythingElse: optionalText,
    quiz_type: optionalText,
    quizType: optionalText,
    resultId: z.string().trim().min(8).max(160).nullish(),
    result_id: z.string().trim().min(8).max(160).nullish(),
  })
  .strict();

export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

function firstDefined<T>(...values: (T | null | undefined)[]): T | null {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

export type FeedbackInsert = {
  session_id: string | null;
  useful_app: string | null;
  results_accurate: string | null;
  questions_engaging: string | null;
  would_share: string | null;
  suggestions: string | null;
  mbti_type: string | null;
  disc_style: string | null;
  primary_role: string | null;
  tier: string | null;
  mood: string | null;
  fun_mode: boolean | null;
  first_reaction: string | null;
  first_reaction_text: string | null;
  accuracy_score: number | null;
  accuracy_surprise: string | null;
  personality_rating: number | null;
  career_rating: number | null;
  mood_lab_rating: number | null;
  visual_rating: number | null;
  share_card_rating: number | null;
  most_valuable_feature: string | null;
  retake_quiz: string | null;
  shared_results: string | null;
  nps_score: number | null;
  career_relevance: number | null;
  feels_designed_for_you: string | null;
  college_suggestions: string | null;
  bugs_issues: string | null;
  email: string | null;
  anything_else: string | null;
  quiz_type: string | null;
};

const ONE_TO_FIVE_FIELDS = [
  "personality_rating",
  "career_rating",
  "mood_lab_rating",
  "visual_rating",
  "share_card_rating",
  "career_relevance",
] as const;

/** Legacy results modal choices, including the older "mostly" label. */
const LEGACY_FIT = new Set(["yes", "no", "somewhat", "mostly"]);
/** Old /feedback yes-no controls. Free text in these columns does not count. */
const RETAKE_FIT = new Set(["yes", "no", "maybe"]);
const SHARED_FIT = new Set(["yes", "no", "yes, already!", "plan to", "not really"]);
const DESIGNED_FIT = new Set(["yes", "no", "yes, totally", "a little off", "not really", "mostly"]);

function isIntegerInRange(value: number | null, min: number, max: number): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

function choiceToken(value: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

/**
 * Old-style feedback rows need a real answer: a 1–5 rating (or the old
 * accuracy 1–10 / recommend 0–10 scales) or a known yes/no fit choice.
 * Free text, email, and result labels alone are not an answer.
 */
export function feedbackRowHasRatingOrFit(row: FeedbackInsert): boolean {
  if (ONE_TO_FIVE_FIELDS.some((key) => isIntegerInRange(row[key], 1, 5))) return true;
  if (isIntegerInRange(row.accuracy_score, 1, 10)) return true;
  if (isIntegerInRange(row.nps_score, 0, 10)) return true;
  if (/^[1-5]$/.test(choiceToken(row.questions_engaging))) return true;
  if (/^[1-5]$/.test(choiceToken(row.would_share))) return true;
  if (LEGACY_FIT.has(choiceToken(row.useful_app))) return true;
  if (LEGACY_FIT.has(choiceToken(row.results_accurate))) return true;
  if (LEGACY_FIT.has(choiceToken(row.questions_engaging))) return true;
  if (LEGACY_FIT.has(choiceToken(row.would_share))) return true;
  if (RETAKE_FIT.has(choiceToken(row.retake_quiz))) return true;
  if (SHARED_FIT.has(choiceToken(row.shared_results))) return true;
  if (DESIGNED_FIT.has(choiceToken(row.feels_designed_for_you))) return true;
  return false;
}

export function toFeedbackInsert(body: FeedbackRequest): FeedbackInsert {
  const email = body.email?.trim() ?? "";
  return {
    session_id: firstDefined(body.session_id, body.sessionId),
    useful_app: firstDefined(body.useful_app, body.usefulApp),
    results_accurate: firstDefined(body.results_accurate, body.resultsAccurate),
    questions_engaging: firstDefined(body.questions_engaging, body.questionsEngaging),
    would_share: firstDefined(body.would_share, body.wouldShare),
    suggestions: body.suggestions ?? null,
    mbti_type: firstDefined(body.mbti_type, body.mbtiType),
    disc_style: firstDefined(body.disc_style, body.discStyle),
    primary_role: firstDefined(body.primary_role, body.primaryRole),
    tier: body.tier ?? null,
    mood: body.mood ?? null,
    fun_mode: firstDefined(body.fun_mode, body.funMode),
    first_reaction: firstDefined(body.first_reaction, body.firstReaction),
    first_reaction_text: firstDefined(body.first_reaction_text, body.firstReactionText),
    accuracy_score: firstDefined(body.accuracy_score, body.accuracyScore),
    accuracy_surprise: firstDefined(body.accuracy_surprise, body.accuracySurprise),
    personality_rating: firstDefined(body.personality_rating, body.personalityRating),
    career_rating: firstDefined(body.career_rating, body.careerRating),
    mood_lab_rating: firstDefined(body.mood_lab_rating, body.moodLabRating),
    visual_rating: firstDefined(body.visual_rating, body.visualRating),
    share_card_rating: firstDefined(body.share_card_rating, body.shareCardRating),
    most_valuable_feature: firstDefined(body.most_valuable_feature, body.mostValuableFeature),
    retake_quiz: firstDefined(body.retake_quiz, body.retakeQuiz),
    shared_results: firstDefined(body.shared_results, body.sharedResults),
    nps_score: firstDefined(body.nps_score, body.npsScore),
    career_relevance: firstDefined(body.career_relevance, body.careerRelevance),
    feels_designed_for_you: firstDefined(body.feels_designed_for_you, body.feelsDesignedForYou),
    college_suggestions: firstDefined(body.college_suggestions, body.collegeSuggestions),
    bugs_issues: firstDefined(body.bugs_issues, body.bugsIssues),
    email: email.length > 0 ? email : null,
    anything_else: firstDefined(body.anything_else, body.anythingElse),
    quiz_type: firstDefined(body.quiz_type, body.quizType),
  };
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function resetFeedbackRateLimits(): void {
  buckets.clear();
}

/** Returns true when this caller should be rejected. */
export function consumeFeedbackRate(key: string, now = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + FEEDBACK_RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > FEEDBACK_RATE_LIMIT;
}

export function feedbackRateKey(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("x-real-ip")
    || "unknown";
}

export function requestedResultId(body: FeedbackRequest): string | null {
  const id = body.resultId ?? body.result_id ?? null;
  if (!id) return null;
  const trimmed = id.trim();
  return trimmed.length > 0 ? trimmed : null;
}
