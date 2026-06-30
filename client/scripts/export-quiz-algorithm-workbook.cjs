const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const root = path.resolve(__dirname, '..');
const questionsPath = path.join(root, 'src/data/shortformV2Questions.ts');
const rolesPath = path.join(root, 'src/data/roles.json');
const outPath = path.join(root, 'KnowYouRole_Quiz_Algorithm_Audit.xlsx');

function extractArrayLiteral(source, constName) {
  const marker = `export const ${constName}`;
  const startMarker = source.indexOf(marker);
  if (startMarker === -1) throw new Error(`Could not find ${constName}`);
  const eq = source.indexOf('=', startMarker);
  const arrStart = source.indexOf('[', eq);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escape = false;
  for (let i = arrStart; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === quote) { inString = false; quote = ''; }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; quote = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) return source.slice(arrStart, i + 1);
    }
  }
  throw new Error(`Could not extract array for ${constName}`);
}

function evalLiteral(literal) {
  return Function(`"use strict"; return (${literal});`)();
}

const source = fs.readFileSync(questionsPath, 'utf8');
const questions = evalLiteral(extractArrayLiteral(source, 'SHORTFORM_V2_QUESTIONS'));
const careerKeys = evalLiteral(extractArrayLiteral(source, 'CAREER_SCORE_KEYS'));
const rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));

const mbtiKeys = ['E','I','S','N','T','F','J','P'];
const discKeys = ['D','I','S','C'];
const bigFiveKeys = ['O','C','E','A','N'];
const allScoreKeys = [...mbtiKeys.map(k => `MBTI_${k}`), ...discKeys.map(k => `DISC_${k}`), ...bigFiveKeys.map(k => `Big5_${k}`), ...careerKeys.map(k => `Career_${k}`)];

const questionRows = questions.map(q => ({
  Question: q.id,
  Key: q.key,
  Group: q.group,
  Signal: q.signal,
  Prompt: q.prompt,
  Guidance: q.guidance,
  Answer_Count: q.answers.length,
  Scoring_Frames_Touched: Array.from(new Set(q.answers.flatMap(a => Object.keys(a.scores)))).join(', '),
}));

function fmtScoreObj(obj) {
  if (!obj || Object.keys(obj).length === 0) return '';
  return Object.entries(obj).map(([k,v]) => `${k}${Number(v) >= 0 ? '+' : ''}${v}`).join(', ');
}

const answerRows = [];
for (const q of questions) {
  for (const a of q.answers) {
    const row = {
      Question: q.id,
      Key: q.key,
      Group: q.group,
      Signal: q.signal,
      Prompt: q.prompt,
      Guidance: q.guidance,
      Answer_ID: a.id,
      Answer_Text: a.text,
      Supporting_Text: a.supportingText,
      Result_Signal: a.resultSignal,
      MBTI_Scores: fmtScoreObj(a.scores.mbti),
      DISC_Scores: fmtScoreObj(a.scores.disc),
      Big5_Scores: fmtScoreObj(a.scores.bigFive),
      Career_Scores: fmtScoreObj(a.scores.career),
    };
    for (const k of mbtiKeys) row[`MBTI_${k}`] = a.scores.mbti?.[k] ?? 0;
    for (const k of discKeys) row[`DISC_${k}`] = a.scores.disc?.[k] ?? 0;
    for (const k of bigFiveKeys) row[`Big5_${k}`] = a.scores.bigFive?.[k] ?? 0;
    for (const k of careerKeys) row[`Career_${k}`] = a.scores.career?.[k] ?? 0;
    answerRows.push(row);
  }
}

const byGroup = {};
for (const q of questions) byGroup[q.group] = (byGroup[q.group] || 0) + 1;
const byGroupRows = Object.entries(byGroup).map(([Group, Questions]) => ({ Group, Questions, Answers: Questions * 4 }));

