const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load data files
const questionsData = JSON.parse(fs.readFileSync('./client/src/data/questions.json', 'utf8'));
const rolesData = JSON.parse(fs.readFileSync('./client/src/data/roles.json', 'utf8'));

// Create workbook
const wb = XLSX.utils.book_new();

// ============================================
// SHEET 1: Algorithm Workflow Documentation
// ============================================
const algorithmDocs = [
  ['KNOWROLE ALGORITHM WORKFLOW DOCUMENTATION'],
  ['Last Updated: ' + new Date().toLocaleDateString()],
  [''],
  ['=== OVERVIEW ==='],
  ['KnowRole guides users through a personality discovery journey to match them with ideal career roles.'],
  ['The algorithm combines MBTI, DISC, and Big Five personality frameworks.'],
  [''],
  ['=== STEP 1: AGE TIER SELECTION ==='],
  ['Users select their age range which determines:'],
  ['- Question set: Each tier has age-appropriate questions with relevant language/scenarios'],
  ['- Number of questions: Varies by tier (younger = fewer questions)'],
  ['- Timer duration: Younger tiers get slightly more time per question'],
  ['- Language complexity: Questions are simpler for younger users'],
  [''],
  ['Age Tiers:'],
  ['- Mini Explorer (Ages 12 and under): ~15-20 questions, 6 sec timer, kid-friendly scenarios'],
  ['- Teen Navigator (Ages 13-18): ~20-25 questions, 7 sec timer, teen-relevant scenarios'],
  ['- Young Trailblazer (Ages 19-25): ~25-30 questions, 8 sec timer, young adult focus'],
  ['- Adult Anchor (Ages 25+): ~25-30 questions, 9 sec timer, professional scenarios'],
  [''],
  ['=== STEP 2: MOOD SELECTION ==='],
  ['Users select their current emotional state:'],
  ['- Energized: Full question set, faster pacing encouraged'],
  ['- Reflective: May receive more introspective questions weighted higher'],
  ['- Stuck: Supportive messaging, no penalty for slower responses'],
  ['This affects question tone and the way results are presented.'],
  [''],
  ['=== STEP 3: LOCATION (OPTIONAL) ==='],
  ['If user enters a US postal code:'],
  ['- Locality Theme: Colors may change to match local sports team colors'],
  ['- Regional Salary Data: Salary ranges adjusted for cost of living in that metro'],
  ['- Locale Insights: Career recommendations include metro-specific job market info'],
  ['If skipped: Default national averages are used.'],
  [''],
  ['=== STEP 4: FUN MODE TOGGLE (OPTIONAL) ==='],
  ['When Fun Mode is ON:'],
  ['- Playful role titles: "Professional Debater" instead of "Debater"'],
  ['- Personality roasts: Humorous commentary on personality traits'],
  ['- Fun names for MBTI/DISC types'],
  ['When Fun Mode is OFF:'],
  ['- Standard professional language'],
  ['- Traditional personality descriptors'],
  [''],
  ['=== STEP 5: OPENING MULTI-CHOICE QUESTION ==='],
  ['A 4-option question that seeds initial personality direction:'],
  ['Options typically map to:'],
  ['- Creating something new → Creative/Innovative path (N+, O+)'],
  ['- Solving practical problems → Analytical/Practical path (T+, C+)'],
  ['- Connecting with people → Social/Interpersonal path (E+, I-disc, A+)'],
  ['- Understanding how things work → Investigative/Systematic path (C-disc, S-)'],
  ['This primes the algorithm but does not lock in any scores.'],
  [''],
  ['=== STEP 6: BINARY QUIZ QUESTIONS ==='],
  ['The core of the assessment. Each question:'],
  ['- Presents two options (left vs right card)'],
  ['- Has a timer (varies by tier)'],
  ['- Maps to personality dimensions via optionMeta field'],
  [''],
  ['Scoring System:'],
  ['- Each choice adds weight to corresponding trait'],
  ['- Fast responses (<2 sec) may indicate strong preference'],
  ['- Timeouts result in random selection with slight negative engagement score'],
  ['- Wildcard questions have boosted scoring impact'],
  [''],
  ['Personality Dimensions Measured:'],
  ['MBTI: E/I (Extraversion/Introversion), S/N (Sensing/Intuition), T/F (Thinking/Feeling), J/P (Judging/Perceiving)'],
  ['DISC: D (Dominance), I (Influence), S (Steadiness), C (Conscientiousness)'],
  ['Big Five: O (Openness), C (Conscientiousness), E (Extraversion), A (Agreeableness), N (Neuroticism)'],
  [''],
  ['=== STEP 7: FINAL MULTI-CHOICE QUESTION ==='],
  ['A closing 4-option question that refines career direction:'],
  ['- Reinforces or adjusts the initial opening choice'],
  ['- Provides final weighting to role matching algorithm'],
  ['- Options map to career categories (trades, professional, creative, service)'],
  [''],
  ['=== STEP 8: ROLE MATCHING ALGORITHM ==='],
  ['After all questions, scores are calculated:'],
  ['1. Determine dominant MBTI type (4-letter code)'],
  ['2. Determine dominant DISC style (1-2 letters)'],
  ['3. Calculate Big Five percentages'],
  ['4. Create composite key: e.g., "entp-i-o-high"'],
  ['5. Look up matching role cluster from roles.json'],
  ['6. Return primary and secondary role recommendations'],
  [''],
  ['Role clusters are organized by:'],
  ['- MBTI type prefix'],
  ['- DISC style'],
  ['- Dominant Big Five trait'],
  ['- Industry/category modifiers'],
  [''],
  ['=== RESULTS GENERATION ==='],
  ['The results page displays:'],
  ['- Primary role match with salary range'],
  ['- Secondary role match'],
  ['- MBTI type with description'],
  ['- DISC style with description'],
  ['- Big Five radar chart with percentages'],
  ['- Personalized 4-5 sentence summary'],
  ['- Regional salary adjustments (if location provided)'],
  ['- Locale insights (if location provided)'],
  [''],
  ['Premium features include:'],
  ['- Deep Dive Analysis'],
  ['- Additional Role Matches'],
  ['- 30-Day Growth Quest'],
  ['- Team Compatibility'],
  ['- Evolution Map'],
  ['- Arc Tracker'],
  [''],
  ['=== EMOJI SUPPORT ==='],
  ['Questions support emojis in prompts and options.'],
  ['Example: "Playground pick—how do you play? 🏃‍♂️"'],
  ['Emojis render natively in the React frontend.'],
  ['Feel free to add emojis especially for Mini Explorer tier.'],
];

