import { CAREER_SCORE_KEYS, type CareerKey } from "@/data/shortformV2Questions";

export const WORK_LANE_KEYS = [
  "knowledgeStrategy",
  "practicalField",
  "peopleService",
  "creativeExpression",
  "operationsCoordination",
  "technicalSystems",
  "highPressureResponse",
  "physicalWork",
] as const;

export type WorkLaneKey = typeof WORK_LANE_KEYS[number];
export type WorkLaneScores = Record<WorkLaneKey, number>;

type CareerVector = Partial<Record<CareerKey, number>>;

export const WORK_LANE_LABELS: Record<WorkLaneKey, string> = {
  knowledgeStrategy: "knowledge and strategy",
  practicalField: "practical and field work",
  peopleService: "people and direct service",
  creativeExpression: "creative expression",
  operationsCoordination: "operations and coordination",
  technicalSystems: "technical systems",
  highPressureResponse: "high-pressure response",
  physicalWork: "physical, hands-on work",
};

// The fixed Shortform V2 question bank already collects direct work-preference
// evidence. These lane weights make that evidence interpretable by work material
// and environment without mutating the stable 28-question response contract.
const WORK_LANE_CAREER_WEIGHTS: Record<WorkLaneKey, Partial<Record<CareerKey, number>>> = {
  knowledgeStrategy: { analysis: 0.34, systems: 0.24, deepFocus: 0.2, autonomy: 0.12, creative: 0.1 },
  practicalField: { handsOn: 0.36, operations: 0.2, pace: 0.16, autonomy: 0.12, stability: 0.08, systems: 0.08 },
  peopleService: { people: 0.34, service: 0.31, leadership: 0.15, stability: 0.1, pace: 0.1 },
  creativeExpression: { creative: 0.46, autonomy: 0.19, entrepreneurship: 0.15, people: 0.1, deepFocus: 0.1 },
  operationsCoordination: { operations: 0.35, systems: 0.24, stability: 0.19, analysis: 0.12, leadership: 0.1 },
  technicalSystems: { analysis: 0.31, systems: 0.31, deepFocus: 0.19, autonomy: 0.1, handsOn: 0.09 },
  highPressureResponse: { pace: 0.34, leadership: 0.26, handsOn: 0.2, service: 0.1, entrepreneurship: 0.1 },
  physicalWork: { handsOn: 0.58, operations: 0.18, pace: 0.14, autonomy: 0.1 },
};

export function deriveWorkLaneScores(career?: CareerVector): WorkLaneScores | null {
  if (!career || !CAREER_SCORE_KEYS.some(key => Number.isFinite(career[key]) && Number(career[key]) !== 0)) return null;

  const raw = WORK_LANE_KEYS.reduce((scores, lane) => {
    scores[lane] = Object.entries(WORK_LANE_CAREER_WEIGHTS[lane]).reduce(
      (sum, [key, weight]) => sum + Math.max(0, Number(career[key as CareerKey] ?? 0)) * Number(weight),
      0,
    );
    return scores;
  }, {} as WorkLaneScores);
  return WORK_LANE_KEYS.reduce((scores, lane) => {
    scores[lane] = Math.round(raw[lane]);
    return scores;
  }, {} as WorkLaneScores);
}

export const MIN_WORK_LANE_EVIDENCE = 35;
export const MIXED_WORK_LANE_MARGIN = 8;

export type WorkDirection = {
  laneKey: WorkLaneKey;
  title: string;
  examples: string[];
};

const DIRECTION_FALLBACKS: Record<WorkLaneKey, WorkDirection> = {
  knowledgeStrategy: { laneKey: "knowledgeStrategy", title: "Research, analysis, and strategy", examples: ["Research Analyst", "Policy Analyst", "Strategy Associate"] },
  practicalField: { laneKey: "practicalField", title: "Practical field and operations work", examples: ["Field Operations Coordinator", "Logistics Specialist", "Technical Field Representative"] },
  peopleService: { laneKey: "peopleService", title: "People, support, and community work", examples: ["Community Program Coordinator", "People Operations Specialist", "Customer Success Manager"] },
  creativeExpression: { laneKey: "creativeExpression", title: "Creative product and brand work", examples: ["User Experience Designer", "Brand Strategist", "Product Content Designer"] },
  operationsCoordination: { laneKey: "operationsCoordination", title: "Operations, systems, and coordination", examples: ["Operations Manager", "Project Manager", "Quality Coordinator"] },
  technicalSystems: { laneKey: "technicalSystems", title: "Technical systems and problem-solving", examples: ["Systems Analyst", "Database Administrator", "Quality Assurance Engineer"] },
  highPressureResponse: { laneKey: "highPressureResponse", title: "Fast-response and high-pressure work", examples: ["Emergency Coordinator", "Incident Response Specialist", "Operations Lead"] },
  physicalWork: { laneKey: "physicalWork", title: "Hands-on technical and physical work", examples: ["Field Technician", "Equipment Specialist", "Skilled Trades Technician"] },
};

