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
  require.extensions[extension] = (module, filename) => module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    }).outputText,
    filename,
  );
}

const { SHORTFORM_V2_QUESTIONS } = require("../src/data/shortformV2Questions.ts");
const {
  recomputeShortformV2ScoreMaps,
  validateShortformV2Responses,
} = require("../src/lib/quiz/shortformV2Scoring.ts");
const { calibrateShortformV2Scores } = require("../src/lib/results/calibrateShortformV2Scores.ts");
const { buildResultDTO } = require("../src/lib/results/buildResultDTO.ts");

const responses = SHORTFORM_V2_QUESTIONS.map((question, index) => ({
  questionId: question.id,
  choice: index % 4,
  timeSpent: 2 + (index % 5) / 10,
  swipeDirection: index % 4 < 2 ? "left" : "right",
}));

function scoreFromResponses(candidate) {
  const validated = validateShortformV2Responses(candidate);
  const maps = recomputeShortformV2ScoreMaps(validated);
  return calibrateShortformV2Scores({
    ...maps,
    responses: validated,
    engagement: validated.length,
    averageSwipeTime: 2.2,
  });
}

const clientScores = scoreFromResponses(responses);
const serverScores = scoreFromResponses(responses);
if (JSON.stringify(clientScores) !== JSON.stringify(serverScores)) {
  throw new Error("identical response set produced client/server score drift");
}

const dto = buildResultDTO({ tier: "25+", source: "dev_test", scores: serverScores });
if (!dto.validation.ok) throw new Error(`ResultDTO invalid: ${dto.validation.errors.join(", ")}`);
if (dto.result.raw.tier !== "25plus") throw new Error(`tier normalization drift: ${dto.result.raw.tier}`);
if (dto.result.audit.scoringAudit.totalQuestions !== 28) {
  throw new Error(`DTO expected 28 responses, got ${dto.result.audit.scoringAudit.totalQuestions}`);
}

const invalidCases = [
  ["missing answer", responses.slice(0, -1)],
  ["duplicate question", [...responses.slice(0, -1), { ...responses[0] }]],
  ["unknown question", responses.map((response, index) => index === 0 ? { ...response, questionId: 999 } : response)],
  ["invalid choice", responses.map((response, index) => index === 0 ? { ...response, choice: 4 } : response)],
];
for (const [label, candidate] of invalidCases) {
  let rejected = false;
  try { validateShortformV2Responses(candidate); } catch { rejected = true; }
  if (!rejected) throw new Error(`${label} was accepted`);
}

console.log("SHORTFORM_V2_SERVER_AUTHORITY_PASS");
console.log("- exactly 28 known answers required");
console.log("- duplicate, missing, unknown, and invalid-choice responses rejected");
console.log("- identical answers produce identical calibrated scores and a valid ResultDTO");
