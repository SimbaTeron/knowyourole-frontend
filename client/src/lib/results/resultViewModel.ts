/**
 * One result view, built once from scoring output.
 *
 * Clarity, the headline, the type chip, the lead trait, stress lines, the
 * direction card and the role list are decided here. The results page, Big
 * Five tab, share card, share image and PDF render these fields. They do not
 * recompute them.
 *
 * The clarity *level* still comes from resolveFinalClarity (the one clarity
 * implementation). This module only decides what each level is allowed to show.
 */
import { getMbtiConfidence } from "@/lib/quiz/mbtiConfidence";
import { isScoringV3, isScoringV5 } from "@/lib/quiz/scoringVersions";
import { V5_STRESS_SHOW, lifeStageFromResponses, type LifeStage } from "@/lib/quiz/shortformV5Adjustments";
import { resolveFinalClarity, shouldShowStressSecondary, type FinalClarity } from "@/lib/results/finalClarity";
import { resultWording } from "@/lib/results/resultWording";
import { deriveWorkDirectionV5, type CareerFieldBlurb } from "@/lib/results/workDirectionV5";

export const TRAIT_LABELS = {
  O: "Openness",
  C: "Structure / Follow-through",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Stress Reactivity",
} as const;

export const DISC_LABELS: Record<string, string> = {
  D: "Dominant",
  I: "Influential",
  S: "Steady",
  C: "Conscientious",
};

export const BROAD_HEADLINE = "A broad, balanced pattern" as const;
export const NO_LEAD_CAPTION = "No single standout trait" as const;
export const SAMPLE_DIRECTION_TITLE = "Several directions are worth trying" as const;
export const SAMPLE_DIRECTION_BODY = "Your answers did not point strongly one way, so try a few of these and see which feels right." as const;

const ARCHETYPES: Record<string, string> = {
  INTJ: "The Architect", INTP: "The Logician", ENTJ: "The Commander", ENTP: "The Debater",
  INFJ: "The Advocate", INFP: "The Mediator", ENFJ: "The Protagonist", ENFP: "The Campaigner",
  ISTJ: "The Logistician", ISFJ: "The Defender", ESTJ: "The Executive", ESFJ: "The Caregiver",
  ISTP: "The Virtuoso", ISFP: "The Adventurer", ESTP: "The Entrepreneur", ESFP: "The Entertainer",
};

const MBTI_EMOJIS: Record<string, string> = {
  ISTJ: "📋", ISFJ: "🛡️", INFJ: "🔮", INTJ: "♟️",
  ISTP: "🔧", ISFP: "🎨", INFP: "🦋", INTP: "💡",
  ESTP: "⚡", ESFP: "🎉", ENFP: "✨", ENTP: "🗣️",
  ESTJ: "📈", ESFJ: "🤝", ENFJ: "☀️", ENTJ: "👑",
};

const SOCIAL_IDENTITY_TITLES: Record<string, string> = {
  INTJ: "Systems Builder",
  INTP: "Idea Mechanic",
  ENTJ: "Momentum Commander",
  ENTP: "Possibility Hacker",
  INFJ: "Pattern Guide",
  INFP: "Meaning Maker",
  ENFJ: "Community Catalyst",
  ENFP: "Spark Connector",
  ISTJ: "Reliable Detail Guardian",
  ISFJ: "Steady Support Anchor",
  ESTJ: "Execution Driver",
  ESFJ: "Care Connector",
  ISTP: "Practical Problem Solver",
  ISFP: "Quiet Craft Original",
  ESTP: "Fast Practical Operator",
  ESFP: "Energy Translator",
};

const STRESS_SUPPORT_TAIL = "That can mean you notice risk and care deeply — use supportive routines and smaller pressure steps rather than treating it as a problem to fix.";

export const STRESS_SUPPORT_TEXT = {
  high: `Stress sensitivity came out high. ${STRESS_SUPPORT_TAIL}`,
  moderate: `Stress sensitivity showed up at a moderate level. ${STRESS_SUPPORT_TAIL}`,
} as const;

export const STRESS_SECONDARY_TEXT = {
  high: {
    lead: "Stress Reactivity came out high. You may feel pressure more than other people can see — build in recovery time and break big tasks into smaller steps.",
    second: "Second signal: Stress Reactivity is also high. You may push hard on the outside while feeling pressure on the inside — build in recovery and smaller pressure steps.",
  },
  moderate: {
    second: "Second signal: Stress Reactivity showed up too. You may feel pressure more than you show — build in recovery time and take big tasks in smaller steps.",
  },
} as const;

const BIG_FIVE_LEAD = {
  none: "No single Big Five trait stands out: your traits landed close together, so read them as light leans.",
  blend: (label: string) => `Your leading Big Five signals are ${label}, which came out close together. That does not define your entire personality, but it may shape where your effort tends to pay off.`,
  single: (label: string) => `Your leading Big Five signal is ${label}. That does not define your entire personality, but it may shape where your effort tends to pay off.`,
} as const;

export type TraitKey = keyof typeof TRAIT_LABELS;
export type TraitLabel = (typeof TRAIT_LABELS)[TraitKey];
export type ClarityLevel = "clear" | "mixed" | "broad";
export type LeanBand = "Strong lean" | "Moderate lean" | "Balanced" | "Light lean";

/** A trait strong enough to name. Below 55 the meter says Balanced, and that word is not a trait. */
export type NamedTrait = {
  readonly key: TraitKey;
  readonly label: TraitLabel;
  readonly score: number;
  readonly band: "moderate" | "strong";
  readonly meter: "Moderate lean" | "Strong lean";
  readonly phrase: `high ${string}` | `a lean toward ${string}`;
};