const dimensionRows = [];
for (const key of mbtiKeys) {
  const pos = answerRows.filter(r => r[`MBTI_${key}`] > 0).length;
  const neg = answerRows.filter(r => r[`MBTI_${key}`] < 0).length;
  const total = answerRows.reduce((s,r) => s + Number(r[`MBTI_${key}`] || 0), 0);
  dimensionRows.push({ Framework: 'MBTI', Dimension: key, Meaning: ({E:'Extraversion',I:'Introversion',S:'Sensing',N:'Intuition',T:'Thinking',F:'Feeling',J:'Judging/Structure',P:'Perceiving/Flexibility'})[key], Positive_Answer_Count: pos, Negative_Answer_Count: neg, Max_If_All_Positive_Selected: total, Notes: 'MBTI letter is determined by pairwise comparison: E vs I, S vs N, T vs F, J vs P.' });
}
for (const key of discKeys) {
  const pos = answerRows.filter(r => r[`DISC_${key}`] > 0).length;
  const total = answerRows.reduce((s,r) => s + Number(r[`DISC_${key}`] || 0), 0);
  dimensionRows.push({ Framework: 'DISC', Dimension: key, Meaning: ({D:'Dominance / direct action',I:'Influence / social momentum',S:'Steadiness / stability',C:'Conscientiousness / precision'})[key], Positive_Answer_Count: pos, Negative_Answer_Count: 0, Max_If_All_Positive_Selected: total, Notes: 'Highest raw DISC score is primary, with tie/near-tie calibration rules using MBTI and Big Five.' });
}
for (const key of bigFiveKeys) {
  const pos = answerRows.filter(r => r[`Big5_${key}`] > 0).length;
  const neg = answerRows.filter(r => r[`Big5_${key}`] < 0).length;
  const max = answerRows.reduce((s,r) => s + Math.max(0, Number(r[`Big5_${key}`] || 0)), 0);
  const min = answerRows.reduce((s,r) => s + Math.min(0, Number(r[`Big5_${key}`] || 0)), 0);
  dimensionRows.push({ Framework: 'Big Five', Dimension: key, Meaning: ({O:'Openness',C:'Conscientiousness / structure',E:'Extraversion',A:'Agreeableness',N:'Neuroticism / stress reactivity'})[key], Positive_Answer_Count: pos, Negative_Answer_Count: neg, Max_If_All_Positive_Selected: max, Minimum_If_All_Negative_Selected: min, Notes: 'Signed evidence is normalized as clamp(-7,+7), then 50 + signed*6, bounded 8–92. Raw values >25 are treated as pre-normalized preview scores.' });
}
for (const key of careerKeys) {
  const pos = answerRows.filter(r => r[`Career_${key}`] > 0).length;
  const neg = answerRows.filter(r => r[`Career_${key}`] < 0).length;
  const max = answerRows.reduce((s,r) => s + Math.max(0, Number(r[`Career_${key}`] || 0)), 0);
  const min = answerRows.reduce((s,r) => s + Math.min(0, Number(r[`Career_${key}`] || 0)), 0);
  dimensionRows.push({ Framework: 'Career Vector', Dimension: key, Meaning: key.replace(/([A-Z])/g, ' $1').trim(), Positive_Answer_Count: pos, Negative_Answer_Count: neg, Max_If_All_Positive_Selected: max, Minimum_If_All_Negative_Selected: min, Notes: 'Collected by the fixed 28-question quiz as a career-fit vector. Current role matching still primarily uses MBTI + DISC + top Big Five trait.' });
}

