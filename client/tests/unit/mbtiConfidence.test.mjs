import { test } from "node:test";
import assert from "node:assert/strict";
import { getMbtiConfidence, fullMbtiType } from "../../src/lib/quiz/mbtiConfidence.ts";

test("always returns full 4-letter type with no X", () => {
  const c = getMbtiConfidence({ E: 52, I: 48, S: 50, N: 51, T: 60, F: 40, J: 55, P: 45 });
  assert.equal(c.type.length, 4);
  assert.ok(!/X/.test(c.type));
  assert.equal(fullMbtiType({ E: 52, I: 48, S: 50, N: 51, T: 60, F: 40, J: 55, P: 45 }), c.type);
});

test("close axis gets light-lean badge and note", () => {
  const c = getMbtiConfidence({ E: 80, I: 20, S: 52, N: 50, T: 70, F: 30, J: 75, P: 25 });
  assert.ok(c.weakAxes.includes("SN"));
  assert.ok(c.badge.toLowerCase().includes("light lean"));
  assert.ok(c.note.length > 20);
  assert.ok(!/X/.test(c.type));
});

test("broad with no weak axes still gets sketch note", () => {
  const c = getMbtiConfidence({ E: 80, I: 20, S: 75, N: 25, T: 70, F: 30, J: 75, P: 25 }, undefined, { broad: true });
  assert.equal(c.weakAxes.length, 0);
  assert.ok(c.note.toLowerCase().includes("sketch"));
  assert.ok(!/X/.test(c.type));
});

test("multiple close axes name the letters in the note", () => {
  const c = getMbtiConfidence({ E: 52, I: 50, S: 80, N: 20, T: 51, F: 49, J: 53, P: 50 });
  assert.ok(c.weakAxes.length >= 2);
  assert.ok(c.note.includes("/") || c.badge.includes("light"));
  assert.equal(c.type.length, 4);
});
