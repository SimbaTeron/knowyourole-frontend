/**
 * Result view invariants and golden copy.
 * Every persona fixture and a seeded set of random answer sheets must produce
 * one internally consistent view. Golden text locks the copy for one creative
 * persona, one trades persona, and one of each clarity level.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreShortformVersioned } from "../../src/lib/quiz/scoreShortformVersioned.ts";
import { QUESTION_COUNT } from "../../src/lib/quiz/quizConfig.ts";
import { buildResultViewFromVersioned, renderResultCopy, resultViewViolations } from "../../src/lib/results/resultViewModel.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function makeRng(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}

function responsesFrom(answers, pace = 6) {
  if (answers.length && typeof answers[0] === "number") {
    return answers.map((choice, index) => ({ questionId: index + 1, choice, timeSpent: pace }));
  }
  return answers;
}

function viewFor(version, answers, pace) {
  const responses = responsesFrom(answers, pace);
  const scored = scoreShortformVersioned(responses, version);
  return { scored, view: buildResultViewFromVersioned(scored, responses) };
}

const v4Personas = readdirSync(join(root, "tests/fixtures/personas"))
  .filter((name) => /^P\d+\.json$/.test(name))
  .sort()
  .map((name) => JSON.parse(readFileSync(join(root, "tests/fixtures/personas", name), "utf8")));

const v5Personas = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/personas.json"), "utf8"));
const quizqa = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/quizqa-round8.json"), "utf8"));

const cases = [
  ...v4Personas.map((persona) => ({ label: `v4 ${persona.id}`, version: "v4", answers: persona.answers })),
  ...v5Personas.map((persona) => ({ label: `v5 ${persona.id}`, version: "v5", answers: persona.answers })),
  ...quizqa.map((persona) => ({ label: `v5 ${persona.id}`, version: "v5", answers: persona.answers })),
];

const rng = makeRng(20261017);
const randomCases = [];
for (let index = 0; index < 24; index += 1) {
  randomCases.push({
    label: `seeded steady ${index}`,
    pace: 6,
    answers: Array.from({ length: QUESTION_COUNT }, () => Math.floor(rng() * 4)),
  });
}
for (let index = 0; index < 8; index += 1) {
  randomCases.push({
    label: `seeded fast ${index}`,
    pace: 0.4,
    answers: Array.from({ length: QUESTION_COUNT }, () => Math.floor(rng() * 4)),
  });
}

function assertConsistent(view, label) {
  const problems = resultViewViolations(view);
  assert.deepEqual(problems, [], `${label}: ${problems.join("; ")}`);
  if (view.lead.kind !== "none") {
    assert.notEqual(view.lead.caption, "Balanced");
    assert.ok(!view.lead.caption.toLowerCase().includes("balanced"), `${label} names Balanced as a trait`);
  }
}

for (const row of cases) {
  test(`${row.label} result view is internally consistent`, () => {
    const { view } = viewFor(row.version, row.answers);
    assertConsistent(view, row.label);
  });
}

for (const row of randomCases) {
  test(`${row.label} result view is internally consistent`, () => {
    const { view } = viewFor("v5", row.answers, row.pace);
    assertConsistent(view, row.label);
  });
}

test("persona fixtures cover clear, mixed, and broad", () => {
  const levels = new Set(cases.map((row) => viewFor(row.version, row.answers).view.clarity));
  assert.deepEqual([...levels].sort(), ["broad", "clear", "mixed"]);
});

test("golden result copy matches the locked personas", () => {
  const golden = readFileSync(join(root, "tests/fixtures/result-copy/golden.txt"), "utf8").trim();
  const blocks = golden.split(/\n\n(?====== )/).map((block) => {
    const [header, ...rest] = block.split("\n");
    const id = header.split(" ")[1];
    return { id, body: rest.join("\n") };
  });
  assert.deepEqual(blocks.map((block) => block.id), ["P08", "P34", "P53", "P125", "P05", "P149"]);
  const byId = Object.fromEntries([...v5Personas, ...quizqa].map((persona) => [persona.id, persona]));
  for (const block of blocks) {
    const { view } = viewFor("v5", byId[block.id].answers);
    assert.equal(renderResultCopy(view).trim(), block.body.trim(), block.id);
  }
});
