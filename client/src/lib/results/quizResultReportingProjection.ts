import { SHORTFORM_V2_QUESTIONS } from "@/data/shortformV2Questions";
import { LEGACY_REPORTING_ANSWER_COLUMNS } from "@/lib/quiz/legacyQuestionCounts";
import type { ResultDTO } from "@/lib/results/buildResultDTO";

type QuestionColumn = `q${number}`;

/**
 * Database-facing reporting projections for the fixed Shortform V2 quiz.
 *
 * `responses.dto` stays canonical and replayable. These fields are deliberately
 * materialized from that DTO for concise spreadsheet/admin reporting. They must
 * never be accepted from a client request or used as scoring inputs.
 */
export type QuizResultReportingProjection = {
  primary_role: string;
  secondary_role: string;
  mbti: string;
  disc: string;
  /** Exact stable format: O:72%;C:61%;E:48%;A:67%;N:33% */
  big_five: string;
} & Record<QuestionColumn, number>;

const REPORTING_COLUMN_COUNT = LEGACY_REPORTING_ANSWER_COLUMNS;
const BIG_FIVE_CODES = ["O", "C", "E", "A", "N"] as const;

export function buildQuizResultReportingProjection(result: ResultDTO): QuizResultReportingProjection {
  const primaryRole = result.careerMatches[0]?.title ?? result.careerDirection.title;
  const secondaryRole = result.careerMatches[1]?.title;
  if (!primaryRole || !secondaryRole) {
    throw new Error("Canonical ResultDTO must contain primary and secondary career matches");
  }

  const answersByQuestionId = new Map(
    result.raw.responses.map((answer) => [String(answer.questionId), answer]),
  );

  const projection = {
    primary_role: primaryRole,
    secondary_role: secondaryRole,
    mbti: result.scores.mbti.type,
    disc: result.scores.disc.primary,
    big_five: BIG_FIVE_CODES
      .map((code) => `${code}:${result.scores.bigFive.traits[code].normalized}%`)
      .join(";"),
  } as QuizResultReportingProjection;

  // The quiz_results table has one column per LEGACY_REPORTING_ANSWER_COLUMNS (no DB change).
  // Later questions (v5: Q29 Saturday class, Q30 life stage) live only in the canonical DTO jsonb.
  for (const question of SHORTFORM_V2_QUESTIONS.filter((q) => q.id <= REPORTING_COLUMN_COUNT)) {
    const choice = answersByQuestionId.get(String(question.id))?.choice;
    if (!Number.isInteger(choice) || choice === undefined || choice < 0 || choice > 3) {
      throw new Error(`Canonical ResultDTO has no valid selected answer for question ${question.id}`);
    }
    projection[`q${question.id}`] = choice + 1;
  }

  if (Object.keys(projection).filter((k) => /^q\d+$/.test(k)).length !== REPORTING_COLUMN_COUNT) {
    throw new Error(`Reporting projections require exactly ${LEGACY_REPORTING_ANSWER_COLUMNS} answer columns`);
  }

  return projection;
}
