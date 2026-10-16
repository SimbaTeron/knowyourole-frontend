/** Round 10: result wording follows CLARITY; a broad work direction alone only changes the examples header. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const { resultWording } = await import(pathToFileURL(join(root, "src/lib/results/resultWording.ts")).href);
const { scoreShortformVersioned } = await import(pathToFileURL(join(root, "src/lib/quiz/scoreShortformVersioned.ts")).href);
const qq = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/quizqa-round8.json"), "utf8"));
const list = Array.isArray(qq) ? qq : qq.personas;
const run = (answers) => scoreShortformVersioned(answers.map((choice, i) => ({ questionId: i + 1, choice, timeSpent: 6 })), "v5");
const words = (id) => {
  const p = list.find((x) => x.id === id);
  const r = run(p.answers);
  const w = resultWording({ clarityLevel: r.clarity.level, directionBroad: r.v5Direction.laneKey === "v5:broad", mbtiType: r.mbtiDisplay, identity: "The Identity", arch: "Arch" });
  return { r, w };
};

test("Mixed/Clear clarity never uses broad wording", () => {
  for (const level of ["mixed", "clear"]) for (const directionBroad of [true, false]) {
    const w = resultWording({ clarityLevel: level, directionBroad, mbtiType: "ESFJ", identity: "The Host", arch: "Provider" });
    assert.equal(w.headline, "The Host");
    assert.equal(w.archetype, "Provider");
    assert.equal(w.broad, false);
    assert.equal(w.showBroadDirectionsCard, false);
    assert.equal(w.examplesHeader, directionBroad ? "Directions to sample" : "Examples");
  }
});

test("Broad clarity uses broad wording", () => {
  const w = resultWording({ clarityLevel: "broad", directionBroad: true, mbtiType: "ESFJ", identity: "The Host", arch: "Provider" });
  assert.equal(w.headline, "A broad, balanced pattern");
  assert.equal(w.archetype, "ESFJ-leaning pattern");
  assert.equal(w.showBroadDirectionsCard, true);
});

test("P125 (Mixed clarity, broad direction) keeps its identity; P149 stays Broad", () => {
  const a = words("P125");
  assert.notEqual(a.r.clarity.level, "broad");
  assert.equal(a.w.headline, "The Identity");
  assert.equal(a.w.archetype, "Arch");
  const b = words("P149");
  assert.equal(b.r.clarity.level, "broad");
  assert.equal(b.w.headline, "A broad, balanced pattern");
});
