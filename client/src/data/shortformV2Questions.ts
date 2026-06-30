
export type MbtiKey = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
export type DiscKey = "D" | "I" | "S" | "C";
export type BigFiveKey = "O" | "C" | "E" | "A" | "N";
export type CareerKey =
  | "analysis"
  | "systems"
  | "people"
  | "leadership"
  | "operations"
  | "creative"
  | "handsOn"
  | "service"
  | "entrepreneurship"
  | "stability"
  | "autonomy"
  | "deepFocus"
  | "pace";

export interface ShortformV2Answer {
  id: "A" | "B" | "C" | "D";
  text: string;
  supportingText: string;
  resultSignal: string;
  scores: {
    mbti?: Partial<Record<MbtiKey, number>>;
    disc?: Partial<Record<DiscKey, number>>;
    bigFive?: Partial<Record<BigFiveKey, number>>;
    career?: Partial<Record<CareerKey, number>>;
  };
}

export interface ShortformV2Question {
  id: number;
  key: string;
  group: "Core operating style" | "Big Five backbone" | "DISC work behavior" | "Career-fit vector" | "Calibration";
  signal: string;
  prompt: string;
  guidance: string;
  answers: ShortformV2Answer[];
}

export const CAREER_SCORE_KEYS: CareerKey[] = [
  "analysis",
  "systems",
  "people",
  "leadership",
  "operations",
  "creative",
  "handsOn",
  "service",
  "entrepreneurship",
  "stability",
  "autonomy",
  "deepFocus",
  "pace",
];

