#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const clientRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(clientRoot, "src");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith("@/")) request = path.join(srcRoot, request.slice(2));
  return originalResolve.call(this, request, parent, isMain, options);
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true } }).outputText, filename);
}
const { buildResultDTO } = require("../src/lib/results/buildResultDTO.ts");
const scores = {
  mbti: { E: 2, I: 6, S: 2, N: 6, T: 6, F: 2, J: 5, P: 3 },
  disc: { D: 2, I: 3, S: 2, C: 7 },
  bigFive: { O: 72, C: 70, E: 35, A: 55, N: 40 },
  career: { analysis: 70, systems: 62, operations: 58, creative: 30, people: 10, leadership: 20, handsOn: 5, service: 5, entrepreneurship: 10, stability: 38, autonomy: 25, deepFocus: 60, pace: 20 },
  responses: [{ questionId: "fixture-1", choice: 1, timeSpent: 2, psych: "fixture" }],
  averageSwipeTime: 2,
};
const { result, validation } = buildResultDTO({ scores, tier: "25plus", source: "dev_test" });
if (!validation.ok) throw new Error(`DTO invalid: ${validation.errors.join(", ")}`);
if (result.careerDirection?.title !== "Public systems, planning, and place-making") throw new Error(`Expected canonical direction; got ${result.careerDirection?.title ?? "missing"}`);
if (!result.careerDirection.examples.some(example => example.title === "Urban Planner")) throw new Error("Canonical direction lost its role examples");
console.log("RESULT_DTO_CAREER_PARITY_PASS");
