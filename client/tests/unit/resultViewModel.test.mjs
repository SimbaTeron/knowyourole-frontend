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
import { buildResultViewFromVersioned, renderResultCopy, resultViewViolations, NO_LEAD_CAPTION } from "../../src/lib/results/resultViewModel.ts";
import { fitWrappedText, SHARE_SIGNAL_BOX, SHARE_WHY_BOX } from "../../src/lib/results/shareCardLayout.ts";

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

const personasById = Object.fromEntries([...v5Personas, ...quizqa].map((persona) => [persona.id, persona]));

test("clear results do not pair stood-out copy with no single standout", () => {
  for (const id of ["P114", "P123", "P131", "R6-P53"]) {
    const { view } = viewFor("v5", personasById[id].answers);
    assert.equal(view.clarity, "clear", id);
    assert.match(view.clarityNote.body, /stood out/, id);
    assert.equal(view.lead.kind, "relative", id);
    assert.equal(view.lead.caption, "Structure / Follow-through", id);
    assert.notEqual(view.lead.caption, NO_LEAD_CAPTION, id);
    assert.doesNotMatch(view.bigFiveLead, /^No single/, id);
    assert.doesNotMatch(view.imageTraitLine, /No single standout/, id);
    assert.doesNotMatch(view.pdfTraitLine, /No single standout/, id);
    assert.doesNotMatch(view.shareMeta, /No single standout/, id);
    assert.equal(resultViewViolations(view).length, 0, id);
  }

  const { view } = viewFor("v5", personasById.P114.answers);
  const broken = {
    ...view,
    lead: { kind: "none", statLabel: "Top trait", statBand: "Balanced", caption: NO_LEAD_CAPTION },
    bigFiveLead: "No single Big Five trait stands out: your traits landed close together, so read them as light leans.",
    imageTraitLine: NO_LEAD_CAPTION,
    pdfTraitLine: NO_LEAD_CAPTION,
    bigFiveSubtitle: NO_LEAD_CAPTION,
    shareMeta: `${view.mbtiType} · ${view.discLabel} · ${NO_LEAD_CAPTION}`,
  };
  const problems = resultViewViolations(broken);
  assert.ok(problems.includes("clear stood-out note is paired with no single standout"), problems.join("; "));
  assert.ok(problems.includes("clear result has no standout trait"));
});

function measureLikeSans(text, fontSize) {
  return text.length * fontSize * 0.56;
}

test("share card why and signal text fit inside their boxes", () => {
  const why = `${viewFor("v5", personasById.P149.answers).view.whyLine} Try your own result at knowyourole.com.`;
  const signal = "I make good work repeatable, reliable, and built to last. My Dominant style adds direct, decisive movement.";
  const samples = [
    ["P149 why", why, SHARE_WHY_BOX],
    ["P114 signal", signal, SHARE_SIGNAL_BOX],
  ];
  for (const [label, text, box] of samples) {
    const fitted = fitWrappedText({
      text,
      maxWidth: box.maxWidth,
      maxHeight: box.maxHeight,
      startSize: box.startSize,
      minSize: box.minSize,
      lineHeightRatio: box.lineHeightRatio,
      measure: measureLikeSans,
    });
    assert.equal(fitted.lines.join(" "), text, label);
    assert.equal(fitted.fits, true, `${label} font ${fitted.fontSize} lines ${fitted.lines.length}`);
    assert.ok(fitted.lines.length * fitted.lineHeight <= box.maxHeight, label);
    assert.ok(fitted.lines.every((line) => measureLikeSans(line, fitted.fontSize) <= box.maxWidth), label);
  }
});
