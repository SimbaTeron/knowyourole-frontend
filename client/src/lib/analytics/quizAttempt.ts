/**
 * One quiz_landing_viewed and one quiz_started per attempt.
 * A reload or React strict-mode remount reuses the open attempt. Retake,
 * restart, and a closed attempt start a new one. Events noted before analytics
 * consent stay queued and flush once.
 */

import { randomIdToken } from "@/lib/randomId";

export const QUIZ_ATTEMPT_STORAGE_KEY = "kyr_quiz_attempt_v1";
export const QUIZ_ATTEMPT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type QuizFunnelEventName = "quiz_landing_viewed" | "quiz_started";
export type QuizFunnelParams = Record<string, string | number | boolean>;

export type StoredQuizAttempt = {
  v: 1;
  attemptId: string;
  openedAt: number;
  closed: boolean;
  sent: QuizFunnelEventName[];
  pending: Array<{ name: QuizFunnelEventName; params: QuizFunnelParams }>;
};

export type KeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type QuizFunnelEmission = { name: QuizFunnelEventName; params: QuizFunnelParams };

const FUNNEL_EVENTS = new Set<QuizFunnelEventName>(["quiz_landing_viewed", "quiz_started"]);

function isFunnelEventName(value: unknown): value is QuizFunnelEventName {
  return typeof value === "string" && FUNNEL_EVENTS.has(value as QuizFunnelEventName);
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
    const sent = parsed.sent.filter(isFunnelEventName);
    const pending = parsed.pending.filter((item): item is { name: QuizFunnelEventName; params: QuizFunnelParams } => {
      return Boolean(item) && isFunnelEventName(item.name) && item.params !== null && typeof item.params === "object";
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

function blankAttempt(attemptId: string, now: number): StoredQuizAttempt {
  return { v: 1, attemptId, openedAt: now, closed: false, sent: [], pending: [] };
}

export function beginQuizAttempt(storage: KeyValueStorage, input: {
  resume: boolean;
  createId: () => string;
  now: number;
}): StoredQuizAttempt {
  const existing = loadQuizAttempt(storage);
  if (existing && !existing.closed) {
    const age = input.now - existing.openedAt;
    if (input.resume || age < QUIZ_ATTEMPT_MAX_AGE_MS) return existing;
  }
  const created = blankAttempt(input.createId(), input.now);
  saveQuizAttempt(storage, created);
  return created;
}

export function noteQuizFunnelEvent(storage: KeyValueStorage, input: {
  name: QuizFunnelEventName;
  params: QuizFunnelParams;
  consent: boolean;
  resume?: boolean;
  createId: () => string;
  now: number;
}): { attempt: StoredQuizAttempt; emit: QuizFunnelEmission[] } {
  const attempt = beginQuizAttempt(storage, {
    resume: input.resume ?? false,
    createId: input.createId,
    now: input.now,
  });

  if (attempt.sent.includes(input.name)) return { attempt, emit: [] };

  if (!input.consent) {
    if (!attempt.pending.some((item) => item.name === input.name)) {
      attempt.pending.push({ name: input.name, params: input.params });
      saveQuizAttempt(storage, attempt);
    }
    return { attempt, emit: [] };
  }

  attempt.sent.push(input.name);
  attempt.pending = attempt.pending.filter((item) => item.name !== input.name);
  saveQuizAttempt(storage, attempt);
  return { attempt, emit: [{ name: input.name, params: input.params }] };
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
    if (!attempt.sent.includes(item.name)) {
      attempt.sent.push(item.name);
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
