export interface LocaleInsight {
  city: string;
  metro: string;
  population: "major" | "mid" | "small";
  marketType: "tech" | "finance" | "creative" | "healthcare" | "manufacturing" | "government" | "mixed";
  costIndex: "high" | "medium" | "low";
  insights: {
    general: string;
    introvert: string;
    extrovert: string;
    analytical: string;
    creative: string;
  };
  opportunities: string[];
  culture: string;
}

export interface RegionalInsight {
  region: string;
  areaType: "urban" | "suburban" | "rural";
  insights: {
    general: string;
    introvert: string;
    extrovert: string;
  };
}

export const metroInsights: Record<string, LocaleInsight> = {
  "new york": {
    city: "New York",
    metro: "NYC Metro",
    population: "major",
    marketType: "finance",
    costIndex: "high",
    insights: {
      general: "In NYC's fast-paced environment, your unique strengths can help you stand out in one of the world's most competitive markets.",
      introvert: "NYC offers countless quiet corners and niche communities where you can thrive without the constant spotlight—from cozy bookshops to specialized meetup groups.",
      extrovert: "The city's endless networking events, diverse neighborhoods, and 24/7 energy are perfect for someone who thrives on human connection.",
      analytical: "From Wall Street to tech startups, NYC rewards systematic thinkers who can navigate complex systems and spot patterns others miss.",
      creative: "NYC's art galleries, fashion districts, and creative agencies offer endless inspiration and opportunities to showcase innovative thinking."
    },
    opportunities: ["Finance", "Media", "Tech", "Fashion", "Arts"],
    culture: "Fast-paced, diverse, and highly competitive with endless opportunity for those who hustle"
  },
  "los angeles": {
    city: "Los Angeles",
    metro: "LA Metro",
    population: "major",
    marketType: "creative",
    costIndex: "high",
    insights: {
      general: "LA's entertainment-driven economy values creativity and personal branding—your personality type can help you carve out a unique niche.",
      introvert: "Behind LA's flashy exterior are countless behind-the-scenes roles in production, writing, and tech where thoughtful introverts thrive.",
      extrovert: "From networking brunches to industry events, LA rewards those who can build relationships and put themselves out there.",
      analytical: "LA's growing tech scene and entertainment analytics need systematic thinkers who can bring order to creative chaos.",
      creative: "The entertainment capital of the world is your playground—whether in traditional media, gaming, or emerging content platforms."
    },
    opportunities: ["Entertainment", "Tech", "Aerospace", "Fashion", "Hospitality"],
    culture: "Creative, laid-back surface with intense ambition underneath"
  },
  "san francisco": {
    city: "San Francisco",
    metro: "Bay Area",
    population: "major",
    marketType: "tech",
    costIndex: "high",
    insights: {
      general: "The Bay Area's innovation culture values disruption and unconventional thinking—your unique perspective is an asset here.",
      introvert: "SF's tech culture embraces deep focus work, async communication, and respects the need for heads-down concentration time.",
      extrovert: "From pitch nights to tech meetups, the Bay Area rewards those who can articulate vision and build coalitions.",
      analytical: "Silicon Valley was built by analytical minds—your systematic approach aligns perfectly with the engineering-driven culture.",
      creative: "The intersection of design thinking and technology creates unique opportunities for creative problem-solvers."
    },
    opportunities: ["Tech", "Biotech", "Venture Capital", "Startups", "Clean Energy"],
    culture: "Innovation-obsessed, meritocratic, and future-focused"
  },
  "chicago": {
    city: "Chicago",
    metro: "Chicagoland",
    population: "major",
    marketType: "mixed",
    costIndex: "medium",
    insights: {
      general: "Chicago's diverse economy offers stability and opportunity across industries—a solid foundation for building any career.",
      introvert: "The Midwest work ethic values substance over flash—your thoughtful approach is respected in Chicago's business culture.",
      extrovert: "Chicago's strong neighborhood culture and networking scene reward those who build genuine, lasting relationships.",
      analytical: "From trading floors to logistics hubs, Chicago's economy rewards methodical thinkers who can optimize complex systems.",
      creative: "Chicago's advertising agencies, architecture firms, and comedy scene offer outlets for innovative expression."
    },
    opportunities: ["Finance", "Manufacturing", "Healthcare", "Logistics", "Food Industry"],
    culture: "Hardworking, practical, with strong community ties and Midwest values"
  },
  "miami": {
    city: "Miami",
    metro: "South Florida",
    population: "major",
    marketType: "mixed",
    costIndex: "high",
    insights: {
      general: "Miami's position as a gateway to Latin America offers unique opportunities for those who can bridge cultures.",
      introvert: "Beyond the beach parties, Miami's growing tech and finance sectors offer focused roles for analytical minds.",
      extrovert: "Miami's social scene and international business culture reward relationship builders who can navigate diverse networks.",
      analytical: "Miami's emerging fintech scene and international trade operations need systematic thinkers who understand global markets.",
      creative: "Art Basel, fashion, and media production make Miami a hub for creative professionals with international flair."
    },
    opportunities: ["Real Estate", "International Trade", "Fintech", "Hospitality", "Healthcare"],
    culture: "International, entrepreneurial, with a blend of Latin and American business styles"
  },
  "seattle": {
    city: "Seattle",
    metro: "Puget Sound",
    population: "major",
    marketType: "tech",
    costIndex: "high",
    insights: {
      general: "Seattle's tech giants and coffee culture create an environment where innovation meets thoughtful, sustainable growth.",
      introvert: "Seattle's introverted culture—from quiet coffee shops to nature retreats—is perfect for those who recharge alone.",
      extrovert: "From tech meetups to outdoor adventure groups, Seattle offers community for those who seek connection.",
      analytical: "Amazon, Microsoft, and countless startups value the engineering mindset and data-driven decision making.",
      creative: "Seattle's music history, gaming industry, and design culture offer creative outlets within tech-forward companies."
    },
    opportunities: ["Tech", "E-commerce", "Gaming", "Aerospace", "Clean Tech"],
    culture: "Intellectual, outdoorsy, and quietly ambitious with strong tech DNA"
  },
  "austin": {
    city: "Austin",
    metro: "Central Texas",
    population: "major",
    marketType: "tech",
    costIndex: "medium",
    insights: {
      general: "Austin's 'Keep It Weird' ethos means unconventional thinkers and unique personalities are celebrated, not sidelined.",
      introvert: "Austin's creative scene values depth over flash—from indie music to thoughtful tech, substance wins here.",
      extrovert: "SXSW culture year-round means endless opportunities to connect, collaborate, and build community.",
      analytical: "Tesla, Oracle, and growing startups bring Silicon Valley thinking with Texas-sized opportunity.",
      creative: "Music, film, and tech convergence make Austin a playground for creative technologists and artists."
    },
    opportunities: ["Tech", "Music Industry", "Film Production", "Startups", "Clean Energy"],
    culture: "Creative, entrepreneurial, with Texas independence and California innovation"
  },
  "boston": {
    city: "Boston",
    metro: "Greater Boston",
    population: "major",
    marketType: "healthcare",
    costIndex: "high",
    insights: {
      general: "Boston's concentration of universities and hospitals creates an intellectually rigorous environment that rewards deep expertise.",
      introvert: "Academia and research culture value deep thinking and specialized knowledge—perfect for focused introverts.",
      extrovert: "From Harvard networking to biotech conferences, Boston's elite circles reward confident relationship builders.",
      analytical: "Boston's biotech corridor and financial services sector need systematic thinkers who can navigate complexity.",
      creative: "Design agencies, ed-tech startups, and research institutions offer creative problem-solving opportunities."
    },
    opportunities: ["Biotech", "Healthcare", "Education", "Finance", "Robotics"],
    culture: "Intellectual, historical, with strong academic and innovation traditions"
  },
  "denver": {
    city: "Denver",
    metro: "Front Range",
    population: "major",
    marketType: "mixed",
    costIndex: "medium",
    insights: {
      general: "Denver's outdoor culture and growing tech scene offer work-life balance with meaningful career opportunities.",
      introvert: "Nature access for recharging combined with growing remote-work culture suits those who value solitude.",
      extrovert: "Active outdoor community and growing business scene offer networking through shared experiences.",
      analytical: "Aerospace, tech, and renewable energy sectors value systematic thinking and engineering excellence.",
      creative: "Art districts, craft brewing culture, and outdoor industry design offer creative outlets."
    },
    opportunities: ["Tech", "Aerospace", "Renewable Energy", "Outdoor Industry", "Cannabis"],
    culture: "Active, balanced, with entrepreneurial spirit and mountain lifestyle"
  },
  "atlanta": {
    city: "Atlanta",
    metro: "Metro Atlanta",
    population: "major",
    marketType: "mixed",
    costIndex: "medium",
    insights: {
      general: "Atlanta's position as the economic capital of the South offers diverse opportunities with lower cost than coastal cities.",
      introvert: "Corporate headquarters and established industries offer stable, structured environments for thoughtful professionals.",
      extrovert: "Southern hospitality and strong networking culture reward relationship builders who invest in community.",
      analytical: "Logistics hub status and growing fintech scene need systematic thinkers who can optimize operations.",
      creative: "Film industry growth, music scene, and advertising agencies offer creative career paths."
    },
    opportunities: ["Film/TV", "Logistics", "Fintech", "Healthcare", "Corporate HQs"],
    culture: "Southern hospitality meets metropolitan ambition with strong civil rights heritage"
  }
};

