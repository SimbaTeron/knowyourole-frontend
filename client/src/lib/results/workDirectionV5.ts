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
const ROLE_TYPE_WEIGHT = 1.0;

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
    teen: ["Electrician", "Auto mechanic", "Welder", "Robotics or electronics technician", "Carpenter"],
    college: ["Electrician apprentice", "Automotive technician", "Welding technician", "HVAC technician"],
    teenSteps: ["Take shop, auto, or construction class if your school has it", "Join a robotics, build, or maker club", "Ask about career and technical (CTE) programs or trade-school visits", "Fix or build one real project at home and take photos of it"],
    collegeSteps: ["Look at apprenticeships (electrical, plumbing, HVAC) that pay while you learn", "Try a community college or trade-school certificate", "Spend a day shadowing someone in the trade"],
    adultSteps: ["Look up union or employer apprenticeships near you", "Take one short certificate course (for example welding or electrical basics)", "Talk to two people working in the trade about their week"],
  },
  artDesign: {
    title: "Art and design",
    phrase: "art, design, music, and making things look or sound good",
    adult: ["Graphic designer", "Illustrator", "UX designer", "Music producer or sound engineer", "Photographer", "Animator"],
    teen: ["Graphic designer", "Illustrator", "Animator", "Musician or music producer", "Photographer"],
    college: ["Design intern", "Junior graphic designer", "Illustration or animation student", "Music production student", "Photo assistant"],
    teenSteps: ["Take art, music, design, or photography class", "Keep a sketchbook, playlist, or folder of your best work", "Join yearbook, the school paper, or theater crew", "Enter one art contest or show your work online"],
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
    adult: ["Software developer", "IT support specialist", "Engineer", "Cybersecurity analyst", "Robotics technician"],
    teen: ["Software developer", "Game developer", "IT technician", "Robotics engineer"],
    college: ["Software or IT intern", "Engineering student", "Help desk technician", "Junior developer"],
    teenSteps: ["Take a computer science class", "Join a robotics or coding club", "Build one small app, game, or website"],
    collegeSteps: ["Build two small projects you can show", "Look for IT help desk or developer internships", "Try a cybersecurity or IT certificate"],
    adultSteps: ["Take a beginner coding or IT certificate course", "Build one small project that solves a real problem", "Talk to someone in IT or software about their day"],
  },
  care: {
    title: "Health and caring for people",
    phrase: "helping and caring for people directly",
    adult: ["Registered nurse", "Veterinary technician", "Physical therapist", "Counselor", "Medical assistant"],
    teen: ["Nurse", "Veterinarian or vet tech", "Physical therapist", "Counselor"],
    college: ["Nursing student", "Pre-vet or vet tech student", "Patient care technician", "Pre-med student"],
    teenSteps: ["Take health science, anatomy, or biology", "Volunteer at a hospital, care home, or animal shelter", "Get first aid or CPR certified"],
    collegeSteps: ["Shadow a nurse, vet, therapist, or counselor", "Look at certified nursing assistant (CNA), vet assistant, or EMT courses", "Volunteer in a clinic, animal shelter, or care setting"],
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
    adult: ["Small business owner", "Sales representative", "Restaurant, café, or shop owner", "Marketing coordinator", "Real estate agent"],
    teen: ["Business owner", "Marketing coordinator", "Salesperson", "Entrepreneur"],
    college: ["Sales or marketing intern", "Student business founder", "Business development assistant"],
    teenSteps: ["Join DECA, FBLA, or a business club", "Start a small side business (selling, a service, or an online shop)", "Take a business or marketing class"],
    collegeSteps: ["Try a sales or marketing internship", "Run a small business or club fundraiser", "Take a marketing or entrepreneurship class"],
    adultSteps: ["Shadow a salesperson or business owner for a day", "Test a small side business idea", "Take a short sales or marketing course"],
  },
  leading: {
    title: "Leading teams and projects",
    phrase: "taking charge and leading people",
    adult: ["Team lead", "Project manager", "Program director", "Store or restaurant manager", "Business owner"],
    teen: ["Team captain", "Student government leader", "Event organizer", "Business owner"],
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

/**
 * Combined directions: when the second work area is also strong, the examples lead with roles
 * that sit where the two meet (e.g. tech + leading -> IT manager; trades + teaching -> instructor).
 * The title and "why" line still come from the top area, so they stay consistent.
 */
type Combo = { adultOnly?: boolean; title?: string; first: Array<V5Lane | "stem" | "people" | "creative">; second: V5Lane[]; adult: string[]; college: string[]; teen: string[]; step?: Partial<Record<"teen" | "college" | "adult", string>> };
const COMBOS: Combo[] = [
  // Merged pairs first, so e.g. science + tech + organizing reads as one combined direction.
  { title: "Data, technology, and running operations", first: ["stem"], second: ["organizing"], adult: ["Analytics or data manager", "Operations or logistics director", "Engineering manager"], college: ["Data or operations analyst intern", "Engineering student"], teen: ["Engineer", "Data analyst", "Operations manager"], step: { adult: "Ask to own the numbers for one team or process and present what you find" } },
  { title: "Leading schools, care teams, and programs", first: ["people"], second: ["organizing", "leading"], adult: ["School principal or administrator", "Program director", "Nurse manager"], college: ["Education or health administration student", "Youth program coordinator"], teen: ["Teacher or principal", "Coach", "Nurse"], step: { adult: "Ask to lead a team, program, or committee where you work now" } },
  { adultOnly: true, title: "Health care and teaching others", first: ["care"], second: ["teaching"], adult: ["Nurse educator or clinical instructor", "Health educator", "Patient-care team lead"], college: ["Nursing student", "Health education student"], teen: ["Nurse", "Health teacher"], step: { adult: "Precept or mentor a new colleague, or teach one in-service class" } },
  { title: "Coaching, teaching, and leading programs", first: ["teaching"], second: ["leading", "organizing"], adult: ["School principal or administrator", "Coach or athletic director", "Program director"], college: ["Assistant coach", "Youth program coordinator"], teen: ["Coach", "Teacher", "Camp leader"], step: { adult: "Ask to lead a team, program, or committee where you work now" } },
  { adultOnly: true, title: "Running your own business", first: ["business"], second: ["trades", "care"], adult: ["Bakery, café, or food business owner", "Shop or franchise owner", "Catering or hospitality manager"], college: ["Restaurant or hospitality management student", "Student business founder"], teen: ["Small business owner", "Shop or café owner"] },
  { title: "Leading teams with data and technology", first: ["leading"], second: ["tech", "research"], adult: ["Operations or technology director", "Analytics or data manager", "Project manager"], college: ["Project coordinator", "Operations analyst intern"], teen: ["Team captain", "Project manager"] },
  { title: "Technology operations and IT management", first: ["organizing"], second: ["tech"], adult: ["IT manager", "Technical operations manager", "Systems administrator"], college: ["IT operations intern", "Help desk lead"], teen: ["IT technician", "Tech club organizer"] },
  { title: "Technology and leading tech teams", first: ["tech"], second: ["leading", "organizing"], adult: ["IT manager", "Engineering team lead", "Systems architect"], college: ["IT project coordinator", "Tech team lead on student projects"], teen: ["Robotics team captain", "Tech club leader"], step: { adult: "Ask to lead one technical project or mentor a newer teammate" } },
  { title: "Law, policy, and research", first: ["research"], second: ["leading", "business"], adult: ["Lawyer", "Policy analyst"], college: ["Pre-law student", "Policy research intern"], teen: ["Lawyer", "Policy analyst"], step: { teen: "Join debate, mock trial, or Model UN", college: "Try mock trial, debate, or a law or policy class" } },
  { title: "Law, policy, and research", first: ["leading", "business"], second: ["research"], adult: ["Lawyer", "Policy analyst"], college: ["Pre-law student", "Policy research intern"], teen: ["Lawyer", "Policy analyst"], step: { teen: "Join debate, mock trial, or Model UN", college: "Try mock trial, debate, or a law or policy class" } },
  { title: "Medicine and health science", first: ["research", "tech"], second: ["care"], adult: ["Doctor or physician assistant", "Pharmacist", "Medical lab scientist"], college: ["Pre-med student", "Pre-pharmacy student", "Medical lab assistant"], teen: ["Doctor", "Pharmacist", "Medical lab scientist"] },
  { title: "Medicine and health science", first: ["care"], second: ["research", "tech"], adult: ["Doctor or physician assistant", "Pharmacist"], college: ["Pre-med student", "Pre-pharmacy student"], teen: ["Doctor", "Pharmacist"] },
  { title: "Health care and leading care teams", first: ["care"], second: ["leading", "organizing"], adult: ["Emergency physician", "Charge nurse", "Clinic or hospital manager"], college: ["Pre-med student", "EMT", "Clinic operations intern"], teen: ["Doctor", "Paramedic", "Charge nurse"] },
  { first: ["organizing"], second: ["leading", "care"], adult: ["Operations director", "Operations manager", "Hospital or plant operations manager"], college: ["Operations intern", "Assistant operations manager"], teen: ["Event organizer", "Operations manager"] },
  { first: ["leading"], second: ["organizing"], adult: ["Operations director", "Operations manager"], college: ["Assistant operations manager", "Project coordinator"], teen: ["Event organizer", "Student government leader"] },
  { first: ["trades"], second: ["leading", "business", "organizing"], adult: ["Contractor or trades business owner", "Site supervisor"], college: ["Apprentice on a business-owner track", "Assistant site supervisor"], teen: ["Contractor or trades business owner", "Site supervisor"], step: { adult: "Talk to a trades business owner about licensing, pricing, and getting customers" } },
  { first: ["trades"], second: ["teaching", "care"], adult: ["Apprenticeship instructor", "Safety inspector", "Shop teacher"], college: ["Apprenticeship mentor", "Safety technician"], teen: ["Shop teacher", "Safety inspector"], step: { adult: "Ask your union or trade school about instructor or mentor roles" } },
  { first: ["trades"], second: ["artDesign", "creator"], adult: ["Metal artist or custom fabricator", "Cabinetmaker or furniture maker"], college: ["Custom fabrication apprentice", "Cabinetmaking apprentice"], teen: ["Custom fabricator", "Furniture maker"] },
  { first: ["trades"], second: ["tech", "research"], adult: ["Electronics technician", "Robotics technician", "Engineering technician"], college: ["Electronics technician student", "Engineering technician"], teen: ["Robotics or electronics technician", "Engineer"] },
  { first: ["artDesign", "creator"], second: ["teaching", "care"], adult: ["Art teacher", "Community art instructor", "Museum educator"], college: ["Art education student", "Art camp counselor"], teen: ["Art teacher", "Art camp counselor"], step: { adult: "Teach one community class or workshop in your craft" } },
  { first: ["teaching", "care"], second: ["artDesign", "creator"], adult: ["Art teacher", "Community art instructor", "Museum educator"], college: ["Art education student", "Art camp counselor"], teen: ["Art teacher", "Art camp counselor"] },
  { first: ["artDesign"], second: ["business", "leading"], adult: ["Photographer or studio owner", "Brand designer", "Online shop owner (designs, patterns, prints)"], college: ["Freelance designer", "Online shop owner"], teen: ["Online shop owner (art, crafts, patterns)", "Costume or fashion designer"] },
  { first: ["creator"], second: ["business", "leading"], adult: ["Brand partnerships manager", "Social media manager", "Photographer or videographer business owner"], college: ["Social media manager", "Brand partnerships intern"], teen: ["Content creator", "Social media manager"] },
  { first: ["creator", "artDesign"], second: ["tech"], adult: ["Game designer", "Motion designer"], college: ["Game design student", "Motion design intern"], teen: ["Game designer", "Digital artist"] },
  { first: ["tech"], second: ["artDesign", "creator"], adult: ["Game developer", "UX designer"], college: ["Game development student", "UX design intern"], teen: ["Game developer", "Game designer"] },
  { title: "Coaching, teaching, and leading programs", first: ["leading"], second: ["care", "teaching"], adult: ["Coach or athletic director", "Program director", "School principal"], college: ["Assistant coach", "Youth program coordinator"], teen: ["Coach", "Team captain", "Camp leader"] },
  { first: ["leading"], second: ["trades"], adult: ["Construction manager", "Site supervisor"], college: ["Assistant site supervisor"], teen: ["Construction manager", "Site supervisor"] },
  { first: ["business"], second: ["teaching", "care"], adult: ["Coach or athletic director", "Fitness or sports business owner", "Recruiter"], college: ["Assistant coach", "Recreation program coordinator"], teen: ["Coach", "Sports or fitness business owner", "Team captain"] },
  { first: ["business"], second: ["leading"], adult: ["Business owner", "Sales manager", "Lawyer"], college: ["Student business founder", "Sales intern"], teen: ["Business owner", "Lawyer"] },
];

/** Headings used by combined directions (for consistency checks). */
export const V5_COMBO_TITLES: string[] = COMBOS.map((c) => c.title).filter((t): t is string => Boolean(t));

function stageKey(stage: LifeStage): "teen" | "college" | "adult" {
  return stage === "middle" || stage === "high" ? "teen" : stage === "college" ? "college" : "adult";
}

function comboFor(first: V5Lane, second: V5Lane, stage: LifeStage = "unknown"): Combo | undefined {
  return COMBOS.find((c) => c.first.includes(first) && c.second.includes(second) && (!c.adultOnly || stage === "adult"));
}

/** Business-ownership lanes: an independent streak adds an "own your own" example and step. */
const OWNABLE: Partial<Record<V5Lane, { adult: string; teen: string; step: string }>> = {
  trades: { adult: "Own a trades business", teen: "Own a trades business someday", step: "Write a one-page plan for your own trades business (services, prices, first customers)" },
  artDesign: { adult: "Own a studio or creative business", teen: "Run an online art or design shop", step: "Sell or show 3 pieces and see what people want" },
  creator: { adult: "Run your own creator business", teen: "Grow your own channel as a small business", step: "List three ways your content could earn money" },
  care: { adult: "Own a care business (clinic, grooming, training)", teen: "Start a pet-sitting or tutoring service", step: "Look into what it takes to open a small care business" },
};

/**
 * Pairs of work areas that usually move together. When both lead and are close, the result
 * shows one combined direction (e.g. art + video = creative work).
 */
export const V5_MERGED: Record<"creative" | "people" | "stem", { lanes: [V5Lane, V5Lane]; margin: number; title: string; phrase: string; adult: string[]; college: string[]; teen: string[] }> = {
  creative: {
    lanes: ["artDesign", "creator"], margin: 12,
    title: "Creative work: art, design, music, and video",
    phrase: "art, design, music, and making videos or content for people to see or hear",
    adult: ["Graphic designer", "Video editor", "Content creator or streamer", "Illustrator or animator", "Music producer or sound engineer", "Photographer or videographer", "Makeup artist or cosmetologist", "UX designer"],
    college: ["Design intern", "Video production student", "Illustration or animation student", "Music production student", "Photo or video assistant", "Cosmetology or makeup student", "Social media assistant"],
    teen: ["Graphic designer", "Video editor", "YouTuber or content creator", "Illustrator or animator", "Musician or music producer", "Makeup artist or cosmetologist", "Photographer"],
  },
  people: {
    lanes: ["care", "teaching"], margin: 4,
    title: "Helping people: health, care, and teaching",
    phrase: "helping, caring for, and teaching people",
    adult: ["Registered nurse", "Teacher", "Counselor", "Veterinary technician", "Coach", "Physical therapist"],
    college: ["Nursing student", "Teaching assistant", "Pre-vet or vet tech student", "Youth program assistant", "Patient care technician"],
    teen: ["Nurse", "Teacher", "Veterinarian or vet tech", "Coach", "Counselor"],
  },
  stem: {
    lanes: ["research", "tech"], margin: 5,
    title: "Science, research, and technology",
    phrase: "science, research, computers, and figuring out how things work",
    adult: ["Software developer", "Lab technician", "Data analyst", "Engineer", "Cybersecurity analyst", "Research assistant"],
    college: ["Research assistant", "Software or IT intern", "Lab assistant", "Data analysis intern", "Engineering student"],
    teen: ["Scientist", "Software developer", "Engineer", "Robotics engineer", "Data analyst"],
  },
};

function mergedFor(a: V5Lane, b: V5Lane, gap: number): keyof typeof V5_MERGED | null {
  for (const [key, m] of Object.entries(V5_MERGED) as [keyof typeof V5_MERGED, (typeof V5_MERGED)[keyof typeof V5_MERGED]][]) {
    if (m.lanes.includes(a) && m.lanes.includes(b) && gap <= m.margin) return key;
  }
  return null;
}

export function deriveWorkDirectionV5(
  career: Partial<Record<string, number>> | null | undefined,
  stage: LifeStage = "unknown",
  options: { broad?: boolean; forceBroad?: boolean; entrepreneurship?: number } = {},
): V5Direction {
  const laneScores = deriveV5LaneScores(career);
  // Working adults: many work-content questions are phrased around school and hobbies, so their
  // business answers get a modest lift (running or selling things usually happens at work, not in a hobby).
  if (stage === "adult") for (const l of ["business"] as const) laneScores[l] = Math.round(laneScores[l] * 1.15 * 10) / 10;
  const ranked = [...V5_LANES].sort((a, b) => laneScores[b] - laneScores[a]);
  const [first, second, third] = ranked;
  const top = laneScores[first];
  const merged = mergedFor(first, second, top - laneScores[second]);
  // A merged pair counts as one direction, so "tight" compares against the next area.
  const runnerUp = merged ? third : second;
  const afterRunner = merged ? ranked[3] : third;
  const tight = top - laneScores[runnerUp] <= 2 && top - laneScores[afterRunner] <= BROAD_MARGIN;
  // Trait clarity (options.broad) only widens the direction when the work-interest lead is also small.
  const broad = Boolean(options.forceBroad) || top < MIN_EVIDENCE || tight || (Boolean(options.broad) && top - laneScores[runnerUp] <= 6);
  const sk = stageKey(stage);

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

  const primary: V5Lane[] = merged ? [first, second] : [first];
  const partner = runnerUp;
  const adultRolePartner = stage === "adult" && ROLE_TYPE_LANES.has(partner) && laneScores[partner] >= 40 && laneScores[partner] >= top - 35;
  const partnerStrong = (laneScores[partner] >= MIN_EVIDENCE && laneScores[partner] >= top - 20) || adultRolePartner;
  const combo = partnerStrong
    ? [...(merged ? [merged] : []), ...primary].map((p) => comboFor(p as V5Lane, partner, stage)).find(Boolean)
    : undefined;
  const own = OWNABLE[first];
  const ownStreak = Boolean(own) && !merged && (laneScores.business >= 35 || Number(options.entrepreneurship ?? 0) >= 70) && !(combo && combo.second.includes("business"));
  const lead = [
    ...(combo ? combo[sk].slice(0, 2) : []),
    ...(ownStreak && own ? [sk === "adult" ? own.adult : own.teen] : []),
  ];
  const baseList = merged ? V5_MERGED[merged][sk] : examplesFor(first, stage);
  const base = baseList.filter((e) => !lead.includes(e));
  const examples = merged
    ? [...lead, ...base].slice(0, Math.max(7, lead.length + 4))
    : [...lead, ...base].slice(0, Math.max(4, Math.min(5, lead.length + 3)));
  const extraStep = combo?.step?.[sk] ?? (ownStreak && own ? own.step : undefined);
  const baseSteps = merged ? [...stepsFor(first, stage).slice(0, 2), stepsFor(second, stage)[0]] : stepsFor(first, stage).slice(0, 3);
  const nextSteps = extraStep ? [extraStep, ...baseSteps.slice(0, 2)] : baseSteps;
  const phrase = merged ? V5_MERGED[merged].phrase : V5_LANE_COPY[first].phrase;
  const pull = partnerStrong ? `, with some pull toward ${V5_LANE_COPY[partner].phrase}` : "";
  return {
    laneKey: merged ? `v5:${merged}` : `v5:${first}`,
    // A combined direction gets a heading that matches its examples (e.g. law examples under "Law, policy, and research").
    title: combo?.title ?? (merged ? V5_MERGED[merged].title : V5_LANE_COPY[first].title),
    examples,
    rationale: `Your answers about the work you enjoy pointed most to ${phrase}${pull}.`,
    nextSteps,
    lanes: [...primary, partner],
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
  if (l === "care" || l === "teaching" || l === "people") return "care";
  if (l === "research" || l === "stem") return "research";
  if (l === "tech") return "technical";
  if (l === "trades") return "trades";
  return l;
}
