/**
 * Share-card text layout. The canvas used to stop at a line cap and drop the
 * rest of the sentence. This wraps, then shrinks the type until every word
 * fits in the box.
 */

export type TextMeasure = (text: string, fontSize: number) => number;

export const SHARE_WHY_BOX = {
  maxWidth: 810,
  maxHeight: 72,
  startSize: 22,
  minSize: 11,
  lineHeightRatio: 1.2,
} as const;

export const SHARE_SIGNAL_BOX = {
  maxWidth: 800,
  maxHeight: 70,
  startSize: 29,
  minSize: 13,
  lineHeightRatio: 1.18,
} as const;

export function wrapText(text: string, fontSize: number, maxWidth: number, measure: TextMeasure): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, fontSize) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function fitWrappedText(opts: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  startSize: number;
  minSize: number;
  lineHeightRatio: number;
  measure: TextMeasure;
}): { fontSize: number; lineHeight: number; lines: string[]; fits: boolean } {
  const text = opts.text.trim().replace(/\s+/g, " ");
  let smallest = {
    fontSize: opts.minSize,
    lineHeight: opts.minSize,
    lines: text ? [text] : [],
    fits: text.length === 0,
  };
  for (let size = opts.startSize; size >= opts.minSize; size -= 1) {
    const lineHeight = Math.max(size + 1, Math.round(size * opts.lineHeightRatio));
    const lines = text ? wrapText(text, size, opts.maxWidth, opts.measure) : [];
    const widthOk = lines.every((line) => opts.measure(line, size) <= opts.maxWidth + 0.01);
    const heightOk = lines.length * lineHeight <= opts.maxHeight;
    const fits = widthOk && heightOk && lines.join(" ") === text;
    const candidate = { fontSize: size, lineHeight, lines, fits };
    if (fits) return candidate;
    smallest = candidate;
  }
  return smallest;
}
