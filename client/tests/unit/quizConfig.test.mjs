import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { QUESTION_COUNT, QUIZ_CONFIG, QUIZ_QUESTIONS, questionIsScored } from "../../src/lib/quiz/quizConfig.ts";
import { SHORTFORM_V2_QUESTIONS } from "../../src/data/shortformV2Questions.ts";
import { LEGACY_REPORTING_ANSWER_COLUMNS, LEGACY_V2_QUESTION_COUNT } from "../../src/lib/quiz/legacyQuestionCounts.ts";
import {
  FROZEN_PR15_FILES,
  bannedPhrasesInLine,
  bannedPhrasesInSource,
  formatQuestionCountHits,
  scanQuestionCountPhrases,
} from "../../src/lib/quiz/questionCountPhrases.mjs";

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("question count is derived from the live v5 bank", () => {
  assert.equal(QUIZ_QUESTIONS, SHORTFORM_V2_QUESTIONS);
  assert.equal(QUESTION_COUNT, SHORTFORM_V2_QUESTIONS.length);
  assert.equal(QUIZ_CONFIG.questionCount, QUESTION_COUNT);
  assert.equal(QUIZ_CONFIG.questions, QUIZ_QUESTIONS);
  assert.equal(QUIZ_CONFIG.questionFlags.length, QUESTION_COUNT);
  const ids = QUIZ_QUESTIONS.map((question) => question.id);
  assert.equal(new Set(ids).size, QUESTION_COUNT);
  assert.deepEqual(ids, Array.from({ length: QUESTION_COUNT }, (_, index) => index + 1));
});

test("scored flag comes from answer weights, not a hand-written id list", () => {
  const unscored = QUIZ_CONFIG.questionFlags.filter((question) => !question.scored);
  assert.deepEqual(unscored.map((question) => question.key), ["life-stage"]);
  for (const question of QUIZ_QUESTIONS) {
    const flagged = QUIZ_CONFIG.questionFlags.find((flag) => flag.id === question.id);
    assert.equal(flagged.scored, questionIsScored(question));
    assert.equal(flagged.scored, question.key !== "life-stage");
  }
});

test("legacy stored-result length stays separate from the live count", () => {
  assert.equal(LEGACY_REPORTING_ANSWER_COLUMNS, LEGACY_V2_QUESTION_COUNT);
  assert.notEqual(LEGACY_V2_QUESTION_COUNT, QUESTION_COUNT);
});

test("guard rejects hardcoded count phrases and allows the legacy constant name", () => {
  const questions = "30" + " questions";
  const answers = "28" + " answers";
  const hyphen = "30" + "-question";
  const grounded = "30" + " grounded questions";
  const prompts = "30" + " fixed prompts";
  const eventLiteral = "total_questions: " + "30";
  const assignLiteral = "questionCount = " + "30";
  const spacedAssign = "question_count = " + "28";
  assert.deepEqual(bannedPhrasesInLine(`Start the ${questions} now`), [questions]);
  assert.deepEqual(bannedPhrasesInLine(`Analyzing your ${answers} today`), [answers]);
  assert.deepEqual(bannedPhrasesInLine(`Free ${hyphen} quiz`), [hyphen]);
  assert.deepEqual(bannedPhrasesInLine(grounded), [grounded]);
  assert.deepEqual(bannedPhrasesInLine(prompts), [prompts]);
  assert.deepEqual(bannedPhrasesInLine(eventLiteral), [eventLiteral]);
  assert.deepEqual(bannedPhrasesInLine(assignLiteral), [assignLiteral]);
  assert.deepEqual(bannedPhrasesInLine(spacedAssign), [spacedAssign]);
  assert.deepEqual(bannedPhrasesInLine("fontSize: " + "30"), []);
  assert.deepEqual(bannedPhrasesInLine("total_questions: totalQuestions"), []);

  const legacyLine = `was ${"28"} questions via LEGACY_V2_QUESTION_COUNT`;
  const legacyAssign = `questionCount = ${"30"} // LEGACY_V2_QUESTION_COUNT`;
  assert.deepEqual(bannedPhrasesInLine(legacyLine), []);
  assert.deepEqual(bannedPhrasesInLine(legacyAssign), []);

  const sample = ["// intro", `label: "${questions}"`].join("\n");
  const hits = bannedPhrasesInSource("sample.tsx", sample);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].line, 2);
  assert.equal(hits[0].phrase, questions);
  const report = formatQuestionCountHits(hits);
  assert.match(report, /sample\.tsx:2:/);
  assert.match(report, new RegExp(questions));
});

test("client source and tests do not hard-code question-count phrases", () => {
  const { violations, frozen } = scanQuestionCountPhrases(clientRoot);
  assert.equal(
    violations.length,
    0,
    `Hard-coded question count:\n${formatQuestionCountHits(violations)}`,
  );
  const frozenFiles = [...new Set(frozen.map((hit) => hit.file))].sort();
  assert.deepEqual(frozenFiles, [...FROZEN_PR15_FILES].sort());
});
