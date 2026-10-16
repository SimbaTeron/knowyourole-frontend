import { test } from "node:test";
import assert from "node:assert/strict";
import { getEvidenceState } from "../../src/components/results/ResultDecisionBrief.tsx";

function fakeResult({ confidence = 40, weakSignals = ["EI", "SN", "TF"], hybrids = [] } = {}) {
  return {
    audit: {
      overallConfidence: confidence,
      scoringAudit: { hybridDimensions: hybrids },
    },
    scores: {
      adaptive: { weakSignals },
    },
  };
}

test("Clear clarity never shows 'pattern is still broad' even with low confidence", () => {
  const e = getEvidenceState(fakeResult({ confidence: 39, weakSignals: ["EI", "SN", "TF", "JP"] }), "clear");
  assert.notEqual(e.title.toLowerCase(), "the pattern is still broad");
  assert.ok(!/still broad/i.test(e.title));
  assert.ok(!/still broad/i.test(e.body));
});

test("Broad clarity may show the early-signal broad box", () => {
  const e = getEvidenceState(fakeResult({ confidence: 39 }), "broad");
  assert.match(e.title, /still broad/i);
  assert.equal(e.label, "Early signal");
});

test("Clear with strong confidence shows clearer signal", () => {
  const e = getEvidenceState(fakeResult({ confidence: 80, weakSignals: [] }), "clear");
  assert.match(e.title, /useful direction/i);
  assert.equal(e.label, "Clearer signal");
});

test("Clear never shows 'Mixed evidence' even with weak signals; Mixed does", () => {
  const weak = fakeResult({ confidence: 39, weakSignals: ["EI", "SN"], hybrids: ["EI", "TF"] });
  assert.notEqual(getEvidenceState(weak, "clear").label, "Mixed evidence");
  assert.equal(getEvidenceState(weak, "clear").label, "Clearer signal");
  assert.equal(getEvidenceState(weak, "mixed").label, "Mixed evidence");
});
