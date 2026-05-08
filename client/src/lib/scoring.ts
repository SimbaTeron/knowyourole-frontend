// ─── Validation Schemas (duplicated from server — no server deps) ─────────────

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

export const HYBRID_THRESHOLD = 1.5;

export const BADGE_DEFINITIONS = [
  { name: "Trailblazer", type: "trait", condition: (s: any) => s.bigFive?.O > 80, icon: "compass", color: "terracotta" },
  { name: "Deep Thinker", type: "trait", condition: (s: any) => s.bigFive?.C > 80, icon: "brain", color: "sage-green" },
  { name: "Social Butterfly", type: "trait", condition: (s: any) => s.bigFive?.E > 80, icon: "users", color: "dusty-blue" },
  { name: "Peacemaker", type: "trait", condition: (s: any) => s.bigFive?.A > 80, icon: "heart", color: "soft-cream" },
  { name: "Speedster", type: "speed", condition: (s: any) => s.averageSwipeTime && s.averageSwipeTime < 3, icon: "zap", color: "amber" },
  { name: "Thoughtful Observer", type: "speed", condition: (s: any) => s.averageSwipeTime && s.averageSwipeTime > 7, icon: "eye", color: "violet" },
  { name: "Balanced Mind", type: "special", condition: (s: any) => s.hybridTypes?.length > 0, icon: "scale", color: "teal" },
  { name: "Quiz Master", type: "streak", condition: (s: any) => s.engagement > 20, icon: "trophy", color: "gold" },
];

export const RESEARCH_NORMS = {
  bigFive: {
    openness: { mean: 50, std: 15 },
    conscientiousness: { mean: 50, std: 15 },
    extraversion: { mean: 50, std: 15 },
    agreeableness: { mean: 50, std: 15 },
    neuroticism: { mean: 50, std: 15 },
  },
};

export function zNormalize(rawScore: number, mean: number, std: number): number {
  const zScore = (rawScore - mean) / std;
  return Math.max(0, Math.min(100, 50 + zScore * 15));
}

// ─── Rate Limiting (in-memory, per-instance Lambda — OK for light traffic) ───

export const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitKey(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
}

