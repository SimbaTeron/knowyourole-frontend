/**
 * Persona regression harness + simulation stats.
 * Locks v2 baseline; compares v3 when SCORING_COMPARE=v3 or when asserting improvements.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const fixturesDir = join(root, "tests/fixtures/personas");
const baselinePath = join(fixturesDir, "baseline-v2.json");
const reportDir = join(root, "../results-v3");

const { scoreShortformVersioned } = await import(
  pathToFileURL(join(root, "src/lib/quiz/scoreShortformVersioned.ts")).href
);

function loadPersonas() {
  return readdirSync(fixturesDir)
    .filter((f) => /^P\d+\.json$/.test(f))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(fixturesDir, f), "utf8")));
}

function roleFamily(title, laneKey) {
  const t = `${title} ${laneKey}`.toLowerCase();
  const tags = [];
  if (/leadership|management|directing|team lead|sales manager|program director/.test(t)) tags.push("leadership");
  if (/sales|influence|account executive|business development/.test(t)) tags.push("sales", "influence");
  if (/operations|coordination|project manager|quality/.test(t)) tags.push("operations");
  if (/technical|systems|database|engineer|analyst/.test(t)) tags.push("technical");
  if (/research|analysis|strategy|knowledge|policy/.test(t)) tags.push("knowledge");
  if (/creative|brand|ux|designer|content/.test(t)) tags.push("creative");
  if (/people|support|community|care|nurse|customer success/.test(t)) tags.push("people", "care");
  if (/hands-on|physical|field technician|trades/.test(t)) tags.push("physical");
  if (/fast-response|high-pressure|emergency|incident/.test(t)) tags.push("highPressure", "emergency");
  return tags;
}

function evaluatePersona(fixture, version, flags) {
  const result = scoreShortformVersioned(fixture.answers, version, flags);
  const env = fixture.envelope || {};
  const checks = [];
  const fail = (name, detail) => checks.push({ name, ok: false, detail });
  const pass = (name, detail) => checks.push({ name, ok: true, detail });

  if (env.clarity) {
    result.clarity.level === env.clarity
      ? pass("clarity", result.clarity.level)
      : fail("clarity", `${result.clarity.level} != ${env.clarity}`);
  }
  if (env.mbti_ok) {
    const ok = env.mbti_ok.includes(result.mbtiType) || env.mbti_ok.includes(result.mbtiDisplay);
    ok ? pass("mbti", result.mbtiDisplay) : fail("mbti", `${result.mbtiDisplay} not in ${env.mbti_ok.join(",")}`);
  }
  // Never allow X letters in the displayed type
  if (/X/.test(result.mbtiDisplay) || /X/.test(result.mbtiType)) {
    fail("no_x_letters", result.mbtiDisplay);
  } else {
    pass("no_x_letters", result.mbtiDisplay);
  }
  if (env.mbti_hedged || env.clarity === "broad") {
    const note = result.mbtiConfidence?.note || "";
    const badge = result.mbtiConfidence?.badge || "";
    note || badge || result.clarity.level === "broad"
      ? pass("mbti_confidence_note", badge || note.slice(0, 60))
      : fail("mbti_confidence_note", "missing confidence note for weak/broad result");
  }
  if (env.disc) {
    env.disc.includes(result.discPrimary)
      ? pass("disc", result.discPrimary)
      : fail("disc", `${result.discPrimary} not in ${env.disc}`);
  }
  if (env.want_n_high) {
    result.nTier === "high" || result.topTraits.slice(0, 2).includes("N")
      ? pass("n_high", `N=${result.calibrated.bigFive.N} top=${result.topTraits.slice(0, 2)}`)
      : fail("n_high", `N=${result.calibrated.bigFive.N} tier=${result.nTier}`);
  }
  if (env.want_n_elevated) {
    result.calibrated.bigFive.N >= 55 || result.topTraits.slice(0, 3).includes("N")
      ? pass("n_elevated", `N=${result.calibrated.bigFive.N}`)
      : fail("n_elevated", `N=${result.calibrated.bigFive.N}`);
  }
  const families = roleFamily(result.direction.title, result.direction.laneKey);
  if (env.role_family) {
    env.role_family.some((f) => families.includes(f))
      ? pass("role", `${result.direction.title} [${families}]`)
      : fail("role", `${result.direction.title} [${families}] missing ${env.role_family}`);
  }
  if (env.forbid_role) {
    env.forbid_role.some((f) => families.includes(f))
      ? fail("forbid_role", `${result.direction.title} hit ${env.forbid_role}`)
      : pass("forbid_role", "ok");
  }
  if (env.role_multi) {
    result.altDirections.length >= 1 || result.clarity.level === "broad"
      ? pass("role_multi", `${1 + result.altDirections.length} directions`)
      : fail("role_multi", "only one direction");
  }

  const failed = checks.filter((c) => !c.ok);
  // Proxy fit: start from QA fit, +/- based on critical checks
  let proxy = fixture.qa_fit_score;
  if (env.want_n_high && failed.some((c) => c.name === "n_high")) proxy = Math.min(proxy, 2);
  if (env.want_n_high && !failed.some((c) => c.name === "n_high")) proxy = Math.max(proxy, 4);
  if (env.forbid_role && failed.some((c) => c.name === "forbid_role")) proxy = Math.min(proxy, 3);
  if (env.forbid_role && !failed.some((c) => c.name === "forbid_role") && !failed.some((c) => c.name === "mbti"))
    proxy = Math.max(proxy, 4);
  if (env.mbti_hedged && !failed.some((c) => c.name === "mbti_hedged")) proxy = Math.max(proxy, 4);
  if (env.mbti_hedged && failed.some((c) => c.name === "mbti_hedged")) proxy = Math.min(proxy, 2);
  if (failed.some((c) => c.name === "mbti")) proxy = Math.min(proxy, proxy);

  return {
    id: fixture.id,
    version,
    mbti: result.mbtiType,
    mbtiDisplay: result.mbtiDisplay,
    disc: result.discPrimary,
    topTrait: result.topTrait,
    topTraits: result.topTraits,
    N: result.calibrated.bigFive.N,
    C: result.calibrated.bigFive.C,
    clarity: result.clarity.level,
    role: result.direction.title,
    lane: result.direction.laneKey,
    alts: result.altDirections.map((d) => d.title),
    mbtiConfidence: result.mbtiConfidence,
    checks,
    failed: failed.length,
    proxyFit: proxy,
    qaFit: fixture.qa_fit_score,
    bigFive: result.calibrated.bigFive,
  };
}

function runSimulation(version, n = 1000) {
  const dist = {};
  let tie = 0, near = 0, mid = 0, flips = 0, flipN = 0;
  for (let r = 0; r < n; r++) {
    const answers = Array.from({ length: 28 }, (_, i) => ({
      questionId: i + 1,
      choice: Math.floor(Math.random() * 4),
    }));
    const scored = scoreShortformVersioned(answers, version);
    dist[scored.topTrait] = (dist[scored.topTrait] || 0) + 1;
    const ranked = Object.entries(scored.calibrated.bigFive).sort((a, b) => b[1] - a[1]);
    if (ranked[0][1] === ranked[1][1]) tie++;
    if (ranked[0][1] - ranked[1][1] <= 5) near++;
    if (Object.values(scored.calibrated.bigFive).every((v) => v > 33 && v < 67)) mid++;
    // sample flip sensitivity on 3 random questions x alternate choices (budget)
    for (let t = 0; t < 3; t++) {
      const qi = Math.floor(Math.random() * 28);
      for (let c = 0; c < 4; c++) {
        if (c === answers[qi].choice) continue;
        const alt = answers.map((a, i) => (i === qi ? { ...a, choice: c } : a));
        flipN++;
        if (scoreShortformVersioned(alt, version).topTrait !== scored.topTrait) flips++;
      }
    }
  }
  return {
    n,
    topDist: dist,
    structureShare: (dist.C || 0) / n,
    exactTieRate: tie / n,
    nearTieRate: near / n,
    allMediumRate: mid / n,
    flipSensitivity: flips / Math.max(1, flipN),
  };
}

function summarize(rows) {
  const avgProxy = rows.reduce((s, r) => s + r.proxyFit, 0) / rows.length;
  const avgQa = rows.reduce((s, r) => s + r.qaFit, 0) / rows.length;
  const fails = rows.reduce((s, r) => s + r.failed, 0);
  const structTop = rows.filter((r) => r.topTrait === "C").length;
  return { avgProxy, avgQa, fails, structTop, nHigh: rows.filter((r) => r.N >= 67).length };
}

const personas = loadPersonas();
assert.equal(personas.length, 18);

// ---- Step 0 / baseline: lock v2 ----
const v2Rows = personas.map((p) => evaluatePersona(p, "v2"));
const v2Summary = summarize(v2Rows);
const v2Baseline = {
  lockedAt: "2026-10-15",
  scoringVersion: "shortform-v2-scoring-v2",
  summary: v2Summary,
  personas: Object.fromEntries(
    v2Rows.map((r) => [
      r.id,
      {
        mbti: r.mbti,
        disc: r.disc,
        topTrait: r.topTrait,
        N: r.N,
        clarity: r.clarity,
        role: r.role,
        lane: r.lane,
        qaFit: r.qaFit,
        proxyFit: r.proxyFit,
        failed: r.failed,
      },
    ]),
  ),
};

if (!existsSync(baselinePath)) {
  writeFileSync(baselinePath, JSON.stringify(v2Baseline, null, 2));
}

const locked = JSON.parse(readFileSync(baselinePath, "utf8"));

test("v2 baseline locked and stable", () => {
  for (const row of v2Rows) {
    const b = locked.personas[row.id];
    assert.ok(b, row.id);
    assert.equal(row.mbti, b.mbti, `${row.id} mbti drift`);
    assert.equal(row.disc, b.disc, `${row.id} disc drift`);
    assert.equal(row.topTrait, b.topTrait, `${row.id} topTrait drift`);
    assert.equal(row.clarity, b.clarity, `${row.id} clarity drift`);
    assert.equal(row.N, b.N, `${row.id} N drift`);
  }
});

test("v2 known deficiencies still visible in baseline (documentation)", () => {
  // These are expected failures under v2 — harness documents them.
  const p11 = v2Rows.find((r) => r.id === "P11");
  assert.ok(p11.N < 67, "v2 P11 should not yet show high N");
  const p03 = v2Rows.find((r) => r.id === "P03");
  assert.equal(p03.mbti, "ESTP");
  const p16 = v2Rows.find((r) => r.id === "P16");
  assert.equal(p16.clarity, "broad");
  assert.ok(!/X/.test(p16.mbtiDisplay));
});

// ---- v3 full ----
const v3Flags = { jRecode: true, nRebalance: true };
const v3Rows = personas.map((p) => evaluatePersona(p, "v3", v3Flags));
const v3Summary = summarize(v3Rows);

test("v3 improves critical personas without tanking average proxy fit", () => {
  const p11 = v3Rows.find((r) => r.id === "P11");
  assert.ok(p11.N >= 67 || p11.topTraits?.includes?.("N") || p11.N >= 67, `P11 N=${p11.N}`);
  assert.ok(p11.N >= 67, `P11 should reach high N, got ${p11.N}`);

  const p03 = v3Rows.find((r) => r.id === "P03");
  assert.ok(["ESTJ", "ENTJ"].includes(p03.mbti), `P03 mbti ${p03.mbti}`);
  assert.ok(!/fast-response|high-pressure|emergency/i.test(p03.role), `P03 role ${p03.role}`);

  const p12 = v3Rows.find((r) => r.id === "P12");
  assert.ok(["ENTJ", "ESTJ"].includes(p12.mbti), `P12 mbti ${p12.mbti}`);
  assert.ok(!/fast-response|high-pressure|emergency/i.test(p12.role), `P12 role ${p12.role}`);

  const p16 = v3Rows.find((r) => r.id === "P16");
  assert.equal(p16.clarity, "broad");
  assert.ok(!/X/.test(p16.mbtiDisplay), `P16 must show full type, got ${p16.mbtiDisplay}`);
  assert.equal(p16.mbtiDisplay.length, 4);
  assert.ok(p16.mbtiConfidence?.note || p16.mbtiConfidence?.badge, "P16 needs confidence note");
  assert.ok(p16.alts?.length >= 1, "P16 should keep alternate roles");

  const p05 = v3Rows.find((r) => r.id === "P05");
  assert.equal(p05.clarity, "broad");
  assert.ok(!/X/.test(p05.mbtiDisplay), `P05 must show full type, got ${p05.mbtiDisplay}`);
  assert.ok(p05.mbtiConfidence?.note || p05.mbtiConfidence?.badge, "P05 needs confidence note");

  assert.ok(
    v3Summary.avgProxy >= v2Summary.avgProxy - 0.05,
    `proxy avg regressed ${v2Summary.avgProxy} -> ${v3Summary.avgProxy}`,
  );
  assert.ok(v3Summary.fails <= v2Summary.fails, `check fails ${v2Summary.fails} -> ${v3Summary.fails}`);
});

test("v3 simulation stats are recorded", () => {
  const simV2 = runSimulation("v2", 400);
  const simV3 = runSimulation("v3", 400);
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(
    join(reportDir, "harness-report.json"),
    JSON.stringify(
      {
        v2: { summary: v2Summary, rows: v2Rows, sim: simV2 },
        v3: { summary: v3Summary, rows: v3Rows, sim: simV3 },
      },
      null,
      2,
    ),
  );
  assert.ok(simV3.allMediumRate > 0.2);
  assert.ok(simV3.structureShare < 0.55, `structure share high ${simV3.structureShare}`);
});

export { evaluatePersona, runSimulation, loadPersonas, summarize };
