/**
 * v5 role engine: direction comes from what people said they want to work on
 * (Q8, Q11, Q12, Q17, Q21–Q25, Q29). Personality only colors the wording elsewhere.
 * Title, examples, and the "why" line all come from the same lane, so they can't contradict.
 */
import { SHORTFORM_V2_QUESTIONS, type CareerKey } from "@/data/shortformV2Questions";
import type { LifeStage } from "@/lib/quiz/shortformV5Adjustments";

export const V5_LANES = ["trades", "artDesign", "creator", "research", "tech", "care", "teaching", "business", "leading", "organizing"] as const;
export type V5Lane = typeof V5_LANES[number];
export type V5LaneScores = Record<V5Lane, number>;

/** Highest raw total each interest key can reach across the bank (opportunity normalization). */
const OPPORTUNITY: Record<V5Lane, number> = V5_LANES.reduce((acc, key) => {
  acc[key] = SHORTFORM_V2_QUESTIONS.reduce((sum, q) => sum + Math.max(0, ...q.answers.map((a) => Number(a.scores.career?.[key as CareerKey] ?? 0))), 0);
  return acc;
}, {} as Record<V5Lane, number>);

/** Role-type lanes (lead / sell / organize) must beat work-content lanes clearly to win. */
const ROLE_TYPE_LANES = new Set<V5Lane>(["leading", "business", "organizing"]);
const ROLE_TYPE_WEIGHT = 0.95;

export function deriveV5LaneScores(career: Partial<Record<string, number>> | null | undefined): V5LaneScores {
  const out = {} as V5LaneScores;
  for (const lane of V5_LANES) {
    const raw = Math.max(0, Number(career?.[lane] ?? 0));
    const pct = (raw / Math.max(1, OPPORTUNITY[lane])) * 100;
    out[lane] = Math.round(pct * (ROLE_TYPE_LANES.has(lane) ? ROLE_TYPE_WEIGHT : 1));
  }
  return out;
}

type LaneCopy = {
  title: string;
  phrase: string;
  adult: string[];
  teen: string[];
  college: string[];
  teenSteps: string[];
  collegeSteps: string[];
  adultSteps: string[];
};