const algorithmRows = [
  { Step: 1, Area: 'Question model', Rule: 'The active quiz is shortform-v2-fixed-28: 28 questions, 4 answers each.', Why_it_matters: 'Total raw answer paths = 4^28 = 72,057,594,037,927,936. Storing every path would be idiotic; scoring is additive and deterministic.' },
  { Step: 2, Area: 'Answer scoring', Rule: 'Each selected answer adds signed weights into mbti, disc, bigFive, and career buckets.', Why_it_matters: 'Every answer is visible in the All Answer Scoring sheet with exact score deltas.' },
  { Step: 3, Area: 'MBTI type', Rule: 'Compare pairs: E>I gives E else I; S>N gives S else N; T>F gives T else F; J>P gives J else P.', Why_it_matters: 'Four pairwise comparisons produce the final four-letter type.' },
  { Step: 4, Area: 'MBTI uncertainty', Rule: 'Advanced scorer treats axis gaps under 1.5 as hybrid/close-call; legacy result still chooses a side for display.', Why_it_matters: 'Close scores should be interpreted as flexible, not a hard identity stamp.' },
  { Step: 5, Area: 'Big Five normalization', Rule: 'For signed real scores <=25: clamp raw to -7..+7, normalized = round(50 + raw*6), bounded 8..92.', Why_it_matters: 'Prevents short quizzes from producing fake 0/100 extremes.' },
  { Step: 6, Area: 'DISC style', Rule: 'Start with highest raw DISC score, then run near-tie calibration against MBTI shape and Big Five profile.', Why_it_matters: 'Avoids over-labeling someone as D/I/S/C when adjacent evidence indicates a better behavioral read.' },
  { Step: 7, Area: 'Role matching', Rule: 'Find highest calibrated Big Five trait, second trait, MBTI type, and calibrated DISC style; then search role keys in priority order.', Why_it_matters: 'Role results come from pattern matching, not from enumerating every possible quiz path.' },
  { Step: 8, Area: 'Role fallback', Rule: 'If exact role key does not exist, fallback tries MBTI + DISC + Openness high variants, then roles.default.', Why_it_matters: 'Every result gets a role even when no highly specific mapping exists.' },
  { Step: 9, Area: 'Proxy scales', Rule: 'Critical Thinking = 40% MBTI-T + 40% Big5-O + 20% DISC-C, blended with wildcard boost. First Principles = 40% MBTI-N + 40% Big5-O + 20% DISC-I.', Why_it_matters: 'These are interpretive scales, not directly asked as standalone clinical traits.' },
  { Step: 10, Area: 'Confidence', Rule: 'Confidence combines coverage, metadata completeness, response time quality, response strength, MBTI axis confidence, DISC lead gap, and Big Five spread.', Why_it_matters: 'Results should explain when evidence is strong vs. directional.' },
];

const mbtiAxisRows = [
  { Axis: 'EI', Left: 'E', Right: 'I', Output_Rule: 'E if E > I, otherwise I in legacy display', Measures: 'Social energy: external engagement vs private/deep-focus recharge' },
  { Axis: 'SN', Left: 'S', Right: 'N', Output_Rule: 'S if S > N, otherwise N in legacy display', Measures: 'Information lens: concrete facts/practicality vs patterns/future possibilities' },
  { Axis: 'TF', Left: 'T', Right: 'F', Output_Rule: 'T if T > F, otherwise F in legacy display', Measures: 'Decision standard: logic/outcomes vs values/people impact' },
  { Axis: 'JP', Left: 'J', Right: 'P', Output_Rule: 'J if J > P, otherwise P in legacy display', Measures: 'Structure: closure/planning vs flexibility/adaptation' },
];

const discRows = [
  { Style: 'D', Label: 'Dominant', Core: 'Direct action, decisiveness, momentum, taking charge', Calibration: 'May be overridden toward C/I/S if near-tie and MBTI/Big Five evidence says analytical, creative, or people-centered shape fits better.' },
  { Style: 'I', Label: 'Influential', Core: 'Social momentum, enthusiasm, persuasion, energy', Calibration: 'May be overridden toward D when action-shape is stronger, or S when introverted/conscientious steadiness is stronger.' },
  { Style: 'S', Label: 'Steady', Core: 'Patience, stability, support, trust-building follow-through', Calibration: 'May be overridden toward C when analytical + low-extraversion evidence is close.' },
  { Style: 'C', Label: 'Conscientious', Core: 'Precision, quality control, facts, careful analysis', Calibration: 'Often wins when introversion + thinking/conscientiousness are strong and DISC C is close to top.' },
];