export type LeadTraits =
  | {
      readonly kind: "single";
      readonly trait: NamedTrait;
      readonly label: TraitLabel;
      readonly statLabel: "Top trait";
      readonly statBand: "Moderate lean" | "Strong lean";
      readonly caption: TraitLabel;
    }
  | {
      readonly kind: "blend";
      readonly traits: readonly [NamedTrait, NamedTrait];
      readonly label: string;
      readonly statLabel: "Top traits";
      readonly statBand: "Moderate lean" | "Strong lean";
      readonly caption: string;
    }
  | {
      readonly kind: "relative";
      /** Highest trait on a Clear result that did not cross the named-trait line (55). */
      readonly trait: { readonly key: TraitKey; readonly label: TraitLabel; readonly score: number };
      readonly label: TraitLabel;
      readonly statLabel: "Top trait";
      readonly statBand: "Balanced" | "Light lean";
      readonly caption: TraitLabel;
    }
  | {
      readonly kind: "none";
      readonly statLabel: "Top trait";
      readonly statBand: "Balanced";
      readonly caption: typeof NO_LEAD_CAPTION;
    };

/** A Clear result names its strongest trait. It cannot use the empty lead. */
export type ClearLead = Exclude<LeadTraits, { kind: "none" }>;

export type StressSecondary =
  | { readonly band: "high"; readonly role: "lead" | "second"; readonly text: string }
  | { readonly band: "moderate"; readonly role: "second"; readonly text: string };

export type StressSupport = {
  readonly band: "high" | "moderate";
  readonly text: string;
};

export type ClarityNote = {
  readonly kind: ClarityLevel | "flat";
  readonly heading: string;
  readonly body: string;
  /** Big Five tab line: heading, a period unless the note is the flat-pattern kind, then the body. */
  readonly inline: string;
};

export type SampleDirection = {
  readonly kind: "sample";
  readonly eyebrow: "Directions to sample";
  readonly title: typeof SAMPLE_DIRECTION_TITLE;
  readonly body: typeof SAMPLE_DIRECTION_BODY;
  readonly exploreLabel: "Try exploring";
  readonly titles: readonly string[];
  readonly shareTitle: string;
};

export type FocusedDirection = {
  readonly kind: "focused";
  readonly eyebrow: "A direction worth testing";
  readonly title: string;
  readonly rationale: string;
  readonly examplesHeader: "Examples" | "Directions to sample";
  readonly roleHeader: "Roles to look into" | "Directions to sample";
  readonly examples: readonly string[];
  readonly alsoExplore: readonly string[];
  readonly shareTitle: string;
};

/** Open sections on the simplified results page. Detail labels stay out of these strings. */
export const RESULT_SECTION_HEADINGS = {
  work: "How you work best",
  careers: "Good-fit careers",
  week: "Try this week",
  watch: "One thing to watch",
} as const;

/** Collapsed detail sections. The button label is the only text shown until opened. */
export const RESULT_DISCLOSURE_LABELS = {
  labels: "Style labels",
  scores: "Trait scores",
  roles: "More career ideas",
  method: "How this result was read",
} as const;

export type ResultPageCopy = {
  readonly summary: string;
  readonly workBest: string;
  readonly careers: readonly CareerFieldBlurb[];
  readonly thisWeek: readonly string[];
  /** Plain pressure note. Null when stress did not rise high enough to mention. */
  readonly watch: string | null;
};

type SharedView = {
  readonly mbtiType: string;
  readonly lightLeanLetters: readonly string[];
  readonly typeBadge: string;
  readonly typeNote: string;
  readonly discCode: string;
  readonly discLabel: string;
  readonly whyLine: string;
  readonly clarityNote: ClarityNote;
  readonly lead: LeadTraits;
  readonly bigFiveLead: string;
  readonly stressSecondary: StressSecondary | null;
  readonly stressSupport: StressSupport | null;
  readonly roles: readonly string[];
  readonly direction: SampleDirection | FocusedDirection;
  readonly workDirectionBroad: boolean;
  readonly isV5Direction: boolean;
  readonly nextSteps: readonly string[];
  readonly page: ResultPageCopy;
  readonly traitMeters: readonly { key: TraitKey; label: TraitLabel; band: LeanBand; score: number }[];
  readonly shareEyebrow: "Directions to sample" | "A direction worth testing";
  readonly shareTitle: string;
  readonly shareMeta: string;
  readonly imageTraitLine: string;
  readonly pdfTraitLine: string;
  readonly pdfArchetype: string;
  readonly pdfSubtitle: string;
  readonly bigFiveSubtitle: string;
  readonly bigFiveReportBody: string;
  readonly ogTitle: string;
  readonly ogDescription: string;
};

type IdentityFields = {
  readonly headline: string;
  readonly archetype: string;
  readonly chipSuffix: string;
  readonly mindCaption: string;
  readonly emoji: string;
  readonly showCrown: true;
};

export type ClearView = Omit<SharedView, "lead"> & IdentityFields & {
  readonly clarity: "clear";
  readonly lead: ClearLead;
};

export type MixedView = SharedView & IdentityFields & {
  readonly clarity: "mixed";
};

/** @deprecated Use ClearView | MixedView. Kept so older imports still name the pair. */
export type ClearOrMixedView = ClearView | MixedView;

export type BroadView = SharedView & {
  readonly clarity: "broad";
  readonly headline: typeof BROAD_HEADLINE;
  readonly leaningPattern: `${string}-leaning pattern`;
  readonly chipSuffix: `${string}-leaning pattern`;
  readonly mindCaption: "leaning pattern";
  readonly emoji: "◈";
  readonly showCrown: false;
};

export type ResultView = ClearView | MixedView | BroadView;

export type ResultDirectionInput = {
  laneKey?: string;
  title: string;
  rationale: string;
  examples: ReadonlyArray<{ title: string } | string>;
  nextSteps?: readonly string[];
  /**
   * Present only when a v5 server direction was stored.
   * "" means the server sent no answer note, so the client note is not used.
   */
  serverAnswerNote?: string;
};

export type ResultViewInput = {
  bigFive: Record<TraitKey, number>;
  disc?: Partial<Record<"D" | "I" | "S" | "C", number>>;
  mbtiType: string;
  primaryDisc: string;
  scoringVersion?: string | null;
  responses?: ReadonlyArray<{ questionId?: unknown; choice?: unknown; timeSpent?: unknown }> | null;
  career?: Partial<Record<string, number>> | null;
  mbtiScores?: Record<string, number> | null;
  direction: ResultDirectionInput;
  /** Non-v5 lane labels after the primary, already in display order. */
  extraLaneLabels?: readonly string[];
  /** Non-v5 adjacent role titles. Deduped here against the direction examples. */
  adjacentTitles?: readonly string[];
};

