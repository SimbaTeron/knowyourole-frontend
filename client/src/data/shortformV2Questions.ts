
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
    prompt: "After a tiring day, what usually helps you feel like yourself again?",
    guidance: "Choose the answer that is most true most often.",
    answers: [
      { id: "A", text: "Quiet time where nobody needs anything from me.", supportingText: "You reset through solitude, privacy, and lower stimulation.", resultSignal: "Deep-focus recovery", scores: { mbti: { I: 3 }, disc: { C: 1 }, bigFive: { E: -2, C: 1 }, career: { deepFocus: 3, analysis: 1 } } },
      { id: "B", text: "A good conversation with someone who energizes me.", supportingText: "You recover by talking and connecting with other people.", resultSignal: "Connection recharge", scores: { mbti: { E: 3, F: 1 }, disc: { I: 2 }, bigFive: { E: 3, A: 1 }, career: { people: 2, service: 1 } } },
      { id: "C", text: "Doing something active or practical so I can reset physically.", supportingText: "You clear your head through movement, tasks, or tangible action.", resultSignal: "Practical reset", scores: { mbti: { S: 2, P: 1 }, disc: { D: 1, S: 1 }, bigFive: { E: 1, N: -1 }, career: { handsOn: 3, operations: 1, pace: 1 } } },
      { id: "D", text: "Quietly sinking into a creative or interesting project on my own.", supportingText: "You recover by following curiosity into something absorbing.", resultSignal: "Creative immersion", scores: { mbti: { N: 2, P: 1, I: 1 }, disc: { I: 1 }, bigFive: { O: 3 }, career: { creative: 3, autonomy: 1 } } },
    ],
  },
  {
    id: 2,
    key: "information-lens",
    group: "Core operating style",
    signal: "Information lens",
    prompt: "When you first look at a new problem, what do you naturally notice first?",
    guidance: "Pick what your mind goes to first, before you think about it.",
    answers: [
      { id: "A", text: "The facts, the limits, and what can be checked or proven.", supportingText: "You trust what you can check.", resultSignal: "Evidence-first", scores: { mbti: { S: 3, T: 1, J: 1 }, disc: { C: 2 }, bigFive: { C: 2 }, career: { operations: 2, analysis: 2, stability: 1 } } },
      { id: "B", text: "The pattern underneath it and where it may lead.", supportingText: "You look for the invisible structure behind the obvious issue.", resultSignal: "Pattern-first", scores: { mbti: { N: 3, T: 1 }, disc: { C: 1 }, bigFive: { O: 3 }, career: { analysis: 3, systems: 2 } } },
      { id: "C", text: "The people affected and what they probably need.", supportingText: "You read the human consequences early.", resultSignal: "Human-impact lens", scores: { mbti: { F: 2, E: 1 }, disc: { I: 1, S: 1 }, bigFive: { A: 3 }, career: { people: 3, service: 2 } } },
      { id: "D", text: "The fastest practical move that would create progress.", supportingText: "You look for a first step that gets things moving.", resultSignal: "Action-first", scores: { mbti: { S: 1, T: 1, P: 1 }, disc: { D: 2 }, bigFive: { C: 1, E: 1 }, career: { leadership: 2, entrepreneurship: 2, pace: 2 } } },
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
      { id: "B", text: "The choice respects the people involved.", supportingText: "You want the effect on people taken seriously.", resultSignal: "People-aware judgment", scores: { mbti: { F: 3 }, disc: { S: 1, I: 1 }, bigFive: { A: 3 }, career: { people: 2, service: 2 } } },
      { id: "C", text: "The outcome is measurable and moves things forward.", supportingText: "You trust decisions that create visible progress.", resultSignal: "Outcome drive", scores: { mbti: { T: 2, J: 1, E: 1 }, disc: { D: 3 }, bigFive: { C: 1 }, career: { leadership: 3, entrepreneurship: 2 } } },
      { id: "D", text: "The decision can still change if I learn something new.", supportingText: "You like choices that can change when things change.", resultSignal: "Adaptive judgment", scores: { mbti: { P: 3, N: 1 }, disc: { I: 1 }, bigFive: { O: 2 }, career: { autonomy: 2, creative: 1 } } },
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
      { id: "A", text: "Build a clear plan early and follow it closely.", supportingText: "You lower risk by planning before you start.", resultSignal: "Structured executor", scores: { mbti: { J: 3, S: 1 }, disc: { C: 2, S: 1 }, bigFive: { C: 3 }, career: { operations: 3, stability: 2, systems: 1 } } },
      { id: "B", text: "Set a rough direction, then adapt as I learn more.", supportingText: "You like a little planning, but not so much that it feels stuck.", resultSignal: "Adaptive planner", scores: { mbti: { P: 3, N: 1 }, disc: { I: 1 }, bigFive: { O: 2 }, career: { autonomy: 2, creative: 1, entrepreneurship: 1 } } },
      { id: "C", text: "Start with the hardest unknown and solve that first.", supportingText: "You tackle the biggest question first.", resultSignal: "Problem-first strategist", scores: { mbti: { T: 2, N: 1, J: 1 }, disc: { C: 2, D: 1 }, bigFive: { C: 2, O: 1 }, career: { analysis: 3, systems: 2 } } },
      { id: "D", text: "Get the right people to agree on the plan before the work starts.", supportingText: "You prevent chaos by building agreement early.", resultSignal: "Alignment builder", scores: { mbti: { F: 2, E: 1, J: 1 }, disc: { I: 2, S: 1 }, bigFive: { A: 2, E: 1 }, career: { people: 3, leadership: 1 } } },
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
      { id: "C", text: "When the conversation stays direct and solution-focused.", supportingText: "You talk best when people get to the point.", resultSignal: "Direct resolver", scores: { mbti: { T: 2, J: 1 }, disc: { D: 2, C: 1 }, bigFive: { C: 1, A: -1 }, career: { leadership: 2, operations: 1 } } },
      { id: "D", text: "When the emotional context is acknowledged first.", supportingText: "You want feelings noticed before jumping to solutions.", resultSignal: "Context-aware communicator", scores: { mbti: { F: 3 }, disc: { S: 2 }, bigFive: { A: 3 }, career: { service: 2, people: 2 } } },
    ],
  },
  {
    id: 6,
    key: "novelty-proven-path",
    group: "Core operating style",
    signal: "Novelty vs. proof",
    prompt: "If two ways could both work, which one would you pick?",
    guidance: "Choose the one you would naturally stand up for.",
    answers: [
      { id: "A", text: "The way that has already been shown to work.", supportingText: "You trust what has already worked in real life.", resultSignal: "Proof-led", scores: { mbti: { S: 3, J: 1 }, disc: { C: 2 }, bigFive: { C: 2, O: -1 }, career: { stability: 3, operations: 2 } } },
      { id: "B", text: "The new way that could turn out even better.", supportingText: "You are drawn to new ideas, even before others agree.", resultSignal: "Originality-led", scores: { mbti: { N: 3, P: 1 }, disc: { I: 1 }, bigFive: { O: 3 }, career: { creative: 3, entrepreneurship: 2, autonomy: 1 } } },
      { id: "C", text: "The fastest way to get a useful result.", supportingText: "You like getting things done without extra steps.", resultSignal: "Efficiency-led", scores: { mbti: { T: 2, S: 1 }, disc: { D: 2 }, bigFive: { C: 1 }, career: { operations: 2, leadership: 2, pace: 2 } } },
      { id: "D", text: "The way that gets people on board as you go.", supportingText: "You know that people need to accept an idea for it to work.", resultSignal: "Buy-in led", scores: { mbti: { F: 2, E: 1 }, disc: { I: 2, S: 1 }, bigFive: { A: 2, E: 1 }, career: { people: 3, leadership: 1 } } },
    ],
  },
  {
    id: 7,
    key: "closure-preference",
    group: "Core operating style",
    signal: "Closure preference",
    prompt: "What feels best at the end of working on something (for work, school, or a project)?",
    guidance: "Pick what makes the session feel worthwhile.",
    answers: [
      { id: "A", text: "A finished checklist and a clear next step.", supportingText: "Completion and order create relief.", resultSignal: "Completion drive", scores: { mbti: { J: 3, S: 1 }, disc: { C: 2, S: 1 }, bigFive: { C: 3 }, career: { operations: 3, stability: 1 } } },
      { id: "B", text: "A better understanding of the problem.", supportingText: "Insight itself feels like progress.", resultSignal: "Understanding drive", scores: { mbti: { N: 2, T: 1, I: 1 }, disc: { C: 2 }, bigFive: { O: 2 }, career: { analysis: 3, systems: 2, deepFocus: 1 } } },
      { id: "C", text: "A visible piece of progress, even if imperfect.", supportingText: "You would rather make progress than keep planning.", resultSignal: "Momentum drive", scores: { mbti: { P: 2, E: 1, S: 1 }, disc: { D: 2 }, bigFive: { E: 1 }, career: { entrepreneurship: 2, pace: 2, leadership: 1 } } },
      { id: "D", text: "A stronger connection or agreement with the people involved.", supportingText: "Progress feels real when the group agrees more.", resultSignal: "Relational progress", scores: { mbti: { F: 2, E: 1 }, disc: { I: 1, S: 2 }, bigFive: { A: 3 }, career: { people: 3, service: 1 } } },
    ],
  },
  {
    id: 8,
    key: "thinking-depth",
    group: "Core operating style",
    signal: "Task energy",
    prompt: "Which task would you choose if they all mattered the same?",
    guidance: "This is about what you enjoy, not what sounds impressive.",
    answers: [
      { id: "A", text: "Analyze a complex issue and explain the clean answer.", supportingText: "You like turning mess into clarity.", resultSignal: "Analytical clarity", scores: { mbti: { I: 1, N: 1, T: 3 }, disc: { C: 2 }, bigFive: { O: 1, C: 1 }, career: { analysis: 4, systems: 1, deepFocus: 1 } } },
      { id: "B", text: "Coordinate moving parts so the whole thing works smoothly.", supportingText: "You like making things run smoothly.", resultSignal: "Operational coordination", scores: { mbti: { J: 3, S: 1 }, disc: { S: 1, C: 2 }, bigFive: { C: 3 }, career: { operations: 4, systems: 2, stability: 1 } } },
      { id: "C", text: "Convince people to get behind a useful idea or opportunity.", supportingText: "You like getting people excited to act.", resultSignal: "Influence energy", scores: { mbti: { E: 3, N: 1 }, disc: { I: 2, D: 1 }, bigFive: { E: 3, O: 1 }, career: { people: 2, leadership: 2, entrepreneurship: 2 } } },
      { id: "D", text: "Help someone solve a real problem directly.", supportingText: "You like impact you can see in another person’s life.", resultSignal: "Direct service", scores: { mbti: { F: 3, S: 1 }, disc: { S: 2 }, bigFive: { A: 3 }, career: { service: 4, people: 2, handsOn: 1 } } },
    ],
  },
  {
    id: 9,
    key: "follow-through-friction",
    group: "Big Five backbone",
    signal: "Follow-through under friction",
    prompt: "When a task becomes boring but still matters, what usually happens?",
    guidance: "Pick what you really do, not what sounds best.",
    answers: [
      { id: "A", text: "I finish it because people should be able to count on me.", supportingText: "You keep going even when it is no longer interesting.", resultSignal: "Duty follow-through", scores: { mbti: { J: 2, S: 1 }, disc: { S: 2, C: 1 }, bigFive: { C: 3 }, career: { stability: 2, operations: 2 } } },
      { id: "B", text: "I finish it if I can make the system cleaner or smarter.", supportingText: "Making it better gives the boring work a purpose.", resultSignal: "Systems follow-through", scores: { mbti: { T: 2, J: 1, N: 1 }, disc: { C: 2 }, bigFive: { C: 2, O: 1 }, career: { systems: 3, analysis: 2 } } },
      { id: "C", text: "I push through if other people are counting on me.", supportingText: "Knowing others need you keeps you going.", resultSignal: "Relational follow-through", scores: { mbti: { F: 2, J: 1 }, disc: { S: 2 }, bigFive: { A: 2, C: 1 }, career: { people: 2, service: 2 } } },
      { id: "D", text: "I look for a more interesting angle or shortcut, even if it means leaving the usual plan.", supportingText: "You stay interested by changing how you do it.", resultSignal: "Adaptive efficiency", scores: { mbti: { P: 2, N: 1 }, disc: { D: 1, I: 1 }, bigFive: { O: 2, C: -1 }, career: { entrepreneurship: 2, autonomy: 2, pace: 1 } } },
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
      { id: "A", text: "I want to catch and fix them early.", supportingText: "Fixing it early is easier than cleaning up later.", resultSignal: "Quality guardian", scores: { mbti: { S: 2, J: 2 }, disc: { C: 3 }, bigFive: { C: 3 }, career: { operations: 3, systems: 2, stability: 1 } } },
      { id: "B", text: "I focus on the errors most likely to affect the outcome.", supportingText: "You fix what matters most first, not every small thing.", resultSignal: "Risk prioritizer", scores: { mbti: { T: 3, J: 1 }, disc: { C: 2, D: 1 }, bigFive: { C: 2 }, career: { analysis: 3, leadership: 1 } } },
      { id: "C", text: "I notice them, but I do not want them to slow everything down.", supportingText: "Keeping things moving matters more to you than being perfect.", resultSignal: "Momentum protector", scores: { mbti: { P: 2, E: 1 }, disc: { D: 2 }, bigFive: { C: -1, E: 1 }, career: { pace: 3, entrepreneurship: 2 } } },
      { id: "D", text: "I prefer someone detail-oriented to handle that part while I focus elsewhere.", supportingText: "You know your best strengths may be somewhere other than small details.", resultSignal: "Delegating strategist", scores: { mbti: { N: 1, T: 1 }, disc: { D: 1, I: 1 }, bigFive: { C: -1 }, career: { leadership: 2, creative: 1, entrepreneurship: 1 } } },
    ],
  },
  {
    id: 11,
    key: "curiosity-driver",
    group: "Big Five backbone",
    signal: "Curiosity driver",
    prompt: "What kind of learning do you enjoy most?",
    guidance: "Pick the learning you would do even if no one assigned it.",
    answers: [
      { id: "A", text: "Learning a practical skill I can use quickly.", supportingText: "You like learning things you can use right away.", resultSignal: "Practical learner", scores: { mbti: { S: 2, P: 1 }, disc: { D: 1 }, bigFive: { O: 1, C: 1 }, career: { handsOn: 3, operations: 1 } } },
      { id: "B", text: "Understanding a deep idea or system.", supportingText: "You want to know how things really work underneath.", resultSignal: "Systems learner", scores: { mbti: { N: 2, T: 2, I: 1 }, disc: { C: 2 }, bigFive: { O: 3 }, career: { analysis: 3, systems: 3, deepFocus: 1 } } },
      { id: "C", text: "Exploring something creative, unusual, or new.", supportingText: "You get excited by new and different ideas.", resultSignal: "Possibility learner", scores: { mbti: { N: 3, P: 1 }, disc: { I: 1 }, bigFive: { O: 4 }, career: { creative: 4, autonomy: 1 } } },
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
      { id: "B", text: "A small trusted group with thoughtful exchange.", supportingText: "You like close, meaningful conversations.", resultSignal: "Selective social energy", scores: { mbti: { I: 1, F: 2, N: 1 }, disc: { S: 2 }, bigFive: { A: 2, E: 1 }, career: { people: 2, service: 1 } } },
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
      { id: "A", text: "Keeping the mood constructive and people included.", supportingText: "You help people stay involved instead of tuning out.", resultSignal: "Inclusion builder", scores: { mbti: { E: 2, F: 2 }, disc: { I: 3 }, bigFive: { A: 3, E: 2 }, career: { people: 3, service: 1 } } },
      { id: "B", text: "Saying the direct thing others are avoiding.", supportingText: "You help things move by saying what is really going on.", resultSignal: "Direct truth-teller", scores: { mbti: { T: 2, E: 1 }, disc: { D: 3 }, bigFive: { A: -1, E: 1 }, career: { leadership: 3, entrepreneurship: 1 } } },
      { id: "C", text: "Making sure the work is accurate and thought through.", supportingText: "You protect the group from sloppy conclusions.", resultSignal: "Accuracy anchor", scores: { mbti: { T: 2, J: 2, I: 1 }, disc: { C: 3 }, bigFive: { C: 3 }, career: { analysis: 2, systems: 2, operations: 1 } } },
      { id: "D", text: "Staying steady and helping people follow through.", supportingText: "You keep the group steady when energy starts to drop.", resultSignal: "Steady support", scores: { mbti: { F: 1, J: 2, S: 1 }, disc: { S: 3 }, bigFive: { A: 2, C: 2 }, career: { service: 2, stability: 2, operations: 1 } } },
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
      { id: "A", text: "Clarify the facts and remove confusion.", supportingText: "You calm things down by getting the facts straight.", resultSignal: "Fact clarifier", scores: { mbti: { T: 2, S: 1, J: 1 }, disc: { C: 3 }, bigFive: { C: 2 }, career: { analysis: 2, systems: 1 } } },
      { id: "B", text: "Address it directly so the group can move.", supportingText: "You would rather deal with it now than let it build up.", resultSignal: "Direct resolver", scores: { mbti: { E: 1, T: 2 }, disc: { D: 3 }, bigFive: { E: 1, A: -1, N: -1 }, career: { leadership: 3, pace: 1 } } },
      { id: "C", text: "Calm things down and protect the friendship or relationship.", supportingText: "You keep people from getting more upset.", resultSignal: "Harmony stabilizer", scores: { mbti: { F: 3 }, disc: { S: 3 }, bigFive: { A: 4 }, career: { people: 2, service: 2 } } },
      { id: "D", text: "Step back, think, and return when I can respond well.", supportingText: "You prefer a thought-out answer over a quick reaction.", resultSignal: "Reflective responder", scores: { mbti: { I: 3, J: 1 }, disc: { C: 1, S: 1 }, bigFive: { C: 1, N: -1 }, career: { deepFocus: 2, analysis: 1 } } },
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
      { id: "B", text: "I become quieter and more analytical.", supportingText: "Pressure makes you go quiet and figure out what is wrong.", resultSignal: "Pressure analyst", scores: { mbti: { I: 3, T: 2 }, disc: { C: 3 }, bigFive: { C: 1, N: -1 }, career: { analysis: 3, deepFocus: 2 } } },
      { id: "C", text: "I check in with people I trust so we stay on the same page.", supportingText: "Connection helps you stay steady — not because you are falling apart.", resultSignal: "Pressure connector", scores: { mbti: { F: 2, E: 1 }, disc: { S: 2, I: 1 }, bigFive: { A: 2, N: 2 }, career: { people: 2, service: 1 } } },
      { id: "D", text: "I feel scattered unless I can simplify the next step.", supportingText: "You need the mess broken down into one small step.", resultSignal: "Pressure simplifier", scores: { mbti: { P: 1, S: 1 }, disc: { S: 1 }, bigFive: { N: 3, C: -1 }, career: { operations: 1, stability: 1 } } },
    ],
  },
  {
    id: 16,
    key: "feedback-response",
    group: "Big Five backbone",
    signal: "Feedback response",
    prompt: "When someone gives you honest, direct feedback, what helps you use it best?",
    guidance: "Choose what helps you learn from feedback.",
    answers: [
      { id: "A", text: "Specific examples and a clear standard.", supportingText: "You use feedback best when you know exactly what is expected.", resultSignal: "Standard-driven growth", scores: { mbti: { S: 1, T: 2, J: 1 }, disc: { C: 3 }, bigFive: { C: 3 }, career: { operations: 2, analysis: 1 } } },
      { id: "B", text: "A kind tone and knowing the person understands me.", supportingText: "Trust decides whether you can take the message in.", resultSignal: "Trust-based growth", scores: { mbti: { F: 3 }, disc: { S: 2 }, bigFive: { A: 3, N: 1 }, career: { people: 2, service: 1 } } },
      { id: "C", text: "Time alone to process before responding.", supportingText: "You need time to think about it before it stops stinging.", resultSignal: "Reflective growth", scores: { mbti: { I: 3, J: 1 }, disc: { C: 1 }, bigFive: { C: 1, E: -1 }, career: { deepFocus: 2, analysis: 1 } } },
      { id: "D", text: "A direct challenge that makes me want to show I can do better.", supportingText: "A clear challenge makes you want to improve.", resultSignal: "Challenge-based growth", scores: { mbti: { E: 1, T: 2 }, disc: { D: 3 }, bigFive: { E: 1, C: 1, N: -1 }, career: { leadership: 2, entrepreneurship: 2 } } },
    ],
  },
  {
    id: 17,
    key: "team-stuck-moment",
    group: "DISC work behavior",
    signal: "Leadership reflex",
    prompt: "A group is stuck and the deadline is getting close. What do you naturally do?",
    guidance: "Choose what you would do even if you were not the leader.",
    answers: [
      { id: "A", text: "Make the call and get people moving.", supportingText: "You convert uncertainty into action.", resultSignal: "Decisive driver", scores: { mbti: { E: 1, T: 2, J: 1 }, disc: { D: 4 }, bigFive: { C: 1, E: 1 }, career: { leadership: 4, pace: 2 } } },
      { id: "B", text: "Cheer the group on and get everyone excited again.", supportingText: "You know a group works better when people feel good.", resultSignal: "Energy catalyst", scores: { mbti: { E: 3, F: 1 }, disc: { I: 4 }, bigFive: { E: 3, A: 1 }, career: { people: 3, leadership: 1 } } },
      { id: "C", text: "Calm the room and create a steady path.", supportingText: "You get things moving again by making them calmer.", resultSignal: "Steady pathmaker", scores: { mbti: { F: 1, J: 2, S: 1 }, disc: { S: 4 }, bigFive: { A: 2, C: 2, N: -1 }, career: { stability: 3, operations: 2, service: 1 } } },
      { id: "D", text: "Check the facts so the next move is correct.", supportingText: "You stop the group from rushing into a mistake.", resultSignal: "Precision checker", scores: { mbti: { I: 1, T: 2, S: 1 }, disc: { C: 4 }, bigFive: { C: 3 }, career: { analysis: 3, systems: 2 } } },
    ],
  },
  {
    id: 18,
    key: "influence-style",
    group: "DISC work behavior",
    signal: "Influence style",
    prompt: "When you need people to support an idea, what do you lean on most?",
    guidance: "Choose how you most naturally convince people.",
    answers: [
      { id: "A", text: "A compelling story that makes people care.", supportingText: "You help people feel why the idea matters.", resultSignal: "Narrative influence", scores: { mbti: { E: 2, N: 1, F: 1 }, disc: { I: 4 }, bigFive: { E: 2, O: 1, A: 1 }, career: { creative: 2, people: 2, leadership: 1 } } },
      { id: "B", text: "A clear argument with evidence.", supportingText: "You want people to agree because of proof, not just feelings.", resultSignal: "Evidence influence", scores: { mbti: { T: 3, J: 1 }, disc: { C: 4 }, bigFive: { C: 2 }, career: { analysis: 3, systems: 1 } } },
      { id: "C", text: "A big goal and showing quick progress.", supportingText: "You get people on board by making the chance feel exciting.", resultSignal: "Momentum influence", scores: { mbti: { E: 2, T: 1 }, disc: { D: 4 }, bigFive: { E: 2, C: 1 }, career: { leadership: 3, entrepreneurship: 3, pace: 1 } } },
      { id: "D", text: "Trust, patience, and talking with people one at a time until they agree.", supportingText: "You earn lasting support by building real trust.", resultSignal: "Trust influence", scores: { mbti: { F: 2, I: 1, J: 1 }, disc: { S: 4 }, bigFive: { A: 3 }, career: { people: 3, service: 1, stability: 1 } } },
    ],
  },
  {
    id: 19,
    key: "pace-preference",
    group: "DISC work behavior",
    signal: "Best pace",
    prompt: "Which pace usually helps you do your best work?",
    guidance: "Choose the pace where you make your best choices, not just the most exciting one.",
    answers: [
      { id: "A", text: "Fast pace, clear stakes, quick decisions.", supportingText: "Speed and high stakes bring out your best.", resultSignal: "Fast-stakes pace", scores: { mbti: { E: 1, T: 1, P: 1 }, disc: { D: 4 }, bigFive: { E: 2, N: -1 }, career: { pace: 4, leadership: 2, entrepreneurship: 2 } } },
      { id: "B", text: "Steady pace, predictable expectations, low chaos.", supportingText: "Consistency helps you produce dependable work.", resultSignal: "Steady pace", scores: { mbti: { S: 2, J: 2 }, disc: { S: 4 }, bigFive: { C: 2, N: -1 }, career: { stability: 4, operations: 2 } } },
      { id: "C", text: "Deep pace, fewer interruptions, high accuracy.", supportingText: "You do better when you can focus deeply.", resultSignal: "Deep precision pace", scores: { mbti: { I: 3, T: 1, J: 1 }, disc: { C: 4 }, bigFive: { C: 2, E: -2 }, career: { deepFocus: 4, analysis: 3 } } },
      { id: "D", text: "Changing pace, lots of time with people, and quick progress you can see.", supportingText: "You like variety and being around people.", resultSignal: "Varied social pace", scores: { mbti: { E: 3, P: 1 }, disc: { I: 4 }, bigFive: { E: 3, O: 1 }, career: { people: 2, pace: 3, creative: 1 } } },
    ],
  },
  {
    id: 20,
    key: "standards-vs-momentum",
    group: "DISC work behavior",
    signal: "Execution tradeoff",
    prompt: "A project is good but not perfect. What is your likely move?",
    guidance: "Choose what you would usually do when a decision is needed.",
    answers: [
      { id: "A", text: "Finish it and hand it in if it solves the real problem.", supportingText: "You care more about it being useful than perfect.", resultSignal: "Pragmatic shipper", scores: { mbti: { T: 1, P: 2 }, disc: { D: 3 }, bigFive: { C: 0, E: 1 }, career: { entrepreneurship: 3, pace: 2, leadership: 1 } } },
      { id: "B", text: "I keep fixing small flaws because handing in imperfect work makes me uneasy.", supportingText: "High standards and worry both push you to polish before others judge it.", resultSignal: "Quality finisher", scores: { mbti: { J: 3, S: 1 }, disc: { C: 4 }, bigFive: { C: 4 }, career: { operations: 3, systems: 2 } } },
      { id: "C", text: "Get feedback from people who will use it.", supportingText: "You want to hear from real users, not just guess.", resultSignal: "User-feedback builder", scores: { mbti: { F: 1, E: 1, P: 1 }, disc: { I: 2, S: 1 }, bigFive: { A: 2, O: 1 }, career: { people: 2, service: 1, creative: 1 } } },
      { id: "D", text: "Rethink the goal if the current version misses the point.", supportingText: "You step back when the work is solving the wrong problem.", resultSignal: "Strategic reframer", scores: { mbti: { N: 3, T: 1 }, disc: { C: 1, D: 1 }, bigFive: { O: 3 }, career: { systems: 3, analysis: 2, creative: 1 } } },
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
      { id: "B", text: "Keeping the process organized and dependable.", supportingText: "You like being the reason things do not fall apart.", resultSignal: "Process ownership", scores: { mbti: { S: 2, J: 3 }, disc: { C: 3, S: 1 }, bigFive: { C: 4 }, career: { operations: 4, systems: 2, stability: 2 } } },
      { id: "C", text: "Making sure people stay informed and engaged.", supportingText: "You keep everyone in the loop and involved.", resultSignal: "Engagement ownership", scores: { mbti: { E: 2, F: 2 }, disc: { I: 3, S: 1 }, bigFive: { E: 2, A: 2 }, career: { people: 4, leadership: 1 } } },
      { id: "D", text: "Solving the hardest technical problem or toughest idea.", supportingText: "You want the hard puzzle, not the easy task.", resultSignal: "Hard-problem ownership", scores: { mbti: { I: 1, N: 2, T: 3 }, disc: { C: 3 }, bigFive: { O: 2, C: 1 }, career: { analysis: 4, systems: 3, deepFocus: 2 } } },
    ],
  },
  {
    id: 22,
    key: "work-material-preference",
    group: "Career-fit vector",
    signal: "Work material",
    prompt: "What would you most want to work with every week?",
    guidance: "Pick what you would actually want to work with again and again.",
    answers: [
      { id: "A", text: "Data, systems, research, or complex information.", supportingText: "You are drawn toward complexity that can be understood.", resultSignal: "Data/systems material", scores: { mbti: { I: 1, N: 1, T: 2 }, disc: { C: 3 }, bigFive: { O: 2, C: 1 }, career: { analysis: 4, systems: 4, deepFocus: 1 } } },
      { id: "B", text: "People, needs, relationships, or communication.", supportingText: "You want human context in the work, not just abstract output.", resultSignal: "People material", scores: { mbti: { E: 1, F: 3 }, disc: { I: 2, S: 2 }, bigFive: { A: 3, E: 1 }, career: { people: 4, service: 3 } } },
      { id: "C", text: "Tools, machines, products, or hands-on practical problems.", supportingText: "You like work you can touch and see results from.", resultSignal: "Practical material", scores: { mbti: { S: 3, T: 1 }, disc: { C: 1, D: 1, S: 1 }, bigFive: { C: 1 }, career: { handsOn: 4, operations: 3, systems: 1 } } },
      { id: "D", text: "Ideas, stories, designs, or future possibilities.", supportingText: "You want work that uses your imagination.", resultSignal: "Creative material", scores: { mbti: { N: 3, P: 1 }, disc: { I: 2 }, bigFive: { O: 4 }, career: { creative: 4, autonomy: 2 } } },
    ],
  },
  {
    id: 23,
    key: "six-month-energy",
    group: "Career-fit vector",
    signal: "Sustainable energy",
    prompt: "Which kind of work could you keep doing for months without getting worn out?",
    guidance: "Ignore what sounds impressive. Choose what you could keep doing.",
    answers: [
      { id: "A", text: "Improving a system until it runs better.", supportingText: "Making something a little better each time keeps you interested.", resultSignal: "Sustainable systems work", scores: { mbti: { T: 2, J: 2 }, disc: { C: 3 }, bigFive: { C: 3, O: 1 }, career: { systems: 4, operations: 3, analysis: 1 } } },
      { id: "B", text: "Helping people solve personal or practical problems.", supportingText: "Helping people keeps you going.", resultSignal: "Sustainable helping work", scores: { mbti: { F: 3, S: 1 }, disc: { S: 3 }, bigFive: { A: 4 }, career: { service: 4, people: 3 } } },
      { id: "C", text: "Building, fixing, or testing something real you can touch.", supportingText: "Seeing real, physical progress keeps you going.", resultSignal: "Sustainable hands-on work", scores: { mbti: { S: 3, P: 1 }, disc: { D: 1, C: 1 }, bigFive: { C: 1 }, career: { handsOn: 4, operations: 2, pace: 1 } } },
      { id: "D", text: "Creating ideas, art, videos, content, or experiences.", supportingText: "Making new things keeps the work fun.", resultSignal: "Sustainable creative work", scores: { mbti: { N: 3, E: 1, P: 1 }, disc: { I: 3 }, bigFive: { O: 4, E: 1 }, career: { creative: 4, entrepreneurship: 1, autonomy: 1 } } },
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
      { id: "B", text: "Working together, talking often, and making progress as a group.", supportingText: "You do well when you work with other people.", resultSignal: "Collaborative environment", scores: { mbti: { E: 4, F: 1 }, disc: { I: 3 }, bigFive: { E: 4, A: 1 }, career: { people: 3, leadership: 1, pace: 1 } } },
      { id: "C", text: "Structured expectations, stable routines, reliable systems.", supportingText: "You do strong work when the rules are clear.", resultSignal: "Stable-structure environment", scores: { mbti: { S: 2, J: 3 }, disc: { S: 2, C: 2 }, bigFive: { C: 3, N: -1 }, career: { stability: 4, operations: 3 } } },
      { id: "D", text: "Dynamic setting with variety, urgency, and real-time problem solving.", supportingText: "You like things that change a lot and keep you on your toes.", resultSignal: "Dynamic environment", scores: { mbti: { E: 2, P: 2 }, disc: { D: 2, I: 1 }, bigFive: { E: 2, O: 1 }, career: { pace: 4, entrepreneurship: 3, leadership: 1 } } },
    ],
  },
  {
    id: 25,
    key: "motivation-driver",
    group: "Career-fit vector",
    signal: "Motivation driver",
    prompt: "What makes work feel most worth it to you?",
    guidance: "Choose the reward that would still matter after the newness wears off.",
    answers: [
      { id: "A", text: "Mastering something difficult and becoming excellent.", supportingText: "Getting really good at something keeps you going.", resultSignal: "Mastery motivation", scores: { mbti: { I: 1, T: 2, J: 1 }, disc: { C: 3 }, bigFive: { C: 3, O: 1 }, career: { analysis: 2, systems: 2, deepFocus: 2 } } },
      { id: "B", text: "Seeing people benefit because I helped.", supportingText: "Impact is most real when another person is better off.", resultSignal: "Service motivation", scores: { mbti: { F: 4 }, disc: { S: 3 }, bigFive: { A: 4 }, career: { service: 4, people: 3 } } },
      { id: "C", text: "Reaching goals you can measure and keeping progress going.", supportingText: "Progress you can count really motivates you.", resultSignal: "Achievement motivation", scores: { mbti: { E: 1, T: 2, J: 1 }, disc: { D: 4 }, bigFive: { C: 2, E: 1 }, career: { leadership: 3, entrepreneurship: 3, pace: 1 } } },
      { id: "D", text: "Making something original, useful, or meaningful exist.", supportingText: "Creation itself is the reward.", resultSignal: "Creation motivation", scores: { mbti: { N: 3, P: 1 }, disc: { I: 2 }, bigFive: { O: 4 }, career: { creative: 4, autonomy: 2, entrepreneurship: 1 } } },
    ],
  },
  {
    id: 26,
    key: "tradeoff-tolerance",
    group: "Career-fit vector",
    signal: "Tolerated friction",
    prompt: "Every path has a downside. Which one would you accept for the right path?",
    guidance: "Pick the downside you could live with.",
    answers: [
      { id: "A", text: "Less certainty, if I get more freedom and a chance at a bigger reward.", supportingText: "Freedom and opportunity can justify risk.", resultSignal: "Autonomy-risk tolerance", scores: { mbti: { N: 1, P: 3 }, disc: { D: 2, I: 1 }, bigFive: { O: 3, N: -1 }, career: { autonomy: 4, entrepreneurship: 4 } } },
      { id: "B", text: "More routine if the work is stable and dependable.", supportingText: "Knowing what to expect is worth it to you.", resultSignal: "Stability-routine tolerance", scores: { mbti: { S: 3, J: 2 }, disc: { S: 3, C: 1 }, bigFive: { C: 2, O: -1 }, career: { stability: 4, operations: 2 } } },
      { id: "C", text: "More time with people, if the work makes a difference and feels connected.", supportingText: "Spending energy on people is worth it when it matters.", resultSignal: "Social-impact tolerance", scores: { mbti: { E: 2, F: 3 }, disc: { I: 2, S: 2 }, bigFive: { E: 2, A: 3 }, career: { people: 4, service: 3 } } },
      { id: "D", text: "Harder, more complicated work, if it is interesting to think about.", supportingText: "Hard thinking is worth it for problems that matter.", resultSignal: "Complexity tolerance", scores: { mbti: { I: 1, N: 2, T: 3 }, disc: { C: 3 }, bigFive: { O: 2, C: 1 }, career: { analysis: 4, systems: 3, deepFocus: 2 } } },
    ],
  },
  {
    id: 27,
    key: "strength-mirror",
    group: "Calibration",
    signal: "Strength mirror",
    prompt: "If someone described your strongest contribution, which would feel most accurate?",
    guidance: "Choose what others would notice about you most often.",
    answers: [
      { id: "A", text: "I bring clarity when things are confusing.", supportingText: "You help people make sense of a mess.", resultSignal: "Clarity contribution", scores: { mbti: { I: 1, T: 3, J: 1 }, disc: { C: 3 }, bigFive: { C: 2, O: 1 }, career: { analysis: 3, systems: 2 } } },
      { id: "B", text: "I get things moving again when they are stuck.", supportingText: "You help the group start moving again.", resultSignal: "Momentum contribution", scores: { mbti: { E: 2, T: 1, P: 1 }, disc: { D: 3, I: 1 }, bigFive: { E: 2 }, career: { leadership: 3, entrepreneurship: 2, pace: 2 } } },
      { id: "C", text: "I bring steadiness when things are stressful.", supportingText: "You help people and processes stabilize.", resultSignal: "Steadiness contribution", scores: { mbti: { S: 2, F: 1, J: 1 }, disc: { S: 4 }, bigFive: { A: 2, C: 2, N: -2 }, career: { stability: 3, service: 2, operations: 1 } } },
      { id: "D", text: "I bring new ideas when things feel boring or the same.", supportingText: "You help the group see new options.", resultSignal: "Originality contribution", scores: { mbti: { N: 3, P: 1 }, disc: { I: 2 }, bigFive: { O: 4 }, career: { creative: 4, autonomy: 1 } } },
    ],
  },
  {
    id: 28,
    key: "anti-fit-warning",
    group: "Calibration",
    signal: "Anti-fit warning",
    prompt: "Which kind of work would become frustrating fastest?",
    guidance: "Knowing what wears you out is as useful as knowing what you like.",
    answers: [
      { id: "A", text: "Work with constant interruption and little time to think.", supportingText: "Your best work needs protected attention.", resultSignal: "Avoid interruption-heavy roles", scores: { mbti: { I: 3, J: 1 }, disc: { C: 2 }, bigFive: { E: -2, C: 1 }, career: { deepFocus: 3, analysis: 1, people: -1, pace: -1 } } },
      { id: "B", text: "Work with rigid rules and no room to improve anything.", supportingText: "Being stuck with pointless rules wears you out fast.", resultSignal: "Avoid rigid-stagnant roles", scores: { mbti: { N: 2, P: 2 }, disc: { I: 1, D: 1 }, bigFive: { O: 3 }, career: { creative: 2, autonomy: 3, entrepreneurship: 1, stability: -1 } } },
      { id: "C", text: "Work with heavy conflict, pressure, or emotional tension.", supportingText: "Constant tension wears you down.", resultSignal: "Avoid chronic-conflict roles", scores: { mbti: { F: 2, I: 1 }, disc: { S: 3 }, bigFive: { A: 2, N: 2 }, career: { service: 1, stability: 2, leadership: -1, pace: -1 } } },
      { id: "D", text: "Work with vague expectations and no clear standard for success.", supportingText: "Not knowing what counts as good work is frustrating.", resultSignal: "Avoid vague-standard roles", scores: { mbti: { J: 3, T: 1 }, disc: { C: 3 }, bigFive: { C: 3, N: 1 }, career: { operations: 2, systems: 2, stability: 2, autonomy: -1 } } },
    ],
  },
];
