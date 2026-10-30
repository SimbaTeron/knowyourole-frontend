import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { postPublicFeedback } from "../../src/app/api/feedback/route.ts";
import {
  feedbackRequestSchema,
  requestedResultId,
  resetFeedbackRateLimits,
  toFeedbackInsert,
} from "../../src/lib/feedback/feedbackSubmission.ts";
import {
  SCALE_FEEDBACK_PRIVACY_SENTENCE,
  SCALE_QUESTIONS,
  emptyScaleAnswers,
  leaveFeedbackPath,
  linkScaleFeedbackToResult,
  normalizeScaleRatings,
  scalePayload,
} from "../../src/lib/feedback/scaleFeedback.ts";
import FeedbackPage from "../../src/app/feedback/page.tsx";

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const resultId = "11111111-1111-4111-8111-111111111111";
const sessionId = "22222222-2222-4222-8222-222222222222";

test("the feedback page asks five optional questions and one submit", () => {
  const html = renderToStaticMarkup(createElement(FeedbackPage));
  assert.match(html, /Leave feedback/);
  assert.match(html, /All five questions are optional/);
  assert.match(html, /1 is low\. 5 is high\./);
  assert.equal((html.match(/<legend/g) || []).length, 5);
  for (const question of SCALE_QUESTIONS) assert.match(html, new RegExp(question.prompt.replace(/[?]/g, "\\?")));
  assert.match(html, />Submit</);
  assert.equal(html.includes("Somewhat"), false);
  assert.equal(html.includes("required"), false);
  assert.equal((html.match(/type="submit"/g) || []).length, 1);
  const page = readFileSync(join(clientRoot, "src/app/feedback/page.tsx"), "utf8");
  assert.equal(page.includes("window.scrollTo"), false);
  const results = readFileSync(join(clientRoot, "src/app/results/ResultsPageClient.tsx"), "utf8");
  assert.match(results, /Leave feedback/);
  assert.match(results, /leaveFeedbackPath/);
  const privacy = readFileSync(join(clientRoot, "src/app/privacy/page.tsx"), "utf8");
  assert.equal(privacy.includes("SCALE_FEEDBACK_PRIVACY_SENTENCE"), true);
  assert.equal(privacy.includes(SCALE_FEEDBACK_PRIVACY_SENTENCE), false);
});

test("scale ratings are optional 1 to 5 values and link to a saved result id", () => {
  assert.equal(leaveFeedbackPath({}), "/feedback");
  assert.equal(
    leaveFeedbackPath({ resultId, sessionId }),
    `/feedback?resultId=${resultId}&sessionId=${sessionId}`,
  );
  const blank = scalePayload(emptyScaleAnswers(), null);
  assert.equal(feedbackRequestSchema.safeParse(blank).success, true);
  const parsedBlank = normalizeScaleRatings(feedbackRequestSchema.parse(blank));
  assert.equal(parsedBlank.ok, true);
  assert.equal(parsedBlank.value.questions_engaging, null);
  assert.equal(parsedBlank.value.career_relevance, null);

  const answers = { ...emptyScaleAnswers(), quizEase: 4, resultDescribe: 3, careerIdeas: 5, shareFriend: 2, useForPath: 1 };
  const body = scalePayload(answers, resultId);
  const parsed = feedbackRequestSchema.parse(body);
  assert.equal(requestedResultId(parsed), resultId);
  const ratings = normalizeScaleRatings(parsed);
  assert.equal(ratings.ok, true);
  const row = linkScaleFeedbackToResult(
    { ...toFeedbackInsert(parsed), ...ratings.value, quiz_type: "scale" },
    { id: resultId, sessionId },
  );
  assert.equal(row.questions_engaging, "4");
  assert.equal(row.personality_rating, 3);
  assert.equal(row.career_rating, 5);
  assert.equal(row.would_share, "2");
  assert.equal(row.career_relevance, 1);
  assert.equal(row.session_id, sessionId);
  assert.equal(row.suggestions, resultId);
  assert.equal(row.quiz_type, "scale");

  assert.equal(normalizeScaleRatings({ ...parsed, personality_rating: 6 }).ok, false);
  assert.equal(normalizeScaleRatings({ ...parsed, questions_engaging: "easy" }).ok, false);
  assert.equal(normalizeScaleRatings({ ...parsed, career_relevance: 0 }).ok, false);
});

test("scale feedback stores the saved result only when that result can be accessed", async () => {
  resetFeedbackRateLimits();
  const inserted = [];
  const deps = {
    async findResult(id) {
      assert.equal(id, resultId);
      return { ok: true, row: { id: resultId, user_id: null, session_id: sessionId, deleted: false } };
    },
    async canAccess() {
      return true;
    },
    async insert(row) {
      inserted.push(row);
      return { ok: true, id: "feedback-1" };
    },
  };
  const linked = await postPublicFeedback(new NextRequest("http://localhost/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.70" },
    body: JSON.stringify(scalePayload({ ...emptyScaleAnswers(), quizEase: 2 }, resultId)),
  }), deps);
  assert.equal(linked.status, 200);
  assert.equal(inserted[0].suggestions, resultId);
  assert.equal(inserted[0].session_id, sessionId);
  assert.equal(inserted[0].questions_engaging, "2");

  const denied = await postPublicFeedback(new NextRequest("http://localhost/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.71" },
    body: JSON.stringify(scalePayload(emptyScaleAnswers(), resultId)),
  }), {
    ...deps,
    async canAccess() { return false; },
    async insert() { throw new Error("insert should not run"); },
  });
  assert.equal(denied.status, 403);

  const unlinked = await postPublicFeedback(new NextRequest("http://localhost/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.72" },
    body: JSON.stringify(scalePayload(emptyScaleAnswers(), null)),
  }), {
    async findResult() { throw new Error("lookup should not run"); },
    async canAccess() { throw new Error("access should not run"); },
    async insert(row) {
      inserted.push(row);
      return { ok: true, id: "feedback-2" };
    },
  });
  assert.equal(unlinked.status, 200);
  assert.equal(inserted.at(-1).suggestions, null);
  assert.equal(inserted.at(-1).session_id, null);
});
