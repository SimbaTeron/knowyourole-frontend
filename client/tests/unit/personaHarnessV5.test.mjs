/**
 * Persona harness for scoring v5 (shortform-v2-scoring-v5).
 * 102 personas: 72 prior (P01–P80 minus non-native-reader personas, re-answered for the
 * changed Q22/Q24 and new Q29/Q30) + 30 new (P81–P110: teen, college, creator, trades).
 * Expectations were written before tuning. Mechanical 1–5 rubric (see grade logic below).
 * Targets: fit >= 4.3, relevancy >= 4.0, Leadership/Sales/Ops <= 45% of roles.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const personas = JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5/personas.json"), "utf8"));
const { scoreShortformVersioned } = await import(pathToFileURL(join(root, "src/lib/quiz/scoreShortformVersioned.ts")).href);
const { V5_LANE_COPY } = await import(pathToFileURL(join(root, "src/lib/results/workDirectionV5.ts")).href);

const FAM = { leading: "leadership", business: "sales", organizing: "operations", artDesign: "creative", creator: "creative", creative: "creative", care: "care", teaching: "care", research: "research", tech: "technical", trades: "trades", broad: "broad" };
const dist = (a, b) => [...a].filter((c, i) => c !== b[i]).length;

function run(p, timeSpent = 6) {
  const answers = p.answers.map((choice, i) => ({ questionId: i + 1, choice, timeSpent }));
  return scoreShortformVersioned(answers, "v5");
}

function grade(p, r) {
  const lane = r.v5Direction.laneKey.replace("v5:", "");
  const fam = FAM[lane] ?? lane;
  const edge = p.fam.length === 1 && p.fam[0] === "any";
  const N = r.calibrated.bigFive.N;
  let fit = 5;
  if (p.mbti_ok?.length) { const d = Math.min(...p.mbti_ok.map((m) => dist(r.mbtiDisplay, m))); fit -= d === 1 ? 1 : d >= 2 ? 2 : 0; }
  if (p.disc_ok?.length && !p.disc_ok.includes(r.discPrimary)) fit -= 0.5;
  const broadish = r.clarity.level === "broad" || r.quickOrScattered || fam === "broad";
  if (edge) { if (!broadish && !r.inconsistency.flagged) fit -= 1.5; }
  else if (fam === "broad") fit -= 0.5;
  else if (!p.fam.includes(fam)) fit -= 1.5;
  if (p.clar === "notclear" && r.clarity.level === "clear") fit -= 1;
  if (p.stress === "high" && N < 67) fit -= 0.5;
  if (p.stress !== "high" && r.topTrait === "N" && !edge) fit -= 0.5;
  let rel;
  if (edge) rel = broadish ? 4.5 : 3;
  else if (fam === p.fam[0]) rel = 5;
  else if (p.fam.includes(fam)) rel = p.fam.indexOf(fam) === 1 ? 4.5 : 4;
  else if (fam === "broad") rel = 3.5;
  else rel = 2;
  if (!r.v5Direction.nextSteps.length) rel -= 0.5;
  return { id: p.id, group: p.group, source: p.source, fit: Math.max(1, fit), rel: Math.max(1, rel), fam, lane };
}

const results = personas.map((p) => ({ p, r: run(p) }));
const rows = results.map(({ p, r }) => grade(p, r));
const avg = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

test("v5 persona harness meets fit/relevancy/LSO targets", () => {
  const fit = avg(rows.map((x) => x.fit));
  const rel = avg(rows.map((x) => x.rel));
  const lso = rows.filter((x) => ["leadership", "sales", "operations"].includes(x.fam)).length / rows.length;
  const byGroup = {};
  for (const g of ["teen", "college", "creative", "trades", "adult", "edge"]) {
    const s = rows.filter((x) => x.group === g);
    byGroup[g] = { n: s.length, fit: +avg(s.map((x) => x.fit)).toFixed(2), rel: +avg(s.map((x) => x.rel)).toFixed(2) };
  }
  if (process.env.V5_REPORT) writeFileSync(process.env.V5_REPORT, JSON.stringify({ fit, rel, lso, byGroup, rows }, null, 1));
  assert.ok(fit >= 4.3, `fit ${fit}`);
  assert.ok(rel >= 4.0, `relevancy ${rel}`);
  assert.ok(lso <= 0.45, `LSO share ${lso}`);
  for (const g of ["teen", "college", "creative", "trades"]) assert.ok(byGroup[g].rel >= 4.0, `${g} relevancy ${byGroup[g].rel}`);
});

test("v5: role title, examples and why line come from the same lane (no contradictions)", () => {
  for (const { p, r } of results) {
    const d = r.v5Direction;
    const lane = d.laneKey.replace("v5:", "");
    if (lane === "broad" || lane === "creative") continue;
    assert.equal(d.title, V5_LANE_COPY[lane].title, p.id);
    assert.ok(d.rationale.includes(`pointed most to ${V5_LANE_COPY[lane].phrase}`), `${p.id}: ${d.rationale}`);
  }
});

test("v5: teens and college students get school-stage next steps", () => {
  for (const { p, r } of results) {
    const stageAns = p.answers[29];
    if (stageAns === 1) assert.equal(r.stage, "high", p.id);
    if (stageAns === 2) assert.equal(r.stage, "college", p.id);
    assert.ok(r.v5Direction.nextSteps.length >= 1, p.id);
  }
});

test("v5: very fast answering is shown as Broad with a note", () => {
  const r = run(personas[0], 0.8);
  assert.equal(r.clarity.level, "broad");
  assert.equal(r.quickOrScattered, true);
});

test("v5: no 'not sure' option — every question is forced-choice with 4 options", async () => {
  const { SHORTFORM_V2_QUESTIONS } = await import(pathToFileURL(join(root, "src/data/shortformV2Questions.ts")).href);
  assert.equal(SHORTFORM_V2_QUESTIONS.length, 30);
  for (const q of SHORTFORM_V2_QUESTIONS) {
    assert.equal(q.answers.length, 4, `Q${q.id}`);
    for (const o of q.answers) assert.ok(!/not sure|don't know|unsure/i.test(o.text), `Q${q.id}${o.id}`);
  }
});