function meets(career: CareerVector, requirements: Partial<Record<CareerKey, number>>) {
  return Object.entries(requirements).every(([key, minimum]) => Number(career[key as CareerKey] ?? 0) >= Number(minimum));
}

/**
 * Converts direct work-preference evidence into a broad, testable career direction.
 * Specific patterns run before generic lane fallbacks so "people + operations + pace"
 * is not flattened into a generic care label.
 */
export function deriveWorkDirection(career: CareerVector, lanes: WorkLaneScores): WorkDirection {
  const primaryLane = topWorkLanes(lanes, 1)[0] ?? "knowledgeStrategy";

  if (meets(career, { service: 55, handsOn: 50, autonomy: 50, analysis: 45 })) {
    return { laneKey: "practicalField", title: "Fieldwork, conservation, and practical science", examples: ["Wildlife Conservationist", "Field Research Technician", "Environmental Education Coordinator"] };
  }
  if (meets(career, { people: 65, operations: 60, pace: 60, creative: 45 })) {
    return { laneKey: "operationsCoordination", title: "Events, experiences, and live coordination", examples: ["Event Coordinator", "Experience Producer", "Community Events Manager"] };
  }
  if (meets(career, { analysis: 65, systems: 55, operations: 50, creative: 55 })) {
    return { laneKey: "operationsCoordination", title: "Public systems, planning, and place-making", examples: ["Urban Planner", "Transportation Planner", "Service Design Strategist"] };
  }
  if (meets(career, { people: 65, service: 60, operations: 60, pace: 55 })) {
    return { laneKey: "operationsCoordination", title: "Community programs and coordinated support", examples: ["Disaster Relief Coordinator", "Community Program Coordinator", "People Operations Specialist"] };
  }
  if (meets(career, { operations: 65, pace: 55, leadership: 50 })) {
    return { laneKey: "operationsCoordination", title: "Operations, systems, and coordination", examples: DIRECTION_FALLBACKS.operationsCoordination.examples };
  }
  if (meets(career, { operations: 65, stability: 55, analysis: 60 }) && Number(career.deepFocus ?? 0) < 45) {
    return { laneKey: "operationsCoordination", title: "Operations, systems, and coordination", examples: DIRECTION_FALLBACKS.operationsCoordination.examples };
  }
  if (meets(career, { people: 60, analysis: 60, creative: 50, deepFocus: 45 })) {
    return { laneKey: "creativeExpression", title: "Customer research and experience design", examples: ["Customer Experience Researcher", "User Experience Researcher", "Service Designer"] };
  }
  if (meets(career, { people: 60, service: 50, creative: 45 })) {
    return { laneKey: "peopleService", title: "Training, learning, and people development", examples: ["Learning Experience Designer", "Corporate Trainer", "Instructional Designer"] };
  }
  if (meets(career, { people: 65, systems: 60, leadership: 40 })) {
    return { laneKey: "technicalSystems", title: "Technical customer and product work", examples: ["Technical Account Manager", "Solutions Consultant", "Product Specialist"] };
  }
  if (meets(career, { people: 65, service: 60, handsOn: 45, stability: 45 })) {
    return { laneKey: "peopleService", title: "Care, education, and direct support", examples: ["Occupational Therapist", "Registered Nurse", "Student Support Specialist"] };
  }
  if (meets(career, { analysis: 60, creative: 55, deepFocus: 55 })) {
    return { laneKey: "knowledgeStrategy", title: "Research, culture, and knowledge stewardship", examples: ["Museum Curator", "Archivist", "Research Coordinator"] };
  }
  if (meets(career, { people: 65, service: 55, leadership: 50, analysis: 45 })) {
    return { laneKey: "peopleService", title: "Advocacy, partnerships, and public impact", examples: ["Policy Advocate", "Partnerships Manager", "Community Engagement Specialist"] };
  }
  if (meets(career, { analysis: 65, operations: 55, deepFocus: 55 })) {
    return { laneKey: "knowledgeStrategy", title: "Research, analysis, and strategy", examples: ["Claims Investigator", "Patent Paralegal", "Policy Analyst"] };
  }
  if (meets(career, { analysis: 65, systems: 55, operations: 50 })) {
    return { laneKey: "technicalSystems", title: "Technical systems and problem-solving", examples: DIRECTION_FALLBACKS.technicalSystems.examples };
  }
  return DIRECTION_FALLBACKS[primaryLane];
}

