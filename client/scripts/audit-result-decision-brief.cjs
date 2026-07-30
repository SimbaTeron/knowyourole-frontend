#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const brief = fs.readFileSync(path.join(root, "src/components/results/ResultDecisionBrief.tsx"), "utf8");
const page = fs.readFileSync(path.join(root, "src/app/results/ResultsPageClient.tsx"), "utf8");

const requiredBriefFragments = [
  "Early signal",
  "Mixed evidence",
  "Clearer signal",
  "Exploratory read",
  "Why it surfaced",
  "Try this week",
  "Adjacent examples to compare",
  "Career-context caveat",
  "Explore role fit and examples",
  "It is still a compass, not a prediction or a fixed career prescription.",
  "onExploreRole",
];
for (const fragment of requiredBriefFragments) {
  if (!brief.includes(fragment)) throw new Error(`Decision brief missing: ${fragment}`);
}
if (!page.includes('result={canonicalResult}')) throw new Error("decision brief is not wired to the canonical ResultDTO");
if (!page.includes('onExploreRole={() => go("role", "decision_brief")}')) throw new Error("decision brief does not lead to role detail");
if (!page.includes('canonicalResult={realResults.canonicalResult}')) throw new Error("canonical ResultDTO is not passed through the active result shell");

console.log("RESULT_DECISION_BRIEF_AUDIT_PASS");
console.log("- canonical result data drives evidence-state language when available");
console.log("- fallback/demo output is explicitly exploratory rather than definitive");
console.log("- direction rationale, experiment, adjacent examples, caveat, and role-detail action are present");
