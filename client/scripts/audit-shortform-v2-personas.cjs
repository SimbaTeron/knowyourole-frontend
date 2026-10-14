#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) request = path.join(srcRoot, request.slice(2));
  return originalResolve.call(this, request, parent, isMain, options);
};

for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = function compileTypeScript(module, filename) {
    const source = fs.readFileSync(filename, "utf8");
    const output = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    }).outputText;
    module._compile(output, filename);
  };
}

const { CAREER_SCORE_KEYS, SHORTFORM_V2_QUESTIONS } = require("../src/data/shortformV2Questions.ts");
const { calculateResult, findBestRoleMatch } = require("../src/components/results/resultsData.ts");
const { calibrateShortformV2Scores } = require("../src/lib/results/calibrateShortformV2Scores.ts");

const MBTI_KEYS = ["E", "I", "S", "N", "T", "F", "J", "P"];
const DISC_KEYS = ["D", "I", "S", "C"];
const BIG_FIVE_KEYS = ["O", "C", "E", "A", "N"];

const personas = [
  {
    name: "Strategic Systems Analyst",
    target: { mbti: { I: 1, N: 1, T: 1, J: 0.8 }, disc: { C: 1, D: 0.35 }, bigFive: { O: 0.9, C: 0.8, E: -0.7, A: -0.1, N: -0.4 }, career: { analysis: 1, systems: 1, deepFocus: 0.9, autonomy: 0.45 } },
    expected: { mbti: ["INTJ", "INTP"], disc: ["C", "D"], role: ["technical"] },
  },
  {
    name: "Warm Counselor and Educator",
    target: { mbti: { E: 0.5, N: 0.35, F: 1, J: 0.45 }, disc: { S: 1, I: 0.7 }, bigFive: { O: 0.35, C: 0.45, E: 0.55, A: 1, N: -0.25 }, career: { service: 1, people: 1, stability: 0.45, leadership: 0.25 } },
    expected: { mbti: ["ENFJ", "ESFJ", "INFJ", "ISFJ", "ESFP"], disc: ["S", "I"], role: ["care"] },
  },
  {
    name: "Creative Storyteller",
    target: { mbti: { E: 0.4, N: 1, F: 0.6, P: 1 }, disc: { I: 1, S: 0.2 }, bigFive: { O: 1, C: -0.45, E: 0.5, A: 0.45, N: 0 }, career: { creative: 1, autonomy: 0.85, entrepreneurship: 0.45, people: 0.35 } },
    expected: { mbti: ["ENFP", "INFP", "ENTP"], disc: ["I"], role: ["creative"] },
  },
  {
    name: "Reliable Operations Organizer",
    target: { mbti: { E: 0.25, S: 1, T: 0.55, J: 1 }, disc: { C: 0.85, S: 0.75 }, bigFive: { O: -0.3, C: 1, E: 0.15, A: 0.35, N: -0.45 }, career: { operations: 1, stability: 0.9, systems: 0.7, leadership: 0.35 } },
    expected: { mbti: ["ESTJ", "ISTJ", "ESFJ", "ISFJ"], disc: ["C", "S"], role: ["operations"] },
  },
  {
    name: "Hands-on Field Troubleshooter",
    target: { mbti: { I: 0.35, S: 1, T: 0.8, P: 0.9 }, disc: { D: 0.8, C: 0.35 }, bigFive: { O: 0.15, C: 0.35, E: 0.15, A: -0.2, N: -0.6 }, career: { handsOn: 1, operations: 0.8, pace: 0.45, autonomy: 0.8, deepFocus: 0.4, leadership: -0.6, entrepreneurship: -0.5, creative: -0.3 } },
    expected: { mbti: ["ISTP", "ESTP", "ISTJ", "ESTJ"], disc: ["D", "C"], role: ["handsOn", "technical"] },
  },
  {
    name: "Entrepreneurial Team Builder",
    target: { mbti: { E: 1, N: 0.7, T: 0.7, J: 0.65 }, disc: { D: 1, I: 0.45 }, bigFive: { O: 0.7, C: 0.6, E: 0.9, A: 0.05, N: -0.65 }, career: { leadership: 1, entrepreneurship: 1, autonomy: 0.8, pace: 0.75 } },
    expected: { mbti: ["ENTJ", "ENTP", "ESTJ"], disc: ["D"], role: ["leadership"] },
  },
  {
    name: "Persuasive Relationship Seller",
    target: { mbti: { E: 1, S: 0.3, F: 0.25, P: 0.65 }, disc: { I: 1, D: 0.55 }, bigFive: { O: 0.4, C: 0.25, E: 1, A: 0.5, N: -0.45 }, career: { people: 1, pace: 0.8, leadership: 0.65, entrepreneurship: 0.7 } },
    expected: { mbti: ["ESFP", "ESTP", "ENFP", "ENTP"], disc: ["I", "D"], role: ["influence", "leadership"] },
  },
  {
    name: "Patient Healthcare Supporter",
    target: { mbti: { I: 0.35, S: 0.9, F: 1, J: 0.75 }, disc: { S: 1, C: 0.45 }, bigFive: { O: -0.2, C: 0.7, E: -0.15, A: 1, N: -0.15 }, career: { service: 1, people: 0.9, stability: 0.75, handsOn: 0.4 } },
    expected: { mbti: ["ISFJ", "ESFJ", "INFJ"], disc: ["S", "C"], role: ["care"] },
  },
  {
    name: "Independent Researcher",
    target: { mbti: { I: 1, N: 0.9, T: 1, P: 1, J: -0.75 }, disc: { C: 1, S: 0.15 }, bigFive: { O: 1, C: 0.2, E: -0.9, A: -0.1, N: -0.25 }, career: { analysis: 1, deepFocus: 1, systems: 0.45, autonomy: 1, operations: -0.6, leadership: -0.5 } },
    expected: { mbti: ["INTP", "INTJ"], disc: ["C"], role: ["technical"] },
  },
  {
    name: "Community Program Builder",
    target: { mbti: { E: 0.75, N: 0.35, F: 0.85, J: 0.85 }, disc: { I: 0.8, S: 0.55, D: 0.3 }, bigFive: { O: 0.4, C: 0.75, E: 0.75, A: 0.75, N: -0.3 }, career: { people: 0.85, service: 0.4, leadership: 1, operations: 0.9, pace: 0.7, stability: 0.15 } },
    expected: { mbti: ["ENFJ", "ESFJ", "ESFP"], disc: ["I", "S"], role: ["care", "leadership", "operations"] },
  },
];

