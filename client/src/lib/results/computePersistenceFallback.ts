import type { ResultDTO } from "@/lib/results/buildResultDTO";

/** Response body when scoring succeeded but durable storage did not. */
export function buildUnpersistedComputeSuccess(input: {
  requestId: string;
  result: ResultDTO;
  validation: unknown;
  persistenceAttemptId: string;
  error: string;
}) {
  return {
    success: true as const,
    requestId: input.requestId,
    result: input.result,
    validation: input.validation,
    persistence: {
      ok: false as const,
      resultId: input.result.meta.resultId,
      persistenceAttemptId: input.persistenceAttemptId,
      created: false as const,
      error: input.error,
    },
    anonymousDeletionCapability: null,
    anonymousDeletionCapabilityExpiresAt: null,
  };
}