export function qualifyingWorkLanes(lanes: WorkLaneScores, count = 2, priority: WorkLaneKey[] = []): WorkLaneKey[] {
  return [...WORK_LANE_KEYS]
    .filter(lane => lanes[lane] >= MIN_WORK_LANE_EVIDENCE)
    .sort((a, b) => {
      const aPriority = priority.indexOf(a);
      const bPriority = priority.indexOf(b);
      const aRank = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
      const bRank = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;
      if (aRank !== bRank) return aRank - bRank;
      return lanes[b] - lanes[a];
    })
    .slice(0, count);
}

export interface RoleWorkProfile {
  pattern: RegExp;
  targets: Partial<Record<WorkLaneKey, number>>;
  careerSignals?: CareerKey[];
  category?: string;
  displayPriority?: WorkLaneKey[];
  required?: Partial<Record<WorkLaneKey, number>>;
  avoidHigh?: Partial<Record<WorkLaneKey, number>>;
}

// Profiles deliberately use work requirements, not social class labels. A pilot,
// electrician, paramedic, and chef can all be practical work, but their daily
// environments and pressure requirements differ sharply.
export const ROLE_WORK_PROFILES: RoleWorkProfile[] = [
  { pattern: /master electrician|electrician|hvac|field service|mechanic|technician|plumber|welder|carpenter|repair|installer|machinist/i, targets: { practicalField: 96, physicalWork: 100, technicalSystems: 72, operationsCoordination: 48 }, required: { practicalField: 32, physicalWork: 34 } },
  { pattern: /paramedic|emergency medical|emt|flight paramedic/i, targets: { practicalField: 82, physicalWork: 72, peopleService: 85, highPressureResponse: 100 }, careerSignals: ["people", "service", "pace", "handsOn"], category: "handsOn", displayPriority: ["peopleService", "highPressureResponse"], required: { peopleService: 30, highPressureResponse: 28 } },
  { pattern: /airline pilot|pilot/i, targets: { practicalField: 55, technicalSystems: 100, operationsCoordination: 90, highPressureResponse: 92 }, careerSignals: ["systems", "operations", "pace", "analysis"], category: "technical", displayPriority: ["technicalSystems", "highPressureResponse"], required: { technicalSystems: 32, highPressureResponse: 26 }, avoidHigh: { physicalWork: 58 } },
  { pattern: /construction project manager|project manager/i, targets: { practicalField: 58, operationsCoordination: 100, technicalSystems: 68, highPressureResponse: 72 }, careerSignals: ["operations", "leadership", "systems", "handsOn"], category: "operations", displayPriority: ["operationsCoordination", "practicalField"], required: { operationsCoordination: 34 }, avoidHigh: { physicalWork: 75 } },
  { pattern: /chef|culinary|food service/i, targets: { practicalField: 90, physicalWork: 68, creativeExpression: 76, highPressureResponse: 86, operationsCoordination: 52 }, careerSignals: ["handsOn", "pace", "creative", "operations"], category: "handsOn", displayPriority: ["physicalWork", "highPressureResponse"], required: { practicalField: 30, highPressureResponse: 26 } },
  { pattern: /recruit|talent acquisition|talent partner/i, targets: { peopleService: 96, knowledgeStrategy: 48, operationsCoordination: 48, highPressureResponse: 62 }, careerSignals: ["people", "pace", "leadership", "entrepreneurship"], category: "influence", required: { peopleService: 32, highPressureResponse: 22 }, avoidHigh: { physicalWork: 55 } },
  { pattern: /teacher|education|curriculum|school counselor/i, targets: { peopleService: 92, creativeExpression: 58, operationsCoordination: 52, knowledgeStrategy: 45 }, careerSignals: ["people", "service", "creative", "stability"], category: "care", required: { peopleService: 32 }, avoidHigh: { physicalWork: 52, highPressureResponse: 65 } },
  { pattern: /social worker|therap|counsel|nurse|healthcare|medical|patient care/i, targets: { peopleService: 100, practicalField: 42, operationsCoordination: 42, highPressureResponse: 42 }, required: { peopleService: 60 } },
  { pattern: /research scientist|scientist|researcher|research analyst/i, targets: { knowledgeStrategy: 96, technicalSystems: 76, operationsCoordination: 38, creativeExpression: 42 }, required: { knowledgeStrategy: 62, technicalSystems: 42 }, avoidHigh: { highPressureResponse: 78, physicalWork: 72 } },
  { pattern: /cyber|security|systems architect|software|engineer|data scientist|systems analyst/i, targets: { knowledgeStrategy: 90, technicalSystems: 100, operationsCoordination: 46, creativeExpression: 30 }, required: { knowledgeStrategy: 58, technicalSystems: 62 }, avoidHigh: { physicalWork: 82 } },
  { pattern: /ux|product designer|designer|game narrative|writer|creative|brand|content|producer/i, targets: { creativeExpression: 100, knowledgeStrategy: 54, peopleService: 42, technicalSystems: 42 }, required: { creativeExpression: 60 } },
  { pattern: /financial|compliance|audit|quality assurance|accountant|actuar/i, targets: { knowledgeStrategy: 84, operationsCoordination: 86, technicalSystems: 54, practicalField: 18 }, required: { knowledgeStrategy: 48, operationsCoordination: 54 }, avoidHigh: { physicalWork: 62, highPressureResponse: 82 } },
  { pattern: /supply chain|logistics|operations coordinator|operations manager|project manager/i, targets: { operationsCoordination: 100, practicalField: 50, knowledgeStrategy: 55, technicalSystems: 48 }, required: { operationsCoordination: 58 } },
  { pattern: /public relations|community partnership|partnership|community manager|event/i, targets: { peopleService: 94, creativeExpression: 64, highPressureResponse: 56, operationsCoordination: 46 }, required: { peopleService: 56 } },
  { pattern: /sales|business development|account executive/i, targets: { peopleService: 86, highPressureResponse: 76, knowledgeStrategy: 36, practicalField: 16 }, required: { peopleService: 54, highPressureResponse: 42 }, avoidHigh: { physicalWork: 70 } },
];

