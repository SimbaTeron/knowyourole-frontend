import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/app/api/_lib/scoring';

type ReportSection = {
  title: string;
  subtitle?: string;
  body?: string;
  items?: { label: string; value: string; detail?: string }[];
};

type ReportPayload = {
  sessionId?: string;
  title?: string;
  subtitle?: string;
  mbtiType?: string;
  archetype?: string;
  primaryDisc?: string;
  population?: string;
  career?: { title?: string; salary?: string; summary?: string };
  bigFive?: Record<string, number>;
  disc?: Record<string, number>;
  sections?: ReportSection[];
};

// Current Orbital Glass result system: dark ink, cyan signal, and a warm best-fit card.
const COLORS = {
  bg: { r: 0.027, g: 0.039, b: 0.071 }, // #070a12
  card: { r: 0.047, g: 0.071, b: 0.114 }, // dark glass base
  card2: { r: 0.071, g: 0.12, b: 0.18 },
  cream: { r: 1, g: 0.973, b: 0.91 }, // #fff8e8
  creamBorder: { r: 0.956, g: 0.875, b: 0.706 }, // #f4dfb4
  border: { r: 0.18, g: 0.235, b: 0.31 },
  cyan: { r: 0.322, g: 0.945, b: 1 }, // #52f1ff
  purple: { r: 1, g: 0.835, b: 0.506 }, // #ffd581, legacy key retained for call sites
  pink: { r: 1, g: 0.835, b: 0.506 },
  gold: { r: 1, g: 0.835, b: 0.506 },
  green: { r: 0.42, g: 0.86, b: 0.67 },
  text: { r: 0.973, g: 0.984, b: 1 }, // #f8fbff
  ink: { r: 0.082, g: 0.067, b: 0.047 }, // #15110c
  muted: { r: 0.69, g: 0.75, b: 0.82 },
  dim: { r: 0.49, g: 0.56, b: 0.66 },
  track: { r: 0.12, g: 0.17, b: 0.24 },
};

const DISC_LABELS: Record<string, string> = {
  D: 'Dominance',
  I: 'Influence',
  S: 'Steadiness',
  C: 'Conscientiousness',
};

const BRAND_URL = 'knowyourole.com';

const BIG_FIVE_LABELS: Record<string, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extroversion',
  A: 'Agreeableness',
  N: 'Stress Radar',
};

const MBTI_DIMENSIONS = [
  { label: 'Mind', left: 'E', right: 'I' },
  { label: 'Energy', left: 'N', right: 'S' },
  { label: 'Nature', left: 'T', right: 'F' },
  { label: 'Tactics', left: 'J', right: 'P' },
];

