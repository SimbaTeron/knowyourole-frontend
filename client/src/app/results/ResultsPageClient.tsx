'use client';

import { useState, useEffect } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { isTestMode, getFakeScores, getFakeMBTIType } from "@/utils/devTest";
import { calculateResult, findBestRoleMatch } from "@/components/results/resultsData";
import type { QuizScores } from "@/components/Quiz";
import rolesData from "@/data/roles.json";

// ─── Design Tokens (from mockups) ───────────────────────────────────────────
const C = {
  bg: "#080414",
  cyan: "#22d3ee",
  cyanDim: "rgba(34, 211, 238, 0.6)",
  cyanGlow: "rgba(34, 211, 238, 0.3)",
  purple: "#a855f7",
  purpleDim: "rgba(168, 85, 247, 0.6)",
  pink: "#f472b6",
  gold: "#f59e0b",
  goldLight: "#fbbf24",
  teal: "#06b6d4",
  text: "#ffffff",
  textMuted: "#cccccc",
  textDim: "#cccccc",
  glassBg: "rgba(255, 255, 255, 0.04)",
  glassBgHover: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  glassBorderBright: "rgba(255, 255, 255, 0.2)",
  cardRadius: "20px",
} as const;



const ARCHETYPES: Record<string, string> = {
  INTJ: "The Architect", INTP: "The Thinker", ENTJ: "The Commander", ENTP: "The Debater",
  INFJ: "The Advocate", INFP: "The Mediator", ENFJ: "The Protagonist", ENFP: "The Campaigner",
  ISTJ: "The Logistician", ISFJ: "The Defender", ESTJ: "The Executive", ESFJ: "The Consul",
  ISTP: "The Virtuoso", ISFP: "The Adventurer", ESTP: "The Entrepreneur", ESFP: "The Entertainer",
};

function getArchetype(mbti: string) {
  return ARCHETYPES[mbti] || "The Architect";
}

// Population prevalence rates per MBTI type (% of population)
const POPULATION_RATES: Record<string, string> = {
  INTJ: "2.4%", INTP: "2.5%", ENTJ: "1.8%", ENTP: "3.2%",
  INFJ: "1.5%", INFP: "4.4%", ENFJ: "2.5%", ENFP: "8.1%",
  ISTJ: "11.6%", ISFJ: "13.8%", ESTJ: "8.7%", ESFJ: "12.3%",
  ISTP: "5.2%", ISFP: "8.8%", ESTP: "4.3%", ESFP: "8.5%",
};

// Short descriptor per MBTI type
const MBTI_TAGLINES: Record<string, string> = {
  INTJ: "Strategic Planner", INTP: "Logical Analyzer", ENTJ: "Executive Leader", ENTP: "Debate Master",
  INFJ: "Empathic Counselor", INFP: "Idealistic Mediator", ENFJ: "Inspirational Leader", ENFP: "Creative Catalyst",
  ISTJ: "Reliable Duty-Fulfiller", ISFJ: "Devoted Protector", ESTJ: "Administrator", ESFJ: "Caring Diplomat",
  ISTP: "Pragmatic Problem-Solver", ISFP: "Flexible Artist", ESTP: "Energetic Improviser", ESFP: "Spontaneous Entertainer",
};

// City suggestions by MBTI+primary DISC (placeholder — replace with real DB query)
const CITY_MAP: Record<string, { city: string; openings: string; avgSalary: string }[]> = {
  INTJ: [{ city: "San Francisco, CA", openings: "5,120", avgSalary: "$162K" }, { city: "Austin, TX", openings: "2,840", avgSalary: "$138K" }],
  INTP: [{ city: "Boston, MA", openings: "3,200", avgSalary: "$145K" }, { city: "Seattle, WA", openings: "3,900", avgSalary: "$148K" }],
  ENTJ: [{ city: "New York, NY", openings: "7,100", avgSalary: "$155K" }, { city: "San Francisco, CA", openings: "5,120", avgSalary: "$162K" }],
  ENTP: [{ city: "Austin, TX", openings: "3,500", avgSalary: "$140K" }, { city: "Denver, CO", openings: "2,600", avgSalary: "$135K" }],
  INFJ: [{ city: "Portland, OR", openings: "1,800", avgSalary: "$115K" }, { city: "Austin, TX", openings: "2,200", avgSalary: "$120K" }],
  INFP: [{ city: "Denver, CO", openings: "2,100", avgSalary: "$118K" }, { city: "Portland, OR", openings: "1,900", avgSalary: "$112K" }],
  ENFJ: [{ city: "Chicago, IL", openings: "4,300", avgSalary: "$125K" }, { city: "Miami, FL", openings: "2,800", avgSalary: "$118K" }],
  ENFP: [{ city: "Los Angeles, CA", openings: "4,100", avgSalary: "$122K" }, { city: "Austin, TX", openings: "3,200", avgSalary: "$120K" }],
  ISTJ: [{ city: "Dallas, TX", openings: "4,500", avgSalary: "$115K" }, { city: "Chicago, IL", openings: "5,100", avgSalary: "$118K" }],
  ISFJ: [{ city: "Minneapolis, MN", openings: "3,100", avgSalary: "$108K" }, { city: "Phoenix, AZ", openings: "2,900", avgSalary: "$105K" }],
  ESTJ: [{ city: "Houston, TX", openings: "5,200", avgSalary: "$120K" }, { city: "Dallas, TX", openings: "4,800", avgSalary: "$118K" }],
  ESFJ: [{ city: "Atlanta, GA", openings: "3,800", avgSalary: "$110K" }, { city: "Chicago, IL", openings: "4,200", avgSalary: "$115K" }],
  ISTP: [{ city: "Detroit, MI", openings: "2,700", avgSalary: "$108K" }, { city: "Seattle, WA", openings: "3,400", avgSalary: "$118K" }],
  ISFP: [{ city: "Nashville, TN", openings: "1,900", avgSalary: "$98K" }, { city: "Portland, OR", openings: "2,100", avgSalary: "$102K" }],
  ESTP: [{ city: "Las Vegas, NV", openings: "2,400", avgSalary: "$105K" }, { city: "Miami, FL", openings: "3,100", avgSalary: "$110K" }],
  ESFP: [{ city: "Los Angeles, CA", openings: "4,300", avgSalary: "$108K" }, { city: "Orlando, FL", openings: "2,600", avgSalary: "$100K" }],
};

function getTopCities(mbtiType: string, count = 4): { rank: string; icon: string; name: string; jobs: string; salary: string }[] {
  const cities = CITY_MAP[mbtiType] || [{ city: "Austin, TX", openings: "3,000", avgSalary: "$125K" }];
  const icons: Record<string, string> = { "San Francisco, CA": "🌉", "Austin, TX": "🌵", "Seattle, WA": "🎸", "Denver, CO": "🏔️", "Boston, MA": "🏛️", "New York, NY": "🗽", "Portland, OR": "🌲", "Chicago, IL": "🌃", "Los Angeles, CA": "🌴", "Dallas, TX": "🤠", "Houston, TX": "🛢️", "Atlanta, GA": "🍑", "Miami, FL": "🌴", "Minneapolis, MN": "❄️", "Phoenix, AZ": "🌞", "Las Vegas, NV": "🎰", "Nashville, TN": "🎸", "Detroit, MI": "🚗", "Orlando, FL": "🎢" };
  const allCities = [
    { city: "Austin, TX", icon: "🌵", openings: "2,840", avgSalary: "$138K" },
    { city: "San Francisco, CA", icon: "🌉", openings: "5,120", avgSalary: "$162K" },
    { city: "Seattle, WA", icon: "🎸", openings: "3,900", avgSalary: "$148K" },
    { city: "Denver, CO", icon: "🏔️", openings: "2,210", avgSalary: "$131K" },
  ];
  const base = cities.map(c => ({ icon: icons[c.city] || "🌍", name: c.city, jobs: `${c.openings} openings`, salary: c.avgSalary + " avg" }));
  const result = base.slice(0, count);
  // Pad with fallback cities
  const fallback = allCities
    .filter(a => !base.find(b => b.name === a.city))
    .slice(0, count - result.length)
    .map(c => ({ icon: c.icon, name: c.city, jobs: `${c.openings} openings`, salary: c.avgSalary + " avg" }));
  return [...result, ...fallback].slice(0, count).map((c, i) => ({ rank: `#${i + 1}`, ...c }));
}

