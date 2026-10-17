import { SHORTFORM_V2_QUESTIONS, type ShortformV2Question } from "@/data/shortformV2Questions";

export type QuizQuestionFlag = {
  id: number;
  key: string;
  /** True when any answer contributes a non-zero score. Derived from the bank. */
  scored: boolean;
};

function answerHasScore(scores: ShortformV2Question["answers"][number]["scores"]): boolean {
  return Object.values(scores).some(
    (family) => !!family && Object.values(family).some((value) => typeof value === "number" && value !== 0),
  );
}

/** A question is scored when the bank gives it a non-zero weight. Q30 (life stage) is not. */
export function questionIsScored(question: ShortformV2Question): boolean {
  return question.answers.some((answer) => answerHasScore(answer.scores));
}

/**
 * Live v5 question bank.
 * The count is this list's length. Do not copy that length into another number.
 */
export const QUIZ_QUESTIONS: readonly ShortformV2Question[] = SHORTFORM_V2_QUESTIONS;

export const QUESTION_COUNT = QUIZ_QUESTIONS.length;

export const QUIZ_CONFIG = {
  questions: QUIZ_QUESTIONS,
  questionCount: QUESTION_COUNT,
  questionFlags: QUIZ_QUESTIONS.map((question): QuizQuestionFlag => ({
    id: question.id,
    key: question.key,
    scored: questionIsScored(question),
  })),
};
