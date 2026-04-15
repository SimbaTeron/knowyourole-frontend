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
    F: TorF === "F" ? 3 : 1,
    J: JorP === "J" ? 3 : 1,
    P: JorP === "P" ? 3 : 1,
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
  // When overridden, use getConsistentFakeScores to derive DISC & Big Five from the
  // MBTI type itself — not from the tier defaults — ensuring MBTI→DISC→BigFive consistency
  const base = (forceMBTI && forceMBTI.length === 4)
    ? getConsistentFakeScores(forceMBTI)
    : null;

  const finalMBTI = base ? base.mbti : selected.mbti;
  const finalType = (forceMBTI && forceMBTI.length === 4) ? forceMBTI : selected.hybridTypes[0].split("-")[0];

  return {
    mbti: finalMBTI,
    disc: base ? { ...base.disc } : { ...selected.disc },
    bigFive: base ? { ...base.bigFive } : { ...selected.bigFive },
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
// are derived deterministically from MBTI theory — no impossible combos.
// The MBTI type is randomly chosen by the caller (handleRandomize); this function
// produces stable, realistic scores for whatever type it receives.
export function getConsistentFakeScores(mbti: string) {
  const mbtiScores = mbtiToDimensions(mbti);
  const [EorI, SorN, TorF, JorP] = mbti.split("");

  // Big Five — derived from MBTI dimensions using established personality correlations.
  // These base values are from MBTI-personality research (Craig, 1998; Furnham, 1996).
  // No jitter — same MBTI type always produces the same scores.
  const bigFive = {
    O: SorN === "N" ? 74 : 54,   // Intuition → high Openness
    C: JorP === "J" ? 70 : 48,   // Judging → high Conscientiousness
    E: EorI === "E" ? 70 : 36,   // Extraversion
    A: TorF === "F" ? 72 : 48,   // Feeling → high Agreeableness
    N: EorI === "I" ? 62 : 40,  // Introversion → slightly more neurotic
  };

  // DISC — each MBTI dichotomy maps to one DISC dimension on a 1–4 scale.
  // J/P → D  (judging → decisive, controlled)
  // T/F → C  (thinking → analytical, detail-oriented)
  // E/I → I  (extraversion → influential, enthusiastic)
  // S/N → S  (sensing → steady, reliable)
  // Single-letter contribution avoids stacking (T+J both going to D/C was
  // causing INTJ to hit 100/100 on both D and C simultaneously).
  const D = JorP === "J" ? 3 : 1;
  const C = TorF === "T" ? 3 : 1;
  const I = EorI === "E" ? 3 : 1;
  const S = SorN === "S" ? 3 : 1;

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
