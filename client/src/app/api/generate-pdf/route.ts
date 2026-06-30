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

const COLORS = {
  bg: { r: 0.031, g: 0.016, b: 0.078 },
  card: { r: 0.075, g: 0.047, b: 0.13 },
  card2: { r: 0.055, g: 0.035, b: 0.105 },
  border: { r: 0.23, g: 0.18, b: 0.34 },
  cyan: { r: 0.133, g: 0.827, b: 0.933 },
  purple: { r: 0.659, g: 0.333, b: 0.969 },
  pink: { r: 0.957, g: 0.447, b: 0.714 },
  gold: { r: 0.961, g: 0.62, b: 0.043 },
  green: { r: 0.255, g: 0.875, b: 0.659 },
  text: { r: 0.97, g: 0.98, b: 1 },
  muted: { r: 0.72, g: 0.74, b: 0.82 },
  dim: { r: 0.48, g: 0.5, b: 0.62 },
  track: { r: 0.14, g: 0.105, b: 0.22 },
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
      page.drawRectangle({ x: 0, y: 0, width: pageSize[0], height: pageSize[1], color: rgb(0.025, 0.016, 0.06), opacity: 0.96 });
      page.drawCircle({ x: 42, y: 744, size: 160, color: rgb(0.08, 0.32, 0.42), opacity: 0.22 });
      page.drawCircle({ x: 570, y: 724, size: 190, color: rgb(0.47, 0.17, 0.7), opacity: 0.18 });
      page.drawCircle({ x: 514, y: 116, size: 145, color: rgb(0.9, 0.36, 0.62), opacity: 0.11 });
      page.drawRectangle({ x: 0, y: pageSize[1] - 9, width: pageSize[0], height: 9, color: color('cyan'), opacity: 0.72 });
      page.drawRectangle({ x: 0, y: pageSize[1] - 9, width: pageSize[0] * 0.58, height: 9, color: color('purple'), opacity: 0.78 });
      page.drawRectangle({ x: margin, y: 24, width: contentWidth, height: 1, color: color('border') });
      page.drawText('KnowYouRole Full Portrait  |  one-page share card', { x: margin, y: 12, size: 8, font: regular, color: color('dim') });
      page.drawText(BRAND_URL, { x: pageSize[0] - margin - 78, y: 12, size: 8, font: bold, color: color('cyan') });
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

    const drawCardShell = (x: number, top: number, width: number, height: number, accent: keyof typeof COLORS = 'purple', fill: keyof typeof COLORS = 'card') => {
      page.drawRectangle({ x: x + 3, y: top - height - 4, width, height, color: rgb(0, 0, 0), opacity: 0.22 });
      page.drawRectangle({ x, y: top - height, width, height, color: color(fill), borderColor: color('border'), borderWidth: 1 });
      page.drawRectangle({ x, y: top - 3.5, width, height: 3.5, color: color(accent), opacity: 0.95 });
      return { x: x + 14, yTop: top - 20, yBottom: top - height + 12, width: width - 28, height };
    };

    const drawPill = (text: string, x: number, py: number, width: number, fill: keyof typeof COLORS = 'card2', textColor: keyof typeof COLORS = 'muted') => {
      page.drawRectangle({ x, y: py, width, height: 18, color: color(fill), borderColor: color('border'), borderWidth: 0.7 });
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

    // One-page Full Portrait: magazine-style hierarchy, fewer duplicate boxes, clearer scanning path.
    page.drawText('KnowYouRole', { x: margin, y, size: 18, font: bold, color: color('cyan') });
    page.drawText('FULL PORTRAIT', { x: pageSize[0] - margin - 92, y: y + 3, size: 8.8, font: bold, color: color('dim') });
    page.drawText('shareable signal card', { x: pageSize[0] - margin - 104, y: y - 9, size: 8, font: italic, color: color('muted') });
    y -= 28;

    const hero = drawCardShell(margin, y, contentWidth, 150, 'cyan');
    page.drawText('YOUR PATTERN', { x: hero.x, y: hero.yTop + 2, size: 7.4, font: bold, color: color('dim') });
    page.drawText(mbtiType, { x: hero.x, y: hero.yTop - 43, size: 52, font: bold, color: color('text') });
    drawWrapped(archetype, hero.x + 2, hero.yTop - 63, 190, 11.4, 2, bold, 'purple', 2.5);
    drawPill(`${primaryDisc} DISC - ${discLabel}`, hero.x + 2, hero.yBottom + 9, 126, 'card2', discAccent);
    drawPill(`Population ${payload.population || 'N/A'}`, hero.x + 136, hero.yBottom + 9, 124, 'card2', 'muted');

    const dividerX = hero.x + 268;
    page.drawRectangle({ x: dividerX, y: hero.yBottom + 6, width: 1, height: 106, color: color('border') });
    const careerX = dividerX + 24;
    page.drawText('BEST-FIT DIRECTION', { x: careerX, y: hero.yTop + 2, size: 7.4, font: bold, color: color('gold') });
    page.drawText(truncateToWidth(careerTitle, bold, 20, hero.width - 304), { x: careerX, y: hero.yTop - 24, size: 20, font: bold, color: color('gold') });
    if (careerSalary) page.drawText(truncateToWidth(careerSalary, bold, 8.8, hero.width - 304), { x: careerX, y: hero.yTop - 42, size: 8.8, font: bold, color: color('muted') });
    drawWrapped(careerSummary, careerX, hero.yTop - 60, hero.width - 304, 9.1, 4, regular, 'muted', 2.5);
    drawWrapped('The shortest useful read: what to pursue, how you move, and which trait is steering the wheel.', careerX, hero.yBottom + 12, hero.width - 304, 7.8, 2, italic, 'dim', 2);
    y -= 166;

    const signalTop = y;
    const signalW = (contentWidth - 20) / 3;
    const signals = [
      { label: 'Career signal', value: careerTitle, note: careerSalary || 'role direction', accent: 'gold' as keyof typeof COLORS },
      { label: 'Operating mode', value: `${primaryDisc} - ${discLabel}`, note: 'primary DISC style', accent: discAccent as keyof typeof COLORS },
      { label: 'Dominant dial', value: `${topBigFiveLabel}`, note: `${topBigFiveScore}% Big Five lead`, accent: 'cyan' as keyof typeof COLORS },
    ];
    signals.forEach((item, index) => {
      const card = drawCardShell(margin + index * (signalW + 10), signalTop, signalW, 76, item.accent, 'card2');
      page.drawText(item.label.toUpperCase(), { x: card.x, y: card.yTop, size: 7, font: bold, color: color(item.accent) });
      drawWrapped(item.value, card.x, card.yTop - 18, card.width, index === 1 ? 13.5 : 11, 2, bold, 'text', 1.8);
      page.drawText(truncateToWidth(item.note, regular, 7.2, card.width), { x: card.x, y: card.yBottom + 1, size: 7.2, font: regular, color: color('dim') });
    });
    y -= 92;

    const insight = drawCardShell(margin, y, contentWidth, 196, 'purple');
    page.drawText('The useful bits', { x: insight.x, y: insight.yTop + 1, size: 14, font: bold, color: color('text') });
    page.drawText('MBTI compass + Big Five dials. Still one page. Still not a spreadsheet.', { x: insight.x + 106, y: insight.yTop + 4, size: 7.8, font: italic, color: color('dim') });

    const compassX = insight.x;
    const compassY = insight.yTop - 30;
    page.drawText(`${mbtiType} compass`, { x: compassX, y: compassY, size: 11.2, font: bold, color: color('purple') });
    MBTI_DIMENSIONS.forEach((dim, index) => {
      const dominant = mbtiType[index] || dim.left;
      const rowY = compassY - 22 - index * 28;
      page.drawText(dim.label.toUpperCase(), { x: compassX, y: rowY, size: 6.8, font: bold, color: color('dim') });
      page.drawText(dim.left, { x: compassX + 74, y: rowY - 1, size: 7.8, font: bold, color: dominant === dim.left ? color('cyan') : color('dim') });
      page.drawRectangle({ x: compassX + 91, y: rowY + 2, width: 72, height: 4.5, color: color('track') });
      page.drawRectangle({ x: dominant === dim.left ? compassX + 91 : compassX + 127, y: rowY + 2, width: 36, height: 4.5, color: dominant === dim.left ? color('cyan') : color('purple') });
      page.drawText(dim.right, { x: compassX + 172, y: rowY - 1, size: 7.8, font: bold, color: dominant === dim.right ? color('purple') : color('dim') });
      page.drawText(dominant, { x: compassX + 196, y: rowY - 4, size: 13, font: bold, color: dominant === dim.left ? color('cyan') : color('purple') });
    });

    const dialsX = insight.x + 286;
    const dialsY = insight.yTop - 30;
    page.drawText('Big Five dials', { x: dialsX, y: dialsY, size: 11.2, font: bold, color: color('cyan') });
    page.drawText(truncateToWidth(`${topBigFiveLabel} is the loudest signal`, regular, 8, insight.width - 286), { x: dialsX, y: dialsY - 13, size: 8, font: regular, color: color('muted') });
    let barY = dialsY - 34;
    for (const [label, value, accent] of bigFiveEntries) {
      drawProgressBar(label, value, dialsX, barY, 82, accent);
      barY -= 21;
    }

    const fieldY = insight.yBottom - 58;
    page.drawRectangle({ x: insight.x, y: fieldY, width: insight.width, height: 46, color: rgb(0.07, 0.05, 0.12), borderColor: color('border'), borderWidth: 0.7 });
    page.drawText('Tiny field guide', { x: insight.x + 10, y: fieldY + 29, size: 10.2, font: bold, color: color('gold') });
    const guideLines = [
      `Chase rooms that reward ${careerTitle.toLowerCase()} energy.`,
      `Use ${primaryDisc} ${discLabel.toLowerCase()} mode for momentum; pause before autopilot.`,
      `Let ${topBigFiveLabel.toLowerCase()} choose better environments, not smaller dreams.`,
    ];
    let guideY = fieldY + 29;
    guideLines.forEach((line, index) => {
      page.drawCircle({ x: insight.x + 108, y: guideY + 3, size: 1.8, color: color('gold') });
      page.drawText(truncateToWidth(line, regular, 7.8, insight.width - 238), { x: insight.x + 116, y: guideY, size: 7.8, font: regular, color: color('muted') });
      guideY -= 12;
      if (index === 2) page.drawText(BRAND_URL, { x: insight.x + insight.width - 88, y: fieldY + 5, size: 9, font: bold, color: color('cyan') });
    });
    y = fieldY - 18;

    page.drawText('Mirror, not a cage. Use the signal. Keep the agency.', { x: margin, y: 42, size: 8.7, font: italic, color: color('muted') });

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