type VersionedLike = {
  scoringVersion: string;
  mbtiType: string;
  mbtiDisplay: string;
  discPrimary: string;
  calibrated: {
    bigFive: Record<TraitKey, number>;
    disc: Record<"D" | "I" | "S" | "C", number>;
    career: Partial<Record<string, number>>;
    mbti: Record<string, number>;
  };
  raw?: { mbti?: Record<string, number> };
  direction: { laneKey?: string; title: string; examples: string[] };
  v5Direction?: {
    laneKey: string;
    title: string;
    rationale: string;
    examples: string[];
    nextSteps?: string[];
  };
  /** v5 answer note stored on the result. "" means the page must not invent one. */
  clarityNote?: string;
};

export function leanBand(value: number): LeanBand {
  if (value >= 70) return "Strong lean";
  if (value >= 55) return "Moderate lean";
  if (value >= 45) return "Balanced";
  return "Light lean";
}

export function humanizeResultLabel(label: string) {
  return label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingThe(label: string) {
  return label.replace(/^The\s+/i, "");
}

export function uniqueTitles(titles: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of titles) {
    const title = String(raw ?? "").trim();
    const key = title.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(title);
  }
  return out;
}

function exampleTitle(example: { title: string } | string): string {
  return typeof example === "string" ? example : example.title;
}

function namedTrait(key: TraitKey, score: number): NamedTrait | null {
  if (!(score >= 55)) return null;
  const band = score >= 70 ? "strong" : "moderate";
  const label = TRAIT_LABELS[key];
  const lower = label.toLowerCase();
  const phrase = (band === "strong" ? `high ${lower}` : `a lean toward ${lower}`) as NamedTrait["phrase"];
  return {
    key,
    label,
    score,
    band,
    meter: band === "strong" ? "Strong lean" : "Moderate lean",
    phrase,
  };
}

function traitBlocked(key: TraitKey, mbtiType: string): boolean {
  return key === "E" && mbtiType.startsWith("I");
}

function summaryLine(opts: {
  roleTitle: string;
  identity: string;
  mbtiType: string;
  discLabel: string;
  topTraitPhrase: string;
  broad: boolean;
  workClear: boolean;
  sampleTitles: readonly string[];
}) {
  const workStyle = `${/^[aeiou]/i.test(opts.discLabel) ? "an" : "a"} ${opts.discLabel.toLowerCase()} work style`;
  if (opts.broad && opts.workClear) {
    return `A broad, balanced personality pattern, but your work answers pointed clearly to ${opts.roleTitle.toLowerCase()}. Your answers leaned a little toward the ${opts.mbtiType} type and ${workStyle}.`;
  }
  if (/^several directions/i.test(opts.roleTitle)) {
    return `${opts.broad ? "A broad, balanced pattern. " : ""}Several directions are worth trying${opts.sampleTitles.length ? `, such as ${opts.sampleTitles.slice(0, 3).map((title) => title.toLowerCase()).join(", ")}` : ""}. Your answers leaned a little toward the ${opts.mbtiType} type and ${workStyle}.`;
  }
  if (opts.broad) {
    return `A broad, balanced pattern. Several directions are worth trying, including ${opts.roleTitle.toLowerCase()}. Your answers leaned a little toward the ${opts.mbtiType} type and ${workStyle}.`;
  }
  const traitPart = opts.topTraitPhrase ? `, ${workStyle}, and ${opts.topTraitPhrase}` : ` and ${workStyle}`;
  return `${opts.identity}. A direction worth testing: ${opts.roleTitle}. Your strongest signals are the ${opts.mbtiType} type${traitPart}.`;
}

function stressBand(score: number): "high" | "moderate" | "low" {
  if (score >= 70) return "high";
  if (score >= 55) return "moderate";
  return "low";
}

function buildLead(bigFive: Record<TraitKey, number>, mbtiType: string, clarity: FinalClarity["display"]["clarity"]): LeadTraits {
  const ranked = (Object.entries(bigFive) as [TraitKey, number][])
    .filter((entry): entry is [TraitKey, number] => entry[0] in TRAIT_LABELS)
    .sort((a, b) => b[1] - a[1]);
  const qualifying = ranked
    .map(([key, score]) => (traitBlocked(key, mbtiType) ? null : namedTrait(key, score)))
    .filter((trait): trait is NamedTrait => trait !== null);
  const lead = qualifying[0];
  if (!lead) {
    return { kind: "none", statLabel: "Top trait", statBand: "Balanced", caption: NO_LEAD_CAPTION };
  }
  const secondKey = clarity.secondKey as TraitKey;
  const secondScore = Number(bigFive[secondKey] ?? 0);
  const second = secondKey in TRAIT_LABELS ? namedTrait(secondKey, secondScore) : null;
  const secondAllowed = Boolean(second) && !traitBlocked(secondKey, mbtiType);
  if (lead.key === clarity.topKey && clarity.blended && second && secondAllowed && second.key !== lead.key) {
    const label = `${TRAIT_LABELS[lead.key]} + ${TRAIT_LABELS[second.key]}`;
    return {
      kind: "blend",
      traits: [lead, second],
      label,
      statLabel: "Top traits",
      statBand: lead.meter,
      caption: label,
    };
  }
  return {
    kind: "single",
    trait: lead,
    label: lead.label,
    statLabel: "Top trait",
    statBand: lead.meter,
    caption: lead.label,
  };
}

function relativeLead(bigFive: Record<TraitKey, number>, mbtiType: string): ClearLead {
  const ranked = (Object.keys(TRAIT_LABELS) as TraitKey[])
    .filter((key) => !traitBlocked(key, mbtiType))
    .map((key) => [key, Number(bigFive[key] ?? 0)] as const)
    .sort((a, b) => b[1] - a[1]);
  const [key, score] = ranked[0];
  const named = namedTrait(key, score);
  if (named) {
    return {
      kind: "single",
      trait: named,
      label: named.label,
      statLabel: "Top trait",
      statBand: named.meter,
      caption: named.label,
    };
  }
  const label = TRAIT_LABELS[key];
  return {
    kind: "relative",
    trait: { key, label, score },
    label,
    statLabel: "Top trait",
    statBand: score >= 45 ? "Balanced" : "Light lean",
    caption: label,
  };
}

