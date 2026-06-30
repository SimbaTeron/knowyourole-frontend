#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const AXES = [
  { key: 'EI', left: 'E', right: 'I', label: 'Extraversion / Introversion' },
  { key: 'SN', left: 'S', right: 'N', label: 'Sensing / Intuition' },
  { key: 'TF', left: 'T', right: 'F', label: 'Thinking / Feeling' },
  { key: 'JP', left: 'J', right: 'P', label: 'Judging / Perceiving' },
];

const DISC_LABELS = { D: 'Dominant', I: 'Influential', S: 'Steady', C: 'Conscientious' };
const BIG_FIVE_LABELS = { O: 'Openness', C: 'Follow-through', E: 'Extraversion', A: 'Agreeableness', N: 'Stress Reactivity' };

const personas = [
  {
    name: 'Strategic Systems Architect',
    mbti: { E: 2, I: 11, S: 2, N: 12, T: 12, F: 2, J: 10, P: 3 },
    disc: { D: 4, I: 1, S: 2, C: 9 },
    bigFive: { O: 86, C: 78, E: 24, A: 48, N: 34 },
    expected: { mbti: ['INTJ'], disc: ['C'], bigFiveTop: ['O', 'C'], minimumRating: 9 },
  },
  {
    name: 'Warm Team Connector',
    mbti: { E: 10, I: 3, S: 5, N: 8, T: 2, F: 12, J: 8, P: 5 },
    disc: { D: 1, I: 6, S: 8, C: 2 },
    bigFive: { O: 62, C: 66, E: 80, A: 91, N: 36 },
    expected: { mbti: ['ENFJ', 'ESFJ'], disc: ['S', 'I'], bigFiveTop: ['A', 'E'], minimumRating: 8.5 },
  },
  {
    name: 'Creative Explorer',
    mbti: { E: 9, I: 4, S: 3, N: 11, T: 8, F: 6, J: 3, P: 11 },
    disc: { D: 3, I: 9, S: 2, C: 3 },
    bigFive: { O: 94, C: 37, E: 78, A: 64, N: 45 },
    expected: { mbti: ['ENTP', 'ENFP'], disc: ['I'], bigFiveTop: ['O'], minimumRating: 8.5 },
  },
  {
    name: 'Methodical Support Specialist',
    mbti: { E: 2, I: 10, S: 11, N: 3, T: 8, F: 6, J: 11, P: 2 },
    disc: { D: 1, I: 2, S: 6, C: 8 },
    bigFive: { O: 32, C: 88, E: 28, A: 74, N: 41 },
    expected: { mbti: ['ISTJ', 'ISFJ'], disc: ['C', 'S'], bigFiveTop: ['C', 'A'], minimumRating: 8 },
  },
  {
    name: 'Hands-on Fast Operator',
    mbti: { E: 10, I: 3, S: 8, N: 7, T: 10, F: 4, J: 5, P: 9 },
    disc: { D: 9, I: 5, S: 1, C: 2 },
    bigFive: { O: 76, C: 55, E: 84, A: 38, N: 35 },
    expected: { mbti: ['ESTP', 'ENTP'], disc: ['D'], bigFiveTop: ['E', 'O'], minimumRating: 7.5 },
  },
];

function mbtiType(mbti) {
  return `${mbti.E >= mbti.I ? 'E' : 'I'}${mbti.S >= mbti.N ? 'S' : 'N'}${mbti.T >= mbti.F ? 'T' : 'F'}${mbti.J >= mbti.P ? 'J' : 'P'}`;
}

function axisConfidence(mbti) {
  return AXES.map((axis) => {
    const leftScore = mbti[axis.left] ?? 0;
    const rightScore = mbti[axis.right] ?? 0;
    const total = Math.max(1, Math.abs(leftScore) + Math.abs(rightScore));
    const dominant = leftScore >= rightScore ? axis.left : axis.right;
    const dominantScore = dominant === axis.left ? leftScore : rightScore;
    const leadPct = Math.round((Math.abs(dominantScore) / total) * 100);
    const confidenceLabel = leadPct >= 75 ? 'strong' : leadPct >= 64 ? 'clear' : leadPct >= 58 ? 'directional' : 'close-call';
    return { ...axis, dominant, leadPct, confidenceLabel, isCloseCall: confidenceLabel === 'close-call' };
  });
}

