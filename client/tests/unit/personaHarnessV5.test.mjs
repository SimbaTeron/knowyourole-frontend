/**
 * Persona harness for scoring v5 (shortform-v2-scoring-v5).
 *  - personas.json: 102 harness personas (72 prior P01–P80 minus non-native readers + 30 new P81–P110).
 *  - quizqa-round8.json: QuizQA's independent Round 8 answer sets (P111–P150 + 10 Round 6 re-runs),
 *    answered by QuizQA on the current question bank, with expectations transcribed from QuizQA's
 *    persona notes. The only change is listed in `overrides` (P145 Q15, where QuizQA's notes and data disagree).
 * Mechanical 1–5 rubric. Targets: fit >= 4.3, relevancy >= 4.0, Leadership/Sales/Ops <= 45% of roles.
 * Answers are timed at a realistic ~6 s/question (with jitter) unless a test says otherwise.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const fx = (f) => JSON.parse(readFileSync(join(root, "tests/fixtures/personas-v5", f), "utf8"));
const personas = fx("personas.json");
const quizqa = fx("quizqa-round8.json");
const { scoreShortformVersioned } = await import(pathToFileURL(join(root, "src/lib/quiz/scoreShortformVersioned.ts")).href);
const { QUESTION_COUNT } = await import(pathToFileURL(join(root, "src/lib/quiz/quizConfig.ts")).href);
const { V5_LANE_COPY, V5_MERGED, V5_COMBO_TITLES } = await import(pathToFileURL(join(root, "src/lib/results/workDirectionV5.ts")).href);

const FAM = { leading: "leadership", business: "sales", organizing: "operations", artDesign: "creative", creator: "creative", creative: "creative", care: "care", teaching: "care", people: "care", research: "research", stem: "research", tech: "technical", trades: "trades", broad: "broad" };
const dist = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const famOk = (fam, list) => list.includes(fam) || (fam === "research" && list.includes("technical"));

function run(answers, pace = 6) {
  const rs = answers.map((choice, i) => ({ questionId: i + 1, choice, timeSpent: Math.round(pace * (0.6 + ((i * 37) % 9) / 10) * 10) / 10 }));
  return scoreShortformVersioned(rs, "v5");
}

/** Harness rubric (personas.json spec fields: mbti_ok, disc_ok, fam, stress, clar). */
function gradeHarness(p, r) {
  const fam = FAM[r.v5Direction.laneKey.replace("v5:", "")] ?? "other";
  const edge = p.fam.length === 1 && p.fam[0] === "any";
  const N = r.calibrated.bigFive.N;
  let fit = 5;
  if (p.mbti_ok?.length) { const d = Math.min(...p.mbti_ok.map((m) => dist(r.mbtiDisplay, m))); fit -= d === 1 ? 1 : d >= 2 ? 2 : 0; }
  if (p.disc_ok?.length && !p.disc_ok.includes(r.discPrimary)) fit -= 0.5;
  const broadish = r.clarity.level === "broad" || r.quickOrScattered || fam === "broad";
  if (edge) { if (!broadish && !r.inconsistency.flagged) fit -= 1.5; }
  else if (fam === "broad") fit -= 0.5;
  else if (!famOk(fam, p.fam)) fit -= 1.5;
  if (p.clar === "notclear" && r.clarity.level === "clear") fit -= 1;
  if (p.stress === "high" && N < 64) fit -= 0.5;
  if (p.stress !== "high" && r.topTrait === "N" && !edge) fit -= 0.5;
  let rel;
  if (edge) rel = broadish ? 4.5 : 3;
  else if (fam === p.fam[0] || (fam === "research" && p.fam[0] === "technical")) rel = 5;
  else if (famOk(fam, p.fam)) rel = 4.5;
  else if (fam === "broad") rel = 3.5;
  else rel = 2;
  if (!r.v5Direction.nextSteps.length) rel -= 0.5;
  return { id: p.id, group: p.group, fit: Math.max(1, fit), rel: Math.max(1, rel), fam };
}

