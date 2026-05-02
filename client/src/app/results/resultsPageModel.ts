import { getFakeScores } from "@/utils/devTest";
import { calculateResult } from "@/components/results/resultsData";
import type { QuizScores } from "@/components/Quiz";
import type { ResultDTO } from "@/lib/results/buildResultDTO";

// Phase 2.2: Badge interface for earned achievements
export interface EarnedBadge {
  name: string;
  type: string;
  icon: string;
  color: string;
}

// ─── Design Tokens (from mockups) ───────────────────────────────────────────
export const C = {
  bg: "#050510",
  cyan: "#00C8FF",
  cyanDim: "rgba(0, 200, 255, 0.6)",
  cyanGlow: "rgba(0, 200, 255, 0.3)",
  purple: "#7800FF",
  purpleDim: "rgba(120, 0, 255, 0.6)",
  pink: "#f472b6",
  gold: "#fbbf24",
  goldLight: "#fde68a",
  teal: "#06b6d4",
  text: "#ffffff",
  textMuted: "rgba(255, 255, 255, 0.5)",
  textDim: "rgba(255, 255, 255, 0.48)",
  glassBg: "rgba(255, 255, 255, 0.04)",
  glassBgHover: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  glassBorderBright: "rgba(255, 255, 255, 0.2)",
  cardRadius: "20px",
} as const;



const ARCHETYPES: Record<string, string> = {
  INTJ: "The Architect", INTP: "The Thinker", ENTJ: "The Commander", ENTP: "The Debater",
  INFJ: "The Advocate", INFP: "The Mediator", ENFJ: "The Protagonist", ENFP: "The Campaigner",
  ISTJ: "The Logistician", ISFJ: "The Defender", ESTJ: "The Executive", ESFJ: "The Consul",
  ISTP: "The Virtuoso", ISFP: "The Adventurer", ESTP: "The Entrepreneur", ESFP: "The Entertainer",
};

export function getArchetype(mbti: string) {
  return ARCHETYPES[mbti] || "The Architect";
}

// MBTI population frequencies (% of US population)
const MBTI_POPULATION: Record<string, number> = {
  ISTJ: 11.6, ISFJ: 13.8, INFJ: 1.5, INTJ: 2.1,
  ISTP: 5.4, ISFP: 8.8, INFP: 4.4, INTP: 3.3,
  ESTP: 4.3, ESFP: 8.5, ENFP: 8.1, ENTP: 3.2,
  ESTJ: 8.7, ESFJ: 12.3, ENFJ: 2.5, ENTJ: 1.8,
};

export function getPopulationPct(mbti: string) {
  return MBTI_POPULATION[mbti] ?? 2.1;
}

export const DISC_COLORS: Record<string, string> = { D: "#ef4444", I: "#fbbf24", S: "#22c55e", C: "#3b82f6" };
export const DISC_LABELS: Record<string, string> = { D: "Dominance", I: "Influence", S: "Steadiness", C: "Conscientiousness" };

// ─── Real scores from URL params, sessionStorage, or localStorage (written by handleQuizComplete) ──
function getStoredScores(): QuizScores | null {
  if (typeof window === "undefined") return null;
  try {
    // FIRST: Check URL params — scores passed via ?scores=<base64> survive page refresh and new tabs
    const urlParams = new URLSearchParams(window.location.search);
    const encodedScores = urlParams.get("scores");
    if (encodedScores) {
      try {
        const decoded = JSON.parse(atob(encodedScores)) as QuizScores;
        if (decoded && typeof decoded === "object") return decoded;
      } catch {
        // Malformed scores param — fall through to sessionStorage
      }
    }
    // SECOND: sessionStorage — written by quiz.tsx handleQuizComplete (kyr_real_scores)
    // and by devTest fake score generation (kyr_fake_scores)
    const raw = sessionStorage.getItem("kyr_real_scores")
      || sessionStorage.getItem("kyr_fake_scores");
    if (!raw) return null;
    return JSON.parse(raw) as QuizScores;
  } catch { return null; }
}