export const regionalInsights: Record<string, RegionalInsight> = {
  "northeast_urban": {
    region: "Northeast Urban",
    areaType: "urban",
    insights: {
      general: "The Northeast's dense urban centers value efficiency, direct communication, and proven track records.",
      introvert: "Historic cities offer quiet museums, libraries, and intellectual communities where depth is valued.",
      extrovert: "Packed calendars of networking events and professional associations reward active relationship builders."
    }
  },
  "northeast_suburban": {
    region: "Northeast Suburban",
    areaType: "suburban",
    insights: {
      general: "Suburban Northeast offers access to major markets while providing more space for focused work.",
      introvert: "Home offices and quieter communities offer the solitude many professionals seek.",
      extrovert: "Country clubs, community organizations, and local business networks offer connection opportunities."
    }
  },
  "southeast_urban": {
    region: "Southeast Urban",
    areaType: "urban",
    insights: {
      general: "Growing Southern cities offer lower costs and emerging opportunities with warm, welcoming cultures.",
      introvert: "Southern politeness means less aggressive networking—quality relationships over quantity are valued.",
      extrovert: "Church communities, professional groups, and social clubs offer rich networking opportunities."
    }
  },
  "midwest_urban": {
    region: "Midwest Urban",
    areaType: "urban",
    insights: {
      general: "Midwest cities offer solid career foundations with practical, hardworking cultures and affordable living.",
      introvert: "Midwest work ethic values results over self-promotion—let your work speak for itself.",
      extrovert: "Strong community ties and genuine networking cultures reward authentic relationship builders."
    }
  },
  "southwest_urban": {
    region: "Southwest Urban",
    areaType: "urban",
    insights: {
      general: "Rapid growth in Southwest cities means opportunity for those willing to build new networks and systems.",
      introvert: "Remote work culture and outdoor recreation offer balance between career and personal recharging.",
      extrovert: "Transplant-heavy populations mean everyone is building networks—perfect for connectors."
    }
  },
  "west_coast_urban": {
    region: "West Coast Urban",
    areaType: "urban",
    insights: {
      general: "West Coast cities blend innovation with lifestyle focus—work hard, play hard culture prevails.",
      introvert: "Tech culture's embrace of remote work and async communication suits focused introverts.",
      extrovert: "Pitch culture and startup networking reward those comfortable with self-promotion."
    }
  },
  "rural": {
    region: "Rural America",
    areaType: "rural",
    insights: {
      general: "Rural areas offer lower costs and closer communities, with growing remote work opportunities bridging the gap.",
      introvert: "Peaceful environments and close-knit communities can be perfect for those who prefer depth over breadth.",
      extrovert: "Smaller communities mean deeper relationships—quality networking over quantity."
    }
  }
};