/** QuizQA-set rubric (spec fields: mbti, disc, fam, kw, stress, clar, flag). */
function gradeQuizQA(p, r) {
  const fam = FAM[r.v5Direction.laneKey.replace("v5:", "")] ?? "other";
  const edge = p.fam.length === 1 && p.fam[0] === "any";
  const N = r.calibrated.bigFive.N;
  const clar = r.clarity.level;
  let fit = 5;
  if (p.mbti.length) fit -= Math.min(2, Math.min(...p.mbti.map((m) => dist(r.mbtiDisplay, m))));
  if (p.disc.length && !p.disc.includes(r.discPrimary)) fit -= 0.5;
  if (p.clar === "clear" && clar === "broad") fit -= 1;
  if (p.clar === "broad" && clar !== "broad") fit -= 1;
  if (p.clar === "notclear" && clar === "clear") fit -= 1;
  if (p.flag && !r.inconsistency.flagged) fit -= 0.5;
  if (!edge) { if (fam === "broad") fit -= 0.5; else if (!famOk(fam, p.fam)) fit -= 1.5; }
  if (p.stress === "high" && N < 64) fit -= 1;
  if (p.stress === "low" && (r.topTrait === "N" || N >= 64)) fit -= 1;
  const ex = `${r.v5Direction.examples.join(" ")} ${r.v5Direction.title}`.toLowerCase();
  let rel;
  if (edge) rel = clar === "broad" || fam === "broad" ? 4.5 : 3;
  else if (fam === "broad") rel = 2.5;
  else if (!famOk(fam, p.fam)) rel = 2;
  else {
    rel = fam === p.fam[0] || (fam === "research" && p.fam[0] === "technical") ? 5 : 4.5;
    if (p.kw.length && !p.kw.some((k) => ex.includes(k))) rel -= 1.5;
  }
  return { id: p.id, fit: Math.max(1, fit), rel, fam, clar, N, type: r.mbtiDisplay };
}

const avg = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const harness = personas.map((p) => ({ p, r: run(p.answers) }));
const qq = quizqa.map((p) => ({ p, r: run(p.answers) }));
const qqById = Object.fromEntries(qq.map((x) => [x.p.id, x]));

test("v5 persona harness meets fit/relevancy/LSO targets", () => {
  const rows = harness.map(({ p, r }) => gradeHarness(p, r));
  const fit = avg(rows.map((x) => x.fit));
  const rel = avg(rows.map((x) => x.rel));
  const lso = rows.filter((x) => ["leadership", "sales", "operations"].includes(x.fam)).length / rows.length;
  const byGroup = {};
  for (const g of ["teen", "college", "creative", "trades", "adult", "edge"]) {
    const s = rows.filter((x) => x.group === g);
    byGroup[g] = { n: s.length, fit: +avg(s.map((x) => x.fit)).toFixed(2), rel: +avg(s.map((x) => x.rel)).toFixed(2) };
  }
  const qqRows = qq.map(({ p, r }) => gradeQuizQA(p, r));
  const qqFit = avg(qqRows.map((x) => x.fit));
  const qqRel = avg(qqRows.map((x) => x.rel));
  if (process.env.V5_REPORT) writeFileSync(process.env.V5_REPORT, JSON.stringify({ harness: { fit, rel, lso, byGroup, rows }, quizqa: { fit: qqFit, rel: qqRel, rows: qqRows } }, null, 1));
  assert.ok(fit >= 4.3, `fit ${fit}`);
  assert.ok(rel >= 4.0, `relevancy ${rel}`);
  assert.ok(lso <= 0.45, `LSO share ${lso}`);
  for (const g of ["teen", "college", "creative", "trades"]) assert.ok(byGroup[g].rel >= 4.0, `${g} relevancy ${byGroup[g].rel}`);
  assert.ok(qqFit >= 4.0, `QuizQA set fit ${qqFit}`);
  assert.ok(qqRel >= 4.0, `QuizQA set relevancy ${qqRel}`);
});

test("v5: role title, examples and why line come from the same direction (no contradictions)", () => {
  for (const { p, r } of [...harness, ...qq]) {
    const d = r.v5Direction;
    const key = d.laneKey.replace("v5:", "");
    if (key === "broad") continue;
    const copy = V5_MERGED[key] ?? V5_LANE_COPY[key];
    assert.ok(copy, `${p.id}: ${key}`);
    // Combined directions use their own heading (e.g. "Law, policy, and research") that matches the examples.
    assert.ok(d.title === copy.title || V5_COMBO_TITLES.includes(d.title), `${p.id}: ${d.title}`);
    assert.ok(d.rationale.includes(`pointed most to ${copy.phrase}`), `${p.id}: ${d.rationale}`);
  }
});

test("v5: teens and college students get school-stage next steps", () => {
  for (const { p, r } of harness) {
    if (p.answers[29] === 1) assert.equal(r.stage, "high", p.id);
    if (p.answers[29] === 2) assert.equal(r.stage, "college", p.id);
    assert.ok(r.v5Direction.nextSteps.length >= 1, p.id);
  }
});

test("v5: speed is a soft signal — fast alone never forces Broad; fast + random answers do", () => {
  let downgraded = 0;
  for (const { p, r } of harness) {
    const fast = run(p.answers, 1.0);
    assert.equal(fast.fast, true, p.id);
    assert.ok(fast.clarityNote.length > 0, p.id);
    if (fast.clarity.level === "broad" && r.clarity.level !== "broad") downgraded++;
  }
  assert.ok(downgraded <= 5, `fast answering downgraded ${downgraded} consistent personas to Broad`);
  const random = run(qqById["P118"].p.answers, 1.0);
  assert.equal(random.clarity.level, "broad");
  // Implausible timing (all identical values) is ignored rather than trusted.
  const same = scoreShortformVersioned(personas[0].answers.map((c, i) => ({ questionId: i + 1, choice: c, timeSpent: 0.5 })), "v5");
  assert.equal(same.fast, false);
});

