/**
 * Display consistency: every results view must render the same final clarity.
 * The page builds one result view; that view calls resolveFinalClarity once.
 * This asserts the view level matches the v4.1 scorer for all 40 fixtures.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreShortformVersioned } from "../../src/lib/quiz/scoreShortformVersioned.ts";
import { resolveFinalClarity, shouldShowStressSecondary } from "../../src/lib/results/finalClarity.ts";
import { SCORING_VERSION_V4 } from "../../src/lib/quiz/scoringVersions.ts";
import { getEvidenceState } from "../../src/components/results/ResultDecisionBrief.tsx";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const dir = join(root, "tests/fixtures/personas");
const personas = readdirSync(dir).filter((f) => /^P\d+\.json$/.test(f)).sort().map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));

function viewsFor(p) {
  const s = scoreShortformVersioned(p.answers, "v4");
  const maxCareer = Math.max(...Object.values(s.calibrated.career).map((n) => Number(n) || 0));
  const fc = resolveFinalClarity(s.calibrated.bigFive, p.answers, SCORING_VERSION_V4, maxCareer);
  return { s, fc };
}

test("40 fixtures loaded", () => assert.equal(personas.length, 40));

for (const p of personas) {
  test(`${p.id}: main, Big Five tab, brief and report share one clarity`, () => {
    const { s, fc } = viewsFor(p);
    assert.equal(fc.level, s.clarity.level, "final clarity == scorer clarity");
    // Main note + Big Five tab inline note + report both render fc.display
    if (fc.display.kind !== "flat") {
      assert.equal(fc.display.kind, fc.level);
      assert.equal(fc.display.heading, `Result clarity: ${fc.display.clarity.label}`);
    }
    assert.equal(fc.display.clarity.level, fc.level, "Big Five tab clarity object == final");
    // Decision brief gating follows the same level
    const brief = getEvidenceState({ audit: { overallConfidence: 40, scoringAudit: { hybridDimensions: ["EI", "SN"] } }, scores: { adaptive: { weakSignals: ["EI"] } } }, fc.level);
    if (fc.level === "clear") assert.notEqual(brief.label, "Mixed evidence");
    if (fc.level === "mixed") assert.equal(brief.label, "Mixed evidence");
    if (fc.level === "broad") assert.equal(brief.label, "Early signal");
  });
}

test("named personas: P13 P29 P36 P40 not Clear in every view", () => {
  for (const id of ["P13", "P29", "P36", "P40"]) {
    const { fc } = viewsFor(personas.find((p) => p.id === id));
    assert.notEqual(fc.level, "clear", id);
    assert.ok(!/Clear/.test(fc.display.heading), `${id} heading ${fc.display.heading}`);
  }
});

test("stress secondary note: only when N high and not top/co-top", () => {
  const show = (id) => shouldShowStressSecondary(viewsFor(personas.find((p) => p.id === id)).s.calibrated.bigFive, SCORING_VERSION_V4);
  assert.equal(show("P23"), true, "P23 (C top, N high) shows");
  assert.equal(show("P26"), false, "P26 N co-top");
  assert.equal(show("P30"), false, "P30 N co-top");
  assert.equal(show("P09"), false, "P09 calm");
});

test("results page builds one result view and does not resolve clarity itself", () => {
  const src = readFileSync(join(root, "src/app/results/ResultsPageClient.tsx"), "utf8");
  const viewSrc = readFileSync(join(root, "src/lib/results/resultViewModel.ts"), "utf8");
  assert.ok(!/resolveResultClarityDisplay\(/.test(src), "direct resolveResultClarityDisplay call");
  assert.ok(!/getResultClarity\(/.test(src), "direct getResultClarity call");
  assert.ok(!/resolveFinalClarity\(/.test(src), "page resolves clarity itself");
  assert.equal((src.match(/buildResultView\(/g) || []).length, 1, "page builds the result view once");
  assert.ok(/resolveFinalClarity\(/.test(viewSrc), "view model is the clarity caller");
});
