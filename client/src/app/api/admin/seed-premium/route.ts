import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { adminCorsHeaders, requireAdminRequest } from '@/app/api/_lib/admin-guard';


const corsHeaders = adminCorsHeaders;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// POST /api/admin/seed-premium — Seed premium insights
export async function POST(req: NextRequest) {
  const unauthorized = requireAdminRequest(req);
  if (unauthorized) return unauthorized;

  try {
    const sideHustlesData = [
      { title: 'Freelance Consulting', description: 'Use your natural analytical strengths to help businesses solve problems.', income_range: '$5k-$20k/mo', time_commitment: '10-20 hrs/week', difficulty: 'intermediate', primary_trait: 'O', primary_trait_min: 60, secondary_trait: 'C', secondary_trait_min: 50, mbti_preference: 'N', disc_preference: 'D', age_tiers: 'young_adult,adult', tags: 'consulting,professional,flexible' },
      { title: 'Content Creation', description: 'Share your personality insights through blog posts, videos, or social media.', income_range: '$1k-$10k/mo', time_commitment: '5-15 hrs/week', difficulty: 'beginner', primary_trait: 'O', primary_trait_min: 50, mbti_preference: 'N', age_tiers: 'teen,young_adult,adult', tags: 'creative,digital,flexible' },
      { title: 'Online Tutoring', description: 'Leverage your strengths to help others learn and grow.', income_range: '$2k-$8k/mo', time_commitment: '10-20 hrs/week', difficulty: 'intermediate', primary_trait: 'A', primary_trait_min: 60, mbti_preference: 'F', age_tiers: 'young_adult,adult', tags: 'education,helping,online' },
      { title: 'Product Design', description: 'Design products that solve real problems based on user insights.', income_range: '$5k-$15k/mo', time_commitment: '15-25 hrs/week', difficulty: 'advanced', primary_trait: 'O', primary_trait_min: 70, secondary_trait: 'C', secondary_trait_min: 60, mbti_preference: 'N', disc_preference: 'I', age_tiers: 'young_adult,adult', tags: 'design,creative,technical' },
      { title: 'Event Planning', description: 'Organize and coordinate events that bring people together.', income_range: '$3k-$12k/mo', time_commitment: '15-30 hrs/week', difficulty: 'intermediate', primary_trait: 'E', primary_trait_min: 60, mbti_preference: 'E', disc_preference: 'I', age_tiers: 'young_adult,adult', tags: 'events,social,organizing' },
    ];

    const blindspotsData = [
      { title: 'Overthinking', description: 'You may spend too much time analyzing instead of acting.', action_tip: 'Set time limits on decisions and embrace imperfection.', target_trait: 'C', trait_max: 30, severity: 'moderate', age_tiers: 'teen,young_adult,adult', secondary_condition: JSON.stringify({ O: { min: 60 } }) },
      { title: 'Social Withdrawal', description: 'Your introverted nature may lead to isolation.', action_tip: 'Schedule regular social interactions even when you don\'t feel like it.', target_trait: 'E', trait_max: 35, severity: 'mild', age_tiers: 'teen,young_adult,adult' },
      { title: 'Perfectionism', description: 'Your high standards may prevent progress.', action_tip: 'Use the 80/20 rule: 80% done is better than 100% perfect.', target_trait: 'C', trait_max: 40, severity: 'moderate', age_tiers: 'young_adult,adult', secondary_condition: JSON.stringify({ O: { min: 50 } }) },
      { title: 'Emotional Reactivity', description: 'You may take things personally or feel overwhelmed easily.', action_tip: 'Practice mindfulness and take breaks before responding.', target_trait: 'N', trait_max: 40, severity: 'significant', age_tiers: 'teen,young_adult,adult' },
      { title: 'Assertiveness', description: 'You may struggle to speak up for yourself.', action_tip: 'Practice saying no and expressing your needs directly.', target_trait: 'A', trait_max: 35, severity: 'mild', age_tiers: 'teen,young_adult,adult', secondary_condition: JSON.stringify({ E: { min: 50 } }) },
    ];

    const careerPathsData = [
      { title: 'Strategic Consulting', description: 'Help businesses solve complex problems using analytical frameworks.', salary_range: '$100k-$250k', growth_outlook: 'High', education_req: 'Degree', primary_trait: 'O', primary_trait_min: 65, secondary_trait: 'C', secondary_trait_min: 55, mbti_types: 'INTJ,INTP,ENTJ', disc_styles: 'D,C', industry: 'Professional Services', age_tiers: 'young_adult,adult' },
      { title: 'Software Engineering', description: 'Build software systems that solve real-world problems.', salary_range: '$90k-$200k', growth_outlook: 'Very High', education_req: 'Degree', primary_trait: 'C', primary_trait_min: 55, secondary_trait: 'O', secondary_trait_min: 50, mbti_types: 'INTP,ISTJ,INTJ', disc_styles: 'C,I', industry: 'Technology', age_tiers: 'young_adult,adult' },
      { title: 'Clinical Psychology', description: 'Help people understand and improve their mental health.', salary_range: '$80k-$150k', growth_outlook: 'High', education_req: 'Degree', primary_trait: 'A', primary_trait_min: 70, secondary_trait: 'N', secondary_trait_min: 55, mbti_types: 'INFJ,INFP', disc_styles: 'S,I', industry: 'Healthcare', age_tiers: 'adult' },
      { title: 'Marketing Strategy', description: 'Develop campaigns that connect brands with audiences.', salary_range: '$70k-$160k', growth_outlook: 'Moderate', education_req: 'Degree', primary_trait: 'E', primary_trait_min: 60, secondary_trait: 'O', secondary_trait_min: 55, mbti_types: 'ENFP,ENTP,ENFJ', disc_styles: 'I,D', industry: 'Marketing', age_tiers: 'young_adult,adult' },
      { title: 'Data Science', description: 'Extract insights from data to drive business decisions.', salary_range: '$100k-$220k', growth_outlook: 'Very High', education_req: 'Degree', primary_trait: 'O', primary_trait_min: 60, secondary_trait: 'C', secondary_trait_min: 50, mbti_types: 'INTP,INTJ', disc_styles: 'C,I', industry: 'Technology', age_tiers: 'young_adult,adult' },
    ];

    const growthTipsData = [
      { title: 'Delegate More', description: 'Your desire for control can hold you back.', action_steps: JSON.stringify(['Identify 3 tasks you can delegate', 'Let go of perfectionism on delegated items', 'Focus on high-impact activities']), timeframe: 'Weekly', target_trait: 'C', trait_direction: 'balance' },
      { title: 'Practice Active Listening', description: 'Deep listening strengthens relationships.', action_steps: JSON.stringify(['In your next conversation, listen without planning your response', 'Ask one follow-up question', 'Paraphrase what you heard']), timeframe: 'Daily', target_trait: 'A', trait_direction: 'strengthen' },
      { title: 'Embrace Discomfort', description: 'Growth happens outside your comfort zone.', action_steps: JSON.stringify(['Pick one thing that scares you this week', 'Do it anyway', 'Reflect on what you learned']), timeframe: 'Weekly', target_trait: 'N', trait_direction: 'balance' },
      { title: 'Network Strategically', description: 'Build meaningful professional connections.', action_steps: JSON.stringify(['Reach out to one new person in your field', 'Schedule a virtual coffee', 'Offer value before asking for help']), timeframe: 'Weekly', target_trait: 'E', trait_direction: 'strengthen' },
      { title: 'Explore Creative Outlets', description: 'Your creative side needs expression.', action_steps: JSON.stringify(['Dedicate 30 min daily to creative activity', 'Try something you\'ve never done', 'Share your creation with someone']), timeframe: 'Daily', target_trait: 'O', trait_direction: 'strengthen' },
    ];

    // Insert premium insights
    const insertResults = await Promise.all([
      getSupabaseAdmin().from('side_hustles').insert(sideHustlesData),
      getSupabaseAdmin().from('blindspots').insert(blindspotsData),
      getSupabaseAdmin().from('career_paths').insert(careerPathsData),
      getSupabaseAdmin().from('growth_tips').insert(growthTipsData),
    ]);

    const errors = insertResults.filter(r => r.error).map(r => r.error);
    if (errors.length > 0) {
      console.error('[POST /api/admin/seed-premium] Errors:', errors);
    }

    return NextResponse.json({
      success: true,
      message: 'Premium insights seeded successfully',
      sideHustlesSeeded: sideHustlesData.length,
      blindspotsSeeded: blindspotsData.length,
      careerPathsSeeded: careerPathsData.length,
      growthTipsSeeded: growthTipsData.length,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/admin/seed-premium] Error:', error);
    return NextResponse.json(
      { error: 'Failed to seed premium insights' },
      { status: 500, headers: corsHeaders }
    );
  }
}
