import {
  CAREER_SCORE_KEYS,
  SHORTFORM_V2_QUESTIONS,
  type CareerKey,
  type ShortformV2Question,
} from "@/data/shortformV2Questions";

export type ShortformV2ResponseInput = {
  questionId: number;
  choice: 0 | 1 | 2 | 3;
  timeSpent?: number;
  swipeDirection?: "left" | "right";
};

export type ShortformV2ScoreMaps = {
  mbti: Record<"E" | "I" | "S" | "N" | "T" | "F" | "J" | "P", number>;
  disc: Record<"D" | "I" | "S" | "C", number>;
  bigFive: Record<"O" | "C" | "E" | "A" | "N", number>;
  career: Record<CareerKey, number>;
};

export class ShortformV2ResponseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShortformV2ResponseValidationError";
  }
}

const QUESTION_BY_ID = new Map(SHORTFORM_V2_QUESTIONS.map((question) => [question.id, question]));
const EXPECTED_IDS = new Set(SHORTFORM_V2_QUESTIONS.map((question) => question.id));

export function createEmptyShortformV2ScoreMaps(): ShortformV2ScoreMaps {
  return {
    mbti: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
    disc: { D: 0, I: 0, S: 0, C: 0 },
    bigFive: { O: 0, C: 0, E: 0, A: 0, N: 0 },
    career: Object.fromEntries(CAREER_SCORE_KEYS.map((key) => [key, 0])) as Record<CareerKey, number>,
  };
}

/**
 * Validates exactly one answer for every versioned Shortform V2 item. The client
 * totals are deliberately not accepted here: answer IDs and choices are the only
 * scoring authority.
 */
export function validateShortformV2Responses(value: unknown): ShortformV2ResponseInput[] {
  if (!Array.isArray(value)) {
    throw new ShortformV2ResponseValidationError("responses must be an array");
  }
  if (value.length !== SHORTFORM_V2_QUESTIONS.length) {
    throw new ShortformV2ResponseValidationError(`expected exactly ${SHORTFORM_V2_QUESTIONS.length} responses, received ${value.length}`);
  }

  const seen = new Set<number>();
  const normalized = value.map((response, index) => {
    if (!response || typeof response !== "object" || Array.isArray(response)) {
      throw new ShortformV2ResponseValidationError(`response ${index + 1} must be an object`);
    }
    const candidate = response as Record<string, unknown>;
    const questionId = candidate.questionId;
    const choice = candidate.choice;
    if (!Number.isInteger(questionId) || !EXPECTED_IDS.has(questionId as number)) {
      throw new ShortformV2ResponseValidationError(`response ${index + 1} has an unknown questionId`);
    }
    if (typeof choice !== "number") {
      throw new ShortformV2ResponseValidationError(`response ${index + 1} has an invalid choice`);
    }
    const selectedChoice = choice as number;
    if (!Number.isInteger(selectedChoice) || selectedChoice < 0 || selectedChoice > 3) {
      throw new ShortformV2ResponseValidationError(`response ${index + 1} has an invalid choice`);
    }
    if (seen.has(questionId as number)) {
      throw new ShortformV2ResponseValidationError(`duplicate answer for question ${questionId}`);
    }
    seen.add(questionId as number);

    const timeSpent = typeof candidate.timeSpent === "number" && Number.isFinite(candidate.timeSpent)
      ? Math.max(0.1, Math.min(candidate.timeSpent, 300))
      : undefined;
    const swipeDirection: ShortformV2ResponseInput["swipeDirection"] = candidate.swipeDirection === "left" || candidate.swipeDirection === "right"
      ? candidate.swipeDirection
      : undefined;
    return { questionId: questionId as number, choice: choice as 0 | 1 | 2 | 3, timeSpent, swipeDirection };
  });

  if (seen.size !== EXPECTED_IDS.size) {
    throw new ShortformV2ResponseValidationError("responses must cover every active Shortform V2 question exactly once");
  }

  return normalized;
}

export function getShortformV2Question(questionId: number): ShortformV2Question {
  const question = QUESTION_BY_ID.get(questionId);
  if (!question) throw new ShortformV2ResponseValidationError(`unknown question ${questionId}`);
  return question;
}

export function recomputeShortformV2ScoreMaps(responses: ShortformV2ResponseInput[]): ShortformV2ScoreMaps {
  const scores = createEmptyShortformV2ScoreMaps();
  for (const response of responses) {
    const answer = getShortformV2Question(response.questionId).answers[response.choice];
    if (!answer) throw new ShortformV2ResponseValidationError(`missing answer option for question ${response.questionId}`);

    for (const [key, value] of Object.entries(answer.scores.mbti ?? {})) {
      scores.mbti[key as keyof typeof scores.mbti] += value ?? 0;
    }
    for (const [key, value] of Object.entries(answer.scores.disc ?? {})) {
      scores.disc[key as keyof typeof scores.disc] += value ?? 0;
    }
    for (const [key, value] of Object.entries(answer.scores.bigFive ?? {})) {
      scores.bigFive[key as keyof typeof scores.bigFive] += value ?? 0;
    }
    for (const [key, value] of Object.entries(answer.scores.career ?? {})) {
      scores.career[key as CareerKey] += value ?? 0;
    }
  }
  return scores;
}
