/**
 * Result wording follows CLARITY, not the work direction.
 * - Title, type chip, brief and share-card title say "broad" only when clarity is Broad.
 * - A broad work direction with Mixed/Clear clarity only changes the examples header.
 */
export type ClarityLevel = "clear" | "mixed" | "broad" | string;

export function resultWording(opts: { clarityLevel: ClarityLevel; directionBroad: boolean; mbtiType: string; identity: string; arch: string }) {
  const broad = opts.clarityLevel === "broad";
  return {
    broad,
    headline: broad ? "A broad, balanced pattern" : opts.identity,
    archetype: broad ? `${opts.mbtiType}-leaning pattern` : opts.arch,
    emojiBroad: broad,
    showBroadDirectionsCard: broad && opts.directionBroad,
    examplesHeader: opts.directionBroad ? "Directions to sample" : "Examples",
  };
}
