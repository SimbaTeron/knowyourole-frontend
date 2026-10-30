import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server";
import { getGuidePage } from "../../src/lib/guidePages.ts";
import { postResultFitFeedback } from "../../src/app/api/results/fit-feedback/route.ts";
import {
  RESULT_FIT_COMMENT_MAX,
  RESULT_FIT_COPY,
  RESULT_FIT_MAX_BYTES,
  RESULT_FIT_PRIVACY_SENTENCE,
  RESULT_FIT_RATE_LIMIT,
  RESULT_FIT_STUDENT_DATA_SENTENCE,
  buildResultFitFeedbackRow,
  consumeResultFitRate,
  parseResultFitFeedbackRequest,
  planResultFitWrite,
  resetResultFitRateLimits,
  resultFitLinkFromDto,
  resultFitRatingLabel,
  resultFitTapEvent,
} from "../../src/lib/feedback/resultFitFeedback.ts";

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const resultId = "11111111-1111-4111-8111-111111111111";
const link = {
  resultType: "INTJ",
  scoringVersion: "shortform-v2-scoring-v5",
  sessionId: "22222222-2222-4222-8222-222222222222",
  userId: null,
};

function request(body, headers = {}) {
  return new NextRequest("http://localhost/api/results/fit-feedback", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("the fit choice is yes or no, and the copy stays plain", () => {
  assert.deepEqual(
    [RESULT_FIT_COPY.yes, RESULT_FIT_COPY.no],
    ["Yes", "No"],
  );
  assert.equal(RESULT_FIT_COPY.title, "Did this fit you?");
  assert.equal(RESULT_FIT_COPY.hint, "Optional. No name needed.");
  assert.equal(RESULT_FIT_COPY.thanksTitle, "Thank you.");
  assert.equal(RESULT_FIT_COPY.thanksDetail, "This helps us see what fits.");
  assert.equal(resultFitRatingLabel(1), "1, not close");
  assert.equal(resultFitRatingLabel(3), "3 of 5");
  assert.equal(resultFitRatingLabel(5), "5, very close");
  assert.equal(parseResultFitFeedbackRequest({ resultId, fit: "not sure" }).ok, false);
  assert.equal(parseResultFitFeedbackRequest({ resultId, fit: "somewhat" }).ok, false);
  assert.equal(parseResultFitFeedbackRequest({ resultId, fit: "yes", resultType: "INTJ" }).ok, false);
});

test("a tap is valid without a rating or comment, and the note is capped at 500 characters", () => {
  const tap = parseResultFitFeedbackRequest({ resultId, fit: "yes" });
  assert.equal(tap.ok, true);
  assert.equal(tap.value.rating, null);
  assert.equal(tap.value.comment, null);

  const blank = parseResultFitFeedbackRequest({ resultId, fit: "no", comment: "   ", rating: null });
  assert.equal(blank.ok, true);
  assert.equal(blank.value.comment, null);

  const note = "n".repeat(RESULT_FIT_COMMENT_MAX);
  const capped = parseResultFitFeedbackRequest({ resultId, fit: "yes", rating: 4, comment: note });
  assert.equal(capped.ok, true);
  assert.equal(capped.value.comment, note);
  assert.equal(parseResultFitFeedbackRequest({ resultId, fit: "yes", comment: `${note}x` }).ok, false);
  assert.equal(parseResultFitFeedbackRequest({ resultId, fit: "yes", rating: 0 }).ok, false);
  assert.equal(parseResultFitFeedbackRequest({ resultId, fit: "yes", rating: 6 }).ok, false);
  assert.equal(parseResultFitFeedbackRequest({ resultId, fit: "yes", email: "student@example.com" }).ok, false);
});

test("the stored row uses the saved result type and scoring version", () => {
  const requestValue = parseResultFitFeedbackRequest({ resultId, fit: "yes", comment: "  felt right  " }).value;
  const row = buildResultFitFeedbackRow(requestValue, link, resultId);
  assert.deepEqual(row, {
    result_id: resultId,
    session_id: link.sessionId,
    user_id: null,
    result_type: "INTJ",
    scoring_version: "shortform-v2-scoring-v5",
    fit: "yes",
    rating: null,
    comment: "felt right",
  });
  assert.equal("email" in row, false);
  assert.equal(resultFitLinkFromDto({
    meta: { sessionId: link.sessionId, userId: null },
    scores: { mbti: { type: "ENFP" } },
    version: { scoringVersion: "" },
  }), null);
});

test("a follow-up can add a rating or note and cannot replace the first choice", () => {
  const row = buildResultFitFeedbackRow(
    parseResultFitFeedbackRequest({ resultId, fit: "yes" }).value,
    link,
    resultId,
  );
  assert.equal(planResultFitWrite(null, row).action, "insert");

  const existing = { id: "fit-1", fit: "yes", rating: null, comment: null };
  const withNote = buildResultFitFeedbackRow(
    parseResultFitFeedbackRequest({ resultId, fit: "yes", comment: "too broad" }).value,
    link,
    resultId,
  );
  assert.deepEqual(planResultFitWrite(existing, withNote), {
    action: "update",
    resultId,
    fit: "yes",
    rating: null,
    comment: "too broad",
  });

  const unchanged = planResultFitWrite(existing, row);
  assert.equal(unchanged.action, "noop");

  const different = buildResultFitFeedbackRow(
    parseResultFitFeedbackRequest({ resultId, fit: "no" }).value,
    link,
    resultId,
  );
  assert.equal(planResultFitWrite(existing, different).action, "conflict");

  const rated = buildResultFitFeedbackRow(
    parseResultFitFeedbackRequest({ resultId, fit: "yes", rating: 2 }).value,
    link,
    resultId,
  );
  const kept = planResultFitWrite({ ...existing, comment: "too broad" }, rated);
  assert.equal(kept.action, "update");
  assert.equal(kept.comment, "too broad");
  assert.equal(kept.rating, 2);
});

test("the tap event names only the choice", () => {
  assert.deepEqual(resultFitTapEvent("no"), { name: "result_fit_tapped", params: { fit: "no" } });
  assert.equal(Object.keys(resultFitTapEvent("yes").params).join(","), "fit");
});

test("rate limit allows a short burst and then blocks", () => {
  resetResultFitRateLimits();
  const now = 1_700_000_000_000;
  for (let i = 0; i < RESULT_FIT_RATE_LIMIT; i += 1) {
    assert.equal(consumeResultFitRate("203.0.113.20", now), false);
  }
  assert.equal(consumeResultFitRate("203.0.113.20", now), true);
  assert.equal(consumeResultFitRate("203.0.113.21", now), false);
});

test("POST rejects a bad choice, an oversized body, a foreign origin, and a burst", async () => {
  resetResultFitRateLimits();
  const invalid = await postResultFitFeedback(request(
    { resultId, fit: "not sure", comment: "hello" },
    { "x-forwarded-for": "198.51.100.20" },
  ));
  assert.equal(invalid.status, 400);

  const oversized = await postResultFitFeedback(request("x".repeat(RESULT_FIT_MAX_BYTES + 1), {
    "x-forwarded-for": "198.51.100.21",
  }));
  assert.equal(oversized.status, 413);

  const foreign = await postResultFitFeedback(request({ resultId, fit: "yes" }, {
    origin: "https://evil.example",
    "x-forwarded-for": "198.51.100.22",
  }));
  assert.equal(foreign.status, 403);

  resetResultFitRateLimits();
  const nowHeaders = { "x-forwarded-for": "198.51.100.23" };
  for (let i = 0; i < RESULT_FIT_RATE_LIMIT; i += 1) {
    const blockedAttempt = await postResultFitFeedback(request({ resultId, fit: "not sure" }, nowHeaders));
    assert.equal(blockedAttempt.status, 400);
  }
  const blocked = await postResultFitFeedback(request({ resultId, fit: "yes" }, nowHeaders));
  assert.equal(blocked.status, 429);
});

test("POST stores the server result link and does not require a follow-up", async () => {
  resetResultFitRateLimits();
  const saved = [];
  const deps = {
    async findResult() {
      return {
        ok: true,
        row: {
          id: resultId,
          user_id: null,
          session_id: link.sessionId,
          responses: {},
          deleted: false,
        },
      };
    },
    async canAccess() {
      return true;
    },
    readLink() {
      return link;
    },
    async loadExisting() {
      return saved.length === 0 ? null : {
        id: "fit-1",
        fit: saved[0].fit,
        rating: saved[0].rating,
        comment: saved[0].comment,
      };
    },
    async save(plan) {
      if (plan.action === "insert") {
        saved.push(plan.row);
        return { ok: true, id: "fit-1" };
      }
      saved[0] = { ...saved[0], rating: plan.rating, comment: plan.comment };
      return { ok: true, id: "fit-1" };
    },
  };

  const tap = await postResultFitFeedback(request({ resultId, fit: "yes" }, {
    "x-forwarded-for": "198.51.100.30",
  }), deps);
  assert.equal(tap.status, 201);
  const tapBody = await tap.json();
  assert.equal(tapBody.success, true);
  assert.equal(tapBody.alreadySubmitted, false);
  assert.equal(saved[0].result_type, "INTJ");
  assert.equal(saved[0].scoring_version, "shortform-v2-scoring-v5");
  assert.equal(saved[0].rating, null);
  assert.equal(saved[0].comment, null);

  const extra = await postResultFitFeedback(request({
    resultId,
    fit: "yes",
    rating: 5,
    comment: "close",
  }, { "x-forwarded-for": "198.51.100.30" }), deps);
  assert.equal(extra.status, 200);
  assert.equal(saved[0].rating, 5);
  assert.equal(saved[0].comment, "close");
  assert.equal(saved[0].result_type, "INTJ");
});

test("POST refuses a caller who cannot access the result", async () => {
  resetResultFitRateLimits();
  const response = await postResultFitFeedback(request({ resultId, fit: "no" }, {
    "x-forwarded-for": "198.51.100.40",
  }), {
    async findResult() {
      return { ok: true, row: { id: resultId, user_id: null, session_id: link.sessionId, responses: {}, deleted: false } };
    },
    async canAccess() {
      return false;
    },
    readLink() {
      return link;
    },
    async loadExisting() {
      return null;
    },
    async save() {
      throw new Error("save should not run");
    },
  });
  assert.equal(response.status, 403);
});

test("privacy and student-data copy mention the optional fit answer", () => {
  const privacy = readFileSync(join(clientRoot, "src/app/privacy/page.tsx"), "utf8");
  assert.equal(privacy.includes("RESULT_FIT_PRIVACY_SENTENCE"), true);
  assert.equal(privacy.includes(RESULT_FIT_PRIVACY_SENTENCE), false);
  const counselors = getGuidePage("/for-counselors");
  const student = counselors.sections.find((section) => section.heading === "Student data at a glance");
  assert.equal(student.paragraphs.some((paragraph) => paragraph.includes(RESULT_FIT_STUDENT_DATA_SENTENCE)), true);
  const component = readFileSync(join(clientRoot, "src/components/results/ResultFitFeedback.tsx"), "utf8");
  assert.equal(component.includes("resultFitTapEvent"), true);
  assert.equal(/trackKyrEvent\([^)]*comment/.test(component), false);
});
