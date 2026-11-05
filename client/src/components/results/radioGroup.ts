const RADIO_KEYS = new Set(["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]);

/** Next index for a WAI-ARIA radio group, or null when the key does not move selection. */
export function nextRadioIndex(index: number, length: number, key: string): number | null {
  if (!RADIO_KEYS.has(key) || length <= 0) return null;
  const current = Number.isFinite(index) ? index : 0;
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  if (key === "ArrowRight" || key === "ArrowDown") return (current + 1) % length;
  return (current - 1 + length) % length;
}

/** One tab stop: the checked radio, or the first radio when none is checked. */
export function radioTabIndex(index: number, selectedIndex: number | null): 0 | -1 {
  const active = selectedIndex == null || selectedIndex < 0 ? 0 : selectedIndex;
  return index === active ? 0 : -1;
}
