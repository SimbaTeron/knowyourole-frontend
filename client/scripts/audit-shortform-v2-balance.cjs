#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) request = path.join(srcRoot, request.slice(2));
  return originalResolve.call(this, request, parent, isMain, options);
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = function compileTypeScript(module, filename) {
    module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true },
    }).outputText, filename);
  };
}

const { SHORTFORM_V2_QUESTIONS, CAREER_SCORE_KEYS } = require("../src/data/shortformV2Questions.ts");
const { calibrateShortformV2Scores } = require("../src/lib/results/calibrateShortformV2Scores.ts");
const { calculateResult } = require("../src/components/results/resultsData.ts");

let seed = 73471;
function random() {
  seed = (seed * 48271) % 2147483647;
  return seed / 2147483647;
}
function emptyScores() {
  return {
    mbti: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
    disc: { D: 0, I: 0, S: 0, C: 0 },
    bigFive: { O: 0, C: 0, E: 0, A: 0, N: 0 },
    career: Object.fromEntries(CAREER_SCORE_KEYS.map(key => [key, 0])),
    responses: [], swipeTimes: [], averageSwipeTime: 4, currentDifficulty: "medium", engagement: 28,
    wildcardBoost: false, criticalWildcard: 0, firstPrinciplesWildcard: 0, hybridTypes: [], moodBoosts: { critical: 0, firstPrinciples: 0 },
  };
}

const runs = 5000;
const counts = { mbti: {}, disc: {}, bigFive: {} };
for (let run = 0; run < runs; run += 1) {
  const scores = emptyScores();
  for (const question of SHORTFORM_V2_QUESTIONS) {
    const answer = question.answers[Math.floor(random() * question.answers.length)];
    for (const family of ["mbti", "disc", "bigFive", "career"]) {
      for (const [key, value] of Object.entries(answer.scores[family] || {})) scores[family][key] += value;
    }
  }
  const result = calculateResult(calibrateShortformV2Scores(scores));
  const topBigFive = Object.entries(result.bigFiveProfile).sort((a, b) => b[1] - a[1])[0][0];
  for (const [family, key] of [["mbti", result.mbtiType], ["disc", result.discStyle], ["bigFive", topBigFive]]) {
    counts[family][key] = (counts[family][key] || 0) + 1;
  }
}

function percentages(values) {
  return Object.fromEntries(Object.entries(values).sort((a, b) => b[1] - a[1]).map(([key, count]) => [key, Number(((count / runs) * 100).toFixed(1))]));
}
function spread(values) {
  const points = Object.values(percentages(values));
  return Math.max(...points) - Math.min(...points);
}

const report = { mbti: percentages(counts.mbti), disc: percentages(counts.disc), bigFive: percentages(counts.bigFive) };
const checks = {
  allMbtiTypesAppear: Object.keys(report.mbti).length === 16,
  mbtiSpreadAcceptable: spread(counts.mbti) <= 9,
  discSpreadAcceptable: spread(counts.disc) <= 10,
  bigFiveSpreadAcceptable: spread(counts.bigFive) <= 12,
};

console.log("KnowYouRole Active Shortform Random-Balance Audit");
console.log("=================================================");
console.log(`Deterministic random runs: ${runs}`);
console.log("MBTI:", report.mbti);
console.log("DISC:", report.disc);
console.log("Top Big Five:", report.bigFive);
console.log("Checks:", checks);
console.log(`Status: ${Object.values(checks).every(Boolean) ? "PASS" : "REVIEW"}`);
if (!Object.values(checks).every(Boolean)) process.exitCode = 1;