const roleKeyRows = [
  { Priority: 1, Key_Template: '{mbti}-{disc}-{highestBigFiveTrait}-high', Example: 'intj-c-o-high' },
  { Priority: 2, Key_Template: '{mbti}-{disc}-{secondBigFiveTrait}-high', Example: 'intj-c-c-high' },
  { Priority: 3, Key_Template: '{mbti}-{highestBigFiveTrait}-high', Example: 'intj-o-high' },
  { Priority: 4, Key_Template: 'tech-{disc}-{highestBigFiveTrait}-high', Example: 'tech-c-o-high' },
  { Priority: 5, Key_Template: 'ai-{disc}-{highestBigFiveTrait}-high', Example: 'ai-c-o-high' },
  { Priority: 6, Key_Template: 'creative-{highestBigFiveTrait}-high', Example: 'creative-o-high' },
  { Priority: 7, Key_Template: 'artistic-{highestBigFiveTrait}-high', Example: 'artistic-o-high' },
  { Priority: 8, Key_Template: 'trades-{disc}-{secondBigFiveTrait}-high', Example: 'trades-c-c-high' },
  { Priority: 9, Key_Template: 'industry fallbacks using healthcare, education, finance, marketing, science, legal, media, service, government, security, outdoor, sports, food, transport', Example: 'science-c-o-high' },
  { Priority: 10, Key_Template: '{mbti}-c-o-high / {mbti}-d-o-high / {mbti}-s-o-high / {mbti}-i-o-high', Example: 'intj-c-o-high' },
  { Priority: 11, Key_Template: 'default', Example: 'default' },
];

const roleRows = Object.entries(rolesData.roles || {}).map(([key, value]) => ({
  Role_Key: key,
  Primary_Title: value.primary?.title || '',
  Primary_Salary: value.primary?.salary || '',
  Primary_Description: value.primary?.desc || '',
  Secondary_Title: value.secondary?.title || '',
  Secondary_Salary: value.secondary?.salary || '',
  Secondary_Description: value.secondary?.desc || '',
  Why_This_Fits: value.whyThisFits || '',
  Starter_Path: value.starterPath || '',
  May_Not_Fit: value.mayNotFit || '',
}));

const traitRows = [];
const traits = rolesData.traitDescriptions || {};
for (const [type, info] of Object.entries(traits.mbti || {})) traitRows.push({ Framework: 'MBTI', Key: type, Label: info.label, Description: info.desc, High: '', Low: '' });
for (const [type, info] of Object.entries(traits.disc || {})) traitRows.push({ Framework: 'DISC', Key: type, Label: info.label, Description: info.desc, High: '', Low: '' });
for (const [type, info] of Object.entries(traits.bigFive || {})) traitRows.push({ Framework: 'Big Five', Key: type, Label: type, Description: '', High: info.high, Low: info.low });

const combinationCount = (4n ** BigInt(questions.length)).toLocaleString('en-US');

const summaryRows = [
  { Field: 'Workbook purpose', Value: 'Comprehensive audit of the active Know Your Role fixed 28-question scoring model.' },
  { Field: 'Active question source', Value: 'src/data/shortformV2Questions.ts' },
  { Field: 'Active scoring component', Value: 'src/components/ShortformV2Quiz.tsx addWeights()' },
  { Field: 'Result engine references', Value: 'src/components/results/resultsData.ts and src/lib/scoring.ts' },
  { Field: 'Question count', Value: questions.length },
  { Field: 'Answers per question', Value: 4 },
  { Field: 'Total possible answer combinations', Value: combinationCount },
  { Field: 'Important note', Value: 'The algorithm does not enumerate combinations; it sums weighted answer deltas and derives MBTI, DISC, Big Five, and role fit from the aggregate profile.' },
  { Field: 'Known design caveat', Value: 'The quiz stores career-vector scores, but current role matching is primarily MBTI + DISC + calibrated top Big Five trait. If we want career vectors to drive roles more directly, that is the next meaningful scoring upgrade.' },
];