const ws1 = XLSX.utils.aoa_to_sheet(algorithmDocs.map(row => [row]));
ws1['!cols'] = [{ wch: 120 }];
XLSX.utils.book_append_sheet(wb, ws1, 'Algorithm Docs');

// ============================================
// SHEET 2: Questions
// ============================================
const questionsHeader = [
  'id', 'prompt', 'leftDesc', 'rightDesc', 'optionLeft', 'optionRight', 
  'optionMetaLeft', 'optionMetaRight', 'psych', 'time', 'tier', 'version', 'paid', 'wildcard'
];
const questionsRows = [questionsHeader];
questionsData.questions.forEach(q => {
  questionsRows.push([
    q.id,
    q.prompt || '',
    q.leftDesc || '',
    q.rightDesc || '',
    q.options?.[0] || '',
    q.options?.[1] || '',
    q.optionMeta?.[0] || '',
    q.optionMeta?.[1] || '',
    q.psych || '',
    q.time || '',
    q.tier || '',
    q.version || '',
    q.paid ? 'TRUE' : 'FALSE',
    q.wildcard ? 'TRUE' : 'FALSE'
  ]);
});
const ws2 = XLSX.utils.aoa_to_sheet(questionsRows);
ws2['!cols'] = [
  { wch: 5 }, { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 20 }, { wch: 20 },
  { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 5 }, { wch: 8 }, { wch: 5 }, { wch: 6 }, { wch: 8 }
];
XLSX.utils.book_append_sheet(wb, ws2, 'Questions');

