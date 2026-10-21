import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import * as feedbackRoute from "../../src/app/api/feedback/route.ts";
import {
  FEEDBACK_MAX_BYTES,
  FEEDBACK_RATE_LIMIT,
  consumeFeedbackRate,
  feedbackRequestSchema,
  resetFeedbackRateLimits,
  toFeedbackInsert,
} from "../../src/lib/feedback/feedbackSubmission.ts";

const liveForm = {
  first_reaction: "loved_it",
  first_reaction_text: "Clear and useful",
  accuracy_score: 5,
  accuracy_surprise: "",
  personality_rating: null,
  career_rating: 4,
  mood_lab_rating: null,
  visual_rating: null,
  share_card_rating: null,
  most_valuable_feature: "career direction",
  retake_quiz: "Yes",
  shared_results: "No",
  nps_score: 9,
  career_relevance: 4,
  feels_designed_for_you: "Mostly",
  college_suggestions: "",
  bugs_issues: "",
  email: "",
  anything_else: "",
  quiz_type: "full",
  mbti_type: "INTJ",
  disc_style: "C",
  primary_role: "Analyst",
  tier: "25+",
};

const legacyModal = {
  sessionId: "quiz-1",
  usefulApp: "yes",
  resultsAccurate: "mostly",
  questionsEngaging: "yes",
  wouldShare: "no",
  suggestions: "shorter intro",
  mbtiType: "INTJ",
  discStyle: "C",
  primaryRole: "Analyst",
  tier: "25+",
  mood: "focused",
  funMode: false,
  timestamp: "2026-06-01T12:00:00.000Z",
};

test("live feedback form is accepted and a blank email is not stored", () => {
  const parsed = feedbackRequestSchema.parse(liveForm);
  const row = toFeedbackInsert(parsed);
  assert.equal(row.email, null);
  assert.equal(row.first_reaction, "loved_it");
  assert.equal(row.nps_score, 9);
  assert.equal(row.mbti_type, "INTJ");
});

test("live feedback form may store one valid email", () => {
  const parsed = feedbackRequestSchema.parse({ ...liveForm, email: "student@university.edu" });
  assert.equal(toFeedbackInsert(parsed).email, "student@university.edu");
});

test("legacy results modal payload is accepted without an email", () => {
  const row = toFeedbackInsert(feedbackRequestSchema.parse(legacyModal));
  assert.equal(row.session_id, "quiz-1");
  assert.equal(row.useful_app, "yes");
  assert.equal(row.fun_mode, false);
  assert.equal(row.email, null);
  assert.equal(row.suggestions, "shorter intro");
});

test("email must be a real address, and unknown fields are rejected", () => {
  assert.equal(feedbackRequestSchema.safeParse({ ...liveForm, email: "not-an-email" }).success, false);
  assert.equal(feedbackRequestSchema.safeParse({ ...liveForm, email: `${"a".repeat(250)}@x.co` }).success, false);
  assert.equal(feedbackRequestSchema.safeParse({ ...liveForm, password: "nope" }).success, false);
  assert.equal(feedbackRequestSchema.safeParse({ ...liveForm, anything_else: "x".repeat(1_001) }).success, false);
});

test("rate limit allows a short burst and then blocks", () => {
  resetFeedbackRateLimits();
  const now = 1_700_000_000_000;
  for (let i = 0; i < FEEDBACK_RATE_LIMIT; i += 1) {
    assert.equal(consumeFeedbackRate("203.0.113.5", now), false);
  }
  assert.equal(consumeFeedbackRate("203.0.113.5", now), true);
  assert.equal(consumeFeedbackRate("203.0.113.6", now), false);
});

test("POST rejects a bad email, an oversized body, and a foreign origin before any database call", async () => {
  resetFeedbackRateLimits();
  const url = "http://localhost/api/feedback";

  const invalid = await feedbackRoute.POST(new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.10" },
    body: JSON.stringify({ ...liveForm, email: "drop table" }),
  }));
  assert.equal(invalid.status, 400);

  const oversized = await feedbackRoute.POST(new NextRequest(url, {
    method: "POST",
    headers: { "x-forwarded-for": "198.51.100.11" },
    body: "x".repeat(FEEDBACK_MAX_BYTES + 1),
  }));
  assert.equal(oversized.status, 413);

  const foreign = await feedbackRoute.POST(new NextRequest(url, {
    method: "POST",
    headers: { origin: "https://evil.example", "content-type": "application/json", "x-forwarded-for": "198.51.100.12" },
    body: "{}",
  }));
  assert.equal(foreign.status, 403);
});

test("GET /api/feedback is not implemented", () => {
  assert.equal(feedbackRoute.GET, undefined);
});
