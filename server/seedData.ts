import { db } from './db';
import { traitVibes, traitCombinations, adventureArchetypes } from '@shared/schema';

const TRAIT_VIBES_DATA = [
  // Openness
  { trait: "openness", quartile: "low", scoreMin: 0, scoreMax: 25, vibeTitle: "The Steady Traditionalist", vibeDescription: "You love familiar routines and practical details—think the cozy librarian curating timeless classics, thriving in structured worlds where reliability trumps reinvention." },
  { trait: "openness", quartile: "low_mid", scoreMin: 26, scoreMax: 50, vibeTitle: "The Balanced Appreciator", vibeDescription: "You enjoy a dash of novelty but stick to proven paths—picture the weekend hobbyist tinkering with recipes from grandma's cookbook, blending comfort with occasional tweaks." },
  { trait: "openness", quartile: "mid_high", scoreMin: 51, scoreMax: 75, vibeTitle: "The Curious Explorer", vibeDescription: "You dip into ideas with enthusiasm—envision the book club enthusiast debating plot twists over coffee, weaving fresh perspectives into everyday chats without going full avant-garde." },
  { trait: "openness", quartile: "high", scoreMin: 76, scoreMax: 100, vibeTitle: "The Boundless Visionary", vibeDescription: "You chase wild 'what ifs' and abstract dreams—imagine the street artist turning urban walls into surreal stories, fueled by endless curiosity and a knack for reimagining the ordinary." },
  
  // Conscientiousness
  { trait: "conscientiousness", quartile: "low", scoreMin: 0, scoreMax: 25, vibeTitle: "The Free-Spirited Improviser", vibeDescription: "You flow with the moment over checklists—think the spontaneous road-tripper packing light and letting detours dictate the adventure, embracing chaos as creative fuel." },
  { trait: "conscientiousness", quartile: "low_mid", scoreMin: 26, scoreMax: 50, vibeTitle: "The Flexible Doer", vibeDescription: "You start strong but adapt on the fly—picture the casual gardener planting intuitively, weeding when inspired rather than on schedule, balancing effort with easygoing vibes." },
  { trait: "conscientiousness", quartile: "mid_high", scoreMin: 51, scoreMax: 75, vibeTitle: "The Dependable Achiever", vibeDescription: "You plan just enough to deliver—envision the project coordinator juggling tasks with a trusty notebook, hitting milestones reliably while leaving room for inspired pivots." },
  { trait: "conscientiousness", quartile: "high", scoreMin: 76, scoreMax: 100, vibeTitle: "The Meticulous Mastermind", vibeDescription: "You have laser-focused discipline—imagine the elite chef prepping every ingredient hours ahead, orchestrating flawless meals through unwavering routines and precision." },
  
  // Extraversion
  { trait: "extraversion", quartile: "low", scoreMin: 0, scoreMax: 25, vibeTitle: "The Serene Solo Navigator", vibeDescription: "You recharge in quiet depths—think the midnight reader lost in novels by lamplight, savoring intimate connections over crowds, where silence sparks profound insights." },
  { trait: "extraversion", quartile: "low_mid", scoreMin: 26, scoreMax: 50, vibeTitle: "The Selective Socializer", vibeDescription: "You shine in small circles—picture the coffee shop conversationalist trading stories with a few friends, drawing energy from meaningful exchanges without needing the spotlight." },
  { trait: "extraversion", quartile: "mid_high", scoreMin: 51, scoreMax: 75, vibeTitle: "The Engaging Connector", vibeDescription: "You thrive in moderate mingles—envision the team brainstormer rallying ideas at lunch meetups, energizing groups with charm while retreating for solo recharge when needed." },
  { trait: "extraversion", quartile: "high", scoreMin: 76, scoreMax: 100, vibeTitle: "The Magnetic Energizer", vibeDescription: "You light up every room—imagine the festival host weaving through crowds with infectious laughs, fueling adventures and turning strangers into instant allies on a whim." },
  
  // Agreeableness
  { trait: "agreeableness", quartile: "low", scoreMin: 0, scoreMax: 25, vibeTitle: "The Bold Challenger", vibeDescription: "You prioritize truth over harmony—think the witty debater at dinner parties, cutting through fluff with sharp insights, unafraid to ruffle feathers for the greater good." },
  { trait: "agreeableness", quartile: "low_mid", scoreMin: 26, scoreMax: 50, vibeTitle: "The Pragmatic Peacemaker", vibeDescription: "You compromise strategically—picture the negotiation-savvy colleague advocating firmly but fairly, blending empathy with a no-nonsense edge to keep things moving." },
  { trait: "agreeableness", quartile: "mid_high", scoreMin: 51, scoreMax: 75, vibeTitle: "The Warm Collaborator", vibeDescription: "You foster easy alliances—envision the community organizer smoothing group tensions with genuine smiles, building bridges through kindness without losing your voice." },
  { trait: "agreeableness", quartile: "high", scoreMin: 76, scoreMax: 100, vibeTitle: "The Heartfelt Harmonizer", vibeDescription: "You put others first—imagine the devoted mentor cheering on dreams with unwavering support, creating ripple effects of positivity in every interaction." },
  
  // Neuroticism (Emotional Sensitivity)
  { trait: "neuroticism", quartile: "low", scoreMin: 0, scoreMax: 25, vibeTitle: "The Unflappable Zen Master", vibeDescription: "You roll with life's punches—think the surfer riding waves without a flinch, channeling calm focus into steady progress amid any storm." },
  { trait: "neuroticism", quartile: "low_mid", scoreMin: 26, scoreMax: 50, vibeTitle: "The Even-Keeled Responder", vibeDescription: "You feel dips but bounce quick—picture the hiker pausing at tough trails for a breath, then pushing on with quiet resilience and a wry smile." },
  { trait: "neuroticism", quartile: "mid_high", scoreMin: 51, scoreMax: 75, vibeTitle: "The Attuned Empath", vibeDescription: "You navigate emotions with depth—envision the journal-keeping friend processing worries into wisdom, turning inner turbulence into empathetic connections." },
  { trait: "neuroticism", quartile: "high", scoreMin: 76, scoreMax: 100, vibeTitle: "The Passionate Feeler", vibeDescription: "Your intensity fuels profound change—imagine the activist pouring heart into causes, transforming raw sensitivity into powerful advocacy that moves mountains." },
];