// ============================================
// SHEET 3: Roles
// ============================================
const rolesHeader = [
  'cluster_key', 'role_type', 'title', 'salary', 'description'
];
const rolesRows = [rolesHeader];
Object.entries(rolesData.roles).forEach(([key, cluster]) => {
  if (cluster.primary) {
    rolesRows.push([
      key,
      'primary',
      cluster.primary.title || '',
      cluster.primary.salary || '',
      cluster.primary.desc || ''
    ]);
  }
  if (cluster.secondary) {
    rolesRows.push([
      key,
      'secondary',
      cluster.secondary.title || '',
      cluster.secondary.salary || '',
      cluster.secondary.desc || ''
    ]);
  }
});
const ws3 = XLSX.utils.aoa_to_sheet(rolesRows);
ws3['!cols'] = [
  { wch: 25 }, { wch: 12 }, { wch: 35 }, { wch: 15 }, { wch: 60 }
];
XLSX.utils.book_append_sheet(wb, ws3, 'Roles');

// ============================================
// SHEET 4: Timeout Messages
// ============================================
const timeoutHeader = ['id', 'quip', 'notes'];
const timeoutMessages = [
  [1, "Time flies when you're pondering!", ''],
  [2, "The universe chose for you this time", ''],
  [3, "Sometimes the best choice is a surprise", ''],
  [4, "Going with the cosmic flow on this one", ''],
  [5, "Your future self just picked for you", ''],
  [6, "Let fate decide this fork in the road", ''],
  [7, "Even quick-thinkers need a breather", ''],
  [8, "The timer won, but you're still winning", ''],
  [9, "Destiny took the wheel on this one", ''],
  [10, "Your gut instinct just answered silently", ''],
  [11, "The stars aligned while you were thinking", ''],
  [12, "A moment of zen led to this choice", ''],
  [13, "The path chose you this time around", ''],
  [14, "Deep thoughts deserve cosmic help", ''],
  [15, "Your subconscious knew the answer all along", ''],
  [16, "Let the wind carry this decision forward", ''],
];
const timeoutRows = [timeoutHeader, ...timeoutMessages];
const ws4 = XLSX.utils.aoa_to_sheet(timeoutRows);
ws4['!cols'] = [{ wch: 5 }, { wch: 50 }, { wch: 40 }];
XLSX.utils.book_append_sheet(wb, ws4, 'Timeout Messages');

