// Dev test utility — only active on localhost
// Used to test results pages without completing the full quiz

export function isDevTest(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.")
  );
}

export function isTestMode(): boolean {
  // Always show panel on localhost
  if (isDevTest()) return true;
  // Vercel preview deployments: client-*.vercel.app (dev site pattern)
  const host = window.location.hostname;
  if (host.includes('.vercel.app') && host.startsWith('client-')) return true;
  // Require ?test=true on all other public URLs
  return new URLSearchParams(window.location.search).get("test") === "true";
}

export function getTestTier(): string | null {
  if (!isTestMode()) return null;
  return new URLSearchParams(window.location.search).get("tier");
}

export function getTestPage(): number | null {
  if (!isTestMode()) return null;
  const page = new URLSearchParams(window.location.search).get("page");
  return page ? parseInt(page, 10) : null;
}

export function isTestForcePremium(): boolean {
  if (!isTestMode()) return false;
  return new URLSearchParams(window.location.search).get("force") === "true";
}

// Map an MBTI type letter to dimension scores (E/I, S/N, T/F, J/P)
function mbtiToDimensions(mbti: string): { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number } {
  const [EorI, SorN, TorF, JorP] = mbti.split("");
  return {
    E: EorI === "E" ? 3 : 1,
    I: EorI === "I" ? 3 : 1,
    S: SorN === "S" ? 3 : 1,
    N: SorN === "N" ? 3 : 1,
    T: TorF === "T" ? 3 : 1,
    F: TorF === "F" ? 1 : 3,
    J: JorP === "J" ? 3 : 1,
    P: JorP === "P" ? 1 : 3,
  };
}

// Fake personality results per tier — realistic scores for testing
// Each tier maps to a different MBTI type so results vary across tests
// Optionally override the MBTI type (dev panel selector)
export function getFakeScores(tier: string, forceMBTI?: string | null) {
  // Normalize tier key
  const t = tier === "25+" ? "25plus" : tier;

  // Tier-specific base data — each tier has a distinct personality profile
  const tierData: Record<string, {
    mbti: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
    disc: { D: number; I: number; S: number; C: number };
    bigFive: { O: number; C: number; E: number; A: number; N: number };
    hybridTypes: [string, string];
  }> = {
    "7-12": {
      mbti: { E: 3, I: 1, S: 1, N: 3, T: 1, F: 3, J: 1, P: 3 },  // ENFP
      disc: { D: 1, I: 4, S: 2, C: 1 },
      bigFive: { O: 88, C: 55, E: 80, A: 85, N: 30 },
      hybridTypes: ["ENFP-A", "Campaigner"],
    },
    "13-18": {
      mbti: { E: 3, I: 1, S: 1, N: 3, T: 3, F: 1, J: 3, P: 1 },  // ENTJ
      disc: { D: 4, I: 2, S: 1, C: 2 },
      bigFive: { O: 80, C: 75, E: 78, A: 55, N: 35 },
      hybridTypes: ["ENTJ-A", "Commander"],
    },
    "19-25": {
      mbti: { E: 1, I: 3, S: 1, N: 3, T: 1, F: 3, J: 1, P: 3 },  // INFP
      disc: { D: 1, I: 2, S: 3, C: 2 },
      bigFive: { O: 85, C: 65, E: 40, A: 80, N: 45 },
      hybridTypes: ["INFP-A", "Mediator"],
    },
    "25plus": {
      mbti: { E: 1, I: 3, S: 2, N: 3, T: 3, F: 1, J: 3, P: 1 },  // INTJ
      disc: { D: 4, I: 1, S: 2, C: 3 },
      bigFive: { O: 75, C: 85, E: 45, A: 60, N: 38 },
      hybridTypes: ["INTJ-A", "Mastermind"],
    },
  };

  const selected = tierData[t] || tierData["25plus"];

  // Apply MBTI override if dev panel set one (force it regardless of tier)
  const finalMBTI = (forceMBTI && forceMBTI.length === 4) ? mbtiToDimensions(forceMBTI) : selected.mbti;
  const finalType = (forceMBTI && forceMBTI.length === 4) ? forceMBTI : selected.hybridTypes[0].split("-")[0];

  return {
    mbti: finalMBTI,
    disc: { ...selected.disc },
    bigFive: { ...selected.bigFive },
    hybridTypes: (forceMBTI && forceMBTI.length === 4)
      ? [`${forceMBTI}-A`, forceMBTI] as [string, string]
      : selected.hybridTypes,
    responses: Array.from({ length: 25 }, (_, i) => ({
      questionId: i + 1,
      response: i % 2 === 0 ? 0 : 1,
      time: 4000 + Math.random() * 3000,
    })),
    swipeTimes: [],
    averageSwipeTime: 4.2,
    currentDifficulty: "medium",
    engagement: 82,
    wildcardBoost: true,
    criticalWildcard: 3,
    firstPrinciplesWildcard: 2,
  };
}