const TRAIT_COMBINATIONS_DATA = [
  // High Openness combinations
  { trait1: "openness", trait1Level: "high", trait2: "extraversion", trait2Level: "high", comboTitle: "The Creative Spark", comboDescription: "You're a social innovator who lights up rooms with wild ideas and infectious energy. You make brainstorming feel like a party." },
  { trait1: "openness", trait1Level: "high", trait2: "conscientiousness", trait2Level: "high", comboTitle: "The Visionary Architect", comboDescription: "You dream big AND deliver. Your creative visions get executed with precision—a rare combination that turns possibilities into reality." },
  { trait1: "openness", trait1Level: "high", trait2: "agreeableness", trait2Level: "high", comboTitle: "The Compassionate Innovator", comboDescription: "You invent solutions that truly help people. Your creativity is guided by genuine care for others' wellbeing." },
  { trait1: "openness", trait1Level: "high", trait2: "neuroticism", trait2Level: "low", comboTitle: "The Serene Trailblazer", comboDescription: "You explore uncharted territory with calm confidence. New challenges excite rather than stress you." },
  
  // High Conscientiousness combinations
  { trait1: "conscientiousness", trait1Level: "high", trait2: "extraversion", trait2Level: "high", comboTitle: "The Dynamic Leader", comboDescription: "You inspire teams AND keep them on track. Your organized energy makes group projects actually fun and productive." },
  { trait1: "conscientiousness", trait1Level: "high", trait2: "agreeableness", trait2Level: "high", comboTitle: "The Reliable Ally", comboDescription: "You're the friend everyone can count on. You show up, follow through, and genuinely care about helping." },
  { trait1: "conscientiousness", trait1Level: "high", trait2: "neuroticism", trait2Level: "low", comboTitle: "The Steady Performer", comboDescription: "Pressure doesn't phase you—it focuses you. You deliver excellence without the stress spiral." },
  
  // High Extraversion combinations
  { trait1: "extraversion", trait1Level: "high", trait2: "agreeableness", trait2Level: "high", comboTitle: "The Natural Connector", comboDescription: "You make everyone feel included. Your warmth and energy create instant communities wherever you go." },
  { trait1: "extraversion", trait1Level: "high", trait2: "neuroticism", trait2Level: "low", comboTitle: "The Confident Socialite", comboDescription: "You work the room with ease and genuine joy. Social situations energize rather than drain you." },
  
  // Interesting contrasts
  { trait1: "openness", trait1Level: "low", trait2: "conscientiousness", trait2Level: "high", comboTitle: "The Precision Expert", comboDescription: "You master tried-and-true methods with exceptional skill. Your expertise in established practices is unmatched." },
  { trait1: "extraversion", trait1Level: "low", trait2: "openness", trait2Level: "high", comboTitle: "The Quiet Genius", comboDescription: "Your best ideas come in solitude. You're a deep thinker who creates innovative work away from the crowd." },
  { trait1: "agreeableness", trait1Level: "low", trait2: "conscientiousness", trait2Level: "high", comboTitle: "The Tough Strategist", comboDescription: "You make hard decisions and see them through. Your directness and discipline drive results." },
];

