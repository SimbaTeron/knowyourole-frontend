#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const clientRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(clientRoot, "src");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) request = path.join(srcRoot, request.slice(2));
  return originalResolve.call(this, request, parent, isMain, options);
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = function compileTypeScript(module, filename) {
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true },
    }).outputText;
    module._compile(output, filename);
  };
}

const { CAREER_SCORE_KEYS } = require("../src/data/shortformV2Questions.ts");
const { findBestRoleMatch } = require("../src/components/results/resultsData.ts");

const career = values => Object.fromEntries(CAREER_SCORE_KEYS.map(key => [key, values[key] ?? 0]));
const commonBigFive = { O: 72, C: 62, E: 58, A: 62, N: 38 };
const commonMbti = { E: 55, I: 45, S: 45, N: 55, T: 52, F: 48, J: 52, P: 48 };

const scenarios = [
  ["Urban planner", "INTJ", "C", career({ analysis: 70, systems: 62, operations: 58, creative: 30, stability: 38 }), "Public systems, planning, and place-making"],
  ["Learning experience designer", "ENFP", "I", career({ creative: 70, people: 66, service: 55, autonomy: 46, systems: 36 }), "Training, learning, and people development"],
  ["Claims investigator", "ISTJ", "C", career({ analysis: 72, systems: 58, deepFocus: 64, operations: 62, stability: 54 }), "Research, analysis, and strategy"],
  ["Technical account manager", "ENTJ", "I", career({ people: 74, systems: 70, leadership: 58, pace: 50, analysis: 42 }), "Technical customer and product work"],
  ["Laboratory technician", "ISTJ", "C", career({ analysis: 66, systems: 56, handsOn: 55, deepFocus: 62, stability: 48 }), "Technical systems and problem-solving"],
  ["Travel journalist", "ENFP", "I", career({ creative: 72, autonomy: 70, people: 52, entrepreneurship: 46, pace: 42 }), "Creative product and brand work"],
  ["Disaster relief coordinator", "ENFJ", "S", career({ people: 78, service: 72, operations: 74, pace: 66, leadership: 52 }), "Community programs and coordinated support"],
  ["Corporate trainer", "ENFJ", "I", career({ people: 76, service: 62, creative: 50, leadership: 42, systems: 38 }), "Training, learning, and people development"],
  ["Product marketing strategist", "ENFP", "I", career({ creative: 74, people: 66, analysis: 48, leadership: 48, entrepreneurship: 42 }), "Creative product and brand work"],
  ["Database administrator", "INTJ", "C", career({ systems: 76, analysis: 72, deepFocus: 70, stability: 52, autonomy: 42 }), "Technical systems and problem-solving"],
  ["Occupational therapist", "ISFJ", "S", career({ service: 78, people: 76, handsOn: 52, stability: 58, operations: 38 }), "Care, education, and direct support"],
  ["Museum curator", "INTJ", "C", career({ analysis: 70, creative: 62, deepFocus: 62, autonomy: 46, systems: 34 }), "Research, culture, and knowledge stewardship"],
  ["Restaurant operations manager", "ESTJ", "D", career({ operations: 78, pace: 72, leadership: 66, handsOn: 58, systems: 44 }), "Operations, systems, and coordination"],
  ["Patent paralegal", "ISTJ", "C", career({ analysis: 72, operations: 66, deepFocus: 62, systems: 54, stability: 56 }), "Research, analysis, and strategy"],
  ["Wildlife conservationist", "INFP", "S", career({ service: 64, handsOn: 60, analysis: 52, autonomy: 62, creative: 38 }), "Fieldwork, conservation, and practical science"],
  ["Event coordinator", "ESFJ", "I", career({ people: 78, operations: 72, pace: 70, creative: 54, leadership: 40 }), "Events, experiences, and live coordination"],
  ["Quality control inspector", "ISTJ", "C", career({ operations: 74, analysis: 68, systems: 60, stability: 64, handsOn: 44 }), "Operations, systems, and coordination"],
  ["Customer experience researcher", "INFP", "I", career({ people: 68, analysis: 66, creative: 62, deepFocus: 56, autonomy: 44 }), "Customer research and experience design"],
  ["Podcast producer", "ENFP", "I", career({ creative: 74, people: 54, autonomy: 60, entrepreneurship: 52, pace: 38 }), "Creative product and brand work"],
  ["Policy advocate", "ENFJ", "I", career({ people: 72, service: 64, leadership: 60, analysis: 52, entrepreneurship: 40 }), "Advocacy, partnerships, and public impact"],
];

const failures = [];
for (const [name, mbti, disc, vector, expectedDirection] of scenarios) {
  const match = findBestRoleMatch(mbti, disc, commonBigFive, commonMbti, vector);
  const actual = match.direction?.title;
  const ok = actual === expectedDirection && match.direction?.examples?.length === 3;
  console.log(`${ok ? "PASS" : "FAIL"} | ${name} | ${actual ?? "no direction"}`);
  if (!ok) failures.push({ name, expectedDirection, actual, examples: match.direction?.examples?.map(role => role.title) ?? [] });
}
const passed = scenarios.length - failures.length;
console.log(`\nRole-direction relevance: ${passed}/${scenarios.length} (${Math.round((passed / scenarios.length) * 100)}%)`);
if (passed < 18) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
}
