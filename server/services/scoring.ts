import {
  RESEARCH_NORMS, zNormalize, HYBRID_THRESHOLD, BADGE_DEFINITIONS,
  calculateTraitConsistency, type ResponseItem, type QuizSubmit,
} from "./schemas";

export {
  checkRateLimit, quizSubmitSchema, type QuizSubmit,
  RESEARCH_NORMS, zNormalize, HYBRID_THRESHOLD, BADGE_DEFINITIONS,
  calculateCronbachAlpha, calculateTraitConsistency,
  type ResponseItem, rateLimitStore, getRateLimitKey,
  quizScoresSchema,
} from "./schemas";

export const MBTI_LABELS: Record<string, { title: string; spark: string }> = {
  INTJ: { title: "Strategic Visionary", spark: "You see patterns others miss" },
  INTP: { title: "Logic Architect", spark: "Your mind builds frameworks for everything" },
  ENTJ: { title: "Decisive Commander", spark: "You turn chaos into organized action" },
  ENTP: { title: "Innovation Catalyst", spark: "Every problem is a puzzle you love" },
  INFJ: { title: "Insightful Guide", spark: "You understand what people don't say" },
  INFP: { title: "Authentic Dreamer", spark: "Your values light your unique path" },
  ENFJ: { title: "Inspiring Mentor", spark: "You bring out the best in others" },
  ENFP: { title: "Possibility Explorer", spark: "Your enthusiasm is contagious" },
  ISTJ: { title: "Reliable Guardian", spark: "Your consistency builds trust" },
  ISFJ: { title: "Caring Protector", spark: "You remember what matters to people" },
  ESTJ: { title: "Efficient Organizer", spark: "You make things happen" },
  ESFJ: { title: "Harmonious Host", spark: "You create belonging everywhere" },
  ISTP: { title: "Practical Problem-Solver", spark: "You fix things others give up on" },
  ISFP: { title: "Gentle Artisan", spark: "You find beauty in the everyday" },
  ESTP: { title: "Dynamic Doer", spark: "You thrive in the moment" },
  ESFP: { title: "Joyful Entertainer", spark: "Your energy lifts every room" },
};

