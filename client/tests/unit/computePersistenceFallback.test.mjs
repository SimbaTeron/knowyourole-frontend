import { test } from "node:test";
import assert from "node:assert/strict";
import { buildUnpersistedComputeSuccess } from "../../src/lib/results/computePersistenceFallback.ts";
import { toSavedResultId } from "../../src/lib/results/savedResultId.ts";

test("persistence outage still returns success with the computed DTO", () => {
  const result = {
    meta: { resultId: "result-test-1", sessionId: "sess-1" },
    scores: { mbti: { type: "INTJ" } },
  };
  const body = buildUnpersistedComputeSuccess({
    requestId: "req-1",
    result,
    validation: { ok: true, errors: [] },
    persistenceAttemptId: "persist-1",
    error: "NEXT_PUBLIC_SUPABASE_URL is not set",
  });
  assert.equal(body.success, true);
  assert.notEqual(body.result, result);
  assert.equal(result.meta.resultId, "result-test-1");
  assert.equal(body.result.meta.storage, "local");
  assert.equal(body.result.meta.resultId, "local-result-test-1");
  assert.equal(body.result.scores, result.scores);
  assert.equal(body.persistence.ok, false);
  assert.equal(body.persistence.created, false);
  assert.equal(body.persistence.resultId, "local-result-test-1");
  assert.equal(toSavedResultId(body.result.meta), null);
  assert.equal(toSavedResultId(result.meta), "result-test-1");
  assert.equal(toSavedResultId({ resultId: "result-test-1", storage: "saved" }), "result-test-1");
  assert.equal(toSavedResultId({ resultId: "result-test-1", storage: "local" }), null);
  assert.equal(toSavedResultId({ resultId: "", storage: "saved" }), null);
  assert.ok(body.persistence.error.includes("SUPABASE") || body.persistence.error.length > 0);
  assert.equal(body.anonymousDeletionCapability, null);
});