function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapText(text: string, maxChars: number): string[] {
  const words = cleanText(text).split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function clampScore(value: unknown) {
  const n = Number(value ?? 0);
  return Math.max(0, Math.min(100, Number.isFinite(n) ? Math.round(n) : 0));
}

function topEntry(scores: Record<string, number> | undefined, fallback: [string, number]): [string, number] {
  const entries = Object.entries(scores ?? {}).map(([key, value]) => [key, clampScore(value)] as [string, number]);
  return entries.length ? entries.reduce((best, next) => (next[1] > best[1] ? next : best)) : fallback;
}

// POST /api/generate-pdf — Generate a compact, shareable Full Portrait PDF.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload: ReportPayload = body.report ?? body;
    const rawIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'anonymous';
    const rateKey = cleanText(payload.sessionId || rawIp || 'anonymous').slice(0, 96);
    if (!checkRateLimit(`pdf:${rateKey}`, 30, 3600000)) {
      return NextResponse.json(
        { error: 'PDF download limit reached for this result. Wait a bit, then try again.' },
        { status: 429 }
      );
    }

    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(cleanText(payload.title || 'KnowYouRole Full Portrait'));
    pdfDoc.setSubject('Compact KnowYouRole Full Portrait share card');
    pdfDoc.setCreator('KnowYouRole');
    pdfDoc.setProducer('KnowYouRole');

    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const pageSize: [number, number] = [612, 792];
    const margin = 42;
    const contentWidth = pageSize[0] - margin * 2;
    const color = (key: keyof typeof COLORS) => rgb(COLORS[key].r, COLORS[key].g, COLORS[key].b);

    let page = pdfDoc.addPage(pageSize);
    let y = pageSize[1] - margin;
    let pageNo = 1;

    const mbtiType = cleanText(payload.mbtiType || 'TYPE');
    const archetype = cleanText(payload.archetype || payload.subtitle || 'Your Personality Pattern');
    const primaryDisc = cleanText(payload.primaryDisc || topEntry(payload.disc, ['D', 0])[0]).slice(0, 1).toUpperCase();
    const discLabel = DISC_LABELS[primaryDisc] || 'Operating Style';
    const [topBigFiveKey, topBigFiveScore] = topEntry(payload.bigFive, ['O', 0]);
    const topBigFiveLabel = BIG_FIVE_LABELS[topBigFiveKey] || topBigFiveKey;
    const careerTitle = cleanText(payload.career?.title || 'Career Direction');
    const careerSalary = cleanText(payload.career?.salary || '');
    const careerSummary = cleanText(payload.career?.summary || `Strong match for your ${mbtiType} pattern, ${primaryDisc} operating style, and ${topBigFiveLabel} signal.`);

    const discAccent = primaryDisc === 'D' ? 'pink' : primaryDisc === 'I' ? 'gold' : primaryDisc === 'S' ? 'green' : 'cyan';
    const bigFiveEntries = [
      ['Openness', payload.bigFive?.O ?? 0, 'cyan'],
      ['Conscientiousness', payload.bigFive?.C ?? 0, 'purple'],
      ['Extroversion', payload.bigFive?.E ?? 0, 'pink'],
      ['Agreeableness', payload.bigFive?.A ?? 0, 'gold'],
      ['Stress Radar', payload.bigFive?.N ?? 0, 'dim'],
    ] as const;

    const paintBackground = () => {
      page.drawRectangle({ x: 0, y: 0, width: pageSize[0], height: pageSize[1], color: color('bg') });
      // Soft orbital fields replace the legacy purple/neon ambience.
      page.drawCircle({ x: 28, y: 736, size: 188, color: color('cyan'), opacity: 0.055 });
      page.drawCircle({ x: 586, y: 675, size: 214, color: color('gold'), opacity: 0.045 });
      page.drawCircle({ x: 532, y: 85, size: 174, color: color('cyan'), opacity: 0.035 });
      page.drawCircle({ x: 306, y: 493, size: 213, borderColor: color('cyan'), borderWidth: 0.7, borderOpacity: 0.12 });
      page.drawCircle({ x: 306, y: 493, size: 153, borderColor: color('gold'), borderWidth: 0.6, borderOpacity: 0.1 });
      page.drawRectangle({ x: margin, y: 27, width: contentWidth, height: 1, color: color('border') });
      page.drawText('KnowYouRole', { x: margin, y: 12, size: 8, font: bold, color: color('muted') });
      page.drawText('knowyourole.com', { x: pageSize[0] - margin - 78, y: 12, size: 8, font: bold, color: color('cyan') });
    };

    const truncateToWidth = (text: string, fontRef: typeof regular, size: number, maxWidth: number) => {
      const safe = cleanText(text);
      if (fontRef.widthOfTextAtSize(safe, size) <= maxWidth) return safe;
      let out = safe;
      while (out.length > 1 && fontRef.widthOfTextAtSize(`${out}...`, size) > maxWidth) out = out.slice(0, -1).trimEnd();
      return `${out}...`;
    };

    const wrapByWidth = (text: string, fontRef: typeof regular, size: number, maxWidth: number, maxLines = 99) => {
      const words = cleanText(text).split(' ').filter(Boolean);
      const lines: string[] = [];
      let current = '';
      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (fontRef.widthOfTextAtSize(next, size) > maxWidth && current) {
          lines.push(current);
          current = word;
          if (lines.length >= maxLines) break;
        } else {
          current = next;
        }
      }
      if (current && lines.length < maxLines) lines.push(current);
      if (lines.length === maxLines && words.length) {
        const last = lines[maxLines - 1];
        lines[maxLines - 1] = truncateToWidth(last, fontRef, size, maxWidth);
      }
      return lines.length ? lines : [''];
    };

    const drawWrapped = (text: string, x: number, py: number, maxWidth: number, size = 10, maxLines = 99, fontRef: typeof regular = regular, textColor: keyof typeof COLORS = 'muted', leading = 4) => {
      let nextY = py;
      for (const line of wrapByWidth(text, fontRef, size, maxWidth, maxLines)) {
        page.drawText(line, { x, y: nextY, size, font: fontRef, color: color(textColor) });
        nextY -= size + leading;
      }
      return nextY;
    };

    const drawRoundedPanel = (x: number, py: number, width: number, height: number, _radius: number, fill: keyof typeof COLORS, border?: keyof typeof COLORS, borderWidth = 0, opacity = 1) => {
      // pdf-lib's SVG-path coordinate transform differs from its text/rectangle transform.
      // Native PDF rectangles preserve the exact baseline geometry for every report renderer.
      page.drawRectangle({ x, y: py, width, height, color: color(fill), borderColor: border ? color(border) : undefined, borderWidth, opacity });
    };

    const drawCardShell = (x: number, top: number, width: number, height: number, accent: keyof typeof COLORS = 'purple', fill: keyof typeof COLORS = 'card') => {
      drawRoundedPanel(x + 3, top - height - 4, width, height, 18, 'text', undefined, 0, 0.12);
      drawRoundedPanel(x, top - height, width, height, 18, fill, 'border', 1);
      page.drawRectangle({ x: x + 18, y: top - 3.5, width: width - 36, height: 3.5, color: color(accent), opacity: 0.95 });
      return { x: x + 14, yTop: top - 20, yBottom: top - height + 12, width: width - 28, height };
    };

    const drawPill = (text: string, x: number, py: number, width: number, fill: keyof typeof COLORS = 'card2', textColor: keyof typeof COLORS = 'muted') => {
      drawRoundedPanel(x, py, width, 18, 9, fill, 'border', 0.7);
      page.drawText(truncateToWidth(text, bold, 8, width - 14), { x: x + 7, y: py + 5.5, size: 8, font: bold, color: color(textColor) });
    };

    const drawProgressBar = (label: string, value: number, x: number, py: number, width: number, accent: keyof typeof COLORS) => {
      const score = clampScore(value);
      page.drawText(truncateToWidth(label, bold, 8.2, 98), { x, y: py, size: 8.2, font: bold, color: color('text') });
      page.drawRectangle({ x: x + 106, y: py - 1.5, width, height: 7, color: color('track') });
      page.drawRectangle({ x: x + 106, y: py - 1.5, width: (score / 100) * width, height: 7, color: color(accent) });
      page.drawText(`${score}%`, { x: x + 106 + width + 8, y: py - 1, size: 7.5, font: bold, color: color(accent) });
    };

    paintBackground();

    // Mirrors the live result sequence: identity, direction, compact signals, then evidence.
    page.drawText('KnowYouRole', { x: margin, y, size: 18, font: bold, color: color('text') });
    page.drawText('FULL PORTRAIT', { x: pageSize[0] - margin - 72, y: y + 3, size: 8.4, font: bold, color: color('cyan') });
    y -= 42;

    page.drawText('YOUR WORKING PATTERN', { x: margin, y, size: 8.2, font: bold, color: color('cyan') });
    page.drawText(mbtiType, { x: margin, y: y - 63, size: 66, font: bold, color: color('text') });
    drawWrapped(archetype, margin, y - 88, contentWidth, 22, 2, bold, 'text', 3);
    drawWrapped('A personal snapshot of how you tend to focus, decide, and move work forward.', margin, y - 122, contentWidth - 32, 10.2, 2, regular, 'muted', 3);

    const directionTop = 565;
    const directionHeight = 162;
    drawRoundedPanel(margin + 3, directionTop - directionHeight - 5, contentWidth, directionHeight, 25, 'ink', undefined, 0, 0.28);
    drawRoundedPanel(margin, directionTop - directionHeight, contentWidth, directionHeight, 25, 'cream', 'creamBorder', 1);
    page.drawText('BEST-FIT DIRECTION', { x: margin + 20, y: directionTop - 25, size: 8.3, font: bold, color: color('ink') });
    const careerTitleLines = wrapByWidth(careerTitle, bold, 21, contentWidth - 40, 2);
    careerTitleLines.forEach((line, index) => page.drawText(line, { x: margin + 20, y: directionTop - 55 - index * 24, size: 21, font: bold, color: color('ink') }));
    const careerSummaryY = directionTop - 76 - careerTitleLines.length * 24;
    drawWrapped(careerSummary, margin + 20, careerSummaryY, contentWidth - 40, 9.2, 3, regular, 'ink', 3);
    if (careerSalary) {
      const salaryWidth = Math.min(contentWidth - 40, bold.widthOfTextAtSize(careerSalary, 8.1) + 24);
      drawRoundedPanel(margin + 20, directionTop - directionHeight + 16, salaryWidth, 18, 9, 'creamBorder');
      page.drawText(careerSalary, { x: margin + 32, y: directionTop - directionHeight + 22, size: 8.1, font: bold, color: color('ink') });
    }

    const tileTop = 374;
    const tileHeight = 76;
    const tileGap = 10;
    const tileWidth = (contentWidth - tileGap * 2) / 3;
    const tiles = [
      ['DISC SIGNAL', `${primaryDisc} ${discLabel}`, discAccent],
      ['TOP TRAIT', `${topBigFiveLabel} ${topBigFiveScore}%`, 'cyan'],
      ['TYPE RARITY', payload.population ? `${payload.population} of people` : 'Personal signal', 'gold'],
    ] as const;
    tiles.forEach(([label, value, accent], index) => {
      const x = margin + index * (tileWidth + tileGap);
      drawRoundedPanel(x, tileTop - tileHeight, tileWidth, tileHeight, 18, 'card2', 'border', 1);
      page.drawText(label, { x: x + 13, y: tileTop - 21, size: 6.8, font: bold, color: color('dim') });
      drawWrapped(value, x + 13, tileTop - 42, tileWidth - 26, 10.2, 2, bold, accent, 2);
    });

    const signalTop = 273;
    const signalHeight = 154;
    drawRoundedPanel(margin + 3, signalTop - signalHeight - 4, contentWidth, signalHeight, 24, 'ink', undefined, 0, 0.25);
    drawRoundedPanel(margin, signalTop - signalHeight, contentWidth, signalHeight, 24, 'card', 'border', 1);
    page.drawText('YOUR OPERATING SIGNAL', { x: margin + 20, y: signalTop - 25, size: 8.2, font: bold, color: color('cyan') });
    page.drawText('The preferences that shape your default approach to work.', { x: margin + 20, y: signalTop - 43, size: 9.2, font: regular, color: color('muted') });
    MBTI_DIMENSIONS.forEach((dim, index) => {
      const dominant = mbtiType[index] || dim.left;
      const rowY = signalTop - 70 - index * 17;
      page.drawText(dim.label.toUpperCase(), { x: margin + 20, y: rowY, size: 6.8, font: bold, color: color('dim') });
      page.drawText(`${dim.left}  ${dim.right}`, { x: margin + 116, y: rowY - 1, size: 8.3, font: bold, color: color('muted') });
      page.drawCircle({ x: margin + 214, y: rowY + 3, size: 4.5, color: color(dominant === dim.left ? 'cyan' : 'gold') });
      page.drawText(dominant, { x: margin + 230, y: rowY - 3, size: 12.5, font: bold, color: color(dominant === dim.left ? 'cyan' : 'gold') });
      page.drawText(dominant === dim.left ? 'leans left' : 'leans right', { x: margin + 250, y: rowY - 1, size: 8, font: regular, color: color('muted') });
    });

    page.drawText('Mirror, not a cage. Use the signal. Keep the agency.', { x: margin, y: 44, size: 8.5, font: italic, color: color('muted') });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=KnowYouRole-Full-Portrait.pdf',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[POST /api/generate-pdf] Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
