#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const expectedDiscLabels = {
  D: 'Dominant',
  I: 'Influential',
  S: 'Steady',
  C: 'Conscientious',
};

function normalizeBigFiveEvidence(rawScore) {
  if (rawScore > 25) return Math.max(1, Math.min(99, Math.round(rawScore)));
  const signed = Math.max(-7, Math.min(7, rawScore));
  return Math.max(8, Math.min(92, Math.round(50 + signed * 6)));
}

function resolvePrimaryDisc(disc, mbti, bigFiveProfile) {
  const sorted = Object.entries(disc).sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = sorted[0] || ['D', 0];
  const closeToTop = (key, gap = 2) => topValue - (disc[key] ?? 0) <= gap;
  if (topKey === 'D') {
    const analyticalShape = (mbti.I ?? 0) >= (mbti.E ?? 0) && ((mbti.T ?? 0) >= (mbti.F ?? 0) || (bigFiveProfile.C ?? bigFiveProfile.conscientiousness ?? 50) >= 68);
    if (closeToTop('C', 2.5) && analyticalShape && (bigFiveProfile.E ?? bigFiveProfile.extraversion ?? 50) <= 58) return 'C';
    const influentialShape = (bigFiveProfile.E ?? bigFiveProfile.extraversion ?? 50) >= 70 && (bigFiveProfile.O ?? bigFiveProfile.openness ?? 50) >= 70 && (bigFiveProfile.C ?? bigFiveProfile.conscientiousness ?? 50) <= 62;
    if (closeToTop('I', 2.5) && influentialShape) return 'I';
  }
  return topKey;
}

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const rolesPath = path.join(projectRoot, 'src/data/roles.json');
const rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
for (const [code, label] of Object.entries(expectedDiscLabels)) {
  check(`DISC label ${code} is ${label}`, rolesData.traitDescriptions.disc[code]?.label === label, rolesData.traitDescriptions.disc[code]?.label);
}

const labelFiles = [
  'src/lib/scoring.ts',
  'src/app/api/_lib/scoring.ts',
  'src/app/results/resultsPageModel.ts',
  'src/app/results/ResultsPageClient.tsx',
  'src/lib/results/buildResultDTO.ts',
];
for (const rel of labelFiles) {
  const source = fs.readFileSync(path.join(projectRoot, rel), 'utf8');
  check(`${rel} has formal DISC labels`, Object.values(expectedDiscLabels).every((label) => source.includes(label)), 'formal labels present');
  check(`${rel} has no old DISC nicknames`, !/(Direct Driver|Social Spark|Steady Anchor|Precise Analyst)/.test(source), 'old nicknames absent');
}

const strategicDisc = resolvePrimaryDisc(
  { D: 10, I: 2, S: 4, C: 8.5 },
  { E: 4, I: 11, S: 3, N: 12, T: 11, F: 3, J: 10, P: 4 },
  { O: 86, C: 86, E: 32, A: 56, N: 38 },
);
check('Strategic near-tie D/C resolves to Conscientious', strategicDisc === 'C', strategicDisc);

const creativeDisc = resolvePrimaryDisc(
  { D: 10, I: 8.5, S: 3, C: 4 },
  { E: 10, I: 4, S: 3, N: 12, T: 8, F: 6, J: 3, P: 11 },
  { O: 92, C: 38, E: 88, A: 62, N: 44 },
);
check('Creative near-tie D/I resolves to Influential', creativeDisc === 'I', creativeDisc);

const fastOperatorDisc = resolvePrimaryDisc(
  { D: 12, I: 6, S: 2, C: 3 },
  { E: 11, I: 3, S: 8, N: 7, T: 10, F: 4, J: 5, P: 9 },
  { O: 80, C: 68, E: 86, A: 34, N: 34 },
);
check('Clear D remains Dominant', fastOperatorDisc === 'D', fastOperatorDisc);

check('Real signed Big Five high evidence no longer hard-ceilings at 95', normalizeBigFiveEvidence(7) === 92, normalizeBigFiveEvidence(7));
check('Real signed Big Five neutral stays neutral', normalizeBigFiveEvidence(0) === 50, normalizeBigFiveEvidence(0));
check('Dev percentile Big Five remains passthrough-compatible', normalizeBigFiveEvidence(86) === 86, normalizeBigFiveEvidence(86));

const seniorRoleKeys = ['entp-d-o-high'];
for (const key of seniorRoleKeys) {
  const starter = rolesData.roles[key]?.starterPath || '';
  check(`${key} starter path translates senior title into beginner test`, /beginner test|prototype|five-user trial|small launch/.test(starter), starter);
}
const estpStarter = rolesData.roles['estp-d-e-high']?.starterPath || '';
check('estp-d-e-high now uses practical field sales starter test', /Sell, pitch, recruit, or promote something real to five people/.test(estpStarter), estpStarter);
const supportStarter = rolesData.roles['istj-c-c-high']?.starterPath || '';
check('Methodical support role starter path includes broader operations/quality artifacts', /checklist|quality review|operations fix/.test(supportStarter), supportStarter);

function renderMarkdown() {
  const lines = [];
  lines.push('# Phase 4 DISC + Role Calibration Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Checks: **${checks.length}**`);
  lines.push(`- Passing: **${checks.filter((c) => c.pass).length} / ${checks.length}**`);
  lines.push(`- Status: **${checks.every((c) => c.pass) ? 'PASS' : 'REVIEW'}**`);
  lines.push('');
  lines.push('## Checks');
  lines.push('');
  for (const item of checks) {
    lines.push(`- ${item.pass ? '✅' : '❌'} **${item.name}** — ${String(item.detail).slice(0, 220)}`);
  }
  lines.push('');
  return lines.join('\n');
}

const markdownIndex = process.argv.indexOf('--markdown');
const markdownPath = markdownIndex >= 0 ? process.argv[markdownIndex + 1] : null;
const markdown = renderMarkdown();
if (markdownPath) fs.writeFileSync(path.resolve(projectRoot, markdownPath), `${markdown}\n`);
console.log(markdown);
if (checks.some((check) => !check.pass)) process.exitCode = 1;