// ============================================
// SHEET 5: Feedback (placeholder - from memory/DB)
// ============================================
const feedbackHeader = [
  'id', 'sessionId', 'resultsAccurate', 'questionsEngaging', 'wouldShare', 
  'suggestions', 'mbtiType', 'discStyle', 'primaryRole', 'tier', 'mood', 'funMode', 'createdAt'
];
const feedbackRows = [feedbackHeader];
feedbackRows.push(['(Feedback data is stored in memory - run app and submit feedback to populate)', '', '', '', '', '', '', '', '', '', '', '', '']);
const ws5 = XLSX.utils.aoa_to_sheet(feedbackRows);
ws5['!cols'] = [
  { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
  { wch: 40 }, { wch: 8 }, { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 20 }
];
XLSX.utils.book_append_sheet(wb, ws5, 'Feedback');

// ============================================
// SHEET 6: Premium Questions
// ============================================
const premiumHeader = ['id', 'type', 'prompt', 'subtitle', 'option1', 'option2', 'option3', 'path', 'traitA', 'traitB'];
const premiumRows = [premiumHeader];

// Branch Q1
premiumRows.push(['branch1', 'branch', 'Which type of work excites you most?', "Let's narrow down your ideal career path", 
  'Working with my hands', 'Working with ideas & people', 'Creating & expressing', 'all', '', '']);

// Branch Q2 - Trades
premiumRows.push(['branch2-trades', 'branch', "What's your ideal work environment?", 'Trades path refinement',
  'Indoor technical work', 'Outdoor fieldwork', 'Service & repair', 'trades', '', '']);

// Branch Q2 - Professional  
premiumRows.push(['branch2-professional', 'branch', 'What drives your professional satisfaction?', 'Professional path refinement',
  'Strategy & analysis', 'Direct people interaction', 'Systems & processes', 'professional', '', '']);

// Branch Q2 - Creative
premiumRows.push(['branch2-creative', 'branch', 'How do you prefer to express creativity?', 'Creative path refinement',
  'Visual & design', 'Performance & communication', 'Writing & storytelling', 'creative', '', '']);

// Refinement questions
premiumRows.push(['refine1', 'refinement', 'Do you prefer working independently or with a team?', '', 'Solo focus', 'Team energy', '', 'all', 'independent', 'collaborative']);
premiumRows.push(['refine2', 'refinement', 'Fast-paced variety or steady routine?', '', 'Variety & change', 'Consistent routine', '', 'all', 'dynamic', 'stable']);
premiumRows.push(['refine3', 'refinement', 'Would you prefer to lead or support?', '', 'Take the lead', 'Support the team', '', 'all', 'leadership', 'support']);
premiumRows.push(['refine4', 'refinement', 'Details or big picture?', '', 'Precision & details', 'Vision & strategy', '', 'all', 'detail', 'vision']);
premiumRows.push(['refine5-trades', 'refinement', 'Heavy equipment or precision tools?', '', 'Big machinery', 'Fine precision', '', 'trades', 'heavy', 'precision']);
premiumRows.push(['refine5-professional', 'refinement', 'Numbers-driven or intuition-guided?', '', 'Data & metrics', 'Instinct & relationships', '', 'professional', 'analytical', 'intuitive']);
premiumRows.push(['refine5-creative', 'refinement', 'Commercial or artistic?', '', 'Market-focused', 'Pure expression', '', 'creative', 'commercial', 'artistic']);
premiumRows.push(['refine6', 'refinement', 'Physical movement or desk-based?', '', 'On my feet', 'At a desk', '', 'all', 'active', 'sedentary']);
premiumRows.push(['refine7', 'refinement', 'Interact with customers/clients often?', '', 'Yes, regularly', 'Prefer behind-scenes', '', 'all', 'customer-facing', 'backend']);
premiumRows.push(['refine8', 'refinement', 'Traditional path or entrepreneurial?', '', 'Steady career path', 'Build my own thing', '', 'all', 'traditional', 'entrepreneur']);

const ws6 = XLSX.utils.aoa_to_sheet(premiumRows);
ws6['!cols'] = [
  { wch: 20 }, { wch: 12 }, { wch: 50 }, { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
];
XLSX.utils.book_append_sheet(wb, ws6, 'Premium Questions');

// ============================================
// SHEET 7: User Notes (blank for user input)
// ============================================
const notesRows = [
  ['YOUR NOTES & CHANGE REQUESTS'],
  [''],
  ['Use this sheet to document changes you made and what else you want to update.'],
  [''],
  ['CHANGES MADE:'],
  ['- '],
  ['- '],
  ['- '],
  [''],
  ['ADDITIONAL REQUESTS:'],
  ['- '],
  ['- '],
  ['- '],
  [''],
  ['QUESTIONS FOR DEVELOPER:'],
  ['- '],
  ['- '],
  [''],
];
const ws7 = XLSX.utils.aoa_to_sheet(notesRows.map(row => [row]));
ws7['!cols'] = [{ wch: 100 }];
XLSX.utils.book_append_sheet(wb, ws7, 'User Notes');

// Write file
const outputPath = path.join(__dirname, '..', 'KnowRole_Data_Export.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`\n✅ Excel file created: ${outputPath}`);
console.log(`\nWorksheets included:`);
console.log(`  1. Algorithm Docs - Full workflow documentation`);
console.log(`  2. Questions - ${questionsData.questions.length} quiz questions`);
console.log(`  3. Roles - ${Object.keys(rolesData.roles).length * 2} role entries`);
console.log(`  4. Timeout Messages - 16 timeout quips`);
console.log(`  5. Feedback - Template (data stored in memory)`);
console.log(`  6. Premium Questions - 14 premium flow questions`);
console.log(`  7. User Notes - Blank sheet for your notes`);
