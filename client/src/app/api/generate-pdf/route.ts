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
  text: { r: 0.97, g: 0.98, b: 1 },
  muted: { r: 0.72, g: 0.74, b: 0.82 },
  dim: { r: 0.48, g: 0.5, b: 0.62 },
  track: { r: 0.14, g: 0.105, b: 0.22 },
};

function rgbObj(c: { r: number; g: number; b: number }) {
  return c;
}

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

// POST /api/generate-pdf — Generate a comprehensive dark-themed PDF personality report.
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(`pdf:${ip}`, 10, 3600000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 PDF generations per hour.' },
        { status: 429 }
      );
    }

    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    const body = await req.json();
    const payload: ReportPayload = body.report ?? body;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(cleanText(payload.title || 'KnowYouRole Full Portrait'));
    pdfDoc.setSubject('KnowYouRole personality results report');
    pdfDoc.setCreator('KnowYouRole');
    pdfDoc.setProducer('KnowYouRole');

    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const pageSize: [number, number] = [612, 792];
    const margin = 42;
    const contentWidth = pageSize[0] - margin * 2;
    let page = pdfDoc.addPage(pageSize);
    let y = pageSize[1] - margin;
    let pageNo = 1;

    const color = (key: keyof typeof COLORS) => rgb(COLORS[key].r, COLORS[key].g, COLORS[key].b);

    const paintBackground = () => {
      page.drawRectangle({ x: 0, y: 0, width: pageSize[0], height: pageSize[1], color: color('bg') });
      page.drawCircle({ x: 72, y: 720, size: 120, color: rgb(0.08, 0.22, 0.28), opacity: 0.22 });
      page.drawCircle({ x: 548, y: 680, size: 150, color: rgb(0.24, 0.1, 0.36), opacity: 0.18 });
      page.drawRectangle({ x: margin, y: 24, width: contentWidth, height: 1, color: color('border') });
      page.drawText(`KnowYouRole Full Portrait  |  Page ${pageNo}`, { x: margin, y: 12, size: 8, font: regular, color: color('dim') });
    };

    const addPage = () => {
      page = pdfDoc.addPage(pageSize);
      pageNo += 1;
      y = pageSize[1] - margin;
      paintBackground();
    };

    const ensureSpace = (heightNeeded: number) => {
      if (y - heightNeeded < 58) addPage();
    };

    const drawPill = (text: string, x: number, py: number, fill: keyof typeof COLORS = 'card2') => {
      const safe = cleanText(text);
      const width = Math.min(160, safe.length * 5.2 + 18);
      page.drawRectangle({ x, y: py, width, height: 18, color: color(fill), borderColor: color('border'), borderWidth: 0.7 });
      page.drawText(safe, { x: x + 9, y: py + 5, size: 8, font: bold, color: color('muted') });
      return width;
    };

    const drawSectionTitle = (title: string, subtitle?: string) => {
      ensureSpace(54);
      page.drawText(cleanText(title).toUpperCase(), { x: margin, y, size: 10, font: bold, color: color('cyan') });
      y -= 16;
      if (subtitle) {
        const lines = wrapText(subtitle, 86).slice(0, 2);
        for (const line of lines) {
          page.drawText(line, { x: margin, y, size: 9.5, font: regular, color: color('muted') });
          y -= 13;
        }
      }
      y -= 6;
    };

    const drawCard = (height: number, accent: keyof typeof COLORS = 'purple') => {
      ensureSpace(height + 14);
      const top = y;
      page.drawRectangle({ x: margin, y: top - height, width: contentWidth, height, color: color('card'), borderColor: color('border'), borderWidth: 1 });
      page.drawRectangle({ x: margin, y: top - 3, width: contentWidth, height: 3, color: color(accent) });
      return { x: margin + 18, yTop: top - 22, yBottom: top - height + 16, width: contentWidth - 36, finish: () => { y = top - height - 16; } };
    };

    const drawWrapped = (text: string, x: number, py: number, maxChars: number, size = 10, maxLines = 99, font = regular, textColor: keyof typeof COLORS = 'muted') => {
      let nextY = py;
      for (const line of wrapText(text, maxChars).slice(0, maxLines)) {
        page.drawText(line, { x, y: nextY, size, font, color: color(textColor) });
        nextY -= size + 4;
      }
      return nextY;
    };

    const drawMetricBars = (metrics: { label: string; value: number; accent: keyof typeof COLORS }[], x: number, startY: number, width = 250) => {
      let my = startY;
      metrics.forEach((metric) => {
        const value = Math.max(0, Math.min(100, Math.round(metric.value || 0)));
        page.drawText(metric.label, { x, y: my, size: 9, font: bold, color: color('text') });
        page.drawRectangle({ x: x + 145, y: my - 2, width, height: 8, color: color('track') });
        page.drawRectangle({ x: x + 145, y: my - 2, width: (value / 100) * width, height: 8, color: color(metric.accent) });
        page.drawText(`${value}%`, { x: x + 145 + width + 10, y: my - 1, size: 8, font: bold, color: color(metric.accent) });
        my -= 24;
      });
      return my;
    };

    paintBackground();

    // Cover / hero
    page.drawText('KnowYouRole', { x: margin, y, size: 19, font: bold, color: color('cyan') });
    page.drawText('Full Portrait Report', { x: margin + 126, y: y + 1, size: 10, font: regular, color: color('muted') });
    y -= 52;

    const hero = drawCard(185, 'cyan');
    page.drawText(cleanText(payload.mbtiType || 'TYPE'), { x: hero.x, y: hero.yTop, size: 52, font: bold, color: color('text') });
    page.drawText(cleanText(payload.archetype || payload.subtitle || 'Your Personality Pattern'), { x: hero.x + 172, y: hero.yTop + 27, size: 18, font: bold, color: color('purple') });
    page.drawText(cleanText(payload.primaryDisc ? `${payload.primaryDisc} DISC Style` : 'DISC Profile'), { x: hero.x + 172, y: hero.yTop + 5, size: 11, font: regular, color: color('muted') });
    page.drawText(cleanText(payload.career?.title || 'Career Direction'), { x: hero.x, y: hero.yTop - 58, size: 19, font: bold, color: color('gold') });
    if (payload.career?.salary) page.drawText(cleanText(payload.career.salary), { x: hero.x, y: hero.yTop - 79, size: 11, font: bold, color: color('muted') });
    drawWrapped(payload.career?.summary || 'A compact, shareable map of your core personality results, strengths, blindspots, and practical next moves.', hero.x, hero.yTop - 105, 82, 10, 3, italic, 'muted');
    drawPill(`Population: ${payload.population || 'N/A'}`, hero.x + 350, hero.yBottom + 4, 'card2');
    hero.finish();

    // Scores page content
    drawSectionTitle('Core Score Dashboard', 'Your Full Portrait combines MBTI direction, DISC operating style, and Big Five trait intensity.');
    const scoreCard = drawCard(245, 'purple');
    page.drawText('Big Five', { x: scoreCard.x, y: scoreCard.yTop, size: 14, font: bold, color: color('text') });
    drawMetricBars([
      { label: 'Openness', value: payload.bigFive?.O ?? 0, accent: 'cyan' },
      { label: 'Conscientiousness', value: payload.bigFive?.C ?? 0, accent: 'purple' },
      { label: 'Extroversion', value: payload.bigFive?.E ?? 0, accent: 'pink' },
      { label: 'Agreeableness', value: payload.bigFive?.A ?? 0, accent: 'gold' },
      { label: 'Neuroticism', value: payload.bigFive?.N ?? 0, accent: 'dim' },
    ], scoreCard.x, scoreCard.yTop - 28, 235);
    page.drawText('DISC', { x: scoreCard.x, y: scoreCard.yTop - 158, size: 14, font: bold, color: color('text') });
    drawMetricBars([
      { label: 'Dominance', value: payload.disc?.D ?? 0, accent: 'pink' },
      { label: 'Influence', value: payload.disc?.I ?? 0, accent: 'gold' },
      { label: 'Steadiness', value: payload.disc?.S ?? 0, accent: 'cyan' },
      { label: 'Conscientiousness', value: payload.disc?.C ?? 0, accent: 'purple' },
    ], scoreCard.x, scoreCard.yTop - 184, 235);
    scoreCard.finish();

    for (const section of payload.sections || []) {
      drawSectionTitle(section.title, section.subtitle);
      const itemCount = section.items?.length ?? 0;
      const bodyLines = section.body ? wrapText(section.body, 88).length : 0;
      const height = Math.min(310, Math.max(96, 52 + bodyLines * 14 + itemCount * 46));
      const card = drawCard(height, section.title.toLowerCase().includes('career') ? 'gold' : section.title.toLowerCase().includes('blind') ? 'pink' : 'cyan');
      let cy = card.yTop;
      if (section.body) {
        cy = drawWrapped(section.body, card.x, cy, 88, 10, 7, regular, 'muted') - 4;
      }
      for (const item of (section.items || []).slice(0, 7)) {
        if (cy < card.yBottom + 24) break;
        page.drawText(cleanText(item.label), { x: card.x, y: cy, size: 8, font: bold, color: color('cyan') });
        page.drawText(cleanText(item.value), { x: card.x, y: cy - 14, size: 11, font: bold, color: color('text') });
        if (item.detail) cy = drawWrapped(item.detail, card.x + 14, cy - 30, 78, 9, 2, regular, 'muted') - 4;
        else cy -= 35;
      }
      card.finish();
    }

    // Footer CTA
    ensureSpace(96);
    const final = drawCard(74, 'purple');
    page.drawText('Share the insight. Keep the agency.', { x: final.x, y: final.yTop, size: 15, font: bold, color: color('text') });
    drawWrapped('This report is a mirror, not a cage. Use it to choose better environments, sharper roles, and cleaner next moves.', final.x, final.yTop - 20, 86, 10, 2, regular, 'muted');
    page.drawText('ummout.com', { x: final.x + 390, y: final.yTop - 42, size: 11, font: bold, color: color('cyan') });
    final.finish();

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
