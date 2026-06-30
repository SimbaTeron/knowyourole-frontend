#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const rolesPath = path.join(projectRoot, 'src', 'data', 'roles.json');

const MBTI_TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
const DISC_TYPES = ['D', 'I', 'S', 'C'];
const BIG_FIVE_TRAITS = ['O', 'C', 'E', 'A', 'N'];
const TRAIT_NAMES = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Stress Reactivity',
};

const CATEGORY_FALLBACK_PREFIXES = new Set([
  'tech',
  'ai',
  'creative',
  'artistic',
  'trades',
  'healthcare',
  'education',
  'finance',
  'marketing',
  'science',
  'legal',
  'media',
  'service',
  'government',
  'security',
  'outdoor',
  'sports',
  'food',
  'transport',
]);

function readRoles() {
  const parsed = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
  if (!parsed.roles || typeof parsed.roles !== 'object') {
    throw new Error(`Expected roles object in ${rolesPath}`);
  }
  return parsed.roles;
}

function pct(part, total) {
  return total === 0 ? '0.0%' : `${((part / total) * 100).toFixed(1)}%`;
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortEntriesDesc(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function roleLabel(role) {
  if (!role) return 'Missing role';
  return `${role.primary?.title || 'Untitled'} / ${role.secondary?.title || 'Untitled'}`;
}

function getRoleKeyCandidates(mbtiType, discStyle, highestTrait, secondTrait) {
  const mbti = mbtiType.toLowerCase();
  const disc = discStyle.toLowerCase();
  const high = highestTrait.toLowerCase();
  const second = secondTrait.toLowerCase();

  return [
    { key: `${mbti}-${disc}-${high}-high`, tier: 'exact-highest', label: 'Exact MBTI + DISC + top Big Five' },
    { key: `${mbti}-${disc}-${second}-high`, tier: 'exact-second', label: 'Exact MBTI + DISC + second Big Five' },
    { key: `${mbti}-${high}-high`, tier: 'mbti-trait', label: 'MBTI + top Big Five fallback' },
    { key: `tech-${disc}-${high}-high`, tier: 'category-highest', label: 'Tech category fallback' },
    { key: `ai-${disc}-${high}-high`, tier: 'category-highest', label: 'AI category fallback' },
    { key: `creative-${high}-high`, tier: 'category-highest', label: 'Creative category fallback' },
    { key: `artistic-${high}-high`, tier: 'category-highest', label: 'Artistic category fallback' },
    { key: `trades-${disc}-${second}-high`, tier: 'category-second', label: 'Trades category fallback' },
    { key: `healthcare-${disc}-${high}-high`, tier: 'category-highest', label: 'Healthcare category fallback' },
    { key: `education-${disc}-${high}-high`, tier: 'category-highest', label: 'Education category fallback' },
    { key: `finance-${disc}-${second}-high`, tier: 'category-second', label: 'Finance category fallback' },
    { key: `marketing-${disc}-${high}-high`, tier: 'category-highest', label: 'Marketing category fallback' },
    { key: `science-${disc}-${high}-high`, tier: 'category-highest', label: 'Science category fallback' },
    { key: `legal-${disc}-${second}-high`, tier: 'category-second', label: 'Legal category fallback' },
    { key: `media-${disc}-${high}-high`, tier: 'category-highest', label: 'Media category fallback' },
    { key: `service-${disc}-${high}-high`, tier: 'category-highest', label: 'Service category fallback' },
    { key: `government-${disc}-${high}-high`, tier: 'category-highest', label: 'Government category fallback' },
    { key: `security-${disc}-${second}-high`, tier: 'category-second', label: 'Security category fallback' },
    { key: `outdoor-${disc}-${high}-high`, tier: 'category-highest', label: 'Outdoor category fallback' },
    { key: `sports-${disc}-${high}-high`, tier: 'category-highest', label: 'Sports category fallback' },
    { key: `food-${high}-high`, tier: 'category-highest', label: 'Food category fallback' },
    { key: `transport-${disc}-${second}-high`, tier: 'category-second', label: 'Transport category fallback' },
    { key: `${mbti}-c-o-high`, tier: 'mbti-openness', label: 'MBTI + C/O fallback' },
    { key: `${mbti}-d-o-high`, tier: 'mbti-openness', label: 'MBTI + D/O fallback' },
    { key: `${mbti}-s-o-high`, tier: 'mbti-openness', label: 'MBTI + S/O fallback' },
    { key: `${mbti}-i-o-high`, tier: 'mbti-openness', label: 'MBTI + I/O fallback' },
    { key: 'default', tier: 'default', label: 'Default fallback' },
  ];
}

function matchRole(roles, mbtiType, discStyle, highestTrait, secondTrait) {
  for (const candidate of getRoleKeyCandidates(mbtiType, discStyle, highestTrait, secondTrait)) {
    if (roles[candidate.key]) {
      return { ...candidate, role: roles[candidate.key] };
    }
  }
  return { key: 'missing-default', tier: 'missing-default', label: 'Missing default role', role: null };
}

function exactMatrixCoverage(roles) {
  const exact = [];
  const missing = [];
  const byMbti = new Map(MBTI_TYPES.map((type) => [type, 0]));
  const byDisc = new Map(DISC_TYPES.map((type) => [type, 0]));
  const byTrait = new Map(BIG_FIVE_TRAITS.map((trait) => [trait, 0]));

  for (const mbti of MBTI_TYPES) {
    for (const disc of DISC_TYPES) {
      for (const trait of BIG_FIVE_TRAITS) {
        const key = `${mbti.toLowerCase()}-${disc.toLowerCase()}-${trait.toLowerCase()}-high`;
        if (roles[key]) {
          exact.push(key);
          increment(byMbti, mbti);
          increment(byDisc, disc);
          increment(byTrait, trait);
        } else {
          missing.push(key);
        }
      }
    }
  }

  return { exact, missing, byMbti, byDisc, byTrait };
}

function simulateFallbacks(roles) {
  const outcomes = [];
  const tierCounts = new Map();
  const keyUse = new Map();
  const roleTitleUse = new Map();
  const missingExactPressure = new Map();

  for (const mbti of MBTI_TYPES) {
    for (const disc of DISC_TYPES) {
      for (const highestTrait of BIG_FIVE_TRAITS) {
        for (const secondTrait of BIG_FIVE_TRAITS.filter((trait) => trait !== highestTrait)) {
          const exactKey = `${mbti.toLowerCase()}-${disc.toLowerCase()}-${highestTrait.toLowerCase()}-high`;
          const match = matchRole(roles, mbti, disc, highestTrait, secondTrait);
          const isExactHighest = match.key === exactKey;
          const outcome = { mbti, disc, highestTrait, secondTrait, exactKey, isExactHighest, ...match };
          outcomes.push(outcome);
          increment(tierCounts, match.tier);
          increment(keyUse, match.key);
          increment(roleTitleUse, match.role?.primary?.title || 'Missing primary title');

          if (!isExactHighest) {
            const pressure = priorityScore(outcome);
            increment(missingExactPressure, exactKey, pressure);
          }
        }
      }
    }
  }

  return { outcomes, tierCounts, keyUse, roleTitleUse, missingExactPressure };
}

function priorityScore(outcome) {
  const tierWeight = {
    'default': 10,
    'missing-default': 10,
    'category-highest': 8,
    'category-second': 7,
    'mbti-openness': 6,
    'mbti-trait': 5,
    'exact-second': 3,
    'exact-highest': 0,
  }[outcome.tier] ?? 4;

  const traitWeight = {
    E: 3,
    A: 3,
    C: 2,
    O: 2,
    N: 2,
  }[outcome.highestTrait] ?? 1;

  const discWeight = {
    I: 2,
    D: 2,
    S: 1,
    C: 1,
  }[outcome.disc] ?? 1;

  return tierWeight + traitWeight + discWeight;
}

function duplicateAudit(roles) {
  const titleMap = new Map();
  const descMap = new Map();
  const salaryIssues = [];
  const thinDescriptions = [];

  for (const [key, entry] of Object.entries(roles)) {
    for (const slot of ['primary', 'secondary']) {
      const role = entry?.[slot];
      if (!role) continue;
      const title = (role.title || '').trim();
      const desc = (role.desc || '').trim();
      const salary = (role.salary || '').trim();
      if (title) {
        const current = titleMap.get(title) || [];
        current.push(`${key}.${slot}`);
        titleMap.set(title, current);
      }
      if (desc) {
        const current = descMap.get(desc) || [];
        current.push(`${key}.${slot}`);
        descMap.set(desc, current);
      }
      if (!salary) salaryIssues.push(`${key}.${slot}`);
      if (desc.split(/\s+/).filter(Boolean).length < 5) {
        thinDescriptions.push({ location: `${key}.${slot}`, title, desc });
      }
    }
  }

  const duplicateTitles = [...titleMap.entries()].filter(([, locations]) => locations.length > 1);
  const duplicateDescriptions = [...descMap.entries()].filter(([, locations]) => locations.length > 1);

  return { duplicateTitles, duplicateDescriptions, salaryIssues, thinDescriptions };
}

function reasoningFieldAudit(roles, exactKeys) {
  const requiredFields = ['whyThisFits', 'starterPath', 'mayNotFit'];
  const completeExact = [];
  const missingExact = [];

  for (const key of exactKeys) {
    const entry = roles[key];
    const missing = requiredFields.filter((field) => !entry?.[field] || typeof entry[field] !== 'string' || entry[field].trim().length < 20);
    if (missing.length === 0) completeExact.push(key);
    else missingExact.push({ key, missing });
  }

  return { requiredFields, completeExact, missingExact };
}

function classifyKeys(roles) {
  const exactMbtiDiscTraitKeys = [];
  const genericCategoryKeys = [];
  const mbtiTraitFallbackKeys = [];
  const unknownPatternKeys = [];

  for (const key of Object.keys(roles)) {
    const parts = key.split('-');
    const prefix = parts[0];
    if (parts.length === 4 && MBTI_TYPES.map((type) => type.toLowerCase()).includes(parts[0]) && DISC_TYPES.map((type) => type.toLowerCase()).includes(parts[1]) && BIG_FIVE_TRAITS.map((trait) => trait.toLowerCase()).includes(parts[2]) && parts[3] === 'high') {
      exactMbtiDiscTraitKeys.push(key);
    } else if (parts.length >= 3 && CATEGORY_FALLBACK_PREFIXES.has(prefix)) {
      genericCategoryKeys.push(key);
    } else if (parts.length === 3 && MBTI_TYPES.map((type) => type.toLowerCase()).includes(parts[0]) && BIG_FIVE_TRAITS.map((trait) => trait.toLowerCase()).includes(parts[1]) && parts[2] === 'high') {
      mbtiTraitFallbackKeys.push(key);
    } else if (key !== 'default') {
      unknownPatternKeys.push(key);
    }
  }

  return { exactMbtiDiscTraitKeys, genericCategoryKeys, mbtiTraitFallbackKeys, unknownPatternKeys };
}

function renderConsole(report) {
  const lines = [];
  lines.push('KnowYouRole Result Coverage Audit');
  lines.push('='.repeat(37));
  lines.push(`Roles path: ${rolesPath}`);
  lines.push(`Total role keys: ${report.totalRoleKeys}`);
  lines.push(`Exact MBTI-DISC-Big Five coverage: ${report.exactCount} / ${report.exactTarget} = ${pct(report.exactCount, report.exactTarget)}`);
  lines.push(`Exact entries with fit/starter/mismatch reasoning: ${report.reasoningCompleteExactCount} / ${report.exactCount} = ${pct(report.reasoningCompleteExactCount, report.exactCount)}`);
  lines.push('');

  lines.push('Coverage by MBTI:');
  for (const [mbti, count] of report.byMbti) lines.push(`- ${mbti}: ${count} / 20`);
  lines.push('');

  lines.push('Coverage by DISC:');
  for (const [disc, count] of report.byDisc) lines.push(`- ${disc}: ${count}`);
  lines.push('');

  lines.push('Coverage by Big Five top trait:');
  for (const [trait, count] of report.byTrait) lines.push(`- ${trait} (${TRAIT_NAMES[trait]}): ${count}`);
  lines.push('');

  lines.push('Simulated fallback tiers across 1,280 states:');
  for (const [tier, count] of report.tierCounts) lines.push(`- ${tier}: ${count} = ${pct(count, report.totalSimulatedStates)}`);
  lines.push('');

  lines.push('Most reused result keys:');
  for (const [key, count] of report.topUsedKeys.slice(0, 15)) lines.push(`- ${key}: ${count} uses — ${roleLabel(report.roles[key])}`);
  lines.push('');

  lines.push('Most reused primary role titles:');
  for (const [title, count] of report.topUsedTitles.slice(0, 15)) lines.push(`- ${title}: ${count} uses`);
  lines.push('');

  lines.push('Duplicate role titles:');
  if (report.duplicateTitles.length === 0) lines.push('- None');
  for (const [title, locations] of report.duplicateTitles.slice(0, 25)) lines.push(`- ${title}: ${locations.length} entries`);
  lines.push('');

  lines.push('Duplicate descriptions:');
  if (report.duplicateDescriptions.length === 0) lines.push('- None');
  for (const [desc, locations] of report.duplicateDescriptions.slice(0, 15)) lines.push(`- ${locations.length} entries: ${desc}`);
  lines.push('');

  lines.push('Priority missing exact combos:');
  for (const [key, score] of report.priorityMissingCombos.slice(0, 40)) lines.push(`- ${key}: priority score ${score}`);
  lines.push('');

  lines.push('Recommendation: continue measured 40-combo waves only after review. Current Phase A gains are measurable; do not chase 320/320 in one pass.');
  return lines.join('\n');
}

function renderMarkdown(report) {
  const now = new Date().toISOString();
  const lines = [];
  lines.push('# KnowYouRole Results Coverage Baseline');
  lines.push('');
  lines.push(`Generated: ${now}`);
  lines.push('');
  lines.push('## Executive summary');
  lines.push('');
  lines.push(`- Total role keys: **${report.totalRoleKeys}**`);
  lines.push(`- Exact MBTI × DISC × Big Five matrix coverage: **${report.exactCount} / ${report.exactTarget} (${pct(report.exactCount, report.exactTarget)})**`);
  lines.push(`- Exact entries with why/starter/mismatch reasoning: **${report.reasoningCompleteExactCount} / ${report.exactCount} (${pct(report.reasoningCompleteExactCount, report.exactCount)})**`);
  lines.push(`- Missing exact combinations: **${report.missingExactCount}**`);
  lines.push(`- Simulated result states: **${report.totalSimulatedStates}**`);
  lines.push(`- Duplicate role titles: **${report.duplicateTitles.length}**`);
  lines.push(`- Duplicate descriptions: **${report.duplicateDescriptions.length}**`);
  lines.push(`- Thin descriptions under 5 words: **${report.thinDescriptions.length}**`);
  lines.push('');
  lines.push('Interpretation: the visible results UX is strong, but result uniqueness still depends too heavily on fallback roles. Add exact combinations in measured waves and keep role guidance grounded in why-fit, starter-path, and mismatch fields.');
  lines.push('');

  lines.push('## Role-key classification');
  lines.push('');
  lines.push(`- Exact MBTI-DISC-trait keys: ${report.classification.exactMbtiDiscTraitKeys.length}`);
  lines.push(`- Generic category fallback keys: ${report.classification.genericCategoryKeys.length}`);
  lines.push(`- MBTI-trait fallback keys: ${report.classification.mbtiTraitFallbackKeys.length}`);
  lines.push(`- Unknown/non-standard pattern keys: ${report.classification.unknownPatternKeys.length}`);
  if (report.classification.unknownPatternKeys.length) {
    lines.push(`- Unknown examples: ${report.classification.unknownPatternKeys.slice(0, 20).map((key) => `\`${key}\``).join(', ')}`);
  }
  lines.push('');

  lines.push('## Exact coverage by MBTI');
  lines.push('');
  for (const [mbti, count] of report.byMbti) lines.push(`- **${mbti}:** ${count} / 20`);
  lines.push('');

  lines.push('## Exact coverage by DISC');
  lines.push('');
  for (const [disc, count] of report.byDisc) lines.push(`- **${disc}:** ${count}`);
  lines.push('');

  lines.push('## Exact coverage by Big Five top trait');
  lines.push('');
  for (const [trait, count] of report.byTrait) lines.push(`- **${trait} (${TRAIT_NAMES[trait]}):** ${count}`);
  lines.push('');

  lines.push('## Simulated fallback tiers');
  lines.push('');
  for (const [tier, count] of report.tierCounts) lines.push(`- **${tier}:** ${count} / ${report.totalSimulatedStates} (${pct(count, report.totalSimulatedStates)})`);
  lines.push('');

  lines.push('## Most reused result keys');
  lines.push('');
  for (const [key, count] of report.topUsedKeys.slice(0, 25)) {
    lines.push(`- **${key}:** ${count} uses — ${roleLabel(report.roles[key])}`);
  }
  lines.push('');

  lines.push('## Most reused primary role titles');
  lines.push('');
  for (const [title, count] of report.topUsedTitles.slice(0, 25)) lines.push(`- **${title}:** ${count} uses`);
  lines.push('');

  lines.push('## Duplicate role titles');
  lines.push('');
  if (report.duplicateTitles.length === 0) {
    lines.push('- None');
  } else {
    for (const [title, locations] of report.duplicateTitles) lines.push(`- **${title}:** ${locations.length} entries — ${locations.map((location) => `\`${location}\``).join(', ')}`);
  }
  lines.push('');

  lines.push('## Duplicate descriptions');
  lines.push('');
  if (report.duplicateDescriptions.length === 0) {
    lines.push('- None');
  } else {
    for (const [desc, locations] of report.duplicateDescriptions) lines.push(`- **${locations.length} entries:** ${desc} — ${locations.map((location) => `\`${location}\``).join(', ')}`);
  }
  lines.push('');

  lines.push('## Thin descriptions under 5 words');
  lines.push('');
  if (report.thinDescriptions.length === 0) {
    lines.push('- None');
  } else {
    for (const item of report.thinDescriptions.slice(0, 60)) lines.push(`- **${item.location}:** ${item.title} — ${item.desc}`);
  }
  lines.push('');

  lines.push('## Reasoning field coverage');
  lines.push('');
  lines.push(`- Required fields: ${report.reasoning.requiredFields.map((field) => `\`${field}\``).join(', ')}`);
  lines.push(`- Complete exact entries: ${report.reasoningCompleteExactCount} / ${report.exactCount} (${pct(report.reasoningCompleteExactCount, report.exactCount)})`);
  if (report.reasoning.missingExact.length) {
    lines.push(`- Missing examples: ${report.reasoning.missingExact.slice(0, 25).map((item) => `\`${item.key}\` missing ${item.missing.join('/')}`).join('; ')}`);
  } else {
    lines.push('- Missing examples: None');
  }
  lines.push('');

  lines.push('## Priority missing exact combinations for next wave');
  lines.push('');
  lines.push('These are ranked by how often and how severely the current matching logic must fall back when the exact combo is missing. Higher score means bigger uniqueness payoff.');
  lines.push('');
  for (const [key, score] of report.priorityMissingCombos.slice(0, 60)) lines.push(`- **${key}:** priority score ${score}`);
  lines.push('');

  lines.push('## Recommended next action');
  lines.push('');
  lines.push('Continue adding high-impact exact role entries from the priority list above, with plain-English role descriptions and young-adult starter paths. Do not attempt all missing combinations in one pass. Measure after each wave.');
  lines.push('');
  return lines.join('\n');
}

function buildReport() {
  const roles = readRoles();
  const coverage = exactMatrixCoverage(roles);
  const simulation = simulateFallbacks(roles);
  const duplicates = duplicateAudit(roles);
  const classification = classifyKeys(roles);
  const reasoning = reasoningFieldAudit(roles, coverage.exact);

  return {
    roles,
    totalRoleKeys: Object.keys(roles).length,
    exactTarget: MBTI_TYPES.length * DISC_TYPES.length * BIG_FIVE_TRAITS.length,
    exactCount: coverage.exact.length,
    missingExactCount: coverage.missing.length,
    missingExactCombos: coverage.missing,
    byMbti: [...coverage.byMbti.entries()],
    byDisc: [...coverage.byDisc.entries()],
    byTrait: [...coverage.byTrait.entries()],
    totalSimulatedStates: simulation.outcomes.length,
    tierCounts: sortEntriesDesc(simulation.tierCounts),
    topUsedKeys: sortEntriesDesc(simulation.keyUse),
    topUsedTitles: sortEntriesDesc(simulation.roleTitleUse),
    priorityMissingCombos: sortEntriesDesc(simulation.missingExactPressure),
    duplicateTitles: duplicates.duplicateTitles.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])),
    duplicateDescriptions: duplicates.duplicateDescriptions.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])),
    salaryIssues: duplicates.salaryIssues,
    thinDescriptions: duplicates.thinDescriptions,
    classification,
    reasoning,
    reasoningCompleteExactCount: reasoning.completeExact.length,
  };
}

function parseArgs(argv) {
  const args = { markdown: null, json: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--markdown') args.markdown = argv[++index];
    else if (arg === '--json') args.json = argv[++index];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/audit-results-coverage.mjs [--markdown docs/results-coverage-baseline.md] [--json tmp/results-coverage.json]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const report = buildReport();
console.log(renderConsole(report));

if (args.markdown) {
  const outputPath = path.resolve(projectRoot, args.markdown);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, renderMarkdown(report));
  console.log(`\nWrote markdown report: ${outputPath}`);
}

if (args.json) {
  const outputPath = path.resolve(projectRoot, args.json);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const serializable = { ...report, roles: undefined };
  fs.writeFileSync(outputPath, JSON.stringify(serializable, null, 2));
  console.log(`Wrote JSON report: ${outputPath}`);
}
