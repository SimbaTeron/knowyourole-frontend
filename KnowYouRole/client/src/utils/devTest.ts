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

// Fake personality results per tier — realistic scores for testing
export function getFakeScores(tier: string) {
  const base = {
    mbti: { E: 1, I: 3, S: 2, N: 3, T: 2, F: 2, J: 3, P: 1 },
    disc: { D: 3, I: 2, S: 1, C: 2 },
    bigFive: { O: 78, C: 72, E: 55, A: 68, N: 42 },
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
    hybridTypes: ["INTJ-A" as const, "Strategist" as const],
  };

  switch (tier) {
    case "7-12":
      return {
        ...base,
        mbti: { E: 2, I: 2, S: 3, N: 2, T: 1, F: 3, J: 2, P: 2 },
        disc: { D: 2, I: 3, S: 2, C: 1 },
        bigFive: { O: 85, C: 60, E: 70, A: 80, N: 35 },
        hybridTypes: ["ENFP-A" as const, "Adventurer" as const],
      };
    case "13-18":
      return {
        ...base,
        mbti: { E: 3, I: 2, S: 2, N: 3, T: 2, F: 3, J: 2, P: 2 },
        disc: { D: 2, I: 3, S: 2, C: 1 },
        bigFive: { O: 80, C: 65, E: 72, A: 75, N: 40 },
        hybridTypes: ["ENFP-T" as const, "Explorer" as const],
      };
    case "19-25":
      return {
        ...base,
        mbti: { E: 2, I: 3, S: 2, N: 3, T: 3, F: 1, J: 2, P: 2 },
        disc: { D: 3, I: 2, S: 1, C: 2 },
        bigFive: { O: 82, C: 70, E: 58, A: 65, N: 45 },
        hybridTypes: ["INTJ-A" as const, "Architect" as const],
      };
    case "25+":
    default:
      return {
        ...base,
        mbti: { E: 1, I: 3, S: 2, N: 3, T: 3, F: 1, J: 3, P: 1 },
        disc: { D: 4, I: 1, S: 2, C: 3 },
        bigFive: { O: 75, C: 85, E: 45, A: 60, N: 38 },
        hybridTypes: ["INTJ-A" as const, "Mastermind" as const],
      };
  }
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
