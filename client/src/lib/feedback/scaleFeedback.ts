/**
 * Optional 1–5 ratings from /feedback.
 * Stored on the existing `feedback` row. No new table.
 *
 * Column map (quiz_type = "scale"):
 * - questions_engaging: how easy the quiz was (text "1"–"5" or null)
 * - personality_rating: how well the result described you (integer 1–5 or null)
 * - career_rating: how useful the career ideas were (integer 1–5 or null)
 * - would_share: how likely they are to share it (text "1"–"5" or null)
 * - career_relevance: how likely they are to use it for classes or a career path
 * - suggestions: saved quiz_results id, when the caller can access that result
 * - session_id: that result's session id (one result per session), for deletion
 */

export const SCALE_QUIZ_TYPE = "scale";

export const SCALE_FEEDBACK_PRIVACY_SENTENCE =
  "If you use Leave feedback, we save the optional 1 to 5 ratings you choose. When you open that page from a saved result, we tie the ratings to that result. We do not ask for your name.";

export const SCALE_QUESTIONS = [
  { key: "quizEase", column: "questions_engaging", kind: "text", prompt: "How easy was the quiz to take?" },
  { key: "resultDescribe", column: "personality_rating", kind: "number", prompt: "How well did your result describe you?" },
  { key: "careerIdeas", column: "career_rating", kind: "number", prompt: "How useful were the career ideas?" },
  { key: "shareFriend", column: "would_share", kind: "text", prompt: "How likely are you to share it with a friend?" },
  { key: "useForPath", column: "career_relevance", kind: "number", prompt: "How likely are you to use it to help pick classes or a career path?" },
] as const;

export type ScaleKey = (typeof SCALE_QUESTIONS)[number]["key"];
export type ScaleAnswers = Record<ScaleKey, number | null>;

export type ScaleRatingRow = {
  questions_engaging: string | null;
  personality_rating: number | null;
  career_rating: number | null;
  would_share: string | null;
  career_relevance: number | null;
};

const SCALE_VALUES = [1, 2, 3, 4, 5] as const;

export function emptyScaleAnswers(): ScaleAnswers {
  return {
    quizEase: null,
    resultDescribe: null,
    careerIdeas: null,
    shareFriend: null,
    useForPath: null,
  };
}

export function scaleChoiceLabel(value: number): string {
  if (value === 1) return "1, low";
  if (value === 5) return "5, high";
  return `${value} of 5`;
}

export function isScaleRating(value: number | null | undefined): value is 1 | 2 | 3 | 4 | 5 | null {
  return value == null || (SCALE_VALUES as readonly number[]).includes(value);
}

/** Result and session ids from the results page. Omitted when the result was not saved. */
export function leaveFeedbackPath(input: { resultId?: string | null; sessionId?: string | null }): string {
  const params = new URLSearchParams();
  const resultId = input.resultId?.trim() ?? "";
  const sessionId = input.sessionId?.trim() ?? "";
  if (resultId) params.set("resultId", resultId);
  if (sessionId) params.set("sessionId", sessionId);
  const query = params.toString();
  return query ? `/feedback?${query}` : "/feedback";
}

export function scalePayload(answers: ScaleAnswers, resultId: string | null) {
  const text = (value: number | null) => (value == null ? null : String(value));
  return {
    quiz_type: SCALE_QUIZ_TYPE,
    questions_engaging: text(answers.quizEase),
    personality_rating: answers.resultDescribe,
    career_rating: answers.careerIdeas,
    would_share: text(answers.shareFriend),
    career_relevance: answers.useForPath,
    ...(resultId ? { resultId } : {}),
  };
}

type ScaleInput = {
  questions_engaging?: string | null;
  questionsEngaging?: string | null;
  personality_rating?: number | null;
  personalityRating?: number | null;
  career_rating?: number | null;
  careerRating?: number | null;
  would_share?: string | null;
  wouldShare?: string | null;
  career_relevance?: number | null;
  careerRelevance?: number | null;
};

function textRating(value: string | null | undefined): string | null | "bad" {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^[1-5]$/.test(trimmed) ? trimmed : "bad";
}

function numberRating(value: number | null | undefined): number | null | "bad" {
  if (value == null) return null;
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : "bad";
}

/** Scale rows may leave every rating blank. Anything outside 1–5 is rejected. */
export function normalizeScaleRatings(input: ScaleInput): { ok: true; value: ScaleRatingRow } | { ok: false } {
  const questions_engaging = textRating(input.questions_engaging ?? input.questionsEngaging);
  const would_share = textRating(input.would_share ?? input.wouldShare);
  const personality_rating = numberRating(input.personality_rating ?? input.personalityRating);
  const career_rating = numberRating(input.career_rating ?? input.careerRating);
  const career_relevance = numberRating(input.career_relevance ?? input.careerRelevance);
  if (
    questions_engaging === "bad"
    || would_share === "bad"
    || personality_rating === "bad"
    || career_rating === "bad"
    || career_relevance === "bad"
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    value: {
      questions_engaging,
      personality_rating,
      career_rating,
      would_share,
      career_relevance,
    },
  };
}

export function linkScaleFeedbackToResult<T extends { quiz_type?: string | null; suggestions?: string | null; session_id?: string | null }>(
  row: T,
  result: { id: string; sessionId: string } | null,
): T {
  if (!result || row.quiz_type !== SCALE_QUIZ_TYPE) return row;
  return {
    ...row,
    session_id: result.sessionId,
    suggestions: result.id,
  };
}