// ─── Consistent fake scores for dev randomization ─────────────────────────────────
// Generates a full QuizScores object for a given MBTI type where DISC and Big Five
// are derived from MBTI theory — no impossible combinations like an INTJ with
// high Extraversion or a dominant-DISC type with no social energy.
export function getConsistentFakeScores(mbti: string) {
  const mbtiScores = mbtiToDimensions(mbti);
  const [EorI, SorN, TorF, JorP] = mbti.split("");

  const jitter = (base: number) => base + Math.floor(Math.random() * 11) - 5; // ±5

  // Big Five — derived from MBTI dimensions using established personality correlations
  // Each MBTI letter pair has known correlations with Big Five traits in research:
  // E→E (strong), N→O (moderate), T→low-A, F→high-A, J→C (strong), P→low-C
  const bigFive = {
    O: jitter(SorN === "N" ? 74 : 54),        // Intuition → Openness
    C: jitter(JorP === "J" ? 70 : 48),        // Judging → Conscientiousness
    E: jitter(EorI === "E" ? 70 : 36),        // Extraversion
    A: jitter(TorF === "F" ? 72 : 48),        // Feeling → Agreeableness
    N: jitter(EorI === "I" ? 62 : 40),        // Introversion → slightly more neurotic
  };

  // DISC — each MBTI letter independently contributes to one DISC dimension:
  //   E → I (extraverts are influential/social),  I → S (introverts are self-reliant)
  //   N → moderate I (imaginative types draw people in), S → S (practical types are steady)
  //   T → C (thinkers are analytical/conscientious), F → low C (feelers are less systematic)
  //   J → D (judgers are dominant/decisive),        P → low D (perceivers are flexible)
  // Add all four contributions, then add small per-type variation (±2)
  const v = (base: number) => Math.max(1, Math.min(4, base + Math.floor(Math.random() * 5) - 2));

  const D = v((JorP === "J" ? 3 : 1) + (TorF === "T" ? 1 : 0));
  const I = v((EorI === "E" ? 3 : 1) + (SorN === "N" ? 1 : 0));
  const S = v((SorN === "S" ? 3 : 1));
  const C = v((TorF === "T" ? 3 : 1) + (JorP === "J" ? 1 : 0));

  return {
    mbti: mbtiScores,
    disc: { D, I, S, C },
    bigFive,
    hybridTypes: [`${mbti}-A`, mbti] as [string, string],
    responses: Array.from({ length: 25 }, (_, i) => ({
      questionId: i + 1,
      response: i % 2 === 0 ? 0 : 1,
      time: 4000 + Math.random() * 3000,
    })),
    swipeTimes: [],
    averageSwipeTime: 4.2,
    currentDifficulty: "medium",
    engagement: 82,
    wildcardBoost: true,
    criticalWildcard: 3,
    firstPrinciplesWildcard: 2,
  };
}

export function getFakeMBTIType(scores: ReturnType<typeof getFakeScores>): string {
  const { mbti } = scores;
  const E = mbti.E >= mbti.I ? "E" : "I";
  const S = mbti.S >= mbti.N ? "S" : "N";
  const T = mbti.T >= mbti.F ? "T" : "F";
  const J = mbti.J >= mbti.P ? "J" : "P";
  return E + S + T + J;
}

export function getFakeDiscStyle(scores: ReturnType<typeof getFakeScores>): string {
  const { disc } = scores;
  const max = Math.max(disc.D, disc.I, disc.S, disc.C);
  if (disc.D === max) return "D";
  if (disc.I === max) return "I";
  if (disc.S === max) return "S";
  return "C";
}