function aoaSheet(rows, headers) {
  return XLSX.utils.json_to_sheet(rows, { header: headers || undefined });
}
function setWidths(ws, widths) { ws['!cols'] = widths.map(w => ({ wch: w })); }
function freeze(ws, r = 1) { ws['!freeze'] = { xSplit: 0, ySplit: r }; }
function addSheet(wb, name, rows, headers, widths) {
  const ws = aoaSheet(rows, headers);
  if (widths) setWidths(ws, widths);
  freeze(ws, 1);
  XLSX.utils.book_append_sheet(wb, ws, name);
}

const wb = XLSX.utils.book_new();
wb.Props = {
  Title: 'Know Your Role Quiz Algorithm Audit',
  Subject: 'Question, Answer, Scoring and Result Logic',
  Author: 'Hermes / Alfred',
  CreatedDate: new Date(),
};

addSheet(wb, 'Summary', summaryRows, ['Field','Value'], [32, 120]);
addSheet(wb, 'Algorithm Overview', algorithmRows, ['Step','Area','Rule','Why_it_matters'], [8, 24, 90, 90]);
addSheet(wb, 'Question Groups', byGroupRows, ['Group','Questions','Answers'], [28, 12, 12]);
addSheet(wb, 'Questions', questionRows, ['Question','Key','Group','Signal','Prompt','Guidance','Answer_Count','Scoring_Frames_Touched'], [10, 30, 28, 28, 70, 70, 14, 28]);
addSheet(wb, 'All Answer Scoring', answerRows, ['Question','Key','Group','Signal','Prompt','Guidance','Answer_ID','Answer_Text','Supporting_Text','Result_Signal','MBTI_Scores','DISC_Scores','Big5_Scores','Career_Scores', ...allScoreKeys], [9, 26, 24, 24, 60, 58, 10, 62, 70, 32, 32, 24, 24, 52, ...allScoreKeys.map(() => 12)]);
addSheet(wb, 'Dimension Dictionary', dimensionRows, ['Framework','Dimension','Meaning','Positive_Answer_Count','Negative_Answer_Count','Max_If_All_Positive_Selected','Minimum_If_All_Negative_Selected','Notes'], [18, 16, 36, 22, 22, 28, 28, 90]);
addSheet(wb, 'MBTI Logic', mbtiAxisRows, ['Axis','Left','Right','Output_Rule','Measures'], [8, 8, 8, 54, 80]);
addSheet(wb, 'DISC Logic', discRows, ['Style','Label','Core','Calibration'], [8, 20, 70, 100]);
addSheet(wb, 'Role Match Logic', roleKeyRows, ['Priority','Key_Template','Example'], [10, 110, 28]);
addSheet(wb, 'Role Library', roleRows, ['Role_Key','Primary_Title','Primary_Salary','Primary_Description','Secondary_Title','Secondary_Salary','Secondary_Description','Why_This_Fits','Starter_Path','May_Not_Fit'], [34, 34, 18, 70, 34, 18, 70, 90, 90, 90]);
addSheet(wb, 'Trait Descriptions', traitRows, ['Framework','Key','Label','Description','High','Low'], [16, 12, 34, 80, 80, 80]);

XLSX.writeFile(wb, outPath, { bookType: 'xlsx', compression: true });

const verify = XLSX.readFile(outPath, { bookSheets: true });
console.log(JSON.stringify({ outPath, sheets: verify.SheetNames, questions: questions.length, answers: answerRows.length, roles: roleRows.length, combinations: combinationCount }, null, 2));
