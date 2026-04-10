import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/app/api/_lib/scoring';


// POST /api/generate-pdf — Generate dark-themed PDF personality report
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 PDF generations per hour per IP
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(`pdf:${ip}`, 5, 3600000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 5 PDF generations per hour.' },
        { status: 429 }
      );
    }

    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    const { sessionId, result, mood, tier } = await req.json();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const purple = rgb(0.65, 0.55, 0.98);
    const cardBg = rgb(0.07, 0.07, 0.1);
    const darkBg = rgb(0.04, 0.04, 0.06);
    const lightText = rgb(0.97, 0.98, 0.99);
    const mutedText = rgb(0.58, 0.64, 0.72);
    const cyan = rgb(0.4, 0.91, 0.98);

    // Dark background
    page.drawRectangle({ x: 0, y: 0, width, height, color: darkBg });

    let y = height - 50;

    // Header card
    page.drawRectangle({ x: 40, y: y - 70, width: width - 80, height: 80, color: cardBg, borderColor: purple, borderWidth: 1 });
    page.drawText('KnowYouRole', { x: 55, y: y - 30, size: 32, font: helveticaBold, color: purple });
    page.drawText('Personality Discovery Report', { x: 55, y: y - 55, size: 14, font: helvetica, color: mutedText });

    y -= 100;

    // Personality type card
    page.drawRectangle({ x: 40, y: y - 180, width: width - 80, height: 170, color: cardBg, borderColor: purple, borderWidth: 1 });
    page.drawText('YOUR PERSONALITY TYPE', { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
    page.drawText(result?.mbtiType || 'XXXX', { x: 55, y: y - 65, size: 48, font: helveticaBold, color: lightText });
    page.drawText(result?.title || 'Your Unique Type', { x: 55, y: y - 95, size: 16, font: helveticaBold, color: purple });

    const spark = result?.spark || 'Discover your unique strengths and potential!';
    const sparkLines = spark.length > 70 ? [spark.slice(0, 70), spark.slice(70)] : [spark];
    sparkLines.forEach((line: string, i: number) => {
      page.drawText(line, { x: 55, y: y - 120 - (i * 16), size: 11, font: helveticaOblique, color: mutedText });
    });

    page.drawText(`DISC: ${result?.discStyle || 'Balanced'}`, { x: 55, y: y - 165, size: 12, font: helvetica, color: mutedText });

    y -= 200;

    // Big Five card
    page.drawRectangle({ x: 40, y: y - 180, width: width - 80, height: 170, color: cardBg, borderColor: purple, borderWidth: 1 });
    page.drawText('BIG FIVE PERSONALITY PROFILE', { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });

    const bigFive = result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 };
    const traits = [
      { name: 'Openness', key: 'O', value: bigFive.O || bigFive.openness || 50, desc: 'Creativity & Curiosity' },
      { name: 'Conscientiousness', key: 'C', value: bigFive.C || bigFive.conscientiousness || 50, desc: 'Organization & Discipline' },
      { name: 'Extraversion', key: 'E', value: bigFive.E || bigFive.extraversion || 50, desc: 'Social Energy' },
      { name: 'Agreeableness', key: 'A', value: bigFive.A || bigFive.agreeableness || 50, desc: 'Empathy & Cooperation' },
      { name: 'Neuroticism', key: 'N', value: bigFive.N || bigFive.neuroticism || 50, desc: 'Emotional Sensitivity' },
    ];

    let traitY = y - 50;
    for (const trait of traits) {
      page.drawText(trait.name, { x: 55, y: traitY, size: 10, font: helveticaBold, color: lightText });
      page.drawText(trait.desc, { x: 180, y: traitY, size: 8, font: helvetica, color: mutedText });
      page.drawRectangle({ x: 340, y: traitY - 2, width: 160, height: 12, color: rgb(0.15, 0.15, 0.2) });
      page.drawRectangle({ x: 340, y: traitY - 2, width: Math.min(trait.value * 1.6, 160), height: 12, color: purple });
      page.drawText(`${trait.value}%`, { x: 510, y: traitY, size: 10, font: helveticaBold, color: lightText });
      traitY -= 26;
    }

    y -= 200;

    // Mood and Tier cards side by side
    page.drawRectangle({ x: 40, y: y - 100, width: (width - 90) / 2, height: 90, color: cardBg, borderColor: purple, borderWidth: 1 });
    page.drawText('MOOD BLEND', { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
    const moodText = mood || 'Balanced';
    page.drawText(moodText.length > 25 ? moodText.slice(0, 25) + '...' : moodText, { x: 55, y: y - 55, size: 14, font: helveticaBold, color: lightText });
    page.drawText('Your emotional starting point', { x: 55, y: y - 75, size: 9, font: helvetica, color: mutedText });

    page.drawRectangle({ x: 40 + (width - 90) / 2 + 10, y: y - 100, width: (width - 90) / 2, height: 90, color: cardBg, borderColor: purple, borderWidth: 1 });
    page.drawText('AGE TIER', { x: 55 + (width - 90) / 2 + 10, y: y - 25, size: 10, font: helveticaBold, color: cyan });
    page.drawText(tier || 'Adult', { x: 55 + (width - 90) / 2 + 10, y: y - 55, size: 14, font: helveticaBold, color: lightText });
    page.drawText('Quiz difficulty level', { x: 55 + (width - 90) / 2 + 10, y: y - 75, size: 9, font: helvetica, color: mutedText });

    y -= 120;

    // Footer
    page.drawRectangle({ x: 40, y: 30, width: width - 80, height: 50, color: cardBg });
    page.drawText('Generated by KnowYouRole', { x: 55, y: 55, size: 10, font: helvetica, color: mutedText });
    page.drawText('knowyourole.com', { x: 55, y: 40, size: 9, font: helvetica, color: purple });
    page.drawText(`Session: ${sessionId?.slice(-8) || 'N/A'}`, { x: width - 160, y: 48, size: 9, font: helvetica, color: mutedText });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=KnowYouRole-Results.pdf',
      },
    });
  } catch (error) {
    console.error('[POST /api/generate-pdf] Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
