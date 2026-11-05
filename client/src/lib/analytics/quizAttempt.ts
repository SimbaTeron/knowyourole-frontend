/**
 * One landing, start, and completion per attempt, plus the later funnel events
 * that describe that same attempt. Repeat events (each answer, each review)
 * keep only a short pending tail so a late consent grant cannot flush the
 * whole quiz into GA at once. A declined analytics choice drops those held
 * events; a queued start is left in place.
 */

import { randomIdToken } from "@/lib/randomId";

export const QUIZ_ATTEMPT_STORAGE_KEY = "kyr_quiz_attempt_v1";
export const QUIZ_ATTEMPT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type QuizFunnelEventName =
  | "quiz_landing_viewed"
  | "quiz_started"
  | "quiz_completed"
  | "quiz_progress_milestone"
  | "quiz_answer_selected"
  | "quiz_answer_reviewed"
  | "quiz_completion_processing_started"
  | "quiz_result_persisted"
  | "quiz_result_computed_unpersisted"
  | "quiz_result_persist_failed"
  | "conversion_results_handoff"
  | "result_viewed";
export type QuizFunnelParams = Record<string, string | number | boolean>;

export type StoredQuizAttempt = {
  v: 1;
  attemptId: string;
  openedAt: number;
  closed: boolean;
  sent: string[];
  pending: Array<{ key: string; name: QuizFunnelEventName; params: QuizFunnelParams }>;
};

/** Pending answer and review events kept for one later flush. Older ones are dropped. */
export const HELD_REPEAT_EVENT_CAP = 5;

export type KeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type QuizFunnelEmission = { name: QuizFunnelEventName; params: QuizFunnelParams };

const FUNNEL_EVENTS = new Set<QuizFunnelEventName>([
  "quiz_landing_viewed",
  "quiz_started",
  "quiz_completed",
  "quiz_progress_milestone",
  "quiz_answer_selected",
  "quiz_answer_reviewed",
  "quiz_completion_processing_started",
  "quiz_result_persisted",
  "quiz_result_computed_unpersisted",
  "quiz_result_persist_failed",
  "conversion_results_handoff",
  "result_viewed",
]);

const REPEAT_EVENTS = new Set<QuizFunnelEventName>(["quiz_answer_selected", "quiz_answer_reviewed"]);

const DROP_ON_DECLINE = new Set<QuizFunnelEventName>([
  "quiz_completed",
  "quiz_progress_milestone",
  "quiz_answer_selected",
  "quiz_answer_reviewed",
  "quiz_completion_processing_started",
  "quiz_result_persisted",
  "quiz_result_computed_unpersisted",
  "quiz_result_persist_failed",
  "conversion_results_handoff",
  "result_viewed",
]);

/** Completion stays aggregate: placement, tier, length, and a timing summary. */
const QUIZ_COMPLETED_PARAM_KEYS = new Set(["link_location", "entry_point", "tier", "total_questions", "average_response_time"]);

const BLOCKED_PARAM_KEYS = new Set([
  "answer_id",
  "question_id",
  "email",
  "session_id",
  "result_id",
  "comment",
  "note",
  "improvement_note",
  "mbti_type",
  "primary_disc",
  "direction_title",
  "role_title",
  "archetype",
  "disc_style",
  "mood",
]);

function isFunnelEventName(value: unknown): value is QuizFunnelEventName {
  return typeof value === "string" && FUNNEL_EVENTS.has(value as QuizFunnelEventName);
}

function eventNameFromKey(key: string): QuizFunnelEventName | null {
  if (isFunnelEventName(key)) return key;
  const split = key.indexOf(":");
  if (split <= 0) return null;
  const name = key.slice(0, split);
  return isFunnelEventName(name) ? name : null;
}

export function newQuizAttemptId(now = Date.now()): string {
  return `quiz-attempt-${now}-${randomIdToken(10)}`;
}

export function loadQuizAttempt(storage: KeyValueStorage): StoredQuizAttempt | null {
  try {
    const raw = storage.getItem(QUIZ_ATTEMPT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredQuizAttempt>;
    if (parsed?.v !== 1 || typeof parsed.attemptId !== "string" || typeof parsed.openedAt !== "number") return null;
    if (typeof parsed.closed !== "boolean" || !Array.isArray(parsed.sent) || !Array.isArray(parsed.pending)) return null;
    const sent = parsed.sent.filter((item): item is string => typeof item === "string" && eventNameFromKey(item) !== null);
    const pending = parsed.pending.flatMap((item) => {
      if (!item || !isFunnelEventName(item.name) || item.params === null || typeof item.params !== "object") return [];
      const key = typeof item.key === "string" && eventNameFromKey(item.key) === item.name ? item.key : item.name;
      return [{ key, name: item.name, params: item.params }];
    });
    return {
      v: 1,
      attemptId: parsed.attemptId,
      openedAt: parsed.openedAt,
      closed: parsed.closed,
      sent,
      pending,
    };
  } catch {
    return null;
  }
}

function saveQuizAttempt(storage: KeyValueStorage, attempt: StoredQuizAttempt) {
  storage.setItem(QUIZ_ATTEMPT_STORAGE_KEY, JSON.stringify(attempt));
}

function paramsFor(name: QuizFunnelEventName, params: QuizFunnelParams): QuizFunnelParams {
  const safe: QuizFunnelParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (BLOCKED_PARAM_KEYS.has(key)) continue;
    if (name === "quiz_completed" && !QUIZ_COMPLETED_PARAM_KEYS.has(key)) continue;
    safe[key] = value;
  }
  return safe;
}