export const V5_LANE_COPY: Record<V5Lane, LaneCopy> = {
  trades: {
    title: "Skilled trades: building, fixing, and installing",
    phrase: "building and fixing real things with tools",
    adult: ["Electrician", "Welder", "Auto or diesel mechanic", "Carpenter", "Plumber", "HVAC technician"],
    teen: ["Electrician", "Auto mechanic", "Welder", "Carpenter"],
    college: ["Electrician apprentice", "Automotive technician", "Welding technician", "HVAC technician"],
    teenSteps: ["Take shop, auto, or construction class if your school has it", "Join a robotics, build, or maker club", "Ask about career and technical (CTE) programs or trade-school visits", "Fix or build one real project at home and take photos of it"],
    collegeSteps: ["Look at apprenticeships (electrical, plumbing, HVAC) that pay while you learn", "Try a community college or trade-school certificate", "Spend a day shadowing someone in the trade"],
    adultSteps: ["Look up union or employer apprenticeships near you", "Take one short certificate course (for example welding or electrical basics)", "Talk to two people working in the trade about their week"],
  },
  artDesign: {
    title: "Art and design",
    phrase: "art, design, and making things look or sound good",
    adult: ["Graphic designer", "Illustrator", "UX designer", "Photographer", "Animator"],
    teen: ["Graphic designer", "Illustrator", "Animator", "Photographer"],
    college: ["Design intern", "Junior graphic designer", "Illustration or animation student", "Photo assistant"],
    teenSteps: ["Take art, design, or photography class", "Keep a sketchbook or folder of your best work", "Join yearbook, the school paper, or theater crew", "Enter one art contest or show your work online"],
    collegeSteps: ["Build a portfolio of 6–10 pieces you are proud of", "Try a design, art, or media class or major", "Look for a design internship or freelance project"],
    adultSteps: ["Make 3 small portfolio pieces in the area you like most", "Take a short course in a design tool", "Take one small paid or volunteer design project"],
  },
  creator: {
    title: "Video, content, and online creation",
    phrase: "making videos and content for an audience",
    adult: ["Video editor", "YouTuber or streamer", "Social media producer", "Podcast producer", "Content creator"],
    teen: ["Video editor", "YouTuber or streamer", "Content creator", "Podcast host"],
    college: ["Video production student", "Social media assistant", "Junior video editor", "Content creator"],
    teenSteps: ["Join film, broadcast, or media club", "Make and post 5 short videos and see what you enjoy most", "Learn a free editing app", "Help a club or team with their videos or posts"],
    collegeSteps: ["Try a film, media, or communications class", "Post on a schedule for 2 months and track what works", "Offer to edit videos for a club, team, or small business"],
    adultSteps: ["Publish 6 pieces of content on a schedule", "Learn one editing tool well", "Take a small paid project editing or making content for a business"],
  },
  research: {
    title: "Research and science",
    phrase: "figuring out how things work and finding answers",
    adult: ["Lab technician", "Research assistant", "Data analyst", "Environmental scientist"],
    teen: ["Scientist", "Lab technician", "Data analyst", "Environmental scientist"],
    college: ["Research assistant", "Lab assistant", "Data analysis intern"],
    teenSteps: ["Take a science or statistics class", "Join science fair, Science Olympiad, or a STEM club", "Do one small experiment or research project on something you wonder about"],
    collegeSteps: ["Ask a professor about helping in their lab", "Try a statistics or research methods class", "Look for summer research programs"],
    adultSteps: ["Take a short data or research course", "Volunteer on a citizen-science project", "Talk with someone who works in a lab or as an analyst"],
  },
  tech: {
    title: "Technology and computers",
    phrase: "computers, code, and technology",
    adult: ["Software developer", "IT support specialist", "Cybersecurity analyst", "Robotics technician"],
    teen: ["Software developer", "Game developer", "IT technician", "Robotics engineer"],
    college: ["Software or IT intern", "Help desk technician", "Junior developer"],
    teenSteps: ["Take a computer science class", "Join a robotics or coding club", "Build one small app, game, or website"],
    collegeSteps: ["Build two small projects you can show", "Look for IT help desk or developer internships", "Try a cybersecurity or IT certificate"],
    adultSteps: ["Take a beginner coding or IT certificate course", "Build one small project that solves a real problem", "Talk to someone in IT or software about their day"],
  },
  care: {
    title: "Health and caring for people",
    phrase: "helping and caring for people directly",
    adult: ["Registered nurse", "Medical assistant", "Physical therapist assistant", "Counselor", "Social worker"],
    teen: ["Nurse", "Medical assistant", "Physical therapist", "Counselor"],
    college: ["Nursing student", "Medical assistant", "Patient care technician"],
    teenSteps: ["Take health science or anatomy if offered", "Join HOSA, a peer-helper group, or volunteer at a hospital or care home", "Get first aid or CPR certified"],
    collegeSteps: ["Shadow a nurse, therapist, or counselor", "Look at certified nursing assistant (CNA) or EMT courses", "Volunteer in a clinic or care setting"],
    adultSteps: ["Take a CNA, medical assistant, or EMT course", "Volunteer a few hours in a care setting", "Talk with someone in nursing or counseling about the work"],
  },
  teaching: {
    title: "Teaching, coaching, and youth work",
    phrase: "teaching, coaching, and helping people learn",
    adult: ["Teacher", "Coach", "Corporate trainer", "Youth program leader", "Tutor"],
    teen: ["Teacher", "Coach", "Camp counselor", "Tutor"],
    college: ["Teaching assistant", "Tutor", "Youth program assistant", "Coach"],
    teenSteps: ["Tutor a younger student or help coach a team", "Be a camp counselor or youth volunteer", "Lead a club activity or workshop"],
    collegeSteps: ["Tutor or be a teaching assistant", "Work at a camp or after-school program", "Try an education class"],
    adultSteps: ["Volunteer to teach or coach once a week", "Run a short training at work", "Look into teaching or training certificates"],
  },
  business: {
    title: "Sales, business, and starting things",
    phrase: "convincing people, selling, and building something of your own",
    adult: ["Sales representative", "Small business owner", "Marketing coordinator", "Real estate agent"],
    teen: ["Business owner", "Marketing coordinator", "Salesperson", "Entrepreneur"],
    college: ["Sales or marketing intern", "Student business founder", "Business development assistant"],
    teenSteps: ["Join DECA, FBLA, or a business club", "Start a small side business (selling, a service, or a online shop)", "Take a business or marketing class"],
    collegeSteps: ["Try a sales or marketing internship", "Run a small business or club fundraiser", "Take a marketing or entrepreneurship class"],
    adultSteps: ["Shadow a salesperson or business owner for a day", "Test a small side business idea", "Take a short sales or marketing course"],
  },
  leading: {
    title: "Leading teams and projects",
    phrase: "taking charge and leading people",
    adult: ["Team lead", "Project manager", "Store or restaurant manager", "Program director"],
    teen: ["Team captain", "Club officer", "Event organizer", "Shift lead"],
    college: ["Student org leader", "Project coordinator", "Assistant manager"],
    teenSteps: ["Run for a club or student government role", "Captain or co-lead a team or project", "Organize one event from start to finish"],
    collegeSteps: ["Lead a student group or project team", "Look for shift-lead or project-coordinator jobs", "Take a leadership or management class"],
    adultSteps: ["Ask to lead one small project at work", "Take a short project management course", "Talk with a manager about what the job is really like"],
  },
  organizing: {
    title: "Organizing and running operations",
    phrase: "organizing things and keeping them running smoothly",
    adult: ["Operations coordinator", "Logistics planner", "Office manager", "Quality inspector"],
    teen: ["Event planner", "Logistics planner", "Office manager", "Operations coordinator"],
    college: ["Operations intern", "Logistics assistant", "Office coordinator"],
    teenSteps: ["Help run the school store, a fundraiser, or an event", "Be the club secretary or treasurer", "Plan one trip or project with a schedule and budget"],
    collegeSteps: ["Look for operations or logistics internships", "Help run a campus office or event", "Take a business operations or supply-chain class"],
    adultSteps: ["Take on a process or scheduling project at work", "Try a short operations or logistics course", "Talk with someone who runs operations about their day"],
  },
};

