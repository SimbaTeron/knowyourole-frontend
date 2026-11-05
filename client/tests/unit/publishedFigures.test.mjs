/**
 * Displayed pay must come from the handbook module, with a source and year.
 * A career with no handbook match shows no pay figure.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreShortformVersioned } from "../../src/lib/quiz/scoreShortformVersioned.ts";
import {
  OCCUPATION_PAY,
  PAY_SOURCE,
  careerPayLines,
  formatMedianAnnual,
  payForCareer,
} from "../../src/lib/results/publishedFigures.ts";
import { buildResultViewFromVersioned, renderResultCopy } from "../../src/lib/results/resultViewModel.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const personas = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/personas.json"), "utf8"));

test("every handbook row has a source, year, url, and a real median", () => {
  assert.equal(PAY_SOURCE.name.length > 0, true);
  assert.match(PAY_SOURCE.url, /^https:\/\/www\.bls\.gov\/ooh\/$/);
  assert.equal(PAY_SOURCE.dataYear, 2025);
  assert.match(PAY_SOURCE.period, /2025/);
  assert.match(PAY_SOURCE.lastUpdated, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(PAY_SOURCE.line, new RegExp(String(PAY_SOURCE.dataYear)));
  const careers = new Set();
  for (const row of OCCUPATION_PAY) {
    assert.equal(careers.has(row.career), false, row.career);
    careers.add(row.career);
    assert.match(row.oohUrl, /^https:\/\/www\.bls\.gov\/ooh\/.+\.htm$/);
    assert.equal(row.oohTitle.length > 0, true);
    assert.equal(Number.isInteger(row.medianAnnual), true, row.career);
    assert.equal(row.medianAnnual > 10000 && row.medianAnnual < 1000000, true, row.career);
    assert.equal(formatMedianAnnual(row.medianAnnual).includes(String(PAY_SOURCE.dataYear)), false);
    assert.equal(payForCareer(row.career)?.medianAnnual, row.medianAnnual);
  }
  assert.equal(payForCareer("Content creator"), null);
  assert.equal(payForCareer("Own a trades business someday"), null);
  assert.deepEqual(careerPayLines(["Electrician", "Content creator", "Electrician"]), [{
    title: "Electrician",
    display: "$63,190 a year",
    medianAnnual: 63190,
    occupation: "Electricians",
    url: "https://www.bls.gov/ooh/construction-and-extraction/electricians.htm",
  }]);
});

test("result views show a source year for every pay figure and no pay without a match", () => {
  const summary = readFileSync(join(root, "src/app/results/views/ResultSummary.tsx"), "utf8");
  assert.match(summary, /view\.page\.paySource/);
  assert.equal(/\$\d/.test(summary), false);
  const pdf = readFileSync(join(root, "src/app/api/generate-pdf/route.ts"), "utf8");
  assert.equal(pdf.includes("of people"), false);
  assert.equal(pdf.includes("TYPE RARITY"), false);
  const traits = readFileSync(join(root, "src/components/results/TraitDetailPanel.tsx"), "utf8");
  assert.equal(traits.includes("of people"), false);
  const cities = readFileSync(join(root, "src/app/results/ResultsPageClient.tsx"), "utf8");
  assert.equal(cities.includes("CITY_MAP"), false);
  assert.equal(cities.includes("avgSalary"), false);
  assert.equal(/openings:/.test(cities), false);

  let sawPay = false;
  for (const persona of personas) {
    const responses = persona.answers.map((choice, index) => ({ questionId: index + 1, choice, timeSpent: 6 }));
    const view = buildResultViewFromVersioned(scoreShortformVersioned(responses, "v5"), responses);
    const copy = renderResultCopy(view);
    if (view.page.pay.length === 0) {
      assert.equal(view.page.paySource, null, persona.id);
      assert.equal(copy.includes("page pay source: US median"), false, persona.id);
      continue;
    }
    sawPay = true;
    assert.equal(view.page.paySource?.text, PAY_SOURCE.line, persona.id);
    assert.equal(view.page.paySource?.href, PAY_SOURCE.url, persona.id);
    assert.match(view.page.paySource.text, /2025/);
    for (const line of view.page.pay) {
      const row = payForCareer(line.title);
      assert.ok(row, `${persona.id} ${line.title}`);
      assert.equal(line.medianAnnual, row.medianAnnual);
      assert.equal(line.display, formatMedianAnnual(row.medianAnnual));
      assert.match(copy, new RegExp(line.display.replace(/[$.]/g, "\\$&")));
    }
    assert.match(copy, /page pay source: US median pay, BLS 2025 data/);
  }
  assert.equal(sawPay, true);
});