const ADVENTURE_ARCHETYPES_DATA = [
  {
    name: "The Inventor",
    superpower: "You turn ideas into amazing things!",
    description: "You love figuring out how things work and building new stuff. Your brain is always buzzing with cool ideas.",
    mission: "Build something awesome with stuff around your house today!",
    badgeColor: "#3B82F6", // blue
    traits: JSON.stringify({ openness: "high", conscientiousness: "mid_high" }),
  },
  {
    name: "The Storyteller",
    superpower: "You bring imagination to life!",
    description: "You have amazing ideas and love sharing them. Whether it's drawing, writing, or acting things out, you make the world more colorful.",
    mission: "Create a short story or comic about a superhero who has YOUR personality!",
    badgeColor: "#A855F7", // purple
    traits: JSON.stringify({ openness: "high", extraversion: "mid_high" }),
  },
  {
    name: "The Helper",
    superpower: "You make everyone feel cared for!",
    description: "You notice when people need help and you're always there for them. Your kindness makes the world a better place.",
    mission: "Do something nice for someone without being asked today!",
    badgeColor: "#EC4899", // pink
    traits: JSON.stringify({ agreeableness: "high", extraversion: "mid" }),
  },
  {
    name: "The Explorer",
    superpower: "You discover what others miss!",
    description: "You're always curious and asking 'why?' You love learning new things and going on adventures, even small ones.",
    mission: "Find something you've never noticed before in your neighborhood!",
    badgeColor: "#10B981", // green
    traits: JSON.stringify({ openness: "high", neuroticism: "low" }),
  },
  {
    name: "The Leader",
    superpower: "You bring people together!",
    description: "You're great at organizing games and helping your friends work as a team. People look to you when they need direction.",
    mission: "Organize a fun activity with friends or family this week!",
    badgeColor: "#F59E0B", // amber
    traits: JSON.stringify({ extraversion: "high", conscientiousness: "high" }),
  },
  {
    name: "The Artist",
    superpower: "You see the world in your own special way!",
    description: "You express yourself through art, music, dance, or anything creative. You're not afraid to be different and that's awesome.",
    mission: "Create something that shows how you're feeling right now!",
    badgeColor: "#EF4444", // red
    traits: JSON.stringify({ openness: "high", agreeableness: "low_mid" }),
  },
];

export async function seedTraitVibes() {
  console.log("Seeding trait vibes...");
  
  // Clear existing data
  await db.delete(traitVibes);
  
  // Insert new data
  for (const vibe of TRAIT_VIBES_DATA) {
    await db.insert(traitVibes).values(vibe);
  }
  
  console.log(`Inserted ${TRAIT_VIBES_DATA.length} trait vibes`);
}

export async function seedTraitCombinations() {
  console.log("Seeding trait combinations...");
  
  // Clear existing data
  await db.delete(traitCombinations);
  
  // Insert new data
  for (const combo of TRAIT_COMBINATIONS_DATA) {
    await db.insert(traitCombinations).values(combo);
  }
  
  console.log(`Inserted ${TRAIT_COMBINATIONS_DATA.length} trait combinations`);
}

export async function seedAdventureArchetypes() {
  console.log("Seeding adventure archetypes...");
  
  // Clear existing data
  await db.delete(adventureArchetypes);
  
  // Insert new data
  for (const archetype of ADVENTURE_ARCHETYPES_DATA) {
    await db.insert(adventureArchetypes).values(archetype);
  }
  
  console.log(`Inserted ${ADVENTURE_ARCHETYPES_DATA.length} adventure archetypes`);
}

export async function seedAll() {
  await seedTraitVibes();
  await seedTraitCombinations();
  await seedAdventureArchetypes();
  console.log("All seed data inserted successfully!");
}

// Re-export premium insights seeder
export { seedPremiumInsights } from './seeds/premiumInsights';