function occurrenceKey(attempt: StoredQuizAttempt, name: QuizFunnelEventName, params: QuizFunnelParams): string {
  if (name === "quiz_progress_milestone") {
    const milestone = params.milestone;
    return `${name}:${typeof milestone === "number" ? milestone : "unknown"}`;
  }
  if (REPEAT_EVENTS.has(name)) {
    const used = new Set([...attempt.sent, ...attempt.pending.map((item) => item.key)]);
    let sequence = 1;
    while (used.has(`${name}:${sequence}`)) sequence += 1;
    return `${name}:${sequence}`;
  }
  return name;
}

function trimRepeatPending(attempt: StoredQuizAttempt, name: QuizFunnelEventName) {
  if (!REPEAT_EVENTS.has(name)) return;
  const indexes: number[] = [];
  attempt.pending.forEach((item, index) => {
    if (item.name === name) indexes.push(index);
  });
  const extra = indexes.length - HELD_REPEAT_EVENT_CAP;
  if (extra <= 0) return;
  const drop = new Set(indexes.slice(0, extra));
  attempt.pending = attempt.pending.filter((_, index) => !drop.has(index));
}

function settleWithoutSending(attempt: StoredQuizAttempt, key: string) {
  if (!attempt.sent.includes(key)) attempt.sent.push(key);
  attempt.pending = attempt.pending.filter((item) => item.key !== key);
}

function blankAttempt(attemptId: string, now: number): StoredQuizAttempt {
  return { v: 1, attemptId, openedAt: now, closed: false, sent: [], pending: [] };
}

export function beginQuizAttempt(storage: KeyValueStorage, input: {
  resume: boolean;
  createId: () => string;
  now: number;
  /** Post-completion events stay on the closed attempt instead of replacing its queue. */
  reuseClosed?: boolean;
}): StoredQuizAttempt {
  const existing = loadQuizAttempt(storage);
  if (existing && !existing.closed) {
    const age = input.now - existing.openedAt;
    if (input.resume || age < QUIZ_ATTEMPT_MAX_AGE_MS) return existing;
  }
  if (existing?.closed && input.reuseClosed && input.now - existing.openedAt < QUIZ_ATTEMPT_MAX_AGE_MS) {
    return existing;
  }
  const created = blankAttempt(input.createId(), input.now);
  saveQuizAttempt(storage, created);
  return created;
}

export function noteQuizFunnelEvent(storage: KeyValueStorage, input: {
  name: QuizFunnelEventName;
  params: QuizFunnelParams;
  consent: boolean;
  /** Explicit analytics refusal. Distinct from "no choice yet", which still queues. */
  declined?: boolean;
  resume?: boolean;
  createId: () => string;
  now: number;
}): { attempt: StoredQuizAttempt; emit: QuizFunnelEmission[] } {
  const attempt = beginQuizAttempt(storage, {
    resume: input.resume ?? false,
    createId: input.createId,
    now: input.now,
    reuseClosed: input.name !== "quiz_landing_viewed" && input.name !== "quiz_started",
  });
  const params = paramsFor(input.name, input.params);
  const key = occurrenceKey(attempt, input.name, params);

  if (attempt.sent.includes(key)) return { attempt, emit: [] };
  if (!input.consent && attempt.pending.some((item) => item.key === key)) return { attempt, emit: [] };

  if (!input.consent && input.declined && DROP_ON_DECLINE.has(input.name)) {
    settleWithoutSending(attempt, key);
    saveQuizAttempt(storage, attempt);
    return { attempt, emit: [] };
  }

  if (!input.consent) {
    attempt.pending.push({ key, name: input.name, params });
    trimRepeatPending(attempt, input.name);
    saveQuizAttempt(storage, attempt);
    return { attempt, emit: [] };
  }

  attempt.sent.push(key);
  attempt.pending = attempt.pending.filter((item) => item.key !== key);
  saveQuizAttempt(storage, attempt);
  return { attempt, emit: [{ name: input.name, params }] };
}

/** Drop held funnel events after the visitor rejects analytics. A queued start stays. */
export function dropDeclinedQuizCompletion(storage: KeyValueStorage): StoredQuizAttempt | null {
  const attempt = loadQuizAttempt(storage);
  if (!attempt) return attempt;
  const dropped = attempt.pending.filter((item) => DROP_ON_DECLINE.has(item.name));
  if (dropped.length === 0) return attempt;
  for (const item of dropped) settleWithoutSending(attempt, item.key);
  saveQuizAttempt(storage, attempt);
  return attempt;
}

export function flushQuizFunnel(storage: KeyValueStorage, input: {
  consent: boolean;
}): { attempt: StoredQuizAttempt | null; emit: QuizFunnelEmission[] } {
  const attempt = loadQuizAttempt(storage);
  // A closed attempt can still flush a start that was queued before consent.
  // Retake replaces the record, so the flush cannot attach to the next attempt.
  if (!attempt || !input.consent || attempt.pending.length === 0) {
    return { attempt, emit: [] };
  }

  const emit: QuizFunnelEmission[] = [];
  for (const item of attempt.pending) {
    if (!attempt.sent.includes(item.key)) {
      attempt.sent.push(item.key);
      emit.push({ name: item.name, params: item.params });
    }
  }
  attempt.pending = [];
  saveQuizAttempt(storage, attempt);
  return { attempt, emit };
}

export function closeQuizAttempt(storage: KeyValueStorage) {
  const attempt = loadQuizAttempt(storage);
  if (!attempt || attempt.closed) return;
  attempt.closed = true;
  saveQuizAttempt(storage, attempt);
}