// P3 premium content — MBTI-specific side hustles, learning styles, crossroads
const SIDE_HUSTLES: Record<string, { title: string; income: string; desc: string; tags: string[] }> = {
  INTJ: { title: "AI Strategy Consultant", income: "+$4.2K/mo", desc: "Build AI-powered productivity tools for strategic thinkers and fellow analysts.", tags: ["⏱ 8–10 hrs/wk", "📈 $3K–$6K/mo", "🎯 High fit"] },
  INTP: { title: "Research Platform", income: "+$3.8K/mo", desc: "Create tools that help researchers and analysts organize complex information.", tags: ["⏱ 6–9 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] },
  ENTJ: { title: "Executive Training", income: "+$5.1K/mo", desc: "Train ambitious professionals on leadership and decision-making frameworks.", tags: ["⏱ 5–8 hrs/wk", "📈 $4K–$7K/mo", "🎯 High fit"] },
  ENTP: { title: "Startup Ideation Coach", income: "+$3.5K/mo", desc: "Help entrepreneurs stress-test business ideas and find product-market fit fast.", tags: ["⏱ 4–7 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] },
  INFJ: { title: "Life Coaching Practice", income: "+$3.2K/mo", desc: "Offer deep, empathetic coaching for people navigating life transitions.", tags: ["⏱ 5–8 hrs/wk", "📈 $2K–$4K/mo", "🎯 High fit"] },
  INFP: { title: "Creative Writing", income: "+$2.8K/mo", desc: "Write compelling content, stories, or copy that moves people emotionally.", tags: ["⏱ 4–6 hrs/wk", "📈 $1K–$4K/mo", "🎯 High fit"] },
  ENFJ: { title: "Team Culture Consultant", income: "+$4.0K/mo", desc: "Help companies build authentic culture, mission, and team alignment.", tags: ["⏱ 6–9 hrs/wk", "📈 $3K–$5K/mo", "🎯 High fit"] },
  ENFP: { title: "Creative Campaigns", income: "+$3.0K/mo", desc: "Design viral marketing campaigns and brand stories for startups.", tags: ["⏱ 5–8 hrs/wk", "📈 $2K–$4K/mo", "🎯 High fit"] },
  ISTJ: { title: "Compliance Automation", income: "+$3.6K/mo", desc: "Automate tedious compliance workflows for small businesses and startups.", tags: ["⏱ 6–8 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] },
  ISFJ: { title: "Client Care Systems", income: "+$2.5K/mo", desc: "Build loyal client management systems for service businesses.", tags: ["⏱ 5–7 hrs/wk", "📈 $1K–$4K/mo", "🎯 High fit"] },
  ESTJ: { title: "Operations Consulting", income: "+$4.5K/mo", desc: "Streamline operations and processes for growing companies.", tags: ["⏱ 8–10 hrs/wk", "📈 $3K–$6K/mo", "🎯 High fit"] },
  ESFJ: { title: "Community Building", income: "+$2.8K/mo", desc: "Build and monetize engaged communities around brands and causes.", tags: ["⏱ 5–8 hrs/wk", "📈 $1K–$4K/mo", "🎯 High fit"] },
  ISTP: { title: "Technical Freelancing", income: "+$3.4K/mo", desc: "Offer debugging, prototyping, and technical problem-solving services.", tags: ["⏱ 6–9 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] },
  ISFP: { title: "Portfolio Design", income: "+$2.6K/mo", desc: "Create stunning visual portfolios for creatives and professionals.", tags: ["⏱ 4–7 hrs/wk", "📈 $1K–$4K/mo", "🎯 High fit"] },
  ESTP: { title: "Negotiation Coaching", income: "+$4.0K/mo", desc: "Coach professionals on high-stakes negotiation and deal-making tactics.", tags: ["⏱ 5–8 hrs/wk", "📈 $2K–$6K/mo", "🎯 High fit"] },
  ESFP: { title: "Event Experiences", income: "+$3.0K/mo", desc: "Design and promote immersive events and experiences that people remember.", tags: ["⏱ 6–10 hrs/wk", "📈 $2K–$4K/mo", "🎯 High fit"] },
};

const LEARNING_STYLES: Record<string, { title: string; desc: string; tips: string[] }> = {
  INTJ: { title: "Systems-Based Learning", desc: "You absorb information fastest when connected to a larger system. Abstract frameworks trump raw memorization.", tips: ["📐 Study system architectures, not features", "🎯 Learn through building real projects", "📖 Read case studies of failures + successes"] },
  INTP: { title: "Concept-First Learning", desc: "You need the underlying theory before anything else. Details stick once the logic clicks.", tips: ["🔬 Start with first principles", "📝 Write explanations for concepts", "🤝 Test understanding through debate"] },
  ENTJ: { title: "Results-Driven Learning", desc: "You learn fastest when it has direct business impact. Theory without application loses you quickly.", tips: ["🎯 Learn with a clear objective in mind", "📊 Apply to real problems immediately", "👥 Teach others to cement knowledge"] },
  ENTP: { title: "Exploratory Learning", desc: "You thrive on mental sparring and exploring opposing ideas. Structured courses bore you fast.", tips: ["⚡ Follow intellectual rabbit holes", "💡 Learn through brainstorming with others", "🎮 Gamify your learning challenges"] },
  INFJ: { title: "Meaning-Centered Learning", desc: "You internalize deeply when content connects to your values and sense of purpose.", tips: ["🧠 Connect ideas to personal meaning", "📖 Study transformative human stories", "🎯 Apply to help others"] },
  INFP: { title: "Values-Driven Learning", desc: "Learning feels meaningless unless it aligns with your inner values and identity.", tips: ["💜 Explore topics through creative expression", "🌊 Learn in reflective, low-pressure settings", "📚 Find authors who share your worldview"] },
  ENFJ: { title: "People-Centered Learning", desc: "You learn best by teaching and mentoring others. Community accelerates your growth.", tips: ["👥 Learn by explaining to others", "📣 Study through dialogue and feedback", "🌱 Apply knowledge to uplift people"] },
  ENFP: { title: "Multipath Learning", desc: "You flit between topics, absorbing a little about everything until something sparks.", tips: ["⚡ Start many things, go deep where excited", "🎨 Learn through creative projects", "🤝 Explore with enthusiastic peers"] },
  ISTJ: { title: "Practical-Routine Learning", desc: "You prefer structured, proven methods. Real-world application cements everything.", tips: ["📋 Follow structured study routines", "✅ Apply through real tasks and responsibilities", "📖 Learn from documented best practices"] },
  ISFJ: { title: "Supportive Learning", desc: "You learn best when supporting others or fulfilling a responsibility you care about.", tips: ["🛡 Learn by helping a specific person", "📋 Build on what you already know works", "🏠 Apply in familiar, stable settings"] },
  ESTJ: { title: "Action-Oriented Learning", desc: "You want the clearest path from A to B. Fuzzy courses frustrate you.", tips: ["📌 Get a clear roadmap and milestones", "⚡ Take action even when not fully ready", "📊 Measure results of your learning"] },
  ESFJ: { title: "Harmony-Based Learning", desc: "You absorb best when the environment is warm and collaborative, not competitive.", tips: ["🤝 Learn with supportive friends or groups", "💛 Connect learning to relationships", "🏠 Apply to help your community"] },
  ISTP: { title: "Hands-On Learning", desc: "You need to physically touch and manipulate systems. Reading about something is never enough.", tips: ["🔧 Learn by taking things apart", "⚡ Build and experiment immediately", "🎯 Solve concrete, specific problems"] },
  ISFP: { title: "Experiential Learning", desc: "Beauty and aesthetic experience shape how deeply you absorb information.", tips: ["🎨 Learn through artistic and sensory projects", "🌅 Learn in beautiful, inspiring environments", "💖 Explore topics that feel personally meaningful"] },
  ESTP: { title: "Real-World Learning", desc: "You bore of theory fast. If it doesn't have an immediate, tangible application, you check out.", tips: ["⚡ Learn by doing and experiencing", "🎮 Compete to stay engaged", "🌍 Seek high-energy, fast-paced learning environments"] },
  ESFP: { title: "Immersive Learning", desc: "You absorb through living and experiencing, not sitting and reading. Adventures ARE education.", tips: ["🎭 Learn through role-play and simulation", "🌟 Surround yourself with energetic people", "📸 Document learning as a creative story"] },
};

const CROSSROADS: Record<string, { heading: string; desc: string; tags: string[] }> = {
  INTJ: { heading: "The Vision vs. Execution Crossroads", desc: "INTJs who channel their strategic vision into building something real — even imperfectly — develop a rare form of wisdom that transforms every plan into an unfair advantage.", tags: ["Intuition", "Strategy", "Leadership", "Growth"] },
  INTP: { heading: "The Logic vs. Connection Crossroads", desc: "INTPs who learn to connect their brilliant ideas to real human needs discover a rare ability to change the world without losing their soul.", tags: ["Analysis", "Empathy", "Clarity", "Impact"] },
  ENTJ: { heading: "The Command vs. Empathy Crossroads", desc: "ENTJs who develop emotional intelligence alongside their natural command become unstoppable leaders who inspire loyalty, not just compliance.", tags: ["Power", "Empathy", "Vision", "Legacy"] },
  ENTP: { heading: "The Debate vs. Commitment Crossroads", desc: "ENTPs who pick a path and commit — even when another shiny option beckons — discover a depth that turns their versatility into true mastery.", tags: ["Ideas", "Focus", "Depth", "Mastery"] },
  INFJ: { heading: "The Vision vs. Visibility Crossroads", desc: "INFJs who share their quiet vision with the world — without waiting for perfect — find their deepest purpose amplified beyond what they imagined alone.", tags: ["Purpose", "Visibility", "Impact", "Authenticity"] },
  INFP: { heading: "The Idealism vs. Action Crossroads", desc: "INFPs who bridge their beautiful inner world with decisive outer action create change that is both meaningful and lasting.", tags: ["Values", "Action", "Courage", "Purpose"] },
  ENFJ: { heading: "The Inspire vs. Protect Crossroads", desc: "ENFJs who learn to set boundaries without losing their warmth become the kind of leaders who sustain their vision for decades.", tags: ["Vision", "Boundaries", "Endurance", "Leadership"] },
  ENFP: { heading: "The Possibility vs. Priority Crossroads", desc: "ENFPs who develop the discipline to finish what they start — while keeping their spark — turn their many gifts into one remarkable legacy.", tags: ["Creativity", "Discipline", "Depth", "Finish"] },
  ISTJ: { heading: "The Duty vs. Growth Crossroads", desc: "ISTJs who add personal growth to their duty — without abandoning their reliability — become the rare kind of steady force that changes everything.", tags: ["Reliability", "Growth", "Adaptation", "Legacy"] },
  ISFJ: { heading: "The Protect vs. Empower Crossroads", desc: "ISFJs who empower others to stand on their own — while still being there — become a force for lasting, multiplicative impact.", tags: ["Care", "Empowerment", "Boundaries", "Impact"] },
  ESTJ: { heading: "The Order vs. Innovation Crossroads", desc: "ESTJs who bring their structure to new, uncharted territory prove that strong foundations and bold innovation are not opposites.", tags: ["Structure", "Innovation", "Courage", "Legacy"] },
  ESFJ: { heading: "The Harmony vs. Truth Crossroads", desc: "ESFJs who speak difficult truths while maintaining their natural warmth become trusted guides who lead people through any storm.", tags: ["Harmony", "Truth", "Courage", "Trust"] },
  ISTP: { heading: "The Analysis vs. Action Crossroads", desc: "ISTPs who translate their deep analysis into decisive action discover that the gap between understanding and building is where real impact lives.", tags: ["Analysis", "Action", "Craft", "Impact"] },
  ISFP: { heading: "The Beauty vs. Mission Crossroads", desc: "ISFPs who pair their natural aesthetic sense with a clear personal mission create work that is both beautiful and deeply meaningful.", tags: ["Beauty", "Purpose", "Authenticity", "Expression"] },
  ESTP: { heading: "The Risk vs. Relationship Crossroads", desc: "ESTPs who temper their risk-taking with deep relationship investment build legacies that are both bold and profoundly human.", tags: ["Risk", "Relationships", "Impact", "Legacy"] },
  ESFP: { heading: "The Experience vs. Depth Crossroads", desc: "ESFPs who add depth to their breadth of experience — finishing what they start — become remarkable guides to living fully.", tags: ["Energy", "Depth", "Finish", "Presence"] },
};

const DISC_COLORS: Record<string, string> = { D: "#ef4444", I: "#f59e0b", S: "#22c55e", C: "#3b82f6" };
const DISC_LABELS: Record<string, string> = { D: "Dominance", I: "Influence", S: "Steadiness", C: "Conscientiousness" };

type BigFiveProfile = { O: number; C: number; E: number; A: number; N: number };
type DiscProfile = { D: number; I: number; S: number; C: number };
type CareerRoleOption = { title: string; salary?: string; desc?: string; source: string };
type RoleFitCategory = "leadership" | "technical" | "creative" | "care" | "operations" | "influence" | "generalist";

type RoleFitProfile = {
  label: string;
  keywords: RegExp;
  idealDisc: string[];
  idealMbtiLetters: string[];
  bigFiveTargets: Partial<Record<keyof BigFiveProfile, "high" | "mid" | "low">>;
  friction: string;
  proof: string;
};

const ROLE_FIT_PROFILES: Record<RoleFitCategory, RoleFitProfile> = {
  leadership: {
    label: "Leadership / strategy",
    keywords: /(founder|ceo|chief|director|lead|leader|manager|management|executive|entrepreneur|venture|strategy|strategist|consultant|product|owner|political)/i,
    idealDisc: ["D", "I"],
    idealMbtiLetters: ["E", "N", "T", "J"],
    bigFiveTargets: { O: "high", C: "high", E: "mid", N: "low" },
    friction: "ambiguity, rejection, stakeholder pressure, and decisions with incomplete data",
    proof: "lead a small team or project to one measurable outcome",
  },
  technical: {
    label: "Technical / analytical",
    keywords: /(engineer|architect|developer|software|research|scientist|science|data|analyst|analytics|ai|algorithm|cyber|security|quant|blockchain|mechanical|systems|forensic)/i,
    idealDisc: ["C", "D"],
    idealMbtiLetters: ["I", "N", "T", "J"],
    bigFiveTargets: { O: "high", C: "high", E: "low", A: "mid" },
    friction: "deep work getting trapped in private, invisible excellence",
    proof: "ship a working demo, technical teardown, or case study",
  },
  creative: {
    label: "Creative / design",
    keywords: /(creative|designer|design|writer|brand|marketing|game|artist|art|film|filmmaker|photo|photographer|producer|narrative|ux|entertainment|content|podcast|interior)/i,
    idealDisc: ["I", "S", "C"],
    idealMbtiLetters: ["N", "F", "P"],
    bigFiveTargets: { O: "high", A: "mid", C: "mid" },
    friction: "turning taste and ideas into visible proof that other people can evaluate",
    proof: "publish a portfolio piece with a clear before/after story",
  },
  care: {
    label: "Helping / human development",
    keywords: /(coach|therapist|therapy|counselor|counseling|teacher|teaching|nurse|medical|social|worker|hr|human|community|advocate|success|nonprofit|psychologist|patient|care)/i,
    idealDisc: ["S", "I"],
    idealMbtiLetters: ["F", "J", "E", "I"],
    bigFiveTargets: { A: "high", C: "mid", N: "low" },
    friction: "emotional load, weak boundaries, and over-serving before outcomes are clear",
    proof: "help one real person through a scoped problem and document the outcome",
  },
  operations: {
    label: "Operations / execution",
    keywords: /(operations|project|program|financial|finance|compliance|auditor|audit|quality|assurance|qa|administrative|admin|records|franchise|logistics|process|coordinator)/i,
    idealDisc: ["C", "D", "S"],
    idealMbtiLetters: ["S", "T", "J"],
    bigFiveTargets: { C: "high", O: "mid", N: "low" },
    friction: "process becoming the point instead of a tool for better outcomes",
    proof: "improve one messy workflow and measure saved time, money, or errors",
  },
  influence: {
    label: "Influence / revenue",
    keywords: /(sales|business development|ambassador|event|events|negotiation|recruiter|talent|public|partnership|growth|media|account)/i,
    idealDisc: ["I", "D"],
    idealMbtiLetters: ["E", "P", "T", "F"],
    bigFiveTargets: { E: "high", A: "mid", N: "low" },
    friction: "inconsistent follow-through after the exciting first conversation",
    proof: "create a repeatable pitch and test it on ten real conversations",
  },
  generalist: {
    label: "Generalist / custom path",
    keywords: /.^/,
    idealDisc: ["D", "I", "S", "C"],
    idealMbtiLetters: [],
    bigFiveTargets: { O: "mid", C: "mid", A: "mid" },
    friction: "the role is broad, so the biggest risk is fuzzy success criteria",
    proof: "define what winning looks like, then create one small proof artifact",
  },
};

function clampScore(value: number, min = 35, max = 98) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function scoreBigFiveTarget(value: number, target: "high" | "mid" | "low") {
  if (target === "high") return value >= 75 ? 100 : value >= 60 ? 82 : value >= 45 ? 62 : 42;
  if (target === "low") return value <= 35 ? 100 : value <= 50 ? 82 : value <= 65 ? 58 : 38;
  return value >= 40 && value <= 70 ? 92 : value >= 30 && value <= 82 ? 74 : 55;
}

function getRoleFitCategories(roleText: string): RoleFitCategory[] {
  const matches = (Object.entries(ROLE_FIT_PROFILES) as [RoleFitCategory, RoleFitProfile][])
    .filter(([category, profile]) => category !== "generalist" && profile.keywords.test(roleText))
    .map(([category]) => category);
  return matches.length ? matches : ["generalist"];
}

function analyzeDreamRoleFit({
  role,
  roleMeta,
  mbtiType,
  primaryDisc,
  disc,
  bigFive,
  primaryMatchTitle,
  secondaryMatchTitle,
}: {
  role: string;
  roleMeta: CareerRoleOption;
  mbtiType: string;
  primaryDisc: string;
  disc: DiscProfile;
  bigFive: BigFiveProfile;
  primaryMatchTitle: string;
  secondaryMatchTitle: string;
}) {
  const roleText = `${role} ${roleMeta.desc || ""}`.toLowerCase();
  const categories = getRoleFitCategories(roleText);
  const profiles = categories.map(category => ROLE_FIT_PROFILES[category]);
  const discTotal = Math.max(1, disc.D + disc.I + disc.S + disc.C);
  const discWeights = { D: disc.D / discTotal, I: disc.I / discTotal, S: disc.S / discTotal, C: disc.C / discTotal };

  const discScore = profiles.reduce((sum, profile) => {
    const best = profile.idealDisc.reduce((max, key) => Math.max(max, discWeights[key as keyof DiscProfile] || 0), 0);
    const primaryBonus = profile.idealDisc.includes(primaryDisc) ? 18 : 0;
    return sum + clampScore(48 + best * 120 + primaryBonus, 35, 100);
  }, 0) / profiles.length;

  const mbtiLetters = mbtiType.split("");
  const mbtiScore = profiles.reduce((sum, profile) => {
    if (!profile.idealMbtiLetters.length) return sum + 72;
    const matched = profile.idealMbtiLetters.filter(letter => mbtiLetters.includes(letter));
    return sum + clampScore(42 + (matched.length / profile.idealMbtiLetters.length) * 58, 35, 100);
  }, 0) / profiles.length;

  const bigFiveScores = profiles.flatMap(profile => Object.entries(profile.bigFiveTargets).map(([trait, target]) => ({
    trait: trait as keyof BigFiveProfile,
    target,
    score: scoreBigFiveTarget(bigFive[trait as keyof BigFiveProfile], target as "high" | "mid" | "low"),
  })));
  const bigFiveScore = bigFiveScores.reduce((sum, item) => sum + item.score, 0) / Math.max(1, bigFiveScores.length);

  const exactRoleBonus = role.toLowerCase() === primaryMatchTitle.toLowerCase() ? 9 : role.toLowerCase() === secondaryMatchTitle.toLowerCase() ? 6 : 0;
  const sourceBonus = roleMeta.source === "Your matched roles" ? 4 : roleMeta.source === "KYR role library" ? 2 : 0;
  const isUnknownCustomRole = categories.length === 1 && categories[0] === "generalist" && roleMeta.source === "Custom role";
  const match = isUnknownCustomRole
    ? clampScore((discScore * 0.2) + (mbtiScore * 0.2) + (bigFiveScore * 0.25) - 4, 42, 63)
    : clampScore((discScore * 0.28) + (mbtiScore * 0.27) + (bigFiveScore * 0.35) + 5 + exactRoleBonus + sourceBonus, 32, 98);
  const fitLabel = match >= 88 ? "Elite fit" : match >= 76 ? "Strong fit" : match >= 64 ? "Promising fit" : match >= 52 ? "Stretch role" : "Major stretch";

  const strongestCategory = profiles[0];
  const topBigFive = [...bigFiveScores].sort((a, b) => b.score - a.score)[0];
  const weakestBigFive = [...bigFiveScores].sort((a, b) => a.score - b.score)[0];
  const idealDiscText = Array.from(new Set(profiles.flatMap(profile => profile.idealDisc))).join("/");
  const categoryText = profiles.map(profile => profile.label).join(" + ");

  return {
    match,
    fitLabel,
    categoryText,
    evidence: [
      `Role read: ${categoryText}. The advisor matched the title/description against role families, not a flat generic score.`,
      `DISC fit: your primary ${primaryDisc} is compared with this role's ${idealDiscText} operating style; current DISC contribution is ${Math.round(discScore)}%.`,
      `MBTI fit: ${mbtiType} matches ${Math.round(mbtiScore)}% of the role's preferred energy, information, decision, and structure patterns.`,
      `Big Five fit: strongest signal is ${topBigFive ? `${topBigFive.trait}=${bigFive[topBigFive.trait]} for a ${topBigFive.target} target` : "balanced traits"}; Big Five contribution is ${Math.round(bigFiveScore)}%.`,
    ],
    friction: weakestBigFive
      ? `Main friction: ${strongestCategory.friction}. Watch ${weakestBigFive.trait}=${bigFive[weakestBigFive.trait]} against this role's ${weakestBigFive.target} target.`
      : `Main friction: ${strongestCategory.friction}.`,
    leverage: `Use your ${mbtiType} + ${primaryDisc} signature by making ${strongestCategory.proof}; this converts personality fit into real proof instead of horoscope confetti.`,
    path: [
      { num: 1, title: "Fit hypothesis", text: `Treat ${role} as a ${categoryText.toLowerCase()} experiment. Your current estimated fit is ${match}%, so test the assumptions before over-committing.` },
      { num: 2, title: "Proof artifact", text: `Build evidence first: ${strongestCategory.proof}. Keep it small enough to finish in 7-14 days.` },
      { num: 3, title: "Reality check", text: "Interview 3 people already in the role. Ask what drains them, what gets rewarded, and what beginners misunderstand." },
      { num: 4, title: "Gap sprint", text: `Close the weakest fit signal with one drill: ${primaryDisc === "C" ? "publish concise summaries faster" : primaryDisc === "D" ? "practice stakeholder patience" : primaryDisc === "I" ? "finish one boring but valuable artifact" : "make your work more visible and assertive"}.` },
    ],
  };
}

// ─── Real scores from URL params or sessionStorage (written by handleQuizComplete) ───────
function getStoredScores(): QuizScores | null {
  if (typeof window === "undefined") return null;
  try {
    // FIRST: Check URL params — scores passed via ?scores=<base64> survive page refresh and new tabs
    const urlParams = new URLSearchParams(window.location.search);
    const encodedScores = urlParams.get("scores");
    if (encodedScores) {
      try {
        const decoded = JSON.parse(atob(encodedScores)) as QuizScores;
        if (decoded && typeof decoded === "object") return decoded;
      } catch {
        // Malformed scores param — fall through to sessionStorage
      }
    }
    // SECOND: Fall back to sessionStorage (test mode, inline quiz completion)
    const raw = sessionStorage.getItem("kyr_real_scores")
      || sessionStorage.getItem("kyr_fake_scores");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizScores;
    // Validate data shape — invalidate corrupted/old-format entries (missing DISC keys)
    if (!parsed || !parsed.disc || parsed.disc.D === undefined || parsed.disc.C === undefined) {
      sessionStorage.removeItem("kyr_fake_scores");
      return null;
    }
    return parsed;
  } catch { return null; }
}

function computeMBTIString(mbti: QuizScores["mbti"]): string {
  const E = mbti.E >= mbti.I ? "E" : "I";
  const S = mbti.S >= mbti.N ? "S" : "N";
  const T = mbti.T >= mbti.F ? "T" : "F";
  const J = mbti.J >= mbti.P ? "J" : "P";
  return E + S + T + J;
}

function computePrimaryDisc(disc: QuizScores["disc"]): string {
  const entries = Object.entries(disc) as [string, number][];
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

// Big Five quiz scores are on 0-100 scale (percentile-like). Pass through directly.
function normalizeBigFive(raw: number): number {
  return Math.round(Math.max(10, Math.min(99, raw)));
}

function useRealResults(enabled = true) {
  if (!enabled) return null;
  const scores = getStoredScores();
  const tier = (typeof window !== "undefined" ? sessionStorage.getItem("kyr_tier") : null) || "25+";
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  // No stored scores — in test or demo mode, generate fake scores inline
  if (!scores) {
    const inTestMode = urlParams.get("test") === "true";
    const inDemoMode = urlParams.get("demo") === "true";
    if (inTestMode || inDemoMode) {
      const testTier = (urlParams.get("tier") || tier) as "13-18" | "19-25" | "25plus";
      // Read MBTI override from sessionStorage (set by dev panel's MBTI selector)
      const forcedMBTI = (typeof window !== "undefined" ? sessionStorage.getItem("kyr_fake_mbti") : null) || undefined;
      const fakeScores = getFakeScores(testTier, forcedMBTI);
      // Use calculateResult for consistent real scoring (MBTI, DISC, Big Five percentiles)
      // Pass forcedMBTI so calculateResult uses it instead of deriving from dimensions
      const result = calculateResult(fakeScores as unknown as QuizScores, forcedMBTI);
      const primaryDisc = result.discStyle;
      const type = `${result.mbtiType}-${primaryDisc}`;
      const bigFive = result.bigFiveProfile;
      const disc = {
        D: Math.round((fakeScores.disc.D / 4) * 100),
        I: Math.round((fakeScores.disc.I / 4) * 100),
        S: Math.round((fakeScores.disc.S / 4) * 100),
        C: Math.round((fakeScores.disc.C / 4) * 100),
      };
      return { type, tier: testTier, bigFive, disc, mbtiType: result.mbtiType, primaryDisc, rawScores: fakeScores as unknown as QuizScores, isDemo: inDemoMode, discDesc: result.discDesc, secondaryDisc: result.secondaryDisc, secondaryDiscLabel: result.secondaryDiscLabel, secondaryDiscColor: result.secondaryDiscColor };
    }
    // Not test or demo mode — redirect to quiz
    if (typeof window !== "undefined") {
      window.location.href = "/quiz";
    }
    return null;
  }

  const result = calculateResult(scores);
  const mbtiType = result.mbtiType;
  const primaryDisc = result.discStyle;
  const type = `${mbtiType}-${primaryDisc}`;
  const bigFive = result.bigFiveProfile;
  const disc = {
    D: Math.round((scores.disc.D / 4) * 100),
    I: Math.round((scores.disc.I / 4) * 100),
    S: Math.round((scores.disc.S / 4) * 100),
    C: Math.round((scores.disc.C / 4) * 100),
  };
  // Detect ?demo=true in URL (used by Stripe demo/preview redirect)
  const isDemo = urlParams.get("demo") === "true";

  return { type, tier, bigFive, disc, mbtiType, primaryDisc, rawScores: scores, isDemo, discDesc: result.discDesc, secondaryDisc: result.secondaryDisc, secondaryDiscLabel: result.secondaryDiscLabel, secondaryDiscColor: result.secondaryDiscColor };
}

// ─── MBTI → #1 Career Match mapping (mirrors backend scoring) ────────────────
const TOP_CAREER_MAP: Record<string, { title: string; salary: string }> = {
  INTJ: { title: "Systems Architect", salary: "$120K – $180K" },
  INTP: { title: "Research Scientist", salary: "$95K – $155K" },
  ENTJ: { title: "Startup Founder", salary: "$100K – $250K" },
  ENTP: { title: "Product Manager", salary: "$110K – $170K" },
  INFJ: { title: "Psychologist", salary: "$80K – $130K" },
  INFP: { title: "Counselor", salary: "$60K – $95K" },
  ENFJ: { title: "HR Director", salary: "$90K – $160K" },
  ENFP: { title: "Content Creator", salary: "$55K – $120K" },
  ISTJ: { title: "Accountant", salary: "$70K – $120K" },
  ISFJ: { title: "Nurse", salary: "$65K – $110K" },
  ESTJ: { title: "Operations Manager", salary: "$80K – $140K" },
  ESFJ: { title: "Event Planner", salary: "$50K – $95K" },
  ISTP: { title: "Engineer", salary: "$80K – $145K" },
  ISFP: { title: "Interior Designer", salary: "$55K – $100K" },
  ESTP: { title: "Sales Representative", salary: "$60K – $130K" },
  ESFP: { title: "Actor/Performer", salary: "$40K – $120K" },
};

// ─── Shared Layout Components ────────────────────────────────────────────────
function AuroraBg() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      background: `radial-gradient(ellipse 100% 60% at 50% -20%, rgba(168,85,247,0.2) 0%, transparent 60%),
                   radial-gradient(ellipse 80% 50% at 80% 110%, rgba(34,211,238,0.1) 0%, transparent 50%),
                   radial-gradient(ellipse 60% 40% at 10% 80%, rgba(244,114,182,0.08) 0%, transparent 50%),
                   ${C.bg}`,
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes starDrift {
          from { transform: translateY(0); }
          to { transform: translateY(-20px); }
        }
      `}</style>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.15), transparent),
          radial-gradient(1px 1px at 35% 65%, rgba(255,255,255,0.1), transparent),
          radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.12), transparent),
          radial-gradient(1px 1px at 75% 45%, rgba(255,255,255,0.1), transparent),
          radial-gradient(1px 1px at 90% 75%, rgba(255,255,255,0.08), transparent),
          radial-gradient(1px 1px at 25% 85%, rgba(255,255,255,0.1), transparent),
          radial-gradient(1px 1px at 65% 35%, rgba(255,255,255,0.08), transparent)`,
        animation: "starDrift 20s ease-in-out infinite alternate",
      }} />
    </div>
  );
}

function TopNav({ premium = false, left = null as React.ReactNode, right = null as React.ReactNode }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(8, 4, 20, 0.85)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: `1px solid ${C.glassBorder}`,
      padding: "12px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
            borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: `0 0 15px rgba(168,85,247,0.3)`,
          }}>🧭</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            Know<span style={{ color: C.cyan }}>You</span>Role
          </div>
          {premium && (
            <div style={{
              fontSize: 9, fontWeight: 700, padding: "3px 8px",
              background: "rgba(34,211,238,0.1)",
              border: `1px solid rgba(34,211,238,0.3)`,
              borderRadius: 6, color: C.cyan,
            }}>PREMIUM</div>
          )}
          {left}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {right}
          <button style={{
            width: 32, height: 32, borderRadius: 9,
            background: C.glassBg, border: `1px solid ${C.glassBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: C.textMuted, fontSize: 14, transition: "all 0.2s",
          }}>↺</button>
          <button style={{
            width: 32, height: 32, borderRadius: 9,
            background: C.glassBg, border: `1px solid ${C.glassBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: C.textMuted, fontSize: 14, transition: "all 0.2s",
          }}>↗</button>
        </div>
      </div>
    </nav>
  );
}

function GlassCard({ children, style = {} as React.CSSProperties, glow = false }: {
  children: React.ReactNode; style?: React.CSSProperties; glow?: boolean;
}) {
  return (
    <div style={{
      background: C.glassBg,
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${C.glassBorder}`,
      borderRadius: C.cardRadius,
      ...(glow ? { boxShadow: `0 0 30px rgba(34,211,238,0.08), 0 8px 32px rgba(0,0,0,0.4)` } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
}

function GradientTopBar({ colors }: { colors: string }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: colors, borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0`,
      margin: "-5px -5px 0", width: "calc(100% + 10px)",
    }} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.glassBorder}, transparent)` }} />
      <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 2 }}>{children}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.glassBorder}, transparent)` }} />
    </div>
  );
}

