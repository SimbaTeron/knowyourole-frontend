#!/usr/bin/env node
const fs = require("node:fs");
const root = "/home/sim/projects/knowyourole-rebuild/client/src";
const page = fs.readFileSync(`${root}/app/results/ResultsPageClient.tsx`, "utf8");
const cardPath = `${root}/components/results/DirectionFeedbackCard.tsx`;
if (!fs.existsSync(cardPath)) throw new Error("Missing in-result controlled beta feedback card");
const card = fs.readFileSync(cardPath, "utf8");
for (const expected of [
  "career_relevance",
  "direction_relevance_submitted",
  "direction_relevance_prompted",
  "direction_relevance_started",
  "How useful was this work direction?",
]) if (!card.includes(expected)) throw new Error(`Missing controlled-beta feedback behavior: ${expected}`);
if (!page.includes("role_fit_opened")) throw new Error("Missing role-fit funnel event");
if (!page.includes("<DirectionFeedbackCard")) throw new Error("Results page does not render controlled-beta feedback");
console.log("CONTROLLED_BETA_FEEDBACK_REGRESSION_PASS");
