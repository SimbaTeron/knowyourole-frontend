import { test } from "node:test";
import assert from "node:assert/strict";
import { getResultClarity, detectFlatAnswerPattern, formatTopTraitLabel } from "../../src/lib/results/resultClarity.ts";

test("clear when top trait leads by more than 5 and not all medium", () => {
  const c = getResultClarity({ O: 80, C: 60, E: 50, A: 45, N: 30 });
  assert.equal(c.level, "clear"); assert.equal(c.blended, false); assert.equal(c.topKey, "O");
});
test("mixed when top two within 5", () => {
  const c = getResultClarity({ O: 75, C: 71, E: 50, A: 45, N: 30 });
  assert.equal(c.level, "mixed"); assert.equal(c.blended, true);
  assert.equal(formatTopTraitLabel(c, k => k), "O + C");
});
test("gap of exactly 5 is blended", () => {
  assert.equal(getResultClarity({ O: 75, C: 70, E: 20, A: 20, N: 20 }).blended, true);
  assert.equal(getResultClarity({ O: 76, C: 70, E: 20, A: 20, N: 20 }).blended, false);
});
test("broad when all traits medium, even with a gap", () => {
  const c = getResultClarity({ O: 66, C: 50, E: 45, A: 40, N: 34 });
  assert.equal(c.level, "broad");
});
test("broad with close top two still blends label", () => {
  const c = getResultClarity({ O: 52, C: 50, E: 45, A: 40, N: 38 });
  assert.equal(c.level, "broad"); assert.equal(c.blended, true);
});
test("flat pattern flagged at 20 same letters", () => {
  const r = Array.from({ length: 28 }, (_, i) => ({ choice: i < 20 ? 0 : 1 }));
  const f = detectFlatAnswerPattern(r);
  assert.equal(f.flagged, true); assert.equal(f.dominantLetter, "A"); assert.ok(f.note);
});
test("19 same letters not flagged", () => {
  const r = Array.from({ length: 28 }, (_, i) => ({ choice: i < 19 ? 3 : i % 3 }));
  assert.equal(detectFlatAnswerPattern(r).flagged, false);
});
test("varied answers and missing data are safe", () => {
  assert.equal(detectFlatAnswerPattern(Array.from({ length: 28 }, (_, i) => ({ choice: i % 4 }))).flagged, false);
  assert.equal(detectFlatAnswerPattern(undefined).flagged, false);
  assert.equal(detectFlatAnswerPattern([{ choice: "x" }, {}]).total, 0);
});