function BottomBar({ active = "p1", onNavigate, onPremiumClick }: {
  active?: string;
  onNavigate?: (page: 1 | 3) => void;
  onPremiumClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const btns = [
    { id: "p1", icon: "🏆", label: "Full Portrait" },
    { id: "p3", icon: "🔮", label: "Premium" },
    { id: "share", icon: copied ? "✓" : "↗", label: copied ? "Copied!" : "Share" },
    { id: "restart", icon: "↺", label: "Restart" },
  ];

  const handleClick = (id: string) => {
    if (id === "share") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (id === "restart") {
      sessionStorage.clear();
      window.location.href = "/";
    } else if (id === "p1") {
      onNavigate?.(1);
    } else if (id === "p3") {
      onPremiumClick?.();
    }
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(8, 4, 20, 0.92)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderTop: `1px solid ${C.glassBorder}`,
      padding: "12px 20px",
      paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      display: "flex", justifyContent: "space-around",
      pointerEvents: "none",
    }}>
      {btns.map(b => (
        <button key={b.id} onClick={() => handleClick(b.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none",
          color: active === b.id ? C.cyan : C.textMuted,
          opacity: active === b.id ? 1 : 0.5,
          fontSize: 9, fontWeight: 600, cursor: "pointer",
          pointerEvents: "auto",
          fontFamily: "Inter, sans-serif", transition: "all 0.2s",
        }}>
          <div style={{ fontSize: 20, marginBottom: 1 }}>{b.icon}</div>
          {b.label}
        </button>
      ))}
    </div>
  );
}

