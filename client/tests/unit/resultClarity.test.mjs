import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getResultClarity,
  detectFlatAnswerPattern,
  formatTopTraitLabel,
  resolveResultClarityDisplay,
  FLAT_PATTERN_NOTE,
} from "../../src/lib/results/resultClarity.ts";

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

const flatResponses = Array.from({ length: 28 }, () => ({ choice: 0 }));
const variedResponses = Array.from({ length: 28 }, (_, i) => ({ choice: i % 4 }));

test("flat pattern replaces Clear", () => {
  const d = resolveResultClarityDisplay({ O: 80, C: 60, E: 50, A: 45, N: 30 }, flatResponses);
  assert.equal(d.kind, "flat");
  assert.equal(d.heading, "Answer pattern note");
  assert.equal(d.body, FLAT_PATTERN_NOTE);
  assert.equal(d.clarity.level, "clear");
  assert.ok(!d.body.includes("Clear"));
  assert.ok(!d.heading.includes("Clear"));
});
test("flat pattern replaces Mixed", () => {
  const d = resolveResultClarityDisplay({ O: 75, C: 71, E: 50, A: 45, N: 30 }, flatResponses);
  assert.equal(d.kind, "flat");
  assert.equal(d.clarity.level, "mixed");
  assert.equal(d.body, FLAT_PATTERN_NOTE);
  assert.ok(!d.heading.includes("Mixed"));
});
test("flat pattern replaces Broad", () => {
  const d = resolveResultClarityDisplay({ O: 66, C: 50, E: 45, A: 40, N: 34 }, flatResponses);
  assert.equal(d.kind, "flat");
  assert.equal(d.clarity.level, "broad");
  assert.equal(d.body, FLAT_PATTERN_NOTE);
  assert.ok(!d.heading.includes("Broad"));
});
test("without flat pattern, Clear Mixed Broad display unchanged", () => {
  const clear = resolveResultClarityDisplay({ O: 80, C: 60, E: 50, A: 45, N: 30 }, variedResponses);
  assert.equal(clear.kind, "clear");
  assert.equal(clear.heading, "Result clarity: Clear");
  const mixed = resolveResultClarityDisplay({ O: 75, C: 71, E: 50, A: 45, N: 30 }, variedResponses);
  assert.equal(mixed.kind, "mixed");
  assert.equal(mixed.heading, "Result clarity: Mixed");
  const broad = resolveResultClarityDisplay({ O: 66, C: 50, E: 45, A: 40, N: 34 }, variedResponses);
  assert.equal(broad.kind, "broad");
  assert.equal(broad.heading, "Result clarity: Broad");
});
