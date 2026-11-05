/**
 * Unseeded id entropy.
 * ESLint allows Math.random only in this file. Tests and shuffles use a seeded RNG instead.
 */
export function randomIdToken(endExclusive: number): string {
  return Math.random().toString(36).slice(2, endExclusive);
}
