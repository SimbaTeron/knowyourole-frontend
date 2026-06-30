#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const scoringPath = path.join(projectRoot, 'src', 'lib', 'scoring.ts');
const apiScoringPath = path.join(projectRoot, 'src', 'app', 'api', '_lib', 'scoring.ts');
const resultsPath = path.join(projectRoot, 'src', 'app', 'results', 'ResultsPageClient.tsx');
const scoreRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'score', 'route.ts');
const auditPath = path.join(projectRoot, 'scripts', 'audit-quiz-validity-personas.mjs');

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const mustInclude = (label, text, needle) => {
  if (!text.includes(needle)) failures.push(`${label}: missing ${needle}`);
};

const scoring = read(scoringPath);
const apiScoring = read(apiScoringPath);
const results = read(resultsPath);
const scoreRoute = read(scoreRoutePath);
const audit = read(auditPath);

for (const [label, text] of [['client scoring', scoring], ['api scoring', apiScoring]]) {
  mustInclude(label, text, 'mbtiAxisConfidence');
  mustInclude(label, text, 'modelConfidence');
  mustInclude(label, text, 'closeCallDimensions');
  mustInclude(label, text, 'resultConfidenceLabel');
  mustInclude(label, text, 'explainMbtiAxisConfidence');
}

mustInclude('results page', results, 'resultConfidenceLabel');
mustInclude('results page', results, 'closeCallDimensions');
mustInclude('results page', results, 'Close-call axes');
mustInclude('results page', results, 'Validity signal');

mustInclude('score route', scoreRoute, 'mbtiAxisConfidence');
mustInclude('score route', scoreRoute, 'closeCallDimensions');
mustInclude('score route', scoreRoute, 'modelConfidence');
mustInclude('score route', scoreRoute, 'resultConfidenceLabel');

mustInclude('persona audit script', audit, 'Strategic Systems Architect');
mustInclude('persona audit script', audit, 'Warm Team Connector');
mustInclude('persona audit script', audit, 'Creative Explorer');
mustInclude('persona audit script', audit, 'Methodical Support Specialist');
mustInclude('persona audit script', audit, 'Hands-on Fast Operator');
mustInclude('persona audit script', audit, 'minimumRating');
mustInclude('persona audit script', audit, 'closeCallDimensions');

if (failures.length) {
  console.error('Phase 1 validity hardening checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Phase 1 validity hardening checks passed.');
