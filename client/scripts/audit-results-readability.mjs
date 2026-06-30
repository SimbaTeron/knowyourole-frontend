#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const rolesPath = path.join(projectRoot, 'src', 'data', 'roles.json');

const EXACT_KEY = /^(intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)-[disc]-[oceans]-high$/i;
const REQUIRED_FIELDS = ['whyThisFits', 'starterPath', 'mayNotFit'];
const HARD_LABELS = /\b(Neuroticism|Dominance|Steadiness|DISC Conscientiousness|Inspiring Influencer|Careful Analyst|Steady Supporter|stakeholder|operating cadence|disconfirming|strategic diagnosis|human capital|synergy)\b/i;
const BOILERPLATE = /\b(your style matches the work|Your pattern combines|which can help you|Start small, not senior|The work can still fit you|setting may drain you|This may feel wrong)\b/i;
const ACTION_CONTEXT = /\b(proof project|small project|short project|short trial|shadow|portfolio|case study|report|prototype|pitch|event|conversation|supervised|normal day|normal week)\b/i;

const FIELD_LIMITS = {
  whyThisFits: { min: 35, max: 70, maxFirstSentence: 14 },
  starterPath: { min: 18, max: 36, maxFirstSentence: 8 },
  mayNotFit: { min: 24, max: 48, maxFirstSentence: 12 },
};

function readRoles() {
  const parsed = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
  return parsed.roles || {};
}

function splitSentences(text) {
  return text.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
}

function sentenceCount(text) {
  return splitSentences(text).length;
}

function words(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function firstSentence(text) {
  return splitSentences(text)[0] || text;
}

function averageWordLength(text) {
  const list = words(text);
  if (!list.length) return 0;
  return list.reduce((sum, word) => sum + word.replace(/[^a-z]/gi, '').length, 0) / list.length;
}

function averageSentenceLength(text) {
  const sentences = splitSentences(text);
  if (!sentences.length) return 0;
  return words(text).length / sentences.length;
}

function isReadableFirstSentence(text, maxWords) {
  const first = firstSentence(text);
  return words(first).length <= maxWords && averageWordLength(first) <= 6.2;
}

function hasPlainRoleDescriptions(entry) {
  const descriptions = [entry?.primary?.desc, entry?.secondary?.desc].filter(Boolean);
  return descriptions.every((desc) => words(desc).length <= 10 && averageWordLength(desc) <= 6.8);
}

function auditEntry(key, entry) {
  const issues = [];
  for (const field of REQUIRED_FIELDS) {
    const value = entry?.[field];
    const limits = FIELD_LIMITS[field];
    if (!value || typeof value !== 'string') {
      issues.push(`${field}: missing`);
      continue;
    }
    const wordCount = words(value).length;
    if (sentenceCount(value) > 3) issues.push(`${field}: too many sentences`);
    if (wordCount < limits.min) issues.push(`${field}: too thin (${wordCount} words)`);
    if (wordCount > limits.max) issues.push(`${field}: too verbose (${wordCount} words)`);
    if (!isReadableFirstSentence(value, limits.maxFirstSentence)) issues.push(`${field}: first sentence too dense`);
    if (averageSentenceLength(value) > 22) issues.push(`${field}: average sentence too long`);
    if (HARD_LABELS.test(value)) issues.push(`${field}: uses hard/formal wording`);
    if (BOILERPLATE.test(value)) issues.push(`${field}: old boilerplate phrase remains`);
  }
  const combined = REQUIRED_FIELDS.map((field) => entry?.[field] || '').join(' ');
  if (!ACTION_CONTEXT.test(combined)) issues.push('missing concrete action/testing context');
  if (!hasPlainRoleDescriptions(entry)) issues.push('primary/secondary descriptions too dense');
  return { key, issues };
}

function statsFor(entries, field) {
  const counts = entries.map(([, entry]) => words(entry[field] || '').length);
  if (!counts.length) return { avg: '0.0', min: 0, max: 0 };
  return {
    avg: (counts.reduce((sum, n) => sum + n, 0) / counts.length).toFixed(1),
    min: Math.min(...counts),
    max: Math.max(...counts),
  };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# KnowYouRole Results Readability Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Plain-English rules checked');
  lines.push('');
  lines.push('- Every role entry has `whyThisFits`, `starterPath`, and `mayNotFit`.');
  lines.push('- Guidance is concise but still useful: short first sentence, no more than 3 sentences per field.');
  lines.push('- Copy avoids old boilerplate and heavy terms like `stakeholder`, `operating cadence`, and `strategic diagnosis`.');
  lines.push('- Guidance includes a concrete test action such as a proof project, short trial, shadowing, report, prototype, or case study.');
  lines.push('- Primary and secondary role descriptions stay short enough for card-style result surfaces.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total role entries audited: **${report.totalRoles}**`);
  lines.push(`- Exact MBTI × DISC × Big Five entries audited: **${report.totalExact}**`);
  lines.push(`- Entries passing: **${report.passing} / ${report.totalRoles} (${report.passRate})**`);
  lines.push(`- Entries with issues: **${report.failing.length}**`);
  lines.push(`- Entries with all guidance fields: **${report.withGuidance} / ${report.totalRoles}**`);
  lines.push('');
  lines.push('## Word-count ranges');
  lines.push('');
  for (const field of REQUIRED_FIELDS) {
    const stat = report.fieldStats[field];
    lines.push(`- ${field}: avg **${stat.avg}**, min **${stat.min}**, max **${stat.max}** words`);
  }
  lines.push('');
  lines.push('## Issue examples');
  lines.push('');
  if (!report.failing.length) {
    lines.push('- None');
  } else {
    for (const item of report.failing.slice(0, 60)) {
      lines.push(`- **${item.key}:** ${item.issues.join('; ')}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const markdownIndex = process.argv.indexOf('--markdown');
  const markdownPath = markdownIndex >= 0 ? process.argv[markdownIndex + 1] : null;
  const roles = readRoles();
  const entries = Object.entries(roles);
  const exactEntries = entries.filter(([key]) => EXACT_KEY.test(key));
  const failing = entries.map(([key, entry]) => auditEntry(key, entry)).filter((item) => item.issues.length);
  const passing = entries.length - failing.length;
  const withGuidance = entries.filter(([, entry]) => REQUIRED_FIELDS.every((field) => typeof entry?.[field] === 'string' && entry[field].trim())).length;
  const fieldStats = Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, statsFor(entries, field)]));
  const report = {
    totalRoles: entries.length,
    totalExact: exactEntries.length,
    passing,
    passRate: entries.length ? `${((passing / entries.length) * 100).toFixed(1)}%` : '0.0%',
    failing,
    withGuidance,
    fieldStats,
  };
  const markdown = renderMarkdown(report);
  if (markdownPath) fs.writeFileSync(path.resolve(projectRoot, markdownPath), markdown + '\n');
  console.log(markdown);
  if (failing.length) process.exitCode = 1;
}

main();