const DEFAULT_ROLE_PROFILE: RoleWorkProfile = {
  pattern: /.*/,
  targets: { knowledgeStrategy: 50, practicalField: 50, peopleService: 50, creativeExpression: 50, operationsCoordination: 50, technicalSystems: 50, highPressureResponse: 50, physicalWork: 50 },
};

export function getRoleWorkProfile(title: string, desc = ""): RoleWorkProfile {
  const text = `${title} ${desc}`;
  return ROLE_WORK_PROFILES.find(profile => profile.pattern.test(text)) ?? DEFAULT_ROLE_PROFILE;
}

export function scoreRoleWorkProfile(lanes: WorkLaneScores, profile: RoleWorkProfile): number {
  const targets = Object.entries(profile.targets) as [WorkLaneKey, number][];
  const targetWeight = targets.reduce((sum, [, target]) => sum + Number(target), 0) || 1;
  const base = targets.reduce((sum, [lane, target]) => sum + lanes[lane] * Number(target), 0) / targetWeight;

  const requiredPenalty = Object.entries(profile.required ?? {}).reduce((sum, [lane, minimum]) => {
    return sum + Math.max(0, Number(minimum) - lanes[lane as WorkLaneKey]) * 1.15;
  }, 0);
  const avoidHighPenalty = Object.entries(profile.avoidHigh ?? {}).reduce((sum, [lane, maximum]) => {
    return sum + Math.max(0, lanes[lane as WorkLaneKey] - Number(maximum)) * 0.65;
  }, 0);

  return Math.max(0, Math.min(100, base - requiredPenalty - avoidHighPenalty));
}

export function topWorkLanes(lanes: WorkLaneScores, count = 3): WorkLaneKey[] {
  return [...WORK_LANE_KEYS].sort((a, b) => lanes[b] - lanes[a]).slice(0, count);
}