export function checkRateLimit(req: Request, limit: number, windowMs: number): boolean {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

// ─── Scoring Logic ────────────────────────────────────────────────────────────

export interface ResponseEntry {
  questionId: number;
  choice: 0 | 1;
  timeSpent?: number;
  sliderValue?: number;
  psych?: string;
  swipeDirection?: "left" | "right";
  [k: string]: unknown;
}

export interface ScoresData {
  mbti: Record<string, number>;
  disc: Record<string, number>;
  bigFive: Record<string, number>;
  responses: ResponseEntry[];
  engagement: number;
  averageSwipeTime: number;
  wildcardBoost?: boolean | number;
  criticalWildcard?: number;
  firstPrinciplesWildcard?: number;
  moodBoosts?: Record<string, number>;
  theme?: string;
  [key: string]: unknown;
}

export interface InputData {
  tier?: string;
  mood?: string;
  funMode?: boolean;
  landmark?: string;
  theme?: string;
  scores: ScoresData;
  [key: string]: unknown;
}

export function calculateResponseConfidence(responses: ResponseEntry[]) {
  const frameworks = ["MBTI", "DISC", "Big5", "Critical", "FirstPrinciples"];
  const targetCounts: Record<string, number> = { MBTI: 14, DISC: 8, Big5: 18, Critical: 1, FirstPrinciples: 1 };
  const confidenceByFramework: Record<string, number> = {};
  const lowConsistencyFlags: string[] = [];

  const frameworkFor = (psych?: string) => {
    if (!psych || psych === "Unknown") return "Unknown";
    if (psych.startsWith("MBTI")) return "MBTI";
    if (psych.startsWith("DISC")) return "DISC";
    if (psych.startsWith("Big5")) return "Big5";
    if (psych === "Critical") return "Critical";
    if (psych === "FirstPrinciples") return "FirstPrinciples";
    return "Unknown";
  };

  const responseValueStrength = (r: ResponseEntry) => {
    if (typeof r.sliderValue === "number") return Math.min(1, Math.abs(r.sliderValue) / 2);
    return 0.75;
  };

  const timeQuality = (time?: number) => {
    if (!Number.isFinite(time ?? NaN)) return 0.75;
    const t = Number(time);
    if (t < 1) return 0.4;
    if (t < 2) return 0.7;
    if (t <= 12) return 1;
    if (t <= 15) return 0.85;
    return 0.65;
  };

  for (const framework of frameworks) {
    const group = responses.filter((r) => frameworkFor(r.psych) === framework);
    const target = targetCounts[framework] || 1;
    const coverage = Math.min(1, group.length / target);
    const metadataCompleteness = group.length === 0 ? 0 : group.filter((r) => Boolean(r.psych) && r.psych !== "Unknown").length / group.length;
    const avgTimeQuality = group.length === 0 ? 0 : group.reduce((sum, r) => sum + timeQuality(r.timeSpent), 0) / group.length;
    const avgResponseStrength = group.length === 0 ? 0 : group.reduce((sum, r) => sum + responseValueStrength(r), 0) / group.length;
    const confidence = Math.round((coverage * 0.45 + metadataCompleteness * 0.25 + avgTimeQuality * 0.2 + avgResponseStrength * 0.1) * 100);

    confidenceByFramework[framework] = Math.max(0, Math.min(100, confidence));
    if (confidenceByFramework[framework] < 55) lowConsistencyFlags.push(framework);
  }

  const overallConfidence = Math.round(
    frameworks.reduce((sum, framework) => sum + confidenceByFramework[framework], 0) / frameworks.length,
  );
  const confidenceLevel = overallConfidence >= 75 ? "high" : overallConfidence >= 55 ? "medium" : "low";

  return {
    confidenceByFramework,
    lowConsistencyFlags,
    overallConfidence,
    confidenceLevel,
    // Compatibility for older consumers: these are confidence ratios now, not Cronbach alpha.
    alphas: Object.fromEntries(Object.entries(confidenceByFramework).map(([key, value]) => [key, Math.round((value / 100) * 100) / 100])),
    overallAlpha: Math.round((overallConfidence / 100) * 100) / 100,
  };
}

export const calculateCronbachAlpha = (_responses: ResponseEntry[], _traitGroup: string): number => 0;
export const calculateTraitConsistency = calculateResponseConfidence;

export function calculatePersonality(data: InputData) {
  const scores = (data.scores || data) as ScoresData;
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

  const cleanMbti = mbtiType.replace(/X/g, (_, i: number) => {
    const pairs: [string, string][] = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
    const idx = mbtiType.indexOf("X");
    const pair = pairs[idx];
    return (mbti[pair[0] as keyof typeof mbti] >= mbti[pair[1] as keyof typeof mbti] ? pair[0] : pair[1]);
  });

  const discEntries = Object.entries(disc) as [string, number][];
  const primaryDisc = discEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const discStyles: Record<string, string> = {
    D: "Direct Driver",
    I: "Inspiring Influencer",
    S: "Steady Supporter",
    C: "Careful Analyst",
  };

  const bigFiveProfile = {
    openness: zNormalize(bigFive.O, RESEARCH_NORMS.bigFive.openness.mean / 10, RESEARCH_NORMS.bigFive.openness.std / 10),
    conscientiousness: zNormalize(bigFive.C, RESEARCH_NORMS.bigFive.conscientiousness.mean / 10, RESEARCH_NORMS.bigFive.conscientiousness.std / 10),
    extraversion: zNormalize(bigFive.E, RESEARCH_NORMS.bigFive.extraversion.mean / 10, RESEARCH_NORMS.bigFive.extraversion.std / 10),
    agreeableness: zNormalize(bigFive.A, RESEARCH_NORMS.bigFive.agreeableness.mean / 10, RESEARCH_NORMS.bigFive.agreeableness.std / 10),
    neuroticism: zNormalize(bigFive.N, RESEARCH_NORMS.bigFive.neuroticism.mean / 10, RESEARCH_NORMS.bigFive.neuroticism.std / 10),
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
  // Mood Mixer is context only; it must not alter final scoring math.
  const moodBoosts = { critical: 0, firstPrinciples: 0 };

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

  const responsesWithPsych = scores.responses.map((r) => ({
    questionId: r.questionId,
    choice: r.choice,
    timeSpent: r.timeSpent,
    sliderValue: r.sliderValue,
    psych: r.psych || "Unknown",
    optionMeta: r.optionMeta as [string, string] | undefined,
    selectedOptionMeta: typeof r.selectedOptionMeta === "string" ? r.selectedOptionMeta : undefined,
    selectedOptionLabel: typeof r.selectedOptionLabel === "string" ? r.selectedOptionLabel : undefined,
    wildcard: typeof r.wildcard === "boolean" ? r.wildcard : undefined,
    boostRange: r.boostRange as [number, number] | undefined,
    is2x: typeof r.is2x === "boolean" ? r.is2x : undefined,
  }));

  const consistency = calculateTraitConsistency(responsesWithPsych);
  const consistencyWarning = consistency.lowConsistencyFlags.length > 0
    ? `Lower confidence signals: ${consistency.lowConsistencyFlags.join(", ")}`
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
    avgResponseTime: scores.responses.reduce((sum: number, r) => sum + (r.timeSpent || 0), 0) / (scores.responses.length || 1),
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
      difficulty: (scores as any).currentDifficulty || "medium",
      fastCount: Array.isArray((scores as any).swipeTimes) ? (scores as any).swipeTimes.filter((t: number) => t < 2).length : 0,
      slowCount: Array.isArray((scores as any).swipeTimes) ? (scores as any).swipeTimes.filter((t: number) => t > 6).length : 0,
    },
    consistency: {
      confidenceByFramework: consistency.confidenceByFramework,
      overallConfidence: consistency.overallConfidence,
      confidenceLevel: consistency.confidenceLevel,
      // Compatibility for older consumers. These values now mirror confidence, not Cronbach alpha.
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

// ─── Input Validation ─────────────────────────────────────────────────────────

export function validateInput(body: unknown): { valid: true; data: InputData } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const b = body as Record<string, unknown>;

  if (!b.scores || typeof b.scores !== "object") {
    return { valid: false, error: "scores object is required" };
  }

  const scores = b.scores as Record<string, unknown>;

  if (!scores.mbti || typeof scores.mbti !== "object") {
    return { valid: false, error: "scores.mbti is required" };
  }
  if (!scores.disc || typeof scores.disc !== "object") {
    return { valid: false, error: "scores.disc is required" };
  }
  if (!scores.bigFive || typeof scores.bigFive !== "object") {
    return { valid: false, error: "scores.bigFive is required" };
  }
  if (!Array.isArray(scores.responses)) {
    return { valid: false, error: "scores.responses must be an array" };
  }

  return {
    valid: true,
    data: {
      tier: typeof b.tier === "string" ? b.tier : undefined,
      mood: typeof b.mood === "string" ? b.mood : undefined,
      funMode: typeof b.funMode === "boolean" ? b.funMode : undefined,
      landmark: typeof b.landmark === "string" ? b.landmark : undefined,
      theme: typeof b.theme === "string" ? b.theme : "compass",
      scores: scores as ScoresData,
    },
  };
}
