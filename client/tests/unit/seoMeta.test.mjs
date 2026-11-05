import test from "node:test";
import assert from "node:assert/strict";
import { publicPages } from "../../src/lib/seo.ts";
import { allSeoPages } from "../../src/lib/seo-pages.ts";
import { QUESTION_COUNT } from "../../src/lib/quiz/quizConfig.ts";

const GUIDE_FAQ_PATHS = [
  "/career-quiz-for-teens",
  "/careers/creator-careers-quiz",
  "/careers/trades-career-quiz",
  "/for-counselors",
  "/for-parents",
];

test("public titles stay within 60 characters and descriptions within 160", () => {
  const over = publicPages
    .filter((page) => page.title.length > 60 || page.description.length > 160)
    .map((page) => `${page.path} title ${page.title.length} description ${page.description.length}`);
  assert.deepEqual(over, []);
  const home = publicPages.find((page) => page.path === "/");
  const quiz = publicPages.find((page) => page.path === "/quiz");
  assert.ok(home && quiz);
  assert.ok(home.title.includes("Work Style"));
  assert.ok(home.title.includes("Career Quiz"));
  assert.ok(quiz.title.includes("Work Style Quiz"));
  assert.ok(quiz.title.includes("No Sign-Up"));
  assert.ok(home.description.includes(`${QUESTION_COUNT}-question work style`));
  assert.ok(quiz.description.includes(`${QUESTION_COUNT}-question work style`));
});

test("generated SEO pages keep FAQ copy only on the guides that show a FAQ", () => {
  const withFaqs = allSeoPages.filter((page) => page.faqs?.length).map((page) => page.path).sort();
  assert.deepEqual(withFaqs, [...GUIDE_FAQ_PATHS].sort());
});
