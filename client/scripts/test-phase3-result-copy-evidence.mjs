#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const resultsPagePath = path.join(projectRoot, 'src/app/results/ResultsPageClient.tsx');
const source = fs.readFileSync(resultsPagePath, 'utf8');

const checks = [
  {
    name: 'answer evidence helper exists',
    pass: source.includes('function buildAnswerEvidenceSnippets'),
  },
  {
    name: 'uses selected answer labels',
    pass: source.includes('selectedOptionLabel') && source.includes('selectedOptionMeta'),
  },
  {
    name: 'visible why-you-got-this heading exists',
    pass: source.includes('Why you got this'),
  },
  {
    name: 'explains answer-pattern causality',
    pass: source.includes('Your result is tied to your answer pattern.'),
  },
  {
    name: 'groups personality communication trait signals',
    pass: source.includes('Personality signal') && source.includes('Communication signal') && source.includes('Trait signal'),
  },
  {
    name: 'maps evidence from MBTI DISC and Big Five response metadata',
    pass: source.includes('response.psych?.startsWith("MBTI")') && source.includes('response.psych?.startsWith("DISC")') && source.includes('response.psych?.startsWith(`Big5-${topBigFiveKey}`)'),
  },
  {
    name: 'has no-metadata fallback copy',
    pass: source.includes('letter balance') && source.includes('communication pattern') && source.includes('top Big Five signal'),
  },
];

const failed = checks.filter((check) => !check.pass);
const lines = [];
lines.push('# KnowYouRole Phase 3 Result Copy Evidence Audit');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- Checks: **${checks.length}**`);
lines.push(`- Passing: **${checks.length - failed.length} / ${checks.length}**`);
lines.push(`- Status: **${failed.length ? 'review' : 'pass'}**`);
lines.push('');
lines.push('## Checks');
lines.push('');
for (const check of checks) lines.push(`- ${check.pass ? 'PASS' : 'REVIEW'} — ${check.name}`);
lines.push('');

const markdownIndex = process.argv.indexOf('--markdown');
const markdownPath = markdownIndex >= 0 ? process.argv[markdownIndex + 1] : null;
const markdown = lines.join('\n');
if (markdownPath) fs.writeFileSync(path.resolve(projectRoot, markdownPath), `${markdown}\n`);
console.log(markdown);
if (failed.length) process.exitCode = 1;