test("v5: scattered / patterned check — false positives cleared, random, patterned and contradictory caught", () => {
  for (const id of ["P111", "P119", "R6-P59", "P136"]) assert.equal(qqById[id].r.inconsistency.flagged, false, `${id} should not be flagged`);
  for (const id of ["P118", "R6-P60", "P149", "R6-P46"]) assert.equal(qqById[id].r.inconsistency.flagged, true, `${id} should be flagged`);
  for (const id of ["P118", "P149", "R6-P46"]) assert.equal(qqById[id].r.clarity.level, "broad", id);
  assert.notEqual(qqById["R6-P60"].r.clarity.level, "clear");
  // A-B-C-D cycling and straight-lining are caught on any answer content.
  const cyc = run(Array.from({ length: QUESTION_COUNT }, (_, i) => (i + 1) % 4));
  assert.equal(cyc.clarity.level, "broad");
  assert.ok(cyc.inconsistency.flagged);
  const flaggedHarness = harness.filter(({ p, r }) => r.inconsistency.flagged && p.fam[0] !== "any").length;
  assert.ok(flaggedHarness <= 3, `flagged ${flaggedHarness} consistent harness personas`);
});

test("v5: balanced clarity mix — all-moderate answers are not Clear, consistent answers are not Broad", () => {
  for (const id of ["P125", "R6-P51"]) assert.notEqual(qqById[id].r.clarity.level, "clear", id);
  for (const id of ["P114", "P120", "P127", "P131", "P119", "P115"]) assert.notEqual(qqById[id].r.clarity.level, "broad", id);
  const count = (lvl) => qq.filter(({ r }) => r.clarity.level === lvl).length;
  assert.ok(count("broad") >= 2 && count("broad") <= 8, `QuizQA set Broad ${count("broad")}/${qq.length}`);
  assert.ok(count("clear") <= qq.length * 0.7, `QuizQA set Clear ${count("clear")}/${qq.length}`);
  assert.ok(count("mixed") >= qq.length * 0.2, `QuizQA set Mixed ${count("mixed")}/${qq.length}`);
});

test("v5: stress shows for anxious answerers, not for calm people", () => {
  for (const id of ["R6-P44", "P128", "P113", "P138", "P145"]) assert.ok(qqById[id].r.calibrated.bigFive.N >= 64, `${id} N=${qqById[id].r.calibrated.bigFive.N}`);
  assert.notEqual(qqById["P142"].r.topTrait, "N", "calm principal: Stress is not the headline trait");
  for (const id of ["P114", "P120", "P121", "P123", "P131", "R6-P53", "P146", "P148"]) {
    const { r } = qqById[id];
    assert.ok(r.calibrated.bigFive.N < 64 && r.topTrait !== "N", `${id} N=${r.calibrated.bigFive.N}`);
  }
  const stressTop = qq.filter(({ r }) => r.topTrait === "N").length;
  assert.ok(stressTop <= 3, `Stress is the top trait for ${stressTop}`);
});

test("v5: specific directions — animal care, music, law, medicine, school leadership, small business, operations, nurse educator, beauty", () => {
  const ex = (id) => `${qqById[id].r.v5Direction.title} ${qqById[id].r.v5Direction.examples.join(" ")}`.toLowerCase();
  assert.match(ex("P111"), /vet|animal/);
  assert.match(ex("P126"), /music|sound/);
  assert.match(ex("P129"), /law|policy/);
  assert.match(ex("P140"), /doctor|physician/);
  assert.match(ex("P142"), /principal|school/);
  assert.match(ex("P143"), /bakery|café|owner/);
  assert.match(ex("P148"), /operations|logistics/);
  assert.match(ex("P150"), /nurse educator|clinical instructor/);
  assert.match(ex("P147"), /makeup|cosmetolog/);
});

test("v5: no 'not sure' option — every question is forced-choice with 4 options", async () => {
  const { SHORTFORM_V2_QUESTIONS } = await import(pathToFileURL(join(root, "src/data/shortformV2Questions.ts")).href);
  assert.equal(SHORTFORM_V2_QUESTIONS.length, QUESTION_COUNT);
  for (const q of SHORTFORM_V2_QUESTIONS) {
    assert.equal(q.answers.length, 4, `Q${q.id}`);
    for (const o of q.answers) assert.ok(!/not sure|don't know|unsure/i.test(o.text), `Q${q.id}${o.id}`);
  }
});