export function getLocaleInsight(city: string, state?: string): LocaleInsight | null {
  const normalizedCity = city.toLowerCase().trim();
  
  if (metroInsights[normalizedCity]) {
    return metroInsights[normalizedCity];
  }
  
  const cityAliases: Record<string, string> = {
    "new york city": "new york",
    "nyc": "new york",
    "manhattan": "new york",
    "brooklyn": "new york",
    "queens": "new york",
    "bronx": "new york",
    "staten island": "new york",
    "beverly hills": "los angeles",
    "santa monica": "los angeles",
    "hollywood": "los angeles",
    "pasadena": "los angeles",
    "long beach": "los angeles",
    "san jose": "san francisco",
    "oakland": "san francisco",
    "palo alto": "san francisco",
    "mountain view": "san francisco",
    "cupertino": "san francisco",
    "fremont": "san francisco",
    "sunnyvale": "san francisco",
    "redwood city": "san francisco",
    "evanston": "chicago",
    "naperville": "chicago",
    "aurora": "chicago",
    "miami beach": "miami",
    "fort lauderdale": "miami",
    "coral gables": "miami",
    "bellevue": "seattle",
    "redmond": "seattle",
    "tacoma": "seattle",
    "cambridge": "boston",
    "somerville": "boston",
    "brookline": "boston",
    "round rock": "austin",
    "boulder": "denver",
    "lakewood": "denver",
    "marietta": "atlanta",
    "decatur": "atlanta",
    "sandy springs": "atlanta"
  };
  
  if (cityAliases[normalizedCity]) {
    return metroInsights[cityAliases[normalizedCity]];
  }
  
  return null;
}

