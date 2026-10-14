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
    const source = fs.readFileSync(filename, "utf8");
    module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true } }).outputText, filename);
  };
}
const { CAREER_SCORE_KEYS } = require("../src/data/shortformV2Questions.ts");
const { findBestRoleMatch } = require("../src/components/results/resultsData.ts");
const mbti = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
const b5 = { O: 60, C: 60, E: 50, A: 50, N: 40 };
const career = values => Object.fromEntries(CAREER_SCORE_KEYS.map(key => [key, values[key] ?? 0]));
const scenarios = [
  { name: "Field electrician", type: "ISTP", disc: "C", career: career({ handsOn: 19, operations: 46, systems: 38, autonomy: 22, pace: 26, analysis: 22 }), expected: /electrician|hvac|field service|technician|mechanic|repair/i, requiredLanes: ["physicalWork", "practicalField"] },
  { name: "Emergency paramedic", type: "ESTP", disc: "D", career: career({ handsOn: 17, service: 41, people: 58, pace: 35, leadership: 22, operations: 28 }), expected: /paramedic/i, requiredLanes: ["peopleService", "highPressureResponse"] },
  { name: "Culinary team lead", type: "ESTP", disc: "D", career: career({ handsOn: 18, pace: 37, creative: 31, leadership: 31, operations: 30, entrepreneurship: 28 }), expected: /chef|culinary/i, requiredLanes: ["physicalWork", "highPressureResponse"] },
  { name: "Talent recruiter", type: "ENFP", disc: "I", career: career({ people: 70, pace: 34, leadership: 26, service: 19, entrepreneurship: 25, creative: 14 }), expected: /recruit|sales|business development|account executive/i, requiredLanes: ["peopleService", "highPressureResponse"] },
  { name: "Supply chain coordinator", type: "ISTJ", disc: "C", career: career({ operations: 53, systems: 44, stability: 37, analysis: 32, pace: 18, handsOn: 13 }), expected: /logistics|supply chain|operations/i, requiredLanes: ["operationsCoordination"] },
  { name: "Public relations manager", type: "ENFP", disc: "I", career: career({ people: 66, creative: 29, pace: 32, leadership: 26, entrepreneurship: 20, service: 14 }), expected: /public relations|partnership|community|sales|business development/i, requiredLanes: ["peopleService", "creativeExpression"] },
  { name: "Cybersecurity incident responder", type: "INTJ", disc: "C", career: career({ analysis: 72, systems: 68, deepFocus: 54, pace: 47, autonomy: 31, handsOn: 11 }), expected: /cyber|security|systems analyst|systems architect|software|engineer|data/i, requiredLanes: ["technicalSystems", "knowledgeStrategy"] },
  { name: "Research scientist", type: "INTP", disc: "C", career: career({ analysis: 76, systems: 48, deepFocus: 67, autonomy: 46, creative: 22, pace: 10 }), expected: /research|scientist|systems architect|data/i, requiredLanes: ["knowledgeStrategy", "technicalSystems"] },
  { name: "Financial compliance analyst", type: "ISTJ", disc: "C", career: career({ analysis: 66, operations: 56, stability: 52, systems: 39, deepFocus: 41, pace: 13 }), expected: /financial|compliance|audit|account/i, requiredLanes: ["operationsCoordination", "technicalSystems"] },
  { name: "UX product designer", type: "ENFP", disc: "I", career: career({ creative: 74, autonomy: 48, people: 38, analysis: 31, entrepreneurship: 27, deepFocus: 24 }), expected: /designer|design|game narrative|writer|creative|brand/i, requiredLanes: ["creativeExpression"], expectedDirectionLane: "creativeExpression", expectedDirectionTitle: "Creative product and brand work" },
  { name: "Software engineer", type: "INTJ", disc: "C", career: career({ systems: 74, analysis: 69, deepFocus: 61, autonomy: 43, creative: 18, handsOn: 9 }), expected: /software|engineer|systems analyst|systems architect|data|cyber/i, requiredLanes: ["technicalSystems", "knowledgeStrategy"] },
  { name: "Community social worker", type: "ESFJ", disc: "S", career: career({ people: 68, service: 75, stability: 35, leadership: 27, pace: 23, handsOn: 16 }), expected: /social worker|therap|counsel|nurse|healthcare|medical/i, requiredLanes: ["peopleService"] },
  { name: "Construction project manager", type: "ESTJ", disc: "D", career: career({ operations: 45, handsOn: 11, systems: 30, leadership: 30, pace: 22, analysis: 22 }), expected: /project|operations|logistics|supply chain/i, requiredLanes: ["operationsCoordination", "practicalField"] },
  { name: "High school teacher", type: "ENFJ", disc: "S", career: career({ people: 55, service: 33, creative: 24, stability: 30, leadership: 26, operations: 16 }), expected: /teacher|education|school counselor|social worker|therap/i, requiredLanes: ["peopleService"] },
  { name: "Commercial airline pilot", type: "ISTP", disc: "D", career: career({ systems: 38, pace: 28, operations: 34, handsOn: 8, analysis: 28, autonomy: 12 }), expected: /pilot|airline/i, requiredLanes: ["technicalSystems", "highPressureResponse"] },
];
let failures = 0;
console.log("KnowYouRole Work-Lane Role-Fit Audit");
console.log("===================================");
for (const scenario of scenarios) {
  const match = findBestRoleMatch(scenario.type, scenario.disc, b5, mbti, scenario.career);
  const workLanes = match.workLanes || [];
  const laneKeys = new Set(workLanes.map(lane => lane.key));
  const expectedMixedState = workLanes.length > 1 && Math.abs(workLanes[0].score - workLanes[1].score) <= 8;
  const mixedStateOk = workLanes.every(lane => Boolean(lane.mixed) === expectedMixedState)
    && (match.laneExamples || []).every(lane => Boolean(lane.mixed) === expectedMixedState);
  const rolesOk = scenario.expected.test(match.primary.title);
  const lanesOk = scenario.requiredLanes.every(lane => laneKeys.has(lane));
  const laneExamplesOk = (match.laneExamples || []).length === 2 && (match.laneExamples || []).every(lane => lane.roles.length === 3);
  const directionOk = !scenario.expectedDirectionLane || (
    match.direction?.laneKey === scenario.expectedDirectionLane
    && (!scenario.expectedDirectionTitle || match.direction.title === scenario.expectedDirectionTitle)
    && Array.isArray(match.direction.examples)
    && match.direction.examples.length === 3
    && typeof match.direction.rationale === "string"
    && match.direction.rationale.length > 0
  );
  const ok = rolesOk && lanesOk && laneExamplesOk && mixedStateOk && directionOk;
  console.log(`${ok ? "PASS" : "FAIL"} | ${scenario.name}`);
  console.log(`  ${match.primary.title} · ${match.matchScore} · lanes: ${(match.workLanes || []).map(lane => `${lane.key}:${lane.score}`).join(", ")}`);
  console.log(`  examples: ${(match.laneExamples || []).map(lane => `${lane.key}=[${lane.roles.map(role => role.title).join("; ")}]`).join(" | ")}`);
  console.log(`  evidence: ${(match.careerSignals || []).join(", ")}`);
  if (!ok) {
    console.log(`  Failed: ${[!rolesOk && "role family", !lanesOk && "work lanes", !laneExamplesOk && "two populated lane examples", !mixedStateOk && "mixed-evidence state", !directionOk && "role-family direction"].filter(Boolean).join(", ")}`);
    failures += 1;
  }
}
console.log(`\nStatus: ${failures ? "REVIEW" : "PASS"} (${scenarios.length - failures}/${scenarios.length})`);
if (failures) process.exitCode = 1;
