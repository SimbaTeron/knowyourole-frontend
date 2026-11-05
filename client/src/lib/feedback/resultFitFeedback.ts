import { z } from "zod";
import { RESULT_FIT_COPY } from "@/lib/feedback/resultFitCopy";

export {
  RESULT_FIT_COPY,
  RESULT_FIT_PRIVACY_SENTENCE,
  RESULT_FIT_STUDENT_DATA_SENTENCE,
} from "@/lib/feedback/resultFitCopy";

/** One optional tap. There is no "somewhat" choice on new answers. */
export const RESULT_FIT_CHOICES = ["yes", "no"] as const;
export type ResultFit = (typeof RESULT_FIT_CHOICES)[number];

/** Rows saved before Somewhat was removed can still be read. New taps cannot send it. */
export const STORED_RESULT_FITS = ["yes", "somewhat", "no"] as const;
export type StoredResultFit = (typeof STORED_RESULT_FITS)[number];

export const RESULT_FIT_RATINGS = [1, 2, 3, 4, 5] as const;
export type ResultFitRating = (typeof RESULT_FIT_RATINGS)[number];

/** Matches the database check. Counted in Unicode code points, same as Postgres char_length for these strings. */
export const RESULT_FIT_COMMENT_MAX = 500;
export const RESULT_FIT_MAX_BYTES = 4_096;
export const RESULT_FIT_RATE_LIMIT = 8;
export const RESULT_FIT_RATE_WINDOW_MS = 60_000;

export const RESULT_FIT_TAP_EVENT = "result_fit_tapped";

const choiceLabel: Record<ResultFit, string> = {
  yes: RESULT_FIT_COPY.yes,
  no: RESULT_FIT_COPY.no,
};

const answeredLabel: Record<ResultFit, string> = {
  yes: RESULT_FIT_COPY.answeredYes,
  no: RESULT_FIT_COPY.answeredNo,
};

export function resultFitChoiceLabel(fit: ResultFit): string {
  return choiceLabel[fit];
}

export function resultFitAnsweredLabel(fit: ResultFit): string {
  return answeredLabel[fit];
}

export function resultFitRatingLabel(rating: ResultFitRating): string {
  if (rating === 1) return "1, not close";
  if (rating === 5) return "5, very close";
  return `${rating} of 5`;
}

/** Consent-gated tap event. The only param is the choice. Comment text is never included. */
export function resultFitTapEvent(fit: ResultFit): { name: typeof RESULT_FIT_TAP_EVENT; params: { fit: ResultFit } } {
  return { name: RESULT_FIT_TAP_EVENT, params: { fit } };
}

export function resultFitSubmittedKey(resultId: string): string {
  return `kyr_result_fit_submitted:${resultId}`;
}

export function resultFitCommentLength(value: string): number {
  return [...value].length;
}

const requestSchema = z
  .object({
    resultId: z.string().trim().min(8).max(160),
    fit: z.enum(RESULT_FIT_CHOICES),
  })
  .strict();

export type ResultFitFeedbackRequest = {
  resultId: string;
  fit: ResultFit;
  rating: ResultFitRating | null;
  comment: string | null;
};

export function parseResultFitFeedbackRequest(input: unknown): { ok: true; value: ResultFitFeedbackRequest } | { ok: false } {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  return {
    ok: true,
    value: {
      resultId: parsed.data.resultId,
      fit: parsed.data.fit,
      rating: null,
      comment: null,
    },
  };
}

export type ResultFitLink = {
  resultType: string;
  scoringVersion: string;
  sessionId: string;
  userId: string | null;
};

function isStoredToken(value: unknown, max: number): value is string {
  return typeof value === "string"
    && value.length >= 1
    && value.length <= max
    && value === value.trim()
    && !/[\u0000-\u001f]/.test(value);
}

/** Result type and scoring version come from the saved result, never from the browser. */
export function resultFitLinkFromDto(dto: {
  meta: { sessionId: string; userId: string | null };
  scores: { mbti: { type: string } };
  version: { scoringVersion: string };
}): ResultFitLink | null {
  if (!isStoredToken(dto.scores.mbti.type, 32)) return null;
  if (!isStoredToken(dto.version.scoringVersion, 80)) return null;
  if (!isStoredToken(dto.meta.sessionId, 160)) return null;
  const userId = dto.meta.userId;
  if (userId != null && !isStoredToken(userId, 256)) return null;
  return {
    resultType: dto.scores.mbti.type,
    scoringVersion: dto.version.scoringVersion,
    sessionId: dto.meta.sessionId,
    userId,
  };
}

export type ResultFitFeedbackRow = {
  result_id: string;
  session_id: string;
  user_id: string | null;
  result_type: string;
  scoring_version: string;
  fit: ResultFit;
  rating: ResultFitRating | null;
  comment: string | null;
};

export function buildResultFitFeedbackRow(
  request: ResultFitFeedbackRequest,
  link: ResultFitLink,
  resultId: string,
): ResultFitFeedbackRow | null {
  if (request.resultId !== resultId) return null;
  if (!isStoredToken(link.resultType, 32) || !isStoredToken(link.scoringVersion, 80) || !isStoredToken(link.sessionId, 160)) {
    return null;
  }
  return {
    result_id: resultId,
    session_id: link.sessionId,
    user_id: link.userId,
    result_type: link.resultType,
    scoring_version: link.scoringVersion,
    fit: request.fit,
    rating: request.rating,
    comment: request.comment,
  };
}

export type ExistingResultFit = {
  id: string;
  fit: StoredResultFit;
  rating: ResultFitRating | null;
  comment: string | null;
};

export type ResultFitWritePlan =
  | { action: "insert"; row: ResultFitFeedbackRow }
  | { action: "update"; resultId: string; fit: ResultFit; rating: ResultFitRating | null; comment: string | null }
  | { action: "noop"; resultId: string }
  | { action: "conflict" };

/**
 * The first tap inserts the choice. A later request may add a rating or note.
 * It cannot replace the original choice, and omitting a follow-up leaves the row as it is.
 */
export function planResultFitWrite(existing: ExistingResultFit | null, row: ResultFitFeedbackRow): ResultFitWritePlan {
  if (!existing) return { action: "insert", row };
  if (existing.fit !== row.fit) return { action: "conflict" };
  const rating = row.rating ?? existing.rating;
  const comment = row.comment ?? existing.comment;
  if (rating === existing.rating && comment === existing.comment) return { action: "noop", resultId: row.result_id };
  return { action: "update", resultId: row.result_id, fit: row.fit, rating, comment };
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function resetResultFitRateLimits(): void {
  buckets.clear();
}

/** Returns true when this caller should be rejected. */
export function consumeResultFitRate(key: string, now = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RESULT_FIT_RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RESULT_FIT_RATE_LIMIT;
}

export function resultFitRateKey(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("x-real-ip")
    || "unknown";
}