export function calculatePersonality(data: any) {
  const scores = data.scores || data;
  const { mbti, disc, bigFive } = scores;
  
  const hybridTypes: string[] = [];
  
  if (Math.abs(mbti.E - mbti.I) < HYBRID_THRESHOLD) hybridTypes.push("Ambivert");
  if (Math.abs(mbti.S - mbti.N) < HYBRID_THRESHOLD) hybridTypes.push("Ambi-Sensing");
  if (Math.abs(mbti.T - mbti.F) < HYBRID_THRESHOLD) hybridTypes.push("Ambi-Thinking");
  if (Math.abs(mbti.J - mbti.P) < HYBRID_THRESHOLD) hybridTypes.push("Ambi-Judging");
  
  const mbtiLetter = (a: string, b: string, scoreA: number, scoreB: number) => {
    if (Math.abs(scoreA - scoreB) < HYBRID_THRESHOLD) return "X";
    return scoreA > scoreB ? a : b;
  };
  
  const mbtiType = [
    mbtiLetter("E", "I", mbti.E, mbti.I),
    mbtiLetter("S", "N", mbti.S, mbti.N),
    mbtiLetter("T", "F", mbti.T, mbti.F),
    mbtiLetter("J", "P", mbti.J, mbti.P),
  ].join("");
  
  const cleanMbti = mbtiType
    .replace(/X/g, (_, i) => {
      const pairs = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
      const idx = mbtiType.indexOf("X");
      const pair = pairs[idx];
      return mbti[pair[0] as keyof typeof mbti] >= mbti[pair[1] as keyof typeof mbti] ? pair[0] : pair[1];
    });

  const discEntries = Object.entries(disc) as [string, number][];
  const primaryDisc = discEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const discStyles: Record<string, string> = {
    D: "Direct Driver",
    I: "Inspiring Influencer", 
    S: "Steady Supporter",
    C: "Careful Analyst",
  };

  const rawBigFive = {
    openness: bigFive.O,
    conscientiousness: bigFive.C,
    extraversion: bigFive.E,
    agreeableness: bigFive.A,
    neuroticism: bigFive.N,
  };
  
  const bigFiveProfile = {
    openness: zNormalize(rawBigFive.openness, RESEARCH_NORMS.bigFive.openness.mean / 10, RESEARCH_NORMS.bigFive.openness.std / 10),
    conscientiousness: zNormalize(rawBigFive.conscientiousness, RESEARCH_NORMS.bigFive.conscientiousness.mean / 10, RESEARCH_NORMS.bigFive.conscientiousness.std / 10),
    extraversion: zNormalize(rawBigFive.extraversion, RESEARCH_NORMS.bigFive.extraversion.mean / 10, RESEARCH_NORMS.bigFive.extraversion.std / 10),
    agreeableness: zNormalize(rawBigFive.agreeableness, RESEARCH_NORMS.bigFive.agreeableness.mean / 10, RESEARCH_NORMS.bigFive.agreeableness.std / 10),
    neuroticism: zNormalize(rawBigFive.neuroticism, RESEARCH_NORMS.bigFive.neuroticism.mean / 10, RESEARCH_NORMS.bigFive.neuroticism.std / 10),
  };

  let proxyNudge = "";
  if ((data.theme || scores.theme) === "random") {
    proxyNudge = "Openness boost detected";
    bigFiveProfile.openness = Math.min(100, bigFiveProfile.openness + 5);
  }

  if (scores.wildcardBoost) {
    proxyNudge = proxyNudge ? `${proxyNudge}, Wildcard engaged` : "Wildcard engaged";
  }

  const mbtiInfo = MBTI_LABELS[cleanMbti] || MBTI_LABELS[mbtiType.replace(/X/g, "I")] || MBTI_LABELS.INTP;

  const mbtiTotal = mbti.E + mbti.I + mbti.S + mbti.N + mbti.T + mbti.F + mbti.J + mbti.P;
  const discTotal = disc.D + disc.I + disc.S + disc.C;
  
  const PROXY_WEIGHTS = {
    critical: { mbtiT: 0.4, big5O: 0.4, discC: 0.2 },
    firstPrinciples: { mbtiN: 0.4, big5O: 0.4, discI: 0.2 },
  };
  
  const mbtiT_pct = mbtiTotal > 0 ? (mbti.T / (mbti.T + mbti.F)) * 100 : 50;
  const mbtiN_pct = mbtiTotal > 0 ? (mbti.N / (mbti.S + mbti.N)) * 100 : 50;
  const big5O_pct = bigFiveProfile.openness;
  const discC_pct = discTotal > 0 ? (disc.C / discTotal) * 100 : 25;
  const discI_pct = discTotal > 0 ? (disc.I / discTotal) * 100 : 25;
  
  const criticalWildcardBoost = (scores.criticalWildcard || 0) * 20;
  const firstPrinciplesWildcardBoost = (scores.firstPrinciplesWildcard || 0) * 20;
  
  const moodBoosts = scores.moodBoosts || { critical: 0, firstPrinciples: 0 };
  
  const criticalProxy = (mbtiT_pct * PROXY_WEIGHTS.critical.mbtiT) + 
                        (big5O_pct * PROXY_WEIGHTS.critical.big5O) + 
                        (discC_pct * PROXY_WEIGHTS.critical.discC);
  const firstPrinciplesProxy = (mbtiN_pct * PROXY_WEIGHTS.firstPrinciples.mbtiN) + 
                               (big5O_pct * PROXY_WEIGHTS.firstPrinciples.big5O) + 
                               (discI_pct * PROXY_WEIGHTS.firstPrinciples.discI);
  
  const criticalRaw = (criticalProxy * 0.8) + (criticalWildcardBoost * 0.2) + moodBoosts.critical;
  const firstPrinciplesRaw = (firstPrinciplesProxy * 0.8) + (firstPrinciplesWildcardBoost * 0.2) + moodBoosts.firstPrinciples;
  
  const toScale = (pct: number) => Math.max(1, Math.min(5, Math.round(pct / 20)));
  
  const criticalScale = toScale(criticalRaw);
  const firstPrinciplesScale = toScale(firstPrinciplesRaw);

  const CRITICAL_QUESTS = [
    "Question one 'obvious' fact today",
    "Debate 1 belief you hold",
    "Ask 'why' three times in a row",
    "Find the flaw in a popular argument",
    "Play devil's advocate once today",
  ];
  
  const FIRST_PRINCIPLES_QUESTS = [
    "Break a problem into its atoms",
    "Rebuild one idea from scratch",
    "Ask 'what if we started over?'",
    "Strip away assumptions on 1 topic",
    "Define the core truth beneath",
  ];

  const badgeCheckData = {
    bigFive: bigFiveProfile,
    averageSwipeTime: scores.averageSwipeTime,
    hybridTypes,
    engagement: scores.engagement,
  };
  const earnedBadges = BADGE_DEFINITIONS
    .filter(badge => badge.condition(badgeCheckData))
    .map(badge => ({
      name: badge.name,
      type: badge.type,
      icon: badge.icon,
      color: badge.color,
    }));

  const responsesWithPsych: ResponseItem[] = scores.responses.map((r: any) => ({
    questionId: r.questionId,
    choice: r.choice,
    sliderValue: r.sliderValue,
    psych: r.psych || 'Unknown',
  }));
  
  const consistency = calculateTraitConsistency(responsesWithPsych);
  const consistencyWarning = consistency.lowConsistencyFlags.length > 0 
    ? `Balanced View - Retake for clarity on: ${consistency.lowConsistencyFlags.join(', ')}`
    : null;

  const sessionId = `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  return {
    sessionId,
    mbtiType,
    mbtiBlend: `${mbtiType}-${primaryDisc}`,
    discStyle: discStyles[primaryDisc] || "Balanced",
    bigFive: {
      O: Math.round(bigFiveProfile.openness),
      C: Math.round(bigFiveProfile.conscientiousness),
      E: Math.round(bigFiveProfile.extraversion),
      A: Math.round(bigFiveProfile.agreeableness),
      N: Math.round(bigFiveProfile.neuroticism),
    },
    bigFiveProfile,
    title: mbtiInfo.title,
    spark: mbtiInfo.spark,
    proxyNudge,
    engagement: scores.engagement,
    totalQuestions: scores.responses.length,
    avgResponseTime: scores.responses.reduce((a: any, b: any) => a + b.timeSpent, 0) / (scores.responses.length || 1),
    criticalThinking: criticalScale,
    firstPrinciples: firstPrinciplesScale,
    criticalScale,
    firstPrinciplesScale,
    criticalQuest: CRITICAL_QUESTS[criticalScale - 1],
    firstPrinciplesQuest: FIRST_PRINCIPLES_QUESTS[firstPrinciplesScale - 1],
    scales: {
      critical: {
        value: criticalScale,
        traits: "T/O dissects sharply",
        quest: CRITICAL_QUESTS[criticalScale - 1],
      },
      firstPrinciples: {
        value: firstPrinciplesScale,
        traits: "N/O rebuilds from ground up",
        quest: FIRST_PRINCIPLES_QUESTS[firstPrinciplesScale - 1],
      },
    },
    hybridTypes,
    earnedBadges,
    traitConsistency: consistency,
    swipeAnalytics: {
      averageTime: scores.averageSwipeTime || 0,
      difficulty: scores.currentDifficulty || "medium",
      fastCount: scores.swipeTimes?.filter((t: number) => t < 2).length || 0,
      slowCount: scores.swipeTimes?.filter((t: number) => t > 6).length || 0,
    },
    consistency: {
      alphas: consistency.alphas,
      overallAlpha: consistency.overallAlpha,
      lowConsistencyFlags: consistency.lowConsistencyFlags,
      warning: consistencyWarning,
    },
    proxyBreakdown: {
      critical: {
        mbtiT: Math.round(mbtiT_pct),
        big5O: Math.round(big5O_pct),
        discC: Math.round(discC_pct),
        weighted: Math.round(criticalProxy),
        final: Math.round(Math.max(0, Math.min(100, criticalRaw))),
      },
      firstPrinciples: {
        mbtiN: Math.round(mbtiN_pct),
        big5O: Math.round(big5O_pct),
        discI: Math.round(discI_pct),
        weighted: Math.round(firstPrinciplesProxy),
        final: Math.round(Math.max(0, Math.min(100, firstPrinciplesRaw))),
      },
    },
  };
}

export function calculateArcEvolution(results: any[]): any {
  if (results.length < 2) return null;
  
  const sorted = [...results].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  
  const traitNames = ['O', 'C', 'E', 'A', 'N'];
  const traitLabels: Record<string, string> = {
    O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', 
    A: 'Agreeableness', N: 'Neuroticism'
  };
  
  const changes: Array<{ trait: string; label: string; change: number; direction: string; insight: string }> = [];
  
  for (const trait of traitNames) {
    const firstVal = first[`bigFive${trait}`] || 50;
    const latestVal = latest[`bigFive${trait}`] || 50;
    const change = latestVal - firstVal;
    
    if (Math.abs(change) >= 5) {
      const direction = change > 0 ? 'up' : 'down';
      const insight = getTraitChangeInsight(trait, change);
      changes.push({
        trait,
        label: traitLabels[trait],
        change: Math.round(change),
        direction,
        insight
      });
    }
  }
  
  changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  
  return {
    totalQuizzes: results.length,
    firstQuizDate: first.createdAt,
    latestQuizDate: latest.createdAt,
    mbtiEvolution: {
      first: first.mbtiType,
      latest: latest.mbtiType,
      changed: first.mbtiType !== latest.mbtiType
    },
    significantChanges: changes.slice(0, 3),
    timeline: sorted.map((r, i) => ({
      index: i + 1,
      date: r.createdAt,
      mbtiType: r.mbtiType,
      bigFive: {
        O: r.bigFiveO,
        C: r.bigFiveC,
        E: r.bigFiveE,
        A: r.bigFiveA,
        N: r.bigFiveN
      }
    }))
  };
}

export function getTraitChangeInsight(trait: string, change: number): string {
  const insights: Record<string, { up: string; down: string }> = {
    O: { 
      up: "Creative roles expanding! You're more open to new experiences.", 
      down: "Becoming more focused and practical in your approach." 
    },
    C: { 
      up: "Your organizational skills are growing stronger!", 
      down: "Embracing more flexibility and spontaneity." 
    },
    E: { 
      up: "Social confidence rising! Leadership roles may suit you better now.", 
      down: "Finding value in deeper, more focused connections." 
    },
    A: { 
      up: "Your collaborative side is flourishing!", 
      down: "Developing stronger boundaries and assertiveness." 
    },
    N: { 
      up: "Increased emotional sensitivity - use it for empathy.", 
      down: "Growing emotional resilience - stress management improving!" 
    }
  };
  
  return change > 0 ? insights[trait]?.up : insights[trait]?.down;
}

export function analyzeRoleFitFromDB(roleData: any, bigFive: any, mbtiType: string, discStyle: string): any {
  const idealTraits: Record<string, { ideal: number; weight: number }> = {
    O: { ideal: roleData.big5O * 20, weight: 0.2 },
    C: { ideal: roleData.big5C * 20, weight: 0.2 },
    E: { ideal: roleData.big5E * 20, weight: 0.2 },
    A: { ideal: roleData.big5A * 20, weight: 0.2 },
    N: { ideal: roleData.big5N * 20, weight: 0.2 },
  };

  const pros: string[] = [];
  const cons: string[] = [];

  const traitLabels: Record<string, string> = {
    O: 'Creativity', C: 'Organization', E: 'Social Energy', A: 'Collaboration', N: 'Stress Handling'
  };

  for (const [trait, config] of Object.entries(idealTraits)) {
    const userVal = bigFive[trait] || 50;
    const diff = userVal - config.ideal;
    const label = traitLabels[trait];

    if (Math.abs(diff) <= 15) {
      pros.push(`${label}: Well-aligned (${userVal}% vs ${config.ideal}% ideal)`);
    } else if (diff > 15) {
      if (trait === 'N') {
        cons.push(`Sensitivity: May feel role stress more intensely`);
      } else {
        pros.push(`${label}: Strong natural fit (${userVal}%)`);
      }
    } else {
      if (trait === 'N') {
        pros.push(`Stress resilience: Natural calm under pressure`);
      } else {
        cons.push(`${label}: May need development (${userVal}% vs ${config.ideal}% ideal)`);
      }
    }
  }

  let matchScore = 0;
  let totalWeight = 0;
  for (const [trait, config] of Object.entries(idealTraits)) {
    const userVal = bigFive[trait] || 50;
    const diff = Math.abs(userVal - config.ideal);
    const traitScore = Math.max(0, 100 - diff * 1.5);
    matchScore += traitScore * config.weight;
    totalWeight += config.weight;
  }
  matchScore = Math.round(matchScore / totalWeight);

  const collarTips: Record<string, string[]> = {
    'white': ["Build cross-functional communication skills", "Develop strategic thinking habits", "Practice time management techniques"],
    'blue': ["Invest in safety and certification training", "Build physical endurance routines", "Develop problem-solving under pressure"],
    'healthcare': ["Build emotional boundaries", "Practice active listening", "Develop stress coping strategies"],
    'service': ["Strengthen customer interaction skills", "Build patience and adaptability", "Practice conflict de-escalation"],
    'arts': ["Develop business and self-promotion skills", "Build a support network", "Create sustainable creative routines"],
  };

  const tips = collarTips[roleData.jobCollar] || collarTips['white'];

  return {
    dreamRole: roleData.roleName,
    matchScore,
    pros: pros.slice(0, 4),
    cons: cons.slice(0, 3),
    tips: tips.slice(0, 3),
    verdict: matchScore >= 70 ? 'Strong Fit' : matchScore >= 50 ? 'Moderate Fit' : 'Growth Opportunity'
  };
}
