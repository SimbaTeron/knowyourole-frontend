/**
 * Q30 life stage is unscored. Middle and high school share teen copy.
 * College must not inherit the teen "own a business someday" add-on.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreShortformVersioned } from "../../src/lib/quiz/scoreShortformVersioned.ts";
import { deriveWorkDirectionV5 } from "../../src/lib/results/workDirectionV5.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const personas = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/personas.json"), "utf8"));
const quizqa = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/quizqa-round8.json"), "utf8"));

const COLLEGE_OWN = {
  trades: "Own a trades business after you finish training",
  artDesign: "Start a small design business while you are in school",
  creator: "Turn your channel or client work into a small business",
  care: "Start a campus care service, like tutoring or pet care",
};

const COLLEGE_STEP = {
  trades: "Talk with a trades business owner about licensing, pricing, and your first customers",
  artDesign: "Sell or show 3 pieces on campus or online and note what people ask to buy",
  creator: "List three ways your videos or posts could earn money while you are in school",
  care: "Look into the license and training you would need before you open a small care business",
};

const TEEN_OWN = {
  trades: "Own a trades business someday",
  artDesign: "Run an online art or design shop",
  creator: "Grow your own channel as a small business",
  care: "Start a pet-sitting or tutoring service",
};

function directionFor(career, stage) {
  return deriveWorkDirectionV5(career, stage, { entrepreneurship: 90 });
}

test("college trades persona does not get the teen someday line", () => {
  const persona = [...personas, ...quizqa].find((row) => row.id === "P146");
  assert.ok(persona, "P146");
  const responses = persona.answers.map((choice, index) => ({ questionId: index + 1, choice, timeSpent: 6 }));
  const scored = scoreShortformVersioned(responses, "v5");
  assert.equal(scored.stage, "college");
  const examples = scored.v5Direction.examples.join(" | ");
  assert.match(examples, /Own a trades business after you finish training/);
  assert.doesNotMatch(examples, /Own a trades business someday/);
  assert.equal(scored.v5Direction.nextSteps[0], COLLEGE_STEP.trades);
  assert.match(examples, /weld/i);
  assert.match(examples, /electric/i);
});

test("middle and high school share the teen own-a-business line; college and adult do not", () => {
  const career = { trades: 200, business: 40 };
  for (const stage of ["middle", "high"]) {
    const direction = directionFor(career, stage);
    assert.ok(direction.examples.includes(TEEN_OWN.trades), `${stage}: ${direction.examples.join(" | ")}`);
    assert.equal(direction.examples.includes(COLLEGE_OWN.trades), false, stage);
  }
  const college = directionFor(career, "college");
  assert.ok(college.examples.includes(COLLEGE_OWN.trades), college.examples.join(" | "));
  assert.equal(college.examples.includes(TEEN_OWN.trades), false);
  assert.equal(college.nextSteps[0], COLLEGE_STEP.trades);
  const adult = directionFor(career, "adult");
  assert.ok(adult.examples.includes("Own a trades business"), adult.examples.join(" | "));
  assert.equal(adult.examples.includes(TEEN_OWN.trades), false);
  assert.equal(adult.examples.includes(COLLEGE_OWN.trades), false);
  assert.match(adult.nextSteps[0], /one-page plan/);
});

test("each ownable lane has college wording that is not the teen line", () => {
  const lanes = ["trades", "artDesign", "creator", "care"];
  for (const lane of lanes) {
    const career = { [lane]: 200, business: 40 };
    const college = directionFor(career, "college");
    const high = directionFor(career, "high");
    assert.ok(college.examples.includes(COLLEGE_OWN[lane]), `${lane} college: ${college.examples.join(" | ")}`);
    assert.equal(college.examples.includes(TEEN_OWN[lane]), false, lane);
    assert.equal(college.nextSteps[0], COLLEGE_STEP[lane], lane);
    assert.ok(high.examples.includes(TEEN_OWN[lane]), `${lane} high: ${high.examples.join(" | ")}`);
    assert.equal(high.examples.includes(COLLEGE_OWN[lane]), false, lane);
  }
});
