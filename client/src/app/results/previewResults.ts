import { calculateResult } from "@/components/results/resultsData";
import type { QuizScores } from "@/components/Quiz";
import { getFakeScores } from "@/utils/devTest";

type DiscProfile = { D: number; I: number; S: number; C: number };

function normalizeDiscProfile(rawDisc: DiscProfile): DiscProfile {
  const entries = Object.entries(rawDisc) as [keyof DiscProfile, number][];
  const safeEntries = entries.map(([key, value]) => [key, Number.isFinite(value) ? Math.max(0, value) : 0] as const);
  const total = safeEntries.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) return { D: 25, I: 25, S: 25, C: 25 };
  const normalized = safeEntries.map(([key, value]) => {
    const exact = (value / total) * 100;
    return { key, value: Math.floor(exact), remainder: exact % 1 };
  });
  let remainderPoints = 100 - normalized.reduce((sum, item) => sum + item.value, 0);
  [...normalized]
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((item) => {
      if (remainderPoints <= 0) return;
      item.value += 1;
      remainderPoints -= 1;
    });
  return normalized.reduce((next, item) => {
    next[item.key] = Math.max(0, Math.min(100, item.value));
    return next;
  }, { D: 0, I: 0, S: 0, C: 0 } as DiscProfile);
}

function computePrimaryDisc(disc: DiscProfile): string {
  const entries = Object.entries(disc) as [string, number][];
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

/** Same preview fixture the results page builds for ?test=true / ?demo=true. No scoring change. */
export function buildPreviewResults(input: { demo?: boolean; tier?: string | null; forcedMBTI?: string | null }) {
  const testTier = (input.tier || "25+") as "13-18" | "19-25" | "25plus";
  const forcedMBTI = input.forcedMBTI || undefined;
  const fakeScores = getFakeScores(testTier, forcedMBTI);
  const result = calculateResult(fakeScores as unknown as QuizScores, forcedMBTI);
  const bigFive = result.bigFiveProfile;
  const disc = normalizeDiscProfile(fakeScores.disc);
  const primaryDisc = computePrimaryDisc(disc);
  return {
    type: `${result.mbtiType}-${primaryDisc}`,
    tier: testTier,
    bigFive,
    disc,
    mbtiType: result.mbtiType,
    primaryDisc,
    rawScores: fakeScores as unknown as QuizScores,
    isDemo: Boolean(input.demo),
    discDesc: result.discStyle === primaryDisc ? result.discDesc : undefined,
    secondaryDisc: result.secondaryDisc,
    secondaryDiscLabel: result.secondaryDiscLabel,
    secondaryDiscColor: result.secondaryDiscColor,
  };
}

export type PreviewResults = ReturnType<typeof buildPreviewResults>;