// ─── API result metadata from URL params (written by quiz.tsx handleQuizComplete) ──
function getApiResultFromUrl(): {
  mbtiType?: string;
  discStyle?: string;
  sessionId?: string;
  hasScales?: boolean;
  badges?: EarnedBadge[];
  hybrids?: string[];
} {
  if (typeof window === "undefined") return {};
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const mbtiType = urlParams.get("mbtiType") || undefined;
    const discStyle = urlParams.get("discStyle") || undefined;
    const sessionId = urlParams.get("sessionId") || undefined;
    const hasScales = urlParams.get("hasScales") === "1";
    const badgesRaw = urlParams.get("badges");
    const badges = badgesRaw ? (() => { try { return JSON.parse(badgesRaw) as EarnedBadge[]; } catch { return undefined; } })() : undefined;
    const hybridsRaw = urlParams.get("hybrids");
    const hybrids = hybridsRaw ? (() => { try { return JSON.parse(hybridsRaw) as string[]; } catch { return undefined; } })() : undefined;
    return { mbtiType, discStyle, sessionId, hasScales, badges, hybrids };
  } catch { return {}; }
}

export type ResultsViewModel = {
  type: string;
  tier: string;
  bigFive: { O: number; C: number; E: number; A: number; N: number };
  disc: { D: number; I: number; S: number; C: number };
  mbtiType: string;
  primaryDisc: string;
  rawScores: QuizScores;
  isDemo: boolean;
  sessionId?: string;
  hasScales?: boolean;
  badges?: EarnedBadge[];
  hybrids?: string[];
};

function isQuizScores(value: unknown): value is QuizScores {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<QuizScores>;
  const mbti = candidate.mbti as Record<string, unknown> | undefined;
  const disc = candidate.disc as Record<string, unknown> | undefined;
  const bigFive = candidate.bigFive as Record<string, unknown> | undefined;
  return !!mbti && !!disc && !!bigFive
    && (["E", "I", "S", "N", "T", "F", "J", "P"] as const).every((key) => typeof mbti[key] === "number")
    && (["D", "I", "S", "C"] as const).every((key) => typeof disc[key] === "number")
    && (["O", "C", "E", "A", "N"] as const).every((key) => typeof bigFive[key] === "number");
}

function getResultDTOFromSessionStorage(): ResultDTO | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("kyr_result_dto");
    if (!raw) return null;
    const dto = JSON.parse(raw) as ResultDTO;
    const hasRequiredDTOShape = dto?.version?.schemaVersion === "1.0.0"
      && typeof dto?.meta?.sessionId === "string"
      && typeof dto?.scores?.mbti?.type === "string"
      && typeof dto?.scores?.disc?.primary === "string"
      && !!dto?.scores?.bigFive?.traits
      && isQuizScores(dto.raw?.legacyScores);
    return hasRequiredDTOShape ? dto : null;
  } catch {
    return null;
  }
}

function mapResultDTOToViewModel(dto: ResultDTO): ResultsViewModel {
  const mbtiType = dto.scores.mbti.type;
  const primaryDisc = dto.scores.disc.primary === "Balanced" ? "C" : dto.scores.disc.primary;
  const rawScores = dto.raw.legacyScores as QuizScores;

  return {
    type: `${mbtiType}-${primaryDisc}`,
    tier: dto.raw.tier,
    bigFive: {
      O: dto.scores.bigFive.traits.O.normalized,
      C: dto.scores.bigFive.traits.C.normalized,
      E: dto.scores.bigFive.traits.E.normalized,
      A: dto.scores.bigFive.traits.A.normalized,
      N: dto.scores.bigFive.traits.N.normalized,
    },
    disc: {
      D: Math.round(dto.scores.disc.scores.D.normalized),
      I: Math.round(dto.scores.disc.scores.I.normalized),
      S: Math.round(dto.scores.disc.scores.S.normalized),
      C: Math.round(dto.scores.disc.scores.C.normalized),
    },
    mbtiType,
    primaryDisc,
    rawScores,
    isDemo: false,
    sessionId: dto.meta.sessionId,
  };
}