function asClearLead(lead: LeadTraits): ClearLead {
  if (lead.kind === "none") {
    throw new Error("A clear result cannot say there is no standout trait.");
  }
  return lead;
}

function leadPhrase(lead: LeadTraits): string {
  if (lead.kind === "none" || lead.kind === "relative") return "";
  if (lead.kind === "single") return lead.trait.phrase;
  return lead.traits[0].phrase;
}

function bigFiveSentence(lead: LeadTraits): string {
  if (lead.kind === "none") return BIG_FIVE_LEAD.none;
  if (lead.kind === "blend") return BIG_FIVE_LEAD.blend(lead.label);
  return BIG_FIVE_LEAD.single(lead.label);
}

const DISC_PLAIN: Record<string, string> = {
  D: "You like to take the lead and get things moving",
  I: "You like being around people and keeping the energy up",
  S: "You like a steady pace and staying with what you start",
  C: "You like clear steps and getting the details right",
};

const WORK_LEAD: Record<"D" | "I" | "S" | "C", string> = {
  D: "You do better when you can decide and move, instead of waiting through a long discussion.",
  I: "You do better with people around and a chance to talk the idea out.",
  S: "You do better at a steady pace, with people you trust and a plan that stays put.",
  C: "You do better when the steps are clear and you can finish what you start.",
};

const WORK_STAGE: Record<"teen" | "college" | "adult", Record<"D" | "I" | "S" | "C", string>> = {
  teen: {
    D: "In class or a club, offer to run one part of the project and set the next step.",
    I: "Study or practice with someone else when you can. Talking it out helps you start.",
    S: "A set time for homework, with the same routine, will fit you better than rushing at the end.",
    C: "Write a short checklist for the assignment and leave time to look it over before you turn it in.",
  },
  college: {
    D: "In a group project, be the person who picks the deadline and the next step.",
    I: "Use a study group, club, or office hours when a class feels stuck.",
    S: "Put a weekly study block on your calendar. A steady plan will beat a last-minute cram.",
    C: "Turn the assignment into a checklist and leave time to proof it before you submit.",
  },
  adult: {
    D: "Ask to own one decision this week instead of waiting for a perfect plan.",
    I: "Talk the task through with someone, then do a piece of it while it is still clear.",
    S: "Keep a steady rhythm. You do better when the plan is not changing every hour.",
    C: "Write the steps down and finish one before you start the next.",
  },
};

const WATCH_COPY: Record<"teen" | "college" | "adult" | "unknown", string> = {
  teen: "Pressure can pile up with school. Work in shorter blocks, and take a real break before you are wiped out.",
  college: "Pressure can pile up around exams and deadlines. Work in shorter blocks, and plan a real break before you are wiped out.",
  adult: "Pressure can pile up at work. Work in shorter blocks, and take a real break before you are wiped out.",
  unknown: "Pressure can pile up. Work in shorter blocks, and take a real break before you are wiped out.",
};

const WEEK_FALLBACK = "Pick one career above and spend half an hour learning what a normal day in it looks like.";

function discKey(code: string): "D" | "I" | "S" | "C" {
  return code === "D" || code === "I" || code === "S" || code === "C" ? code : "C";
}

function stageBucket(stage: LifeStage): "teen" | "college" | "adult" | "unknown" {
  if (stage === "middle" || stage === "high") return "teen";
  if (stage === "college") return "college";
  if (stage === "adult") return "adult";
  return "unknown";
}

function summarySentence(discCode: string, discLabel: string, title: string, several: boolean): string {
  const lead = DISC_PLAIN[discCode] ?? `You tend to work in a ${discLabel.toLowerCase()} way`;
  if (several) return `${lead}, and your answers were close enough that a few kinds of work are worth trying.`;
  return `${lead}, and the closest work fit from your answers is ${title}.`;
}

function workBestCopy(discCode: string, stage: LifeStage): string {
  const key = discKey(discCode);
  const bucket = stageBucket(stage);
  const extra = bucket === "unknown"
    ? "Pick one task this week and finish it before you add another."
    : WORK_STAGE[bucket][key];
  return `${WORK_LEAD[key]} ${extra}`;
}

function watchCopy(stage: LifeStage, show: boolean): string | null {
  if (!show) return null;
  return WATCH_COPY[stageBucket(stage)];
}

function legacyCareerFields(title: string, examples: readonly string[], rationale: string): CareerFieldBlurb[] {
  const cleanTitle = title.trim();
  const second = examples.find((item) => item.toLowerCase() !== cleanTitle.toLowerCase());
  const fields: CareerFieldBlurb[] = [
    { name: cleanTitle || "A direction to try", reason: rationale.trim() || "This matched your answers more than the other options." },
  ];
  if (second) fields.push({ name: second, reason: "This was the next closest match in your answers." });
  return fields;
}