const rolePatterns = [
  ["handsOn", /(mechanic|technician|electrician|plumber|welder|carpenter|construction|trades|chef|field service|repair|machinist|installer|firefighter|paramedic|pilot|operator)/i],
  ["care", /(therap|counsel|psycholog|\bcoach|teacher|nurse|medical|healthcare|health care|social worker|community|advocate|patient|\bcare\b|human resources|people operations)/i],
  ["influence", /(sales|business development|recruit|partnership|public relations|account executive|fundrais|event|media relations|negotiat)/i],
  ["creative", /(design|designer|creative|writer|artist|film|photo|content|brand|marketing|game|producer|podcast|interior|animation|motion)/i],
  ["operations", /(operations|project|program|logistics|compliance|audit|quality|administrat|coordinator|process|supply chain|finance|accountant|actuar)/i],
  ["technical", /(engineer|architect|developer|software|research|scientist|data|analyst|analytics|cyber|security|quant|algorithm|systems|forensic|policy evaluat)/i],
  ["leadership", /(founder|chief|director|executive|manager|management|lead|leader|entrepreneur|venture|strategist|strategy|consultant|product owner|product manager)/i],
];

function initialScores() {
  return {
    mbti: Object.fromEntries(MBTI_KEYS.map(key => [key, 0])),
    disc: Object.fromEntries(DISC_KEYS.map(key => [key, 0])),
    bigFive: Object.fromEntries(BIG_FIVE_KEYS.map(key => [key, 0])),
    career: Object.fromEntries(CAREER_SCORE_KEYS.map(key => [key, 0])),
    responses: [], swipeTimes: [], averageSwipeTime: 4, currentDifficulty: "medium", engagement: 0,
    wildcardBoost: false, criticalWildcard: 0, firstPrinciplesWildcard: 0, hybridTypes: [], moodBoosts: { critical: 0, firstPrinciples: 0 },
  };
}

function utility(answer, target) {
  let score = 0;
  for (const [key, value] of Object.entries(answer.scores.mbti || {})) score += value * (target.mbti[key] || 0) * 0.9;
  for (const [key, value] of Object.entries(answer.scores.disc || {})) score += value * (target.disc[key] || 0) * 0.9;
  for (const [key, value] of Object.entries(answer.scores.bigFive || {})) score += value * (target.bigFive[key] || 0) * 0.75;
  for (const [key, value] of Object.entries(answer.scores.career || {})) score += value * (target.career[key] || 0) * 1.15;
  return score;
}