export type V5Direction = {
  laneKey: string;
  title: string;
  examples: string[];
  rationale: string;
  nextSteps: string[];
  lanes: V5Lane[];
  broad: boolean;
  laneScores: V5LaneScores;
};

const MIN_EVIDENCE = 28;
const BROAD_MARGIN = 5;

function examplesFor(lane: V5Lane, stage: LifeStage): string[] {
  const c = V5_LANE_COPY[lane];
  return stage === "middle" || stage === "high" ? c.teen : stage === "college" ? c.college : c.adult;
}

function stepsFor(lane: V5Lane, stage: LifeStage): string[] {
  const c = V5_LANE_COPY[lane];
  return stage === "middle" || stage === "high" ? c.teenSteps : stage === "college" ? c.collegeSteps : c.adultSteps;
}

export function deriveWorkDirectionV5(
  career: Partial<Record<string, number>> | null | undefined,
  stage: LifeStage = "unknown",
  options: { broad?: boolean } = {},
): V5Direction {
  const laneScores = deriveV5LaneScores(career);
  const ranked = [...V5_LANES].sort((a, b) => laneScores[b] - laneScores[a]);
  const [first, second, third] = ranked;
  const top = laneScores[first];
  const tight = top - laneScores[second] <= 2 && top - laneScores[third] <= BROAD_MARGIN;
  // Trait clarity (options.broad) only widens the direction when the work-interest lead is also small.
  const broad = top < MIN_EVIDENCE || tight || (Boolean(options.broad) && top - laneScores[second] <= 6);

  // Art + creator close together: one creative direction covering both.
  const creativePair = (first === "artDesign" && second === "creator") || (first === "creator" && second === "artDesign");
  if (!broad && creativePair && top - laneScores[second] <= 8) {
    const examples = [...examplesFor(first, stage).slice(0, 3), ...examplesFor(second, stage).slice(0, 2)];
    return {
      laneKey: "v5:creative",
      title: "Creative work: art, design, and video",
      examples,
      rationale: "Your answers about the work you enjoy pointed most to art, design, and making videos or content for people to see.",
      nextSteps: [...stepsFor(first, stage).slice(0, 2), ...stepsFor(second, stage).slice(0, 1)],
      lanes: [first, second],
      broad: false,
      laneScores,
    };
  }

  if (broad) {
    const lanes = ranked.slice(0, 3);
    return {
      laneKey: "v5:broad",
      title: "Several directions are worth trying",
      examples: lanes.map((l) => examplesFor(l, stage)[0]),
      rationale: `Your answers did not point strongly one way. The closest matches were ${lanes.map((l) => V5_LANE_COPY[l].phrase).slice(0, 2).join(" and ")}. Try a little of each and notice which one you want more of.`,
      nextSteps: lanes.map((l) => stepsFor(l, stage)[0]),
      lanes,
      broad: true,
      laneScores,
    };
  }

  const secondNote = laneScores[second] >= MIN_EVIDENCE && laneScores[second] >= top - 12
    ? `, with some pull toward ${V5_LANE_COPY[second].phrase}`
    : "";
  return {
    laneKey: `v5:${first}`,
    title: V5_LANE_COPY[first].title,
    examples: examplesFor(first, stage).slice(0, 4),
    rationale: `Your answers about the work you enjoy pointed most to ${V5_LANE_COPY[first].phrase}${secondNote}.`,
    nextSteps: stepsFor(first, stage).slice(0, 3),
    lanes: [first, second],
    broad: false,
    laneScores,
  };
}

/** Family tags used by the harness and QA report. */
export function v5LaneFamily(lane: string): string {
  const l = lane.replace(/^v5:/, "");
  if (l === "leading") return "leadership";
  if (l === "business") return "sales";
  if (l === "organizing") return "operations";
  if (l === "artDesign" || l === "creator" || l === "creative") return "creative";
  if (l === "care" || l === "teaching") return "care";
  if (l === "research") return "research";
  if (l === "tech") return "technical";
  if (l === "trades") return "trades";
  return l;
}
