/**
 * Hands-on answer patterns should list trades roles on the result.
 * Suggested roles are the v5 direction examples the result page shows
 * ("Roles to look into"). Fixtures are existing answer sheets. No RNG.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreShortformVersioned } from "../../src/lib/quiz/scoreShortformVersioned.ts";
import { buildResultViewFromVersioned, resultViewViolations } from "../../src/lib/results/resultViewModel.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const quizqa = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/quizqa-round8.json"), "utf8"));
const personas = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/personas.json"), "utf8"));
const byId = Object.fromEntries([...quizqa, ...personas].map((persona) => [persona.id, persona]));

function responsesFor(answers) {
  return answers.map((choice, index) => ({
    questionId: index + 1,
    choice,
    timeSpent: Math.round(6 * (0.6 + ((index * 37) % 9) / 10) * 10) / 10,
  }));
}

function suggestedRoles(id) {
  const persona = byId[id];
  const responses = responsesFor(persona.answers);
  const scored = scoreShortformVersioned(responses, "v5");
  const view = buildResultViewFromVersioned(scored, responses);
  assert.deepEqual(resultViewViolations(view), [], id);
  return view.direction.kind === "sample" ? [...view.direction.titles] : [...view.direction.examples];
}

const TRADES_ROLE = /electrician|carpenter|plumb|weld|mechanic|hvac|lineworker/i;

const tradesFixtures = [
  { id: "P123", style: "carpenter", expect: /carpenter/i },
  { id: "P114", style: "mechanic", expect: /mechanic/i },
  { id: "P121", style: "welder", expect: /weld/i },
  { id: "P127", style: "plumber", expect: /plumb/i },
  { id: "P120", style: "electrician", expect: /electric/i },
];

test("trades-leaning fixtures suggest at least one trades role, including the matching trade", () => {
  for (const fixture of tradesFixtures) {
    const roles = suggestedRoles(fixture.id);
    assert.ok(roles.some((role) => TRADES_ROLE.test(role)), `${fixture.id} (${fixture.style}) roles: ${roles.join(" | ")}`);
    assert.ok(roles.some((role) => fixture.expect.test(role)), `${fixture.id} (${fixture.style}) missing from: ${roles.join(" | ")}`);
  }
});

/** Locked before this change, so trades edits cannot crowd these patterns out. */
const unchangedRoles = {
  P08: ["Graphic designer", "Video editor", "Content creator or streamer", "Illustrator or animator", "Music producer or sound engineer", "Photographer or videographer", "Makeup artist or cosmetologist"],
  P112: ["Graphic designer", "Video editor", "YouTuber or content creator", "Illustrator or animator", "Musician or music producer", "Makeup artist or cosmetologist", "Photographer"],
  P02: ["Scientist", "Software developer", "Engineer", "Robotics engineer", "Data analyst"],
  P129: ["Pre-law student", "Policy research intern", "Research assistant", "Software or IT intern", "Lab assistant", "Data analysis intern", "Engineering student"],
  P148: ["Analytics or data manager", "Operations or logistics director", "Software developer", "Lab technician", "Data analyst", "Engineer", "Cybersecurity analyst"],
};

test("white-collar and creative suggestions stay the same", () => {
  for (const [id, expected] of Object.entries(unchangedRoles)) {
    assert.deepEqual(suggestedRoles(id), expected, id);
  }
});