export function useRealResults() {
  const resultDTO = getResultDTOFromSessionStorage();
  if (resultDTO) {
    const viewModel = mapResultDTOToViewModel(resultDTO);
    console.log("[Results] Loaded from ResultDTO", {
      resultId: resultDTO.meta.resultId,
      sessionId: resultDTO.meta.sessionId,
      mbtiType: viewModel.mbtiType,
      primaryDisc: viewModel.primaryDisc,
    });
    return viewModel;
  }

  console.log("[Results] Using legacy fallback");
  const scores = getStoredScores();
  const apiResult = getApiResultFromUrl();
  const tier = (typeof window !== "undefined" ? sessionStorage.getItem("kyr_tier") : null) || "25+";

  // No stored scores — in test or demo mode, generate fake scores inline
  if (!scores) {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const inTestMode = urlParams.get("test") === "true";
    const inDemoMode = urlParams.get("demo") === "true";
    if (inTestMode || inDemoMode) {
      const testTier = (urlParams.get("tier") || tier) as "7-12" | "13-18" | "19-25" | "25plus";
      // Read MBTI override from sessionStorage (set by dev panel's MBTI selector)
      const forcedMBTI = (typeof window !== "undefined" ? sessionStorage.getItem("kyr_fake_mbti") : null) || undefined;
      const fakeScores = getFakeScores(testTier, forcedMBTI);
      // Use calculateResult for consistent real scoring (MBTI, DISC, Big Five percentiles)
      // Pass forcedMBTI so calculateResult uses it instead of deriving from dimensions
      const result = calculateResult(fakeScores as unknown as QuizScores);
      const primaryDisc = result.discStyle;
      const type = `${result.mbtiType}-${primaryDisc}`;
      const bigFive = result.bigFiveProfile;
      const disc = {
        D: Math.round((fakeScores.disc.D / 4) * 100),
        I: Math.round((fakeScores.disc.I / 4) * 100),
        S: Math.round((fakeScores.disc.S / 4) * 100),
        C: Math.round((fakeScores.disc.C / 4) * 100),
      };
      return { type, tier: testTier, bigFive, disc, mbtiType: result.mbtiType, primaryDisc, rawScores: fakeScores as unknown as QuizScores, isDemo: inDemoMode };
    }
    // Not test or demo mode — redirect to quiz
    if (typeof window !== "undefined") {
      window.location.href = "/quiz";
    }
    return null;
  }

  const result = calculateResult(scores);
  // Prefer API-computed types from URL params if available (avoids any client/server scoring mismatch)
  const mbtiType = apiResult.mbtiType ?? result.mbtiType;
  const primaryDisc = apiResult.discStyle ?? result.discStyle;
  const type = `${mbtiType}-${primaryDisc}`;
  const bigFive = result.bigFiveProfile;
  const disc = {
    D: Math.round((scores.disc.D / 4) * 100),
    I: Math.round((scores.disc.I / 4) * 100),
    S: Math.round((scores.disc.S / 4) * 100),
    C: Math.round((scores.disc.C / 4) * 100),
  };
  // Detect ?demo=true in URL (used by Stripe demo/preview redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const isDemo = urlParams.get("demo") === "true";

  return {
    type,
    tier,
    bigFive,
    disc,
    mbtiType,
    primaryDisc,
    rawScores: scores,
    isDemo,
    sessionId: apiResult.sessionId,
    hasScales: apiResult.hasScales ?? false,
    badges: apiResult.badges,
    hybrids: apiResult.hybrids,
  };
}