function PrivacyStrip() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
      padding: "14px 0 8px", fontSize: 9, color: C.textDim,
    }}>🛡 Your results are processed locally — nothing stored on servers</div>
  );
}

// ─── PAGE 1: Full Portrait ───────────────────────────────────────────────────
function Page1FullPortrait({ type, bigFive, disc, mbtiType, primaryDisc, rawScores, discDesc }: {
  type: string; bigFive: { O: number; C: number; E: number; A: number; N: number };
  disc: { D: number; I: number; S: number; C: number };
  mbtiType: string; primaryDisc: string;
  rawScores?: QuizScores;
  discDesc?: string;
}) {
  const base = type.split("-")[0];
  const arch = getArchetype(base);
  const primary = primaryDisc;
  const discColor = DISC_COLORS[primary];
  const pct = (v: number) => v; // Real normalized scores — no random jitter
  const career = TOP_CAREER_MAP[mbtiType] || TOP_CAREER_MAP.INTP;

  const bigFiveRows = [
    { label: "Openness", value: bigFive.O, color: C.cyan, sub: `${pct(bigFive.O)}%` },
    { label: "Conscientious", value: bigFive.C, color: C.purple, sub: `${pct(bigFive.C)}%` },
    { label: "Extroversion", value: bigFive.E, color: C.pink, sub: `${pct(bigFive.E)}%` },
    { label: "Agreeable", value: bigFive.A, color: C.gold, sub: `${pct(bigFive.A)}%` },
    { label: "Neuroticism", value: bigFive.N, color: "#64748b", sub: `${pct(bigFive.N)}%` },
  ];

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 16px 100px" }}>
      {/* Hero */}
      <div style={{ padding: "28px 0 20px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px",
          background: "rgba(34,211,238,0.08)",
          border: `1px solid rgba(34,211,238,0.25)`,
          borderRadius: 100, fontSize: 11, fontWeight: 700,
          color: C.cyan, letterSpacing: 1, textTransform: "uppercase",
          marginBottom: 14, boxShadow: "0 0 20px rgba(34,211,238,0.1)",
        }}>🏆 Your Full Portrait</div>
        <h1 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: "-0.3px",
        }}>Here's Who You Are</h1>
        <p style={{ fontSize: 13, color: C.textMuted }}>Free results · No login needed</p>
      </div>

      {/* 💼 Career Card — job title only, no header */}
      <div style={{
        borderRadius: C.cardRadius, padding: 18, marginBottom: 20,
        background: `linear-gradient(135deg, rgba(245,158,11,0.07), rgba(168,85,247,0.04))`,
        border: `2px solid rgba(245,158,11,0.25)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0`, margin: "-5px -5px 0", width: "calc(100% + 10px)" }} />
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
          {career.title}
        </div>
        <div style={{ fontSize: 12, color: C.goldLight, marginTop: 4, fontWeight: 600 }}>
          {career.salary}
        </div>
      </div>

      {/* 🧠 MBTI Card */}
      <div style={{ borderRadius: C.cardRadius, padding: 18, marginBottom: 20, background: C.glassBg, backdropFilter: "blur(20px)", border: `2px solid ${C.glassBorderBright}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.purple}, ${C.pink})`, margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0` }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(168,85,247,0.1)", border: `1px solid rgba(168,85,247,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{type.split("-")[0]} — {arch}</div>
              <div style={{ fontSize: 12, color: C.textDim }}>16 Personalities · {MBTI_TAGLINES[mbtiType] || "Strategist"}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(168,85,247,0.1)", border: `1px solid rgba(168,85,247,0.3)`, color: C.purple }}>{POPULATION_RATES[mbtiType] || "2.4%"}</div>
            <div style={{ fontSize: 12, color: C.textDim }}>Population</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {([
            { label: "Mind",    leftLetter: "E", rightLetter: "I", dominant: mbtiType[0], desc: mbtiType[0] === "E" ? "You thrive in external, social environments and draw energy from interaction." : "You recharge through solitude and deep internal reflection." },
            { label: "Energy",  leftLetter: "N", rightLetter: "S", dominant: mbtiType[1], desc: mbtiType[1] === "N" ? "You trust patterns, possibilities, and imagination over concrete details." : "You trust what you can see, touch, and verify — real-world facts ground you." },
            { label: "Nature",  leftLetter: "T", rightLetter: "F", dominant: mbtiType[2], desc: mbtiType[2] === "T" ? "You weigh logic and consistency above sentiment and others' feelings." : "You weigh people and harmony alongside logic when making decisions." },
            { label: "Tactics", leftLetter: "J", rightLetter: "P", dominant: mbtiType[3], desc: mbtiType[3] === "J" ? "You prefer clarity, structure, and closure — plans before possibilities." : "You prefer flexibility and keeping options open over rigid planning." },
          ] as { label: string; leftLetter: string; rightLetter: string; dominant: string; desc: string }[]).map(d => {
            const scoreMap: Record<string, number> = { E: rawScores?.mbti.E ?? 50, I: rawScores?.mbti.I ?? 50, N: rawScores?.mbti.N ?? 50, S: rawScores?.mbti.S ?? 50, T: rawScores?.mbti.T ?? 50, F: rawScores?.mbti.F ?? 50, J: rawScores?.mbti.J ?? 50, P: rawScores?.mbti.P ?? 50 };
            const total = (scoreMap[d.leftLetter] + scoreMap[d.rightLetter]) || 1;
            const dominantPct = Math.round((scoreMap[d.dominant] / total) * 100);
            const recessivePct = 100 - dominantPct;
            const isLeftDominant = d.dominant === d.leftLetter;
            return (
              <div key={d.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, padding: "7px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isLeftDominant ? C.cyan : C.purpleDim }}>{d.leftLetter}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textDim }}>{d.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: !isLeftDominant ? C.cyan : C.purpleDim }}>{d.rightLetter}</div>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", position: "relative", marginBottom: 4 }}>
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "rgba(255,255,255,0.15)" }} />
                  {isLeftDominant ? (
                    <>
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${dominantPct}%`, background: `linear-gradient(90deg, ${C.cyan}88, ${C.cyan})`, borderRadius: "3px 0 0 3px" }} />
                      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${recessivePct}%`, background: `linear-gradient(90deg, ${C.purple}, ${C.purple}88)`, borderRadius: "0 3px 3px 0" }} />
                    </>
                  ) : (
                    <>
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${recessivePct}%`, background: `linear-gradient(90deg, ${C.purple}88, ${C.purple})`, borderRadius: "3px 0 0 3px" }} />
                      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${dominantPct}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.cyan}88)`, borderRadius: "0 3px 3px 0" }} />
                    </>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isLeftDominant ? C.cyan : C.purpleDim }}>{isLeftDominant ? dominantPct : recessivePct}%</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: !isLeftDominant ? C.cyan : C.purpleDim }}>{!isLeftDominant ? dominantPct : recessivePct}%</div>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.4, color: C.textDim }}>{d.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📊 DISC Card */}
      <div style={{ borderRadius: C.cardRadius, padding: 18, marginBottom: 20, background: C.glassBg, backdropFilter: "blur(20px)", border: `2px solid ${C.glassBorderBright}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: discColor, margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${discColor}18`, border: `1px solid ${discColor}4d`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{primary === "D" ? "🦅" : primary === "I" ? "🦜" : primary === "S" ? "🕊️" : "🦉"}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{primary} — {DISC_LABELS[primary]}</div>
            <div style={{ fontSize: 10, color: C.textDim }}>DISC Profile · Primary Style</div>
          </div>
        </div>
        {discDesc && <p style={{ fontSize: 12, lineHeight: 1.6, color: C.textDim, marginBottom: 0 }}>{discDesc}</p>}
      </div>

      {/* 🧬 Big Five Card */}
      <div style={{ borderRadius: C.cardRadius, padding: 18, marginBottom: 20, background: C.glassBg, backdropFilter: "blur(20px)", border: `2px solid ${C.glassBorderBright}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`, margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(34,211,238,0.1)", border: `1px solid rgba(34,211,238,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧬</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Big Five · {(() => { const entries = Object.entries(bigFive) as [string, number][]; const top = entries.reduce((a, b) => a[1] > b[1] ? a : b); return `${top[0] === "O" ? "Openness" : top[0] === "C" ? "Conscientiousness" : top[0] === "E" ? "Extroversion" : top[0] === "A" ? "Agreeableness" : "Neuroticism"} Dominant`; })()}</div>
            <div style={{ fontSize: 10, color: C.textDim }}>{(() => { const entries = Object.entries(bigFive) as [string, number][]; const top = entries.reduce((a, b) => a[1] > b[1] ? a : b); return `${top[1]}%`; })()} · US adults</div>
          </div>
        </div>
        {(() => {
          const entries = Object.entries(bigFive) as [string, number][];
          const top = entries.reduce((a, b) => a[1] > b[1] ? a : b);
          const topKey = top[0] as "O" | "C" | "E" | "A" | "N";
          const topPct = top[1];
          const tier = topPct >= 70 ? "high" : topPct <= 40 ? "low" : "medium";
          const bfData = (rolesData as unknown as { traitDescriptions: { bigFive: Record<string, { label: string; high: string; medium: string; low: string }> } }).traitDescriptions.bigFive;
          const desc = bfData[topKey]?.[tier];
          return desc ? <p style={{ fontSize: 12, lineHeight: 1.6, color: C.textDim, marginBottom: 14 }}>{desc}</p> : null;
        })()}
        {bigFiveRows.map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: r.color, width: 100, flexShrink: 0 }}>{r.label}</div>
            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${r.value}%`, height: "100%", background: `linear-gradient(90deg, ${r.color}, ${r.color}88)`, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, width: 34, textAlign: "right", color: r.color }}>
              <span style={{ fontSize: 9, fontWeight: 400, color: C.textDim }}>{r.sub}</span>
            </div>
          </div>
        ))}
      </div>


      <PrivacyStrip />
    </div>
  );
}

// ─── PAGE 3: Premium Nexus ───────────────────────────────────────────────────
const CONSTELLATION_ITEMS = [
  { id: "deepdive", icon: "📖", name: "Deep Dive" },
  { id: "roles", icon: "🎁", name: "Role Match" },
  { id: "blindspots", icon: "🛡", name: "Blindspots" },
  { id: "hustles", icon: "💵", name: "Side Hustle" },
  { id: "learning", icon: "📚", name: "How You Learn" },
  { id: "thinking", icon: "🧩", name: "Sharpen Thinking" },
  { id: "crossroads", icon: "🧭", name: "Crossroads" },
];

function Page3PremiumNexus({ type, bigFive, disc, mbtiType, primaryDisc, isDemo }: {
  type: string; bigFive: { O: number; C: number; E: number; A: number; N: number };
  disc: { D: number; I: number; S: number; C: number };
  mbtiType: string; primaryDisc: string;
  isDemo?: boolean;
}) {
  const [activeCard, setActiveCard] = useState("deepdive");
  const [activeDeepDiveMetric, setActiveDeepDiveMetric] = useState("strength");
  const [expandedRoleRank, setExpandedRoleRank] = useState("#1");
  const [flippedBlindspots, setFlippedBlindspots] = useState<Record<number, boolean>>({});
  const [blindspotPractice, setBlindspotPractice] = useState<Record<number, string>>({});
  const [hustleGoal, setHustleGoal] = useState("Launch");
  const [hustleHours, setHustleHours] = useState(8);
  const [selectedLearningTips, setSelectedLearningTips] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [thinkingAnswer, setThinkingAnswer] = useState<string | null>(null);
  const [thinkingStreak, setThinkingStreak] = useState(0);
  const [crossroadsChoice, setCrossroadsChoice] = useState<string | null>(null);
  const [dreamRoleInput, setDreamRoleInput] = useState("AI Product Founder");
  const [dreamRoleSelected, setDreamRoleSelected] = useState("AI Product Founder");
  const [dreamRoleSubmitted, setDreamRoleSubmitted] = useState("AI Product Founder");

  const base = type.split("-")[0];
  const arch = getArchetype(base);
  const primary = primaryDisc;
  const roleMatch = findBestRoleMatch(mbtiType, primaryDisc, bigFive);
  const hustle = SIDE_HUSTLES[mbtiType] || { title: "AI Side Hustle", income: "+$3K/mo", desc: "Build and sell AI-powered productivity tools for strategic thinkers.", tags: ["⏱ 6–8 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] };
  const learningStyle = LEARNING_STYLES[mbtiType] || { title: "Systems-Based Learning", desc: "You absorb information fastest when connected to a larger system.", tips: ["📐 Study systematically", "🎯 Apply what you learn", "📖 Read case studies"] };
  const crossroad = CROSSROADS[mbtiType] || { heading: "Crossroads Adventure", desc: "Every major decision shapes who you become. Your type shows you the paths worth taking.", tags: ["Intuition", "Strategy", "Leadership", "Growth"] };

  const ActionButton = ({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick: () => void; title?: string }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        border: active ? `1px solid ${C.cyan}` : `1px solid ${C.glassBorder}`,
        background: active ? "rgba(34,211,238,0.14)" : "rgba(255,255,255,0.04)",
        color: active ? C.cyan : C.textMuted,
        borderRadius: 999,
        padding: "7px 11px",
        fontSize: 10,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        transition: "transform 0.16s, border-color 0.16s, background 0.16s",
      }}
    >
      {children}
    </button>
  );

  const MiniPanel = ({ label, title, body, color = C.cyan }: { label: string; title: string; body: string; color?: string }) => (
    <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}33`, borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase", color, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.5 }}>{body}</div>
    </div>
  );

  const deepDivePanels: Record<string, { label: string; title: string; body: string; color: string }> = {
    strength: { label: "Strength", title: `${arch} command center`, body: `You combine ${mbtiType} pattern-reading with ${primaryDisc} execution energy. Your edge is turning fuzzy signals into a clear next move.`, color: C.cyan },
    pressure: { label: "Pressure", title: "What happens under stress", body: bigFive.N > 55 ? "Your mind scans for risk quickly. Use that as an early-warning system, not a prison sentence." : "You usually stay composed, but may under-react until the issue is already expensive. Build earlier check-ins.", color: C.pink },
    environment: { label: "Environment", title: "Where you win fastest", body: bigFive.O > 65 ? "Give yourself novelty, autonomy, and hard problems. Repetitive maintenance without ownership drains your battery." : "You win in stable systems with practical targets, trusted routines, and clear standards for quality.", color: C.purple },
    watchout: { label: "Watch-out", title: "Growth lever", body: `Your ${primaryDisc} style can overuse its favorite weapon. Add one pause before big reactions: clarify the goal, then choose the tool.`, color: C.gold },
  };

  const roleCards = [
    {
      rank: "#1",
      title: roleMatch.primary.title,
      salary: roleMatch.primary.salary,
      pct: 96,
      why: `Strong match for ${mbtiType} decision patterns, ${primaryDisc} work style, and high-openness problem solving.`,
      daily: "Clarify goals, make judgment calls, communicate tradeoffs, and build momentum across people or systems.",
      skill: primaryDisc === "C" ? "Practice executive summary writing: one page, one recommendation, one risk." : "Build proof-of-work: one portfolio case study with measurable before/after outcomes.",
      firstMove: "This week: interview 2 people already doing the role and collect their actual day-to-day tasks.",
      primary: true,
    },
    {
      rank: "#2",
      title: roleMatch.secondary.title,
      salary: roleMatch.secondary.salary,
      pct: 84,
      why: "Adjacent fit with enough overlap to be realistic, but it will ask for a slightly different operating rhythm.",
      daily: "Balance execution with communication, deadlines, and visible output people can evaluate quickly.",
      skill: "Close the gap by building one public mini-project that demonstrates the core skill without needing permission.",
      firstMove: "This weekend: create a one-page role experiment and ship it to a friend, mentor, or small audience.",
      primary: false,
    },
  ];

  const roleSource = (rolesData as unknown as { roles: Record<string, { primary: Omit<CareerRoleOption, "source">; secondary: Omit<CareerRoleOption, "source"> }> }).roles;
  const customDreamRoles: CareerRoleOption[] = [
    { title: "AI Product Founder", salary: "$0-$500K+", desc: "Build and scale an AI product from insight to revenue.", source: "Dream paths" },
    { title: "Game Designer", salary: "$65K-$150K", desc: "Design systems, loops, worlds, and player progression.", source: "Dream paths" },
    { title: "UX Designer", salary: "$75K-$140K", desc: "Turn human behavior into useful digital experiences.", source: "Dream paths" },
    { title: "Software Engineer", salary: "$95K-$190K", desc: "Build robust systems, products, and tools with code.", source: "Dream paths" },
    { title: "Entrepreneur", salary: "$0-$500K+", desc: "Create value, validate demand, and build a durable business engine.", source: "Dream paths" },
    { title: "Creative Director", salary: "$90K-$180K", desc: "Lead creative vision across brand, product, and storytelling.", source: "Dream paths" },
    { title: "Product Manager", salary: "$100K-$190K", desc: "Translate customer pain, business strategy, and team execution into product wins.", source: "Dream paths" },
    { title: "AI Research Scientist", salary: "$130K-$300K", desc: "Advance models, experiments, and applied intelligence systems.", source: "Dream paths" },
  ];
  const dreamRoleOptions = Array.from(new Map([
    ...customDreamRoles,
    ...Object.values(roleSource).flatMap(entry => [entry.primary, entry.secondary].map(role => ({ ...role, source: "KYR role library" }))),
    ...roleCards.map(role => ({ title: role.title, salary: role.salary, desc: role.why, source: "Your matched roles" })),
  ].map(role => [role.title.toLowerCase(), role])).values()).sort((a, b) => a.title.localeCompare(b.title));
  const dreamRoleQuery = dreamRoleInput.trim().toLowerCase();
  const dreamRoleSuggestions = (dreamRoleQuery
    ? dreamRoleOptions.filter(role => role.title.toLowerCase().includes(dreamRoleQuery))
    : dreamRoleOptions.filter(role => [roleMatch.primary.title, roleMatch.secondary.title, "AI Product Founder", "Product Manager", "Game Designer", "Software Engineer"].includes(role.title))
  ).slice(0, 6);
  const submittedDreamRole = dreamRoleSubmitted.trim() || dreamRoleSelected || "AI Product Founder";
  const submittedRoleMeta = dreamRoleOptions.find(role => role.title.toLowerCase() === submittedDreamRole.toLowerCase()) || { title: submittedDreamRole, source: "Custom role" };
  const dreamRoleAnalysis = analyzeDreamRoleFit({
    role: submittedDreamRole,
    roleMeta: submittedRoleMeta,
    mbtiType,
    primaryDisc,
    disc,
    bigFive,
    primaryMatchTitle: roleMatch.primary.title,
    secondaryMatchTitle: roleMatch.secondary.title,
  });
  const dreamRoleMatch = dreamRoleAnalysis.match;
  const dreamRoleFitLabel = dreamRoleAnalysis.fitLabel;
  const dreamRoleWhy = dreamRoleAnalysis.evidence;
  const dreamRoleFriction = dreamRoleAnalysis.friction;
  const dreamRolePath = dreamRoleAnalysis.path;
  const submitDreamRole = (role = dreamRoleInput.trim() || dreamRoleSelected) => {
    const nextRole = role.trim();
    if (!nextRole) return;
    setDreamRoleSelected(nextRole);
    setDreamRoleInput(nextRole);
    setDreamRoleSubmitted(nextRole);
  };

  const blindspots = [
    {
      label: "Emotional Blindspot",
      text: "You can solve the problem before people feel understood.",
      response: "Say: 'I can see why that felt frustrating. Do you want support, a solution, or just space first?'",
      practice: [
        { id: "solve", text: "Jump straight to the fix", result: "Efficient, but it may make people feel handled instead of heard." },
        { id: "mirror", text: "Name the feeling first", result: "Best move. You keep your competence while adding emotional oxygen." },
      ],
      best: "mirror",
    },
    {
      label: "Impatience with Inefficiency",
      text: "High standards can make collaboration feel slower than doing it alone.",
      response: "Say: 'Here is the standard, here is why it matters, and here is the next smallest useful step.'",
      practice: [
        { id: "takeover", text: "Take the work back", result: "Fast today, expensive tomorrow. You train dependence." },
        { id: "standard", text: "Explain the standard", result: "Best move. You turn frustration into a reusable operating system." },
      ],
      best: "standard",
    },
  ];

  const hustleMultiplier = hustleGoal === "Scale" ? 650 : hustleGoal === "Validate" ? 420 : 250;
  const projectedIncome = Math.round(hustleHours * hustleMultiplier);
  const firstWeekendTask = hustleGoal === "Scale"
    ? "Package your best result into a repeatable offer and ask 5 warm contacts for referrals."
    : hustleGoal === "Validate"
      ? "Sell one tiny outcome before building more: write the promise, price it, and DM 10 likely buyers."
      : "Build a one-page landing page and a 60-second demo that proves the idea exists.";

  const selectedTipIndexes = Object.entries(selectedLearningTips).filter(([, selected]) => selected).map(([index]) => Number(index));
  const selectedTips = selectedTipIndexes.length > 0 ? selectedTipIndexes.map(index => learningStyle.tips[index]) : [learningStyle.tips[0]];
  const thinkingCorrect = thinkingAnswer === "constraint";
  const crossroadOptions = [
    { id: "comfort", label: "Comfort Move", title: "Stay with the known path", body: "Reliable, familiar, and safe — but it can quietly shrink the size of your future options." },
    { id: "growth", label: "Growth Move", title: "Choose the scarier useful path", body: "Messier at first, but it expands your range and forces your strengths to mature under real pressure." },
  ];

  const FEATURE_CARDS: Record<string, React.ReactNode> = {
    deepdive: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.cyan}, ${C.purple})`} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(34,211,238,0.1)", border: `1px solid rgba(34,211,238,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📖</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Deep Dive: {mbtiType}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{arch} · {primaryDisc} Cluster</div>
              </div>
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: C.glassBg, border: `1px solid ${C.glassBorder}`, color: C.purple }}>INTERACTIVE</div>
          </div>
          <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65, marginBottom: 12 }}>
            Tap a lens to inspect how your type behaves in real life. This turns the report into a tactical dashboard instead of another personality horoscope wearing a fake mustache.
          </p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
            {Object.entries(deepDivePanels).map(([id, panel]) => (
              <ActionButton key={id} active={activeDeepDiveMetric === id} onClick={() => setActiveDeepDiveMetric(id)}>{panel.label}</ActionButton>
            ))}
          </div>
          <MiniPanel {...deepDivePanels[activeDeepDiveMetric]} />
        </div>
      </GlassCard>
    ),
    roles: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.purple}, ${C.pink})`} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(168,85,247,0.1)", border: `1px solid rgba(168,85,247,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎁</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Your Role Matches</div>
                <div style={{ fontSize: 10, color: C.textDim }}>Tap a role to expand the career card</div>
              </div>
            </div>
          </div>
          {roleCards.map(r => {
            const expanded = expandedRoleRank === r.rank;
            return (
              <button
                key={r.rank}
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpandedRoleRank(expanded ? "" : r.rank)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: r.primary ? `rgba(34,211,238,0.06)` : "rgba(255,255,255,0.035)",
                  border: expanded ? `1px solid ${C.cyan}` : r.primary ? `1px solid rgba(34,211,238,0.2)` : `1px solid ${C.glassBorder}`,
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 8,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  color: C.text,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.textDim }}>{r.rank}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.cyan }}>{r.pct}% match {expanded ? "▲" : "▼"}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{r.title}</div>
                <div style={{ fontSize: 10, color: C.cyan, marginBottom: 8 }}>{r.salary}</div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: expanded ? 10 : 0 }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`, borderRadius: 2 }} />
                </div>
                {expanded && (
                  <div style={{ display: "grid", gap: 7 }}>
                    <MiniPanel label="Why it fits" title="Personality proof" body={r.why} color={C.purple} />
                    <MiniPanel label="Daily loop" title="What you actually do" body={r.daily} color={C.pink} />
                    <MiniPanel label="Skill gap" title="Bridge this next" body={r.skill} color={C.gold} />
                    <MiniPanel label="30-day action" title="First move" body={r.firstMove} color={C.cyan} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>
    ),
    blindspots: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, #ef4444, ${C.purple})`} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(239,68,68,0.1)", border: `1px solid rgba(239,68,68,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛡</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Your Blindspots</div>
                <div style={{ fontSize: 10, color: C.textDim }}>Flip the card, then practice a response</div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 9 }}>
            {blindspots.map((b, i) => {
              const isFlipped = Boolean(flippedBlindspots[i]);
              const selected = blindspotPractice[i];
              return (
                <div key={b.label} style={{ background: "rgba(255,255,255,0.035)", border: `1px solid rgba(239,68,68,0.18)`, borderRadius: 16, padding: 10 }}>
                  <button
                    type="button"
                    aria-pressed={isFlipped}
                    onClick={() => setFlippedBlindspots(prev => ({ ...prev, [i]: !prev[i] }))}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: 14,
                      background: isFlipped ? `linear-gradient(135deg, rgba(34,211,238,0.15), rgba(168,85,247,0.1))` : `linear-gradient(135deg, rgba(239,68,68,0.15), rgba(168,85,247,0.08))`,
                      border: isFlipped ? `1px solid rgba(34,211,238,0.28)` : `1px solid rgba(239,68,68,0.2)`,
                      padding: 12,
                      cursor: "pointer",
                      minHeight: 128,
                      fontFamily: "Inter, sans-serif",
                      color: C.text,
                    }}
                  >
                    <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: isFlipped ? C.cyan : "rgba(252,165,165,0.8)", marginBottom: 5 }}>{isFlipped ? "How to respond" : b.label}</div>
                    <div style={{ fontSize: 10, lineHeight: 1.5, fontWeight: 600, marginBottom: 8 }}>{isFlipped ? b.response : b.text}</div>
                    <div style={{ fontSize: 8, color: C.textDim }}>{isFlipped ? "Tap to see blindspot ↺" : "Tap for response →"}</div>
                  </button>
                  {isFlipped && (
                    <div style={{ marginTop: 9 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 7 }}>Practice choice</div>
                      {b.practice.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setBlindspotPractice(prev => ({ ...prev, [i]: option.id }))}
                          style={{ width: "100%", textAlign: "left", marginBottom: 6, borderRadius: 10, padding: "8px 9px", border: selected === option.id ? `1px solid ${option.id === b.best ? "#4ade80" : C.gold}` : `1px solid ${C.glassBorder}`, background: selected === option.id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)", color: C.textMuted, fontSize: 10, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                        >
                          {option.text}
                        </button>
                      ))}
                      {selected && (
                        <div style={{ fontSize: 10, color: selected === b.best ? "#86efac" : C.goldLight, lineHeight: 1.45, marginTop: 4 }}>
                          {b.practice.find(option => option.id === selected)?.result}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    ),
    hustles: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.gold}, ${C.goldLight})`} />
        <div style={{ padding: 18 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(245,158,11,0.18)`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 7 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{hustle.title}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>Interactive launch planner</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "3px 8px", borderRadius: 8 }}>{hustle.income}</div>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 12 }}>{hustle.desc}</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
              {["Launch", "Validate", "Scale"].map(goal => <ActionButton key={goal} active={hustleGoal === goal} onClick={() => setHustleGoal(goal)}>{goal}</ActionButton>)}
            </div>
            <label style={{ display: "block", fontSize: 10, color: C.textDim, marginBottom: 6 }}>Weekly hours: <strong style={{ color: C.text }}>{hustleHours}</strong></label>
            <input type="range" min={3} max={15} value={hustleHours} onChange={(e) => setHustleHours(Number(e.target.value))} style={{ width: "100%", accentColor: C.gold, marginBottom: 12 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 10 }}>
              <MiniPanel label="Target" title={`~$${projectedIncome.toLocaleString()}/mo`} body="Projected once the offer is packaged, tested, and repeated consistently." color="#4ade80" />
              <MiniPanel label="First weekend" title={hustleGoal} body={firstWeekendTask} color={C.gold} />
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {hustle.tags.map(m => <div key={m} style={{ fontSize: 10, color: C.textDim, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.glassBorder}`, borderRadius: 999, padding: "5px 8px" }}>{m}</div>)}
            </div>
          </div>
        </div>
      </GlassCard>
    ),
    learning: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, #14b8a6, ${C.cyan})`} />
        <div style={{ padding: 18 }}>
          <div style={{ background: "rgba(20,184,166,0.06)", border: `1px solid rgba(20,184,166,0.18)`, borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 3 }}>🎓 {learningStyle.title}</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 12 }}>{learningStyle.desc}</div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 8 }}>Choose tactics for your plan</div>
            {learningStyle.tips.map((tip, index) => {
              const selected = Boolean(selectedLearningTips[index]);
              return (
                <button key={tip} type="button" onClick={() => setSelectedLearningTips(prev => ({ ...prev, [index]: !prev[index] }))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", background: selected ? "rgba(20,184,166,0.14)" : "rgba(255,255,255,0.03)", border: selected ? `1px solid #14b8a6` : `1px solid ${C.glassBorder}`, borderRadius: 10, marginBottom: 6, fontSize: 11, color: selected ? C.text : C.textMuted, cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" }}>
                  <span style={{ fontSize: 14 }}>{selected ? "✅" : tip.split(" ")[0]}</span>{tip.substring(2)}
                </button>
              );
            })}
            <div style={{ marginTop: 10, display: "grid", gap: 7 }}>
              <MiniPanel label="5-minute mode" title="Micro rep" body={`Open with: ${selectedTips[0].replace(/^\S+\s/, "")}. Capture one sentence of proof.`} color="#14b8a6" />
              <MiniPanel label="30-minute mode" title="Focused sprint" body="Pick one tactic, remove one distraction, produce one artifact you can show another human." color={C.cyan} />
              <MiniPanel label="Weekend mode" title="Applied project" body="Turn your selected tactics into a tiny case study: goal, method, result, next iteration." color={C.purple} />
            </div>
          </div>
        </div>
      </GlassCard>
    ),
    thinking: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, #6366f1, #818cf8)`} />
        <div style={{ padding: 18 }}>
          <div style={{ background: "rgba(99,102,241,0.08)", border: `1px solid rgba(99,102,241,0.18)`, borderRadius: 16, padding: 16 }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🧩</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>{mbtiType} Thinking Challenge</div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>Scenario: your team has 10 ideas, 2 weeks, and no clear winner. What sharpens the decision fastest?</div>
            </div>
            {[
              { id: "more", label: "Generate 20 more ideas", feedback: "Classic attractive chaos. Fun, but the bottleneck is judgment, not novelty." },
              { id: "constraint", label: "Add one hard constraint", feedback: "Correct. A constraint turns vague debate into ranked tradeoffs." },
              { id: "delay", label: "Wait for more certainty", feedback: "Tempting, but certainty usually arrives dressed as a deadline with a baseball bat." },
            ].map(option => {
              const selected = thinkingAnswer === option.id;
              return (
                <button key={option.id} type="button" onClick={() => { setThinkingAnswer(option.id); setThinkingStreak(option.id === "constraint" ? thinkingStreak + 1 : 0); }} style={{ width: "100%", textAlign: "left", borderRadius: 11, padding: "9px 10px", marginBottom: 7, border: selected ? `1px solid ${option.id === "constraint" ? "#4ade80" : C.gold}` : `1px solid ${C.glassBorder}`, background: selected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)", color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  {option.label}
                </button>
              );
            })}
            {thinkingAnswer && (
              <div style={{ marginTop: 9 }}>
                <MiniPanel label={thinkingCorrect ? "Solved" : "Try again insight"} title={thinkingCorrect ? `Streak: ${thinkingStreak}` : "Useful miss"} body={[
                  { id: "more", feedback: "Classic attractive chaos. Fun, but the bottleneck is judgment, not novelty." },
                  { id: "constraint", feedback: "Correct. A constraint turns vague debate into ranked tradeoffs. Your drill: define the one metric that matters before comparing options." },
                  { id: "delay", feedback: "Tempting, but certainty usually arrives dressed as a deadline with a baseball bat." },
                ].find(option => option.id === thinkingAnswer)?.feedback || "Pick an answer to get feedback."} color={thinkingCorrect ? "#4ade80" : C.gold} />
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    ),
    crossroads: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.purple}, ${C.cyan})`} />
        <div style={{ padding: 18 }}>
          <div style={{ background: `linear-gradient(135deg, rgba(168,85,247,0.1), rgba(34,211,238,0.05))`, border: `1px solid rgba(168,85,247,0.18)`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 4, textAlign: "center" }}>{crossroad.heading}</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 14, textAlign: "center" }}>{crossroad.desc}</div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
              {crossroad.tags.map(t => <div key={t} style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.glassBorder}`, borderRadius: 100, color: C.textMuted }}>{t}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9 }}>
              {crossroadOptions.map(option => {
                const selected = crossroadsChoice === option.id;
                return (
                  <button key={option.id} type="button" onClick={() => setCrossroadsChoice(option.id)} style={{ textAlign: "left", borderRadius: 14, padding: 12, border: selected ? `1px solid ${option.id === "growth" ? C.cyan : C.gold}` : `1px solid ${C.glassBorder}`, background: selected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.035)", color: C.text, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: selected ? (option.id === "growth" ? C.cyan : C.gold) : C.textDim, marginBottom: 5 }}>{option.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 5 }}>{option.title}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.45 }}>{option.body}</div>
                  </button>
                );
              })}
            </div>
            {crossroadsChoice && (
              <div style={{ marginTop: 10 }}>
                <MiniPanel label="Your next quest" title={crossroadsChoice === "growth" ? "Take the growth move" : "Make comfort conscious"} body={crossroadsChoice === "growth" ? "Within 24 hours, take the smallest irreversible step: send the message, ship the draft, book the call, or publish the offer." : "If you choose the safe path, define what would make it worth revisiting in 30 days. Comfort is fine. Sleepwalking is the villain."} color={crossroadsChoice === "growth" ? C.cyan : C.gold} />
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    ),
  };

  // Demo mode: show banner at top, then full premium content
  if (isDemo) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: C.text, overflowX: "hidden" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
        <AuroraBg />
        <TopNav premium={true} />
        <div style={{ padding: "10px 20px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 100, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", fontSize: 11, fontWeight: 600, color: "#c084fc" }}>
            🎨 Demo Mode — Premium content preview (payment not required)
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 16px 100px" }}>
          <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>🔮</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Your Premium Results</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{mbtiType} · Premium Profile · All 7 premium insights unlocked</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 24, position: "relative" }}>
            {CONSTELLATION_ITEMS.map((item, i) => (
              <div key={item.id} style={{ position: "relative", width: 56, height: 72 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: i === 0 ? `linear-gradient(135deg, ${C.cyan}, ${C.purple})` : C.glassBg, border: i === 0 ? "none" : `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, position: "relative", zIndex: 1, boxShadow: i === 0 ? `0 0 20px rgba(34,211,238,0.4)` : "none" }}>
                  {item.icon}
                </div>
                {i < CONSTELLATION_ITEMS.length - 1 && <div style={{ position: "absolute", top: 26, left: 52, right: -4, height: 1, background: `linear-gradient(90deg, ${C.glassBorder}, transparent)` }} />}
                <div style={{ fontSize: 8, fontWeight: 600, color: C.textMuted, textAlign: "center", marginTop: 4 }}>{item.name}</div>
              </div>
            ))}
          </div>
          <div style={{ animation: "cardEnter 0.4s ease-out" } as React.CSSProperties}>
            <style>{`@keyframes cardEnter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
            {FEATURE_CARDS.deepdive}
          </div>
        </div>
        <PrivacyStrip />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 16px 100px" }}>
      {/* Premium Hero */}
      <div style={{ padding: "28px 0 20px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px",
          background: "rgba(34,211,238,0.08)",
          border: `1px solid rgba(34,211,238,0.25)`,
          borderRadius: 100, fontSize: 10, fontWeight: 700,
          color: C.cyan, letterSpacing: 1.5, textTransform: "uppercase",
          marginBottom: 16, boxShadow: "0 0 20px rgba(34,211,238,0.1)",
        }}>
          <span style={{ fontSize: 7, animation: "starPulse 2s ease-in-out infinite" }}>✦</span>
          Premium Unlocked
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: "-0.3px" }}>Your Personality Nexus</h1>
        <p style={{ fontSize: 13, color: C.textMuted }}>{type.split("-")[0]} · {arch}</p>
      </div>

      {/* Profile Stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <GlassCard glow style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(34,211,238,0.12), rgba(168,85,247,0.08))`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.purple}, ${C.pink})` }} />
          <div style={{ padding: "20px 22px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: C.textDim, marginBottom: 8 }}>Your Type</div>
            <div style={{ fontSize: 36, fontWeight: 800, background: `linear-gradient(135deg, ${C.cyan}, #67e8f9, ${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1, marginBottom: 4, letterSpacing: "-1px" }}>{type}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.cyan, marginBottom: 2 }}>{arch}</div>
            <div style={{ fontSize: 10, color: C.textDim }}>Only <strong style={{ color: C.textMuted }}>{POPULATION_RATES[mbtiType] || "2.4%"}</strong> of the population shares this type</div>
          </div>
        </GlassCard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { icon: "📊", value: primary, label: "DISC Style", sub: DISC_LABELS[primary as keyof typeof DISC_LABELS], bar: disc[primary as keyof typeof disc], barColor: DISC_COLORS[primary as keyof typeof DISC_COLORS], cardColor: "cyan" },
            { icon: "🎯", value: `${bigFive.O}%`, label: "Openness", sub: "87th percentile", bar: bigFive.O, barColor: C.cyan, cardColor: "purple" },
          ].map((c, i) => (
            <div key={i} style={{
              borderRadius: 16, padding: "14px 16px",
              background: c.cardColor === "cyan" ? "rgba(34,211,238,0.06)" : "rgba(168,85,247,0.06)",
              border: c.cardColor === "cyan" ? `1px solid rgba(34,211,238,0.15)` : `1px solid rgba(168,85,247,0.15)`,
            }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 2, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textDim }}>{c.label}</div>
              <div style={{ fontSize: 9, color: C.textDim, marginTop: 3 }}>{c.sub}</div>
              <div style={{ marginTop: 8, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${c.bar}%`, height: "100%", background: `linear-gradient(90deg, ${c.barColor}, ${c.barColor}80)`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constellation Section */}
      <SectionLabel>Explore Insights</SectionLabel>
      <div style={{ fontSize: 9, color: C.textDim, textAlign: "center", marginBottom: 6 }}>
        Tap any insight circle
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 4,
          alignItems: "start",
          margin: "0 auto 12px",
          maxWidth: 420,
          width: "100%",
          userSelect: "none",
        }}
      >
        {CONSTELLATION_ITEMS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={activeCard === item.id}
            onClick={() => setActiveCard(item.id)}
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              cursor: "pointer",
              background: "transparent",
              border: "none",
              padding: index % 2 === 0 ? "0 0 2px" : "10px 0 2px",
              fontFamily: "Inter, sans-serif",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, position: "relative", transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
              background: activeCard === item.id ? "rgba(34,211,238,0.14)" : C.glassBg,
              border: activeCard === item.id ? `1.5px solid ${C.cyan}` : `1.5px solid ${C.glassBorder}`,
              boxShadow: activeCard === item.id ? `0 0 18px rgba(34,211,238,0.28), 0 0 34px rgba(34,211,238,0.1)` : "none",
              transform: activeCard === item.id ? "scale(1.08)" : "scale(1)",
            }}>
              <style>{`
                @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              `}</style>
              <div style={{
                position: "absolute", inset: -3, borderRadius: "50%",
                border: "1px dashed rgba(255,255,255,0.08)",
                animation: "orbitSpin 12s linear infinite",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), transparent 60%)",
                pointerEvents: "none",
              }} />
              {item.icon}
            </div>
            <div style={{
              fontSize: 7,
              fontWeight: 700,
              color: activeCard === item.id ? C.cyan : C.textMuted,
              textAlign: "center",
              lineHeight: 1.12,
              width: "100%",
              minHeight: 16,
              transition: "color 0.2s",
            }}>{item.name}</div>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: activeCard === item.id ? C.cyan : C.textDim,
              boxShadow: activeCard === item.id ? `0 0 6px ${C.cyan}` : "none",
              transition: "all 0.2s",
            }} />
          </button>
        ))}
      </div>

      {/* Feature Card */}
      <div style={{ animation: "cardEnter 0.4s ease-out" } as React.CSSProperties}>
        <style>{`
          @keyframes cardEnter {
            from { opacity: 0; transform: translateY(16px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        {FEATURE_CARDS[activeCard]}
      </div>

      {/* Dream Role Advisor */}
      <SectionLabel>Dream Role Advisor</SectionLabel>
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.cyan}, ${C.purple})`} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, background: `linear-gradient(135deg, rgba(34,211,238,0.15), rgba(168,85,247,0.1))`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎯</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Dream Role Advisor</div>
              <div style={{ fontSize: 11, color: C.cyanDim }}>Pick a role or type your own — get fit %, friction, and a path</div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); submitDreamRole(); }} style={{ display: "grid", gap: 9, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                list="dream-role-options"
                value={dreamRoleInput}
                onChange={(e) => setDreamRoleInput(e.target.value)}
                onFocus={() => setDreamRoleInput(dreamRoleInput || dreamRoleSelected)}
                placeholder="Type a dream role… e.g. Game Designer"
                aria-label="Dream role"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid rgba(34,211,238,0.2)`,
                  borderRadius: 12, padding: "10px 12px",
                  color: C.text, fontSize: 12, outline: "none",
                  fontFamily: "Inter, sans-serif", transition: "border-color 0.2s",
                }}
              />
              <datalist id="dream-role-options">
                {dreamRoleOptions.map(role => <option key={role.title} value={role.title} />)}
              </datalist>
              <button type="submit" style={{
                minWidth: 42, height: 40,
                background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                border: "none", borderRadius: 12, color: C.text,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16, fontWeight: 900,
                boxShadow: "0 4px 15px rgba(34,211,238,0.2)",
              }}>→</button>
            </div>

            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: C.textDim }}>Smart suggestions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {dreamRoleSuggestions.map(role => (
                <button
                  key={role.title}
                  type="button"
                  onClick={() => submitDreamRole(role.title)}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "5px 9px",
                    background: submittedDreamRole.toLowerCase() === role.title.toLowerCase() ? "rgba(34,211,238,0.14)" : "rgba(255,255,255,0.04)",
                    border: submittedDreamRole.toLowerCase() === role.title.toLowerCase() ? `1px solid ${C.cyan}` : `1px solid rgba(34,211,238,0.15)`,
                    borderRadius: 999,
                    color: submittedDreamRole.toLowerCase() === role.title.toLowerCase() ? C.cyan : C.cyanDim,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {role.title}
                </button>
              ))}
            </div>
          </form>

          <div style={{ background: "rgba(255,255,255,0.035)", border: `1px solid rgba(34,211,238,0.18)`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 2 }}>{submittedDreamRole}</div>
                <div style={{ fontSize: 9, color: C.textDim }}>{submittedRoleMeta.source}{submittedRoleMeta.salary ? ` · ${submittedRoleMeta.salary}` : " · custom analysis"}</div>
                <div style={{ fontSize: 9, color: C.cyanDim, marginTop: 2 }}>{dreamRoleAnalysis.categoryText}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: dreamRoleMatch >= 76 ? C.cyan : C.gold }}>{dreamRoleMatch}%</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.textDim, textTransform: "uppercase" }}>{dreamRoleFitLabel}</div>
              </div>
            </div>
            <div style={{ height: 7, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ width: `${dreamRoleMatch}%`, height: "100%", background: `linear-gradient(90deg, ${C.cyan}, ${C.purple}, ${C.pink})`, borderRadius: 999 }} />
            </div>
            <div style={{ display: "grid", gap: 7 }}>
              <MiniPanel label="Why you match" title="Personality evidence" body={dreamRoleWhy.join(" ")} color={C.cyan} />
              <MiniPanel label="Friction" title="What could get in the way" body={dreamRoleFriction} color={C.gold} />
              <MiniPanel label="Leverage" title="Use your unfair edge" body={dreamRoleAnalysis.leverage} color={C.purple} />
            </div>
          </div>

          <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: C.textDim, marginBottom: 10 }}>Your 4-Step Path</div>
          {dreamRolePath.map(s => (
            <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, background: "rgba(255,255,255,0.025)", border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: 9 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(34,211,238,0.1)", border: `1px solid rgba(34,211,238,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.cyan, flexShrink: 0 }}>{s.num}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.45 }}>{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <PrivacyStrip />
    </div>
  );
}