function answerPersona(persona) {
  const scores = initialScores();
  SHORTFORM_V2_QUESTIONS.forEach((question, questionIndex) => {
    const ranked = question.answers.map((answer, answerIndex) => ({ answer, answerIndex, score: utility(answer, persona.target) }))
      .sort((a, b) => b.score - a.score || a.answerIndex - b.answerIndex);
    const selected = ranked[0];
    for (const family of ["mbti", "disc", "bigFive", "career"]) {
      for (const [key, value] of Object.entries(selected.answer.scores[family] || {})) scores[family][key] += value;
    }
    scores.responses.push({ questionId: question.id, choice: selected.answerIndex, timeSpent: 4, swipeDirection: selected.answerIndex < 2 ? "left" : "right", responseType: "multiChoice", psych: question.group, selectedOptionMeta: selected.answer.resultSignal, selectedOptionLabel: selected.answer.text });
    scores.swipeTimes.push(4);
    scores.engagement += 1;
  });
  return scores;
}

function categoryForRole(role) {
  const text = `${role.title} ${role.desc || ""}`;
  return (rolePatterns.find(([, regex]) => regex.test(text)) || ["generalist"])[0];
}

function runPersona(persona) {
  const scores = calibrateShortformV2Scores(answerPersona(persona));
  const result = calculateResult(scores);
  const roleMatch = findBestRoleMatch(result.mbtiType, result.discStyle, result.bigFiveProfile, scores.mbti, scores.career);
  const roleCategory = categoryForRole(roleMatch.primary);
  const topCareer = Object.entries(scores.career).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([key]) => key);
  const checks = {
    mbti: persona.expected.mbti.includes(result.mbtiType),
    disc: persona.expected.disc.includes(result.discStyle),
    role: persona.expected.role.includes(roleCategory),
    guidance: Boolean(roleMatch.whyThisFits && roleMatch.starterPath && roleMatch.mayNotFit),
    careerAware: roleMatch.matchSource === "career-vector" && Array.isArray(roleMatch.careerSignals) && roleMatch.careerSignals.length === 3,
    alternatives: Array.isArray(roleMatch.alternatives)
      && roleMatch.alternatives.length === 2
      && new Set([roleMatch.primary.title, roleMatch.secondary.title, ...roleMatch.alternatives.map(role => role.title)]).size === 4,
  };
  return {
    name: persona.name,
    mbti: result.mbtiType,
    disc: result.discStyle,
    bigFive: result.bigFiveProfile,
    topBigFive: Object.entries(result.bigFiveProfile).sort((a, b) => b[1] - a[1])[0][0],
    topCareer,
    role: roleMatch.primary.title,
    roleCategory,
    matchScore: roleMatch.matchScore,
    signals: roleMatch.careerSignals,
    checks,
    pass: Object.values(checks).every(Boolean),
  };
}

const results = personas.map(runPersona);
const uniqueRoles = new Set(results.map(result => result.role)).size;
const failures = results.filter(result => !result.pass);
console.log("KnowYouRole Active 28-Question Persona Audit");
console.log("================================================");
console.log(`Personas: ${results.length}`);
console.log(`Passing: ${results.length - failures.length}/${results.length}`);
console.log(`Unique primary roles: ${uniqueRoles}/${results.length}`);
console.log("");
for (const result of results) {
  console.log(`${result.pass ? "PASS" : "REVIEW"} | ${result.name}`);
  console.log(`  ${result.mbti} + DISC ${result.disc} + Big Five O${result.bigFive.O}/C${result.bigFive.C}/E${result.bigFive.E}/A${result.bigFive.A}/N${result.bigFive.N}`);
  console.log(`  Career: ${result.topCareer.join(", ")}`);
  console.log(`  Role: ${result.role} [${result.roleCategory}] · score ${result.matchScore}`);
  console.log(`  Evidence: ${(result.signals || []).join(", ")}`);
  if (!result.pass) console.log(`  Failed: ${Object.entries(result.checks).filter(([, ok]) => !ok).map(([key]) => key).join(", ")}`);
}
console.log("");
console.log(`Status: ${failures.length || uniqueRoles < 7 ? "REVIEW" : "PASS"}`);
if (uniqueRoles < 7) console.log(`Diversity failure: expected at least 7 unique roles, found ${uniqueRoles}.`);
if (failures.length || uniqueRoles < 7) process.exitCode = 1;