function primaryDisc(disc) {
  return Object.entries(disc).sort((a, b) => b[1] - a[1])[0][0];
}

function topBigFive(bigFive) {
  return Object.entries(bigFive).sort((a, b) => b[1] - a[1])[0][0];
}

function confidenceLabel(score) {
  if (score >= 78) return 'Strong pattern';
  if (score >= 64) return 'Clear pattern';
  if (score >= 52) return 'Directional pattern';
  return 'Close-call pattern';
}

function scorePersona(persona) {
  const actualMbti = mbtiType(persona.mbti);
  const actualDisc = primaryDisc(persona.disc);
  const actualBigFiveTop = topBigFive(persona.bigFive);
  const mbtiAxes = axisConfidence(persona.mbti);
  const closeCallDimensions = mbtiAxes.filter((axis) => axis.isCloseCall).map((axis) => axis.key);
  const mbtiAxisConfidence = Math.round(mbtiAxes.reduce((sum, axis) => sum + (axis.leadPct >= 75 ? 88 : axis.leadPct >= 64 ? 72 : axis.leadPct >= 58 ? 58 : 42), 0) / mbtiAxes.length);
  const hits = [
    persona.expected.mbti.includes(actualMbti),
    persona.expected.disc.includes(actualDisc),
    persona.expected.bigFiveTop.includes(actualBigFiveTop),
  ].filter(Boolean).length;
  const closeCallPenalty = closeCallDimensions.length * 0.25;
  const rating = Math.max(1, Math.min(10, Number((6.5 + hits * 1.15 - closeCallPenalty).toFixed(1))));
  return {
    name: persona.name,
    actualMbti,
    actualDisc,
    actualDiscLabel: DISC_LABELS[actualDisc],
    actualBigFiveTop,
    actualBigFiveLabel: BIG_FIVE_LABELS[actualBigFiveTop],
    mbtiAxisConfidence,
    confidenceLabel: confidenceLabel(mbtiAxisConfidence),
    closeCallDimensions,
    rating,
    pass: rating >= persona.expected.minimumRating && hits >= 2,
  };
}

function renderMarkdown(results) {
  const lines = [];
  lines.push('# KnowYouRole Phase 1 Persona Validity Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Personas tested: **${results.length}**`);
  lines.push(`- Passing personas: **${results.filter((r) => r.pass).length} / ${results.length}**`);
  lines.push(`- Average validity rating: **${(results.reduce((sum, r) => sum + r.rating, 0) / results.length).toFixed(1)} / 10**`);
  lines.push('');
  lines.push('## Persona results');
  lines.push('');
  for (const result of results) {
    lines.push(`- **${result.name}**`);
    lines.push(`  - Actual: ${result.actualMbti} + ${result.actualDisc} ${result.actualDiscLabel} + ${result.actualBigFiveLabel}`);
    lines.push(`  - Validity: ${result.rating}/10 · ${result.confidenceLabel} · ${result.mbtiAxisConfidence}% MBTI axis confidence`);
    lines.push(`  - closeCallDimensions: ${result.closeCallDimensions.length ? result.closeCallDimensions.join(', ') : 'none'}`);
    lines.push(`  - Status: ${result.pass ? 'pass' : 'review'}`);
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const markdownIndex = process.argv.indexOf('--markdown');
  const markdownPath = markdownIndex >= 0 ? process.argv[markdownIndex + 1] : null;
  const results = personas.map(scorePersona);
  const markdown = renderMarkdown(results);
  if (markdownPath) fs.writeFileSync(path.resolve(projectRoot, markdownPath), `${markdown}\n`);
  console.log(markdown);
  if (results.some((result) => !result.pass)) process.exitCode = 1;
}

main();
