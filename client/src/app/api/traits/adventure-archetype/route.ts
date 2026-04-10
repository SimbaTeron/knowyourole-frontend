import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/traits/adventure-archetype
export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = body;

    const { data: archetypes, error } = await getSupabaseAdmin()
      .from('adventure_archetypes')
      .select('*');

    if (error) {
      console.error('[POST /api/traits/adventure-archetype] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch adventure archetypes' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Default archetype if none found
    if (!archetypes || archetypes.length === 0) {
      return NextResponse.json({
        name: 'The Explorer',
        superpower: 'You discover what others miss!',
        description: "You're always curious and asking 'why?' You love learning new things and going on adventures.",
        mission: 'Find something you\'ve never noticed before today!',
        badgeColor: '#10B981',
      }, { headers: corsHeaders });
    }

    const getLevel = (score: number): string => {
      if (score >= 76) return 'high';
      if (score >= 51) return 'mid_high';
      if (score >= 26) return 'low_mid';
      return 'low';
    };

    const userTraits = {
      openness: getLevel(openness || 50),
      conscientiousness: getLevel(conscientiousness || 50),
      extraversion: getLevel(extraversion || 50),
      agreeableness: getLevel(agreeableness || 50),
      neuroticism: getLevel(neuroticism || 50),
    };

    let bestMatch = archetypes[0];
    let bestScore = 0;

    for (const archetype of archetypes) {
      let traits: Record<string, string> = {};
      try {
        traits = typeof archetype.traits === 'string' ? JSON.parse(archetype.traits) : archetype.traits || {};
      } catch {
        traits = {};
      }

      let score = 0;

      for (const [trait, level] of Object.entries(traits)) {
        const userLevel = userTraits[trait as keyof typeof userTraits];
        if (userLevel === level) score += 2;
        else if (
          (level === 'high' && userLevel === 'mid_high') ||
          (level === 'mid_high' && (userLevel === 'high' || userLevel === 'mid')) ||
          (level === 'low' && userLevel === 'low_mid')
        ) score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = archetype;
      }
    }

    return NextResponse.json({
      name: bestMatch.name,
      superpower: bestMatch.superpower,
      description: bestMatch.description,
      mission: bestMatch.mission,
      badgeColor: bestMatch.badge_color || bestMatch.badgeColor || '#10B981',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/traits/adventure-archetype] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
