#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const questionsPath = path.join(projectRoot, 'src/data/questions.json');

const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const questions = data.questions ?? [];
const byId = new Map(questions.map((question) => [question.id, question]));

const allowed = {
  MBTI: new Set(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']),
  DISC: new Set(['D', 'I', 'S', 'C']),
  Big5: new Set(['O+', 'O-', 'C+', 'C-', 'E+', 'E-', 'A+', 'A-', 'N+', 'N-']),
};

const calibrationQuestions = [
  {
    id: 250,
    tier: '13-18',
    category: 'support-vs-analysis',
    psych: 'DISC-SC',
    optionMeta: ['S', 'C'],
    expectedPromptIncludes: ['help', 'details'],
  },
  {
    id: 301,
    tier: '13-18',
    category: 'dominance-vs-extraversion',
    psych: 'DISC-DI',
    optionMeta: ['D', 'I'],
    expectedPromptIncludes: ['momentum'],
  },
  {
    id: 395,
    tier: '13-18',
    category: 'practical-action-vs-abstract-novelty',
    psych: 'MBTI-SN',
    optionMeta: ['S', 'N'],
    expectedPromptIncludes: ['new idea', 'next step'],
  },
  {
    id: 500,
    tier: '19-25',
    category: 'support-vs-analysis',
    psych: 'DISC-SC',
    optionMeta: ['S', 'C'],
    expectedPromptIncludes: ['overwhelmed', 'accuracy'],
  },
  {
    id: 695,
    tier: '19-25',
    category: 'practical-action-vs-abstract-novelty',
    psych: 'MBTI-SN',
    optionMeta: ['S', 'N'],
    expectedPromptIncludes: ['project idea', 'first move'],
  },
  {
    id: 800,
    tier: '19-25',
    category: 'dominance-vs-extraversion',
    psych: 'DISC-DI',
    optionMeta: ['D', 'I'],
    expectedPromptIncludes: ['momentum', 'deadline'],
  },
  {
    id: 900,
    tier: '25+',
    category: 'support-vs-analysis',
    psych: 'DISC-SC',
    optionMeta: ['S', 'C'],
    expectedPromptIncludes: ['overloaded', 'right'],
  },
  {
    id: 1095,
    tier: '25+',
    category: 'practical-action-vs-abstract-novelty',
    psych: 'MBTI-SN',
    optionMeta: ['S', 'N'],
    expectedPromptIncludes: ['new work idea', 'investment'],
  },
  {
    id: 1200,
    tier: '25+',
    category: 'dominance-vs-extraversion',
    psych: 'DISC-DI',
    optionMeta: ['D', 'I'],
    expectedPromptIncludes: ['workgroup', 'momentum'],
  },
];

function frameworkOf(psych) {
  return String(psych).split('-')[0];
}

function validateQuestion(question) {
  const errors = [];
  if (!question) return ['question missing'];
  if (!Array.isArray(question.options) || question.options.length !== 2) errors.push('must have two visible options');
  if (!Array.isArray(question.optionMeta) || question.optionMeta.length !== 2) errors.push('must have two optionMeta entries');
  const framework = frameworkOf(question.psych);
  const traits = question.optionMeta ?? [];
  const validSet = allowed[framework];
  if (!validSet) errors.push(`unknown framework ${framework}`);
  for (const trait of traits) {
    if (validSet && !validSet.has(trait)) errors.push(`invalid trait ${trait} for ${framework}`);
  }
  if (framework === 'MBTI' && !question.psych.includes(traits.join(''))) {
    errors.push(`MBTI psych ${question.psych} does not match optionMeta ${traits.join('/')}`);
  }
  if (framework === 'DISC' && !question.psych.includes(traits.join(''))) {
    errors.push(`DISC psych ${question.psych} does not match optionMeta ${traits.join('/')}`);
  }
  return errors;
}

const rows = [];
const errors = [];
const categoryTierCoverage = new Map();

for (const spec of calibrationQuestions) {
  const q = byId.get(spec.id);
  const qErrors = validateQuestion(q);
  if (!q) {
    errors.push(`id ${spec.id}: missing`);
    continue;
  }
  if (q.tier !== spec.tier) qErrors.push(`tier expected ${spec.tier}, got ${q.tier}`);
  if (q.psych !== spec.psych) qErrors.push(`psych expected ${spec.psych}, got ${q.psych}`);
  if (JSON.stringify(q.optionMeta) !== JSON.stringify(spec.optionMeta)) {
    qErrors.push(`optionMeta expected ${JSON.stringify(spec.optionMeta)}, got ${JSON.stringify(q.optionMeta)}`);
  }
  for (const phrase of spec.expectedPromptIncludes) {
    if (!String(q.prompt).toLowerCase().includes(phrase.toLowerCase())) qErrors.push(`prompt missing phrase: ${phrase}`);
  }
  if (q.wildcard !== false) qErrors.push('calibration question must not be wildcard');
  if (qErrors.length) errors.push(`id ${spec.id}: ${qErrors.join('; ')}`);
  const key = `${spec.category}:${spec.tier}`;
  categoryTierCoverage.set(key, true);
  rows.push({
    id: spec.id,
    tier: q.tier,
    category: spec.category,
    psych: q.psych,
    optionMeta: q.optionMeta.join('/'),
    prompt: q.prompt,
    status: qErrors.length ? 'review' : 'pass',
  });
}

const categories = [...new Set(calibrationQuestions.map((q) => q.category))];
const tiers = ['13-18', '19-25', '25+'];
for (const category of categories) {
  for (const tier of tiers) {
    if (!categoryTierCoverage.has(`${category}:${tier}`)) errors.push(`coverage missing: ${category} for ${tier}`);
  }
}

function renderMarkdown() {
  const lines = [];
  lines.push('# KnowYouRole Phase 2 Question-Bank Calibration Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Calibration questions checked: **${rows.length}**`);
  lines.push(`- Categories covered: **${categories.length}**`);
  lines.push(`- Active tiers covered: **${tiers.length} / ${tiers.length}**`);
  lines.push(`- Status: **${errors.length ? 'review' : 'pass'}**`);
  lines.push('');
  lines.push('## Calibration coverage');
  lines.push('');
  for (const row of rows) {
    lines.push(`- **${row.category}** · ${row.tier} · id ${row.id}`);
    lines.push(`  - ${row.psych} · ${row.optionMeta}`);
    lines.push(`  - ${row.prompt}`);
    lines.push(`  - Status: ${row.status}`);
  }
  lines.push('');
  if (errors.length) {
    lines.push('## Errors');
    lines.push('');
    for (const error of errors) lines.push(`- ${error}`);
    lines.push('');
  }
  return lines.join('\n');
}

const markdownIndex = process.argv.indexOf('--markdown');
const markdownPath = markdownIndex >= 0 ? process.argv[markdownIndex + 1] : null;
const markdown = renderMarkdown();
if (markdownPath) fs.writeFileSync(path.resolve(projectRoot, markdownPath), `${markdown}\n`);
console.log(markdown);
if (errors.length) process.exitCode = 1;