export function buildResultView(input: ResultViewInput): ResultView {
  const mbtiType = input.mbtiType || "XXXX";
  const scoringVersion = input.scoringVersion ?? null;
  const v3 = isScoringV3(scoringVersion);
  const career = input.career ?? undefined;
  const maxCareer = career ? Math.max(0, ...Object.values(career).map((n) => Number(n) || 0)) : undefined;
  const finalClarity = resolveFinalClarity(
    input.bigFive as unknown as Record<string, number>,
    input.responses,
    scoringVersion,
    maxCareer,
    career,
  );
  const clarity = finalClarity.display.clarity;
  const level = finalClarity.level;
  const fullArchetype = humanizeResultLabel(ARCHETYPES[mbtiType] || "The Architect");
  const strippedArchetype = stripLeadingThe(fullArchetype);
  const identity = humanizeResultLabel(SOCIAL_IDENTITY_TITLES[mbtiType] || `${strippedArchetype} Builder`);
  const discLabel = DISC_LABELS[input.primaryDisc] || input.primaryDisc;
  const laneKey = input.direction.laneKey ?? "";
  const isV5Direction = laneKey.startsWith("v5:");
  const workDirectionBroad = isV5Direction ? laneKey === "v5:broad" : v3 && level === "broad";
  const examples = uniqueTitles(input.direction.examples.map(exampleTitle));
  const exampleKeys = new Set(examples.map((title) => title.toLowerCase()));
  const alsoExplore = isV5Direction
    ? []
    : uniqueTitles(input.extraLaneLabels ?? []).filter((title) => !exampleKeys.has(title.toLowerCase()) && title.toLowerCase() !== input.direction.title.trim().toLowerCase());
  const adjacent = uniqueTitles(input.adjacentTitles ?? []).filter((title) => !exampleKeys.has(title.toLowerCase()) && title.toLowerCase() !== input.direction.title.trim().toLowerCase());
  const samplePool = isV5Direction
    ? examples.slice(0, 3)
    : uniqueTitles([input.direction.title, ...alsoExplore, ...adjacent]).slice(0, 3);

  const builtLead = buildLead(input.bigFive, mbtiType, clarity);
  // Clear means the strongest trait stood out. Name that trait even when it
  // stayed under 55, so the page cannot also say nothing stood out.
  const lead: LeadTraits = level === "clear" && builtLead.kind === "none"
    ? relativeLead(input.bigFive, mbtiType)
    : builtLead;
  const rankedTop = (Object.entries(input.bigFive) as [TraitKey, number][])
    .filter(([key]) => key in TRAIT_LABELS)
    .sort((a, b) => b[1] - a[1])[0];
  const stressValue = Number(input.bigFive.N ?? 0);
  const stressIsNumericTop = rankedTop?.[0] === "N";
  const roughSketch = finalClarity.v5
    ? Boolean(finalClarity.v5.quickOrScattered) && level !== "clear"
    : false;
  // v5 hides the stress lines on a rough sketch. Older versions still show them.
  const suppressStressCopy = Boolean(finalClarity.v5) && roughSketch;

  const serverNote = input.direction.serverAnswerNote;
  const inconsistencyNote = finalClarity.v5
    ? (serverNote !== undefined ? serverNote : (finalClarity.v5Note ?? "")) || (finalClarity.report?.guarded ? finalClarity.report.note : "")
    : finalClarity.report && (finalClarity.report.flagged || finalClarity.report.guarded) ? finalClarity.report.note : "";
  const mbtiScores = input.mbtiScores ?? {};
  const hasMbtiScores = ["E", "I", "S", "N", "T", "F", "J", "P"].every((key) => typeof mbtiScores[key] === "number");
  const confidence = v3 && hasMbtiScores
    ? getMbtiConfidence(mbtiScores, finalClarity.rawMbti, { broad: level === "broad", displayType: mbtiType })
    : v3 && level === "broad"
      ? { type: mbtiType, weakAxes: [] as string[], lightLeanLetters: [] as string[], note: "This type is a directional sketch — your trait pattern was broad, so treat it as a starting point, not a hard label.", badge: "directional sketch" }
      : { type: mbtiType, weakAxes: [] as string[], lightLeanLetters: [] as string[], note: "", badge: "" };
  if (inconsistencyNote) confidence.note = inconsistencyNote;
  const showRoughBadge = finalClarity.v5 ? roughSketch : Boolean(inconsistencyNote);
  if (showRoughBadge && !confidence.badge) confidence.badge = "rough sketch";

  const closeAxisLetters = v3 && hasMbtiScores
    ? ([["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]] as const).flatMap(([a, b], index) => {
        const dominant = mbtiType[index];
        const total = (mbtiScores[a] ?? 50) + (mbtiScores[b] ?? 50) || 1;
        return ((mbtiScores[dominant] ?? 50) / total) * 100 < 55 ? [dominant] : [];
      })
    : [];
  const lightLeanLetters = uniqueTitles([...(v3 ? confidence.lightLeanLetters : []), ...closeAxisLetters]).filter((letter) => mbtiType.includes(letter));
  if (closeAxisLetters.some((letter) => !confidence.lightLeanLetters.includes(letter))) {
    if (!confidence.badge) {
      const axisOf = (letter: string) => (["E", "I"].includes(letter) ? "E/I" : ["S", "N"].includes(letter) ? "S/N" : ["T", "F"].includes(letter) ? "T/F" : "J/P");
      confidence.badge = lightLeanLetters.length === 1 ? `light lean on ${axisOf(lightLeanLetters[0])}` : "some light leans";
    }
  }

  const wording = resultWording({
    clarityLevel: level,
    directionBroad: workDirectionBroad,
    mbtiType,
    identity,
    arch: strippedArchetype,
  });
  const whyLine = summaryLine({
    roleTitle: input.direction.title,
    identity,
    mbtiType,
    discLabel,
    topTraitPhrase: leadPhrase(lead),
    broad: level === "broad",
    workClear: isV5Direction && !workDirectionBroad,
    sampleTitles: examples,
  });

  const stressInLead = lead.kind !== "none" && lead.label.includes(TRAIT_LABELS.N);
  let stressSecondary: StressSecondary | null = null;
  if (shouldShowStressSecondary(input.bigFive as unknown as Record<string, number>, scoringVersion) && !suppressStressCopy && !stressInLead) {
    const band = stressBand(stressValue);
    if (band === "high" && stressIsNumericTop) {
      stressSecondary = { band: "high", role: "lead", text: STRESS_SECONDARY_TEXT.high.lead };
    } else if (band === "high") {
      stressSecondary = { band: "high", role: "second", text: STRESS_SECONDARY_TEXT.high.second };
    } else {
      stressSecondary = { band: "moderate", role: "second", text: STRESS_SECONDARY_TEXT.moderate.second };
    }
  }

  const supportFloor = finalClarity.v5 ? V5_STRESS_SHOW : 67;
  const stressSupport: StressSupport | null = v3 && stressValue >= supportFloor && !suppressStressCopy
    ? stressValue >= 70
      ? { band: "high", text: STRESS_SUPPORT_TEXT.high }
      : { band: "moderate", text: STRESS_SUPPORT_TEXT.moderate }
    : null;

  const note = finalClarity.display;
  const clarityNote: ClarityNote = {
    kind: note.kind,
    heading: note.heading,
    body: note.body,
    inline: `${note.heading}${note.kind === "flat" ? "" : "."} ${note.body}`,
  };

  const useSampleCard = level === "broad" && workDirectionBroad;
  const direction: SampleDirection | FocusedDirection = useSampleCard
    ? {
        kind: "sample",
        eyebrow: "Directions to sample",
        title: SAMPLE_DIRECTION_TITLE,
        body: SAMPLE_DIRECTION_BODY,
        exploreLabel: "Try exploring",
        titles: samplePool,
        shareTitle: samplePool.join(" · "),
      }
    : {
        kind: "focused",
        eyebrow: "A direction worth testing",
        title: input.direction.title,
        rationale: input.direction.rationale,
        examplesHeader: workDirectionBroad ? "Directions to sample" : "Examples",
        roleHeader: workDirectionBroad ? "Directions to sample" : "Roles to look into",
        examples,
        alsoExplore,
        shareTitle: input.direction.title,
      };

  const shareTitle = workDirectionBroad ? samplePool.join(" · ") : input.direction.title;
  const shareEyebrow = workDirectionBroad ? "Directions to sample" as const : "A direction worth testing" as const;
  const shownType = level === "broad" ? `${mbtiType}-leaning pattern` : mbtiType;
  const shareMeta = `${shownType} · ${discLabel} · ${lead.kind === "none" ? NO_LEAD_CAPTION : lead.caption}`;
  const imageTraitLine = lead.kind === "none" ? NO_LEAD_CAPTION : `${lead.caption} · ${lead.statBand}`;
  const pdfTraitLine = lead.kind === "none"
    ? NO_LEAD_CAPTION
    : lead.kind === "blend"
      ? lead.caption
      : `${lead.trait.label} ${Math.round(lead.trait.score)}%`;
  const pdfArchetype = level === "broad" ? `${mbtiType}-leaning pattern` : fullArchetype;
  const pdfSubtitle = level === "broad" ? `${mbtiType}-leaning pattern` : `${mbtiType} — ${fullArchetype}`;
  const bigFiveSubtitle = lead.kind === "none" ? NO_LEAD_CAPTION : `${lead.caption} · ${lead.statBand.toLowerCase()}`;
  const roles = uniqueTitles([
    ...examples,
    ...(direction.kind === "sample" ? direction.titles : direction.alsoExplore),
    ...adjacent,
  ]);
  const traitMeters = (Object.keys(TRAIT_LABELS) as TraitKey[])
    .map((key) => ({ key, label: TRAIT_LABELS[key], score: Number(input.bigFive[key] ?? 0) }))
    .sort((a, b) => b.score - a.score)
    .map((trait) => ({ ...trait, band: leanBand(trait.score) }));

  const stage = lifeStageFromResponses(input.responses);
  const pageSteps = (isV5Direction ? uniqueTitles([...(input.direction.nextSteps ?? [])]) : []).slice(0, 3);
  const several = workDirectionBroad || /^several directions/i.test(direction.title);
  const shownCareerNames = direction.kind === "sample" ? direction.titles : direction.examples;
  const careers = isV5Direction && input.career && isScoringV5(scoringVersion)
    ? deriveWorkDirectionV5(input.career, stage, {
        broad: level === "broad",
        forceBroad: Boolean(finalClarity.v5?.randomLike || (finalClarity.v5?.fast && finalClarity.v5?.quickOrScattered)),
        entrepreneurship: Number(input.career.entrepreneurship ?? 0),
      }).closestFields
    : legacyCareerFields(
        direction.title,
        shownCareerNames,
        direction.kind === "focused" ? direction.rationale : direction.body,
      );
  const page: ResultPageCopy = {
    summary: summarySentence(input.primaryDisc, discLabel, direction.title, several),
    workBest: workBestCopy(input.primaryDisc, stage),
    careers,
    thisWeek: pageSteps.length > 0 ? pageSteps : [WEEK_FALLBACK],
    watch: watchCopy(stage, Boolean(stressSecondary || stressSupport)),
  };

  const shared: SharedView = {
    mbtiType,
    lightLeanLetters,
    typeBadge: v3 ? confidence.badge : "",
    typeNote: v3 ? confidence.note : "",
    discCode: input.primaryDisc,
    discLabel,
    whyLine,
    clarityNote,
    lead,
    bigFiveLead: bigFiveSentence(lead),
    stressSecondary,
    stressSupport,
    roles,
    direction,
    workDirectionBroad,
    isV5Direction,
    nextSteps: isV5Direction ? uniqueTitles([...(input.direction.nextSteps ?? [])]) : [],
    page,
    traitMeters,
    shareEyebrow,
    shareTitle,
    shareMeta,
    imageTraitLine,
    pdfTraitLine,
    pdfArchetype,
    pdfSubtitle,
    bigFiveSubtitle,
    bigFiveReportBody: `Big Five is your climate report: the trait environment you operate inside. ${clarityNote.inline}`,
    ogTitle: wording.headline,
    ogDescription: whyLine,
  };

  if (level === "broad") {
    const leaningPattern = `${mbtiType}-leaning pattern` as `${string}-leaning pattern`;
    return {
      ...shared,
      clarity: "broad",
      headline: BROAD_HEADLINE,
      leaningPattern,
      chipSuffix: leaningPattern,
      mindCaption: "leaning pattern",
      emoji: "◈",
      showCrown: false,
      ogTitle: BROAD_HEADLINE,
    };
  }

  const identityView = {
    headline: identity,
    archetype: strippedArchetype,
    chipSuffix: strippedArchetype,
    mindCaption: strippedArchetype,
    emoji: MBTI_EMOJIS[mbtiType] || "◈",
    showCrown: true as const,
    ogTitle: identity,
  };
  if (level === "clear") {
    return { ...shared, ...identityView, clarity: "clear", lead: asClearLead(lead) };
  }
  return { ...shared, ...identityView, clarity: "mixed" };
}

/** Build the view from a versioned scoring result. Tests and harnesses use this. */
export function buildResultViewFromVersioned(
  scored: VersionedLike,
  responses: ReadonlyArray<{ questionId?: unknown; choice?: unknown; timeSpent?: unknown }>,
): ResultView {
  const v5 = scored.v5Direction;
  return buildResultView({
    bigFive: scored.calibrated.bigFive,
    disc: scored.calibrated.disc,
    mbtiType: scored.mbtiDisplay || scored.mbtiType,
    primaryDisc: scored.discPrimary,
    scoringVersion: scored.scoringVersion,
    responses,
    career: scored.calibrated.career,
    mbtiScores: scored.calibrated.mbti,
    direction: v5
      ? {
          laneKey: v5.laneKey,
          title: v5.title,
          rationale: v5.rationale,
          examples: v5.examples,
          nextSteps: v5.nextSteps,
          serverAnswerNote: scored.clarityNote ?? "",
        }
      : {
          laneKey: scored.direction.laneKey,
          title: scored.direction.title,
          rationale: "",
          examples: scored.direction.examples,
        },
  });
}

/** Stable, screen-order text of the copy a person actually reads. */
export function renderResultCopy(view: ResultView): string {
  const leadStat = `${view.lead.statLabel}: ${view.lead.statBand} / ${view.lead.caption}`;
  const directionBlock = view.direction.kind === "sample"
    ? [
        `direction: sample`,
        `direction title: ${view.direction.title}`,
        `direction body: ${view.direction.body}`,
        `explore: ${view.direction.titles.join(" | ")}`,
      ]
    : [
        `direction: focused`,
        `direction title: ${view.direction.title}`,
        `direction why: ${view.direction.rationale}`,
        `examples header: ${view.direction.examplesHeader}`,
        `examples: ${view.direction.examples.join(" | ")}`,
        `also explore: ${view.direction.alsoExplore.join(" | ")}`,
        `role header: ${view.direction.roleHeader}`,
      ];
  const lines = [
    `clarity: ${view.clarity}`,
    `headline: ${view.headline}`,
    `page summary: ${view.page.summary}`,
    `page work: ${view.page.workBest}`,
    `page careers: ${view.page.careers.map((field) => `${field.name} — ${field.reason}`).join(" | ")}`,
    `page week: ${view.page.thisWeek.join(" | ")}`,
    `page watch: ${view.page.watch ?? ""}`,
    `emoji: ${view.emoji}`,
    `chip: ${view.mbtiType} ${view.chipSuffix}`,
    `badge: ${view.typeBadge}`,
    `mind: ${view.mbtiType} / ${view.mindCaption}`,
    `light leans: ${view.lightLeanLetters.join("")}`,
    `type note: ${view.typeNote}`,
    `work style: ${view.discCode} ${view.discLabel}`,
    `lead: ${leadStat}`,
    `snapshot: ${view.whyLine}`,
    ...directionBlock,
    `next steps: ${view.nextSteps.join(" | ")}`,
    `clarity heading: ${view.clarityNote.heading}`,
    `clarity body: ${view.clarityNote.body}`,
    `stress: ${view.stressSecondary?.text ?? ""}`,
    `stress support: ${view.stressSupport?.text ?? ""}`,
    `big five: ${view.bigFiveLead}`,
    `big five clarity: ${view.clarityNote.inline}`,
    `share eyebrow: ${view.shareEyebrow}`,
    `share title: ${view.shareTitle}`,
    `share meta: ${view.shareMeta}`,
    `image trait: ${view.imageTraitLine}`,
    `pdf trait: ${view.pdfTraitLine}`,
    `pdf archetype: ${view.pdfArchetype}`,
    `pdf subtitle: ${view.pdfSubtitle}`,
    `roles: ${view.roles.join(" | ")}`,
  ];
  return lines.join("\n");
}

const BANNED_LEAD = /balanced/i;

/** Returns human-readable violations. An empty list means the view is internally consistent. */
export function resultViewViolations(view: ResultView): string[] {
  const problems: string[] = [];
  const push = (ok: boolean, message: string) => {
    if (!ok) problems.push(message);
  };

  if (view.clarity === "broad") {
    push(view.headline === BROAD_HEADLINE, "broad headline");
    push(view.emoji === "◈" && view.showCrown === false, "broad still shows a crown or type emoji");
    push(!("archetype" in view), "broad view still carries an archetype");
    push(view.leaningPattern === `${view.mbtiType}-leaning pattern`, "leaning pattern does not match the type letters");
    push(view.chipSuffix === view.leaningPattern, "chip does not use the leaning pattern");
    push(view.mindCaption === "leaning pattern", "mind caption is not the leaning pattern");
    push(!view.headline.includes("Commander") && !/The [A-Z]/.test(view.chipSuffix), "broad chip still names an archetype");
  } else {
    push(view.headline !== BROAD_HEADLINE, "clear/mixed uses the broad headline");
    push(view.showCrown === true, "clear/mixed hides the type mark");
    push(!view.chipSuffix.endsWith("-leaning pattern"), "clear/mixed chip says leaning pattern");
    push(view.headline.length > 0 && view.archetype.length > 0, "missing identity or archetype");
    push(!view.whyLine.startsWith("A broad, balanced"), "clear/mixed snapshot uses broad wording");
  }

  if (view.lead.kind === "none") {
    push(view.lead.caption === NO_LEAD_CAPTION && view.lead.statBand === "Balanced", "empty lead is not the standout caption");
    push(!BANNED_LEAD.test(view.bigFiveLead) || view.bigFiveLead.startsWith("No single"), "empty lead is described as a Balanced trait");
  } else if (view.lead.kind === "relative") {
    push(view.clarity === "clear", "relative lead is only for a clear result");
    push(view.lead.trait.score < 55, "relative lead crossed the named-trait line");
    push(view.lead.caption === view.lead.label && view.lead.label === TRAIT_LABELS[view.lead.trait.key], "relative caption is not the trait name");
    push(view.lead.statLabel === "Top trait", "relative lead is labeled plural");
    const expectBand = view.lead.trait.score >= 45 ? "Balanced" : "Light lean";
    push(view.lead.statBand === expectBand, "relative meter does not match the score");
    push(!traitBlocked(view.lead.trait.key, view.mbtiType), "relative lead uses a blocked trait");
  } else if (view.lead.kind === "single") {
    push(view.lead.trait.score >= 55, "lead trait is below the named-trait line");
    push(!/balanced/i.test(view.lead.trait.label), "lead trait is named Balanced");
    push(view.lead.label === view.lead.trait.label, "single lead label drifted");
    push(view.lead.statLabel === "Top trait", "single lead is labeled plural");
    const expectPhrase = view.lead.trait.band === "strong" ? `high ${view.lead.trait.label.toLowerCase()}` : `a lean toward ${view.lead.trait.label.toLowerCase()}`;
    push(view.lead.trait.phrase === expectPhrase, "lead phrase does not match its band");
    push(view.lead.statBand === view.lead.trait.meter, "lead meter does not match its band");
    if (view.lead.trait.band === "strong") push(view.lead.trait.phrase.startsWith("high "), "strong trait is not called high");
    if (view.lead.trait.band === "moderate") push(!view.lead.trait.phrase.startsWith("high "), "moderate trait is called high");
  } else {
    push(view.lead.traits[0].score >= 55 && view.lead.traits[1].score >= 55, "blended trait is below the named-trait line");
    push(view.lead.label === `${view.lead.traits[0].label} + ${view.lead.traits[1].label}`, "blend label is not the two trait names");
    push(view.lead.statLabel === "Top traits", "blend is labeled singular");
    push(view.lead.traits[0].key !== view.lead.traits[1].key, "blend repeats one trait");
    push(!view.lead.label.toLowerCase().includes("balanced"), "blend includes Balanced");
  }

  push(view.bigFiveLead.includes(view.lead.kind === "none" ? "No single Big Five" : view.lead.label), "Big Five sentence does not use the page lead");
  if (view.stressSecondary) {
    const expected = view.stressSecondary.band === "high"
      ? STRESS_SECONDARY_TEXT.high[view.stressSecondary.role]
      : STRESS_SECONDARY_TEXT.moderate.second;
    push(view.stressSecondary.text === expected, "stress sentence does not match its band");
    push(view.stressSecondary.band === "high" ? /high/i.test(view.stressSecondary.text) : !/\bhigh\b/i.test(view.stressSecondary.text), "stress wording contradicts the band");
  }
  if (view.stressSupport) {
    push(view.stressSupport.text === STRESS_SUPPORT_TEXT[view.stressSupport.band], "stress support sentence does not match its band");
    push(view.stressSupport.band === "high" ? view.stressSupport.text.startsWith("Stress sensitivity came out high.") : view.stressSupport.text.startsWith("Stress sensitivity showed up at a moderate level."), "stress support wording contradicts the band");
  }
  if (view.lead.kind !== "none" && view.lead.label.includes(TRAIT_LABELS.N)) {
    push(view.stressSecondary === null, "stress is both a lead trait and a second signal");
  }

  const roleKeys = view.roles.map((title) => title.toLowerCase());
  push(new Set(roleKeys).size === roleKeys.length, "role list has a duplicate");
  const shownRoles = view.direction.kind === "sample" ? view.direction.titles : view.direction.examples;
  const shownKeys = shownRoles.map((title) => title.toLowerCase());
  push(new Set(shownKeys).size === shownKeys.length, "direction examples repeat a role");

  const directionMention = view.direction.kind === "sample"
    ? view.direction.title
    : view.direction.title;
  push(view.whyLine.toLowerCase().includes(directionMention.toLowerCase()) || view.whyLine.toLowerCase().includes("several directions"), "snapshot does not mention the direction");

  for (const letter of view.lightLeanLetters) {
    push(view.mbtiType.includes(letter), `light-lean letter ${letter} is not in ${view.mbtiType}`);
  }
  if (view.lightLeanLetters.length > 0) {
    push(/lean|close|sketch|rough/i.test(`${view.typeNote} ${view.typeBadge}`), "light-lean letters have no matching note");
  }
  if (/light lean on ([A-Z])\/([A-Z])/.test(view.typeBadge)) {
    const axis = view.typeBadge.match(/light lean on ([A-Z])\/([A-Z])/);
    const pair = axis ? `${axis[1]}${axis[2]}` : "";
    const index = ["EI", "SN", "TF", "JP"].indexOf(pair);
    if (index >= 0) push(view.lightLeanLetters.includes(view.mbtiType[index]), "badge axis does not mark the type letter");
  }

  if (view.clarity === "clear") {
    const stoodOut = /stood out/i.test(view.clarityNote.body);
    const leadKind = view.lead.kind as LeadTraits["kind"];
    const surfaces = [view.lead.caption, view.bigFiveLead, view.imageTraitLine, view.pdfTraitLine, view.shareMeta, view.bigFiveSubtitle];
    push(leadKind !== "none", "clear result has no standout trait");
    push(!surfaces.some((line) => line.includes(NO_LEAD_CAPTION)), "clear result still shows no single standout trait");
    push(!view.bigFiveLead.startsWith("No single"), "clear Big Five sentence says no trait stands out");
    push(!(stoodOut && surfaces.some((line) => /no single standout/i.test(line))), "clear stood-out note is paired with no single standout");
  }

  push(view.page.summary.length > 0 && view.page.workBest.length > 0, "page summary is empty");
  push(!/\b(MBTI|Big Five|DISC|Stress Reactivity)\b/.test(`${view.page.summary} ${view.page.workBest} ${view.page.watch ?? ""} ${view.page.careers.map((field) => field.reason).join(" ")}`), "plain page copy uses a method term");
  push(view.page.thisWeek.length >= 1 && view.page.thisWeek.length <= 3, "try-this-week list is not 1 to 3 steps");
  if (view.isV5Direction) push(view.page.careers.length === 2, "v5 page should show two career fields");
  for (const field of view.page.careers) {
    push(field.name.length > 0 && field.reason.length > 20 && field.reason.length < 320, "career field reason is not a short plain line");
  }
  push(view.shareMeta.includes(view.lead.kind === "none" ? NO_LEAD_CAPTION : view.lead.caption), "share line uses a different lead");
  push(view.ogTitle === view.headline, "OG title does not match the headline");
  push(view.ogDescription === view.whyLine, "OG description does not match the snapshot");
  if (view.clarity === "broad") push(view.pdfArchetype.endsWith("-leaning pattern"), "PDF still prints an archetype on a broad result");
  push(view.imageTraitLine === (view.lead.kind === "none" ? NO_LEAD_CAPTION : `${view.lead.caption} · ${view.lead.statBand}`), "image trait does not match the lead");

  return problems;
}
