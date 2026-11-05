import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CAPABILITY_TTL_MS } from "../../src/app/api/_lib/anonymous-result-capability.ts";
import {
  ANONYMOUS_RESULT_RETENTION_DAYS,
  ANONYMOUS_RETENTION_CRON_SCHEDULE,
  ANONYMOUS_RETENTION_PURGE_PATH,
  DELETION_ON_REQUEST_DAYS,
  MS_PER_DAY,
  purgeExpiredAnonymousResults,
  selectAnonymousFitFeedbackForPurge,
  selectAnonymousSessionsForPurge,
} from "../../src/lib/privacy/retentionPolicy.ts";

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const NOW = new Date("2026-06-01T12:00:00.000Z");

function row(createdAt, extras = {}) {
  return {
    id: extras.id ?? "session",
    userId: null,
    createdAt,
    ownedByUser: false,
    anonymousResultCount: 1,
    ...extras,
  };
}

function atOffset(ms) {
  return new Date(NOW.getTime() - ANONYMOUS_RESULT_RETENTION_DAYS * MS_PER_DAY + ms).toISOString();
}

test("purge selects anonymous rows strictly older than the retention constant", () => {
  const older = row(atOffset(-1), { id: "older", anonymousResultCount: 2 });
  const exact = row(atOffset(0), { id: "exact" });
  const newer = row(atOffset(MS_PER_DAY), { id: "newer" });
  const owned = row(atOffset(-MS_PER_DAY), { id: "owned", ownedByUser: true });
  const account = row(atOffset(-MS_PER_DAY), { id: "account", userId: "user-1" });

  const selected = selectAnonymousSessionsForPurge([newer, exact, older, owned, account], NOW);
  assert.deepEqual(selected.map((item) => item.id), ["older"]);
});

test("changing the retention window changes which rows are selected", () => {
  const createdAt = new Date(NOW.getTime() - 10 * MS_PER_DAY - 1).toISOString();
  const candidate = row(createdAt, { id: "ten-days" });
  assert.equal(selectAnonymousSessionsForPurge([candidate], NOW, 10).length, 1);
  assert.equal(selectAnonymousSessionsForPurge([candidate], NOW, ANONYMOUS_RESULT_RETENTION_DAYS).length, 0);
});

test("purge deletes only the selected rows and counts their anonymous results", async () => {
  const older = row(atOffset(-1), { id: "older", anonymousResultCount: 3 });
  const newer = row(atOffset(1), { id: "newer", anonymousResultCount: 4 });
  const skipped = row(atOffset(-MS_PER_DAY), { id: "skipped", anonymousResultCount: 9 });
  const deleted = [];
  const result = await purgeExpiredAnonymousResults(
    [older, newer, skipped],
    async (id) => {
      deleted.push(id);
      return id !== "skipped";
    },
    NOW,
  );
  assert.deepEqual(deleted, ["older", "skipped"]);
  assert.deepEqual(result, { deleted_sessions: 1, deleted_results: 3 });
});

test("deletion-on-request window is the anonymous capability lifetime", () => {
  assert.equal(DELETION_ON_REQUEST_DAYS, 30);
  assert.equal(CAPABILITY_TTL_MS, DELETION_ON_REQUEST_DAYS * MS_PER_DAY);
});

test("anonymous fit feedback is purged on the same 30-day window and account rows stay", () => {
  const older = { id: "fit-old", userId: null, createdAt: atOffset(-1) };
  const exact = { id: "fit-exact", userId: null, createdAt: atOffset(0) };
  const newer = { id: "fit-new", userId: null, createdAt: atOffset(MS_PER_DAY) };
  const owned = { id: "fit-owned", userId: "user-1", createdAt: atOffset(-MS_PER_DAY) };
  const selected = selectAnonymousFitFeedbackForPurge([newer, exact, older, owned], NOW);
  assert.deepEqual(selected.map((item) => item.id), ["fit-old"]);
});

test("fit feedback migration removes rows with the result and within 30 days", () => {
  const sql = readFileSync(join(clientRoot, "../supabase/migrations/20261022014756_result_fit_feedback.sql"), "utf8");
  assert.match(sql, /CREATE TABLE public\.result_fit_feedback/);
  assert.match(sql, /REFERENCES public\.quiz_results \(id\) ON DELETE CASCADE/);
  assert.match(sql, /REFERENCES public\.quiz_sessions \(id\) ON DELETE CASCADE/);
  assert.match(sql, /CHECK \(fit IN \('yes', 'somewhat', 'no'\)\)/);
  assert.match(sql, /char_length\(comment\) <= 500/);
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /REVOKE ALL ON TABLE public\.result_fit_feedback FROM PUBLIC, anon, authenticated/);
  assert.match(sql, /TO service_role/);
  assert.equal(/FOR INSERT TO anon/i.test(sql), false);
  assert.match(sql, /DELETE FROM result_fit_feedback WHERE user_id = p_user_id OR session_id = ANY\(owned_session_ids\)/);
  assert.match(sql, /DELETE FROM result_fit_feedback WHERE session_id = p_session_id AND user_id IS NULL/);
  assert.match(sql, /DELETE FROM result_fit_feedback\s+WHERE user_id IS NULL\s+AND created_at < NOW\(\) - INTERVAL '30 days'/);
  const intervals = [...sql.matchAll(/INTERVAL '(\d+) days'/g)].map((match) => Number(match[1]));
  assert.deepEqual(intervals, Array(intervals.length).fill(ANONYMOUS_RESULT_RETENTION_DAYS));
  assert.ok(intervals.length >= 3);

  const route = readFileSync(join(clientRoot, "src/app/api/internal/privacy/purge/route.ts"), "utf8");
  assert.equal(route.includes("selectAnonymousFitFeedbackForPurge"), true);
  assert.equal(route.includes("result_fit_feedback"), true);
  assert.equal(route.includes("delete_anonymous_result_data"), true);
});

test("migration 006 uses the same retention day count and the cron schedule is unchanged", () => {
  const sql = readFileSync(join(clientRoot, "../supabase/migrations/006_privacy_identity_and_anonymous_retention.sql"), "utf8");
  const intervals = [...sql.matchAll(/INTERVAL '(\d+) days'/g)].map((match) => Number(match[1]));
  assert.deepEqual(intervals, [ANONYMOUS_RESULT_RETENTION_DAYS, ANONYMOUS_RESULT_RETENTION_DAYS]);

  const vercel = JSON.parse(readFileSync(join(clientRoot, "vercel.json"), "utf8"));
  const cron = vercel.crons.find((entry) => entry.path === ANONYMOUS_RETENTION_PURGE_PATH);
  assert.equal(cron.schedule, ANONYMOUS_RETENTION_CRON_SCHEDULE);
});