// ─── Main Results Page ───────────────────────────────────────────────────────
export default function ResultsPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState<1 | 3>(() => {
    if (typeof window === 'undefined') return 1;
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page');
    return p === '3' ? 3 : 1;
  });
  const realResults = useRealResults(mounted);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Sync page state ↔ URL ─────────────────────────────────────────────────
  // On mount: read ?page= from URL. Page 2 was removed; old page=2 links fall back to Full Portrait.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    setPage(pageParam === "3" ? 3 : 1);
  }, []);

  // On page change: update URL without page reload
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    window.history.replaceState({}, "", url.toString());
  }, [page]);

  // Still loading or no results yet
  if (!realResults) {
    return (
      <div style={{ background: "#080414", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter, sans-serif" }}>Loading your results…</div>
      </div>
    );
  }

  const { type, bigFive, disc, mbtiType, primaryDisc, rawScores, isDemo, discDesc } = realResults;

  const bottomBarActive = page === 1 ? "p1" : "p3";

  // ─── Premium Navigation Handler ─────────────────────────────────────────────

  // Premium button - bypass Stripe, go directly to Page 3
  // TODO (stripe-ready): Re-add Stripe checkout flow here when premium payments are enabled.
  const handlePremium = () => { setPage(3); };

  // Bottom bar "Premium" click — delegates to handlePremium for Stripe checkout
  const handleBottomBarPremiumClick = () => {
    handlePremium();
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />

      <AuroraBg />
      <AppHeader />

      {page === 1 && <Page1FullPortrait type={type} bigFive={bigFive} disc={disc} mbtiType={mbtiType} primaryDisc={primaryDisc} rawScores={rawScores} discDesc={discDesc} />}
      {page === 3 && <Page3PremiumNexus type={type} bigFive={bigFive} disc={disc} mbtiType={mbtiType} primaryDisc={primaryDisc} isDemo={isDemo} />}

      <BottomBar
        active={bottomBarActive}
        onNavigate={setPage}
        onPremiumClick={handleBottomBarPremiumClick}
      />


      {/* Site footer — consistent with rest of site */}
      <AppFooter />
    </div>
  );
}
