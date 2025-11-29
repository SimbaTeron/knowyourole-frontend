export interface PremiumBranchOption {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

export interface PremiumBranchQuestion {
  id: string;
  prompt: string;
  subtitle: string;
  options: PremiumBranchOption[];
}

export interface RefinementQuestion {
  id: string;
  prompt: string;
  path: string[];
  optionA: { label: string; trait: string };
  optionB: { label: string; trait: string };
}

export const CAREER_BRANCH_Q1: PremiumBranchQuestion = {
  id: "branch1",
  prompt: "Which type of work excites you most?",
  subtitle: "Let's narrow down your ideal career path",
  options: [
    {
      id: "trades",
      label: "Working with my hands",
      icon: "Wrench",
      desc: "Building, fixing, creating tangible things"
    },
    {
      id: "professional",
      label: "Working with ideas & people",
      icon: "Briefcase",
      desc: "Strategy, analysis, leadership, service"
    },
    {
      id: "creative",
      label: "Creating & expressing",
      icon: "Palette",
      desc: "Art, design, performance, storytelling"
    }
  ]
};

export const CAREER_BRANCH_Q2: Record<string, PremiumBranchQuestion> = {
  trades: {
    id: "branch2-trades",
    prompt: "What's your ideal work environment?",
    subtitle: "Trades path refinement",
    options: [
      {
        id: "indoor-tech",
        label: "Indoor technical work",
        icon: "Cpu",
        desc: "Electronics, machinery, precision work"
      },
      {
        id: "outdoor-field",
        label: "Outdoor fieldwork",
        icon: "Mountain",
        desc: "Construction, utilities, agriculture"
      },
      {
        id: "service-repair",
        label: "Service & repair",
        icon: "Settings",
        desc: "HVAC, automotive, appliance repair"
      }
    ]
  },
  service: {
    id: "branch2-service",
    prompt: "What kind of service sparks you?",
    subtitle: "Service path refinement",
    options: [
      {
        id: "hands-on-help",
        label: "Help hands-on",
        icon: "Wrench",
        desc: "Fix things, build solutions, get dirty"
      },
      {
        id: "guide-chats",
        label: "Guide through chats",
        icon: "MessageCircle",
        desc: "Counseling, coaching, conversations"
      },
      {
        id: "care-routines",
        label: "Care routines",
        icon: "Heart",
        desc: "Healthcare, wellness, daily support"
      }
    ]
  },
  professional: {
    id: "branch2-professional",
    prompt: "What drives your professional satisfaction?",
    subtitle: "Professional path refinement",
    options: [
      {
        id: "strategic",
        label: "Strategy & analysis",
        icon: "TrendingUp",
        desc: "Data, planning, problem-solving"
      },
      {
        id: "people",
        label: "Direct people interaction",
        icon: "Users",
        desc: "Teaching, counseling, leading teams"
      },
      {
        id: "systems",
        label: "Systems & processes",
        icon: "Workflow",
        desc: "Operations, logistics, compliance"
      }
    ]
  },
  creative: {
    id: "branch2-creative",
    prompt: "How do you prefer to express creativity?",
    subtitle: "Creative path refinement",
    options: [
      {
        id: "visual",
        label: "Visual & design",
        icon: "Image",
        desc: "Graphics, fashion, architecture"
      },
      {
        id: "performance",
        label: "Performance & communication",
        icon: "Mic",
        desc: "Acting, music, presenting"
      },
      {
        id: "narrative",
        label: "Writing & storytelling",
        icon: "BookOpen",
        desc: "Content, journalism, copywriting"
      }
    ]
  }
};

export const REFINEMENT_QUESTIONS: RefinementQuestion[] = [
  {
    id: "refine1",
    prompt: "Do you prefer working independently or with a team?",
    path: ["all"],
    optionA: { label: "Solo focus", trait: "independent" },
    optionB: { label: "Team energy", trait: "collaborative" }
  },
  {
    id: "refine2",
    prompt: "Fast-paced variety or steady routine?",
    path: ["all"],
    optionA: { label: "Variety & change", trait: "dynamic" },
    optionB: { label: "Consistent routine", trait: "stable" }
  },
  {
    id: "refine3",
    prompt: "Would you prefer to lead or support?",
    path: ["all"],
    optionA: { label: "Take the lead", trait: "leadership" },
    optionB: { label: "Support the team", trait: "support" }
  },
  {
    id: "refine4",
    prompt: "Details or big picture?",
    path: ["all"],
    optionA: { label: "Precision & details", trait: "detail" },
    optionB: { label: "Vision & strategy", trait: "vision" }
  },
  {
    id: "refine5-trades",
    prompt: "Heavy equipment or precision tools?",
    path: ["trades"],
    optionA: { label: "Big machinery", trait: "heavy" },
    optionB: { label: "Fine precision", trait: "precision" }
  },
  {
    id: "refine5-professional",
    prompt: "Numbers-driven or intuition-guided?",
    path: ["professional"],
    optionA: { label: "Data & metrics", trait: "analytical" },
    optionB: { label: "Instinct & relationships", trait: "intuitive" }
  },
  {
    id: "refine5-creative",
    prompt: "Commercial or artistic?",
    path: ["creative"],
    optionA: { label: "Market-focused", trait: "commercial" },
    optionB: { label: "Pure expression", trait: "artistic" }
  },
  {
    id: "refine6",
    prompt: "Physical movement or desk-based?",
    path: ["all"],
    optionA: { label: "On my feet", trait: "active" },
    optionB: { label: "At a desk", trait: "sedentary" }
  },
  {
    id: "refine7",
    prompt: "Interact with customers/clients often?",
    path: ["all"],
    optionA: { label: "Yes, regularly", trait: "customer-facing" },
    optionB: { label: "Prefer behind-scenes", trait: "backend" }
  },
  {
    id: "refine8",
    prompt: "Traditional path or entrepreneurial?",
    path: ["all"],
    optionA: { label: "Steady career path", trait: "traditional" },
    optionB: { label: "Build my own thing", trait: "entrepreneur" }
  }
];

export interface CareerPath {
  branch1: string;
  branch2: string;
  traits: string[];
}

export function getPathRefinementQuestions(path: CareerPath): RefinementQuestion[] {
  return REFINEMENT_QUESTIONS.filter(q => 
    q.path.includes("all") || q.path.includes(path.branch1)
  ).slice(0, 8);
}

export const PATH_ROLE_MODIFIERS: Record<string, string[]> = {
  "trades-indoor-tech": ["CNC Machinist", "Electronics Technician", "Quality Inspector", "Factory Supervisor"],
  "trades-outdoor-field": ["Lineman", "Ironworker", "Crane Operator", "Agricultural Technician"],
  "trades-service-repair": ["HVAC Technician", "Automotive Mechanic", "Appliance Repair Tech", "Plumber"],
  "professional-strategic": ["Data Scientist", "Financial Analyst", "Management Consultant", "Product Manager"],
  "professional-people": ["Teacher", "Counselor", "HR Manager", "Sales Director"],
  "professional-systems": ["Operations Manager", "Project Manager", "Compliance Officer", "Logistics Coordinator"],
  "creative-visual": ["Graphic Designer", "Architect", "Fashion Designer", "UX Designer"],
  "creative-performance": ["Actor", "Musician", "Broadcaster", "Motivational Speaker"],
  "creative-narrative": ["Copywriter", "Journalist", "Content Strategist", "Author"]
};
