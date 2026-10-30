/**
 * The results page leads with a plain summary and two career fields.
 * Detail labels stay available, but the open page does not use method terms.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreShortformVersioned } from "../../src/lib/quiz/scoreShortformVersioned.ts";
import {
  RESULT_DISCLOSURE_LABELS,
  RESULT_SECTION_HEADINGS,
  buildResultView,
  buildResultViewFromVersioned,
} from "../../src/lib/results/resultViewModel.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const personas = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/personas.json"), "utf8"));
const quizqa = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/quizqa-round8.json"), "utf8"));
const summarySource = readFileSync(join(root, "src/app/results/views/ResultSummary.tsx"), "utf8");

function viewFor(persona) {
  const responses = persona.answers.map((choice, index) => ({ questionId: index + 1, choice, timeSpent: 6 }));
  const scored = scoreShortformVersioned(responses, "v5");
  return { scored, view: buildResultViewFromVersioned(scored, responses) };
}

const byId = Object.fromEntries([...personas, ...quizqa].map((persona) => [persona.id, persona]));

function assertPlainPage(view, label) {
  assert.equal(view.page.careers.length, 2, label);
  assert.ok(view.page.thisWeek.length >= 1 && view.page.thisWeek.length <= 3, label);
  assert.match(view.page.summary, /^You /, label);
  assert.equal((view.page.summary.match(/[.!?]/g) ?? []).length >= 1, true, label);
  const open = `${view.page.summary} ${view.page.workBest} ${view.page.watch ?? ""} ${view.page.careers.map((field) => `${field.name} ${field.reason}`).join(" ")}`;
  assert.doesNotMatch(open, /\b(MBTI|Big Five|DISC|Stress Reactivity|Openness|Extraversion|Agreeableness)\b/, label);
  for (const field of view.page.careers) {
    assert.ok(field.reason.length > 20 && field.reason.length < 320, `${label} ${field.reason}`);
  }
}

test("high school and college results use the short page structure", () => {
  const highSchool = viewFor(byId.P03);
  const college = viewFor(byId.P84);
  assert.equal(highSchool.scored.stage, "high");
  assert.equal(college.scored.stage, "college");
  assertPlainPage(highSchool.view, "P03");
  assertPlainPage(college.view, "P84");
  assert.notEqual(highSchool.view.page.workBest, college.view.page.workBest);
  assert.match(highSchool.view.page.workBest, /class or a club|homework|assignment/);
  assert.match(college.view.page.workBest, /group project|office hours|study block|checklist/);
});

test("middle school and high school share the same how-you-work line for the same style", () => {
  const base = {
    bigFive: { O: 40, C: 82, E: 28, A: 48, N: 30 },
    disc: { D: 10, I: 12, S: 18, C: 60 },
    mbtiType: "ISTJ",
    primaryDisc: "C",
    scoringVersion: "v5",
    career: { trades: 40, organizing: 12 },
    mbtiScores: { E: 20, I: 80, S: 70, N: 30, T: 72, F: 28, J: 76, P: 24 },
    direction: {
      laneKey: "v5:trades",
      title: "Skilled trades: building, fixing, and installing",
      rationale: "Your answers about the work you enjoy pointed most to building and fixing real things with tools.",
      examples: ["Electrician"],
      nextSteps: ["Look at apprenticeships (electrical, plumbing, HVAC) that pay while you learn"],
    },
  };
  const at = (choice) => buildResultView({
    ...base,
    responses: Array.from({ length: 30 }, (_, index) => ({ questionId: index + 1, choice: index === 29 ? choice : 0, timeSpent: 8 })),
  });
  const middle = at(0);
  const high = at(1);
  const college = at(2);
  assert.equal(middle.page.workBest, high.page.workBest);
  assert.notEqual(college.page.workBest, high.page.workBest);
  assert.match(college.page.workBest, /checklist/);
  assert.match(college.page.summary, /Skilled trades: building, fixing, and installing/);
  assert.equal(college.page.careers.length, 2);
  assert.doesNotMatch(college.page.summary, /ISTJ|Conscientious|Big Five/);
});

test("the results page exposes collapsed disclosures with aria-expanded", () => {
  assert.match(summarySource, /aria-expanded=\{open\}/);
  assert.match(summarySource, /aria-controls=/);
  assert.match(summarySource, /type="button"/);
  assert.match(summarySource, /hidden=\{!open\}/);
  assert.match(summarySource, /RESULT_SECTION_HEADINGS\.work/);
  assert.match(summarySource, /RESULT_SECTION_HEADINGS\.careers/);
  assert.match(summarySource, /RESULT_SECTION_HEADINGS\.week/);
  assert.match(summarySource, /RESULT_DISCLOSURE_LABELS\.labels/);
  assert.match(summarySource, /RESULT_DISCLOSURE_LABELS\.scores/);
  assert.match(summarySource, /RESULT_DISCLOSURE_LABELS\.method/);
  assert.equal(RESULT_SECTION_HEADINGS.work, "How you work best");
  assert.equal(RESULT_SECTION_HEADINGS.careers, "Good-fit careers");
  assert.equal(RESULT_SECTION_HEADINGS.week, "Try this week");
  assert.equal(RESULT_SECTION_HEADINGS.watch, "One thing to watch");
  assert.equal(RESULT_DISCLOSURE_LABELS.labels, "Style labels");
  assert.equal(RESULT_DISCLOSURE_LABELS.scores, "Trait scores");
  assert.equal(RESULT_DISCLOSURE_LABELS.roles, "More career ideas");
  assert.equal(RESULT_DISCLOSURE_LABELS.method, "How this result was read");
});