export function getRegionalInsight(state?: string, city?: string): RegionalInsight {
  const northeastStates = ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA", "DE", "MD", "DC"];
  const southeastStates = ["VA", "WV", "NC", "SC", "GA", "FL", "AL", "MS", "LA", "AR", "TN", "KY"];
  const midwestStates = ["OH", "MI", "IN", "IL", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"];
  const southwestStates = ["TX", "OK", "NM", "AZ"];
  const westCoastStates = ["CA", "OR", "WA", "NV", "HI", "AK"];
  const mountainStates = ["MT", "ID", "WY", "CO", "UT"];
  
  const stateUpper = state?.toUpperCase();
  
  if (stateUpper && northeastStates.includes(stateUpper)) {
    return regionalInsights["northeast_urban"];
  }
  if (stateUpper && southeastStates.includes(stateUpper)) {
    return regionalInsights["southeast_urban"];
  }
  if (stateUpper && midwestStates.includes(stateUpper)) {
    return regionalInsights["midwest_urban"];
  }
  if (stateUpper && southwestStates.includes(stateUpper)) {
    return regionalInsights["southwest_urban"];
  }
  if (stateUpper && westCoastStates.includes(stateUpper)) {
    return regionalInsights["west_coast_urban"];
  }
  if (stateUpper && mountainStates.includes(stateUpper)) {
    return regionalInsights["southwest_urban"];
  }
  
  return regionalInsights["rural"];
}

export function getPersonalizedInsight(
  city: string | null,
  state: string | null,
  isExtrovert: boolean,
  isAnalytical: boolean
): string {
  const localeInsight = city ? getLocaleInsight(city, state || undefined) : null;
  
  if (localeInsight) {
    if (isExtrovert) {
      return localeInsight.insights.extrovert;
    }
    if (isAnalytical) {
      return localeInsight.insights.analytical;
    }
    return localeInsight.insights.general;
  }
  
  const regionalInsight = getRegionalInsight(state || undefined, city || undefined);
  
  if (isExtrovert) {
    return regionalInsight.insights.extrovert;
  }
  return regionalInsight.insights.general;
}
