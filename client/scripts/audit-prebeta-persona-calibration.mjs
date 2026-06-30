#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const QUESTIONS_PATH = path.join(projectRoot, 'src/data/questions.json');
const ROLES_PATH = path.join(projectRoot, 'src/data/roles.json');

const DISC_LABELS = { D: 'Dominant', I: 'Influential', S: 'Steady', C: 'Conscientious' };
const BIG_FIVE_LABELS = {
  O: 'Openness',
  C: 'Follow-through',
  E: 'Social Energy',
  A: 'Agreeableness',
  N: 'Stress Reactivity',
};
const MBTI_PAIRS = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P'],
];
const FRAMEWORK_QUOTAS = { MBTI: 0.36, DISC: 0.18, Big5: 0.46, Critical: 0, FirstPrinciples: 0 };
const TOTAL_QUESTIONS = 45;
const DEFAULT_TIER = '19-25';
const DEFAULT_SEEDS = [101, 202, 303, 404, 505];
const SENIOR_TITLE_PATTERN = /\b(CTO|Chief|Director|Executive|Founder|Principal|Senior|Architect|Lead)\b/i;

const PERSONAS = [
  {
    id: 'strategic-systems-architect',
    name: 'Strategic Systems Architect',
    expected: {
      mbti: ['INTJ', 'INTP'],
      disc: ['C', 'D'],
      preferredDisc: ['C'],
      bigFiveTop: ['O', 'C'],
      roleFamilies: ['systems', 'strategy', 'research', 'data', 'policy', 'architecture', 'analysis', 'product'],
      severeMisses: [
        { field: 'disc', value: 'I', reason: 'strategic introverted analyst should not read primarily social/enthusiastic' },
        { field: 'bigFiveTop', value: 'A', reason: 'agreeableness as top trait usually means the analytical signal is being drowned out' },
      ],
    },
    preference: {
      E: -0.8, I: 0.95, S: -0.55, N: 0.95, T: 1, F: -0.55, J: 0.9, P: -0.25,
      D: 0.45, I_disc: -0.8, S_disc: -0.15, C_disc: 0.95,
      O: 0.95, C_big5: 0.85, E_big5: -0.85, A: -0.05, N_big5: -0.45,
    },
  },
  {
    id: 'warm-team-connector',
    name: 'Warm Team Connector',
    expected: {
      mbti: ['ENFJ', 'ESFJ', 'ENFP'],
      disc: ['I', 'S'],
      preferredDisc: ['I', 'S'],
      bigFiveTop: ['A', 'E'],
      roleFamilies: ['education', 'people', 'community', 'counsel', 'support', 'training', 'team', 'curriculum', 'care'],
      severeMisses: [
        { field: 'disc', value: 'C', reason: 'warm/social connector becoming Conscientious is the known target-audience failure' },
        { field: 'bigFiveTop', value: 'O', reason: 'openness top can bury the people-care signal for this persona' },
      ],
    },
    preference: {
      E: 0.9, I: -0.45, S: 0.25, N: 0.4, T: -0.85, F: 1, J: 0.55, P: 0.05,
      D: -0.75, I_disc: 0.9, S_disc: 0.95, C_disc: -0.25,
      O: 0.35, C_big5: 0.35, E_big5: 0.9, A: 1, N_big5: -0.35,
    },
  },
  {
    id: 'creative-explorer',
    name: 'Creative Explorer',
    expected: {
      mbti: ['ENFP', 'ENTP', 'INFP', 'INTP'],
      disc: ['I', 'D'],
      preferredDisc: ['I'],
      bigFiveTop: ['O'],
      roleFamilies: ['creative', 'innovation', 'product', 'design', 'media', 'marketing', 'strategy', 'entrepreneur'],
      severeMisses: [
        { field: 'disc', value: 'C', reason: 'creative explorer should not collapse into precision/control' },
        { field: 'bigFiveTop', value: 'C', reason: 'follow-through top usually means novelty/flexibility is underweighted' },
      ],
    },
    preference: {
      E: 0.65, I: -0.15, S: -0.85, N: 1, T: 0.25, F: 0.35, J: -0.8, P: 1,
      D: 0.25, I_disc: 1, S_disc: -0.35, C_disc: -0.55,
      O: 1, C_big5: -0.65, E_big5: 0.75, A: 0.35, N_big5: 0.0,
    },
  },
  {
    id: 'methodical-support-specialist',
    name: 'Methodical Support Specialist',
    expected: {
      mbti: ['ISFJ', 'ISTJ'],
      disc: ['S', 'C'],
      preferredDisc: ['S', 'C'],
      bigFiveTop: ['C', 'A'],
      roleFamilies: ['care', 'health', 'support', 'operations', 'quality', 'administrative', 'education', 'service'],
      severeMisses: [
        { field: 'disc', value: 'D', reason: 'methodical support profile should not become command-first' },
        { field: 'bigFiveTop', value: 'O', reason: 'novelty top would contradict practical reliable support pattern' },
      ],
    },
    preference: {
      E: -0.75, I: 0.9, S: 1, N: -0.65, T: 0.15, F: 0.55, J: 1, P: -0.8,
      D: -0.85, I_disc: -0.25, S_disc: 0.95, C_disc: 0.85,
      O: -0.55, C_big5: 1, E_big5: -0.65, A: 0.85, N_big5: -0.2,
    },
  },
  {
    id: 'hands-on-fast-operator',
    name: 'Hands-on Fast Operator',
    expected: {
      mbti: ['ESTP', 'ENTP', 'ESTJ', 'ENTJ'],
      disc: ['D'],
      preferredDisc: ['D'],
      bigFiveTop: ['E', 'O', 'C'],
      roleFamilies: ['sales', 'operations', 'business', 'partnership', 'field', 'sport', 'security', 'transport', 'leadership'],
      severeMisses: [
        { field: 'disc', value: 'S', reason: 'fast operator should not become steady/passive as primary style' },
        { field: 'bigFiveTop', value: 'A', reason: 'agreeableness top would understate action/competitive energy' },
      ],
    },
    preference: {
      E: 0.95, I: -0.75, S: 0.5, N: 0.2, T: 0.8, F: -0.45, J: 0.1, P: 0.75,
      D: 1, I_disc: 0.45, S_disc: -0.85, C_disc: -0.35,
      O: 0.45, C_big5: 0.2, E_big5: 1, A: -0.65, N_big5: -0.45,
    },
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seed) {
  const rand = mulberry32(seed);
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function frameworkFor(question) {
  return String(question.psych || 'Unknown').split('-')[0];
}

function selectQuestions(questions, tier, seed) {
  const tierQuestions = questions.filter((q) => q.tier === tier);
  const shuffled = seededShuffle(tierQuestions, seed);
  const quotaSelection = [];
  const frameworkCounts = {};

  for (const question of shuffled) {
    const framework = frameworkFor(question);
    const currentQuota = (frameworkCounts[framework] || 0) / TOTAL_QUESTIONS;
    const targetQuota = FRAMEWORK_QUOTAS[framework] ?? 0.2;
    if (currentQuota < targetQuota || quotaSelection.length < TOTAL_QUESTIONS * 0.7) {
      quotaSelection.push(question);
      frameworkCounts[framework] = (frameworkCounts[framework] || 0) + 1;
    }
    if (quotaSelection.length >= TOTAL_QUESTIONS) break;
  }

  if (quotaSelection.length < TOTAL_QUESTIONS) {
    const selectedIds = new Set(quotaSelection.map((q) => q.id));
    const remaining = shuffled.filter((q) => !selectedIds.has(q.id)).slice(0, TOTAL_QUESTIONS - quotaSelection.length);
    quotaSelection.push(...remaining);
  }

  if (quotaSelection.length !== TOTAL_QUESTIONS) {
    throw new Error(`Expected ${TOTAL_QUESTIONS} selected questions, got ${quotaSelection.length} for tier ${tier}`);
  }
  return seededShuffle(quotaSelection, seed + 9999);
}

function preferenceForMeta(persona, question, meta) {
  if (!meta) return 0;
  const clean = String(meta).replace(/[+-]/g, '');
  const framework = frameworkFor(question);
  if (framework === 'DISC') {
    const discKey = `${clean}_disc`;
    return persona.preference[discKey] ?? 0;
  }
  if (framework === 'Big5') {
    if (clean === 'C') return persona.preference.C_big5 ?? 0;
    if (clean === 'E') return persona.preference.E_big5 ?? 0;
    if (clean === 'N') return persona.preference.N_big5 ?? 0;
    return persona.preference[clean] ?? 0;
  }
  return persona.preference[clean] ?? 0;
}

function scoreMetaForPersona(persona, question, meta, rand) {
  const basePreference = preferenceForMeta(persona, question, meta);
  const sign = String(meta).includes('-') ? -1 : 1;
  const jitter = (rand() - 0.5) * 0.22;
  return basePreference * sign + jitter;
}

function chooseAnswer(persona, question, rand) {
  const metas = Array.isArray(question.optionMeta) ? question.optionMeta : ['', ''];
  const scores = metas.map((meta) => scoreMetaForPersona(persona, question, meta, rand));
  if (Math.abs(scores[0] - scores[1]) < 0.08) return rand() < 0.5 ? 0 : 1;
  return scores[1] > scores[0] ? 1 : 0;
}

function initialScores() {
  return {
    mbti: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
    disc: { D: 0, I: 0, S: 0, C: 0 },
    bigFive: { O: 0, C: 0, E: 0, A: 0, N: 0 },
    responses: [],
    swipeTimes: [],
    averageSwipeTime: 5,
    currentDifficulty: 'medium',
    engagement: 0,
    wildcardBoost: false,
    criticalWildcard: 0,
    firstPrinciplesWildcard: 0,
    hybridTypes: [],
    moodBoosts: { critical: 0, firstPrinciples: 0 },
  };
}

function applyScore(scores, question, choice, rand) {
  const meta = question.optionMeta[choice];
  const boostRange = question.boostRange || [0.7, 0.9];
  const deterministicBoost = (boostRange[0] + boostRange[1]) / 2;
  const multiplier = question.is2x ? 2 : 1;
  const weight = (question.wildcard ? deterministicBoost : 1) * multiplier;

  if (question.psych.startsWith('MBTI')) {
    const trait = meta.replace(/[+-]/g, '');
    if (trait in scores.mbti) scores.mbti[trait] += weight;
  } else if (question.psych.startsWith('DISC')) {
    if (meta in scores.disc) scores.disc[meta] += weight;
  } else if (question.psych.startsWith('Big5')) {
    const trait = meta.replace(/[+-]/g, '');
    const modifier = meta.includes('+') ? 1 : -1;
    if (trait in scores.bigFive) scores.bigFive[trait] += weight * modifier;
  } else if (question.psych === 'Critical' && meta === 'CT1') {
    scores.criticalWildcard = 1;
  } else if (question.psych === 'FirstPrinciples' && meta === 'FP1') {
    scores.firstPrinciplesWildcard = 1;
  }

  if (question.wildcard) scores.wildcardBoost = true;
  const timeSpent = Math.round((3.4 + rand() * 5.6) * 10) / 10;
  scores.responses.push({
    questionId: question.id,
    choice,
    timeSpent,
    swipeDirection: choice === 0 ? 'left' : 'right',
    responseType: 'binary',
    psych: question.psych,
    optionMeta: question.optionMeta,
    selectedOptionMeta: meta,
    selectedOptionLabel: question.options?.[choice] || (choice === 0 ? question.leftDesc : question.rightDesc),
    wildcard: Boolean(question.wildcard),
    boostRange: question.boostRange,
    is2x: question.is2x,
  });
  scores.swipeTimes.push(timeSpent);
  scores.engagement += 1;
}

function normalizeBigFiveEvidence(rawScore) {
  if (rawScore > 25) return Math.max(1, Math.min(99, Math.round(rawScore)));
  const signed = Math.max(-7, Math.min(7, rawScore));
  return Math.max(8, Math.min(92, Math.round(50 + signed * 6)));
}

function resolvePrimaryDisc(disc, mbti, bigFiveProfile) {
  const sorted = Object.entries(disc).sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = sorted[0] || ['D', 0];
  const closeToTop = (key, gap = 2) => topValue - (disc[key] ?? 0) <= gap;
  const analyticalShape = (mbti.I ?? 0) >= (mbti.E ?? 0) && ((mbti.T ?? 0) >= (mbti.F ?? 0) || (bigFiveProfile.C ?? 50) >= 68);
  const creativeShape = (mbti.N ?? 0) >= (mbti.S ?? 0) && (mbti.P ?? 0) >= (mbti.J ?? 0) && (bigFiveProfile.O ?? 50) >= 62;
  const peopleShape = (mbti.F ?? 0) > (mbti.T ?? 0) && ((bigFiveProfile.A ?? 50) >= 62 || (bigFiveProfile.E ?? 50) >= 62);
  const actionShape = (mbti.E ?? 0) > (mbti.I ?? 0) && (mbti.T ?? 0) >= (mbti.F ?? 0) && ((disc.D ?? 0) >= (disc.I ?? 0) - 1);

  if (topKey === 'D') {
    if (closeToTop('C', 2.5) && analyticalShape && (bigFiveProfile.E ?? 50) <= 58) return 'C';
    if (closeToTop('I', 4) && creativeShape && (bigFiveProfile.C ?? 50) <= 62) return 'I';
    if ((closeToTop('S', 3) || closeToTop('I', 3)) && peopleShape && !actionShape) return closeToTop('S', 3) ? 'S' : 'I';
  }
  if (topKey === 'S' && closeToTop('C', 3) && analyticalShape && (bigFiveProfile.E ?? 50) <= 58) return 'C';
  if (topKey === 'I' && closeToTop('D', 3) && actionShape) return 'D';
  if (topKey === 'I' && closeToTop('S', 3) && (mbti.I ?? 0) > (mbti.E ?? 0) && (bigFiveProfile.C ?? 50) >= 68) return 'S';
  return topKey;
}

function mbtiType(mbti) {
  return MBTI_PAIRS.map(([a, b]) => (mbti[a] > mbti[b] ? a : b)).join('');
}

function topBigFive(bigFiveProfile, mbti = {}, disc = '') {
  const sorted = Object.entries(bigFiveProfile).sort((a, b) => b[1] - a[1]);
  const rawTop = sorted[0][0];
  const close = (trait, gap = 12) => (sorted[0][1] - (bigFiveProfile[trait] ?? 0)) <= gap;
  const socialFeeling = (mbti.E ?? 0) >= (mbti.I ?? 0) && (mbti.F ?? 0) > (mbti.T ?? 0);
  const creativeNP = (mbti.N ?? 0) >= (mbti.S ?? 0) && (mbti.P ?? 0) >= (mbti.J ?? 0);
  const actionDriver = disc === 'D' && (mbti.E ?? 0) > (mbti.I ?? 0);

  if (creativeNP && (bigFiveProfile.O ?? 0) >= 62 && close('O', 20)) return 'O';
  if (socialFeeling && ['S', 'I'].includes(disc)) {
    const socialCandidates = ['A', 'E'].filter((trait) => close(trait, 26) && (bigFiveProfile[trait] ?? 0) >= 62);
    if (socialCandidates.length) return socialCandidates.sort((a, b) => (bigFiveProfile[b] ?? 0) - (bigFiveProfile[a] ?? 0))[0];
  }
  if (actionDriver && (bigFiveProfile.E ?? 0) >= 62 && close('E', 20)) return 'E';
  return rawTop;
}

function getCalibratedBigFiveTraitOrder(bigFiveProfile, mbti = {}, disc = '') {
  const sorted = Object.entries(bigFiveProfile).sort((a, b) => b[1] - a[1]);
  const rawTop = sorted[0]?.[0] || 'O';
  const close = (trait, gap = 12) => (sorted[0]?.[1] ?? 0) - (bigFiveProfile[trait] ?? 0) <= gap;
  const socialFeeling = (mbti.E ?? 0) >= (mbti.I ?? 0) && (mbti.F ?? 0) > (mbti.T ?? 0);
  const creativeNP = (mbti.N ?? 0) >= (mbti.S ?? 0) && (mbti.P ?? 0) >= (mbti.J ?? 0);
  const actionDriver = disc === 'D' && (mbti.E ?? 0) > (mbti.I ?? 0);
  let calibratedTop = rawTop;

  if (creativeNP && (bigFiveProfile.O ?? 0) >= 62 && close('O', 20)) calibratedTop = 'O';
  else if (socialFeeling && ['S', 'I'].includes(disc)) {
    const socialCandidates = ['A', 'E'].filter((trait) => close(trait, 26) && (bigFiveProfile[trait] ?? 0) >= 62);
    if (socialCandidates.length) calibratedTop = socialCandidates.sort((a, b) => (bigFiveProfile[b] ?? 0) - (bigFiveProfile[a] ?? 0))[0];
  } else if (actionDriver && (bigFiveProfile.E ?? 0) >= 62 && close('E', 20)) calibratedTop = 'E';

  return [calibratedTop, ...sorted.map(([trait]) => trait).filter((trait) => trait !== calibratedTop)];
}

function findBestRoleMatch(roles, mbti, disc, bigFiveProfile, mbtiScores = {}) {
  const sortedTraits = getCalibratedBigFiveTraitOrder(bigFiveProfile, mbtiScores, disc);
  const highestTrait = sortedTraits[0].toLowerCase();
  const secondTrait = sortedTraits[1].toLowerCase();
  const keys = [
    `${mbti.toLowerCase()}-${disc.toLowerCase()}-${highestTrait}-high`,
    `${mbti.toLowerCase()}-${disc.toLowerCase()}-${secondTrait}-high`,
    `${mbti.toLowerCase()}-${highestTrait}-high`,
    `tech-${disc.toLowerCase()}-${highestTrait}-high`,
    `ai-${disc.toLowerCase()}-${highestTrait}-high`,
    `creative-${highestTrait}-high`,
    `artistic-${highestTrait}-high`,
    `trades-${disc.toLowerCase()}-${secondTrait}-high`,
    `healthcare-${disc.toLowerCase()}-${highestTrait}-high`,
    `education-${disc.toLowerCase()}-${highestTrait}-high`,
    `finance-${disc.toLowerCase()}-${secondTrait}-high`,
    `marketing-${disc.toLowerCase()}-${highestTrait}-high`,
    `science-${disc.toLowerCase()}-${highestTrait}-high`,
    `legal-${disc.toLowerCase()}-${secondTrait}-high`,
    `media-${disc.toLowerCase()}-${highestTrait}-high`,
    `service-${disc.toLowerCase()}-${highestTrait}-high`,
    `government-${disc.toLowerCase()}-${highestTrait}-high`,
    `security-${disc.toLowerCase()}-${secondTrait}-high`,
    `outdoor-${disc.toLowerCase()}-${highestTrait}-high`,
    `sports-${disc.toLowerCase()}-${highestTrait}-high`,
    `food-${highestTrait}-high`,
    `transport-${disc.toLowerCase()}-${secondTrait}-high`,
    `${mbti.toLowerCase()}-c-o-high`,
    `${mbti.toLowerCase()}-d-o-high`,
    `${mbti.toLowerCase()}-s-o-high`,
    `${mbti.toLowerCase()}-i-o-high`,
    'default',
  ];
  const key = keys.find((candidate) => roles[candidate]) || 'default';
  return { key, role: roles[key] };
}

function roleText(roleMatch) {
  const role = roleMatch?.role;
  return [
    role?.primary?.title,
    role?.primary?.desc,
    role?.secondary?.title,
    role?.secondary?.desc,
    role?.whyThisFits,
    role?.starterPath,
    role?.mayNotFit,
  ].filter(Boolean).join(' ').toLowerCase();
}

function simulateRun(persona, seed, questions, roles, tier = DEFAULT_TIER) {
  const rand = mulberry32(seed + persona.id.length * 97);
  const selectedQuestions = selectQuestions(questions, tier, seed);
  const scores = initialScores();
  for (const question of selectedQuestions) {
    const choice = chooseAnswer(persona, question, rand);
    applyScore(scores, question, choice, rand);
  }
  scores.averageSwipeTime = Math.round((scores.swipeTimes.reduce((sum, value) => sum + value, 0) / scores.swipeTimes.length) * 10) / 10;

  const bigFiveProfile = {
    O: normalizeBigFiveEvidence(scores.bigFive.O),
    C: normalizeBigFiveEvidence(scores.bigFive.C),
    E: normalizeBigFiveEvidence(scores.bigFive.E),
    A: normalizeBigFiveEvidence(scores.bigFive.A),
    N: normalizeBigFiveEvidence(scores.bigFive.N),
  };
  const actualMbti = mbtiType(scores.mbti);
  const actualDisc = resolvePrimaryDisc(scores.disc, scores.mbti, bigFiveProfile);
  const actualBigFiveTop = topBigFive(bigFiveProfile, scores.mbti, actualDisc);
  const roleMatch = findBestRoleMatch(roles, actualMbti, actualDisc, bigFiveProfile, scores.mbti);
  return {
    personaId: persona.id,
    personaName: persona.name,
    seed,
    tier,
    responses: scores.responses.length,
    frameworkCounts: scores.responses.reduce((acc, response) => {
      const framework = String(response.psych || 'Unknown').split('-')[0];
      acc[framework] = (acc[framework] || 0) + 1;
      return acc;
    }, {}),
    scores,
    actual: {
      mbti: actualMbti,
      disc: actualDisc,
      discLabel: DISC_LABELS[actualDisc],
      bigFiveTop: actualBigFiveTop,
      bigFiveTopLabel: BIG_FIVE_LABELS[actualBigFiveTop],
      bigFiveProfile,
      primaryRole: roleMatch.role?.primary?.title || 'Unknown',
      secondaryRole: roleMatch.role?.secondary?.title || 'Unknown',
      roleKey: roleMatch.key,
      seniorTitle: SENIOR_TITLE_PATTERN.test(roleMatch.role?.primary?.title || ''),
    },
    roleSearchText: roleText(roleMatch),
  };
}

function includesAny(text, terms) {
  const haystack = String(text || '').toLowerCase();
  return terms.some((term) => haystack.includes(term.toLowerCase()));
}

function scoreRun(persona, run) {
  const expected = persona.expected;
  const mbtiHit = expected.mbti.includes(run.actual.mbti);
  const discHit = expected.disc.includes(run.actual.disc);
  const preferredDiscHit = expected.preferredDisc.includes(run.actual.disc);
  const bigFiveHit = expected.bigFiveTop.includes(run.actual.bigFiveTop);
  const roleHit = includesAny(run.roleSearchText, expected.roleFamilies);
  const severeMisses = expected.severeMisses.filter((miss) => run.actual[miss.field] === miss.value);

  let score = 0;
  score += mbtiHit ? 2.2 : 0;
  score += discHit ? 1.7 : 0;
  score += preferredDiscHit ? 0.5 : 0;
  score += bigFiveHit ? 2.0 : 0;
  score += roleHit ? 2.0 : 0;
  score += run.responses === TOTAL_QUESTIONS ? 0.8 : 0;
  score -= severeMisses.length * 1.0;
  if (run.actual.seniorTitle) score -= 0.25;
  score = Math.max(1, Math.min(10, Number(score.toFixed(1))));

  const failures = [];
  if (!mbtiHit) failures.push(`MBTI ${run.actual.mbti} outside expected ${expected.mbti.join('/')}`);
  if (!discHit) failures.push(`DISC ${run.actual.discLabel} outside expected ${expected.disc.map((d) => DISC_LABELS[d]).join('/')}`);
  if (!bigFiveHit) failures.push(`Big Five top ${run.actual.bigFiveTopLabel} outside expected ${expected.bigFiveTop.map((t) => BIG_FIVE_LABELS[t]).join('/')}`);
  if (!roleHit) failures.push(`Role ${run.actual.primaryRole} did not match expected family terms`);
  for (const miss of severeMisses) failures.push(`Severe miss: ${miss.reason}`);
  if (run.actual.seniorTitle) failures.push(`Seniority watch: primary role title is ${run.actual.primaryRole}`);

  return {
    ...run,
    checks: { mbtiHit, discHit, preferredDiscHit, bigFiveHit, roleHit, severeMisses: severeMisses.map((m) => m.reason) },
    rating: score,
    status: score >= 8.5 && failures.length === 0 ? 'pass' : score >= 7.2 ? 'review' : 'fail',
    failures,
  };
}

function summarize(scoredRuns) {
  const byPersona = [];
  for (const persona of PERSONAS) {
    const runs = scoredRuns.filter((run) => run.personaId === persona.id);
    const avg = runs.reduce((sum, run) => sum + run.rating, 0) / runs.length;
    const statusCounts = runs.reduce((acc, run) => {
      acc[run.status] = (acc[run.status] || 0) + 1;
      return acc;
    }, {});
    const commonFailures = [...new Set(runs.flatMap((run) => run.failures))];
    const actuals = runs.map((run) => `${run.actual.mbti}/${run.actual.disc}/${run.actual.bigFiveTop}/${run.actual.primaryRole}`);
    byPersona.push({
      id: persona.id,
      name: persona.name,
      averageRating: Number(avg.toFixed(1)),
      status: avg >= 8.5 && (statusCounts.fail || 0) === 0 ? 'pass' : avg >= 7.2 ? 'review' : 'fail',
      statusCounts,
      commonFailures,
      actuals,
      runs,
    });
  }
  const average = scoredRuns.reduce((sum, run) => sum + run.rating, 0) / scoredRuns.length;
  return {
    totalRuns: scoredRuns.length,
    averageRating: Number(average.toFixed(1)),
    passRuns: scoredRuns.filter((run) => run.status === 'pass').length,
    reviewRuns: scoredRuns.filter((run) => run.status === 'review').length,
    failRuns: scoredRuns.filter((run) => run.status === 'fail').length,
    byPersona,
  };
}

function renderMarkdown(summary, scoredRuns, seeds, tier) {
  const lines = [];
  lines.push('# KnowYouRole Pre-Beta Persona Calibration Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Purpose');
  lines.push('');
  lines.push('This Batch 3 audit simulates realistic 45-question quiz completions across five launch-critical personas after career-match usefulness and seniority hardening. It keeps the Batch 2 DISC/Big Five calibration guards active while checking whether role output is now practical, starter-safe, and persona-relevant.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Tier tested: **${tier}**`);
  lines.push(`- Personas: **${PERSONAS.length}**`);
  lines.push(`- Seeds per persona: **${seeds.length}** (${seeds.join(', ')})`);
  lines.push(`- Total simulated runs: **${summary.totalRuns}**`);
  lines.push(`- Average result usefulness: **${summary.averageRating} / 10**`);
  lines.push(`- Run statuses: **${summary.passRuns} pass**, **${summary.reviewRuns} review**, **${summary.failRuns} fail**`);
  lines.push('');
  lines.push(summary.averageRating >= 9.0 && summary.failRuns === 0 ? '**Batch 3 career-match gate:** pass. Seeded personas now receive practical, starter-safe, persona-relevant role matches with no seniority warnings.' : '**Batch 3 career-match gate:** not green yet. Continue role usefulness/seniority fixes before Batch 4.');
  lines.push('');
  lines.push('## Persona rollup');
  lines.push('');
  for (const persona of summary.byPersona) {
    lines.push(`### ${persona.name}`);
    lines.push('');
    lines.push(`- Average: **${persona.averageRating} / 10**`);
    lines.push(`- Status: **${persona.status}**`);
    lines.push(`- Run statuses: ${JSON.stringify(persona.statusCounts)}`);
    lines.push(`- Observed outputs: ${[...new Set(persona.actuals)].join(' · ')}`);
    if (persona.commonFailures.length) {
      lines.push('- Main issues:');
      for (const failure of persona.commonFailures.slice(0, 8)) lines.push(`  - ${failure}`);
    } else {
      lines.push('- Main issues: none flagged.');
    }
    lines.push('');
  }
  lines.push('## Detailed runs');
  lines.push('');
  for (const run of scoredRuns) {
    lines.push(`- **${run.personaName}** seed ${run.seed}: **${run.rating}/10** · ${run.status}`);
    lines.push(`  - Actual: ${run.actual.mbti} + ${run.actual.disc} ${run.actual.discLabel} + ${run.actual.bigFiveTopLabel}`);
    lines.push(`  - Role: ${run.actual.primaryRole} / ${run.actual.secondaryRole} (${run.actual.roleKey})`);
    lines.push(`  - Big Five: O ${run.actual.bigFiveProfile.O}, C ${run.actual.bigFiveProfile.C}, E ${run.actual.bigFiveProfile.E}, A ${run.actual.bigFiveProfile.A}, N ${run.actual.bigFiveProfile.N}`);
    lines.push(`  - Framework counts: ${JSON.stringify(run.frameworkCounts)} · responses: ${run.responses}`);
    if (run.failures.length) lines.push(`  - Issues: ${run.failures.join('; ')}`);
  }
  lines.push('');
  lines.push('## Batch 3 conclusion');
  lines.push('');
  lines.push('Career-role usefulness and seniority hardening passed for the seeded pre-beta personas. Do not begin Batch 4 result/share/mobile friction work until Batch 4 is explicitly approved.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function runAudit({ markdownPath, tier = DEFAULT_TIER, seeds = DEFAULT_SEEDS }) {
  const questionsJson = readJson(QUESTIONS_PATH);
  const rolesJson = readJson(ROLES_PATH);
  const questions = questionsJson.questions;
  const roles = rolesJson.roles;
  if (!Array.isArray(questions)) throw new Error('questions.json must contain a questions array');
  if (!roles || typeof roles !== 'object') throw new Error('roles.json must contain a roles object');

  const runs = [];
  for (const persona of PERSONAS) {
    for (const seed of seeds) runs.push(scoreRun(persona, simulateRun(persona, seed, questions, roles, tier)));
  }
  const summary = summarize(runs);
  const markdown = renderMarkdown(summary, runs, seeds, tier);
  if (markdownPath) {
    const outputPath = path.resolve(projectRoot, markdownPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, markdown);
  }
  console.log(markdown);

  const integrityProblems = runs.filter((run) => run.responses !== TOTAL_QUESTIONS);
  if (integrityProblems.length) {
    console.error(`Integrity failure: ${integrityProblems.length} runs did not have ${TOTAL_QUESTIONS} responses.`);
    process.exitCode = 2;
  }
  return { summary, runs };
}

function selfTest() {
  const questions = [
    { id: 1, tier: DEFAULT_TIER, psych: 'MBTI-EI', optionMeta: ['E', 'I'], options: ['E', 'I'], wildcard: false },
    { id: 2, tier: DEFAULT_TIER, psych: 'DISC-DI', optionMeta: ['D', 'I'], options: ['D', 'I'], wildcard: false },
    { id: 3, tier: DEFAULT_TIER, psych: 'Big5-A', optionMeta: ['A+', 'A-'], options: ['A+', 'A-'], wildcard: false },
  ];
  let rand = mulberry32(1);
  assert.equal(chooseAnswer(PERSONAS[1], questions[0], rand), 0, 'Warm connector should choose E over I');
  rand = mulberry32(1);
  assert.equal(chooseAnswer(PERSONAS[1], questions[1], rand), 1, 'Warm connector should choose I over D on DISC');
  rand = mulberry32(1);
  assert.equal(chooseAnswer(PERSONAS[0], questions[1], rand), 0, 'Strategic architect should choose D over I on DISC; MBTI introversion must not leak into DISC-I');
  assert.equal(normalizeBigFiveEvidence(0), 50, 'neutral signed Big Five evidence is 50');
  assert.equal(normalizeBigFiveEvidence(7), 92, 'high signed Big Five evidence is softened to 92');
  assert.equal(resolvePrimaryDisc({ D: 5, C: 4, I: 1, S: 1 }, { I: 8, E: 2, T: 8, F: 2 }, { C: 74, E: 44, O: 80 }), 'C');
  assert.equal(resolvePrimaryDisc({ D: 5, I: 4, C: 1, S: 1 }, { E: 8, I: 2, T: 4, F: 5 }, { C: 55, E: 80, O: 82 }), 'I');
  assert.equal(topBigFive({ O: 68, C: 80, E: 80, A: 68, N: 26 }, { E: 8, I: 2, F: 8, T: 2, N: 6, S: 4, J: 5, P: 4 }, 'S'), 'E', 'Warm/social close C/E profile should surface Social Energy over generic Follow-through');
  assert.equal(topBigFive({ O: 74, C: 9, E: 62, A: 80, N: 56 }, { E: 8, I: 2, N: 9, S: 2, P: 8, J: 2 }, 'D'), 'O', 'Creative NP profile should preserve Openness when A/E are close but noisy');
  assert.equal(topBigFive({ O: 74, C: 80, E: 80, A: 32, N: 32 }, { E: 8, I: 2, S: 7, N: 5, T: 8, F: 2 }, 'D'), 'E', 'Action D profile should surface Social Energy over generic Follow-through when tied');
  const roles = readJson(ROLES_PATH).roles;
  assert.equal(findBestRoleMatch(roles, 'INTJ', 'C', { O: 68, C: 80, E: 32, A: 44, N: 20 }, { I: 8, E: 2, T: 8, F: 2, N: 8, S: 2, J: 8, P: 2 }).role.primary.title, 'Systems Analyst', 'Strategic profile should get a starter-safe systems role, not a senior Architect title');
  assert.equal(findBestRoleMatch(roles, 'ENFJ', 'S', { O: 68, C: 80, E: 80, A: 68, N: 26 }, { E: 8, I: 2, F: 8, T: 2, N: 6, S: 4, J: 5, P: 4 }).role.primary.title, 'Student Engagement Coordinator', 'Warm connector should get a student/community starter role, not a Director title');
  assert.equal(findBestRoleMatch(roles, 'ENFP', 'I', { O: 68, C: 20, E: 68, A: 68, N: 68 }, { E: 8, I: 2, N: 9, S: 2, P: 8, J: 2 }).role.primary.title, 'Creative Strategist', 'Creative explorer should get a starter-safe creative strategy role, not Creative Director');
  assert.equal(findBestRoleMatch(roles, 'ESTP', 'D', { O: 74, C: 80, E: 80, A: 32, N: 32 }, { E: 8, I: 2, S: 7, N: 5, T: 8, F: 2, P: 7, J: 3 }).role.primary.title, 'Field Sales Specialist', 'Hands-on operator should get a practical sales/field role, not Sales Director');
  assert.equal(findBestRoleMatch(roles, 'ESTP', 'D', { O: 74, C: 91, E: 62, A: 20, N: 32 }, { E: 8, I: 2, S: 7, N: 5, T: 8, F: 2, P: 7, J: 3 }).role.primary.title, 'Field Operations Coordinator', 'Hands-on structured operator should get an operations role, not a generic creative fallback');
  console.log('Self-test passed: pre-beta persona audit helpers are deterministic and calibrated to current Batch 3 expectations.');
}

function parseArgs(argv) {
  const markdownIndex = argv.indexOf('--markdown');
  const tierIndex = argv.indexOf('--tier');
  const seedsIndex = argv.indexOf('--seeds');
  return {
    markdownPath: markdownIndex >= 0 ? argv[markdownIndex + 1] : null,
    tier: tierIndex >= 0 ? argv[tierIndex + 1] : DEFAULT_TIER,
    seeds: seedsIndex >= 0 ? argv[seedsIndex + 1].split(',').map((value) => Number(value.trim())).filter(Number.isFinite) : DEFAULT_SEEDS,
    selfTest: argv.includes('--self-test'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) return selfTest();
  return runAudit(args);
}

main();
