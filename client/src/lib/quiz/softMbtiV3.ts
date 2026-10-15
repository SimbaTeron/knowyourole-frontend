/** Soften MBTI letters to X when an axis is close — used for Broad v3 display. */
export function softMbtiTypeV3(
  mbti: Record<string, number>,
  softGap = 18,
): string {
  const axis = (a: string, b: string) => {
    const av = Number(mbti[a] ?? 0);
    const bv = Number(mbti[b] ?? 0);
    if (Math.abs(av - bv) < softGap) return "X";
    return av >= bv ? a : b;
  };
  return axis("E", "I") + axis("S", "N") + axis("T", "F") + axis("J", "P");
}
