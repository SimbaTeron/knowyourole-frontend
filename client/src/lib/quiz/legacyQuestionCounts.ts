/**
 * Original shortform length stored as quiz_results columns q1..q28 and assumed
 * when v2–v4 code re-renders those saved answers.
 * The live quiz length is QUESTION_COUNT in quizConfig.ts, derived from the v5 bank.
 */
export const LEGACY_V2_QUESTION_COUNT = 28;

/** One reporting column per legacy answer. The table shape is fixed. */
export const LEGACY_REPORTING_ANSWER_COLUMNS = LEGACY_V2_QUESTION_COUNT;
