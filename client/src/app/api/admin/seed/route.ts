import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { adminCorsHeaders, requireAdminRequest } from '@/app/api/_lib/admin-guard';


const corsHeaders = adminCorsHeaders;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// POST /api/admin/seed — Seed database with trait vibes, combinations, and archetypes
export async function POST(req: NextRequest) {
  const unauthorized = requireAdminRequest(req);
  if (unauthorized) return unauthorized;

  try {
    const traitVibesData = [
      // Openness
      { trait: 'openness', quartile: 'low', score_min: 0, score_max: 25, vibe_title: 'The Steady Traditionalist', vibe_description: 'You love familiar routines and practical details—think the cozy librarian curating timeless classics, thriving in structured worlds where reliability trumps reinvention.' },
      { trait: 'openness', quartile: 'low_mid', score_min: 26, score_max: 50, vibe_title: 'The Balanced Appreciator', vibe_description: 'You enjoy a dash of novelty but stick to proven paths—picture the weekend hobbyist tinkering with recipes from grandma\'s cookbook, blending comfort with occasional tweaks.' },
      { trait: 'openness', quartile: 'mid_high', score_min: 51, score_max: 75, vibe_title: 'The Curious Explorer', vibe_description: 'You dip into ideas with enthusiasm—envision the book club enthusiast debating plot twists over coffee, weaving fresh perspectives into everyday chats without going full avant-garde.' },
      { trait: 'openness', quartile: 'high', score_min: 76, score_max: 100, vibe_title: 'The Boundless Visionary', vibe_description: 'You chase wild \'what ifs\' and abstract dreams—imagine the street artist turning urban walls into surreal stories, fueled by endless curiosity and a knack for reimagining the ordinary.' },
      // Conscientiousness
      { trait: 'conscientiousness', quartile: 'low', score_min: 0, score_max: 25, vibe_title: 'The Free-Spirited Improviser', vibe_description: 'You flow with the moment over checklists—think the spontaneous road-tripper packing light and letting detours dictate the adventure, embracing chaos as creative fuel.' },
      { trait: 'conscientiousness', quartile: 'low_mid', score_min: 26, score_max: 50, vibe_title: 'The Flexible Doer', vibe_description: 'You start strong but adapt on the fly—picture the casual gardener planting intuitively, weeding when inspired rather than on schedule, balancing effort with easygoing vibes.' },
      { trait: 'conscientiousness', quartile: 'mid_high', score_min: 51, score_max: 75, vibe_title: 'The Dependable Achiever', vibe_description: 'You plan just enough to deliver—envision the project coordinator juggling tasks with a trusty notebook, hitting milestones reliably while leaving room for inspired pivots.' },
      { trait: 'conscientiousness', quartile: 'high', score_min: 76, score_max: 100, vibe_title: 'The Meticulous Mastermind', vibe_description: 'You have laser-focused discipline—imagine the elite chef prepping every ingredient hours ahead, orchestrating flawless meals through unwavering routines and precision.' },
      // Extraversion
      { trait: 'extraversion', quartile: 'low', score_min: 0, score_max: 25, vibe_title: 'The Serene Solo Navigator', vibe_description: 'You recharge in quiet depths—think the midnight reader lost in novels by lamplight, savoring intimate connections over crowds, where silence sparks profound insights.' },
      { trait: 'extraversion', quartile: 'low_mid', score_min: 26, score_max: 50, vibe_title: 'The Selective Socializer', vibe_description: 'You shine in small circles—picture the coffee shop conversationalist trading stories with a few friends, drawing energy from meaningful exchanges without needing the spotlight.' },
      { trait: 'extraversion', quartile: 'mid_high', score_min: 51, score_max: 75, vibe_title: 'The Engaging Connector', vibe_description: 'You thrive in moderate mingles—envision the team brainstormer rallying ideas at lunch meetups, energizing groups with charm while retreating for solo recharge when needed.' },
      { trait: 'extraversion', quartile: 'high', score_min: 76, score_max: 100, vibe_title: 'The Magnetic Energizer', vibe_description: 'You light up every room—imagine the festival host weaving through crowds with infectious laughs, fueling adventures and turning strangers into instant allies on a whim.' },
      // Agreeableness
      { trait: 'agreeableness', quartile: 'low', score_min: 0, score_max: 25, vibe_title: 'The Bold Challenger', vibe_description: 'You prioritize truth over harmony—think the witty debater at dinner parties, cutting through fluff with sharp insights, unafraid to ruffle feathers for the greater good.' },
      { trait: 'agreeableness', quartile: 'low_mid', score_min: 26, score_max: 50, vibe_title: 'The Pragmatic Peacemaker', vibe_description: 'You compromise strategically—picture the negotiation-savvy colleague advocating firmly but fairly, blending empathy with a no-nonsense edge to keep things moving.' },
      { trait: 'agreeableness', quartile: 'mid_high', score_min: 51, score_max: 75, vibe_title: 'The Warm Collaborator', vibe_description: 'You foster easy alliances—envision the community organizer smoothing group tensions with genuine smiles, building bridges through kindness without losing your voice.' },
      { trait: 'agreeableness', quartile: 'high', score_min: 76, score_max: 100, vibe_title: 'The Heartfelt Harmonizer', vibe_description: 'You put others first—imagine the devoted mentor cheering on dreams with unwavering support, creating ripple effects of positivity in every interaction.' },
      // Neuroticism
      { trait: 'neuroticism', quartile: 'low', score_min: 0, score_max: 25, vibe_title: 'The Unflappable Zen Master', vibe_description: 'You roll with life\'s punches—think the surfer riding waves without a flinch, channeling calm focus into steady progress amid any storm.' },
      { trait: 'neuroticism', quartile: 'low_mid', score_min: 26, score_max: 50, vibe_title: 'The Even-Keeled Responder', vibe_description: 'You feel dips but bounce quick—picture the hiker pausing at tough trails for a breath, then pushing on with quiet resilience and a wry smile.' },
      { trait: 'neuroticism', quartile: 'mid_high', score_min: 51, score_max: 75, vibe_title: 'The Attuned Empath', vibe_description: 'You navigate emotions with depth—envision the journal-keeping friend processing worries into wisdom, turning inner turbulence into empathetic connections.' },
      { trait: 'neuroticism', quartile: 'high', score_min: 76, score_max: 100, vibe_title: 'The Passionate Feeler', vibe_description: 'Your intensity fuels profound change—imagine the activist pouring heart into causes, transforming raw sensitivity into powerful advocacy that moves mountains.' },
    ];

    const adventureArchetypesData = [
      { name: 'The Inventor', superpower: 'You turn ideas into amazing things!', description: 'You love figuring out how things work and building new stuff. Your brain is always buzzing with cool ideas.', mission: 'Build something awesome with stuff around your house today!', badge_color: '#3B82F6', traits: JSON.stringify({ openness: 'high', conscientiousness: 'mid_high' }) },
      { name: 'The Storyteller', superpower: 'You bring imagination to life!', description: 'You have amazing ideas and love sharing them. Whether it\'s drawing, writing, or acting things out, you make the world more colorful.', mission: 'Create a short story or comic about a superhero who has YOUR personality!', badge_color: '#A855F7', traits: JSON.stringify({ openness: 'high', extraversion: 'mid_high' }) },
      { name: 'The Helper', superpower: 'You make everyone feel cared for!', description: 'You notice when people need help and you\'re always there for them. Your kindness makes the world a better place.', mission: 'Do something nice for someone without being asked today!', badge_color: '#EC4899', traits: JSON.stringify({ agreeableness: 'high', extraversion: 'mid' }) },
      { name: 'The Explorer', superpower: 'You discover what others miss!', description: 'You\'re always curious and asking \'why?\' You love learning new things and going on adventures, even small ones.', mission: 'Find something you\'ve never noticed before in your neighborhood!', badge_color: '#10B981', traits: JSON.stringify({ openness: 'high', neuroticism: 'low' }) },
      { name: 'The Leader', superpower: 'You bring people together!', description: 'You\'re great at organizing games and helping your friends work as a team. People look to you when they need direction.', mission: 'Organize a fun activity with friends or family this week!', badge_color: '#F59E0B', traits: JSON.stringify({ extraversion: 'high', conscientiousness: 'high' }) },
      { name: 'The Artist', superpower: 'You see beauty everywhere!', description: 'You notice colors, sounds, and feelings that others miss. You express yourself in creative ways.', mission: 'Draw or create something that shows how you\'re feeling today!', badge_color: '#F97316', traits: JSON.stringify({ openness: 'high', neuroticism: 'mid_high' }) },
    ];

    // Clear and re-insert trait vibes
    await getSupabaseAdmin().from('trait_vibes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: vibesError } = await getSupabaseAdmin().from('trait_vibes').insert(traitVibesData);
    if (vibesError) {
      console.error('[POST /api/admin/seed] Trait vibes error:', vibesError);
    }

    // Clear and re-insert adventure archetypes
    await getSupabaseAdmin().from('adventure_archetypes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: archetypesError } = await getSupabaseAdmin().from('adventure_archetypes').insert(adventureArchetypesData);
    if (archetypesError) {
      console.error('[POST /api/admin/seed] Archetypes error:', archetypesError);
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      traitVibesSeeded: traitVibesData.length,
      archetypesSeeded: adventureArchetypesData.length,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/admin/seed] Error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500, headers: corsHeaders }
    );
  }
}
