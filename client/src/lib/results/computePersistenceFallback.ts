import type { ResultDTO } from "@/lib/results/buildResultDTO";
import { localResultId } from "@/lib/results/savedResultId";

/** Response body when scoring succeeded but durable storage did not. */
export function buildUnpersistedComputeSuccess(input: {
  requestId: string;
  result: ResultDTO;
  validation: unknown;
  persistenceAttemptId: string;
  error: string;
}) {
  const resultId = localResultId(input.result.meta.resultId);
  const result: ResultDTO = {
    ...input.result,
    meta: { ...input.result.meta, resultId, storage: "local" },
  };
  return {
    success: true as const,
    requestId: input.requestId,
    result,
    validation: input.validation,
    persistence: {
      ok: false as const,
      resultId,
      persistenceAttemptId: input.persistenceAttemptId,
      created: false as const,
      error: input.error,
    },
    anonymousDeletionCapability: null,
    anonymousDeletionCapabilityExpiresAt: null,
  };
}