export const SHORTFORM_V2_QUESTIONS: ShortformV2Question[] = [
  {
    id: 1,
    key: "recharge-pattern",
    group: "Core operating style",
    signal: "Recharge pattern",
    prompt: "After a demanding day, what most reliably helps you feel like yourself again?",
    guidance: "Choose the answer that is most true most often.",
    answers: [
      { id: "A", text: "Quiet time where nobody needs anything from me.", supportingText: "You reset through solitude, privacy, and lower stimulation.", resultSignal: "Deep-focus recovery", scores: { mbti: { I: 3 }, disc: { C: 1 }, bigFive: { E: -2, C: 1 }, career: { deepFocus: 3, analysis: 1 } } },
      { id: "B", text: "A good conversation with someone who energizes me.", supportingText: "You recover through connection, reaction, and shared momentum.", resultSignal: "Connection recharge", scores: { mbti: { E: 3, F: 1 }, disc: { I: 2 }, bigFive: { E: 3, A: 1 }, career: { people: 2, service: 1 } } },
      { id: "C", text: "Doing something active or practical so I can reset physically.", supportingText: "You clear your head through movement, tasks, or tangible action.", resultSignal: "Practical reset", scores: { mbti: { S: 2, P: 1 }, disc: { D: 1, S: 1 }, bigFive: { E: 1, N: -1 }, career: { handsOn: 3, operations: 1, pace: 1 } } },
      { id: "D", text: "Switching into a creative or interesting project that absorbs me.", supportingText: "You recover by following curiosity into something absorbing.", resultSignal: "Creative immersion", scores: { mbti: { N: 2, P: 1, I: 1 }, disc: { I: 1 }, bigFive: { O: 3 }, career: { creative: 3, autonomy: 1 } } },
    ],
  },
  {
    id: 2,
    key: "information-lens",
    group: "Core operating style",
    signal: "Information lens",
    prompt: "When you first look at a new problem, what do you naturally notice first?",
    guidance: "Pick the signal your mind reaches for before you force it to be polite.",
    answers: [
      { id: "A", text: "The concrete facts, constraints, and what can be verified.", supportingText: "You trust reality when it has receipts.", resultSignal: "Evidence-first", scores: { mbti: { S: 3, T: 1, J: 1 }, disc: { C: 2 }, bigFive: { C: 2 }, career: { operations: 2, analysis: 2, stability: 1 } } },
      { id: "B", text: "The pattern underneath it and where it may lead.", supportingText: "You look for the invisible structure behind the obvious issue.", resultSignal: "Pattern-first", scores: { mbti: { N: 3, T: 1 }, disc: { C: 1 }, bigFive: { O: 3 }, career: { analysis: 3, systems: 2 } } },
      { id: "C", text: "The people affected and what they probably need.", supportingText: "You read the human consequences early.", resultSignal: "Human-impact lens", scores: { mbti: { F: 2, E: 1 }, disc: { I: 1, S: 1 }, bigFive: { A: 3 }, career: { people: 3, service: 2 } } },
      { id: "D", text: "The fastest practical move that would create progress.", supportingText: "You look for traction before theory has a staff meeting.", resultSignal: "Action-first", scores: { mbti: { S: 1, T: 1, P: 1 }, disc: { D: 2 }, bigFive: { C: 1, E: 1 }, career: { leadership: 2, entrepreneurship: 2, pace: 2 } } },
    ],
  },
  {
    id: 3,
    key: "decision-standard",
    group: "Core operating style",
    signal: "Decision standard",
    prompt: "When a decision is difficult, what makes you trust the final choice most?",
    guidance: "Choose the standard you would want the decision to satisfy.",
    answers: [
      { id: "A", text: "The logic is clean and consistent.", supportingText: "You want the reasoning to hold together under pressure.", resultSignal: "Logical integrity", scores: { mbti: { T: 3, J: 1 }, disc: { C: 2 }, bigFive: { C: 2 }, career: { analysis: 3, systems: 1 } } },
      { id: "B", text: "The choice respects the people involved.", supportingText: "You want the human cost accounted for, not hand-waved away.", resultSignal: "People-aware judgment", scores: { mbti: { F: 3 }, disc: { S: 1, I: 1 }, bigFive: { A: 3 }, career: { people: 2, service: 2 } } },
      { id: "C", text: "The outcome is measurable and moves things forward.", supportingText: "You trust decisions that create visible progress.", resultSignal: "Outcome drive", scores: { mbti: { T: 2, J: 1, E: 1 }, disc: { D: 3 }, bigFive: { C: 1 }, career: { leadership: 3, entrepreneurship: 2 } } },
      { id: "D", text: "The decision still leaves room to adjust if new information appears.", supportingText: "You want intelligent flexibility, not brittle certainty.", resultSignal: "Adaptive judgment", scores: { mbti: { P: 3, N: 1 }, disc: { I: 1 }, bigFive: { O: 2 }, career: { autonomy: 2, creative: 1 } } },
    ],
  },
  {
    id: 4,
    key: "planning-style",
    group: "Core operating style",
    signal: "Planning style",
    prompt: "A project is due in three weeks. Which approach feels most natural?",
    guidance: "Assume the project matters and you have real ownership.",
    answers: [
      { id: "A", text: "Build a clear plan early and follow it closely.", supportingText: "You lower risk by creating structure before momentum takes over.", resultSignal: "Structured executor", scores: { mbti: { J: 3, S: 1 }, disc: { C: 2, S: 1 }, bigFive: { C: 3 }, career: { operations: 3, stability: 2, systems: 1 } } },
      { id: "B", text: "Set a rough direction, then adapt as I learn more.", supportingText: "You prefer enough structure to move, not enough to suffocate.", resultSignal: "Adaptive planner", scores: { mbti: { P: 3, N: 1 }, disc: { I: 1 }, bigFive: { O: 2 }, career: { autonomy: 2, creative: 1, entrepreneurship: 1 } } },
      { id: "C", text: "Start with the hardest unknown and solve that first.", supportingText: "You attack uncertainty at the root.", resultSignal: "Problem-first strategist", scores: { mbti: { T: 2, N: 1, J: 1 }, disc: { C: 2, D: 1 }, bigFive: { C: 2, O: 1 }, career: { analysis: 3, systems: 2 } } },
      { id: "D", text: "Get the right people aligned before the work spreads out.", supportingText: "You prevent chaos by building agreement early.", resultSignal: "Alignment builder", scores: { mbti: { F: 2, E: 1, J: 1 }, disc: { I: 2, S: 1 }, bigFive: { A: 2, E: 1 }, career: { people: 3, leadership: 1 } } },
    ],
  },
  {
    id: 5,
    key: "communication-processing",
    group: "Core operating style",
    signal: "Communication processing",
    prompt: "In a serious conversation, when are you usually at your best?",
    guidance: "Think about the version of you that communicates most clearly.",
    answers: [
      { id: "A", text: "After I have had time to think privately.", supportingText: "You produce stronger responses after internal processing.", resultSignal: "Reflective processor", scores: { mbti: { I: 3, T: 1 }, disc: { C: 1 }, bigFive: { E: -2, C: 1 }, career: { deepFocus: 3, analysis: 1 } } },
      { id: "B", text: "While talking it through in real time.", supportingText: "Your thinking sharpens through exchange.", resultSignal: "Live processor", scores: { mbti: { E: 3, P: 1 }, disc: { I: 2 }, bigFive: { E: 3 }, career: { people: 2, pace: 1 } } },
      { id: "C", text: "When the conversation stays direct and solution-focused.", supportingText: "You communicate best when the point is not buried in decorative fog.", resultSignal: "Direct resolver", scores: { mbti: { T: 2, J: 1 }, disc: { D: 2, C: 1 }, bigFive: { C: 1, A: -1 }, career: { leadership: 2, operations: 1 } } },
      { id: "D", text: "When the emotional context is acknowledged first.", supportingText: "You want the human layer named before solutions start marching in.", resultSignal: "Context-aware communicator", scores: { mbti: { F: 3 }, disc: { S: 2 }, bigFive: { A: 3 }, career: { service: 2, people: 2 } } },
    ],
  },
  {
    id: 6,
    key: "novelty-proven-path",
    group: "Core operating style",
    signal: "Novelty vs. proof",
    prompt: "If two paths could both work, which one pulls you more?",
    guidance: "Choose the path you would naturally defend.",
    answers: [
      { id: "A", text: "The proven path with clear evidence behind it.", supportingText: "You respect what has already survived contact with reality.", resultSignal: "Proof-led", scores: { mbti: { S: 3, J: 1 }, disc: { C: 2 }, bigFive: { C: 2, O: -1 }, career: { stability: 3, operations: 2 } } },
      { id: "B", text: "The original path that could become something better.", supportingText: "You are pulled by possibility before consensus catches up.", resultSignal: "Originality-led", scores: { mbti: { N: 3, P: 1 }, disc: { I: 1 }, bigFive: { O: 3 }, career: { creative: 3, entrepreneurship: 2, autonomy: 1 } } },
      { id: "C", text: "The efficient path that gets a useful result fastest.", supportingText: "You prefer momentum over ceremony.", resultSignal: "Efficiency-led", scores: { mbti: { T: 2, S: 1 }, disc: { D: 2 }, bigFive: { C: 1 }, career: { operations: 2, leadership: 2, pace: 2 } } },
      { id: "D", text: "The people-smart path that builds support as it goes.", supportingText: "You know adoption matters as much as the idea.", resultSignal: "Buy-in led", scores: { mbti: { F: 2, E: 1 }, disc: { I: 2, S: 1 }, bigFive: { A: 2, E: 1 }, career: { people: 3, leadership: 1 } } },
    ],
  },
  {
    id: 7,
    key: "closure-preference",
    group: "Core operating style",
    signal: "Closure preference",
    prompt: "What feels most satisfying at the end of a work session?",
    guidance: "Pick what makes the session feel worthwhile.",
    answers: [
      { id: "A", text: "A finished checklist and a clear next step.", supportingText: "Completion and order create relief.", resultSignal: "Completion drive", scores: { mbti: { J: 3, S: 1 }, disc: { C: 2, S: 1 }, bigFive: { C: 3 }, career: { operations: 3, stability: 1 } } },
      { id: "B", text: "A better understanding of the problem.", supportingText: "Insight itself feels like progress.", resultSignal: "Understanding drive", scores: { mbti: { N: 2, T: 1, I: 1 }, disc: { C: 2 }, bigFive: { O: 2 }, career: { analysis: 3, systems: 2, deepFocus: 1 } } },
      { id: "C", text: "A visible piece of progress, even if imperfect.", supportingText: "You would rather move the thing than admire the blueprint.", resultSignal: "Momentum drive", scores: { mbti: { P: 2, E: 1, S: 1 }, disc: { D: 2 }, bigFive: { E: 1 }, career: { entrepreneurship: 2, pace: 2, leadership: 1 } } },
      { id: "D", text: "A stronger connection or agreement with the people involved.", supportingText: "Progress feels real when the room is more aligned.", resultSignal: "Relational progress", scores: { mbti: { F: 2, E: 1 }, disc: { I: 1, S: 2 }, bigFive: { A: 3 }, career: { people: 3, service: 1 } } },
    ],
  },
  {
    id: 8,
    key: "thinking-depth",
    group: "Core operating style",
    signal: "Task energy",
    prompt: "Which task would you choose if all paid the same and mattered equally?",
    guidance: "This is about energy, not prestige.",
    answers: [
      { id: "A", text: "Analyze a complex issue and explain the clean answer.", supportingText: "You like turning mess into clarity.", resultSignal: "Analytical clarity", scores: { mbti: { I: 1, N: 1, T: 3 }, disc: { C: 2 }, bigFive: { O: 1, C: 1 }, career: { analysis: 4, systems: 1, deepFocus: 1 } } },
      { id: "B", text: "Coordinate moving parts so the whole thing works smoothly.", supportingText: "You like making the machine run.", resultSignal: "Operational coordination", scores: { mbti: { J: 3, S: 1 }, disc: { S: 1, C: 2 }, bigFive: { C: 3 }, career: { operations: 4, systems: 2, stability: 1 } } },
      { id: "C", text: "Persuade people around a useful idea or opportunity.", supportingText: "You like turning belief into motion.", resultSignal: "Influence energy", scores: { mbti: { E: 3, N: 1 }, disc: { I: 2, D: 1 }, bigFive: { E: 3, O: 1 }, career: { people: 2, leadership: 2, entrepreneurship: 2 } } },
      { id: "D", text: "Help someone solve a real problem directly.", supportingText: "You like impact you can see in another person’s life.", resultSignal: "Direct service", scores: { mbti: { F: 3, S: 1 }, disc: { S: 2 }, bigFive: { A: 3 }, career: { service: 4, people: 2, handsOn: 1 } } },
    ],
  },
  {
    id: 9,
    key: "follow-through-friction",
    group: "Big Five backbone",
    signal: "Follow-through under friction",
    prompt: "When a task becomes boring but still matters, what usually happens?",
    guidance: "Answer for your real behavior, not your motivational-poster self.",
    answers: [
      { id: "A", text: "I finish it because reliability matters.", supportingText: "Commitment carries you when novelty disappears.", resultSignal: "Duty follow-through", scores: { mbti: { J: 2, S: 1 }, disc: { S: 2, C: 1 }, bigFive: { C: 3 }, career: { stability: 2, operations: 2 } } },
      { id: "B", text: "I finish it if I can make the system cleaner or smarter.", supportingText: "Improvement gives the dull work a reason to exist.", resultSignal: "Systems follow-through", scores: { mbti: { T: 2, J: 1, N: 1 }, disc: { C: 2 }, bigFive: { C: 2, O: 1 }, career: { systems: 3, analysis: 2 } } },
      { id: "C", text: "I push through if other people are counting on me.", supportingText: "Responsibility to people activates your persistence.", resultSignal: "Relational follow-through", scores: { mbti: { F: 2, J: 1 }, disc: { S: 2 }, bigFive: { A: 2, C: 1 }, career: { people: 2, service: 2 } } },
      { id: "D", text: "I look for a faster or more energizing way to get it done.", supportingText: "You preserve momentum by redesigning the route.", resultSignal: "Adaptive efficiency", scores: { mbti: { P: 2, N: 1 }, disc: { D: 1, I: 1 }, bigFive: { O: 2, C: -1 }, career: { entrepreneurship: 2, autonomy: 2, pace: 1 } } },
    ],
  },
  {
    id: 10,
    key: "detail-tolerance",
    group: "Big Five backbone",
    signal: "Detail tolerance",
    prompt: "How do you usually respond to small errors that could become bigger problems?",
    guidance: "Choose your instinct when the stakes are real.",
    answers: [
      { id: "A", text: "I want to catch and fix them early.", supportingText: "Prevention feels cheaper than cleanup.", resultSignal: "Quality guardian", scores: { mbti: { S: 2, J: 2 }, disc: { C: 3 }, bigFive: { C: 3 }, career: { operations: 3, systems: 2, stability: 1 } } },
      { id: "B", text: "I focus on the errors most likely to affect the outcome.", supportingText: "You triage by consequence, not cosmetic perfection.", resultSignal: "Risk prioritizer", scores: { mbti: { T: 3, J: 1 }, disc: { C: 2, D: 1 }, bigFive: { C: 2 }, career: { analysis: 3, leadership: 1 } } },
      { id: "C", text: "I notice them, but I do not want them to slow everything down.", supportingText: "Momentum matters; perfection can invoice someone else.", resultSignal: "Momentum protector", scores: { mbti: { P: 2, E: 1 }, disc: { D: 2 }, bigFive: { C: -1, E: 1 }, career: { pace: 3, entrepreneurship: 2 } } },
      { id: "D", text: "I prefer someone detail-oriented to handle that part while I focus elsewhere.", supportingText: "You know your highest value may not be microscopic inspection.", resultSignal: "Delegating strategist", scores: { mbti: { N: 1, T: 1 }, disc: { D: 1, I: 1 }, bigFive: { C: -1 }, career: { leadership: 2, creative: 1, entrepreneurship: 1 } } },
    ],
  },
  {
    id: 11,
    key: "curiosity-driver",
    group: "Big Five backbone",
    signal: "Curiosity driver",
    prompt: "What kind of learning feels most alive to you?",
    guidance: "Pick the learning you would do even if no one assigned it.",
    answers: [
      { id: "A", text: "Learning a practical skill I can use quickly.", supportingText: "You like knowledge with a handle on it.", resultSignal: "Practical learner", scores: { mbti: { S: 2, P: 1 }, disc: { D: 1 }, bigFive: { O: 1, C: 1 }, career: { handsOn: 3, operations: 1 } } },
      { id: "B", text: "Understanding a deep idea or system.", supportingText: "You want the architecture beneath the surface.", resultSignal: "Systems learner", scores: { mbti: { N: 2, T: 2, I: 1 }, disc: { C: 2 }, bigFive: { O: 3 }, career: { analysis: 3, systems: 3, deepFocus: 1 } } },
      { id: "C", text: "Exploring something creative, unusual, or future-facing.", supportingText: "You are energized by what is not obvious yet.", resultSignal: "Possibility learner", scores: { mbti: { N: 3, P: 1 }, disc: { I: 1 }, bigFive: { O: 4 }, career: { creative: 4, autonomy: 1 } } },
      { id: "D", text: "Learning through people, stories, and lived experience.", supportingText: "Human context makes knowledge stick.", resultSignal: "Experiential learner", scores: { mbti: { F: 2, E: 1 }, disc: { I: 2, S: 1 }, bigFive: { A: 2, E: 1, O: 1 }, career: { people: 3, service: 1 } } },
    ],
  },
  {
    id: 12,
    key: "social-energy-level",
    group: "Big Five backbone",
    signal: "Social energy",
    prompt: "Which setting would likely bring out your best energy?",
    guidance: "Choose the setting where your best version appears fastest.",
    answers: [
      { id: "A", text: "A lively room where ideas and reactions move fast.", supportingText: "High interaction sharpens you.", resultSignal: "High social stimulation", scores: { mbti: { E: 4, P: 1 }, disc: { I: 3 }, bigFive: { E: 4 }, career: { people: 3, pace: 2 } } },
      { id: "B", text: "A small trusted group with thoughtful exchange.", supportingText: "You like connection with depth and signal.", resultSignal: "Selective social energy", scores: { mbti: { I: 1, F: 2, N: 1 }, disc: { S: 2 }, bigFive: { A: 2, E: 1 }, career: { people: 2, service: 1 } } },
      { id: "C", text: "A quiet environment where I can focus deeply.", supportingText: "You do your strongest work when interruption is low.", resultSignal: "Deep-focus energy", scores: { mbti: { I: 4, J: 1 }, disc: { C: 2 }, bigFive: { E: -3, C: 1 }, career: { deepFocus: 4, analysis: 1 } } },
      { id: "D", text: "A hands-on setting where I can move, test, or fix things.", supportingText: "You come alive through practical engagement.", resultSignal: "Hands-on energy", scores: { mbti: { S: 3, P: 1 }, disc: { D: 1, S: 1 }, bigFive: { E: 1 }, career: { handsOn: 4, operations: 1, pace: 1 } } },
    ],
  },
  {
    id: 13,
    key: "cooperation-style",
    group: "Big Five backbone",
    signal: "Cooperation style",
    prompt: "In a group, what are people most likely to rely on you for?",
    guidance: "Choose the contribution others would recognize.",
    answers: [
      { id: "A", text: "Keeping the mood constructive and people included.", supportingText: "You help people stay engaged instead of quietly checking out.", resultSignal: "Inclusion builder", scores: { mbti: { E: 2, F: 2 }, disc: { I: 3 }, bigFive: { A: 3, E: 2 }, career: { people: 3, service: 1 } } },
      { id: "B", text: "Saying the direct thing others are avoiding.", supportingText: "You create progress by naming reality.", resultSignal: "Direct truth-teller", scores: { mbti: { T: 2, E: 1 }, disc: { D: 3 }, bigFive: { A: -1, E: 1 }, career: { leadership: 3, entrepreneurship: 1 } } },
      { id: "C", text: "Making sure the work is accurate and thought through.", supportingText: "You protect the group from sloppy conclusions.", resultSignal: "Accuracy anchor", scores: { mbti: { T: 2, J: 2, I: 1 }, disc: { C: 3 }, bigFive: { C: 3 }, career: { analysis: 2, systems: 2, operations: 1 } } },
      { id: "D", text: "Staying steady and helping people follow through.", supportingText: "You stabilize the room when enthusiasm starts leaking air.", resultSignal: "Steady support", scores: { mbti: { F: 1, J: 2, S: 1 }, disc: { S: 3 }, bigFive: { A: 2, C: 2 }, career: { service: 2, stability: 2, operations: 1 } } },
    ],
  },
  {
    id: 14,
    key: "conflict-pattern",
    group: "Big Five backbone",
    signal: "Conflict pattern",
    prompt: "When disagreement shows up, what is your first instinct?",
    guidance: "Answer for your first useful instinct, not your perfect final response.",
    answers: [
      { id: "A", text: "Clarify the facts and remove confusion.", supportingText: "You reduce conflict by improving the information.", resultSignal: "Fact clarifier", scores: { mbti: { T: 2, S: 1, J: 1 }, disc: { C: 3 }, bigFive: { C: 2 }, career: { analysis: 2, systems: 1 } } },
      { id: "B", text: "Address it directly so the group can move.", supportingText: "You would rather handle the tension than let it ferment.", resultSignal: "Direct resolver", scores: { mbti: { E: 1, T: 2 }, disc: { D: 3 }, bigFive: { E: 1, A: -1, N: -1 }, career: { leadership: 3, pace: 1 } } },
      { id: "C", text: "Lower the temperature and protect the relationship.", supportingText: "You keep the people layer from catching fire.", resultSignal: "Harmony stabilizer", scores: { mbti: { F: 3 }, disc: { S: 3 }, bigFive: { A: 4 }, career: { people: 2, service: 2 } } },
      { id: "D", text: "Step back, think, and return when I can respond well.", supportingText: "You prefer precision over reactive noise.", resultSignal: "Reflective responder", scores: { mbti: { I: 3, J: 1 }, disc: { C: 1, S: 1 }, bigFive: { C: 1, N: -1 }, career: { deepFocus: 2, analysis: 1 } } },
    ],
  },
  {
    id: 15,
    key: "stress-response",
    group: "Big Five backbone",
    signal: "Pressure response",
    prompt: "Under pressure, what tends to happen first?",
    guidance: "Choose your first pattern before you consciously manage it.",
    answers: [
      { id: "A", text: "I get sharper and more decisive.", supportingText: "Pressure focuses you into action.", resultSignal: "Pressure commander", scores: { mbti: { E: 1, T: 2, J: 1 }, disc: { D: 3 }, bigFive: { C: 2, N: -2 }, career: { leadership: 3, pace: 2 } } },
      { id: "B", text: "I become quieter and more analytical.", supportingText: "Pressure sends you inward toward diagnosis.", resultSignal: "Pressure analyst", scores: { mbti: { I: 3, T: 2 }, disc: { C: 3 }, bigFive: { C: 1, N: -1 }, career: { analysis: 3, deepFocus: 2 } } },
      { id: "C", text: "I look for reassurance, alignment, or support.", supportingText: "You regulate pressure through trusted connection.", resultSignal: "Pressure connector", scores: { mbti: { F: 2, E: 1 }, disc: { S: 2, I: 1 }, bigFive: { A: 2, N: 2 }, career: { people: 2, service: 1 } } },
      { id: "D", text: "I feel scattered unless I can simplify the next step.", supportingText: "You need the chaos reduced into one handleable move.", resultSignal: "Pressure simplifier", scores: { mbti: { P: 1, S: 1 }, disc: { S: 1 }, bigFive: { N: 3, C: -1 }, career: { operations: 1, stability: 1 } } },
    ],
  },
  {
    id: 16,
    key: "feedback-response",
    group: "Big Five backbone",
    signal: "Feedback response",
    prompt: "When you receive blunt feedback, what helps you use it best?",
    guidance: "Choose the condition that turns feedback into improvement.",
    answers: [
      { id: "A", text: "Specific examples and a clear standard.", supportingText: "You use feedback best when the target is explicit.", resultSignal: "Standard-driven growth", scores: { mbti: { S: 1, T: 2, J: 1 }, disc: { C: 3 }, bigFive: { C: 3 }, career: { operations: 2, analysis: 1 } } },
      { id: "B", text: "A respectful tone and evidence that the person gets me.", supportingText: "Trust determines whether the message can land.", resultSignal: "Trust-based growth", scores: { mbti: { F: 3 }, disc: { S: 2 }, bigFive: { A: 3, N: 1 }, career: { people: 2, service: 1 } } },
      { id: "C", text: "Time alone to process before responding.", supportingText: "You need space to separate signal from sting.", resultSignal: "Reflective growth", scores: { mbti: { I: 3, J: 1 }, disc: { C: 1 }, bigFive: { C: 1, E: -1 }, career: { deepFocus: 2, analysis: 1 } } },
      { id: "D", text: "A direct challenge that gives me something to prove.", supportingText: "A clear challenge activates competitive improvement.", resultSignal: "Challenge-based growth", scores: { mbti: { E: 1, T: 2 }, disc: { D: 3 }, bigFive: { E: 1, C: 1, N: -1 }, career: { leadership: 2, entrepreneurship: 2 } } },
    ],
  },
  {
    id: 17,
    key: "team-stuck-moment",
    group: "DISC work behavior",
    signal: "Leadership reflex",
    prompt: "A team is stuck and the deadline is getting close. What do you naturally do?",
    guidance: "Choose the move you would make without needing a title.",
    answers: [
      { id: "A", text: "Make the call and get people moving.", supportingText: "You convert uncertainty into action.", resultSignal: "Decisive driver", scores: { mbti: { E: 1, T: 2, J: 1 }, disc: { D: 4 }, bigFive: { C: 1, E: 1 }, career: { leadership: 4, pace: 2 } } },
      { id: "B", text: "Rally the group and rebuild energy.", supportingText: "You know morale is operational infrastructure.", resultSignal: "Energy catalyst", scores: { mbti: { E: 3, F: 1 }, disc: { I: 4 }, bigFive: { E: 3, A: 1 }, career: { people: 3, leadership: 1 } } },
      { id: "C", text: "Calm the room and create a steady path.", supportingText: "You restore progress by lowering chaos.", resultSignal: "Steady pathmaker", scores: { mbti: { F: 1, J: 2, S: 1 }, disc: { S: 4 }, bigFive: { A: 2, C: 2, N: -1 }, career: { stability: 3, operations: 2, service: 1 } } },
      { id: "D", text: "Check the facts so the next move is correct.", supportingText: "You prevent the team from sprinting confidently into a wall.", resultSignal: "Precision checker", scores: { mbti: { I: 1, T: 2, S: 1 }, disc: { C: 4 }, bigFive: { C: 3 }, career: { analysis: 3, systems: 2 } } },
    ],
  },
  {
    id: 18,
    key: "influence-style",
    group: "DISC work behavior",
    signal: "Influence style",
    prompt: "When you need people to support an idea, what do you lean on most?",
    guidance: "Choose your most natural persuasion engine.",
    answers: [
      { id: "A", text: "A compelling story that makes people care.", supportingText: "You move people by giving the idea emotional shape.", resultSignal: "Narrative influence", scores: { mbti: { E: 2, N: 1, F: 1 }, disc: { I: 4 }, bigFive: { E: 2, O: 1, A: 1 }, career: { creative: 2, people: 2, leadership: 1 } } },
      { id: "B", text: "A clear argument with evidence.", supportingText: "You want belief built on proof, not vibes in a nice jacket.", resultSignal: "Evidence influence", scores: { mbti: { T: 3, J: 1 }, disc: { C: 4 }, bigFive: { C: 2 }, career: { analysis: 3, systems: 1 } } },
      { id: "C", text: "A bold goal and visible momentum.", supportingText: "You create buy-in by making the opportunity feel alive.", resultSignal: "Momentum influence", scores: { mbti: { E: 2, T: 1 }, disc: { D: 4 }, bigFive: { E: 2, C: 1 }, career: { leadership: 3, entrepreneurship: 3, pace: 1 } } },
      { id: "D", text: "Trust, patience, and one-on-one buy-in.", supportingText: "You win durable support by building real confidence.", resultSignal: "Trust influence", scores: { mbti: { F: 2, I: 1, J: 1 }, disc: { S: 4 }, bigFive: { A: 3 }, career: { people: 3, service: 1, stability: 1 } } },
    ],
  },
  {
    id: 19,
    key: "pace-preference",
    group: "DISC work behavior",
    signal: "Best pace",
    prompt: "Which pace usually helps you do your best work?",
    guidance: "Choose the rhythm that improves your judgment, not just your adrenaline.",
    answers: [
      { id: "A", text: "Fast pace, clear stakes, quick decisions.", supportingText: "Speed and consequence wake up your best instincts.", resultSignal: "Fast-stakes pace", scores: { mbti: { E: 1, T: 1, P: 1 }, disc: { D: 4 }, bigFive: { E: 2, N: -1 }, career: { pace: 4, leadership: 2, entrepreneurship: 2 } } },
      { id: "B", text: "Steady pace, predictable expectations, low chaos.", supportingText: "Consistency helps you produce dependable work.", resultSignal: "Steady pace", scores: { mbti: { S: 2, J: 2 }, disc: { S: 4 }, bigFive: { C: 2, N: -1 }, career: { stability: 4, operations: 2 } } },
      { id: "C", text: "Deep pace, fewer interruptions, high accuracy.", supportingText: "You do better when your attention can go all the way down.", resultSignal: "Deep precision pace", scores: { mbti: { I: 3, T: 1, J: 1 }, disc: { C: 4 }, bigFive: { C: 2, E: -2 }, career: { deepFocus: 4, analysis: 3 } } },
      { id: "D", text: "Varied pace, people contact, and visible momentum.", supportingText: "You like rhythm changes and social fuel.", resultSignal: "Varied social pace", scores: { mbti: { E: 3, P: 1 }, disc: { I: 4 }, bigFive: { E: 3, O: 1 }, career: { people: 2, pace: 3, creative: 1 } } },
    ],
  },
  {
    id: 20,
    key: "standards-vs-momentum",
    group: "DISC work behavior",
    signal: "Execution tradeoff",
    prompt: "A project is good but not perfect. What is your likely move?",
    guidance: "Choose your default when the project needs a decision.",
    answers: [
      { id: "A", text: "Ship it if it solves the real problem.", supportingText: "You value usefulness over polishing the doorknob on a house fire.", resultSignal: "Pragmatic shipper", scores: { mbti: { T: 1, P: 2 }, disc: { D: 3 }, bigFive: { C: 0, E: 1 }, career: { entrepreneurship: 3, pace: 2, leadership: 1 } } },
      { id: "B", text: "Improve the weak spots before others see it.", supportingText: "Your standards protect the work’s credibility.", resultSignal: "Quality finisher", scores: { mbti: { J: 3, S: 1 }, disc: { C: 4 }, bigFive: { C: 4 }, career: { operations: 3, systems: 2 } } },
      { id: "C", text: "Get feedback from people who will use it.", supportingText: "You want reality from the user, not theory from the conference room.", resultSignal: "User-feedback builder", scores: { mbti: { F: 1, E: 1, P: 1 }, disc: { I: 2, S: 1 }, bigFive: { A: 2, O: 1 }, career: { people: 2, service: 1, creative: 1 } } },
      { id: "D", text: "Reframe the goal if the current version misses the point.", supportingText: "You zoom out when optimization is solving the wrong problem.", resultSignal: "Strategic reframer", scores: { mbti: { N: 3, T: 1 }, disc: { C: 1, D: 1 }, bigFive: { O: 3 }, career: { systems: 3, analysis: 2, creative: 1 } } },
    ],
  },
  {
    id: 21,
    key: "responsibility-style",
    group: "DISC work behavior",
    signal: "Preferred responsibility",
    prompt: "Which responsibility would you rather own?",
    guidance: "Choose the responsibility you would accept even when it gets hard.",
    answers: [
      { id: "A", text: "Making the final decision when the path is unclear.", supportingText: "You can carry ambiguity and still move.", resultSignal: "Decision ownership", scores: { mbti: { T: 2, J: 1, E: 1 }, disc: { D: 4 }, bigFive: { C: 1, N: -1 }, career: { leadership: 4, entrepreneurship: 2 } } },
      { id: "B", text: "Keeping the process organized and dependable.", supportingText: "You like being the reason things do not quietly collapse.", resultSignal: "Process ownership", scores: { mbti: { S: 2, J: 3 }, disc: { C: 3, S: 1 }, bigFive: { C: 4 }, career: { operations: 4, systems: 2, stability: 2 } } },
      { id: "C", text: "Making sure people stay informed and engaged.", supportingText: "You keep energy and clarity moving through the group.", resultSignal: "Engagement ownership", scores: { mbti: { E: 2, F: 2 }, disc: { I: 3, S: 1 }, bigFive: { E: 2, A: 2 }, career: { people: 4, leadership: 1 } } },
      { id: "D", text: "Solving the hardest technical or conceptual problem.", supportingText: "You want the difficult knot, not the easy meeting.", resultSignal: "Hard-problem ownership", scores: { mbti: { I: 1, N: 2, T: 3 }, disc: { C: 3 }, bigFive: { O: 2, C: 1 }, career: { analysis: 4, systems: 3, deepFocus: 2 } } },
    ],
  },
  {
    id: 22,
    key: "work-material-preference",
    group: "Career-fit vector",
    signal: "Work material",
    prompt: "Which kind of work material do you most want in front of you every week?",
    guidance: "Career fit starts with what you actually want to handle repeatedly.",
    answers: [
      { id: "A", text: "Data, systems, research, or complex information.", supportingText: "You are drawn toward complexity that can be understood.", resultSignal: "Data/systems material", scores: { mbti: { I: 1, N: 1, T: 2 }, disc: { C: 3 }, bigFive: { O: 2, C: 1 }, career: { analysis: 4, systems: 4, deepFocus: 1 } } },
      { id: "B", text: "People, needs, relationships, or communication.", supportingText: "You want human context in the work, not just abstract output.", resultSignal: "People material", scores: { mbti: { E: 1, F: 3 }, disc: { I: 2, S: 2 }, bigFive: { A: 3, E: 1 }, career: { people: 4, service: 3 } } },
      { id: "C", text: "Tools, products, operations, or physical/practical problems.", supportingText: "You like work that has handles, constraints, and tangible outcomes.", resultSignal: "Practical material", scores: { mbti: { S: 3, T: 1 }, disc: { C: 1, D: 1, S: 1 }, bigFive: { C: 1 }, career: { handsOn: 4, operations: 3, systems: 1 } } },
      { id: "D", text: "Ideas, stories, designs, or future possibilities.", supportingText: "You want work with imagination and conceptual range.", resultSignal: "Creative material", scores: { mbti: { N: 3, P: 1 }, disc: { I: 2 }, bigFive: { O: 4 }, career: { creative: 4, autonomy: 2 } } },
    ],
  },
  {
    id: 23,
    key: "six-month-energy",
    group: "Career-fit vector",
    signal: "Sustainable energy",
    prompt: "Which work would drain you least over six months?",
    guidance: "Ignore what sounds impressive. Choose what stays livable.",
    answers: [
      { id: "A", text: "Improving a system until it runs better.", supportingText: "Iterative improvement can hold your attention over time.", resultSignal: "Sustainable systems work", scores: { mbti: { T: 2, J: 2 }, disc: { C: 3 }, bigFive: { C: 3, O: 1 }, career: { systems: 4, operations: 3, analysis: 1 } } },
      { id: "B", text: "Helping people solve personal or practical problems.", supportingText: "Service impact gives you renewable energy.", resultSignal: "Sustainable helping work", scores: { mbti: { F: 3, S: 1 }, disc: { S: 3 }, bigFive: { A: 4 }, career: { service: 4, people: 3 } } },
      { id: "C", text: "Building, fixing, or testing something tangible.", supportingText: "Tangible progress keeps the work grounded.", resultSignal: "Sustainable hands-on work", scores: { mbti: { S: 3, P: 1 }, disc: { D: 1, C: 1 }, bigFive: { C: 1 }, career: { handsOn: 4, operations: 2, pace: 1 } } },
      { id: "D", text: "Creating concepts, campaigns, content, or experiences.", supportingText: "Original output keeps the work alive.", resultSignal: "Sustainable creative work", scores: { mbti: { N: 3, E: 1, P: 1 }, disc: { I: 3 }, bigFive: { O: 4, E: 1 }, career: { creative: 4, entrepreneurship: 1, autonomy: 1 } } },
    ],
  },
  {
    id: 24,
    key: "environment-preference",
    group: "Career-fit vector",
    signal: "Best environment",
    prompt: "Which environment would probably help you perform best?",
    guidance: "Choose the environment that protects your best work.",
    answers: [
      { id: "A", text: "Quiet focus, clear ownership, minimal interruption.", supportingText: "You thrive when attention is protected.", resultSignal: "Protected-focus environment", scores: { mbti: { I: 4, J: 1 }, disc: { C: 2 }, bigFive: { E: -3, C: 2 }, career: { deepFocus: 4, autonomy: 2, analysis: 1 } } },
      { id: "B", text: "Collaborative energy, frequent conversation, shared momentum.", supportingText: "You perform well when work is socially alive.", resultSignal: "Collaborative environment", scores: { mbti: { E: 4, F: 1 }, disc: { I: 3 }, bigFive: { E: 4, A: 1 }, career: { people: 3, leadership: 1, pace: 1 } } },
      { id: "C", text: "Structured expectations, stable routines, reliable systems.", supportingText: "You do strong work when the rules of the game are clear.", resultSignal: "Stable-structure environment", scores: { mbti: { S: 2, J: 3 }, disc: { S: 2, C: 2 }, bigFive: { C: 3, N: -1 }, career: { stability: 4, operations: 3 } } },
      { id: "D", text: "Dynamic setting with variety, urgency, and real-time problem solving.", supportingText: "You like a field of moving targets, apparently because peace offended you.", resultSignal: "Dynamic environment", scores: { mbti: { E: 2, P: 2 }, disc: { D: 2, I: 1 }, bigFive: { E: 2, O: 1 }, career: { pace: 4, entrepreneurship: 3, leadership: 1 } } },
    ],
  },
  {
    id: 25,
    key: "motivation-driver",
    group: "Career-fit vector",
    signal: "Motivation driver",
    prompt: "What makes work feel most worth it to you?",
    guidance: "Choose the reward that would still matter after the novelty wears off.",
    answers: [
      { id: "A", text: "Mastering something difficult and becoming excellent.", supportingText: "Competence and craft are major fuel sources.", resultSignal: "Mastery motivation", scores: { mbti: { I: 1, T: 2, J: 1 }, disc: { C: 3 }, bigFive: { C: 3, O: 1 }, career: { analysis: 2, systems: 2, deepFocus: 2 } } },
      { id: "B", text: "Seeing people benefit because I helped.", supportingText: "Impact is most real when another person is better off.", resultSignal: "Service motivation", scores: { mbti: { F: 4 }, disc: { S: 3 }, bigFive: { A: 4 }, career: { service: 4, people: 3 } } },
      { id: "C", text: "Winning measurable outcomes or building momentum.", supportingText: "Progress you can count is deeply motivating.", resultSignal: "Achievement motivation", scores: { mbti: { E: 1, T: 2, J: 1 }, disc: { D: 4 }, bigFive: { C: 2, E: 1 }, career: { leadership: 3, entrepreneurship: 3, pace: 1 } } },
      { id: "D", text: "Making something original, useful, or meaningful exist.", supportingText: "Creation itself is the reward.", resultSignal: "Creation motivation", scores: { mbti: { N: 3, P: 1 }, disc: { I: 2 }, bigFive: { O: 4 }, career: { creative: 4, autonomy: 2, entrepreneurship: 1 } } },
    ],
  },
  {
    id: 26,
    key: "tradeoff-tolerance",
    group: "Career-fit vector",
    signal: "Tolerated friction",
    prompt: "Which tradeoff are you most willing to accept for the right path?",
    guidance: "Every good path still charges rent. Pick the rent you can pay.",
    answers: [
      { id: "A", text: "More uncertainty if I get autonomy and upside.", supportingText: "Freedom and opportunity can justify risk.", resultSignal: "Autonomy-risk tolerance", scores: { mbti: { N: 1, P: 3 }, disc: { D: 2, I: 1 }, bigFive: { O: 3, N: -1 }, career: { autonomy: 4, entrepreneurship: 4 } } },
      { id: "B", text: "More routine if the work is stable and dependable.", supportingText: "Predictability is not boring if it protects what matters.", resultSignal: "Stability-routine tolerance", scores: { mbti: { S: 3, J: 2 }, disc: { S: 3, C: 1 }, bigFive: { C: 2, O: -1 }, career: { stability: 4, operations: 2 } } },
      { id: "C", text: "More social demand if the work has impact and connection.", supportingText: "People energy is worth spending when it matters.", resultSignal: "Social-impact tolerance", scores: { mbti: { E: 2, F: 3 }, disc: { I: 2, S: 2 }, bigFive: { E: 2, A: 3 }, career: { people: 4, service: 3 } } },
      { id: "D", text: "More complexity if the work is intellectually satisfying.", supportingText: "Hard thinking is acceptable rent for meaningful problems.", resultSignal: "Complexity tolerance", scores: { mbti: { I: 1, N: 2, T: 3 }, disc: { C: 3 }, bigFive: { O: 2, C: 1 }, career: { analysis: 4, systems: 3, deepFocus: 2 } } },
    ],
  },
  {
    id: 27,
    key: "strength-mirror",
    group: "Calibration",
    signal: "Strength mirror",
    prompt: "If someone described your strongest contribution, which would feel most accurate?",
    guidance: "This calibrates whether your pattern is converging or split.",
    answers: [
      { id: "A", text: "I bring clarity when things are confusing.", supportingText: "You help people see the clean structure underneath the mess.", resultSignal: "Clarity contribution", scores: { mbti: { I: 1, T: 3, J: 1 }, disc: { C: 3 }, bigFive: { C: 2, O: 1 }, career: { analysis: 3, systems: 2 } } },
      { id: "B", text: "I bring momentum when things are stuck.", supportingText: "You help motion return when the room stalls.", resultSignal: "Momentum contribution", scores: { mbti: { E: 2, T: 1, P: 1 }, disc: { D: 3, I: 1 }, bigFive: { E: 2 }, career: { leadership: 3, entrepreneurship: 2, pace: 2 } } },
      { id: "C", text: "I bring steadiness when things are stressful.", supportingText: "You help people and processes stabilize.", resultSignal: "Steadiness contribution", scores: { mbti: { S: 2, F: 1, J: 1 }, disc: { S: 4 }, bigFive: { A: 2, C: 2, N: -2 }, career: { stability: 3, service: 2, operations: 1 } } },
      { id: "D", text: "I bring originality when things feel stale.", supportingText: "You help new possibilities enter the room.", resultSignal: "Originality contribution", scores: { mbti: { N: 3, P: 1 }, disc: { I: 2 }, bigFive: { O: 4 }, career: { creative: 4, autonomy: 1 } } },
    ],
  },
  {
    id: 28,
    key: "anti-fit-warning",
    group: "Calibration",
    signal: "Anti-fit warning",
    prompt: "Which kind of work would become frustrating fastest?",
    guidance: "Anti-fit is often more predictive than fantasy-fit. Annoying, but useful.",
    answers: [
      { id: "A", text: "Work with constant interruption and little time to think.", supportingText: "Your best work needs protected attention.", resultSignal: "Avoid interruption-heavy roles", scores: { mbti: { I: 3, J: 1 }, disc: { C: 2 }, bigFive: { E: -2, C: 1 }, career: { deepFocus: 3, analysis: 1, people: -1, pace: -1 } } },
      { id: "B", text: "Work with rigid rules and no room to improve anything.", supportingText: "Stagnation and needless constraint drain you quickly.", resultSignal: "Avoid rigid-stagnant roles", scores: { mbti: { N: 2, P: 2 }, disc: { I: 1, D: 1 }, bigFive: { O: 3 }, career: { creative: 2, autonomy: 3, entrepreneurship: 1, stability: -1 } } },
      { id: "C", text: "Work with heavy conflict, pressure, or emotional tension.", supportingText: "Sustained tension taxes your system.", resultSignal: "Avoid chronic-conflict roles", scores: { mbti: { F: 2, I: 1 }, disc: { S: 3 }, bigFive: { A: 2, N: 2 }, career: { service: 1, stability: 2, leadership: -1, pace: -1 } } },
      { id: "D", text: "Work with vague expectations and no clear standard for success.", supportingText: "Ambiguity without standards feels like being graded by fog.", resultSignal: "Avoid vague-standard roles", scores: { mbti: { J: 3, T: 1 }, disc: { C: 3 }, bigFive: { C: 3, N: 1 }, career: { operations: 2, systems: 2, stability: 2, autonomy: -1 } } },
    ],
  },
];
