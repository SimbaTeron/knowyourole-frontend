#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const filePath = path.join(projectRoot, "src/data/shortformV2Questions.ts");
const source = fs.readFileSync(filePath, "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleBox = { exports: {} };
vm.runInNewContext(compiled, { module: moduleBox, exports: moduleBox.exports, require, console });
const { SHORTFORM_V2_QUESTIONS, CAREER_SCORE_KEYS } = moduleBox.exports;

const allowed = {
  mbti: new Set(["E", "I", "S", "N", "T", "F", "J", "P"]),
  disc: new Set(["D", "I", "S", "C"]),
  bigFive: new Set(["O", "C", "E", "A", "N"]),
  career: new Set(CAREER_SCORE_KEYS),
};
const expectedGroups = {
  "Core operating style": 8,
  "Big Five backbone": 8,
  "DISC work behavior": 5,
  "Career-fit vector": 5,
  Calibration: 2,
};
const errors = [];
const ids = new Set();
const prompts = new Set();
const groups = {};
const measured = Object.fromEntries(Object.entries(allowed).map(([family, keys]) => [family, Object.fromEntries([...keys].map(key => [key, 0]))]));

if (SHORTFORM_V2_QUESTIONS.length !== 28) errors.push(`expected 28 questions, found ${SHORTFORM_V2_QUESTIONS.length}`);
for (const [index, question] of SHORTFORM_V2_QUESTIONS.entries()) {
  if (!question.id || ids.has(question.id)) errors.push(`question ${index + 1}: missing/duplicate id ${question.id}`);
  ids.add(question.id);
  const promptKey = String(question.prompt || "").trim().toLowerCase();
  if (!promptKey || prompts.has(promptKey)) errors.push(`question ${question.id}: missing/duplicate prompt`);
  prompts.add(promptKey);
  groups[question.group] = (groups[question.group] || 0) + 1;
  if (!Array.isArray(question.answers) || question.answers.length !== 4) errors.push(`question ${question.id}: expected 4 answers`);
  const answerIds = new Set();
  for (const answer of question.answers || []) {
    if (!answer.id || answerIds.has(answer.id)) errors.push(`question ${question.id}: missing/duplicate answer id ${answer.id}`);
    answerIds.add(answer.id);
    if (!String(answer.text || "").trim()) errors.push(`question ${question.id}/${answer.id}: answer text missing`);
    if (!String(answer.resultSignal || "").trim()) errors.push(`question ${question.id}/${answer.id}: resultSignal missing`);
    for (const [family, values] of Object.entries(answer.scores || {})) {
      if (!allowed[family]) {
        errors.push(`question ${question.id}/${answer.id}: unknown score family ${family}`);
        continue;
      }
      for (const [key, value] of Object.entries(values || {})) {
        if (!allowed[family].has(key)) errors.push(`question ${question.id}/${answer.id}: invalid ${family} key ${key}`);
        if (!Number.isFinite(value)) errors.push(`question ${question.id}/${answer.id}: non-finite ${family}.${key}`);
        if (Number.isFinite(value)) measured[family][key] += Math.abs(value);
      }
    }
  }
}
for (const [group, expected] of Object.entries(expectedGroups)) if (groups[group] !== expected) errors.push(`group ${group}: expected ${expected}, found ${groups[group] || 0}`);
for (const [family, keys] of Object.entries(measured)) for (const [key, total] of Object.entries(keys)) if (total <= 0) errors.push(`${family}.${key} has no measurable evidence`);

console.log("KnowYouRole Active Shortform Question Database Audit");
console.log("====================================================");
console.log(`Questions: ${SHORTFORM_V2_QUESTIONS.length}`);
console.log("Groups:", groups);
console.log("Measured signal totals:", measured);
console.log(`Status: ${errors.length ? "REVIEW" : "PASS"}`);
if (errors.length) {
  console.log("Errors:");
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
}
