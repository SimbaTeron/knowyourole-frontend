'use client';

import { useState, useEffect, useRef } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { isTestMode, getFakeScores, getFakeMBTIType } from "@/utils/devTest";
import { calculateResult, findBestRoleMatch, type CareerRoleMatch } from "@/components/results/resultsData";
import type { QuizScores } from "@/components/Quiz";
import rolesData from "@/data/roles.json";
import { trackKyrEvent } from "@/lib/analytics";
import { calculateMbtiAxisConfidence, resultConfidenceLabel as getResultConfidenceLabel } from "@/lib/scoring";

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

function getArchetype(mbti: string) {
  return ARCHETYPES[mbti] || "The Architect";
}

function stripLeadingThe(label: string) {
  return label.replace(/^The\s+/i, "");
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

const MBTI_SHARE_INSIGHTS: Record<string, string> = {
  INTJ: "I turn patterns into strategy, then strategy into systems.",
  INTP: "I pressure-test ideas until the clean logic underneath shows up.",
  ENTJ: "I turn ambition into direction, momentum, and measurable wins.",
  ENTP: "I find the angle everyone missed and turn it into possibility.",
  INFJ: "I read the deeper pattern and build meaning around it.",
  INFP: "I protect the inner signal and turn values into creative direction.",
  ENFJ: "I organize people around a vision they can actually feel.",
  ENFP: "I connect sparks, people, and possibilities into forward motion.",
  ISTJ: "I make good work repeatable, reliable, and built to last.",
  ISFJ: "I notice what people need and turn care into steady action.",
  ESTJ: "I bring order, standards, and execution when things get vague.",
  ESFJ: "I keep people aligned, supported, and moving together.",
  ISTP: "I solve by testing the mechanism, not worshipping the manual.",
  ISFP: "I follow what feels true and shape it into something tangible.",
  ESTP: "I read the room fast and move before the moment disappears.",
  ESFP: "I bring energy into the room and make experience impossible to ignore.",
};

const DISC_SHARE_MOVES: Record<string, string> = {
  "Dominant": "direct, decisive movement",
  "Influential": "expressive, people-forward momentum",
  "Steady": "calm, consistent follow-through",
  "Conscientious": "precise, evidence-led execution",
};

function getShareInsight(mbti: string, discLabel: string) {
  const base = MBTI_SHARE_INSIGHTS[mbti] || "I use my personality signal as a compass, not a cage.";
  const discMove = DISC_SHARE_MOVES[discLabel] || `${discLabel.toLowerCase()} execution`;
  return `${base} My ${discLabel} style adds ${discMove}.`;
}

type AnswerEvidenceSnippet = {
  label: string;
  title: string;
  body: string;
  evidence: string[];
  color: string;
};

function summarizeSelectedLabels(labels: string[]) {
  const clean = labels
    .map(label => label.trim())
    .filter(Boolean)
    .filter((label, index, all) => all.indexOf(label) === index)
    .slice(0, 3);
  return clean.length ? clean : [];
}

function buildAnswerEvidenceSnippets({ rawScores, mbtiType, primaryDisc, topBigFiveKey, topBigFiveLabel }: {
  rawScores?: QuizScores;
  mbtiType: string;
  primaryDisc: string;
  topBigFiveKey: string;
  topBigFiveLabel: string;
}): AnswerEvidenceSnippet[] {
  const responses = rawScores?.responses ?? [];
  const labelFor = (response: (typeof responses)[number]) => response.selectedOptionLabel || response.selectedOptionMeta || "";
  const mbtiLetters = new Set(mbtiType.replace(/X/g, "").split(""));
  const mbtiEvidence = summarizeSelectedLabels(
    responses
      .filter(response => response.psych?.startsWith("MBTI") && response.selectedOptionMeta && mbtiLetters.has(response.selectedOptionMeta))
      .map(labelFor)
  );
  const discEvidence = summarizeSelectedLabels(
    responses
      .filter(response => response.psych?.startsWith("DISC") && response.selectedOptionMeta === primaryDisc)
      .map(labelFor)
  );
  const bigFiveEvidence = summarizeSelectedLabels(
    responses
      .filter(response => response.psych?.startsWith(`Big5-${topBigFiveKey}`) && response.selectedOptionMeta === `${topBigFiveKey}+`)
      .map(labelFor)
  );

  return [
    {
      label: "Personality signal",
      title: `${mbtiType} came from repeated letter choices`,
      body: mbtiEvidence.length
        ? "These answers pushed your four-letter pattern in this direction."
        : "Your MBTI-style pattern came from the balance of recharge, information, decision, and planning signals across the quiz.",
      evidence: mbtiEvidence.length ? mbtiEvidence : ["letter balance", "close-call axes", "overall MBTI pattern"],
      color: C.purple,
    },
    {
      label: "Communication signal",
      title: `${DISC_LABELS[primaryDisc] || primaryDisc} showed up most`,
      body: discEvidence.length
        ? "These choices explain why your social/work style landed here."
        : "Your DISC-style result came from how often you favored direction, social energy, steadiness, or precision.",
      evidence: discEvidence.length ? discEvidence : ["style balance", "primary DISC share", "communication pattern"],
      color: DISC_COLORS[primaryDisc] || C.cyan,
    },
    {
      label: "Trait signal",
      title: `${topBigFiveLabel} was the strongest trait theme`,
      body: bigFiveEvidence.length
        ? "These answers are part of why this Big Five trait became the headline."
        : "Your strongest Big Five trait came from the pattern of trait-coded answers, not one dramatic click.",
      evidence: bigFiveEvidence.length ? bigFiveEvidence : ["trait-coded answers", "score spread", "top Big Five signal"],
      color: C.cyan,
    },
  ];
}

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

// P3 premium content — MBTI-specific side hustles and learning styles
type SideHustleProfile = {
  title: string;
  income: string;
  desc: string;
  audience: string;
  offer: string;
  positioning: string;
  firstProduct: string;
  channels: string[];
  skills: string[];
  proof: string;
  pricing: { starter: string; core: string; premium: string };
  roadmap: { phase: "Launch" | "Validate" | "Scale"; focus: string; task: string; metric: string }[];
  risks: string[];
  tags: string[];
};

const SIDE_HUSTLES: Record<string, SideHustleProfile> = {
  INTJ: { title: "AI Strategy Consultant", income: "+$4.2K/mo", desc: "Design AI workflows, decision systems, and operating dashboards for founders and small teams.", audience: "solo founders, consultants, and expert operators drowning in decisions", offer: "a 2-week AI operating-system audit with workflow maps, prompt kits, and one automated dashboard", positioning: "sell clarity and leverage, not generic AI hype", firstProduct: "Notion/Sheets AI strategy dashboard + 60-minute implementation call", channels: ["LinkedIn teardown posts", "founder communities", "cold email to niche agencies"], skills: ["systems mapping", "prompt/workflow design", "strategic diagnosis"], proof: "Publish one before/after workflow teardown showing hours saved and decisions clarified.", pricing: { starter: "$250 audit", core: "$1.5K setup", premium: "$4K monthly advisory" }, roadmap: [
    { phase: "Launch", focus: "Package the thinking", task: "Create a one-page offer around AI workflow clarity for one niche.", metric: "1 public teardown + 10 direct messages" },
    { phase: "Validate", focus: "Sell before polishing", task: "Run 3 paid diagnostic calls and turn repeated pain into the core package.", metric: "3 paid calls or 1 setup sale" },
    { phase: "Scale", focus: "Productize the audit", task: "Template the intake, dashboard, and implementation checklist.", metric: "2 repeatable delivery assets" },
  ], risks: ["overbuilding the framework before anyone buys", "sounding too abstract for non-strategists"], tags: ["⏱ 8–10 hrs/wk", "📈 $3K–$6K/mo", "🎯 High fit"] },
  INTP: { title: "Research Intelligence Studio", income: "+$3.8K/mo", desc: "Turn messy information into research briefs, comparison maps, and lightweight knowledge tools.", audience: "analysts, creators, and founders who need signal from noisy research", offer: "weekly research memos plus a searchable source library for one niche", positioning: "make complex topics legible enough to act on", firstProduct: "paid research brief with source map and recommendation matrix", channels: ["Substack deep dives", "Reddit/Discord expert communities", "cold outreach to niche newsletters"], skills: ["research synthesis", "technical explanation", "source evaluation"], proof: "Publish a sample brief that turns 20 sources into one clear decision.", pricing: { starter: "$150 brief", core: "$900 research sprint", premium: "$2.5K/mo intelligence retainer" }, roadmap: [
    { phase: "Launch", focus: "Pick a research niche", task: "Write one public brief answering an expensive question.", metric: "1 brief + 5 expert replies" },
    { phase: "Validate", focus: "Charge for depth", task: "Offer a custom decision memo to 10 people already asking that question.", metric: "2 paid briefs" },
    { phase: "Scale", focus: "Build the library", task: "Turn repeat sources and frameworks into a searchable template.", metric: "1 reusable research database" },
  ], risks: ["staying in private curiosity mode", "shipping essays when buyers need decisions"], tags: ["⏱ 6–9 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] },
  ENTJ: { title: "Execution Systems Advisor", income: "+$5.1K/mo", desc: "Install accountability rhythms, decision cadences, and leadership dashboards for ambitious teams.", audience: "founders, team leads, and creators whose growth has outrun their operating system", offer: "a 30-day execution reset: priorities, meeting cadence, owner map, and KPI dashboard", positioning: "turn ambition into a machine that ships", firstProduct: "leadership scorecard + weekly execution review template", channels: ["LinkedIn leadership posts", "operator Slack groups", "warm intros from founders"], skills: ["prioritization", "leadership communication", "operating cadence design"], proof: "Show a sample weekly scorecard that turns chaos into visible ownership.", pricing: { starter: "$300 scorecard review", core: "$2K execution reset", premium: "$6K/mo operator advisory" }, roadmap: [
    { phase: "Launch", focus: "Name the costly bottleneck", task: "Create an execution audit for teams missing deadlines or owner clarity.", metric: "10 founder conversations" },
    { phase: "Validate", focus: "Run paid resets", task: "Sell 2 fixed-scope execution resets with before/after metrics.", metric: "2 paid clients" },
    { phase: "Scale", focus: "Retainerize accountability", task: "Add weekly leadership review calls and KPI hygiene.", metric: "1 retainer conversion" },
  ], risks: ["coming in too forcefully before trust exists", "selling leadership theory instead of a measurable operating fix"], tags: ["⏱ 5–8 hrs/wk", "📈 $4K–$7K/mo", "🎯 High fit"] },
  ENTP: { title: "Offer Lab Consultant", income: "+$3.5K/mo", desc: "Help creators and founders stress-test offers, angles, and go-to-market experiments.", audience: "early-stage founders and creators with too many ideas and no winning offer", offer: "a rapid offer sprint with positioning, objection map, and 3 market tests", positioning: "find the angle that makes people care", firstProduct: "90-minute offer teardown with three testable hooks", channels: ["X/LinkedIn teardown threads", "startup communities", "podcast guest audits"], skills: ["ideation", "positioning", "objection handling"], proof: "Publicly rewrite a weak offer into three sharper market angles.", pricing: { starter: "$200 teardown", core: "$1.2K offer sprint", premium: "$3K/mo growth lab" }, roadmap: [
    { phase: "Launch", focus: "Create visible teardowns", task: "Post 5 offer rewrites for real products.", metric: "5 posts + 15 target comments" },
    { phase: "Validate", focus: "Charge for the sprint", task: "Run 3 paid teardowns and track which hooks get replies.", metric: "3 paid sessions" },
    { phase: "Scale", focus: "Build a repeatable lab", task: "Template discovery, angle generation, and test scripts.", metric: "1 sprint playbook" },
  ], risks: ["pivoting before one offer gets tested", "winning debates instead of buyer clarity"], tags: ["⏱ 4–7 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] },
  INFJ: { title: "Transition Clarity Coach", income: "+$3.2K/mo", desc: "Guide people through career, identity, or life transitions with structured reflection and action.", audience: "thoughtful professionals who feel misaligned but cannot yet name the next chapter", offer: "a 4-session transition map: pattern diagnosis, values filter, decision options, and next-step plan", positioning: "deep clarity without vague life-coach fog", firstProduct: "guided transition audit + written clarity map", channels: ["long-form essays", "private referrals", "career-change communities"], skills: ["pattern reading", "empathetic questioning", "decision framing"], proof: "Publish an anonymized transition map showing before/after clarity.", pricing: { starter: "$180 clarity session", core: "$900 4-session map", premium: "$2.4K 12-week container" }, roadmap: [
    { phase: "Launch", focus: "Define the transition", task: "Write a landing section for one painful transition you understand deeply.", metric: "5 discovery calls" },
    { phase: "Validate", focus: "Package transformation", task: "Sell 3 clarity sessions and document repeated patterns.", metric: "3 paid sessions" },
    { phase: "Scale", focus: "Create a container", task: "Turn the process into a 4-session arc with worksheets.", metric: "1 repeatable client journey" },
  ], risks: ["overholding clients instead of creating decisions", "hiding the offer because it feels too personal"], tags: ["⏱ 5–8 hrs/wk", "📈 $2K–$4K/mo", "🎯 High fit"] },
  INFP: { title: "Meaningful Copy Studio", income: "+$2.8K/mo", desc: "Write emotionally resonant landing pages, emails, and founder stories for values-led brands.", audience: "mission-driven founders and creators whose message sounds flatter than their work", offer: "brand voice + landing page copy sprint", positioning: "make the honest thing persuasive without making it fake", firstProduct: "homepage hero rewrite + brand voice notes", channels: ["portfolio essays", "creator communities", "direct outreach to values-led brands"], skills: ["voice", "storytelling", "emotional positioning"], proof: "Publish three before/after copy rewrites with explanation.", pricing: { starter: "$150 hero rewrite", core: "$900 copy sprint", premium: "$2.5K launch package" }, roadmap: [
    { phase: "Launch", focus: "Show taste", task: "Rewrite 3 public pages and explain the emotional strategy.", metric: "3 portfolio samples" },
    { phase: "Validate", focus: "Sell a specific asset", task: "Offer hero-section rewrites to 20 aligned founders.", metric: "2 paid rewrites" },
    { phase: "Scale", focus: "Package launch copy", task: "Bundle landing page, emails, and voice guide.", metric: "1 full package sold" },
  ], risks: ["waiting for perfect inspiration", "underpricing because the work feels personal"], tags: ["⏱ 4–6 hrs/wk", "📈 $1K–$4K/mo", "🎯 High fit"] },
  ENFJ: { title: "Team Culture Sprint", income: "+$4.0K/mo", desc: "Help small teams improve trust, rituals, feedback, and internal communication.", audience: "founders and team leads with talented people but messy alignment", offer: "a culture sprint with team pulse survey, ritual redesign, and feedback scripts", positioning: "make good teams easier to belong to and harder to break", firstProduct: "team pulse audit + meeting ritual redesign", channels: ["people-ops LinkedIn", "founder referrals", "remote-work communities"], skills: ["facilitation", "feedback design", "group energy reading"], proof: "Share a sample team ritual map that improves alignment without corporate wallpaper.", pricing: { starter: "$250 pulse audit", core: "$1.5K culture sprint", premium: "$4K/mo team advisory" }, roadmap: [
    { phase: "Launch", focus: "Sell one team pain", task: "Package a meeting/feedback reset for teams under 20 people.", metric: "8 founder/team-lead calls" },
    { phase: "Validate", focus: "Facilitate outcomes", task: "Run 2 paid workshops and collect before/after pulse ratings.", metric: "2 workshops" },
    { phase: "Scale", focus: "Advisory rhythm", task: "Add monthly pulse reviews and manager scripts.", metric: "1 recurring client" },
  ], risks: ["absorbing team emotion without boundaries", "making harmony more important than useful truth"], tags: ["⏱ 6–9 hrs/wk", "📈 $3K–$5K/mo", "🎯 High fit"] },
  ENFP: { title: "Brand Story Campaigns", income: "+$3.0K/mo", desc: "Create story-driven campaigns, launch angles, and community content for emerging brands.", audience: "startups, creators, and nonprofits with real spark but scattered messaging", offer: "a 2-week campaign kit: narrative, hooks, content calendar, and launch assets", positioning: "turn scattered possibility into a story people repeat", firstProduct: "10-hook campaign board + launch story draft", channels: ["short-form idea posts", "creator networks", "startup launch communities"], skills: ["story ideation", "community energy", "creative direction"], proof: "Publish a campaign board for a public product and explain the narrative arc.", pricing: { starter: "$175 hook board", core: "$1K campaign kit", premium: "$3K launch partner" }, roadmap: [
    { phase: "Launch", focus: "Pick a campaign lane", task: "Create 3 mock campaigns for brands you admire.", metric: "3 portfolio boards" },
    { phase: "Validate", focus: "Sell momentum", task: "Offer a paid hook board to 15 creators with upcoming launches.", metric: "2 paid boards" },
    { phase: "Scale", focus: "Build launch retainers", task: "Bundle hooks, calendar, and weekly creative direction.", metric: "1 monthly launch client" },
  ], risks: ["starting too many campaign concepts", "selling excitement without follow-through assets"], tags: ["⏱ 5–8 hrs/wk", "📈 $2K–$4K/mo", "🎯 High fit"] },
  ISTJ: { title: "Compliance Automation Kits", income: "+$3.6K/mo", desc: "Build checklists, SOPs, automations, and audit trails for regulated small businesses.", audience: "clinics, financial service firms, and agencies with recurring compliance headaches", offer: "SOP + automation kit for one recurring compliance workflow", positioning: "reduce mistakes, missed steps, and last-minute panic", firstProduct: "audit checklist + automated reminder tracker", channels: ["local business outreach", "industry forums", "accountant/bookkeeper referrals"], skills: ["process documentation", "QA thinking", "spreadsheet/automation setup"], proof: "Show a sample compliance tracker that prevents missed deadlines.", pricing: { starter: "$200 checklist audit", core: "$1.2K automation kit", premium: "$2.8K/mo process maintenance" }, roadmap: [
    { phase: "Launch", focus: "Choose one compliance pain", task: "Build a sample checklist for a narrow industry workflow.", metric: "1 template + 10 outreach messages" },
    { phase: "Validate", focus: "Sell error reduction", task: "Install the tracker for 2 businesses and document time saved.", metric: "2 installs" },
    { phase: "Scale", focus: "Retain maintenance", task: "Offer quarterly updates and audit prep support.", metric: "1 maintenance client" },
  ], risks: ["making the kit too complex", "assuming reliability sells itself without ROI language"], tags: ["⏱ 6–8 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] },
  ISFJ: { title: "Client Care Systems", income: "+$2.5K/mo", desc: "Create onboarding, follow-up, and retention systems for high-touch service businesses.", audience: "coaches, clinics, salons, and boutique service providers losing clients after the first sale", offer: "client journey upgrade with onboarding scripts, check-ins, and retention reminders", positioning: "make every client feel remembered without manual heroics", firstProduct: "client follow-up calendar + message templates", channels: ["local service providers", "Facebook business groups", "referrals from designers/bookkeepers"], skills: ["service empathy", "detail tracking", "relationship systems"], proof: "Create a sample client journey showing every touchpoint from inquiry to repeat booking.", pricing: { starter: "$150 follow-up kit", core: "$800 client-care setup", premium: "$2K/mo retention support" }, roadmap: [
    { phase: "Launch", focus: "Map the journey", task: "Build one sample onboarding and follow-up flow for a service niche.", metric: "1 demo journey" },
    { phase: "Validate", focus: "Sell retention", task: "Offer 5 businesses a paid follow-up-system setup.", metric: "2 paid setups" },
    { phase: "Scale", focus: "Monthly care ops", task: "Manage reminders, reviews, and retention messages monthly.", metric: "1 recurring support client" },
  ], risks: ["doing unpaid emotional labor", "customizing everything instead of templating the journey"], tags: ["⏱ 5–7 hrs/wk", "📈 $1K–$4K/mo", "🎯 High fit"] },
  ESTJ: { title: "Ops Cleanup Consultant", income: "+$4.5K/mo", desc: "Streamline handoffs, SOPs, tools, and accountability systems for growing businesses.", audience: "service businesses and agencies where work depends on memory, Slack archaeology, and prayer", offer: "operations cleanup sprint with process map, SOPs, owner chart, and dashboard", positioning: "turn chaos into clean execution", firstProduct: "workflow audit + top-5 bottleneck report", channels: ["agency owner communities", "LinkedIn ops content", "bookkeeper/VA referrals"], skills: ["process improvement", "accountability design", "implementation discipline"], proof: "Publish a sample bottleneck report for a messy handoff process.", pricing: { starter: "$300 workflow audit", core: "$1.8K cleanup sprint", premium: "$4.5K/mo fractional ops" }, roadmap: [
    { phase: "Launch", focus: "Diagnose bottlenecks", task: "Offer a paid workflow audit to 10 agencies or service teams.", metric: "2 audits booked" },
    { phase: "Validate", focus: "Install fixes", task: "Turn audits into 30-day cleanup sprints.", metric: "1 sprint sold" },
    { phase: "Scale", focus: "Own the rhythm", task: "Add monthly ops review and SOP maintenance.", metric: "1 fractional ops retainer" },
  ], risks: ["overcorrecting with too much process", "sounding like a scolding parent instead of an ROI lever"], tags: ["⏱ 8–10 hrs/wk", "📈 $3K–$6K/mo", "🎯 High fit"] },
  ESFJ: { title: "Community Growth Operator", income: "+$2.8K/mo", desc: "Build rituals, welcome flows, events, and member engagement for paid communities.", audience: "creators, course owners, and local groups whose communities feel quiet or disorganized", offer: "community activation sprint with onboarding flow, event calendar, and engagement rituals", positioning: "make members feel seen so they stay and participate", firstProduct: "welcome sequence + 30-day engagement calendar", channels: ["creator communities", "course-owner groups", "local organizations"], skills: ["member care", "event coordination", "communication rhythm"], proof: "Build a sample 30-day community activation calendar.", pricing: { starter: "$150 welcome-flow audit", core: "$900 activation sprint", premium: "$2.5K/mo community ops" }, roadmap: [
    { phase: "Launch", focus: "Design belonging", task: "Create a sample onboarding flow for one community type.", metric: "1 calendar + 10 outreach messages" },
    { phase: "Validate", focus: "Improve engagement", task: "Run a paid activation sprint for a quiet group.", metric: "1 sprint + engagement baseline" },
    { phase: "Scale", focus: "Operate monthly", task: "Manage rituals, events, and member check-ins.", metric: "1 monthly operator client" },
  ], risks: ["mistaking busyness for engagement", "avoiding hard moderation decisions"], tags: ["⏱ 5–8 hrs/wk", "📈 $1K–$4K/mo", "🎯 High fit"] },
  ISTP: { title: "No-Code Fixer Studio", income: "+$3.4K/mo", desc: "Debug broken automations, forms, websites, and tool stacks for small businesses.", audience: "operators whose Zapier, Airtable, forms, or websites break at the worst possible time", offer: "48-hour tool-stack fix: diagnose, repair, document, and harden one workflow", positioning: "fast practical fixes without a six-week agency ceremony", firstProduct: "broken-automation rescue package", channels: ["local business groups", "no-code forums", "agency overflow partnerships"], skills: ["debugging", "tool integration", "practical documentation"], proof: "Record a before/after repair of a broken workflow with the failure explained simply.", pricing: { starter: "$125 diagnostic", core: "$750 repair sprint", premium: "$2.5K/mo tool maintenance" }, roadmap: [
    { phase: "Launch", focus: "Find broken workflows", task: "Post a rescue offer for one tool stack: Zapier, Airtable, Webflow, or Shopify.", metric: "10 conversations" },
    { phase: "Validate", focus: "Fix urgent pain", task: "Complete 3 paid diagnostics and convert one into a repair sprint.", metric: "3 diagnostics" },
    { phase: "Scale", focus: "Maintenance retainers", task: "Offer monthly monitoring and small fixes.", metric: "1 maintenance retainer" },
  ], risks: ["underexplaining the fix", "accepting every random technical problem instead of one lane"], tags: ["⏱ 6–9 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"] },
  ISFP: { title: "Visual Identity Mini-Studio", income: "+$2.6K/mo", desc: "Create tasteful portfolio pages, creator media kits, and small-brand visual refreshes.", audience: "creatives, freelancers, and boutique brands whose work is better than their presentation", offer: "visual refresh kit with moodboard, landing section, portfolio layout, and asset guidelines", positioning: "make the outside finally match the quality inside", firstProduct: "portfolio hero redesign + visual direction board", channels: ["Instagram/TikTok process posts", "creative communities", "designer referral swaps"], skills: ["taste", "layout", "visual storytelling"], proof: "Post three before/after portfolio hero redesigns.", pricing: { starter: "$150 visual audit", core: "$850 refresh kit", premium: "$2.2K brand mini-system" }, roadmap: [
    { phase: "Launch", focus: "Show the eye", task: "Create 3 public visual refreshes for portfolio pages.", metric: "3 before/after samples" },
    { phase: "Validate", focus: "Sell the audit", task: "Offer a paid visual audit to 20 creatives.", metric: "2 paid audits" },
    { phase: "Scale", focus: "Package the system", task: "Bundle moodboard, web section, and asset guidelines.", metric: "1 full refresh package" },
  ], risks: ["waiting for perfect taste", "letting subjective feedback derail scope"], tags: ["⏱ 4–7 hrs/wk", "📈 $1K–$4K/mo", "🎯 High fit"] },
  ESTP: { title: "Deal Sprint Coach", income: "+$4.0K/mo", desc: "Coach freelancers and small teams through negotiation, sales calls, and high-stakes offers.", audience: "freelancers, closers, and founders who need sharper live-deal instincts", offer: "deal sprint with call review, objection drills, pricing script, and negotiation plan", positioning: "turn pressure moments into cleaner closes", firstProduct: "sales-call teardown + objection script", channels: ["sales communities", "short video call breakdowns", "freelancer groups"], skills: ["live read", "negotiation", "pressure handling"], proof: "Break down a sales call and rewrite the objection response.", pricing: { starter: "$200 call teardown", core: "$1K deal sprint", premium: "$3.5K/mo sales coach" }, roadmap: [
    { phase: "Launch", focus: "Show live instincts", task: "Publish 5 negotiation teardown clips or posts.", metric: "5 teardowns" },
    { phase: "Validate", focus: "Sell deal improvement", task: "Offer call teardowns to 20 freelancers or closers.", metric: "3 paid teardowns" },
    { phase: "Scale", focus: "Create deal room", task: "Bundle weekly call review, roleplay, and pricing scripts.", metric: "1 monthly coaching client" },
  ], risks: ["over-indexing on bravado", "not documenting repeatable tactics"], tags: ["⏱ 5–8 hrs/wk", "📈 $2K–$6K/mo", "🎯 High fit"] },
  ESFP: { title: "Experience Launch Studio", income: "+$3.0K/mo", desc: "Design memorable small events, popups, workshops, and community experiences.", audience: "local brands, creators, and communities that need people to actually show up and feel something", offer: "experience launch kit with concept, run-of-show, promo plan, and host scripts", positioning: "make the event impossible to forget and easy to attend", firstProduct: "popup/event concept board + promotion checklist", channels: ["local Instagram", "creator partnerships", "venue and brand outreach"], skills: ["vibe design", "hosting", "promotion"], proof: "Create a sample run-of-show and promo plan for a local popup.", pricing: { starter: "$150 event concept", core: "$900 launch kit", premium: "$3K event production support" }, roadmap: [
    { phase: "Launch", focus: "Design the moment", task: "Build 3 sample event concepts for local brands or creators.", metric: "3 concept boards" },
    { phase: "Validate", focus: "Sell a launch kit", task: "Pitch 15 local brands with one tailored event angle.", metric: "2 paid concepts" },
    { phase: "Scale", focus: "Produce repeat events", task: "Package concept, promo, host scripts, and vendor checklist.", metric: "1 production support client" },
  ], risks: ["chasing fun without margin", "underplanning operations because the energy feels obvious"], tags: ["⏱ 6–10 hrs/wk", "📈 $2K–$4K/mo", "🎯 High fit"] },
};

type LearningStyle = {
  title: string;
  desc: string;
  tips: string[];
};

type LearningPlan = {
  title: string;
  subtitle: string;
  thesis: string;
  fitScore: number;
  primaryLoop: { label: string; title: string; body: string }[];
  setupCards: { label: string; title: string; body: string; accent: string }[];
  tactics: string[];
  antiPattern: string;
  quickStart: string;
  weeklyPlan: string[];
};

const LEARNING_STYLES: Record<string, LearningStyle> = {
  INTJ: { title: "Systems-Based Learning", desc: "You learn fastest when every detail fits into a larger model. Keep the map simple, then test it.", tips: ["📐 Map the system before memorizing parts", "🎯 Build a real project to stress-test the theory", "📖 Compare case studies: one success, one failure"] },
  INTP: { title: "Concept-First Learning", desc: "You learn best when you understand the reason behind the method. Once the principle clicks, practice becomes easier.", tips: ["🔬 Start from first principles", "📝 Explain the concept in your own words", "🤝 Test the idea through debate or critique"] },
  ENTJ: { title: "Outcome-Driven Learning", desc: "You learn fastest when the skill has a visible payoff. Theory matters when it improves a decision or result.", tips: ["🎯 Define the win before starting", "📊 Apply the idea to a real objective immediately", "👥 Teach or lead with the skill to cement it"] },
  ENTP: { title: "Exploratory Learning", desc: "You learn by testing ideas from multiple angles. The trick is turning curiosity into proof before chasing the next idea.", tips: ["⚡ Explore competing explanations", "💡 Brainstorm applications with another person", "🎮 Turn practice into a challenge with constraints"] },
  INFJ: { title: "Meaning-Centered Learning", desc: "You learn deeply when the topic connects to purpose, people, and change. Dry facts need a human reason.", tips: ["🧠 Connect the idea to a real human outcome", "📖 Study stories behind the framework", "🎯 Apply it to help one specific person"] },
  INFP: { title: "Values-Driven Learning", desc: "Learning sticks when it connects to your values. If it feels hollow, you will avoid it fast.", tips: ["💜 Link the topic to a value you care about", "🌊 Use reflective, low-pressure practice blocks", "📚 Find voices that make the subject feel alive"] },
  ENFJ: { title: "Teaching-Based Learning", desc: "You learn best when knowledge moves through people. Explaining, coaching, and group feedback accelerate retention.", tips: ["👥 Explain the idea to someone else", "📣 Use dialogue and feedback loops", "🌱 Apply the skill in service of a group goal"] },
  ENFP: { title: "Spark-to-Structure Learning", desc: "You need freedom to chase the spark, then a simple structure to turn energy into progress.", tips: ["⚡ Start broad, then pick one thread to finish", "🎨 Convert learning into a creative artifact", "🤝 Explore with enthusiastic peers"] },
  ISTJ: { title: "Structured Practice Learning", desc: "You learn through proven steps, repetition, and clean standards. Ambiguous courses need a checklist before they become useful.", tips: ["📋 Follow a repeatable study routine", "✅ Apply the skill through real responsibilities", "📖 Use documented best practices and examples"] },
  ISFJ: { title: "Practical Support Learning", desc: "You learn best when the skill helps someone or strengthens a responsibility you already care about.", tips: ["🛡 Learn by helping one real person", "📋 Build on methods that already work", "🏠 Practice in a familiar, stable setting"] },
  ESTJ: { title: "Milestone-Based Learning", desc: "You want a clear path from effort to result. Vague exploration burns patience; visible checkpoints create momentum.", tips: ["📌 Turn the course into milestones", "⚡ Practice before you feel fully ready", "📊 Measure progress with concrete outputs"] },
  ESFJ: { title: "Collaborative Practice Learning", desc: "You absorb more when the environment is warm, useful, and connected to people — not sterile competition.", tips: ["🤝 Learn with a supportive group", "💛 Connect the skill to relationships or service", "🏠 Apply it in your community or daily life"] },
  ISTP: { title: "Hands-On Learning", desc: "You learn by touching the system. Try it, break it, fix it, then the lesson sticks.", tips: ["🔧 Disassemble an example before copying it", "⚡ Build and experiment immediately", "🎯 Solve a concrete problem with the skill"] },
  ISFP: { title: "Experiential Learning", desc: "You remember more when learning feels real, personal, and creative. Plain drills need a creative wrapper.", tips: ["🎨 Turn practice into a sensory or visual project", "🌅 Use an inspiring environment", "💖 Pick examples that feel personally meaningful"] },
  ESTP: { title: "Real-World Practice Learning", desc: "You learn in motion. Real practice, fast feedback, and useful pressure keep you engaged.", tips: ["⚡ Practice in real situations quickly", "🎮 Add competition, speed, or stakes", "🌍 Use high-energy environments and live feedback"] },
  ESFP: { title: "Immersive Learning", desc: "You learn by living the material. Practice, performance, and story beat passive study.", tips: ["🎭 Use role-play, demos, or simulation", "🌟 Practice around energetic people", "📸 Document the learning as a story or showcase"] },
};

const LEARNING_DISC_GUIDES: Record<string, { driver: string; pace: string; accountability: string; trap: string }> = {
  D: { driver: "challenge, autonomy, and visible wins", pace: "short intense sprints with a measurable target", accountability: "public scoreboards or a direct consequence for drifting", trap: "skipping foundations because action feels more productive than accuracy" },
  I: { driver: "energy, novelty, social exchange, and visible progress", pace: "varied sessions with quick feedback and room to talk it out", accountability: "a partner, cohort, or audience expecting the next artifact", trap: "collecting exciting ideas without finishing the boring rep that makes them useful" },
  S: { driver: "stability, trust, usefulness, and steady rhythm", pace: "consistent blocks with predictable steps and low-chaos practice", accountability: "a gentle routine, mentor, or responsibility to someone real", trap: "staying comfortable too long before testing yourself publicly" },
  C: { driver: "precision, mastery, evidence, and clear standards", pace: "focused deep-work blocks with examples, rubrics, and review", accountability: "quality checkpoints and written proof of understanding", trap: "over-researching until the artifact never leaves the lab" },
};

const BIG_FIVE_LEARNING_SIGNALS: Record<keyof BigFiveProfile, { label: string; high: string; low: string }> = {
  O: { label: "Openness", high: "Use conceptual variety, analogies, and original projects; novelty keeps the engine hot.", low: "Use concrete examples, familiar contexts, and step-by-step practice before abstract theory." },
  C: { label: "Structure / Follow-through", high: "Use checklists, milestones, and scheduled review; your consistency can compound fast.", low: "Use tiny frictionless starts, visible cues, and shorter reps; motivation beats elaborate planning here." },
  E: { label: "Extraversion", high: "Add discussion, demos, teaching, or live feedback; social energy improves recall.", low: "Protect solo processing time, written notes, and quiet review before group feedback." },
  A: { label: "Agreeableness", high: "Use supportive feedback and service-based projects; harsh competition can distort focus.", low: "Use debate, critique, and independent standards; do not wait for consensus to keep learning." },
  N: { label: "Stress Reactivity", high: "Use low-threat reps, shorter sessions, and early wins; pressure should be dosed, not dumped on you.", low: "Use harder simulations and deadlines; you can handle more challenge without spiraling." },
};

function bigFiveBand(score: number) {
  if (score >= 70) return "high";
  if (score <= 40) return "low";
  return "balanced";
}

function buildLearningPlan({ mbtiType, primaryDisc, bigFive }: { mbtiType: string; primaryDisc: string; bigFive: BigFiveProfile }): LearningPlan {
  const style = LEARNING_STYLES[mbtiType] || LEARNING_STYLES.INTJ;
  const discGuide = LEARNING_DISC_GUIDES[primaryDisc] || LEARNING_DISC_GUIDES.C;
  const letters = mbtiType.split("");
  const isIntuitive = letters.includes("N");
  const isThinking = letters.includes("T");
  const isJudging = letters.includes("J");
  const isExtraverted = letters.includes("E");
  const topTrait = (Object.entries(bigFive) as [keyof BigFiveProfile, number][]).sort((a, b) => b[1] - a[1])[0];
  const lowestTrait = (Object.entries(bigFive) as [keyof BigFiveProfile, number][]).sort((a, b) => a[1] - b[1])[0];
  const topSignal = BIG_FIVE_LEARNING_SIGNALS[topTrait[0]];
  const lowSignal = BIG_FIVE_LEARNING_SIGNALS[lowestTrait[0]];
  const topBand = bigFiveBand(topTrait[1]);
  const lowBand = bigFiveBand(lowestTrait[1]);
  const conceptPreference = isIntuitive ? "start with the model, then prove it with examples" : "start with concrete examples, then extract the pattern";
  const decisionPreference = isThinking ? "test ideas against logic, metrics, and clean definitions" : "connect ideas to values, people, and lived impact";
  const structurePreference = isJudging ? "pre-plan the next milestone before the session ends" : "keep room to explore, but force one finished artifact";
  const energyPreference = isExtraverted ? "say it out loud, teach it, or get live feedback" : "process it alone first, then expose it to feedback";
  const fitScore = Math.round((
    (isIntuitive ? bigFive.O : 100 - Math.abs(50 - bigFive.O)) * 0.22 +
    (isJudging ? bigFive.C : 100 - Math.abs(55 - bigFive.C)) * 0.22 +
    (isExtraverted ? bigFive.E : 100 - bigFive.E) * 0.16 +
    (isThinking ? 100 - Math.abs(45 - bigFive.A) : bigFive.A) * 0.14 +
    (100 - Math.max(0, bigFive.N - 35)) * 0.12 +
    14
  ));

  return {
    title: style.title,
    subtitle: `${mbtiType} personality type + ${DISC_LABELS[primaryDisc] || "work style"} work style`,
    thesis: `${style.desc} Your ${DISC_LABELS[primaryDisc] || "work style"} pattern needs ${discGuide.driver}. Keep the plan short: learn it, use it, then review it.`,
    fitScore: Math.max(52, Math.min(96, fitScore)),
    primaryLoop: [
      { label: "1", title: "Frame it", body: `${conceptPreference}. Write the skill in one sentence before opening another lesson.` },
      { label: "2", title: "Use it", body: `${decisionPreference}. Apply the idea to one real problem while it is still fresh.` },
      { label: "3", title: "Lock it", body: `${energyPreference}. Then ${structurePreference}.` },
    ],
    setupCards: [
      { label: "Work pace", title: discGuide.pace, body: `Best support: ${discGuide.accountability}.`, accent: DISC_COLORS[primaryDisc] || "#14b8a6" },
      { label: `${topSignal.label} ${topBand}`, title: `Strong signal: ${topTrait[1]}%`, body: topBand === "low" ? topSignal.low : topSignal.high, accent: C.cyan },
      { label: `${lowSignal.label} ${lowBand}`, title: `Watch signal: ${lowestTrait[1]}%`, body: lowBand === "high" ? lowSignal.high : lowSignal.low, accent: C.gold },
    ],
    tactics: style.tips,
    antiPattern: `Avoid ${discGuide.trap}. Busy learning is not the same as skill.`,
    quickStart: "Today: pick one lesson, practice it for 20 minutes, then make one small proof: a note, example, demo, or script.",
    weeklyPlan: [
      "Day 1: choose one skill and write the win in one sentence.",
      "Days 2–3: do two short practice reps.",
      "Day 4: review mistakes and write the lesson.",
      "Days 5–7: make one small project that proves the skill stuck.",
    ],
  };
}


const DISC_COLORS: Record<string, string> = { D: "#ef4444", I: "#f59e0b", S: "#22c55e", C: "#3b82f6" };
const DISC_LABELS: Record<string, string> = { D: "Dominant", I: "Influential", S: "Steady", C: "Conscientious" };
const DISC_EMOJIS: Record<string, string> = { D: "🔥", I: "⚡", S: "🌿", C: "🧠" };
const BRAND_SHARE_URL = "https://knowyourole.com";
const BRAND_SHARE_HOST = "knowyourole.com";

type BigFiveProfile = { O: number; C: number; E: number; A: number; N: number };
type DiscProfile = { D: number; I: number; S: number; C: number };
type CareerRoleOption = { title: string; salary?: string; desc?: string; source: string };

function normalizeDiscProfile(rawDisc: DiscProfile): DiscProfile {
  const entries = Object.entries(rawDisc) as [keyof DiscProfile, number][];
  const safeEntries = entries.map(([key, value]) => [key, Number.isFinite(value) ? Math.max(0, value) : 0] as const);
  const max = Math.max(...safeEntries.map(([, value]) => value), 0);

  if (max <= 0) {
    return { D: 25, I: 25, S: 25, C: 25 };
  }

  return safeEntries.reduce((next, [key, value]) => {
    next[key] = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    return next;
  }, { D: 0, I: 0, S: 0, C: 0 } as DiscProfile);
}

function buildResultSummaryLine({ roleTitle, identity, mbtiType, discLabel, topTraitLabel }: {
  roleTitle: string;
  identity: string;
  mbtiType: string;
  discLabel: string;
  topTraitLabel: string;
}) {
  const article = /^[AEFHILMNORSX]/i.test(mbtiType) ? "an" : "a";
  return `${identity}: your answers point toward ${roleTitle}, with ${article} ${mbtiType} thinking pattern, ${discLabel.toLowerCase()} work style, and ${topTraitLabel.toLowerCase()} as the strongest trait signal.`;
}
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
      `Role type: ${categoryText}.`,
      `Work style fit: ${DISC_LABELS[primaryDisc] || primaryDisc} matches this role ${Math.round(discScore)}%.`,
      `Personality type fit: ${mbtiType} matches this role ${Math.round(mbtiScore)}%.`,
      `Big Five fit: ${Math.round(bigFiveScore)}%. Strongest useful trait: ${topBigFive ? TRAIT_DEEP_DIVE[topBigFive.trait].label : "balanced traits"}.`,
    ],
    friction: weakestBigFive
      ? `Main watch-out: ${strongestCategory.friction}. Keep an eye on ${TRAIT_DEEP_DIVE[weakestBigFive.trait].label.toLowerCase()} here.`
      : `Main friction: ${strongestCategory.friction}.`,
    leverage: `Use your ${mbtiType} personality type and ${DISC_LABELS[primaryDisc] || "work style"} by making one proof piece: ${strongestCategory.proof}.`,
    path: [
      { num: 1, title: "Test the fit", text: `Treat ${role} as an experiment. Your estimated fit is ${match}%.` },
      { num: 2, title: "Make proof", text: `Build this first: ${strongestCategory.proof}.` },
      { num: 3, title: "Ask insiders", text: "Talk to 3 people in the role. Ask what drains them and what beginners miss." },
      { num: 4, title: "Practice the gap", text: `${primaryDisc === "C" ? "Share useful summaries faster" : primaryDisc === "D" ? "Practice patience with other people" : primaryDisc === "I" ? "Finish one boring but valuable task" : "Make your work more visible"}.` },
    ],
  };
}

type PremiumRoleCard = {
  rank: string;
  title: string;
  salary?: string;
  pct: number;
  why: string;
  daily: string;
  skill: string;
  firstMove: string;
  primary: boolean;
};

const MBTI_ROLE_SIGNALS: Record<string, string> = {
  E: "external momentum and fast feedback",
  I: "focused depth before public action",
  S: "practical reality-testing",
  N: "pattern-spotting and future possibilities",
  T: "clear tradeoff decisions",
  F: "human impact and values awareness",
  J: "structure, deadlines, and closure",
  P: "adaptability when the path changes",
};

const DISC_ROLE_SIGNALS: Record<string, string> = {
  D: "decisive ownership, urgency, and comfort with accountability",
  I: "persuasion, social energy, and visible momentum",
  S: "patience, trust-building, and steady follow-through",
  C: "precision, evidence, and quality control",
};

const ROLE_DAILY_LOOPS: Record<RoleFitCategory, string> = {
  leadership: "Set direction, make decisions, and help people know what matters next.",
  technical: "Break down problems, build useful fixes, and explain the tradeoffs clearly.",
  creative: "Make ideas visible, get feedback, and finish work people can react to.",
  care: "Listen, build trust, and help people take the next practical step.",
  operations: "Organize moving parts, reduce mistakes, and make the process easier to repeat.",
  influence: "Start conversations, understand motivation, and help people choose a next step.",
  generalist: "Name the goal, gather context, and turn vague work into visible proof.",
};

const ROLE_SKILL_GAPS: Record<RoleFitCategory, string> = {
  leadership: "Practice patience: say the decision, the risk, and the reason in plain language.",
  technical: "Make your skill visible with a demo, teardown, or short case study.",
  creative: "Finish one piece on a deadline instead of protecting the idea forever.",
  care: "Pair empathy with boundaries, scope, and a clear sign of progress.",
  operations: "Improve one process without becoming rigid about every detail.",
  influence: "Create a follow-up habit so excitement turns into trust.",
  generalist: "Define what success looks like before chasing more options.",
};

function joinReadable(items: string[]) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function describeMbtiForRole(mbtiType: string, profile: RoleFitProfile) {
  const matched = profile.idealMbtiLetters.filter(letter => mbtiType.includes(letter));
  if (!matched.length) return `${mbtiType} gives this role a broad personality base rather than one narrow signal`;
  const signals = matched.slice(0, 2).map(letter => MBTI_ROLE_SIGNALS[letter] || letter);
  return `${mbtiType} supports this role through ${joinReadable(signals)}`;
}

function getTopRoleTrait(bigFive: BigFiveProfile, profile: RoleFitProfile) {
  const targets = Object.keys(profile.bigFiveTargets) as (keyof BigFiveProfile)[];
  const scored = targets.map(trait => ({
    trait,
    score: scoreBigFiveTarget(bigFive[trait], profile.bigFiveTargets[trait] || "mid"),
  })).sort((a, b) => b.score - a.score);
  const best = scored[0]?.trait || (getRankedTraits(bigFive)[0]?.[0] ?? "O");
  return TRAIT_DEEP_DIVE[best]?.label || "Openness";
}

function buildPremiumRoleMatchCards({
  roleMatch,
  mbtiType,
  primaryDisc,
  disc,
  bigFive,
}: {
  roleMatch: CareerRoleMatch;
  mbtiType: string;
  primaryDisc: string;
  disc: DiscProfile;
  bigFive: BigFiveProfile;
}): PremiumRoleCard[] {
  const sourceRoles = [
    { rank: "#1", role: roleMatch.primary, primary: true },
    { rank: "#2", role: roleMatch.secondary, primary: false },
  ];

  return sourceRoles.map(({ rank, role, primary }) => {
    const categories = getRoleFitCategories(`${role.title} ${role.desc || ""}`.toLowerCase());
    const category = categories[0];
    const profile = ROLE_FIT_PROFILES[category] || ROLE_FIT_PROFILES.generalist;
    const categoryText = categories.map(item => ROLE_FIT_PROFILES[item]?.label || ROLE_FIT_PROFILES.generalist.label).join(" + ");
    const analysis = analyzeDreamRoleFit({
      role: role.title,
      roleMeta: { ...role, source: "Your matched roles" },
      mbtiType,
      primaryDisc,
      disc,
      bigFive,
      primaryMatchTitle: roleMatch.primary.title,
      secondaryMatchTitle: roleMatch.secondary.title,
    });
    const discLabel = lowerFirst(DISC_LABELS[primaryDisc] || "Dominant");
    const topTraitLabel = lowerFirst(getTopRoleTrait(bigFive, profile));
    const mbtiFit = describeMbtiForRole(mbtiType, profile);
    const roleDesc = role.desc ? role.desc.replace(/\.$/, "") : `work in the ${profile.label.toLowerCase()} lane`;
    const proofMove = profile.proof.replace(/\.$/, "");

    return {
      rank,
      title: role.title,
      salary: role.salary,
      pct: primary ? Math.max(analysis.match, 88) : clampScore(analysis.match - 8, 70, 89),
      why: `${role.title} fits because it asks you to ${lowerFirst(roleDesc)}. ${mbtiFit}. Your ${discLabel} style adds ${DISC_ROLE_SIGNALS[primaryDisc] || "useful work energy"}.`,
      daily: ROLE_DAILY_LOOPS[category] || ROLE_DAILY_LOOPS.generalist,
      skill: ROLE_SKILL_GAPS[category] || ROLE_SKILL_GAPS.generalist,
      firstMove: `This week: ${proofMove}. Then ask one person in the field how to improve it.`,
      primary,
    };
  });
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

type DeepDivePanel = { label: string; title: string; body: string; color: string };

type MbtiDeepDiveCore = {
  strength: string;
  pressure: string;
  environment: string;
  watchout: string;
};

const MBTI_DEEP_DIVE_CORE: Record<string, MbtiDeepDiveCore> = {
  INTJ: {
    strength: "You see hidden structure quickly, then turn it into a long-range plan.",
    pressure: "Under stress, you can retreat into over-modeling while the human part of the problem waits outside.",
    environment: "You do your best work where strategy, autonomy, and measurable competence matter more than performative busyness.",
    watchout: "Do not confuse a brilliant private plan with momentum; make the next step visible early.",
  },
  INTP: {
    strength: "You strip problems down to first principles and find the clean logic other people skip.",
    pressure: "Under stress, you can keep refining the theory after the moment needs a usable answer.",
    environment: "You thrive around intellectual freedom, complex puzzles, and people who let evidence beat hierarchy.",
    watchout: "Your insight gains power when it leaves your head as a prototype, explanation, or decision.",
  },
  ENTJ: {
    strength: "You convert ambition into priorities, structure, and forward motion faster than most people.",
    pressure: "Under stress, your standards can become a blunt instrument instead of a leadership tool.",
    environment: "You win in high-agency rooms with stakes, ownership, and room to improve the system.",
    watchout: "Speed is an advantage until it outruns trust; bring people with you before the plan hardens.",
  },
  ENTP: {
    strength: "You spot openings, contradictions, and alternative paths that make stale situations movable again.",
    pressure: "Under stress, you may keep generating options to avoid the boredom of committing to one.",
    environment: "You need challenge, debate, experimentation, and enough freedom to test the weird-but-promising angle.",
    watchout: "Novelty is fuel, not a finish line; choose one bet long enough for compounding to start.",
  },
  INFJ: {
    strength: "You read the emotional pattern underneath events and translate it into meaning and direction.",
    pressure: "Under stress, you can carry too much alone while waiting for the perfect way to explain it.",
    environment: "You thrive where purpose, depth, and thoughtful impact matter more than noise or status theater.",
    watchout: "Your vision needs contact with reality; share the draft before it becomes a private burden.",
  },
  INFP: {
    strength: "You protect the inner signal: values, meaning, and what feels genuinely alive.",
    pressure: "Under stress, misalignment can freeze action because the choice has to feel completely right first.",
    environment: "You do best with creative freedom, psychological safety, and work connected to a real human reason.",
    watchout: "Meaning becomes leverage when paired with a deadline, a container, and one visible deliverable.",
  },
  ENFJ: {
    strength: "You organize people around possibility and make growth feel emotionally reachable.",
    pressure: "Under stress, you can over-function for the group until your own signal gets buried.",
    environment: "You thrive in collaborative missions where communication, trust, and development are central to winning.",
    watchout: "Social spark without boundaries becomes exhaustion; protect your energy like part of the strategy.",
  },
  ENFP: {
    strength: "You connect ideas, people, and possibilities into contagious forward energy.",
    pressure: "Under stress, every new spark can look like salvation from the boring middle of execution.",
    environment: "You need variety, visible progress, and permission to follow curiosity without losing the thread.",
    watchout: "Your range becomes rare when you finish enough things for the pattern to become proof.",
  },
  ISTJ: {
    strength: "You make work reliable by noticing details, honoring commitments, and building repeatable standards.",
    pressure: "Under stress, you may cling to the known process even when the problem has changed shape.",
    environment: "You win in stable systems with clear expectations, useful rules, and respect for earned competence.",
    watchout: "Consistency is your base; add small experiments so reliability does not become rigidity.",
  },
  ISFJ: {
    strength: "You notice what people need and turn care into steady, practical support.",
    pressure: "Under stress, you can absorb everyone else's needs and call it responsibility.",
    environment: "You thrive in trusted teams where loyalty, service, and quiet excellence are seen and valued.",
    watchout: "Support lands better when it includes boundaries; do not make yourself the hidden infrastructure forever.",
  },
  ESTJ: {
    strength: "You bring order, standards, and accountability when everyone else is still talking in circles.",
    pressure: "Under stress, efficiency can turn into impatience with nuance, emotion, or exploratory mess.",
    environment: "You do best where goals are concrete, authority is clear, and results can be measured.",
    watchout: "The standard matters, but so does buy-in; explain the why before enforcing the how.",
  },
  ESFJ: {
    strength: "You create alignment by reading group needs and keeping people connected to the shared goal.",
    pressure: "Under stress, harmony can become avoidance of the hard truth everyone needs to hear.",
    environment: "You thrive in people-centered settings with clear roles, appreciation, and practical cooperation.",
    watchout: "Being liked is not the same as leading well; say the useful thing with warmth and precision.",
  },
  ISTP: {
    strength: "You understand systems by testing them directly and finding the mechanical truth fast.",
    pressure: "Under stress, you can detach so cleanly that others cannot tell what you know or need.",
    environment: "You win with hands-on autonomy, real problems, and room to solve without ceremonial meetings.",
    watchout: "Your competence compounds when you explain your process, not just deliver the fix.",
  },
  ISFP: {
    strength: "You sense what feels authentic, beautiful, or misaligned before others can name it.",
    pressure: "Under stress, conflict or heavy structure can make you disappear instead of negotiate the terms.",
    environment: "You thrive where craft, freedom, aesthetics, and personal meaning can shape the final product.",
    watchout: "Your taste needs a frame; define the constraint so your creativity has something to push against.",
  },
  ESTP: {
    strength: "You read the moment quickly and turn pressure into direct, practical action.",
    pressure: "Under stress, the fastest move can become the whole strategy even when patience would pay more.",
    environment: "You win in live, high-energy settings with real stakes, fast feedback, and room to maneuver.",
    watchout: "Action is your advantage; add a brief after-action review so experience becomes wisdom.",
  },
  ESFP: {
    strength: "You bring presence, energy, and human immediacy that makes people engage with the moment.",
    pressure: "Under stress, you can chase relief or stimulation before naming what actually needs attention.",
    environment: "You thrive in expressive, social, sensory-rich work where impact is felt in real time.",
    watchout: "Your energy becomes durable when you pair it with one repeatable rhythm and one clear priority.",
  },
};

const DISC_DEEP_DIVE: Record<string, { move: string; risk: string }> = {
  D: { move: "decisive force and willingness to confront the real issue", risk: "moving so fast that context and consent lag behind" },
  I: { move: "social momentum, persuasion, and emotional lift", risk: "overpromising when the room is excited" },
  S: { move: "stability, patience, and trust-building follow-through", risk: "waiting too long to disturb a fragile peace" },
  C: { move: "precision, analysis, and quality control", risk: "polishing the answer after a useful version would already help" },
};

const TRAIT_DEEP_DIVE: Record<keyof BigFiveProfile, { label: string; strength: string; environment: string; watchout: string }> = {
  O: { label: "Openness", strength: "idea range", environment: "novelty and conceptual room", watchout: "staying too narrow when the problem needs imagination" },
  C: { label: "Structure / Follow-through", strength: "follow-through", environment: "clear goals and standards", watchout: "leaving structure and follow-through implicit" },
  E: { label: "Extraversion", strength: "visible energy", environment: "interaction and fast feedback", watchout: "keeping useful energy or visibility too private" },
  A: { label: "Agreeableness", strength: "empathy and cooperation", environment: "trust and respectful collaboration", watchout: "skipping relational buy-in when people need context" },
  N: { label: "Stress Reactivity", strength: "risk detection", environment: "predictable recovery time", watchout: "missing early stress or risk signals" },
};

function getRankedTraits(bigFive: BigFiveProfile) {
  return (Object.entries(bigFive) as [keyof BigFiveProfile, number][])
    .sort((a, b) => b[1] - a[1]);
}

function bandTrait(value: number) {
  if (value >= 72) return "high";
  if (value <= 38) return "low";
  return "balanced";
}

function lowerFirst(value: string) {
  return value ? value.slice(0, 1).toLowerCase() + value.slice(1) : value;
}


function expandVisibleTerms(value: string) {
  return value
    .replace(/\bAI\b/g, "artificial intelligence")
    .replace(/\bUX\b/g, "user experience")
    .replace(/hrs\/wk/g, "hours/week")
    .replace(/\/mo\b/g, "/month")
    .replace(/\bKPI\b/g, "key performance indicator")
    .replace(/\$(\d+(?:\.\d+)?)K/g, (_, amount: string) => `$${Math.round(Number(amount) * 1000).toLocaleString()}`);
}
function traitPhrase(meta: { label: string }, band: string) {
  const label = lowerFirst(meta.label);
  if (band === "high") return `your ${label}`;
  if (band === "low") return `your quieter ${label}`;
  return `your balanced ${label}`;
}

function buildPremiumDeepDivePanels({
  mbtiType,
  arch,
  primaryDisc,
  bigFive,
}: {
  mbtiType: string;
  arch: string;
  primaryDisc: string;
  bigFive: BigFiveProfile;
}): Record<string, DeepDivePanel> {
  const core = MBTI_DEEP_DIVE_CORE[mbtiType] || MBTI_DEEP_DIVE_CORE.INTJ;
  const discKey = (primaryDisc || "D").slice(0, 1).toUpperCase();
  const discLens = DISC_DEEP_DIVE[discKey] || DISC_DEEP_DIVE.D;
  const rankedTraits = getRankedTraits(bigFive);
  const [topTrait, topValue] = rankedTraits[0];
  const [lowestTrait, lowestValue] = rankedTraits[rankedTraits.length - 1];
  const topMeta = TRAIT_DEEP_DIVE[topTrait];
  const lowMeta = TRAIT_DEEP_DIVE[lowestTrait];
  const topBand = bandTrait(topValue);
  const lowBand = bandTrait(lowestValue);
  const discLabel = DISC_LABELS[discKey] || "Dominant";
  const topTraitPhrase = traitPhrase(topMeta, topBand);
  const lowTraitPhrase = traitPhrase(lowMeta, lowBand);
  const pressureText = bigFive.N >= 64
    ? "Your emotional range makes your threat scanner loud; use it to name risks, then force one next action."
    : bigFive.N <= 38
      ? "Your emotional range keeps you steadier than most, but build early alarms so calm does not become delayed reaction."
      : "Your emotional range gives you a moderate stress signal; the trick is checking it before stress makes the choice for you.";

  return {
    strength: {
      label: "Strength",
      title: `${arch} command center`,
      body: `${core.strength} Your ${lowerFirst(discLabel)} style adds ${discLens.move}. Your strongest Big Five signal is ${topMeta.label.toLowerCase()}.`,
      color: C.cyan,
    },
    pressure: {
      label: "Pressure",
      title: "What happens under stress",
      body: `${core.pressure} ${pressureText}`,
      color: C.pink,
    },
    environment: {
      label: "Environment",
      title: "Where you win fastest",
      body: `${core.environment} Prioritize ${topMeta.environment}; that is where your strongest trait helps most.`,
      color: C.purple,
    },
    watchout: {
      label: "Watch-out",
      title: "Growth lever",
      body: `${core.watchout} Watch the ${lowerFirst(discLabel)} risk of ${discLens.risk}. Practice the opposite when stakes are high.`,
      color: C.gold,
    },
  };
}


type PressureModeCard = { label: string; title: string; body: string; icon: string; color: string };
type PressureModeProfile = {
  title: string;
  subtitle: string;
  reaction: string;
  misread: string;
  slipSignal: string;
  recoveryMove: string;
  doScript: string;
  dontScript: string;
  resetSteps: string[];
  cards: PressureModeCard[];
};

function buildPressureMode({
  mbtiType,
  primaryDisc,
  bigFive,
}: {
  mbtiType: string;
  primaryDisc: string;
  bigFive: BigFiveProfile;
}): PressureModeProfile {
  const core = MBTI_DEEP_DIVE_CORE[mbtiType] || MBTI_DEEP_DIVE_CORE.INTJ;
  const discKey = (primaryDisc || "D").slice(0, 1).toUpperCase();
  const discLabel = DISC_LABELS[discKey] || "Dominant";
  const discTone = lowerFirst(discLabel);
  const rankedTraits = getRankedTraits(bigFive);
  const highTrait = rankedTraits[0][0];
  const lowTrait = rankedTraits[rankedTraits.length - 1][0];
  const highTraitName = lowerFirst(TRAIT_DEEP_DIVE[highTrait].label);
  const lowTraitName = lowerFirst(TRAIT_DEEP_DIVE[lowTrait].label);
  const isIntroverted = mbtiType[0] === "I";
  const isThinking = mbtiType[2] === "T";
  const isJudging = mbtiType[3] === "J";

  const discPressure: Record<string, { title: string; slip: string; recovery: string; doScript: string; dontScript: string }> = {
    D: {
      title: "Command Mode",
      slip: "Your first warning sign is compression: shorter replies, faster decisions, and less patience for context.",
      recovery: "Slow the room for ninety seconds: name the goal, invite the missing risk, then choose the next concrete move.",
      doScript: "I’m leaning toward a decision. What risk am I moving too fast to see?",
      dontScript: "Just trust me — I already solved it.",
    },
    I: {
      title: "Momentum Mode",
      slip: "Your first warning sign is inflation: everything sounds exciting, urgent, and possible before the boring constraints are named.",
      recovery: "Separate energy from agreement: write the promise, owner, deadline, and smallest proof before you sell the next idea.",
      doScript: "Here’s the exciting version. Now let’s name the constraint that would make it real.",
      dontScript: "We’ll figure out the details later.",
    },
    S: {
      title: "Stability Mode",
      slip: "Your first warning sign is quiet endurance: you keep absorbing pressure while pretending the system is still fine.",
      recovery: "Make the hidden load visible: state what changed, what support is needed, and what must pause so quality survives.",
      doScript: "I can keep this steady if we adjust one expectation: here is what needs to change.",
      dontScript: "It’s fine — I’ll handle it.",
    },
    C: {
      title: "Control Mode",
      slip: "Your first warning sign is over-checking: one more review, one more model, one more edge case before anyone can act.",
      recovery: "Ship a safe draft: define the knowns, unknowns, and the reversible next step instead of waiting for perfect certainty.",
      doScript: "Here is the best current read, the open risk, and the version we can safely test now.",
      dontScript: "I need more data before we can do anything.",
    },
  };

  const discMode = discPressure[discKey] || discPressure.D;
  const emotionalSignal = bigFive.N >= 64
    ? "Your stress signal gets loud fast. Use it to name the risk, then choose one next action."
    : bigFive.N <= 38
      ? "Your stress signal stays quiet. That helps you stay steady, but set an early check-in before pressure piles up."
      : "Your stress signal is moderate. Watch behavior changes, not just mood.";
  const structureSignal = bigFive.C >= 70
    ? "Your high structure helps you finish. Under pressure, it can turn into rigidity or overwork."
    : bigFive.C <= 40
      ? "Your flexible style helps you adapt. Under pressure, it can become scattered action without a finish line."
      : "Your balanced structure helps you adapt. Under pressure, decide what needs polish and what only needs motion.";
  const socialSignal = isIntroverted
    ? "People may read your quiet as distance when you are actually thinking."
    : "People may read your visible energy as confidence when you are actually processing stress out loud.";
  const decisionSignal = isThinking
    ? "Add one sentence that shows you understand the human impact."
    : "Name the hard decision clearly so kindness does not blur the issue.";

  return {
    title: `${discMode.title}: ${mbtiType} under pressure`,
    subtitle: "What tends to happen when stress, deadlines, or pressure show up.",
    reaction: emotionalSignal,
    misread: `${socialSignal} ${decisionSignal}`,
    slipSignal: `${discMode.slip} Stress may also overuse your ${highTraitName}.`,
    recoveryMove: `${discMode.recovery} Then use a little more ${lowTraitName}.`,
    doScript: discMode.doScript,
    dontScript: discMode.dontScript,
    resetSteps: [
      isJudging ? "Define the next reversible decision, not the final perfect plan." : "Choose one finish line before opening another option.",
      bigFive.N >= 64 ? "Write the fear as a risk statement, then attach one action to it." : "Set an external check-in so calm does not hide accumulating strain.",
      `Use your ${discTone} style on purpose; do not let it take over.`,
    ],
    cards: [
      { label: "Default reaction", title: "What pressure activates", body: structureSignal, icon: "🌡️", color: C.pink },
      { label: "How others may read it", title: "What people may miss", body: `${socialSignal} Say what you are doing before people guess.`, icon: "👥", color: C.purple },
      { label: "Early warning", title: "Catch this before it owns you", body: discMode.slip, icon: "🚨", color: C.gold },
      { label: "Recovery move", title: "The fast reset", body: discMode.recovery, icon: "🧭", color: C.cyan },
    ],
  };
}


type CompatibilityContext = "Work" | "Relationship" | "Friend/Family";
type CompatibilityStyleKey = "D" | "I" | "S" | "C";
type CompatibilityInsight = {
  label: string;
  styleName: string;
  score: number;
  tag: string;
  contextHeadline: string;
  chemistry: string;
  friction: string;
  communication: string;
  rule: string;
  peoplePattern: { title: string; body: string; color: string }[];
};

const COMPATIBILITY_STYLES: Record<CompatibilityStyleKey, { label: string; name: string; icon: string; short: string; color: string }> = {
  D: { label: "Dominant", name: "The Driver", icon: "🔥", short: "fast, blunt, outcome-first", color: "#ef4444" },
  I: { label: "Influential", name: "The Spark", icon: "⚡", short: "expressive, energetic, people-first", color: C.gold },
  S: { label: "Steady", name: "The Anchor", icon: "🌿", short: "patient, loyal, harmony-first", color: "#22c55e" },
  C: { label: "Conscientious", name: "The Analyst", icon: "🧠", short: "careful, exact, evidence-first", color: "#60a5fa" },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildCompatibilityDecoder({
  mbtiType,
  primaryDisc,
  bigFive,
  otherStyle,
  context,
}: {
  mbtiType: string;
  primaryDisc: string;
  bigFive: BigFiveProfile;
  otherStyle: CompatibilityStyleKey;
  context: CompatibilityContext;
}): CompatibilityInsight {
  const selfKey = ((primaryDisc || "D").slice(0, 1).toUpperCase() as CompatibilityStyleKey) || "D";
  const self = COMPATIBILITY_STYLES[selfKey] || COMPATIBILITY_STYLES.D;
  const other = COMPATIBILITY_STYLES[otherStyle] || COMPATIBILITY_STYLES.C;
  const ranked = getRankedTraits(bigFive);
  const topTrait = ranked[0][0];
  const lowTrait = ranked[ranked.length - 1][0];
  const topTraitName = lowerFirst(TRAIT_DEEP_DIVE[topTrait].label);
  const lowTraitName = lowerFirst(TRAIT_DEEP_DIVE[lowTrait].label);
  const isSame = selfKey === otherStyle;
  const isOpposite = (selfKey === "D" && otherStyle === "S") || (selfKey === "S" && otherStyle === "D") || (selfKey === "I" && otherStyle === "C") || (selfKey === "C" && otherStyle === "I");
  const isThinking = mbtiType[2] === "T";
  const isIntroverted = mbtiType[0] === "I";
  const structureBonus = otherStyle === "C" ? Math.round((bigFive.C - 50) / 4) : otherStyle === "I" ? Math.round((bigFive.E - 50) / 4) : otherStyle === "S" ? Math.round((bigFive.A - 50) / 5) : Math.round((bigFive.O - 50) / 5);
  const styleScore = 76 + (isSame ? 9 : isOpposite ? -8 : 2) + structureBonus;
  const contextProfiles: Record<CompatibilityContext, { scoreShift: number; headline: string; chemistry: string; friction: string; communication: string; rule: string }> = {
    Work: {
      scoreShift: otherStyle === "C" || otherStyle === "D" ? 3 : 0,
      headline: `Use their ${other.label.toLowerCase()} style where it improves decisions, pace, or follow-through.`,
      chemistry: otherStyle === "D"
        ? "You both move faster when the goal and owner are explicit. This pairing works best when authority is clear before the room gets competitive."
        : otherStyle === "I"
          ? "They add momentum, visibility, and social lift. You add direction when their energy starts outrunning the plan."
          : otherStyle === "S"
            ? "They stabilize execution and protect team trust. You help prevent steadiness from turning into polite delay."
            : "They sharpen standards, risks, and details. You help keep analysis attached to an actual decision.",
      friction: otherStyle === "D"
        ? "Work tension shows up as control friction: who decides, how fast, and whose standard wins. Name the decision owner early."
        : otherStyle === "I"
          ? "They may treat enthusiasm like commitment. Convert excitement into owner, deadline, and next artifact."
          : otherStyle === "S"
            ? "They may avoid disruption until the issue is already expensive. Ask for concerns before the meeting ends."
            : "They may ask for proof when you want motion. Define what evidence is enough, then move.",
      communication: otherStyle === "D" ? "Lead with the outcome, the decision needed, and the constraint." : otherStyle === "I" ? "Lead with the vision, then lock one clear next step." : otherStyle === "S" ? "Lead with context, impact, and a low-drama next move." : "Lead with the goal, evidence, and standard for done.",
      rule: "Agree on pace, owner, and definition of done before personality turns into project noise.",
    },
    Relationship: {
      scoreShift: otherStyle === "S" ? 4 : otherStyle === "D" ? -2 : 1,
      headline: "The relationship win is not avoiding conflict. It is repairing faster and translating needs before debate starts.",
      chemistry: otherStyle === "D"
        ? "Their directness can feel clarifying when trust is strong. The spark works when honesty comes with warmth, not just force."
        : otherStyle === "I"
          ? "They bring play, expression, and emotional color. They can pull you out of overthinking and back into shared experience."
          : otherStyle === "S"
            ? "They bring steadiness, loyalty, and calm repair energy. This can make conflict feel survivable instead of terminal."
            : "They bring thoughtfulness and precision. They may remember the details that make care feel real.",
      friction: otherStyle === "D"
        ? "Arguments can turn into courtroom energy if both people fight for the point instead of the need underneath it."
        : otherStyle === "I"
          ? "They may want more visible warmth and quick emotional feedback than you naturally provide. Silence can get misread."
          : otherStyle === "S"
            ? "They may keep peace externally while resentment builds internally. Invite the small truth before it becomes the big one."
            : "They may process feelings through logic or details. Do not let precision become emotional distance.",
      communication: otherStyle === "D" ? "Start with the emotional need, then the practical request." : otherStyle === "I" ? "Reflect the feeling first, then clarify the plan." : otherStyle === "S" ? "Reassure the bond, then name the change needed." : "State the feeling plainly before solving the logistics.",
      rule: isThinking ? "Say the human impact before the logic starts cross-examining everybody." : "Say the hard request before empathy turns into fog.",
    },
    "Friend/Family": {
      scoreShift: otherStyle === "I" || otherStyle === "S" ? 2 : -1,
      headline: "This mode is about expectations: how you support, recharge, disagree, and avoid old-role traps.",
      chemistry: otherStyle === "D"
        ? "They can be the person who pushes action when everyone else is circling the issue. That is useful when consent and tone are intact."
        : otherStyle === "I"
          ? "They bring levity, stories, and social movement. They can make connection feel easier when life gets heavy."
          : otherStyle === "S"
            ? "They bring consistency and loyalty. They are often the person who keeps showing up after the exciting moment fades."
            : "They bring practical memory, useful questions, and grounded advice. They help prevent drama from replacing facts.",
      friction: otherStyle === "D"
        ? "Family or friend tension can sound like bossiness. Keep asks small and make boundaries explicit."
        : otherStyle === "I"
          ? "They may want faster replies, more visible enthusiasm, or more social availability than you have bandwidth for."
          : otherStyle === "S"
            ? "They may say things are fine when they are not. Watch for quiet withdrawal instead of waiting for an announcement."
            : "They may critique the plan when you wanted support. Ask whether you need comfort, advice, or both.",
      communication: otherStyle === "D" ? "Be direct, but separate the boundary from the accusation." : otherStyle === "I" ? "Show warmth first; then say the actual limit or request." : otherStyle === "S" ? "Use small, specific asks and give time to respond." : "Tell them whether you want analysis, listening, or help deciding.",
      rule: "Do not make them guess the role you need them to play: support, advice, space, or action.",
    },
  };
  const contextProfile = contextProfiles[context];
  const score = clamp(styleScore + contextProfile.scoreShift, 54, 94);
  const tag = score >= 86 ? "Easy chemistry" : score >= 76 ? "Strong with one rule" : score >= 66 ? "Productive tension" : "Handle with context";

  return {
    label: `${self.label} + ${other.label}`,
    styleName: other.name,
    score,
    tag,
    contextHeadline: contextProfile.headline,
    chemistry: contextProfile.chemistry,
    friction: contextProfile.friction,
    communication: contextProfile.communication,
    rule: contextProfile.rule,
    peoplePattern: [
      { title: "You click with", body: `People who respect ${self.short} behavior and can work with your ${topTraitName} instead of fighting it.`, color: C.cyan },
      { title: "You may clash with", body: `${other.label} people when pace, certainty, or emotional tone gets assumed instead of named.`, color: C.gold },
      { title: "How to approach you", body: isIntroverted ? "Give the point, then give room to think. Silence is often processing, not rejection." : "Bring the point and let the conversation move. Visible energy does not mean every idea is final.", color: C.purple },
      { title: "Your adjustment", body: `Use a little more ${lowTraitName}: it keeps your strongest style from becoming the whole room.`, color: C.pink },
    ],
  };
}

type SideHustlePlan = {
  fitLine: string;
  monthlyTarget: number;
  phase: SideHustleProfile["roadmap"][number];
  discAngle: string;
  traitAngle: string;
  nextProof: string;
  weeklyPlan: string[];
};

function buildSideHustlePlan({
  hustle,
  hustleGoal,
  hustleHours,
  mbtiType,
  primaryDisc,
  bigFive,
}: {
  hustle: SideHustleProfile;
  hustleGoal: string;
  hustleHours: number;
  mbtiType: string;
  primaryDisc: string;
  bigFive: BigFiveProfile;
}): SideHustlePlan {
  const phase = hustle.roadmap.find(item => item.phase === hustleGoal) || hustle.roadmap[0];
  const discKey = (primaryDisc || "D").slice(0, 1).toUpperCase();
  const discAngles: Record<string, string> = {
    D: "Lead with results, speed, and ownership. Show the buyer the problem will move.",
    I: "Lead with story, energy, and proof from people. Help the buyer feel momentum and trust.",
    S: "Lead with reliability and care. Show that the process will be calm and clear.",
    C: "Lead with evidence and precision. Show the method before asking for trust.",
  };
  const rankedTraits = getRankedTraits(bigFive);
  const [topTrait, topValue] = rankedTraits[0];
  const topTraitLabel = lowerFirst(TRAIT_DEEP_DIVE[topTrait].label);
  const traitAngle = topValue >= 70
    ? `Your ${topTraitLabel} is your strongest business signal. Make it easy to see in the offer.`
    : `Your ${topTraitLabel} leads here. Keep the offer simple enough to understand in one pass.`;
  const baseRate = hustleGoal === "Scale" ? 560 : hustleGoal === "Validate" ? 360 : 220;
  const traitBonus = bigFive.C >= 70 ? 80 : bigFive.E >= 70 ? 70 : bigFive.O >= 70 ? 60 : 35;
  const monthlyTarget = Math.round(hustleHours * (baseRate + traitBonus));
  return {
    fitLine: `${mbtiType} plus ${DISC_LABELS[discKey] || "your work style"} fits because this idea uses ${hustle.skills.slice(0, 2).join(" and ")}.`,
    monthlyTarget,
    phase,
    discAngle: discAngles[discKey] || discAngles.D,
    traitAngle,
    nextProof: hustle.proof,
    weeklyPlan: [
      `Build: ${hustle.firstProduct}.`,
      `Sell: contact 10 likely buyers in this audience: ${hustle.audience}.`,
      `Measure: ${phase.metric}.`,
    ],
  };
}


type PremiumBlindspotPractice = { id: string; text: string; result: string };
type PremiumBlindspotCard = {
  label: string;
  text: string;
  response: string;
  practice: PremiumBlindspotPractice[];
  best: string;
};

type BlindspotTemplate = {
  label: string;
  text: string;
  response: string;
  trapChoice: string;
  trapResult: string;
  bestChoice: string;
  bestResult: string;
};

const MBTI_BLINDSPOT_CORE: Record<string, BlindspotTemplate> = {
  INTJ: {
    label: "Strategic Tunnel Vision",
    text: "INTJ can see the architecture so clearly that people, timing, and buy-in start looking like minor implementation details. The blind spot is assuming the correct plan will be obvious once explained.",
    response: "Before presenting the plan, ask: 'What would make this feel safe, useful, and worth backing for you?' Then adapt the rollout without diluting the standard.",
    trapChoice: "Reveal the full plan and expect agreement",
    trapResult: "Sharp, but brittle. You win the logic and lose the room.",
    bestChoice: "Test the plan against human friction first",
    bestResult: "Best move. You keep the strategy, but remove the invisible resistance that kills execution.",
  },
  INTP: {
    label: "Endless Model Refinement",
    text: "INTP can keep improving the explanation while the practical decision waits. The blind spot is treating unresolved complexity as a reason not to ship a usable version.",
    response: "Define the smallest answer that would help someone act today. Keep the deeper theory as version two, not the entry ticket.",
    trapChoice: "Keep refining until the model is elegant",
    trapResult: "Intellectually satisfying, operationally late. The moment moves without you.",
    bestChoice: "Ship the useful version with caveats",
    bestResult: "Best move. You protect accuracy while letting the insight do real work.",
  },
  ENTJ: {
    label: "Force Over Trust",
    text: "ENTJ can push so hard toward the objective that hesitation looks like weakness instead of information. The blind spot is mistaking compliance for commitment.",
    response: "State the decision, then ask: 'What risk are you seeing that I might be underweighting?' Use the answer to strengthen the plan, not slow it into mush.",
    trapChoice: "Drive harder until people move",
    trapResult: "Fast, but expensive. You get motion while trust quietly depreciates.",
    bestChoice: "Extract the objection before locking the decision",
    bestResult: "Best move. You preserve authority and turn resistance into better execution data.",
  },
  ENTP: {
    label: "Novelty Escape Hatch",
    text: "ENTP can generate a smarter angle whenever the current path gets boring. The blind spot is using possibility as a beautiful excuse to avoid commitment.",
    response: "Name the active bet and the finish line before opening a new option. New ideas go into a parking lot until the current proof exists.",
    trapChoice: "Pivot to the more interesting angle",
    trapResult: "Stimulating, but leaky. Momentum resets every time discomfort arrives dressed as creativity.",
    bestChoice: "Finish the current proof before pivoting",
    bestResult: "Best move. You turn range into leverage instead of scattered brilliance.",
  },
  INFJ: {
    label: "Private Burden Loop",
    text: "INFJ can sense the deeper pattern but carry it alone until the weight becomes resentment. The blind spot is waiting for the perfect language before asking for help or setting terms.",
    response: "Share the early version: 'Here is what I am noticing, here is what I need, and here is the next honest step.' Clarity beats silent endurance.",
    trapChoice: "Hold it privately until it makes complete sense",
    trapResult: "Noble, but isolating. People cannot support a signal they never receive.",
    bestChoice: "Speak the pattern while it is still forming",
    bestResult: "Best move. You keep the depth while making the burden shared and actionable.",
  },
  INFP: {
    label: "Meaning Before Movement",
    text: "INFP can wait for a choice to feel completely aligned before acting. The blind spot is letting purity of intent block the imperfect step that would clarify the path.",
    response: "Choose the smallest action that honors the value without demanding total certainty. Let movement reveal the next layer of meaning.",
    trapChoice: "Wait until the option feels perfectly right",
    trapResult: "Emotionally coherent, but stalled. The value stays private instead of becoming real.",
    bestChoice: "Take one values-aligned imperfect step",
    bestResult: "Best move. You protect authenticity while refusing to let it become paralysis.",
  },
  ENFJ: {
    label: "Over-Functioning for the Group",
    text: "ENFJ can feel responsible for everyone else's energy, growth, and alignment. The blind spot is calling over-extension leadership because it keeps the room warm.",
    response: "Ask: 'What is mine to lead, and what must they carry?' Then set the boundary before resentment writes it for you.",
    trapChoice: "Absorb the tension so the group stays okay",
    trapResult: "Warm today, corrosive tomorrow. You teach people to outsource their ownership.",
    bestChoice: "Name the boundary and return ownership",
    bestResult: "Best move. You keep the care while making the system healthier.",
  },
  ENFP: {
    label: "Spark Without Closure",
    text: "ENFP can see so many promising threads that finishing one path feels like betraying the others. The blind spot is confusing aliveness with progress.",
    response: "Pick one spark and define the visible proof it must produce. Keep the magic, but give it a container.",
    trapChoice: "Follow the newest exciting thread",
    trapResult: "Alive, but fragmented. The pattern never gets enough repetition to become proof.",
    bestChoice: "Put one spark inside a finish line",
    bestResult: "Best move. You turn enthusiasm into a body of work people can trust.",
  },
  ISTJ: {
    label: "Reliable but Rigid",
    text: "ISTJ can trust proven methods so deeply that changed conditions look like distractions. The blind spot is defending the process after the problem has evolved.",
    response: "Keep the standard, but run one controlled experiment. Ask: 'What evidence would prove the old way is no longer the best way?'",
    trapChoice: "Stay with the proven procedure",
    trapResult: "Safe, but narrow. Reliability becomes a ceiling instead of a foundation.",
    bestChoice: "Protect the standard while testing an update",
    bestResult: "Best move. You preserve trust while allowing the system to learn.",
  },
  ISFJ: {
    label: "Invisible Infrastructure",
    text: "ISFJ can become the quiet support system everyone depends on but nobody sees. The blind spot is assuming care has to be self-erasing to be real.",
    response: "Make the support visible and bounded: 'I can help with this piece, and here is what I need from you.' Care works better with terms.",
    trapChoice: "Handle it quietly so nobody struggles",
    trapResult: "Kind, but costly. You create comfort while hiding the actual load.",
    bestChoice: "Offer help with clear terms",
    bestResult: "Best move. You keep the loyalty while preventing quiet burnout.",
  },
  ESTJ: {
    label: "Control Before Context",
    text: "ESTJ can move quickly to standards, roles, and correction. The blind spot is treating emotional or exploratory context as inefficiency when it is actually execution data.",
    response: "Before enforcing the process, say: 'Here is the outcome we need; what context changes how we get there?' Then tighten the system around reality.",
    trapChoice: "Correct the process immediately",
    trapResult: "Clear, but blunt. You may fix the procedure while missing why it failed.",
    bestChoice: "Gather context, then enforce the standard",
    bestResult: "Best move. You keep accountability and make the fix more accurate.",
  },
  ESFJ: {
    label: "Harmony Over Truth",
    text: "ESFJ can keep the atmosphere pleasant long after the real issue needs daylight. The blind spot is mistaking tension avoidance for care.",
    response: "Say the useful truth warmly and specifically: 'I care about this working, so I need to name what is not working yet.'",
    trapChoice: "Soften the issue until nobody feels uncomfortable",
    trapResult: "Gentle, but evasive. The room feels better while the problem keeps growing.",
    bestChoice: "Tell the truth with warmth and specificity",
    bestResult: "Best move. You protect trust by refusing to let harmony become denial.",
  },
  ISTP: {
    label: "Silent Competence",
    text: "ISTP can solve the mechanism without explaining the thinking. The blind spot is assuming the fix speaks for itself when people need confidence in the process.",
    response: "Give the short version: 'Here is what broke, here is what I changed, and here is how we will know it works.'",
    trapChoice: "Just fix it and skip the explanation",
    trapResult: "Efficient, but opaque. People trust the outcome less because they cannot see the reasoning.",
    bestChoice: "Explain the fix in three plain steps",
    bestResult: "Best move. You keep speed while making your competence transferable.",
  },
  ISFP: {
    label: "Withdrawn Authenticity",
    text: "ISFP can protect inner truth by disappearing when the environment feels too harsh or over-structured. The blind spot is letting withdrawal make your needs unreadable.",
    response: "Name the constraint you need: 'I can do strong work here if we protect this condition.' Authenticity needs a frame, not a vanishing act.",
    trapChoice: "Pull back until the pressure passes",
    trapResult: "Protective, but invisible. People may misread your silence as indifference.",
    bestChoice: "Name the condition that lets you contribute",
    bestResult: "Best move. You protect your truth while staying in the conversation.",
  },
  ESTP: {
    label: "Speed as Strategy",
    text: "ESTP can read the moment and act before others finish blinking. The blind spot is treating the fastest move as the best move when the second-order consequence matters more.",
    response: "Pause for one tactical check: 'What happens after this works?' Then move with both speed and consequence in view.",
    trapChoice: "Take the opening immediately",
    trapResult: "Bold, but exposed. You may win the moment and inherit the mess.",
    bestChoice: "Check the consequence, then move",
    bestResult: "Best move. You keep your edge while avoiding avoidable cleanup.",
  },
  ESFP: {
    label: "Relief Before Resolution",
    text: "ESFP can restore energy fast, but sometimes before the real issue has been named. The blind spot is chasing a better feeling instead of finishing the uncomfortable repair.",
    response: "Name the issue first, then bring the energy back: 'Here is what needs attention; after that, we can make this lighter.'",
    trapChoice: "Lift the mood and move on",
    trapResult: "Charismatic, but incomplete. The room feels better before the problem is actually handled.",
    bestChoice: "Name the issue before changing the energy",
    bestResult: "Best move. You use presence to repair, not distract.",
  },
};

const DISC_BLINDSPOT_LENS: Record<string, BlindspotTemplate> = {
  D: {
    label: "Dominant Spillover",
    text: "Your direct-driver style can convert urgency into pressure before people have had enough context to commit. The blind spot is assuming resistance means slowness instead of missing trust or missing information.",
    response: "Say: 'Here is the decision I am leaning toward. What risk, constraint, or person am I not accounting for yet?'",
    trapChoice: "Push harder for a decision",
    trapResult: "You may get speed, but you also create hidden drag.",
    bestChoice: "Surface the missing context before pushing",
    bestResult: "Best move. The decision gets stronger and the room has less reason to resist it later.",
  },
  I: {
    label: "Influential Spillover",
    text: "Your social-spark style can make the future sound so exciting that details become tomorrow's problem. The blind spot is mistaking emotional momentum for durable agreement.",
    response: "Say: 'Before we say yes, what exactly are we committing to, who owns it, and when will we check progress?'",
    trapChoice: "Ride the excitement and commit quickly",
    trapResult: "Energizing, but risky. The promise can outrun the operating plan.",
    bestChoice: "Turn enthusiasm into explicit ownership",
    bestResult: "Best move. You keep the spark while making trust easier to maintain.",
  },
  S: {
    label: "Steady Spillover",
    text: "Your steady-anchor style can preserve peace so well that necessary disruption arrives late. The blind spot is assuming patience is always the mature move.",
    response: "Say: 'I want to keep this steady, and the useful tension is this...' Then name the change while it is still small.",
    trapChoice: "Wait until everyone feels ready",
    trapResult: "Calm, but delayed. The cost of avoiding friction quietly compounds.",
    bestChoice: "Introduce the useful tension early",
    bestResult: "Best move. You protect stability by dealing with reality sooner.",
  },
  C: {
    label: "Conscientious Spillover",
    text: "Your precise-analyst style can keep polishing the answer after a useful version would already help. The blind spot is treating uncertainty as permission to delay visibility.",
    response: "Say: 'This is the current best version, here is what is uncertain, and here is the decision it supports.'",
    trapChoice: "Keep refining until the evidence is complete",
    trapResult: "Careful, but slow. Quality control becomes a hiding place.",
    bestChoice: "Share the provisional answer with clear caveats",
    bestResult: "Best move. You keep precision while letting others act on what is already known.",
  },
};

const TRAIT_BLINDSPOT_LENS: Record<keyof BigFiveProfile, Record<"high" | "balanced" | "low", BlindspotTemplate>> = {
  O: {
    high: {
      label: "Openness Blindspot",
      text: "Your openness can keep expanding the map after the next useful road is already visible. The blind spot is treating more possibility as automatically better thinking.",
      response: "Choose one idea and ask what evidence would make it real this week.",
      trapChoice: "Explore one more possibility",
      trapResult: "Interesting, but diffuse. The idea gets richer while the proof stays thin.",
      bestChoice: "Turn one possibility into a test",
      bestResult: "Best move. Imagination becomes evidence instead of vapor.",
    },
    balanced: {
      label: "Openness Blindspot",
      text: "Your balanced openness can switch between practical and imaginative thinking, but the blind spot is not naming which mode the moment needs.",
      response: "Ask whether this problem needs a proven answer, a new angle, or a hybrid of both.",
      trapChoice: "Default to the easiest mode",
      trapResult: "Comfortable, but underpowered. The problem may need the other half of your range.",
      bestChoice: "Choose the thinking mode deliberately",
      bestResult: "Best move. You use range on purpose instead of by mood.",
    },
    low: {
      label: "Openness Blindspot",
      text: "Your quieter openness can keep you grounded, but the blind spot is dismissing a strange idea before it has been translated into practical terms.",
      response: "Ask: 'What would make this weird idea useful, safe, or testable?'",
      trapChoice: "Reject the idea because it feels impractical",
      trapResult: "Sensible, but possibly premature. You may throw away a useful future option.",
      bestChoice: "Translate novelty into a small test",
      bestResult: "Best move. You keep practicality while giving innovation a fair trial.",
    },
  },
  C: {
    high: {
      label: "Follow-through Blindspot",
      text: "Your follow-through can make standards so central that rest, iteration, or imperfect starts feel irresponsible. The blind spot is treating control as the only path to reliability.",
      response: "Define what good enough means before you start, then stop when the work meets that standard.",
      trapChoice: "Raise the standard again",
      trapResult: "Admirable, but draining. Excellence turns into an endless tax.",
      bestChoice: "Use a clear done line",
      bestResult: "Best move. You preserve quality without letting it eat momentum.",
    },
    balanced: {
      label: "Structure Blindspot",
      text: "Your balanced structure can flex between planning and freedom, but the blind spot is leaving the structure implicit until pressure exposes it.",
      response: "Write the next milestone, owner, and check-in before the work gets busy.",
      trapChoice: "Assume the structure is obvious",
      trapResult: "Maybe, until reality gets crowded. Then the hidden plan becomes confusion.",
      bestChoice: "Make the structure visible early",
      bestResult: "Best move. You reduce friction without becoming rigid.",
    },
    low: {
      label: "Flexible Structure Blindspot",
      text: "Your quieter structure can keep you flexible, but the blind spot is relying on inspiration where a simple rhythm would protect the outcome.",
      response: "Build a small external system: one deadline, one checklist, one accountability point.",
      trapChoice: "Wait until motivation returns",
      trapResult: "Human, but unreliable. The outcome depends on weather instead of design.",
      bestChoice: "Install a tiny external rhythm",
      bestResult: "Best move. You keep flexibility while giving follow-through a spine.",
    },
  },
  E: {
    high: {
      label: "Extraversion Blindspot",
      text: "Your extraversion can pull energy from the room so quickly that reflection gets skipped. The blind spot is assuming the loudest live signal is the truest one.",
      response: "After the conversation, take five quiet minutes to separate excitement from actual evidence.",
      trapChoice: "Act on the room's energy immediately",
      trapResult: "Responsive, but noisy. Momentum may be borrowed from the crowd, not the truth.",
      bestChoice: "Debrief the signal before acting",
      bestResult: "Best move. You keep social intelligence while filtering it through judgment.",
    },
    balanced: {
      label: "Extraversion Blindspot",
      text: "Your balanced extraversion lets you move between people and solitude, but the blind spot is not protecting the mode that the task actually requires.",
      response: "Choose the setting deliberately: live feedback for ambiguity, solitude for synthesis.",
      trapChoice: "Use whichever setting is convenient",
      trapResult: "Fine, but inconsistent. The environment may fight the work.",
      bestChoice: "Match the setting to the task",
      bestResult: "Best move. Your energy becomes a tool instead of a coin flip.",
    },
    low: {
      label: "Extraversion Blindspot",
      text: "Your quieter extraversion can support depth, but the blind spot is keeping useful work invisible too long. People cannot value what never leaves the cave.",
      response: "Share the rough signal with one trusted person before it feels presentation-ready.",
      trapChoice: "Wait until it is fully polished",
      trapResult: "Safe, but hidden. The work misses feedback that could sharpen it.",
      bestChoice: "Show one useful draft to one person",
      bestResult: "Best move. You keep depth while letting reality improve the work.",
    },
  },
  A: {
    high: {
      label: "Agreeableness Blindspot",
      text: "Your agreeableness can make other people's comfort feel like your responsibility. The blind spot is saying yes to preserve warmth while quietly creating resentment.",
      response: "Use the honest kind sentence: 'I want to help, and I cannot own that whole piece.'",
      trapChoice: "Say yes because they need support",
      trapResult: "Kind, but expensive. The relationship gets comfort now and hidden strain later.",
      bestChoice: "Offer a bounded yes or clean no",
      bestResult: "Best move. You keep care clean instead of turning it into self-erasure.",
    },
    balanced: {
      label: "Agreeableness Blindspot",
      text: "Your balanced agreeableness can cooperate or challenge, but the blind spot is softening the message when the situation needs a clean edge.",
      response: "State the truth, then state the relationship: 'Here is the issue, and I am saying it because I want this to work.'",
      trapChoice: "Hint instead of saying it directly",
      trapResult: "Polite, but muddy. People may miss the signal you thought was obvious.",
      bestChoice: "Be direct and relational at the same time",
      bestResult: "Best move. You preserve respect without hiding the point.",
    },
    low: {
      label: "Agreeableness Blindspot",
      text: "Your quieter agreeableness can make you candid and independent, but the blind spot is underestimating how much relational buy-in affects execution.",
      response: "Add one sentence of human context before the critique: what you respect, what you want, and why the issue matters.",
      trapChoice: "Say the blunt truth and move on",
      trapResult: "Clear, but costly. The truth lands harder than it needs to.",
      bestChoice: "Add context before critique",
      bestResult: "Best move. You keep honesty while making it easier to use.",
    },
  },
  N: {
    high: {
      label: "Emotional Range Blindspot",
      text: "Your emotional range can detect risk early, but the blind spot is letting the alarm become the whole strategy. Sensitivity is data; it is not automatically direction.",
      response: "Name the fear, name the evidence, then choose one next action that would reduce uncertainty.",
      trapChoice: "Keep scanning for what could go wrong",
      trapResult: "Protective, but exhausting. The scanner gets louder without creating control.",
      bestChoice: "Convert the alarm into one action",
      bestResult: "Best move. You respect the signal without letting it drive the car.",
    },
    balanced: {
      label: "Emotional Range Blindspot",
      text: "Your balanced emotional range gives you usable stress data, but the blind spot is checking it too late. By the time it is obvious, the choice may already be bent by pressure.",
      response: "Run a quick pressure check before major decisions: body, story, risk, next action.",
      trapChoice: "Assume you are fine until stress is obvious",
      trapResult: "Reasonable, but reactive. The pressure has more influence when unnamed.",
      bestChoice: "Check the stress signal early",
      bestResult: "Best move. You catch distortion before it becomes a decision style.",
    },
    low: {
      label: "Emotional Range Blindspot",
      text: "Your quieter emotional range can keep you steady, but the blind spot is missing urgency until consequences become visible. Calm is useful unless it delays repair.",
      response: "Install early alarms: ask what would become expensive if ignored for another week.",
      trapChoice: "Stay calm and wait for clearer evidence",
      trapResult: "Composed, but late. Some problems punish delayed concern.",
      bestChoice: "Set an early warning trigger",
      bestResult: "Best move. You keep steadiness while respecting weak signals.",
    },
  },
};


function simplifyBlindspotText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const parts = cleaned.split(" The blind spot is ");
  if (parts.length === 2) return `${parts[0]}. Watch-out: ${parts[1]}`;
  return cleaned.split(/(?<=\.)\s+/).slice(0, 2).join(" ");
}

function simplifyPracticeResult(text: string) {
  return text
    .replace(/^Best move\.\s*/i, "")
    .replace(/^Sharp, but\s*/i, "")
    .replace(/^Efficient, but\s*/i, "")
    .replace(/^Interesting, but\s*/i, "")
    .replace(/^Safe, but\s*/i, "")
    .replace(/^Comfortable, but\s*/i, "")
    .trim();
}

function buildPremiumBlindspots({
  mbtiType,
  primaryDisc,
  bigFive,
}: {
  mbtiType: string;
  primaryDisc: string;
  bigFive: BigFiveProfile;
}): PremiumBlindspotCard[] {
  const mbtiCore = MBTI_BLINDSPOT_CORE[mbtiType] || MBTI_BLINDSPOT_CORE.INTJ;
  const discKey = (primaryDisc || "D").slice(0, 1).toUpperCase();
  const discCore = DISC_BLINDSPOT_LENS[discKey] || DISC_BLINDSPOT_LENS.D;
  const rankedTraits = getRankedTraits(bigFive);
  const [topTrait, topValue] = rankedTraits[0];
  const [lowestTrait, lowestValue] = rankedTraits[rankedTraits.length - 1];
  const pressureTrait: keyof BigFiveProfile = bigFive.N >= 64 || bigFive.N <= 38 ? "N" : lowestTrait;
  const pressureBand = pressureTrait === "N"
    ? (bigFive.N >= 64 ? "high" : bigFive.N <= 38 ? "low" : "balanced")
    : bandTrait(lowestValue) as "high" | "balanced" | "low";
  const growthTrait: keyof BigFiveProfile = pressureTrait === lowestTrait ? topTrait : lowestTrait;
  const growthValue = growthTrait === topTrait ? topValue : lowestValue;
  const growthBand = bandTrait(growthValue) as "high" | "balanced" | "low";
  const pressureCore = TRAIT_BLINDSPOT_LENS[pressureTrait][pressureBand];
  const growthCore = TRAIT_BLINDSPOT_LENS[growthTrait][growthBand];

  const toCard = (template: BlindspotTemplate): PremiumBlindspotCard => ({
    label: template.label,
    text: simplifyBlindspotText(template.text),
    response: simplifyBlindspotText(template.response),
    practice: [
      { id: "trap", text: template.trapChoice, result: simplifyPracticeResult(template.trapResult) },
      { id: "best", text: template.bestChoice, result: simplifyPracticeResult(template.bestResult) },
    ],
    best: "best",
  });

  return [
    toCard(mbtiCore),
    toCard(discCore),
    toCard(pressureCore),
    toCard(growthCore),
  ];
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
      const disc = normalizeDiscProfile(fakeScores.disc);
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
  const disc = normalizeDiscProfile(scores.disc);
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

function TopNav({ premium = false, left = null as ReactNode, right = null as ReactNode }) {
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

function GlassCard({ children, style = {} as CSSProperties, glow = false }: {
  children: ReactNode; style?: CSSProperties; glow?: boolean;
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


type PortraitAccordionProps = {
  icon: string;
  eyebrow: string;
  title: string;
  summary: string;
  accent: string;
  analyticsId?: string;
  onOpen?: (analyticsId: string) => void;
  children: ReactNode;
};

function PortraitAccordion({ icon, eyebrow, title, summary, accent, analyticsId, onOpen, children }: PortraitAccordionProps) {
  return (
    <details
      onToggle={(event) => {
        if (event.currentTarget.open && analyticsId) onOpen?.(analyticsId);
      }}
      style={{
        borderRadius: C.cardRadius,
        marginBottom: 12,
        background: C.glassBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `2px solid ${C.glassBorderBright}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "42px 1fr auto",
          alignItems: "center",
          gap: 11,
          padding: "14px 14px",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accent,
        }} />
        <span style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          background: `${accent}16`,
          border: `1px solid ${accent}4a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 19,
        }}>{icon}</span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 9.5, fontWeight: 900, letterSpacing: 1.05, textTransform: "uppercase", color: accent, marginBottom: 4 }}>{eyebrow}</span>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 900, color: C.text, lineHeight: 1.2 }}>{title}</span>
          <span style={{ display: "block", fontSize: 11, lineHeight: 1.35, color: C.textMuted, marginTop: 4 }}>{summary}</span>
        </span>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: accent,
            fontSize: 16,
            fontWeight: 900,
          }}
        >⌄</span>
      </summary>
      <div style={{ padding: "0 14px 16px" }}>
        {children}
      </div>
    </details>
  );
}

function SectionLabel({ children, subtitle, icon = "✦", accent = C.cyan }: { children: ReactNode; subtitle?: string; icon?: string; accent?: string }) {
  return (
    <div style={{ margin: "100px 0 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: subtitle ? 9 : 0 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${accent}66, ${C.glassBorder})` }} />
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 16px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.055)",
          border: `1px solid ${accent}44`,
          boxShadow: `0 0 22px ${accent}16`,
          color: C.text,
        }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 15, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.9 }}>{children}</span>
        </div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.glassBorder}, ${accent}66, transparent)` }} />
      </div>
      {subtitle && <div style={{ maxWidth: 380, margin: "0 auto", textAlign: "center", fontSize: 11, lineHeight: 1.5, color: C.textDim }}>{subtitle}</div>}
    </div>
  );
}

function FullPortraitSection({ step, eyebrow, title, subtitle, accent = C.cyan, framed = false, children }: {
  step: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: string;
  framed?: boolean;
  children: ReactNode;
}) {
  return (
    <section aria-label={`${step} ${title}`} style={{
      marginBottom: 18,
      padding: framed ? 13 : 0,
      borderRadius: framed ? 24 : undefined,
      background: framed ? `linear-gradient(135deg, ${accent}10, rgba(255,255,255,0.025))` : undefined,
      border: framed ? `2px solid ${accent}55` : undefined,
      boxShadow: framed ? `0 20px 48px rgba(0,0,0,0.22), 0 0 36px ${accent}18` : undefined,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "42px 1fr",
        gap: 11,
        alignItems: "start",
        padding: "13px 14px",
        marginBottom: framed ? 12 : 10,
        borderRadius: 18,
        background: "rgba(255,255,255,0.032)",
        border: `1px solid ${accent}2e`,
        boxShadow: framed ? "none" : `0 12px 28px rgba(0,0,0,0.12), 0 0 20px ${accent}0f`,
      }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: `${accent}15`,
          border: `1px solid ${accent}42`,
          color: accent,
          fontSize: 12,
          fontWeight: 950,
          letterSpacing: 0.4,
        }}>{step}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9.5, fontWeight: 950, letterSpacing: 1.1, textTransform: "uppercase", color: accent, marginBottom: 4 }}>{eyebrow}</div>
          <div style={{ fontSize: 17, fontWeight: 950, color: C.text, lineHeight: 1.15, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 11, lineHeight: 1.45, color: C.textMuted }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {children}
      </div>
    </section>
  );
}

type ShareReportPayload = {
  sessionId?: string;
  title: string;
  subtitle: string;
  mbtiType: string;
  archetype: string;
  primaryDisc: string;
  population: string;
  career: { title: string; salary: string; summary: string };
  bigFive: BigFiveProfile;
  disc: DiscProfile;
  sections: { title: string; subtitle?: string; body?: string; items?: { label: string; value: string; detail?: string }[] }[];
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ShareResultsModal({ open, onClose, report }: { open: boolean; onClose: () => void; report: ShareReportPayload }) {
  const [busyAction, setBusyAction] = useState<"pdf" | "native" | "image" | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  if (!open) return null;

  const discLabel = DISC_LABELS[report.primaryDisc] || "Primary Style";
  const fileName = `KnowYouRole-Full-Portrait-${report.mbtiType}-${report.sessionId?.slice(-6) || "Report"}.pdf`;
  const imageName = `KnowYouRole-Share-Card-${report.mbtiType}-${report.sessionId?.slice(-6) || "Result"}.png`;
  const shareUrl = BRAND_SHARE_URL;
  const mbtiInsight = MBTI_SHARE_INSIGHTS[report.mbtiType] || "I use my personality signal as a compass.";
  const shareInsight = getShareInsight(report.mbtiType, discLabel);
  const shareText = `My KnowYouRole result: ${report.mbtiType} + ${report.primaryDisc} ${discLabel}. ${mbtiInsight} ${BRAND_SHARE_HOST}`;
  const emailSubject = encodeURIComponent(`My KnowYouRole result: ${report.mbtiType}`);
  const emailBody = encodeURIComponent(`${shareText}\n\nI can attach the PDF or social card too.`);
  const smsBody = encodeURIComponent(shareText);
  const shareEventParams = { result_page: "full_portrait", mbti_type: report.mbtiType, primary_disc: report.primaryDisc };

  const generatePDF = async () => {
    setShareError(null);
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report }),
    });
    if (!response.ok) {
      let message = "PDF generation failed. Try again in a minute.";
      try {
        const data = await response.json();
        if (typeof data?.error === "string") message = data.error;
      } catch {
        // Keep the user-facing fallback. Parsing error pages is not a personality trait.
      }
      throw new Error(message);
    }
    const blob = await response.blob();
    const type = response.headers.get("content-type") || blob.type;
    if (!type.includes("application/pdf") || blob.size < 1000) {
      throw new Error("PDF generation returned an invalid file. Please try again.");
    }
    return blob;
  };

  const handleDownload = async () => {
    trackKyrEvent("share_action_clicked", { ...shareEventParams, share_action: "pdf" });
    trackKyrEvent("pdf_save_clicked", { ...shareEventParams });
    setBusyAction("pdf");
    try {
      downloadBlob(await generatePDF(), fileName);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "PDF download failed. Please try again.");
    } finally {
      setBusyAction(null);
    }
  };

  const makeSocialCard = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create share card. Try the PDF instead.");

    const discColor = DISC_COLORS[report.primaryDisc] || C.cyan;
    const topBigFive = (Object.entries(report.bigFive) as [keyof BigFiveProfile, number][]).reduce((a, b) => a[1] > b[1] ? a : b);
    const topBigFiveName = topBigFive[0] === "O" ? "Openness" : topBigFive[0] === "C" ? "Structure / Follow-through" : topBigFive[0] === "E" ? "Extraversion" : topBigFive[0] === "A" ? "Agreeableness" : "Stress Reactivity";

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };
    const fillRoundRect = (x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) => {
      roundRect(x, y, w, h, r);
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };
    const drawText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number, font: string, fill: string) => {
      ctx.font = font;
      ctx.fillStyle = fill;
      const words = text.split(" ").filter(Boolean);
      let line = "";
      let lines = 0;
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > maxWidth && line) {
          ctx.fillText(line, x, y + lines * lineHeight);
          line = word;
          lines += 1;
          if (lines >= maxLines) return;
        } else {
          line = next;
        }
      }
      if (line && lines < maxLines) ctx.fillText(line, x, y + lines * lineHeight);
    };

    const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
    bg.addColorStop(0, "#080414");
    bg.addColorStop(0.48, "#120826");
    bg.addColorStop(1, "#05020c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1350);
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath(); ctx.arc(130, 120, 260, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#a855f7";
    ctx.beginPath(); ctx.arc(1000, 90, 330, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f472b6";
    ctx.beginPath(); ctx.arc(920, 1180, 250, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(0, 0, 1080, 14);
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(0, 0, 650, 14);

    ctx.font = "800 38px Inter, Arial, sans-serif";
    ctx.fillStyle = "#22d3ee";
    ctx.fillText("KnowYouRole", 72, 96);
    ctx.font = "700 20px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.56)";
    ctx.fillText("Full Portrait share card", 72, 132);

    fillRoundRect(72, 190, 936, 780, 42, "rgba(255,255,255,0.065)", "rgba(255,255,255,0.18)");
    ctx.font = "800 28px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.fillText("MY PERSONALITY SIGNAL", 122, 270);
    ctx.font = "900 150px Inter, Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(report.mbtiType, 118, 430);
    drawText(report.archetype, 126, 488, 560, 50, 2, "800 42px Inter, Arial, sans-serif", "#a855f7");

    fillRoundRect(126, 610, 360, 88, 24, "rgba(34,211,238,0.10)", "rgba(34,211,238,0.30)");
    ctx.font = "800 22px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.fillText("DISC", 154, 642);
    ctx.font = "900 30px Inter, Arial, sans-serif";
    ctx.fillStyle = discColor;
    ctx.fillText(`${report.primaryDisc} - ${discLabel}`, 154, 678);

    fillRoundRect(520, 610, 360, 88, 24, "rgba(245,158,11,0.10)", "rgba(245,158,11,0.30)");
    ctx.font = "800 22px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.fillText("TOP TRAIT", 548, 642);
    ctx.font = "900 30px Inter, Arial, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`${topBigFiveName} ${topBigFive[1]}%`, 548, 678);

    ctx.font = "800 24px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.fillText("CAREER SIGNAL", 126, 790);
    drawText(report.career.title, 126, 850, 780, 56, 2, "900 54px Inter, Arial, sans-serif", "#fbbf24");
    drawText(report.career.salary || "", 126, 955, 780, 34, 1, "800 30px Inter, Arial, sans-serif", "rgba(255,255,255,0.70)");

    fillRoundRect(72, 1032, 936, 190, 34, "rgba(34,211,238,0.075)", "rgba(34,211,238,0.20)");
    ctx.font = "800 22px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.fillText("MY OPERATING SIGNAL", 122, 1090);
    drawText(shareInsight, 122, 1142, 800, 42, 2, "800 35px Inter, Arial, sans-serif", "#ffffff");
    ctx.font = "900 30px Inter, Arial, sans-serif";
    ctx.fillStyle = "#22d3ee";
    ctx.fillText(BRAND_SHARE_HOST, 122, 1270);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((nextBlob) => nextBlob ? resolve(nextBlob) : reject(new Error("Share card export failed.")), "image/png", 0.92);
    });
    return blob;
  };

  const handleSocialCard = async () => {
    trackKyrEvent("share_action_clicked", { ...shareEventParams, share_action: "share_card" });
    trackKyrEvent("share_primary_clicked", { ...shareEventParams, share_action: "share_card" });
    setBusyAction("image");
    try {
      const imageBlob = await makeSocialCard();
      const imageFile = new File([imageBlob], imageName, { type: "image/png" });
      if (navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({ title: "My KnowYouRole result", text: shareText, files: [imageFile] });
      } else if (navigator.share) {
        await navigator.share({ title: "My KnowYouRole result", text: shareText, url: shareUrl });
        downloadBlob(imageBlob, imageName);
      } else {
        downloadBlob(imageBlob, imageName);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareError(error instanceof Error ? error.message : "Social card sharing failed. Try Save / Download PDF.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleNativeShare = async () => {
    trackKyrEvent("share_action_clicked", { ...shareEventParams, share_action: "native_share" });
    setBusyAction("native");
    try {
      const pdfBlob = await generatePDF();
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({ title: report.title, text: shareText, files: [pdfFile] });
      } else if (navigator.share) {
        await navigator.share({ title: report.title, text: shareText, url: shareUrl });
        downloadBlob(pdfBlob, fileName);
      } else {
        downloadBlob(pdfBlob, fileName);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareError(error instanceof Error ? error.message : "Sharing failed. Use Save / Download PDF instead.");
    } finally {
      setBusyAction(null);
    }
  };

  const copyMessage = async () => {
    trackKyrEvent("share_action_clicked", { ...shareEventParams, share_action: "copy" });
    setShareError(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setShareError("Copy failed. You can still use Email or Text results.");
    }
  };

  const shareTopBigFive = (Object.entries(report.bigFive) as [keyof BigFiveProfile, number][]).reduce((a, b) => a[1] > b[1] ? a : b);
  const shareTopBigFiveName = shareTopBigFive[0] === "O" ? "Openness" : shareTopBigFive[0] === "C" ? "Structure / Follow-through" : shareTopBigFive[0] === "E" ? "Extraversion" : shareTopBigFive[0] === "A" ? "Agreeableness" : "Stress Reactivity";

  const baseActionStyle: CSSProperties = {
    width: "100%",
    border: `1px solid ${C.glassBorderBright}`,
    background: "rgba(255,255,255,0.055)",
    color: C.text,
    textAlign: "left",
    fontFamily: "Inter, sans-serif",
    cursor: "pointer",
    transition: "transform 160ms ease, border-color 160ms ease, background 160ms ease",
  };

  const primaryActionStyle: CSSProperties = {
    ...baseActionStyle,
    borderRadius: 22,
    padding: "15px 16px",
    minHeight: 94,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const quickActionStyle: CSSProperties = {
    ...baseActionStyle,
    borderRadius: 18,
    padding: "12px 10px",
    minHeight: 76,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    textDecoration: "none",
  };

  const actionLabelStyle: CSSProperties = { display: "block", fontSize: 13, fontWeight: 900, letterSpacing: -0.1 };
  const actionHintStyle: CSSProperties = { display: "block", fontSize: 10.5, lineHeight: 1.35, color: C.textMuted, marginTop: 5 };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share results"
      onClick={(event) => event.target === event.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "radial-gradient(circle at 50% 18%, rgba(34,211,238,0.18), transparent 34%), rgba(3, 2, 10, 0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ width: "min(500px, 100%)", maxHeight: "90dvh", overflowY: "auto", borderRadius: 30, background: `linear-gradient(145deg, rgba(13,8,30,0.98), rgba(6,4,16,0.99))`, border: `1px solid ${C.glassBorderBright}`, boxShadow: "0 32px 100px rgba(0,0,0,0.62)", color: C.text }}>
        <div style={{ padding: 18, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at top left, ${C.cyanGlow}, transparent 42%), radial-gradient(circle at 90% 0%, rgba(168,85,247,0.32), transparent 38%)`, pointerEvents: "none" }} />
          <button type="button" onClick={onClose} aria-label="Close share options" style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 999, border: `1px solid ${C.glassBorder}`, background: "rgba(255,255,255,0.075)", color: C.text, cursor: "pointer", fontSize: 18, zIndex: 2 }}>×</button>

          <div style={{ position: "relative", display: "grid", gap: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1.8, color: C.cyan, textTransform: "uppercase", marginBottom: 6 }}>Share your Full Portrait</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: -0.6 }}>Pick the format</div>
              <div style={{ fontSize: 12, lineHeight: 1.45, color: C.textMuted, maxWidth: 360 }}>One visual card, one polished PDF, or a clean message. No clutter.</div>
            </div>

            <div style={{ border: `1px solid rgba(34,211,238,0.24)`, background: "linear-gradient(135deg, rgba(34,211,238,0.11), rgba(168,85,247,0.08))", borderRadius: 24, padding: 14, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.1, fontWeight: 900, marginBottom: 4 }}>Preview</div>
                  <div style={{ fontSize: 18, fontWeight: 950, color: C.text }}>{report.mbtiType} · {report.primaryDisc} {discLabel}</div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 18, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.08)", border: `1px solid ${C.glassBorder}`, fontSize: 24 }}>↗</div>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>{report.career.title} · {shareTopBigFiveName} signal · {BRAND_SHARE_HOST}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 18px 18px", display: "grid", gap: 12 }}>
          {shareError && (
            <div role="alert" style={{ border: "1px solid rgba(248,113,113,0.35)", background: "rgba(248,113,113,0.1)", borderRadius: 16, padding: "10px 12px", color: "#fecaca", fontSize: 12, lineHeight: 1.45 }}>
              {shareError}
            </div>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            <button type="button" onClick={handleSocialCard} disabled={Boolean(busyAction)} style={{ ...primaryActionStyle, minHeight: 88, borderColor: "rgba(245,158,11,0.48)", background: "linear-gradient(145deg, rgba(245,158,11,0.22), rgba(168,85,247,0.12))", boxShadow: "0 16px 42px rgba(245,158,11,0.12)" }}>
              <span style={{ fontSize: 24 }}>🖼️</span>
              <span>
                <span style={{ ...actionLabelStyle, fontSize: 15 }}>{busyAction === "image" ? "Creating…" : "Share result card"}</span>
                <span style={actionHintStyle}>Primary action: a clean visual card for socials, texts, and group chats.</span>
              </span>
            </button>

            <button type="button" onClick={handleDownload} disabled={Boolean(busyAction)} style={{ ...quickActionStyle, minHeight: 54, flexDirection: "row", gap: 9, borderColor: "rgba(34,211,238,0.28)", background: `linear-gradient(145deg, rgba(34,211,238,0.10), rgba(168,85,247,0.07))` }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <span style={{ fontSize: 12, fontWeight: 900 }}>{busyAction === "pdf" ? "Building PDF…" : "Save PDF"}</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
            <button type="button" onClick={handleNativeShare} disabled={Boolean(busyAction)} style={quickActionStyle}>
              <span style={{ fontSize: 18, marginBottom: 5 }}>📤</span>
              <span style={{ fontSize: 11, fontWeight: 900 }}>{busyAction === "native" ? "Prep…" : "Share"}</span>
            </button>
            <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`} onClick={() => trackKyrEvent("share_action_clicked", { ...shareEventParams, share_action: "email" })} style={quickActionStyle}>
              <span style={{ fontSize: 18, marginBottom: 5 }}>✉️</span>
              <span style={{ fontSize: 11, fontWeight: 900 }}>Email</span>
            </a>
            <a href={`sms:?&body=${smsBody}`} onClick={() => trackKyrEvent("share_action_clicked", { ...shareEventParams, share_action: "text" })} style={quickActionStyle}>
              <span style={{ fontSize: 18, marginBottom: 5 }}>💬</span>
              <span style={{ fontSize: 11, fontWeight: 900 }}>Text</span>
            </a>
            <button type="button" onClick={copyMessage} style={quickActionStyle}>
              <span style={{ fontSize: 18, marginBottom: 5 }}>{copied ? "✓" : "⧉"}</span>
              <span style={{ fontSize: 11, fontWeight: 900 }}>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div style={{ fontSize: 10.5, color: C.textDim, textAlign: "center", lineHeight: 1.4, padding: "2px 10px 0" }}>
            Share card is the visual flex. PDF is the keep-it-forever version.
          </div>
        </div>
      </div>
    </div>
  );
}

type ResultPageId = 1 | "insights" | "pressure" | "chemistry" | "roles";

const RESULT_PAGE_LABELS: Record<Exclude<ResultPageId, 1>, { icon: string; title: string; subtitle: string; status: string }> = {
  insights: {
    icon: "🧰",
    title: "Insights",
    subtitle: "Tools that turn your result into practical next steps.",
    status: "Tools moved here in Phase 2.",
  },
  pressure: {
    icon: "🌡️",
    title: "Pressure",
    subtitle: "See your stress pattern and reset move.",
    status: "Pressure readout moved here in Phase 2.",
  },
  chemistry: {
    icon: "🧲",
    title: "Chemistry",
    subtitle: "Understand why styles click or clash.",
    status: "Compatibility tools moved here in Phase 3.",
  },
  roles: {
    icon: "💼",
    title: "Roles",
    subtitle: "Check a role against your actual result.",
    status: "Dream Role Advisor moved here in Phase 3.",
  },
};

function parseResultPageParam(value: string | null): ResultPageId {
  if (value === "insights" || value === "3") return "insights";
  if (value === "pressure") return "pressure";
  if (value === "chemistry") return "chemistry";
  if (value === "roles") return "roles";
  return 1;
}

function serializeResultPage(page: ResultPageId) {
  return page === 1 ? "1" : page;
}

function resultPageEventName(page: ResultPageId) {
  return page === 1 ? "full_portrait" : page;
}

function BottomBar({ active = 1, onNavigate, onShare }: {
  active?: ResultPageId;
  onNavigate?: (page: ResultPageId) => void;
  onShare?: () => void;
}) {
  const btns: Array<{ id: ResultPageId | "share"; icon: string; label: string; action: "navigate" | "share" }> = [
    { id: 1, icon: "🏆", label: "Portrait", action: "navigate" },
    { id: "insights", icon: "🧭", label: "Insights", action: "navigate" },
    { id: "pressure", icon: "⚡", label: "Pressure", action: "navigate" },
    { id: "chemistry", icon: "🧪", label: "Chemistry", action: "navigate" },
    { id: "roles", icon: "🎯", label: "Roles", action: "navigate" },
    { id: "share", icon: "↗️", label: "Share", action: "share" },
  ];

  return (
    <div className="results-bottom-bar" aria-label="Results pages and sharing" style={{
      background: "rgba(8, 4, 20, 0.92)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${C.glassBorder}`,
      display: "flex", justifyContent: "space-between",
      pointerEvents: "none",
    }}>
      {btns.map(b => {
        const isActive = b.action === "navigate" && active === b.id;
        return (
          <button
            key={String(b.id)}
            onClick={() => b.action === "share" ? onShare?.() : onNavigate?.(b.id as ResultPageId)}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              minHeight: 52,
              padding: "5px 1px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              background: isActive ? "rgba(103, 232, 249, 0.08)" : b.action === "share" ? "rgba(168,85,247,0.06)" : "none",
              border: "none",
              borderRadius: 14,
              color: isActive ? C.cyan : b.action === "share" ? C.purple : C.textMuted,
              opacity: isActive || b.action === "share" ? 1 : 0.62,
              fontSize: 7.6, fontWeight: 700, lineHeight: 1.1, cursor: "pointer",
              pointerEvents: "auto",
              fontFamily: "Inter, sans-serif", transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontSize: 17, lineHeight: 1, marginBottom: 1 }}>{b.icon}</div>
            {b.label}
          </button>
        );
      })}
    </div>
  );
}

function PrivacyStrip() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
      padding: "14px 0 8px", fontSize: 9, color: C.textDim,
    }}>🛡 Your profile is saved securely. We never sell your results.</div>
  );
}

// ─── PAGE 1: Full Portrait ───────────────────────────────────────────────────
function Page1FullPortrait({ type, bigFive, disc, mbtiType, primaryDisc, rawScores, discDesc, sessionId, resultId, onExplorePage, onShare }: {
  type: string; bigFive: { O: number; C: number; E: number; A: number; N: number };
  disc: { D: number; I: number; S: number; C: number };
  mbtiType: string; primaryDisc: string;
  rawScores?: QuizScores;
  discDesc?: string;
  sessionId?: string;
  resultId?: string;
  onExplorePage: (page: Exclude<ResultPageId, 1>, source?: string) => void;
  onShare: (source?: string) => void;
}) {
  const base = type.split("-")[0];
  const arch = getArchetype(base);
  const primary = primaryDisc;
  const discColor = DISC_COLORS[primary];
  const pct = (v: number) => v; // Real normalized scores — no random jitter
  const career = TOP_CAREER_MAP[mbtiType] || TOP_CAREER_MAP.INTP;
  const roleMatch = findBestRoleMatch(mbtiType, primaryDisc, bigFive);
  const [primaryRoleCard] = buildPremiumRoleMatchCards({
    roleMatch,
    mbtiType,
    primaryDisc,
    disc,
    bigFive,
  });
  const displayedCareerTitle = primaryRoleCard?.title || career.title;
  const displayedCareerSalary = primaryRoleCard?.salary || career.salary;
  const [leadEmail, setLeadEmail] = useState("");
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [leadMessage, setLeadMessage] = useState("");

  const bigFiveRows = [
    { key: "O", label: "Openness", value: bigFive.O, color: C.cyan, sub: `${pct(bigFive.O)}%` },
    { key: "C", label: "Follow-through", value: bigFive.C, color: C.purple, sub: `${pct(bigFive.C)}%` },
    { key: "E", label: "Extraversion", value: bigFive.E, color: C.pink, sub: `${pct(bigFive.E)}%` },
    { key: "A", label: "Agreeable", value: bigFive.A, color: C.gold, sub: `${pct(bigFive.A)}%` },
    { key: "N", label: "Stress Reactivity", value: bigFive.N, color: "#64748b", sub: `${pct(bigFive.N)}%` },
  ];

  const mbtiScoreMap: Record<string, number> = {
    E: rawScores?.mbti.E ?? 50,
    I: rawScores?.mbti.I ?? 50,
    S: rawScores?.mbti.S ?? 50,
    N: rawScores?.mbti.N ?? 50,
    T: rawScores?.mbti.T ?? 50,
    F: rawScores?.mbti.F ?? 50,
    J: rawScores?.mbti.J ?? 50,
    P: rawScores?.mbti.P ?? 50,
  };
  const mbtiAxisConfidence = calculateMbtiAxisConfidence(mbtiScoreMap);
  const closeCallDimensions = mbtiAxisConfidence.filter((axis) => axis.isCloseCall);
  const mbtiConfidenceAverage = Math.round(mbtiAxisConfidence.reduce((sum, axis) => sum + axis.confidenceScore, 0) / mbtiAxisConfidence.length);
  const resultConfidenceLabel = getResultConfidenceLabel(mbtiConfidenceAverage);
  const closeCallAxisText = closeCallDimensions.length
    ? closeCallDimensions.map((axis) => axis.label).join(", ")
    : "No close-call axes in this run";

  const mbtiDimensions = ([
    {
      label: "Mind",
      plainLabel: "How you recharge",
      leftLetter: "E",
      rightLetter: "I",
      dominant: mbtiType[0],
      words: { E: "Extraversion", I: "Introversion" },
      meanings: {
        E: "You gain momentum from people, activity, and the outside world.",
        I: "You recharge through quiet, space, and focused inner processing.",
      },
      signals: {
        E: "You may think best while talking ideas through.",
        I: "You may have strong ideas but prefer to think before speaking.",
      },
    },
    {
      label: "Energy",
      plainLabel: "How you read information",
      leftLetter: "S",
      rightLetter: "N",
      dominant: mbtiType[1],
      words: { S: "Sensing", N: "Intuition" },
      meanings: {
        S: "You trust concrete facts, real examples, and what can be checked.",
        N: "You look for patterns, possibilities, and what things could become.",
      },
      signals: {
        S: "You may ask for practical proof before buying into an idea.",
        N: "You may spot the big idea before all the details are filled in.",
      },
    },
    {
      label: "Nature",
      plainLabel: "How you decide",
      leftLetter: "T",
      rightLetter: "F",
      dominant: mbtiType[2],
      words: { T: "Thinking", F: "Feeling" },
      meanings: {
        T: "You lean on logic, consistency, and clear reasons when deciding.",
        F: "You weigh people, values, and impact when deciding.",
      },
      signals: {
        T: "You may trust a decision more when the reasoning is clean.",
        F: "You may trust a decision more when it respects the people involved.",
      },
    },
    {
      label: "Tactics",
      plainLabel: "How you handle plans",
      leftLetter: "J",
      rightLetter: "P",
      dominant: mbtiType[3],
      words: { J: "Judging", P: "Perceiving" },
      meanings: {
        J: "You prefer clarity, structure, and decisions that close loops.",
        P: "You prefer flexibility, options, and room to adapt.",
      },
      signals: {
        J: "You may feel calmer when the next step is decided.",
        P: "You may do your best work when you can adjust as you learn more.",
      },
    },
  ] as const).map(d => {
    const leftScore = mbtiScoreMap[d.leftLetter] ?? 50;
    const rightScore = mbtiScoreMap[d.rightLetter] ?? 50;
    const total = leftScore + rightScore || 1;
    const dominantPct = Math.round(((mbtiScoreMap[d.dominant] ?? 50) / total) * 100);
    const isLeftDominant = d.dominant === d.leftLetter;
    const leftPct = isLeftDominant ? dominantPct : 100 - dominantPct;
    const rightPct = isLeftDominant ? 100 - dominantPct : dominantPct;
    const strength = dominantPct >= 75 ? "Strong lean" : dominantPct >= 60 ? "Clear lean" : "Slight lean";
    const strengthNote = dominantPct >= 75
      ? "Strong signal: this pattern showed up consistently and is more likely to stay stable."
      : dominantPct >= 60
        ? "Clear signal: this side showed up clearly, but the other side still matters."
        : "Close call: this could shift on another day, in another setting, or on another test.";
    const barHeight = dominantPct >= 75 ? 11 : dominantPct >= 60 ? 8 : 5;
    const activeColor = dominantPct >= 75 ? C.cyan : dominantPct >= 60 ? "#67e8f9" : "rgba(103,232,249,0.74)";
    const activeGlow = dominantPct >= 75 ? "0 0 14px rgba(34,211,238,0.42)" : dominantPct >= 60 ? "0 0 10px rgba(34,211,238,0.25)" : "none";
    return { ...d, dominantPct, leftPct, rightPct, isLeftDominant, strength, strengthNote, barHeight, activeColor, activeGlow };
  });

  const rankedMbtiDimensions = [...mbtiDimensions].sort((a, b) => b.dominantPct - a.dominantPct);
  const stableMbtiDimensions = rankedMbtiDimensions.filter(d => d.dominantPct >= 75);
  const flexibleMbtiDimensions = rankedMbtiDimensions.filter(d => d.dominantPct < 60);
  const mostStableMbtiDimensions = stableMbtiDimensions.length ? stableMbtiDimensions : rankedMbtiDimensions.slice(0, 1);
  const mostFlexibleMbtiDimensions = flexibleMbtiDimensions.length ? flexibleMbtiDimensions : rankedMbtiDimensions.slice(-1);
  const discSocialInsights: Record<string, { best: string; pressure: string; environment: string }> = {
    D: {
      best: "Direct, decisive, and quick to create momentum when people are stuck.",
      pressure: "Can come across intense, impatient, or too focused on the win if others need more context.",
      environment: "Best in goal-driven spaces with autonomy, clear stakes, and room to make moves.",
    },
    I: {
      best: "Expressive, encouraging, and able to make people feel included fast.",
      pressure: "Can skip details, overtalk the plan, or avoid tension when the mood gets heavy.",
      environment: "Best in people-forward spaces with variety, collaboration, and visible energy.",
    },
    S: {
      best: "Calm, loyal, steady, and good at making others feel safe enough to contribute.",
      pressure: "Can absorb too much, delay conflict, or stay comfortable longer than the situation deserves.",
      environment: "Best in trusted teams with consistency, patience, and a clear reason behind change.",
    },
    C: {
      best: "Precise, thoughtful, and trusted when accuracy, standards, or clean execution matter.",
      pressure: "Can seem distant, overly critical, or slow to move if the evidence still feels incomplete.",
      environment: "Best in spaces that respect quality, preparation, logic, and low-chaos execution.",
    },
  };
  const discSocial = discSocialInsights[primary] || discSocialInsights.C;
  const rankedBigFiveRows = [...bigFiveRows].sort((a, b) => b.value - a.value);
  const topBigFiveRow = rankedBigFiveRows[0];
  const secondBigFiveRow = rankedBigFiveRows[1] || topBigFiveRow;
  const lowestBigFiveRow = rankedBigFiveRows[rankedBigFiveRows.length - 1];
  const answerEvidenceSnippets = buildAnswerEvidenceSnippets({
    rawScores,
    mbtiType,
    primaryDisc,
    topBigFiveKey: topBigFiveRow.key,
    topBigFiveLabel: topBigFiveRow.label,
  });
  const bigFiveShapeLead: Record<string, string> = {
    O: "curious, idea-rich, and drawn to possibility",
    C: "structured, dependable, and focused on follow-through",
    E: "socially energized, expressive, and action-oriented",
    A: "cooperative, people-aware, and tuned to harmony",
    N: "emotionally alert, sensitive to pressure, and quick to notice what feels off",
  };
  const bigFiveShapeLow: Record<string, string> = {
    O: "more grounded in what is proven than what is novel",
    C: "less naturally tied to rigid plans, so simpler systems will work better than elaborate ones",
    E: "more selective with social energy and likely to need quiet recovery time",
    A: "more independent-minded and less likely to soften your standards just to keep agreement",
    N: "steadier under pressure and less easily thrown by emotional noise",
  };
  const bigFiveShapeTitle = `${topBigFiveRow.label}-led profile`;
  const bigFiveShapeBody = `${topBigFiveRow.label} is your strongest Big Five signal at ${topBigFiveRow.value}%. That points to a style that is ${bigFiveShapeLead[topBigFiveRow.key]}. Your lightest signal is ${lowestBigFiveRow.label}, so ${bigFiveShapeLow[lowestBigFiveRow.key]}.`;

  const mbtiAverageStrength = Math.round(mbtiDimensions.reduce((sum, d) => sum + d.dominantPct, 0) / mbtiDimensions.length);
  const mbtiCloseCount = mbtiDimensions.filter(d => d.dominantPct < 60).length;
  const discKey = primary as keyof typeof disc;
  const discEntries = (Object.entries(disc) as [keyof typeof disc, number][]).sort((a, b) => b[1] - a[1]);
  const secondDiscEntry = discEntries[1] || discEntries[0];
  const discTotal = Math.max(1, disc.D + disc.I + disc.S + disc.C);
  const discPrimaryShare = Math.round(((disc[discKey] ?? 0) / discTotal) * 100);
  const discSecondShare = Math.round(((secondDiscEntry?.[1] ?? 0) / discTotal) * 100);
  const discLeadGap = Math.max(0, discPrimaryShare - discSecondShare);
  const bigFiveSpread = Math.abs(topBigFiveRow.value - lowestBigFiveRow.value);
  const bigFiveTopGap = Math.abs(topBigFiveRow.value - secondBigFiveRow.value);
  const patternStrength = Math.max(48, Math.min(92, Math.round((mbtiAverageStrength + discPrimaryShare + 55 + bigFiveSpread) / 3)));
  const patternStrengthLabel = resultConfidenceLabel;
  const careerConfidenceScore = Math.max(52, Math.min(94, Math.round((patternStrength + Math.min(90, discPrimaryShare + discLeadGap) + Math.min(90, 55 + bigFiveTopGap)) / 3)));
  const careerConfidenceLabel = careerConfidenceScore >= 78 ? "Strong fit" : careerConfidenceScore >= 64 ? "Good directional fit" : "Directional fit";
  const careerConfidenceBody = careerConfidenceScore >= 78
    ? "Your main signals line up well. Test this role seriously, but do not treat it as destiny."
    : careerConfidenceScore >= 64
      ? "This is a credible lane, not one exact answer. Test it through energy, skill growth, and real feedback."
      : "Use this as a compass. Try the starter move before making a big career bet.";
  const bigFiveConfidenceLabel = bigFiveTopGap >= 15 ? "Clear trait lead" : bigFiveTopGap >= 8 ? "Moderate trait lead" : "Close trait race";
  const bigFiveConfidenceBody = bigFiveTopGap >= 15
    ? `${topBigFiveRow.label} leads ${secondBigFiveRow.label} by ${bigFiveTopGap} points, so it is a useful anchor for reading the profile.`
    : `${topBigFiveRow.label} and ${secondBigFiveRow.label} are close. Read the Big Five shape as a blend, not a single-trait headline.`;
  const socialIdentityTitle = SOCIAL_IDENTITY_TITLES[mbtiType] || displayedCareerTitle;
  const mbtiEmoji = MBTI_EMOJIS[mbtiType] || "✨";
  const mbtiShortName = stripLeadingThe(arch);
  const socialShareLine = MBTI_SHARE_INSIGHTS[mbtiType] || getShareInsight(mbtiType, DISC_LABELS[primary] || primary);
  const roleDirectionBody = roleMatch.whyThisFits || primaryRoleCard?.why || `You fit work where your ${mbtiType} pattern, ${DISC_LABELS[primary] || primary} style, and ${topBigFiveRow.label.toLowerCase()} signal can turn ambiguity into useful progress.`;
  const socialGradientByDisc: Record<string, string> = {
    D: "radial-gradient(circle at 80% 10%, rgba(239,68,68,0.34), transparent 28%), linear-gradient(160deg, rgba(99,33,45,0.92), rgba(12,8,22,0.98) 56%)",
    I: "radial-gradient(circle at 80% 10%, rgba(245,158,11,0.34), transparent 28%), linear-gradient(160deg, rgba(95,78,42,0.92), rgba(12,8,22,0.98) 56%)",
    S: "radial-gradient(circle at 80% 10%, rgba(34,197,94,0.28), transparent 28%), linear-gradient(160deg, rgba(35,88,76,0.92), rgba(12,8,22,0.98) 56%)",
    C: "radial-gradient(circle at 80% 10%, rgba(34,211,238,0.30), transparent 28%), linear-gradient(160deg, rgba(30,91,105,0.92), rgba(12,8,22,0.98) 56%)",
  };

  const resultDestinationCards = [
    { page: "insights" as const, icon: "🧰", title: "Insights", body: "Tools that turn your result into practical next steps.", color: C.cyan },
    { page: "pressure" as const, icon: "🌡️", title: "Pressure", body: "See your stress pattern and reset move.", color: C.pink },
    { page: "chemistry" as const, icon: "🧲", title: "Chemistry", body: "Understand why styles click or clash.", color: C.purple },
    { page: "roles" as const, icon: "💼", title: "Roles", body: "Check a role against your actual result.", color: C.gold },
  ];

  const quickReadCards = [
    {
      label: "Best-fit pattern",
      value: `${mbtiType} + ${DISC_LABELS[primary] || primary}`,
      body: `${arch} energy with ${DISC_LABELS[primary] || primary.toLowerCase()} execution and ${topBigFiveRow.label.toLowerCase()} as the strongest trait signal.`,
      color: discColor,
    },
    {
      label: "Best-fit environment",
      value: displayedCareerTitle,
      body: roleMatch.whyThisFits || "Best in work where your pattern can solve real problems, test ideas, and build visible proof.",
      color: C.gold,
    },
    {
      label: "Watch-out",
      value: lowestBigFiveRow.label,
      body: `Your lightest Big Five signal is ${lowestBigFiveRow.label}. That is not a flaw, but it is where friction may show up first.`,
      color: C.pink,
    },
    {
      label: "Try this next",
      value: "One real-world experiment",
      body: roleMatch.starterPath || "Try one small proof project, then ask for blunt feedback before making the next bet.",
      color: C.cyan,
    },
  ];

  const handleSummaryCtaClick = () => {
    trackKyrEvent("result_summary_cta_clicked", { result_page: "full_portrait", cta: "email_result", mbti_type: mbtiType, primary_disc: primary });
    document.getElementById("result-email-capture")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleRoleExperimentClick = () => {
    trackKyrEvent("role_experiment_clicked", { result_page: "full_portrait", mbti_type: mbtiType, primary_disc: primary });
  };

  const handleEmailLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLeadStatus("submitting");
    setLeadMessage("");
    trackKyrEvent("email_capture_submitted", { result_page: "full_portrait", source: "batch4_result_cta", mbti_type: mbtiType, primary_disc: primary });
    try {
      const response = await fetch("/api/results/email-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail,
          sessionId,
          resultId,
          mbtiType,
          discStyle: DISC_LABELS[primary] || primary,
          primaryRoleTitle: displayedCareerTitle,
          consentResultSummary: leadConsent,
          consentMarketing: false,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        const errorMessage = data?.fieldErrors?.email || data?.fieldErrors?.consentResultSummary || data?.error || "Could not save your email yet.";
        throw new Error(errorMessage);
      }
      setLeadStatus("success");
      setLeadMessage(data?.deliveryStatus === "sent" ? "Saved and sent. Check your inbox." : "Saved. Email delivery is queued or not configured yet.");
      trackKyrEvent("email_capture_completed", { result_page: "full_portrait", source: "batch4_result_cta", status: "success", delivery_status: data?.deliveryStatus || "unknown", mbti_type: mbtiType, primary_disc: primary });
    } catch (error) {
      setLeadStatus("error");
      setLeadMessage(error instanceof Error ? error.message : "Could not save your email yet.");
      trackKyrEvent("email_capture_completed", { result_page: "full_portrait", source: "batch4_result_cta", status: "error", mbti_type: mbtiType, primary_disc: primary });
    }
  };

  const trackAccordionOpen = (accordionId: string) => {
    trackKyrEvent("accordion_opened", { result_page: "full_portrait", accordion_id: accordionId, mbti_type: mbtiType, primary_disc: primary });
  };



  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "calc(86px + env(safe-area-inset-top, 0px)) 16px calc(100px + env(safe-area-inset-bottom, 0px))" }}>
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
        <p style={{ fontSize: 13, color: C.textMuted }}>Free results · No login needed</p>
      </div>

      <section
        aria-label="Instant social result card"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 28,
          padding: 14,
          marginBottom: 18,
          background: socialGradientByDisc[primary] || socialGradientByDisc.C,
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.12), transparent 34%, rgba(255,255,255,0.06) 62%, transparent)", opacity: 0.58 }} />
        <div aria-hidden="true" style={{ position: "absolute", left: -60, top: -80, width: 210, height: 210, borderRadius: "999px", background: "rgba(34,211,238,0.18)", filter: "blur(28px)" }} />
        <div aria-hidden="true" style={{ position: "absolute", right: -70, bottom: -90, width: 220, height: 220, borderRadius: "999px", background: "rgba(245,158,11,0.18)", filter: "blur(34px)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 1.9, lineHeight: 1.35, textTransform: "uppercase", color: "rgba(255,255,255,0.82)" }}>
              Instant<br />Portrait
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 19, display: "grid", placeItems: "center", background: "rgba(7,10,24,0.45)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 12px 28px rgba(0,0,0,0.25)", fontSize: 24 }}>
              {mbtiEmoji}
            </div>
          </div>

          <div style={{ borderRadius: 24, padding: "18px 16px", minHeight: 190, background: "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, alignSelf: "flex-start", padding: "7px 10px", borderRadius: 999, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }}>
              <span style={{ width: 26, height: 26, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.10)", fontSize: 14 }}>{mbtiEmoji}</span>
              <span style={{ display: "grid", gap: 1, lineHeight: 1.05 }}>
                <strong style={{ fontSize: 12, letterSpacing: -0.2 }}>{mbtiType}</strong>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.76)" }}>{mbtiShortName}</span>
              </span>
            </div>

            <h1 style={{ margin: 0, maxWidth: 330, fontFamily: "Inter, sans-serif", fontSize: "clamp(42px, 13vw, 64px)", lineHeight: 0.86, letterSpacing: -3.4, fontWeight: 1000, color: "#fff", textShadow: "0 12px 28px rgba(0,0,0,0.34)" }}>
              {socialIdentityTitle}
            </h1>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 9.5, fontWeight: 950, letterSpacing: 1.4, color: "#f8d56b", textTransform: "uppercase", marginBottom: 7 }}>Share line</div>
            <blockquote style={{ margin: 0, color: "#fff", fontSize: "clamp(23px, 6vw, 31px)", fontWeight: 1000, letterSpacing: -1.2, lineHeight: 0.98, textShadow: "0 10px 24px rgba(0,0,0,0.26)" }}>
              “{socialShareLine}”
            </blockquote>
          </div>

          <div style={{ marginTop: 18, borderRadius: 22, padding: "18px 17px", background: "linear-gradient(145deg, #fff8e8, #eee4cf)", color: "#141016", boxShadow: "0 18px 40px rgba(0,0,0,0.28)" }}>
            <div style={{ fontSize: 9, fontWeight: 950, letterSpacing: 1.3, textTransform: "uppercase", color: "rgba(145,107,35,0.72)", marginBottom: 7 }}>Best-fit role direction</div>
            <div style={{ fontSize: 24, fontWeight: 1000, letterSpacing: -1.15, lineHeight: 0.96, marginBottom: 9 }}>{displayedCareerTitle}</div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.48, color: "rgba(20,16,22,0.76)", fontWeight: 650 }}>{roleDirectionBody}</p>
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {[
              { label: "MBTI-style", value: `${mbtiEmoji} ${mbtiType}`, sub: mbtiShortName },
              { label: "Work style", value: `${DISC_EMOJIS[primary] || "⚡"} ${primary}`, sub: DISC_LABELS[primary] || primary },
              { label: "Top trait", value: `${topBigFiveRow.value}%`, sub: topBigFiveRow.label },
            ].map(item => (
              <div key={item.label} style={{ minWidth: 0, borderRadius: 17, padding: "11px 10px", background: "rgba(4,5,15,0.72)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 8, fontWeight: 950, letterSpacing: 1.05, color: C.cyan, textTransform: "uppercase", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 950, color: "#fff", lineHeight: 1.05 }}>{item.value}</div>
                <div style={{ marginTop: 4, fontSize: 10.5, color: "rgba(255,255,255,0.62)", lineHeight: 1.15 }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onShare("instant_social_card")}
            style={{
              marginTop: 14,
              width: "100%",
              minHeight: 46,
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 16,
              background: "rgba(255,255,255,0.10)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 950,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            Share this visual result card
          </button>
        </div>
      </section>

      <FullPortraitSection
        step="01"
        eyebrow="Full portrait"
        title="The proof behind your card"
        subtitle="The social card is the headline. Open the drawers only if you want the deeper proof."
        accent={C.gold}
      >

      <section
        aria-label="Your result in 30 seconds"
        style={{
          borderRadius: 22,
          padding: 15,
          marginBottom: 14,
          background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(34,211,238,0.075))",
          border: "1px solid rgba(245,158,11,0.26)",
          boxShadow: "0 16px 42px rgba(0,0,0,0.20)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 1.15, textTransform: "uppercase", color: C.goldLight, marginBottom: 5 }}>Your result in 30 seconds</div>
            <div style={{ fontSize: 20, fontWeight: 950, color: C.text, lineHeight: 1.12 }}>{displayedCareerTitle}</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.45, color: C.textMuted, marginTop: 5 }}>{mbtiType} · {DISC_LABELS[primary] || primary} · {topBigFiveRow.label}-led</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 18, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.075)", border: `1px solid ${C.glassBorder}`, fontSize: 22 }}>⚡</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9 }}>
          {quickReadCards.map(card => (
            <div key={card.label} style={{ padding: "10px 11px", borderRadius: 15, background: "rgba(255,255,255,0.04)", border: `1px solid ${card.color}30`, minWidth: 0 }}>
              <div style={{ fontSize: 8.5, fontWeight: 950, letterSpacing: 0.75, textTransform: "uppercase", color: card.color, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 12, fontWeight: 950, color: C.text, lineHeight: 1.22, marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontSize: 10.5, lineHeight: 1.42, color: C.textDim }}>{card.body}</div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSummaryCtaClick}
          style={{
            marginTop: 12,
            width: "100%",
            minHeight: 46,
            border: "none",
            borderRadius: 15,
            background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
            color: "#fff",
            fontSize: 12,
            fontWeight: 950,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            boxShadow: "0 12px 28px rgba(245,158,11,0.14)",
          }}
        >
          Send this result to yourself
        </button>
      </section>

      <div style={{
        borderRadius: 18,
        padding: 14,
        marginBottom: 14,
        background: "linear-gradient(135deg, rgba(34,211,238,0.075), rgba(168,85,247,0.06))",
        border: "1px solid rgba(34,211,238,0.20)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 1, textTransform: "uppercase", color: C.cyan, marginBottom: 5 }}>Why you got this</div>
        <div style={{ fontSize: 13, fontWeight: 950, color: C.text, lineHeight: 1.25, marginBottom: 6 }}>Your result is tied to your answer pattern.</div>
        <div style={{ fontSize: 11, lineHeight: 1.5, color: C.textMuted, marginBottom: 11 }}>
          These are not magic labels. They are the strongest clues from your selected answers, grouped into personality, communication, and trait signals.
        </div>
        <div style={{ display: "grid", gap: 9 }}>
          {answerEvidenceSnippets.map(snippet => (
            <div key={snippet.label} style={{ padding: "10px 11px", borderRadius: 14, background: "rgba(255,255,255,0.035)", border: `1px solid ${snippet.color}30` }}>
              <div style={{ fontSize: 9, fontWeight: 950, letterSpacing: 0.75, textTransform: "uppercase", color: snippet.color, marginBottom: 4 }}>{snippet.label}</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: C.text, lineHeight: 1.25, marginBottom: 4 }}>{snippet.title}</div>
              <div style={{ fontSize: 10.8, lineHeight: 1.45, color: C.textDim, marginBottom: 8 }}>{snippet.body}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {snippet.evidence.map(item => (
                  <span key={item} style={{
                    padding: "4px 7px",
                    borderRadius: 999,
                    background: `${snippet.color}12`,
                    border: `1px solid ${snippet.color}2e`,
                    color: C.text,
                    fontSize: 9.5,
                    fontWeight: 800,
                    lineHeight: 1.25,
                  }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PortraitAccordion
        icon="💼"
        eyebrow="Role match"
        title={displayedCareerTitle}
        summary={`${careerConfidenceLabel} · Why it fits, what may rub, and how to test it.`}
        accent={C.gold}
        analyticsId="role_match"
        onOpen={trackAccordionOpen}
      >
        <div style={{ display: "grid", gap: 9 }}>
          {[
            {
              label: "Why this fits",
              title: displayedCareerTitle,
              body: roleMatch.whyThisFits || primaryRoleCard?.why || `This match combines your ${mbtiType} personality pattern, your ${DISC_LABELS[primary] || primary} communication style, and your strongest trait signal: ${topBigFiveRow.label}.`,
              color: C.gold,
            },
            {
              label: "Possible mismatch",
              title: "Where this could rub",
              body: roleMatch.mayNotFit || primaryRoleCard?.skill || `${discSocial.pressure} Watch whether the role rewards your real working style, not just the impressive title.`,
              color: C.pink,
            },
            {
              label: "Starter move",
              title: "Test it before betting on it",
              body: roleMatch.starterPath || primaryRoleCard?.firstMove || "This week: make one small proof piece for the role, then ask someone in the field what would make it stronger.",
              color: C.cyan,
            },
          ].map(item => (
            <div key={item.label} style={{ padding: "12px 13px", borderRadius: 14, background: `${item.color}12`, border: `1px solid ${item.color}33` }}>
              <div style={{ fontSize: 9, fontWeight: 950, letterSpacing: 0.8, textTransform: "uppercase", color: item.color, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: C.text, marginBottom: 5, lineHeight: 1.25 }}>{item.title}</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: C.textMuted }}>{item.body}</div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              handleRoleExperimentClick();
              onExplorePage("roles", "role_experiment");
            }}
            style={{
              minHeight: 46,
              border: "1px solid rgba(34,211,238,0.30)",
              borderRadius: 15,
              padding: "11px 12px",
              background: "rgba(34,211,238,0.08)",
              color: C.text,
              fontSize: 11.5,
              fontWeight: 950,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
          >
            Test this role in the Role Lab
          </button>
          <div style={{
            padding: "11px 12px",
            borderRadius: 14,
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.20)",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
              <div style={{ fontSize: 9, fontWeight: 950, letterSpacing: 0.8, textTransform: "uppercase", color: C.goldLight }}>Career confidence</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: C.text }}>{careerConfidenceScore}%</div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: C.text, marginBottom: 5 }}>{careerConfidenceLabel}</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.5, color: C.textMuted }}>{careerConfidenceBody}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: "10px 11px", borderRadius: 13, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.065)" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.6, textTransform: "uppercase", color: C.goldLight, marginBottom: 3 }}>Daily loop</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.45, fontWeight: 750, color: C.text }}>{primaryRoleCard?.daily || "Turn a messy goal into a visible next step, then test it in real work."}</div>
            </div>
            <div style={{ padding: "10px 11px", borderRadius: 13, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.065)" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.6, textTransform: "uppercase", color: C.goldLight, marginBottom: 3 }}>Typical range</div>
              <div style={{ fontSize: 12, fontWeight: 850, color: C.text }}>{displayedCareerSalary}</div>
            </div>
          </div>
        </div>
      </PortraitAccordion>

      <PortraitAccordion
        icon="🧠"
        eyebrow="Personality type"
        title={`${type.split("-")[0]} — ${arch}`}
        summary={`${patternStrengthLabel} · Letter strength and close calls.`}
        accent={C.purple}
        analyticsId="personality_type"
        onOpen={trackAccordionOpen}
      >
        <div style={{
          fontSize: 11,
          lineHeight: 1.55,
          color: C.textDim,
          padding: "12px 13px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.035)",
          border: `1px solid ${C.glassBorder}`,
          marginBottom: 16,
        }}>
          Your letters are signals, not prison bars. {mbtiCloseCount > 0 ? `${mbtiCloseCount} letter${mbtiCloseCount === 1 ? " is" : "s are"} close, so read those as flexible.` : "Your four-letter pattern is clear in this run."}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
          marginBottom: 16,
        }}>
          <div style={{ padding: "10px 11px", borderRadius: 14, background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.18)" }}>
            <div style={{ fontSize: 9, fontWeight: 950, letterSpacing: 0.7, textTransform: "uppercase", color: C.cyan, marginBottom: 4 }}>Validity signal</div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: C.text }}>{resultConfidenceLabel}</div>
            <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 3 }}>{mbtiConfidenceAverage}% MBTI axis confidence</div>
          </div>
          <div style={{ padding: "10px 11px", borderRadius: 14, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.18)" }}>
            <div style={{ fontSize: 9, fontWeight: 950, letterSpacing: 0.7, textTransform: "uppercase", color: C.purple, marginBottom: 4 }}>Close-call axes</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.4, fontWeight: 850, color: C.text }}>{closeCallAxisText}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9, marginBottom: 16 }}>
          {mbtiDimensions.map(d => {
            const dominantWord = d.words[d.dominant as keyof typeof d.words];
            return (
              <div key={`${d.label}-summary`} style={{
                borderRadius: 14,
                padding: "10px 11px",
                background: "rgba(255,255,255,0.032)",
                border: `1px solid ${C.glassBorder}`,
              }}>
                <div style={{ fontSize: 9.5, fontWeight: 850, letterSpacing: 0.7, textTransform: "uppercase", color: C.textDim, marginBottom: 5 }}>{d.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{d.dominant}</span>
                  <span style={{ fontSize: 12, fontWeight: 850, color: C.cyan }}>{d.dominantPct}%</span>
                </div>
                <div style={{ fontSize: 10.5, lineHeight: 1.35, color: C.textMuted, marginTop: 3 }}>{dominantWord}</div>
                <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.07)", marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: `${d.dominantPct}%`, height: "100%", borderRadius: 999, background: d.activeColor }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gap: 9 }}>
          {mbtiDimensions.map(d => {
            const dominantWord = d.words[d.dominant as keyof typeof d.words];
            const otherLetter = d.dominant === d.leftLetter ? d.rightLetter : d.leftLetter;
            const otherWord = d.words[otherLetter as keyof typeof d.words];
            const meaning = d.meanings[d.dominant as keyof typeof d.meanings];
            const closeNote = d.dominantPct < 60 ? `Close to ${otherWord}; you may use both.` : d.signals[d.dominant as keyof typeof d.signals];
            return (
              <div key={d.label} style={{
                display: "grid",
                gridTemplateColumns: "38px 1fr auto",
                alignItems: "center",
                gap: 10,
                padding: "10px 11px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.032)",
                border: `1px solid ${C.glassBorder}`,
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 15,
                  fontWeight: 950,
                  color: C.cyan,
                  background: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.18)",
                }}>{d.dominant}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: C.text, lineHeight: 1.25 }}>
                    {d.plainLabel}: {dominantWord}
                  </div>
                  <div style={{ fontSize: 10.5, lineHeight: 1.4, color: C.textMuted, marginTop: 3 }}>
                    {meaning} {closeNote}
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 54 }}>
                  <div style={{ fontSize: 12, fontWeight: 950, color: C.cyan }}>{d.dominantPct}%</div>
                  <div style={{ fontSize: 9, fontWeight: 850, color: C.textDim, marginTop: 2 }}>{d.strength}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 13,
          padding: "11px 12px",
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(34,211,238,0.07), rgba(168,85,247,0.055))",
          border: "1px solid rgba(34,211,238,0.18)",
          fontSize: 11,
          lineHeight: 1.45,
          color: C.textDim,
        }}>
          <strong style={{ color: C.text }}>Most stable:</strong> {mostStableMbtiDimensions.map(d => `${d.dominant} ${d.words[d.dominant as keyof typeof d.words]} (${d.dominantPct}%)`).join(", ")}<br />
          <strong style={{ color: C.text }}>Most flexible:</strong> {mostFlexibleMbtiDimensions.map(d => `${d.dominant} ${d.words[d.dominant as keyof typeof d.words]} (${d.dominantPct}%)`).join(", ")}
        </div>

      </PortraitAccordion>

      <PortraitAccordion
        icon={primary === "D" ? "🦅" : primary === "I" ? "🦜" : primary === "S" ? "🕊️" : "🦉"}
        eyebrow="Communication style"
        title={`${primary} — ${DISC_LABELS[primary]}`}
        summary={`${discPrimaryShare}% primary share · How people read your style.`}
        accent={discColor}
        analyticsId="communication_style"
        onOpen={trackAccordionOpen}
      >
        {discDesc && <p style={{ fontSize: 12, lineHeight: 1.6, color: C.textDim, marginBottom: 14 }}>{discDesc}</p>}

        <div style={{
          borderRadius: 16,
          padding: "13px 13px 12px",
          background: `linear-gradient(135deg, ${discColor}12, rgba(255,255,255,0.025))`,
          border: `1px solid ${discColor}36`,
        }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: C.text, marginBottom: 4 }}>How others may experience you</div>
          <div style={{ fontSize: 10.5, lineHeight: 1.45, color: C.textMuted, marginBottom: 10 }}>
            This is the social read: what your style feels like when people work with you.
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { label: "At your best", body: discSocial.best, color: discColor },
              { label: "Under pressure", body: discSocial.pressure, color: C.gold },
              { label: "Best environment", body: discSocial.environment, color: C.cyan },
            ].map(item => (
              <div key={item.label} style={{
                padding: "9px 10px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.065)",
              }}>
                <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: 0.65, textTransform: "uppercase", color: item.color, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 11.5, lineHeight: 1.5, color: C.textDim }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </PortraitAccordion>

      <PortraitAccordion
        icon="🧬"
        eyebrow="Big Five primary"
        title={`${topBigFiveRow.label} · ${topBigFiveRow.value}%`}
        summary={`${bigFiveConfidenceLabel} · Your strongest trait signal.`}
        accent={C.cyan}
        analyticsId="big_five_primary"
        onOpen={trackAccordionOpen}
      >
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

        <div style={{
          borderRadius: 16,
          padding: "13px 13px 12px",
          marginBottom: 14,
          background: "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(168,85,247,0.055))",
          border: "1px solid rgba(34,211,238,0.18)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: C.text }}>Trait shape</div>
            <div style={{ fontSize: 9.5, fontWeight: 900, color: C.cyan, letterSpacing: 0.55, textTransform: "uppercase", whiteSpace: "nowrap" }}>{bigFiveShapeTitle}</div>
          </div>
          <div style={{ fontSize: 11.5, lineHeight: 1.55, color: C.textDim }}>{bigFiveShapeBody}</div>
          <div style={{ marginTop: 9, padding: "8px 9px", borderRadius: 11, background: "rgba(255,255,255,0.032)", border: `1px solid ${C.glassBorder}`, fontSize: 10.5, lineHeight: 1.45, color: C.textDim }}>
            <strong style={{ color: C.text }}>{bigFiveConfidenceLabel}:</strong> {bigFiveConfidenceBody}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 11 }}>
            {[
              { label: "Strongest signal", trait: topBigFiveRow.label, value: topBigFiveRow.value, color: topBigFiveRow.color },
              { label: "Lightest signal", trait: lowestBigFiveRow.label, value: lowestBigFiveRow.value, color: lowestBigFiveRow.color },
            ].map(item => (
              <div key={item.label} style={{ padding: "8px 9px", borderRadius: 12, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.55, textTransform: "uppercase", color: C.textMuted, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 11.5, fontWeight: 900, color: item.color }}>{item.trait} · {item.value}%</div>
              </div>
            ))}
          </div>
        </div>

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
      </PortraitAccordion>
      </FullPortraitSection>

      <FullPortraitSection
        step="02"
        eyebrow="Explore more"
        title="Choose your next read"
        subtitle="Pick the part of the result you want to use next."
        accent={C.cyan}
        framed
      >

      <div style={{
        borderRadius: C.cardRadius,
        padding: 16,
        marginBottom: 18,
        background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(34,211,238,0.055))",
        border: "2px solid rgba(245,158,11,0.22)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9 }}>
          {resultDestinationCards.map(item => (
            <button
              key={item.page}
              type="button"
              onClick={() => onExplorePage(item.page, "full_portrait_card")}
              style={{
                minHeight: 116,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 9,
                textAlign: "left",
                padding: "12px 12px 13px",
                borderRadius: 16,
                border: `1px solid ${item.color}36`,
                background: `linear-gradient(135deg, ${item.color}14, rgba(255,255,255,0.032))`,
                color: C.text,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>{item.icon}</span>
              <span>
                <span style={{ display: "block", fontSize: 13, fontWeight: 950, color: C.text, marginBottom: 5 }}>{item.title}</span>
                <span style={{ display: "block", fontSize: 10.5, lineHeight: 1.42, color: C.textMuted }}>{item.body}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      </FullPortraitSection>

      <FullPortraitSection
        step="03"
        eyebrow="Keep it handy"
        title="Send this result to yourself"
        subtitle="One clear save action after the value. No gates, no fake urgency."
        accent={C.purple}
      >

      <section
        id="result-email-capture"
        aria-label="Send this result to yourself"
        style={{
          borderRadius: C.cardRadius,
          padding: 15,
          marginBottom: 16,
          background: "linear-gradient(135deg, rgba(168,85,247,0.11), rgba(34,211,238,0.08))",
          border: "1px solid rgba(168,85,247,0.24)",
          boxShadow: "0 16px 38px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 1.1, textTransform: "uppercase", color: C.purple, marginBottom: 5 }}>Keep this useful</div>
            <div style={{ fontSize: 16, fontWeight: 950, color: C.text, lineHeight: 1.2 }}>Send the clean result to yourself.</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 15, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.07)", border: `1px solid ${C.glassBorder}`, fontSize: 20 }}>✉️</div>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 11, lineHeight: 1.5, color: C.textMuted }}>
          Save the useful version so you can revisit it later. We save the email request and result summary consent; no raw quiz answers are sent here.
        </p>
        <form onSubmit={handleEmailLeadSubmit} style={{ display: "grid", gap: 9 }}>
          <input
            type="email"
            value={leadEmail}
            onChange={(event) => {
              setLeadEmail(event.target.value);
              if (leadStatus !== "submitting") setLeadStatus("idle");
            }}
            onFocus={() => trackKyrEvent("email_capture_started", { result_page: "full_portrait", source: "batch4_result_cta", mbti_type: mbtiType, primary_disc: primary })}
            placeholder="you@example.com"
            aria-label="Email address"
            style={{
              width: "100%",
              minHeight: 46,
              borderRadius: 15,
              border: `1px solid ${C.glassBorderBright}`,
              background: "rgba(255,255,255,0.065)",
              color: C.text,
              padding: "0 12px",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              outline: "none",
            }}
          />
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 10.5, lineHeight: 1.45, color: C.textMuted }}>
            <input
              type="checkbox"
              checked={leadConsent}
              onChange={(event) => setLeadConsent(event.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, accentColor: C.cyan, flexShrink: 0 }}
            />
            <span>I agree to save my email so KnowYouRole can send this result summary.</span>
          </label>
          <button
            type="submit"
            disabled={leadStatus === "submitting"}
            style={{
              minHeight: 46,
              border: "none",
              borderRadius: 15,
              padding: "11px 12px",
              background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
              color: "#fff",
              fontSize: 12,
              fontWeight: 950,
              fontFamily: "Inter, sans-serif",
              cursor: leadStatus === "submitting" ? "wait" : "pointer",
              opacity: leadStatus === "submitting" ? 0.78 : 1,
              boxShadow: "0 12px 28px rgba(168,85,247,0.16)",
            }}
          >
            {leadStatus === "submitting" ? "Saving…" : "Email this result"}
          </button>
          {leadMessage && (
            <div role="status" style={{ padding: "9px 10px", borderRadius: 12, background: leadStatus === "error" ? "rgba(248,113,113,0.10)" : "rgba(34,197,94,0.10)", border: leadStatus === "error" ? "1px solid rgba(248,113,113,0.28)" : "1px solid rgba(34,197,94,0.24)", color: leadStatus === "error" ? "#fecaca" : "#bbf7d0", fontSize: 11, lineHeight: 1.45 }}>
              {leadMessage}
            </div>
          )}
        </form>
        <button
          type="button"
          onClick={() => onShare("keep_it_handy_secondary")}
          style={{
            marginTop: 10,
            width: "100%",
            minHeight: 42,
            borderRadius: 14,
            padding: "10px 12px",
            border: `1px solid ${C.glassBorderBright}`,
            background: "rgba(255,255,255,0.045)",
            color: C.text,
            fontSize: 11.5,
            fontWeight: 900,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
          }}
        >
          Or share the visual result card
        </button>
      </section>
      </FullPortraitSection>

      <PrivacyStrip />
    </div>
  );
}

// ─── PAGE 3: Premium Nexus ───────────────────────────────────────────────────
const CONSTELLATION_ITEMS = [
  { id: "deepdive", icon: "📖", name: "Profile" },
  { id: "roles", icon: "🎁", name: "Roles" },
  { id: "blindspots", icon: "🪞", name: "Blind Spots" },
  { id: "hustles", icon: "💵", name: "Business Idea" },
  { id: "learning", icon: "📚", name: "Learning" },
  { id: "thinking", icon: "🧩", name: "Thinking Drill" },
];

function Page3PremiumNexus({ type, bigFive, disc, mbtiType, primaryDisc, isDemo, splitPage = "insights" }: {
  type: string; bigFive: { O: number; C: number; E: number; A: number; N: number };
  disc: { D: number; I: number; S: number; C: number };
  mbtiType: string; primaryDisc: string;
  isDemo?: boolean;
  splitPage?: "insights" | "pressure" | "chemistry" | "roles";
}) {
  const [activeCard, setActiveCard] = useState("deepdive");
  const [activeDeepDiveMetric, setActiveDeepDiveMetric] = useState("strength");
  const [expandedRoleRank, setExpandedRoleRank] = useState("#1");
  const [flippedBlindspots, setFlippedBlindspots] = useState<Record<number, boolean>>({});
  const [blindspotPractice, setBlindspotPractice] = useState<Record<number, string>>({});
  const [hustleGoal, setHustleGoal] = useState("Launch");
  const [hustleHours, setHustleHours] = useState(8);
  const [selectedLearningTips, setSelectedLearningTips] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [thinkingQuizIndex, setThinkingQuizIndex] = useState(0);
  const [thinkingQuizAnswers, setThinkingQuizAnswers] = useState<Record<number, string>>({});
  const [thinkingQuizComplete, setThinkingQuizComplete] = useState(false);
  const [dreamRoleInput, setDreamRoleInput] = useState("Artificial Intelligence Product Founder");
  const [dreamRoleSelected, setDreamRoleSelected] = useState("Artificial Intelligence Product Founder");
  const [dreamRoleSubmitted, setDreamRoleSubmitted] = useState("Artificial Intelligence Product Founder");
  const [compatibilityStyle, setCompatibilityStyle] = useState<CompatibilityStyleKey>("C");
  const [compatibilityContext, setCompatibilityContext] = useState<CompatibilityContext>("Work");

  const base = type.split("-")[0];
  const arch = getArchetype(base);
  const primary = primaryDisc;
  const roleMatch = findBestRoleMatch(mbtiType, primaryDisc, bigFive);
  const hustle = SIDE_HUSTLES[mbtiType] || SIDE_HUSTLES.INTJ;
  const learningPlan = buildLearningPlan({ mbtiType, primaryDisc, bigFive });

  const ActionButton = ({ children, active, onClick, title }: { children: ReactNode; active?: boolean; onClick: () => void; title?: string }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        border: active ? `1px solid ${C.cyan}` : `1px solid ${C.glassBorder}`,
        background: active ? "rgba(34,211,238,0.14)" : "rgba(255,255,255,0.04)",
        color: active ? C.cyan : C.textMuted,
        borderRadius: 999,
        minHeight: 44,
        padding: "10px 12px",
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

  const deepDivePanels = buildPremiumDeepDivePanels({ mbtiType, arch, primaryDisc, bigFive });

  const roleCards = buildPremiumRoleMatchCards({
    roleMatch,
    mbtiType,
    primaryDisc,
    disc,
    bigFive,
  });

  const roleSource = (rolesData as unknown as { roles: Record<string, { primary: Omit<CareerRoleOption, "source">; secondary: Omit<CareerRoleOption, "source"> }> }).roles;
  const customDreamRoles: CareerRoleOption[] = [
    { title: "Artificial Intelligence Product Founder", salary: "$0-$500K+", desc: "Build and scale an artificial intelligence product from insight to revenue.", source: "Dream paths" },
    { title: "Game Designer", salary: "$65K-$150K", desc: "Design systems, loops, worlds, and player progression.", source: "Dream paths" },
    { title: "UX Designer", salary: "$75K-$140K", desc: "Turn human behavior into useful digital experiences.", source: "Dream paths" },
    { title: "Software Engineer", salary: "$95K-$190K", desc: "Build robust systems, products, and tools with code.", source: "Dream paths" },
    { title: "Entrepreneur", salary: "$0-$500K+", desc: "Create value, validate demand, and build a durable business engine.", source: "Dream paths" },
    { title: "Creative Director", salary: "$90K-$180K", desc: "Lead creative vision across brand, product, and storytelling.", source: "Dream paths" },
    { title: "Product Manager", salary: "$100K-$190K", desc: "Translate customer pain, business strategy, and team execution into product wins.", source: "Dream paths" },
    { title: "Artificial Intelligence Research Scientist", salary: "$130K-$300K", desc: "Advance models, experiments, and applied intelligence systems.", source: "Dream paths" },
  ];
  const dreamRoleOptions = Array.from(new Map([
    ...customDreamRoles,
    ...Object.values(roleSource).flatMap(entry => [entry.primary, entry.secondary].map(role => ({ ...role, source: "KYR role library" }))),
    ...roleCards.map(role => ({ title: role.title, salary: role.salary, desc: role.why, source: "Your matched roles" })),
  ].map(role => [role.title.toLowerCase(), role])).values()).sort((a, b) => a.title.localeCompare(b.title));
  const dreamRoleQuery = dreamRoleInput.trim().toLowerCase();
  const dreamRoleSuggestions = (dreamRoleQuery
    ? dreamRoleOptions.filter(role => role.title.toLowerCase().includes(dreamRoleQuery))
    : dreamRoleOptions.filter(role => [roleMatch.primary.title, roleMatch.secondary.title, "Artificial Intelligence Product Founder", "Product Manager", "Game Designer", "Software Engineer"].includes(role.title))
  ).slice(0, 6);
  const submittedDreamRole = dreamRoleSubmitted.trim() || dreamRoleSelected || "Artificial Intelligence Product Founder";
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
  const submitDreamRole = (role = dreamRoleInput.trim() || dreamRoleSelected) => {
    const nextRole = role.trim();
    if (!nextRole) return;
    setDreamRoleSelected(nextRole);
    setDreamRoleInput(nextRole);
    setDreamRoleSubmitted(nextRole);
  };

  const blindspots = buildPremiumBlindspots({ mbtiType, primaryDisc, bigFive });
  const pressureMode = buildPressureMode({ mbtiType, primaryDisc, bigFive });
  const compatibilityInsight = buildCompatibilityDecoder({
    mbtiType,
    primaryDisc,
    bigFive,
    otherStyle: compatibilityStyle,
    context: compatibilityContext,
  });

  const renderTopSummaryStrip = (cards: Array<{ icon: string; label: string; value: string; sub: string; accent: string; bg: string }>) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginBottom: 14 }}>
      {cards.map((item) => (
        <div key={item.label} style={{ minWidth: 0, borderRadius: 14, padding: "9px 7px 8px", background: item.bg, border: `1px solid ${item.accent}33`, boxShadow: `0 0 16px ${item.accent}12`, textAlign: "center", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 3 }}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: 0.7, color: C.textDim, textTransform: "uppercase" }}>{item.label}</span>
          </div>
          <div style={{ fontSize: item.value.length > 8 ? 14 : 18, fontWeight: 900, color: item.accent, lineHeight: 1, marginBottom: 3, whiteSpace: "nowrap" }}>{item.value}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, lineHeight: 1.15, minHeight: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.sub}</div>
        </div>
      ))}
    </div>
  );

  const profileSummaryCards = [
    { icon: "🧬", label: "Type", value: mbtiType, sub: arch, accent: C.purple, bg: "rgba(168,85,247,0.07)" },
    { icon: DISC_EMOJIS[primary] || "📊", label: "Work Style", value: DISC_LABELS[primary as keyof typeof DISC_LABELS] || primary, sub: "Primary pattern", accent: DISC_COLORS[primary as keyof typeof DISC_COLORS] || C.cyan, bg: "rgba(34,211,238,0.06)" },
    { icon: "🎯", label: "Big Five", value: `${bigFive.O}%`, sub: "Openness", accent: C.cyan, bg: "rgba(34,211,238,0.05)" },
  ];

  const pressureSummaryCards = [
    profileSummaryCards[0],
    { ...profileSummaryCards[1], sub: "Under pressure" },
    { icon: "🎯", label: "Big Five", value: `${bigFive.N}%`, sub: "Stress Reactivity", accent: C.pink, bg: "rgba(244,114,182,0.06)" },
  ];

  const chemistrySummaryCards = [
    { icon: "🧬", label: "You", value: mbtiType, sub: DISC_LABELS[primary] || primary, accent: C.purple, bg: "rgba(168,85,247,0.07)" },
    { icon: COMPATIBILITY_STYLES[compatibilityStyle].icon, label: "Other", value: COMPATIBILITY_STYLES[compatibilityStyle].label, sub: COMPATIBILITY_STYLES[compatibilityStyle].short, accent: COMPATIBILITY_STYLES[compatibilityStyle].color, bg: "rgba(34,211,238,0.05)" },
    { icon: "🎯", label: "Score", value: `${compatibilityInsight.score}%`, sub: compatibilityInsight.tag, accent: C.cyan, bg: "rgba(34,211,238,0.06)" },
  ];

  const roleSummaryCards = [
    { icon: "🧬", label: "You", value: mbtiType, sub: DISC_LABELS[primary] || primary, accent: C.purple, bg: "rgba(168,85,247,0.07)" },
    { icon: "💼", label: "Role", value: submittedDreamRole, sub: submittedRoleMeta.source || "Custom role", accent: C.gold, bg: "rgba(245,158,11,0.07)" },
    { icon: "🎯", label: "Fit", value: `${dreamRoleMatch}%`, sub: dreamRoleFitLabel, accent: C.pink, bg: "rgba(244,114,182,0.06)" },
  ];

  const sideHustlePlan = buildSideHustlePlan({ hustle, hustleGoal, hustleHours, mbtiType, primaryDisc, bigFive });
  const projectedIncome = sideHustlePlan.monthlyTarget;
  const firstWeekendTask = sideHustlePlan.phase.task;

  const selectedTipIndexes = Object.entries(selectedLearningTips).filter(([, selected]) => selected).map(([index]) => Number(index));
  const selectedTips = selectedTipIndexes.length > 0 ? selectedTipIndexes.map(index => learningPlan.tactics[index]) : [learningPlan.tactics[0]];
  const thinkingQuestions = [
    {
      skill: "Signal vs noise",
      prompt: "A video says, ‘This habit changed my life.’ What is the smartest first question?",
      options: [
        { id: "famous", label: "How many followers does the person have?", correct: false, feedback: "Popularity is a volume knob, not proof. Loud can still be wrong." },
        { id: "evidence", label: "What evidence shows the habit caused the change?", correct: true, feedback: "Correct. You separated a claim from evidence. That is the core move." },
        { id: "try", label: "Should I try it for one day and see?", correct: false, feedback: "Testing is useful later. First check whether the claim has any spine." },
      ],
    },
    {
      skill: "Hidden tradeoff",
      prompt: "Your team has 10 ideas, 2 weeks, and no clear winner. What sharpens the decision fastest?",
      options: [
        { id: "more", label: "Generate 20 more ideas", correct: false, feedback: "Attractive chaos. Fun, but the bottleneck is judgment, not novelty." },
        { id: "constraint", label: "Add one hard constraint", correct: true, feedback: "Correct. A constraint turns vague debate into ranked tradeoffs." },
        { id: "delay", label: "Wait for more certainty", correct: false, feedback: "Tempting, but waiting often hides the real tradeoff until the deadline is close." },
      ],
    },
    {
      skill: "Base rate check",
      prompt: "A friend says their startup idea will be huge because one similar company exploded. Best response?",
      options: [
        { id: "copy", label: "Copy the winning company quickly", correct: false, feedback: "One winner is a spotlight, not a map. You need to know what usually happens." },
        { id: "average", label: "Ask how similar ideas usually perform", correct: true, feedback: "Correct. Base rates stop one shiny example from hijacking the steering wheel." },
        { id: "unique", label: "Assume their version is different", correct: false, feedback: "Maybe, but every plan feels special from the inside. Check the usual odds first." },
      ],
    },
    {
      skill: "Assumption hunt",
      prompt: "You are stuck choosing between two options. What is the fastest way to reduce fake certainty?",
      options: [
        { id: "pros", label: "Write a longer pros-and-cons list", correct: false, feedback: "Useful, but lists can repeat the same hidden assumptions." },
        { id: "assumption", label: "Name the assumption that must be true for each option to work", correct: true, feedback: "Correct. Decisions improve when hidden assumptions are dragged into daylight." },
        { id: "vibe", label: "Pick the one that feels less stressful", correct: false, feedback: "Stress is useful data, but it should not make the whole decision." },
      ],
    },
    {
      skill: "Disconfirming test",
      prompt: "You believe a plan is solid. What question best protects you from fooling yourself?",
      options: [
        { id: "support", label: "What evidence supports my plan?", correct: false, feedback: "Half useful. Supportive evidence is easy to collect when you already like the plan." },
        { id: "fail", label: "What would make this plan fail?", correct: true, feedback: "Correct. Strong thinkers test their favorite idea before reality does it for them." },
        { id: "confidence", label: "How confident do I feel right now?", correct: false, feedback: "Confidence is not proof. It can rise before the facts improve." },
      ],
    },
  ];
  const currentThinkingQuestion = thinkingQuestions[thinkingQuizIndex];
  const currentThinkingAnswer = thinkingQuizAnswers[thinkingQuizIndex] || null;
  const selectedThinkingOption = currentThinkingQuestion.options.find(option => option.id === currentThinkingAnswer);
  const thinkingScore = thinkingQuestions.reduce((score, question, index) => score + (question.options.find(option => option.id === thinkingQuizAnswers[index])?.correct ? 1 : 0), 0);
  const thinkingProgress = Object.keys(thinkingQuizAnswers).length;
  const thinkingPersona = thinkingScore >= 5 ? "Razor Mode" : thinkingScore >= 4 ? "Sharp Operator" : thinkingScore >= 3 ? "Promising Pattern-Spotter" : "Bias Hunter in Training";
  const thinkingTrait = mbtiType.includes("N") ? "pattern jumps" : "real-world details";
  const thinkingNudge = primaryDisc === "D"
    ? "Your Dominant advantage is decisiveness. Your trap is deciding before the evidence is complete."
    : primaryDisc === "I"
      ? "Your Influential advantage is possibility. Your trap is treating excitement like evidence."
      : primaryDisc === "S"
        ? "Your Steady advantage is patience. Your trap is waiting too long to challenge a comfortable assumption."
        : "Your Conscientious advantage is precision. Your trap is collecting more data after the decision already has enough signal.";
  const resetThinkingQuiz = () => {
    setThinkingQuizIndex(0);
    setThinkingQuizAnswers({});
    setThinkingQuizComplete(false);
  };
  const FEATURE_CARDS: Record<string, ReactNode> = {
    deepdive: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.cyan}, ${C.purple})`} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(34,211,238,0.1)", border: `1px solid rgba(34,211,238,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📖</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Profile Deep Dive</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{arch} · {DISC_LABELS[primaryDisc] || "Work style"}</div>
              </div>
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: C.glassBg, border: `1px solid ${C.glassBorder}`, color: C.purple }}>CHOOSE LENS</div>
          </div>
          <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65, marginBottom: 12 }}>
            Pick one lens: strength, pressure, environment, or watch-out.
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
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Role Matches</div>
                <div style={{ fontSize: 10, color: C.textDim }}>Why it fits + first test</div>
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
                    <MiniPanel label="Why it fits" title="Plain read" body={r.why} color={C.purple} />
                    <MiniPanel label="First move" title="Try this week" body={r.firstMove} color={C.cyan} />
                    <MiniPanel label="Watch-out" title="Practice this" body={r.skill} color={C.gold} />
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
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(239,68,68,0.1)", border: `1px solid rgba(239,68,68,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🪞</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Blind Spots</div>
                <div style={{ fontSize: 10, color: C.textDim }}>Tap one to see the better move</div>
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
                      minHeight: 108,
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
        <GradientTopBar colors={`linear-gradient(90deg, ${C.gold}, ${C.goldLight}, ${C.pink})`} />
        <div style={{ padding: 18 }}>
          <div style={{ background: "rgba(255,255,255,0.035)", border: `1px solid rgba(245,158,11,0.22)`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{expandVisibleTerms(hustle.title)}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>A practical business idea matched to your result</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "4px 9px", borderRadius: 9, whiteSpace: "nowrap" }}>{expandVisibleTerms(hustle.income)}</div>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55, marginBottom: 12 }}>{expandVisibleTerms(hustle.desc)} Start small, prove demand, then package the repeatable part.</div>

            <MiniPanel label="Why this fits" title="Plain read" body={sideHustlePlan.fitLine} color={C.gold} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8, margin: "10px 0 12px" }}>
              <MiniPanel label="Audience" title="Best buyer" body={expandVisibleTerms(hustle.audience)} color={C.pink} />
              <MiniPanel label="Core offer" title={expandVisibleTerms(hustle.offer.split(":")[0])} body={expandVisibleTerms(hustle.offer)} color={C.cyan} />
            </div>

            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
              {["Launch", "Validate", "Scale"].map(goal => <ActionButton key={goal} active={hustleGoal === goal} onClick={() => setHustleGoal(goal)}>{goal}</ActionButton>)}
            </div>
            <label style={{ display: "block", fontSize: 10, color: C.textDim, marginBottom: 6 }}>Weekly hours: <strong style={{ color: C.text }}>{hustleHours}</strong></label>
            <input type="range" min={3} max={15} value={hustleHours} onChange={(e) => setHustleHours(Number(e.target.value))} style={{ width: "100%", accentColor: C.gold, marginBottom: 12 }} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8, marginBottom: 12 }}>
              <MiniPanel label="Target" title={`~$${projectedIncome.toLocaleString()}/month`} body="A rough target based on your hours and phase. Treat it as a goal, not a promise." color="#4ade80" />
              <MiniPanel label={sideHustlePlan.phase.phase} title={sideHustlePlan.phase.focus} body={firstWeekendTask} color={C.gold} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 7 }}>This week</div>
              {sideHustlePlan.weeklyPlan.map((item, index) => (
                <div key={item} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 8, alignItems: "start", marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.3)`, color: C.gold, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{index + 1}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.45 }}>{expandVisibleTerms(item)}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(245,158,11,0.07)", border: `1px solid rgba(245,158,11,0.18)`, borderRadius: 14, padding: 12, fontSize: 10.5, lineHeight: 1.45, color: C.textMuted }}>
              Watch-out: {expandVisibleTerms(hustle.risks[0] || "do not overbuild before anyone wants it")}. Keep the first offer narrow enough to finish.
            </div>
          </div>
        </div>
      </GlassCard>
    ),
    learning: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, #14b8a6, ${C.cyan}, ${C.purple})`} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.1, textTransform: "uppercase", color: "#14b8a6", marginBottom: 5 }}>Learning Guide</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.text, lineHeight: 1.15 }}>🎓 {learningPlan.title}</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>{learningPlan.subtitle}</div>
            </div>
            <div style={{ flex: "0 0 auto", width: 58, height: 58, borderRadius: 18, background: "rgba(20,184,166,0.10)", border: "1px solid rgba(20,184,166,0.30)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 0 22px rgba(20,184,166,0.14)" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#14b8a6", lineHeight: 1 }}>{learningPlan.fitScore}</div>
              <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: 0.8, color: C.textDim, textTransform: "uppercase" }}>fit</div>
            </div>
          </div>

          <div style={{ background: "rgba(20,184,166,0.06)", border: `1px solid rgba(20,184,166,0.18)`, borderRadius: 16, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: "#14b8a6", marginBottom: 6 }}>Best way to learn</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55 }}>{learningPlan.thesis}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7, marginBottom: 10 }}>
            {learningPlan.primaryLoop.map(step => (
              <div key={step.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.glassBorder}`, borderRadius: 14, padding: 10, minHeight: 116 }}>
                <div style={{ width: 24, height: 24, borderRadius: 9, background: "rgba(20,184,166,0.13)", border: "1px solid rgba(20,184,166,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6", fontSize: 11, fontWeight: 900, marginBottom: 8 }}>{step.label}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: C.text, marginBottom: 5 }}>{step.title}</div>
                <div style={{ fontSize: 9.5, color: C.textMuted, lineHeight: 1.45 }}>{step.body}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 8 }}>Choose tactics for this week</div>
            {learningPlan.tactics.map((tip, index) => {
              const selected = Boolean(selectedLearningTips[index]);
              return (
                <button key={tip} type="button" onClick={() => setSelectedLearningTips(prev => ({ ...prev, [index]: !prev[index] }))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 10px", background: selected ? "rgba(20,184,166,0.14)" : "rgba(255,255,255,0.03)", border: selected ? `1px solid #14b8a6` : `1px solid ${C.glassBorder}`, borderRadius: 11, marginBottom: 6, fontSize: 11, color: selected ? C.text : C.textMuted, cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left", lineHeight: 1.3 }}>
                  <span style={{ fontSize: 14, flex: "0 0 auto" }}>{selected ? "✅" : tip.split(" ")[0]}</span>
                  <span>{tip.replace(/^\S+\s/, "")}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "rgba(34,211,238,0.06)", border: `1px solid rgba(34,211,238,0.18)`, borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.cyan, marginBottom: 6 }}>Quick start</div>
              <div style={{ fontSize: 10.5, color: C.textMuted, lineHeight: 1.55 }}>{learningPlan.quickStart}</div>
            </div>
            <div style={{ background: "rgba(245,158,11,0.07)", border: `1px solid rgba(245,158,11,0.20)`, borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>Watch out</div>
              <div style={{ fontSize: 10.5, color: C.textMuted, lineHeight: 1.55 }}>{learningPlan.antiPattern}</div>
            </div>
          </div>

          <div style={{ background: "rgba(168,85,247,0.06)", border: `1px solid rgba(168,85,247,0.20)`, borderRadius: 14, padding: 12, fontSize: 10.5, lineHeight: 1.45, color: C.textMuted }}>
            Selected focus: {selectedTips.map(tip => tip.replace(/^\S+\s/, "")).join(" · ")}
          </div>
        </div>
      </GlassCard>
    ),
    thinking: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, #6366f1, #818cf8, ${C.cyan})`} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.1, textTransform: "uppercase", color: "#818cf8", marginBottom: 5 }}>Critical Thinking Mini-Quiz</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.text, lineHeight: 1.15 }}>🧩 Sharpen Thinking</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>5 quick questions · evidence, tradeoffs, assumptions</div>
            </div>
            <div style={{ flex: "0 0 auto", width: 58, height: 58, borderRadius: 18, background: "rgba(99,102,241,0.11)", border: "1px solid rgba(129,140,248,0.34)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 0 22px rgba(99,102,241,0.16)" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#a5b4fc", lineHeight: 1 }}>{thinkingQuizComplete ? `${thinkingScore}/5` : `${Math.min(thinkingQuizIndex + 1, 5)}/5`}</div>
              <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: 0.8, color: C.textDim, textTransform: "uppercase" }}>{thinkingQuizComplete ? "score" : "round"}</div>
            </div>
          </div>

          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ width: `${thinkingQuizComplete ? 100 : Math.max(8, (thinkingProgress / thinkingQuestions.length) * 100)}%`, height: "100%", background: `linear-gradient(90deg, #6366f1, #818cf8, ${C.cyan})`, borderRadius: 999, transition: "width 0.2s ease" }} />
          </div>

          {!thinkingQuizComplete ? (
            <div style={{ background: "rgba(99,102,241,0.08)", border: `1px solid rgba(129,140,248,0.20)`, borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: "#a5b4fc" }}>{currentThinkingQuestion.skill}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.textDim }}>{mbtiType} style: {thinkingTrait}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.text, lineHeight: 1.35, marginBottom: 12 }}>{currentThinkingQuestion.prompt}</div>

              {currentThinkingQuestion.options.map(option => {
                const selected = currentThinkingAnswer === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setThinkingQuizAnswers(prev => ({ ...prev, [thinkingQuizIndex]: option.id }))}
                    style={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: "24px 1fr",
                      alignItems: "center",
                      gap: 8,
                      textAlign: "left",
                      borderRadius: 12,
                      padding: "10px 11px",
                      marginBottom: 7,
                      border: selected ? `1px solid ${option.correct ? "#4ade80" : C.gold}` : `1px solid ${C.glassBorder}`,
                      background: selected ? (option.correct ? "rgba(74,222,128,0.10)" : "rgba(245,158,11,0.10)") : "rgba(255,255,255,0.035)",
                      color: selected ? C.text : C.textMuted,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.35,
                    }}
                  >
                    <span style={{ width: 22, height: 22, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: selected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.055)", fontSize: 11, fontWeight: 900 }}>{selected ? (option.correct ? "✓" : "×") : ""}</span>
                    <span>{option.label}</span>
                  </button>
                );
              })}

              {selectedThinkingOption && (
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  <MiniPanel
                    label={selectedThinkingOption.correct ? "Good hit" : "Useful miss"}
                    title={selectedThinkingOption.correct ? "That is the sharper move" : "That answer is tempting for a reason"}
                    body={selectedThinkingOption.feedback}
                    color={selectedThinkingOption.correct ? "#4ade80" : C.gold}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (thinkingQuizIndex >= thinkingQuestions.length - 1) {
                        setThinkingQuizComplete(true);
                      } else {
                        setThinkingQuizIndex(thinkingQuizIndex + 1);
                      }
                    }}
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: 13,
                      minHeight: 44,
                      padding: "12px 12px",
                      background: `linear-gradient(135deg, #6366f1, #818cf8, ${C.cyan})`,
                      color: C.text,
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      boxShadow: "0 10px 24px rgba(99,102,241,0.20)",
                    }}
                  >
                    {thinkingQuizIndex >= thinkingQuestions.length - 1 ? "See my thinking score" : "Next question →"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(34,211,238,0.08))", border: `1px solid rgba(129,140,248,0.28)`, borderRadius: 18, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>{thinkingScore >= 4 ? "🏆" : thinkingScore >= 3 ? "🔎" : "🧠"}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 4 }}>{thinkingPersona}</div>
                <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55 }}>You scored <strong style={{ color: C.cyan }}>{thinkingScore}/5</strong>. Your best next upgrade is turning instincts into tests before a decision gets expensive.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8 }}>
                <MiniPanel label="Your style" title={`${mbtiType} thinking style`} body={`You naturally lean on ${thinkingTrait}. Keep that strength, then add one opposite check before you commit.`} color="#a5b4fc" />
                <MiniPanel label="Work style nudge" title={`${DISC_LABELS[primaryDisc] || "Your"} trap`} body={thinkingNudge} color={DISC_COLORS[primaryDisc] || C.cyan} />
              </div>

              <div style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 8 }}>Question review</div>
                {thinkingQuestions.map((question, index) => {
                  const chosen = question.options.find(option => option.id === thinkingQuizAnswers[index]);
                  const correct = Boolean(chosen?.correct);
                  return (
                    <div key={question.skill} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 8, alignItems: "start", marginBottom: index === thinkingQuestions.length - 1 ? 0 : 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 8, background: correct ? "rgba(74,222,128,0.12)" : "rgba(245,158,11,0.12)", border: `1px solid ${correct ? "rgba(74,222,128,0.32)" : "rgba(245,158,11,0.32)"}`, color: correct ? "#86efac" : C.goldLight, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{correct ? "✓" : "×"}</div>
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 900, color: C.text, marginBottom: 2 }}>{question.skill}</div>
                        <div style={{ fontSize: 9.5, color: C.textMuted, lineHeight: 1.4 }}>{chosen?.feedback || "No answer recorded."}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={resetThinkingQuiz}
                style={{ width: "100%", borderRadius: 13, padding: "10px 12px", border: `1px solid rgba(129,140,248,0.32)`, background: "rgba(99,102,241,0.10)", color: "#c7d2fe", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Retake the 5-question drill
              </button>
            </div>
          )}
        </div>
      </GlassCard>
    ),
  };

  // Demo mode: show banner at top, then full premium content
  if (isDemo) {
    return (
      <div style={{ background: C.bg, minHeight: "100dvh", fontFamily: "Inter, sans-serif", color: C.text, overflowX: "hidden" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
        <AuroraBg />
        <TopNav premium={true} />
        <div style={{ padding: "10px 20px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 100, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", fontSize: 11, fontWeight: 600, color: "#c084fc" }}>
            🎨 Demo Mode — Premium content preview (payment not required)
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "calc(86px + env(safe-area-inset-top, 0px)) 16px calc(100px + env(safe-area-inset-bottom, 0px))" }}>
          <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>🪐</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>More Insights Preview</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{mbtiType} · More Insights · Six practical tools unlocked</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, margin: "0 auto 20px", maxWidth: 352, width: "100%" }}>
            {CONSTELLATION_ITEMS.map((item, i) => (
              <div key={item.id} style={{ minHeight: 88, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 22, padding: "10px 6px 9px", background: i === 0 ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.045)", border: i === 0 ? `1.5px solid ${C.cyan}` : `1.5px solid ${C.glassBorder}`, boxShadow: i === 0 ? `0 0 24px rgba(34,211,238,0.30), 0 12px 24px rgba(0,0,0,0.20)` : "0 10px 22px rgba(0,0,0,0.15)" }}>
                <div style={{ width: 42, height: 42, borderRadius: 15, background: i === 0 ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.055)", border: `1px solid ${i === 0 ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25 }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, color: i === 0 ? C.cyan : C.textMuted, textAlign: "center", lineHeight: 1.08, letterSpacing: "-0.1px" }}>{item.name}</div>
              </div>
            ))}
          </div>
          <div style={{ animation: "cardEnter 0.4s ease-out" } as CSSProperties}>
            <style>{`@keyframes cardEnter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
            {FEATURE_CARDS.deepdive}
          </div>
        </div>
        <PrivacyStrip />
      </div>
    );
  }

  if (splitPage === "chemistry") {
    return (
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "calc(86px + env(safe-area-inset-top, 0px)) 16px calc(100px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ padding: "18px 0 14px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px",
            background: "rgba(168,85,247,0.10)",
            border: `1px solid rgba(168,85,247,0.28)`,
            borderRadius: 100, fontSize: 8, fontWeight: 800,
            color: C.purple, letterSpacing: 1.2, textTransform: "uppercase",
            marginBottom: 8, boxShadow: "0 0 16px rgba(168,85,247,0.08)",
          }}>
            <span style={{ fontSize: 8 }}>🧲</span>
            Chemistry
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.3px" }}>Chemistry</h1>
          <p style={{ fontSize: 11, color: C.textMuted, margin: "0 auto", lineHeight: 1.45, maxWidth: 340 }}>See why styles click, clash, and how to communicate better.</p>
        </div>

        {renderTopSummaryStrip(chemistrySummaryCards)}

        <SectionLabel icon="🧲" accent={C.purple} subtitle="Pick the other person's style and context.">Compatibility Decoder</SectionLabel>
        <GlassCard style={{ overflow: "hidden", marginBottom: 18, border: `1px solid rgba(168,85,247,0.24)` }}>
          <GradientTopBar colors={`linear-gradient(90deg, ${C.purple}, ${C.cyan}, ${C.gold})`} />
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 8 }}>Their style</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 7, marginBottom: 13 }}>
              {(Object.entries(COMPATIBILITY_STYLES) as [CompatibilityStyleKey, typeof COMPATIBILITY_STYLES[CompatibilityStyleKey]][]).map(([key, item]) => (
                <button key={key} type="button" onClick={() => setCompatibilityStyle(key)} aria-pressed={compatibilityStyle === key} style={{ minHeight: 62, borderRadius: 14, border: compatibilityStyle === key ? `1px solid ${item.color}` : `1px solid ${C.glassBorder}`, background: compatibilityStyle === key ? `${item.color}18` : "rgba(255,255,255,0.035)", color: compatibilityStyle === key ? C.text : C.textMuted, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "8px 5px" }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{item.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 900 }}>{item.label}</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 8 }}>Context</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7, marginBottom: 14 }}>
              {(["Work", "Relationship", "Friend/Family"] as CompatibilityContext[]).map(context => (
                <button key={context} type="button" onClick={() => setCompatibilityContext(context)} aria-pressed={compatibilityContext === context} style={{ minHeight: 44, borderRadius: 13, border: compatibilityContext === context ? `1px solid ${C.cyan}` : `1px solid ${C.glassBorder}`, background: compatibilityContext === context ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.035)", color: compatibilityContext === context ? C.cyan : C.textMuted, cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 900, padding: "8px 6px" }}>
                  {context}
                </button>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.13), rgba(34,211,238,0.07))", border: `1px solid rgba(168,85,247,0.28)`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 9 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.purple, marginBottom: 5 }}>{compatibilityInsight.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 950, color: C.text, lineHeight: 1.15 }}>{compatibilityInsight.tag}</div>
                </div>
                <div style={{ flex: "0 0 auto", fontSize: 22, fontWeight: 950, color: C.cyan }}>{compatibilityInsight.score}%</div>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55 }}>{compatibilityInsight.contextHeadline}</div>
            </div>

            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              <MiniPanel label="Chemistry" title="Why this can click" body={compatibilityInsight.chemistry} color={C.cyan} />
              <MiniPanel label="Friction" title="Where it can rub" body={compatibilityInsight.friction} color={C.gold} />
              <MiniPanel label="Say this" title="Best communication move" body={compatibilityInsight.communication} color="#4ade80" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9, marginBottom: 12 }}>
              {compatibilityInsight.peoplePattern.map(item => <MiniPanel key={item.title} label={item.title} title={item.title} body={item.body} color={item.color} />)}
            </div>

            <div style={{ background: "rgba(34,211,238,0.07)", border: `1px solid rgba(34,211,238,0.20)`, borderRadius: 15, padding: 13, fontSize: 10.5, lineHeight: 1.5, color: C.textMuted }}>
              <strong style={{ color: C.cyan }}>Rule:</strong> {compatibilityInsight.rule}
            </div>
          </div>
        </GlassCard>

        <PrivacyStrip />
      </div>
    );
  }

  if (splitPage === "roles") {
    return (
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "calc(86px + env(safe-area-inset-top, 0px)) 16px calc(100px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ padding: "18px 0 14px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(245,158,11,0.10)", border: `1px solid rgba(245,158,11,0.28)`, borderRadius: 100, fontSize: 8, fontWeight: 800, color: C.gold, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>
            <span style={{ fontSize: 8 }}>💼</span>
            Roles
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.3px" }}>Roles</h1>
          <p style={{ fontSize: 11, color: C.textMuted, margin: "0 auto", lineHeight: 1.45, maxWidth: 340 }}>Test a dream role against your actual personality, work style, and trait pattern.</p>
        </div>

        {renderTopSummaryStrip(roleSummaryCards)}

        <SectionLabel icon="💼" accent={C.gold} subtitle="Type a role, pick a suggestion, and read the fit evidence.">Dream Role Advisor</SectionLabel>
        <GlassCard style={{ overflow: "hidden", marginBottom: 18, border: `1px solid rgba(245,158,11,0.24)` }}>
          <GradientTopBar colors={`linear-gradient(90deg, ${C.gold}, ${C.pink}, ${C.purple})`} />
          <div style={{ padding: 18 }}>
            <form onSubmit={(event) => { event.preventDefault(); submitDreamRole(); }} style={{ display: "grid", gap: 9, marginBottom: 13 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.textDim }}>Role to test</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                <input
                  value={dreamRoleInput}
                  onChange={(event) => setDreamRoleInput(event.target.value)}
                  placeholder="Try Software Engineer, Therapist, Game Designer..."
                  style={{ minWidth: 0, minHeight: 46, borderRadius: 14, border: `1px solid ${C.glassBorder}`, background: "rgba(255,255,255,0.055)", color: C.text, padding: "0 12px", fontSize: 12, fontWeight: 750, fontFamily: "Inter, sans-serif", outline: "none" }}
                />
                <button type="submit" style={{ minHeight: 46, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.pink})`, color: "#160616", fontSize: 12, fontWeight: 950, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "0 14px" }}>Check</button>
              </div>
            </form>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {dreamRoleSuggestions.map(role => (
                <button key={role.title} type="button" onClick={() => submitDreamRole(role.title)} style={{ minHeight: 44, borderRadius: 999, border: role.title === submittedDreamRole ? `1px solid ${C.gold}` : `1px solid ${C.glassBorder}`, background: role.title === submittedDreamRole ? "rgba(245,158,11,0.14)" : "rgba(255,255,255,0.035)", color: role.title === submittedDreamRole ? C.goldLight : C.textMuted, cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 850, padding: "8px 12px" }}>
                  {role.title}
                </button>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(244,114,182,0.08))", border: `1px solid rgba(245,158,11,0.28)`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.gold, marginBottom: 5 }}>Dream role fit</div>
                  <div style={{ fontSize: 18, fontWeight: 950, color: C.text, lineHeight: 1.15 }}>{submittedDreamRole}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>{submittedRoleMeta.source || "Custom role"}</div>
                </div>
                <div style={{ flex: "0 0 auto", textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 950, color: C.goldLight, lineHeight: 1 }}>{dreamRoleMatch}%</div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: C.textMuted }}>{dreamRoleFitLabel}</div>
                </div>
              </div>
              <div style={{ height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${dreamRoleMatch}%`, height: "100%", background: `linear-gradient(90deg, ${C.gold}, ${C.pink}, ${C.purple})`, borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              <MiniPanel label="Role read" title={dreamRoleAnalysis.categoryText} body={submittedRoleMeta.desc || `A custom role test for ${submittedDreamRole}.`} color={C.gold} />
              {dreamRoleWhy.map((line, index) => (
                <MiniPanel key={line} label={index === 0 ? "Role type" : index === 1 ? "DISC fit" : index === 2 ? "MBTI fit" : "Big Five fit"} title={line.split(":")[0]} body={line.replace(/^[^:]+:\s*/, "")} color={index === 1 ? DISC_COLORS[primaryDisc] || C.cyan : index === 2 ? C.purple : index === 3 ? C.cyan : C.gold} />
              ))}
              <MiniPanel label="Friction" title="Where this may rub" body={dreamRoleFriction} color={C.pink} />
              <MiniPanel label="Leverage" title="Next useful move" body={dreamRoleAnalysis.leverage} color="#4ade80" />
            </div>

            <div style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 9 }}>Test path</div>
              {dreamRoleAnalysis.path.map(step => (
                <div key={step.num} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 8, alignItems: "start", marginBottom: step.num === dreamRoleAnalysis.path.length ? 0 : 8 }}>
                  <div style={{ width: 23, height: 23, borderRadius: "50%", background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.30)`, color: C.gold, fontSize: 10, fontWeight: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>{step.num}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: C.text, marginBottom: 2 }}>{step.title}</div>
                    <div style={{ fontSize: 10, lineHeight: 1.45, color: C.textMuted }}>{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <PrivacyStrip />
      </div>
    );
  }

  if (splitPage === "pressure") {
    return (
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "calc(86px + env(safe-area-inset-top, 0px)) 16px calc(100px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ padding: "18px 0 14px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px",
            background: "rgba(244,114,182,0.10)",
            border: `1px solid rgba(244,114,182,0.26)`,
            borderRadius: 100, fontSize: 8, fontWeight: 800,
            color: C.pink, letterSpacing: 1.2, textTransform: "uppercase",
            marginBottom: 8, boxShadow: "0 0 16px rgba(244,114,182,0.08)",
          }}>
            <span style={{ fontSize: 8 }}>🌡️</span>
            Pressure
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.3px" }}>Pressure</h1>
          <p style={{ fontSize: 11, color: C.textMuted, margin: "0 auto", lineHeight: 1.45, maxWidth: 340 }}>Your stress pattern, misread risk, and reset move.</p>
        </div>

        {renderTopSummaryStrip(pressureSummaryCards)}

        <SectionLabel icon="🌡️" accent={C.pink} subtitle="Your stress pattern and one reset move.">Pressure Mode</SectionLabel>
        <GlassCard style={{ overflow: "hidden", marginBottom: 18, border: `1px solid rgba(244,114,182,0.24)` }}>
          <GradientTopBar colors={`linear-gradient(90deg, ${C.pink}, ${C.gold}, ${C.cyan})`} />
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 15, background: "rgba(244,114,182,0.12)", border: `1px solid rgba(244,114,182,0.34)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23, boxShadow: "0 0 22px rgba(244,114,182,0.12)" }}>🌡️</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.text, marginBottom: 3 }}>{pressureMode.title}</div>
                  <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.45 }}>{pressureMode.subtitle}</div>
                </div>
              </div>
              <div style={{ flex: "0 0 auto", fontSize: 9, fontWeight: 900, letterSpacing: 1, color: C.pink, textTransform: "uppercase", padding: "5px 8px", borderRadius: 999, background: "rgba(244,114,182,0.09)", border: `1px solid rgba(244,114,182,0.28)` }}>Stress Self</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 9, marginBottom: 12 }}>
              {pressureMode.cards.map(card => (
                <div key={card.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${card.color}30`, borderRadius: 15, padding: 12, minHeight: 138 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                    <span style={{ fontSize: 17 }}>{card.icon}</span>
                    <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: 1.1, textTransform: "uppercase", color: card.color }}>{card.label}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: C.text, marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.55 }}>{card.body}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9, marginBottom: 12 }}>
              <MiniPanel label="Do say" title="Pressure script" body={`“${pressureMode.doScript}”`} color="#4ade80" />
              <MiniPanel label="Do not say" title="The expensive version" body={`“${pressureMode.dontScript}”`} color={C.gold} />
            </div>

            <div style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(244,114,182,0.07))", border: `1px solid rgba(34,211,238,0.18)`, borderRadius: 16, padding: 13 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase", color: C.cyan, marginBottom: 8 }}>90-second reset protocol</div>
              <div style={{ display: "grid", gap: 7 }}>
                {pressureMode.resetSteps.map((step, index) => (
                  <div key={step} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 8, alignItems: "start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(34,211,238,0.12)", border: `1px solid rgba(34,211,238,0.25)`, color: C.cyan, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{index + 1}</div>
                    <div style={{ fontSize: 10, lineHeight: 1.55, color: C.textMuted }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        <PrivacyStrip />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "calc(86px + env(safe-area-inset-top, 0px)) 16px calc(100px + env(safe-area-inset-bottom, 0px))" }}>
      {/* Insights Hero */}
      <div style={{ padding: "18px 0 10px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px",
          background: "rgba(34,211,238,0.08)",
          border: `1px solid rgba(34,211,238,0.22)`,
          borderRadius: 100, fontSize: 8, fontWeight: 800,
          color: C.cyan, letterSpacing: 1.2, textTransform: "uppercase",
          marginBottom: 8, boxShadow: "0 0 16px rgba(34,211,238,0.08)",
        }}>
          <span style={{ fontSize: 6, animation: "starPulse 2s ease-in-out infinite" }}>✦</span>
          Insights
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 2, letterSpacing: "-0.3px" }}>Insights</h1>
        <p style={{ fontSize: 10, color: C.textMuted, margin: 0 }}>Choose a tool to use your result</p>
      </div>

      {/* Condensed Profile Strip */}
      {renderTopSummaryStrip(profileSummaryCards)}

      {/* Insight Rooms */}
      <div style={{ margin: "22px 0 14px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, marginBottom: 7 }}>
          <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}55)` }} />
          <span style={{ fontSize: 22 }}>🪐</span>
          <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.cyan}55, transparent)` }} />
        </div>
        <h2 style={{ margin: 0, color: C.text, fontSize: 18, fontWeight: 950, letterSpacing: 0.2 }}>Pick a tool</h2>
        <div style={{ maxWidth: 380, margin: "7px auto 0", fontSize: 11, lineHeight: 1.45, color: C.textDim }}>Choose the question you want answered next.</div>
      </div>
      <div style={{ fontSize: 9, color: C.textDim, textAlign: "center", marginBottom: 6 }}>
Tap any tool
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 6,
          alignItems: "stretch",
          margin: "0 auto 16px",
          maxWidth: 352,
          width: "100%",
          userSelect: "none",
        }}
      >
        {CONSTELLATION_ITEMS.map((item) => {
          const isActive = activeCard === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveCard(item.id)}
              style={{
                minWidth: 0,
                minHeight: 82,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
                background: isActive ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.045)",
                border: isActive ? `1.5px solid ${C.cyan}` : `1.5px solid ${C.glassBorder}`,
                borderRadius: 22,
                padding: "10px 6px 9px",
                fontFamily: "Inter, sans-serif",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
                boxShadow: isActive ? `0 0 24px rgba(34,211,238,0.30), 0 12px 24px rgba(0,0,0,0.20)` : "0 10px 22px rgba(0,0,0,0.15)",
                transform: isActive ? "translateY(-1px)" : "translateY(0)",
                transition: "transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
              }}
            >
              <span style={{
                width: 42,
                height: 42,
                borderRadius: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 25,
                background: isActive ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.055)",
                border: `1px solid ${isActive ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.08)"}`,
                marginBottom: 1,
              }}>{item.icon}</span>
              <span style={{
                fontSize: 11,
                fontWeight: 900,
                color: isActive ? C.cyan : C.textMuted,
                textAlign: "center",
                lineHeight: 1.08,
                letterSpacing: "-0.1px",
              }}>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Feature Card */}
      <div style={{ animation: "cardEnter 0.4s ease-out" } as CSSProperties}>
        <style>{`
          @keyframes cardEnter {
            from { opacity: 0; transform: translateY(16px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        {FEATURE_CARDS[activeCard]}
      </div>


      <PrivacyStrip />
    </div>
  );
}

function ResultSplitShell({ page, mbtiType, primaryDisc, onNavigate }: {
  page: Exclude<ResultPageId, 1>;
  mbtiType: string;
  primaryDisc: string;
  onNavigate: (page: ResultPageId) => void;
}) {
  const meta = RESULT_PAGE_LABELS[page];
  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "calc(86px + env(safe-area-inset-top, 0px)) 16px calc(110px + env(safe-area-inset-bottom, 0px))" }}>
      <div style={{ padding: "28px 0 18px", textAlign: "center" }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>{meta.icon}</div>
        <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 1.4, color: C.cyan, textTransform: "uppercase", marginBottom: 7 }}>Result section</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, lineHeight: 1.05, fontWeight: 900, color: C.text, margin: "0 0 8px" }}>{meta.title}</h1>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: C.textMuted, margin: "0 auto", maxWidth: 340 }}>{meta.subtitle}</p>
      </div>

      <div style={{
        borderRadius: C.cardRadius,
        padding: 16,
        background: "linear-gradient(135deg, rgba(34,211,238,0.09), rgba(168,85,247,0.07))",
        border: `1px solid ${C.glassBorder}`,
        boxShadow: "0 18px 48px rgba(0,0,0,0.24)",
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 1, textTransform: "uppercase", color: C.goldLight, marginBottom: 6 }}>Phase 1 shell</div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: C.textMuted }}>{meta.status}</div>
        <div style={{ marginTop: 12, padding: "10px 11px", borderRadius: 13, background: "rgba(255,255,255,0.035)", border: `1px solid ${C.glassBorder}`, fontSize: 11, lineHeight: 1.45, color: C.textDim }}>
          Current result loaded: <strong style={{ color: C.text }}>{mbtiType}</strong> · <strong style={{ color: C.text }}>{DISC_LABELS[primaryDisc] || primaryDisc}</strong>. Scoring and persistence are unchanged.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9 }}>
        {(Object.entries(RESULT_PAGE_LABELS) as [Exclude<ResultPageId, 1>, typeof RESULT_PAGE_LABELS[Exclude<ResultPageId, 1>]][]).map(([id, item]) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            style={{
              minHeight: 82,
              padding: "11px 10px",
              borderRadius: 16,
              border: `1px solid ${id === page ? C.cyan : "rgba(255,255,255,0.10)"}`,
              background: id === page ? "rgba(34,211,238,0.10)" : "rgba(255,255,255,0.035)",
              color: C.text,
              textAlign: "left",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "block", fontSize: 20, marginBottom: 5 }}>{item.icon}</span>
            <span style={{ display: "block", fontSize: 12, fontWeight: 900 }}>{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


type OrbitalResultView = "main" | "role" | "mbti" | "disc" | "bigfive" | "share";

function parseOrbitalResultView(value: string | null): OrbitalResultView {
  return value === "role" || value === "mbti" || value === "disc" || value === "bigfive" || value === "share" ? value : "main";
}

function OrbitalGlassV2Results({
  bigFive,
  disc,
  mbtiType,
  primaryDisc,
  rawScores,
  discDesc,
  onShare,
}: {
  bigFive: BigFiveProfile;
  disc: DiscProfile;
  mbtiType: string;
  primaryDisc: string;
  rawScores?: QuizScores;
  discDesc?: string;
  onShare: (source?: string) => void;
}) {
  const [view, setView] = useState<OrbitalResultView>(() => {
    if (typeof window === "undefined") return "main";
    return parseOrbitalResultView(new URLSearchParams(window.location.search).get("page"));
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const next = parseOrbitalResultView(url.searchParams.get("page"));
    setView(next);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", view);
    window.history.replaceState({}, "", url.toString());
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [view]);

  const arch = getArchetype(mbtiType);
  const identity = SOCIAL_IDENTITY_TITLES[mbtiType] || `${stripLeadingThe(arch)} Builder`;
  const emoji = MBTI_EMOJIS[mbtiType] || "◈";
  const discLabel = DISC_LABELS[primaryDisc] || primaryDisc;
  const roleMatch = findBestRoleMatch(mbtiType, primaryDisc, bigFive);
  const roleCards = buildPremiumRoleMatchCards({ roleMatch, mbtiType, primaryDisc, disc, bigFive });
  const primaryRole = roleCards[0] || { title: (TOP_CAREER_MAP[mbtiType] || TOP_CAREER_MAP.INTP).title, pct: 84, why: roleMatch.whyThisFits || "Your pattern fits work that turns messy inputs into useful progress.", daily: "Translate ambiguity into structure people can use.", skill: "Systems thinking", firstMove: "Build one small proof project.", primary: true, rank: "01" };
  const adjacentRoles = roleCards.slice(1, 4);
  const rankedTraits = (Object.entries(bigFive) as [keyof BigFiveProfile, number][]).sort((a, b) => b[1] - a[1]);
  const topTrait = rankedTraits[0];
  const topTraitMeta = TRAIT_DEEP_DIVE[topTrait[0]];
  const resultSummaryLine = buildResultSummaryLine({
    roleTitle: primaryRole.title,
    identity,
    mbtiType,
    discLabel,
    topTraitLabel: topTraitMeta.label,
  });
  const shareLine = resultSummaryLine;
  const identityWordCount = identity.trim().split(/\s+/).filter(Boolean).length;
  const identityScale: CSSProperties = identity.length >= 22
    ? { fontSize: "clamp(34px, 10vw, 58px)", lineHeight: 0.92, letterSpacing: "-0.068em" }
    : identity.length >= 17
      ? { fontSize: "clamp(38px, 11vw, 64px)", lineHeight: 0.9, letterSpacing: "-0.072em" }
      : { fontSize: "clamp(42px, 13vw, 74px)" };
  const identityWords = identity.trim().split(/\s+/).filter(Boolean);
  const mbtiScoreMap: Record<string, number> = {
    E: rawScores?.mbti.E ?? 50,
    I: rawScores?.mbti.I ?? 50,
    S: rawScores?.mbti.S ?? 50,
    N: rawScores?.mbti.N ?? 50,
    T: rawScores?.mbti.T ?? 50,
    F: rawScores?.mbti.F ?? 50,
    J: rawScores?.mbti.J ?? 50,
    P: rawScores?.mbti.P ?? 50,
  };
  const mbtiDimensions = ([
    { label: "Recharge", leftLetter: "E", rightLetter: "I", dominant: mbtiType[0], words: { E: "External momentum", I: "Quiet depth" } },
    { label: "Information", leftLetter: "S", rightLetter: "N", dominant: mbtiType[1], words: { S: "Concrete proof", N: "Pattern signal" } },
    { label: "Decision", leftLetter: "T", rightLetter: "F", dominant: mbtiType[2], words: { T: "Logic first", F: "Values first" } },
    { label: "Planning", leftLetter: "J", rightLetter: "P", dominant: mbtiType[3], words: { J: "Closure", P: "Adaptability" } },
  ] as const).map((axis) => {
    const total = (mbtiScoreMap[axis.leftLetter] ?? 50) + (mbtiScoreMap[axis.rightLetter] ?? 50) || 1;
    const dominantPct = Math.round(((mbtiScoreMap[axis.dominant] ?? 50) / total) * 100);
    return { ...axis, pct: dominantPct };
  });
  const discEntries = (Object.entries(disc) as [keyof DiscProfile, number][]).sort((a, b) => b[1] - a[1]);

  const go = (next: OrbitalResultView, source = "orbital_v2") => {
    trackKyrEvent("result_section_clicked", { result_page: view, target_page: next, source, mbti_type: mbtiType, primary_disc: primaryDisc });
    setView(next);
  };

  const navItems: Array<{ id: OrbitalResultView; icon: string; label: string }> = [
    { id: "role", icon: "🏆", label: "Role" },
    { id: "mbti", icon: "♟", label: "MBTI" },
    { id: "bigfive", icon: "🌌", label: "Big" },
    { id: "disc", icon: "📊", label: "DISC" },
    { id: "share", icon: "↗", label: "Share" },
  ];

  const orbStyle: CSSProperties = {
    ["--accent" as string]: view === "role" ? "#ffd581" : view === "mbti" ? "#a777ff" : view === "bigfive" ? "#73ffc8" : view === "disc" ? "#ff63cf" : "#52f1ff",
  };

  return (
    <div className="orbital-results-v2" style={orbStyle}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .orbital-results-v2 { --ink:#f8fbff; --muted:rgba(232,244,255,.72); --faint:rgba(232,244,255,.48); --line:rgba(255,255,255,.14); min-height:100dvh; color:var(--ink); font-family:Inter,system-ui,sans-serif; background:radial-gradient(circle at 10% 0%, rgba(82,241,255,.30), transparent 34%), radial-gradient(circle at 94% 4%, rgba(167,119,255,.31), transparent 32%), radial-gradient(circle at 70% 86%, rgba(255,99,207,.18), transparent 36%), linear-gradient(145deg,#050711 0%,#09101f 48%,#13081d 100%); overflow-x:hidden; }
        .orbital-results-v2 * { box-sizing:border-box; }
        .orbital-results-v2:before { content:""; position:fixed; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px); background-size:34px 34px; opacity:.36; mask-image:linear-gradient(to bottom,black,transparent 78%); }
        .orb-stage { width:min(100%,460px); margin:0 auto; min-height:100dvh; position:relative; z-index:1; padding:env(safe-area-inset-top) 12px calc(96px + env(safe-area-inset-bottom)); }
        .orb-top { position:sticky; top:0; z-index:20; margin:0 -12px 10px; padding:10px 14px 12px; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(to bottom,rgba(5,7,17,.92),rgba(5,7,17,.62),transparent); backdrop-filter:blur(18px); }
        .orb-brand { display:flex; align-items:center; gap:9px; border:0; background:transparent; color:white; font-weight:950; letter-spacing:-.04em; cursor:pointer; }
        .orb-mark { width:34px; height:34px; border-radius:13px; display:grid; place-items:center; background:linear-gradient(135deg,#52f1ff,#a777ff); box-shadow:0 0 32px rgba(82,241,255,.32); }
        .orb-pill { border:1px solid var(--line); background:rgba(255,255,255,.075); color:var(--muted); border-radius:999px; padding:8px 10px; font-size:10px; font-weight:950; letter-spacing:.12em; text-transform:uppercase; }
        .portrait-card { position:relative; overflow:hidden; border:1px solid rgba(255,255,255,.18); border-radius:34px; padding:18px; min-height:540px; background:radial-gradient(circle at 84% 8%, rgba(82,241,255,.23), transparent 34%), radial-gradient(circle at 4% 86%, rgba(255,213,129,.12), transparent 34%), linear-gradient(150deg, rgba(255,255,255,.115), rgba(255,255,255,.036)); box-shadow:0 24px 80px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.16); backdrop-filter:blur(22px); }
        .card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:17px; }
        .eyebrow { color:rgba(255,255,255,.67); text-transform:uppercase; letter-spacing:.19em; font-size:10px; font-weight:950; }
        .avatar { width:46px; height:46px; border-radius:17px; display:grid; place-items:center; background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.13); font-size:21px; }
        .glass-tile { border-radius:28px; padding:17px; border:1px solid rgba(255,255,255,.13); background:rgba(5,8,18,.58); box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 16px 44px rgba(0,0,0,.20); }
        .type-chip { display:inline-flex; align-items:center; gap:9px; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.10); border-radius:999px; padding:9px 11px; font-size:13px; font-weight:950; }
        .type-chip small { color:var(--muted); font-size:11px; font-weight:800; }
        .orb-h1 { margin:20px 0 0; font-size:clamp(42px,13vw,74px); line-height:.86; letter-spacing:-.078em; overflow-wrap:break-word; text-wrap:balance; max-width:100%; }
        .orb-h1 span { display:block; max-width:100%; }
        .shareline { margin:16px 0 13px; } .shareline b { color:#ffd581; font-size:10px; letter-spacing:.18em; text-transform:uppercase; } .shareline p { margin:7px 0 0; font-size:clamp(15.5px,4.4vw,20px); line-height:1.28; letter-spacing:-.026em; font-weight:720; color:rgba(248,251,255,.80); text-wrap:pretty; }
        .role-card { margin-top:13px; border-radius:25px; padding:17px; background:linear-gradient(145deg,#fff8e8,#f4dfb4); color:#15110c; box-shadow:0 18px 48px rgba(0,0,0,.26); }
        .role-card small { display:block; color:rgba(74,54,28,.62); font-size:10px; font-weight:950; letter-spacing:.16em; text-transform:uppercase; margin-bottom:7px; } .role-card h2 { margin:0 0 6px; font-size:25px; letter-spacing:-.055em; line-height:1.03; text-wrap:balance; } .role-card p { margin:0; color:rgba(20,14,7,.74); font-size:13px; line-height:1.48; font-weight:650; text-wrap:pretty; }
        .mini-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:11px; } .stat { border-radius:18px; padding:11px 9px; background:rgba(5,7,15,.70); border:1px solid rgba(255,255,255,.11); min-height:74px; } .stat small { display:block; color:#52f1ff; font-size:9px; text-transform:uppercase; letter-spacing:.11em; font-weight:950; margin-bottom:7px; } .stat strong { display:block; font-size:18px; letter-spacing:-.04em; } .stat span { color:var(--muted); font-size:10px; line-height:1.25; display:block; margin-top:2px; }
        .link-stack { margin-top:14px; display:grid; gap:9px; padding-bottom:calc(8px + env(safe-area-inset-bottom)); } .result-link { width:100%; text-align:left; display:grid; grid-template-columns:42px minmax(0,1fr) auto; gap:10px; align-items:center; padding:12px; border-radius:21px; border:1px solid rgba(255,255,255,.12); color:white; background:linear-gradient(135deg,rgba(255,255,255,.095),rgba(255,255,255,.035)); box-shadow:0 12px 30px rgba(0,0,0,.14); cursor:pointer; } .icon { width:44px; height:44px; border-radius:16px; display:grid; place-items:center; background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.11); font-size:21px; } .result-link b { display:block; font-size:15px; letter-spacing:-.03em; } .result-link span span { display:block; color:var(--muted); font-size:12px; line-height:1.28; margin-top:2px; } .arrow { color:var(--faint); font-size:22px; }
        .detail-head { border-radius:31px; padding:17px; min-height:250px; border:1px solid rgba(255,255,255,.16); background:radial-gradient(circle at 82% 10%, color-mix(in srgb,var(--accent),transparent 66%), transparent 36%), linear-gradient(150deg,rgba(255,255,255,.105),rgba(255,255,255,.035)); box-shadow:0 24px 70px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.14); backdrop-filter:blur(22px); display:flex; flex-direction:column; justify-content:space-between; margin-bottom:12px; }
        .back { color:var(--muted); font-size:13px; font-weight:850; border:0; background:transparent; padding:0; text-align:left; cursor:pointer; } .detail-head h2 { margin:24px 0 10px; font-size:clamp(50px,16vw,76px); line-height:.82; letter-spacing:-.085em; } .detail-head p { margin:0; color:var(--muted); line-height:1.48; font-weight:600; font-size:14px; }
        .detail-card { border-radius:26px; border:1px solid rgba(255,255,255,.14); background:rgba(7,11,24,.70); backdrop-filter:blur(18px); box-shadow:0 18px 50px rgba(0,0,0,.25); padding:17px; margin-bottom:11px; } .detail-card h3 { margin:0 0 8px; font-size:22px; line-height:1; letter-spacing:-.052em; } .detail-card p { margin:0; color:var(--muted); line-height:1.52; font-size:14px; }
        .analogy { margin-top:12px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.075); border-radius:21px; padding:13px; color:var(--muted); line-height:1.42; font-size:13px; } .analogy b { color:var(--accent); display:block; margin-bottom:4px; }
        .chips { display:flex; overflow-x:auto; gap:8px; margin-top:13px; padding-bottom:2px; scrollbar-width:none; } .chip { flex:0 0 auto; padding:8px 10px; border-radius:999px; background:rgba(255,255,255,.075); border:1px solid rgba(255,255,255,.11); color:var(--muted); font-size:11px; font-weight:850; }
        .orbit-mini { height:280px; position:relative; overflow:hidden; } .core { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:126px; height:126px; border-radius:50%; display:grid; place-items:center; text-align:center; font-weight:950; background:radial-gradient(circle, rgba(255,255,255,.16), color-mix(in srgb,var(--accent),transparent 82%)); border:1px solid rgba(255,255,255,.2); box-shadow:0 0 56px color-mix(in srgb,var(--accent),transparent 70%); } .ring { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); border:1px dashed rgba(255,255,255,.17); border-radius:50%; } .r1 { width:214px; height:214px; } .r2 { width:318px; height:318px; opacity:.55; } .node { position:absolute; padding:8px 9px; border-radius:999px; background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.12); font-size:11px; font-weight:900; } .n1 { left:4%; top:21%; } .n2 { right:4%; top:21%; } .n3 { left:3%; bottom:18%; } .n4 { right:5%; bottom:18%; }
        .role-list { display:grid; gap:9px; margin-top:10px; } .mini-role { padding:13px; border-radius:18px; background:rgba(255,255,255,.065); border:1px solid rgba(255,255,255,.10); } .mini-role b { display:block; font-size:14px; margin-bottom:4px; } .mini-role span { color:var(--muted); font-size:12.5px; line-height:1.38; }
        .meter-list { display:grid; gap:12px; margin-top:12px; } .meter-top { display:flex; justify-content:space-between; color:var(--muted); font-size:12px; font-weight:850; margin-bottom:7px; } .bar { height:12px; border-radius:999px; background:rgba(255,255,255,.08); overflow:hidden; border:1px solid rgba(255,255,255,.08); } .fill { height:100%; width:var(--v); border-radius:999px; background:linear-gradient(90deg,var(--accent),rgba(255,255,255,.82)); }
        .disc-grid { display:grid; grid-template-columns:repeat(2,1fr); border:1px solid rgba(255,255,255,.12); border-radius:23px; overflow:hidden; margin-top:12px; } .quad { min-height:96px; padding:13px; background:rgba(255,255,255,.055); display:flex; flex-direction:column; justify-content:space-between; } .quad.active { background:linear-gradient(135deg,rgba(255,99,207,.30),rgba(82,241,255,.08)); } .quad b { font-size:26px; } .quad span { color:var(--muted); font-size:12px; }
        .share-preview { border-radius:28px; padding:18px; background:linear-gradient(150deg,rgba(82,241,255,.22),rgba(167,119,255,.14),rgba(255,213,129,.12)); border:1px solid rgba(255,255,255,.18); } .share-preview h2 { margin:15px 0; font-size:54px; line-height:.82; letter-spacing:-.085em; } .share-actions { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; margin-top:13px; } .share-btn { border:1px solid rgba(255,255,255,.14); border-radius:17px; padding:13px 10px; color:white; background:rgba(255,255,255,.09); font-weight:900; cursor:pointer; } .share-btn.primary { color:#061018; background:linear-gradient(135deg,#52f1ff,#ffd581); }
        .bottom-nav { position:relative; z-index:40; width:100%; display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:6px; padding:8px; border-radius:25px; border:1px solid rgba(255,255,255,.14); background:rgba(5,7,17,.78); backdrop-filter:blur(20px); box-shadow:0 18px 60px rgba(0,0,0,.38); } .bottom-nav button { text-align:center; border:0; border-radius:18px; padding:8px 5px; color:var(--muted); background:transparent; font-size:10px; font-weight:950; cursor:pointer; } .bottom-nav button i { display:block; font-style:normal; font-size:19px; margin-bottom:3px; } .bottom-nav button.active { color:white; background:rgba(255,255,255,.105); }
        @media (min-width:760px) { .orbital-results-v2 { display:grid; place-items:start center; } .orb-stage { margin-top:18px; min-height:calc(100vh - 36px); border-left:1px solid rgba(255,255,255,.08); border-right:1px solid rgba(255,255,255,.08); } }
      `}</style>

      <main className="orb-stage">
        <header className="orb-top">
          <button className="orb-brand" onClick={() => go("main", "brand")}><span className="orb-mark">◈</span><span>KnowYouRole</span></button>
          <span className="orb-pill">Your Result</span>
        </header>

        {view === "main" && (
          <section>
            <article className="portrait-card">
              <div className="card-head"><div className="eyebrow">What you'll get</div><div className="avatar">{emoji}</div></div>
              <div className="glass-tile"><div className="type-chip">{emoji} {mbtiType} <small>{stripLeadingThe(arch)}</small></div><h1 className="orb-h1" style={identityScale}>{identityWordCount > 1 ? identityWords.map((word) => <span key={word}>{word}</span>) : identity}</h1></div>
              <div className="shareline"><b>Result summary</b><p>“{shareLine}”</p></div>
              <div className="role-card"><small>Best-fit role direction</small><h2>{primaryRole.title}</h2><p>{primaryRole.why}</p></div>
              <div className="mini-stats"><div className="stat"><small>MBTI</small><strong>{mbtiType}</strong><span>{stripLeadingThe(arch)}</span></div><div className="stat"><small>DISC</small><strong>{primaryDisc}</strong><span>{discLabel}</span></div><div className="stat"><small>Trait</small><strong>{topTrait[1]}%</strong><span>{topTraitMeta.label}</span></div></div>
            </article>
            <div className="link-stack">
              <button className="result-link" onClick={() => go("role")}><span className="icon">🏆</span><span><b>Role Fit</b><span>Career direction and adjacent roles.</span></span><span className="arrow">›</span></button>
              <button className="result-link" onClick={() => go("mbti")}><span className="icon">♟</span><span><b>MBTI-style</b><span>Your cognitive operating pattern.</span></span><span className="arrow">›</span></button>
              <button className="result-link" onClick={() => go("bigfive")}><span className="icon">🌌</span><span><b>Big Five</b><span>Your trait gravity and environment fit.</span></span><span className="arrow">›</span></button>
              <button className="result-link" onClick={() => go("disc")}><span className="icon">📊</span><span><b>DISC</b><span>Your visible work behavior.</span></span><span className="arrow">›</span></button>
              <button className="result-link" onClick={() => go("share")}><span className="icon">↗</span><span><b>Share</b><span>Save or send a clean result summary.</span></span><span className="arrow">›</span></button>
            </div>
          </section>
        )}

        {view === "role" && <section><div className="detail-head"><button className="back" onClick={() => go("main", "back")}>← Portrait</button><div><h2>Role Fit</h2><p>Your career direction, explained like a flight path rather than a prison sentence.</p></div></div><div className="detail-card orbit-mini"><div className="ring r1" /><div className="ring r2" /><div className="core">{primaryRole.title}</div><div className="node n1">Pattern</div><div className="node n2">Process</div><div className="node n3">Strategy</div><div className="node n4">Quality</div></div><div className="detail-card"><h3>Why this fits</h3><p>{primaryRole.why}</p><div className="chips"><span className="chip">{mbtiType} pattern</span><span className="chip">{discLabel} work style</span><span className="chip">{topTraitMeta.label}</span></div><div className="analogy"><b>Analogy</b>Role fit is a flight path. It does not trap you in one destination; it shows which skies have the least turbulence.</div></div><div className="detail-card"><h3>Other good-fit roles</h3><div className="role-list">{adjacentRoles.map((role) => <div className="mini-role" key={role.title}><b>{role.title}</b><span>{role.why}</span></div>)}</div></div></section>}

        {view === "mbti" && <section><div className="detail-head"><button className="back" onClick={() => go("main", "back")}>← Portrait</button><div><h2>MBTI</h2><p>Your preferred mental route: how you plan, process, decide, and build.</p></div></div><div className="detail-card"><h3>{mbtiType}: {stripLeadingThe(arch)} mode</h3><p>{MBTI_TAGLINES[mbtiType] || "Personality pattern"}. This describes the route your mind tends to select when making sense of people, problems, and plans.</p><div className="analogy"><b>Analogy</b>MBTI is your navigation app: it does not choose the destination, but it reveals the route your mind keeps selecting.</div></div><div className="detail-card"><h3>Cognitive flow</h3><div className="meter-list">{mbtiDimensions.map((axis) => <div key={axis.label}><div className="meter-top"><span>{axis.label} · {axis.words[axis.dominant as keyof typeof axis.words]}</span><span>{axis.pct}%</span></div><div className="bar"><div className="fill" style={{ "--v": `${axis.pct}%` } as CSSProperties} /></div></div>)}</div></div><div className="detail-card"><h3>Use it well</h3><p>Give yourself the conditions your type actually uses well. The point is not a label; it is better decision design.</p></div></section>}

        {view === "bigfive" && <section><div className="detail-head"><button className="back" onClick={() => go("main", "back")}>← Portrait</button><div><h2>Big Five</h2><p>Your trait climate: what reliably pulls, drains, stabilizes, or amplifies you.</p></div></div><div className="detail-card"><h3>Trait gravity</h3><div className="meter-list">{rankedTraits.map(([key, value]) => <div key={key}><div className="meter-top"><span>{TRAIT_DEEP_DIVE[key].label}</span><span>{value}%</span></div><div className="bar"><div className="fill" style={{ "--v": `${value}%` } as CSSProperties} /></div></div>)}</div></div><div className="detail-card"><h3>What it means</h3><p>Your strongest Big Five signal is {topTraitMeta.label}. That does not define your entire personality, but it does shape the environment where your effort compounds fastest.</p><div className="analogy"><b>Analogy</b>Big Five is your climate report. MBTI is route preference; DISC is driving behavior; Big Five is the weather system you operate inside.</div></div></section>}

        {view === "disc" && <section><div className="detail-head"><button className="back" onClick={() => go("main", "back")}>← Portrait</button><div><h2>DISC</h2><p>Your visible work behavior: pace, pressure, communication, and standards.</p></div></div><div className="detail-card"><h3>Work behavior map</h3><div className="disc-grid">{(["D", "I", "S", "C"] as const).map((key) => <div className={`quad ${primaryDisc === key ? "active" : ""}`} key={key}><b>{key}</b><span>{DISC_LABELS[key]} · {disc[key]}%</span></div>)}</div></div><div className="detail-card"><h3>{discLabel} strength</h3><p>{discDesc || `Your ${primaryDisc} style describes how you tend to move when work involves pressure, standards, and other people.`}</p><div className="analogy"><b>Analogy</b>DISC is your dashboard while driving with other people in the car: speed, steering, braking, and how aggressively you take corners.</div></div><div className="detail-card"><h3>Second signal</h3><p>Your next strongest DISC signal is {DISC_LABELS[String(discEntries[1]?.[0] || "C")] || discEntries[1]?.[0]} at {discEntries[1]?.[1] ?? 0}%. That secondary style colors how your primary style shows up.</p></div></section>}

        {view === "share" && <section><div className="detail-head"><button className="back" onClick={() => go("main", "back")}>← Portrait</button><div><h2>Share</h2><p>Export a polished result card as an image or PDF, then send by text or email.</p></div></div><div className="detail-card"><div className="share-preview"><div className="eyebrow">Instant Portrait</div><h2>{identity}</h2><p>“{shareLine}”</p><div className="role-card"><small>Best-fit direction</small><h2>{primaryRole.title}</h2><p>{mbtiType} · {discLabel} · {topTraitMeta.label}</p></div></div></div><div className="detail-card"><h3>Share options</h3><p>Every shared result includes the invite link: <b>knowyourole.com</b>.</p><div className="share-actions"><button className="share-btn primary" onClick={() => onShare("image_action")}>Image</button><button className="share-btn primary" onClick={() => onShare("pdf_action")}>PDF</button><button className="share-btn" onClick={() => onShare("text_action")}>Text</button><button className="share-btn" onClick={() => onShare("email_action")}>Email</button></div></div></section>}

        {view !== "main" && <nav className="bottom-nav" aria-label="Mobile result navigation">{navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => go(item.id, "bottom_nav")}><i>{item.icon}</i>{item.label}</button>)}</nav>}
      </main>
    </div>
  );
}

// ─── Main Results Page ───────────────────────────────────────────────────────
export default function ResultsPage() {
  const [mounted, setMounted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const lastResultViewEventKey = useRef("");
  const realResults = useRealResults(mounted);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !realResults) return;
    const params = new URLSearchParams(window.location.search);
    const resultViewEventKey = `orbital-v2:${realResults.mbtiType}:${realResults.primaryDisc}:${params.get("sessionId") || "no-session"}:${params.get("resultId") || "no-result"}`;
    if (lastResultViewEventKey.current === resultViewEventKey) return;
    lastResultViewEventKey.current = resultViewEventKey;
    trackKyrEvent("result_viewed", {
      result_page: "orbital_glass_v2",
      page_number: "orbital-v2",
      mbti_type: realResults.mbtiType,
      primary_disc: realResults.primaryDisc,
      source: params.get("test") === "true" ? "test_route" : realResults.isDemo ? "demo" : "quiz_result",
      has_session_id: Boolean(params.get("sessionId")),
      has_result_id: Boolean(params.get("resultId")),
    });
  }, [mounted, realResults]);

  useEffect(() => {
    if (!mounted || !realResults) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("devShare") !== "true") return;
    setShareOpen(true);
    url.searchParams.delete("devShare");
    window.history.replaceState({}, "", url.toString());
  }, [mounted, realResults]);

  if (!realResults) {
    return (
      <div style={{ background: "#050711", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "Inter, sans-serif" }}>Loading your results…</div>
      </div>
    );
  }

  const { bigFive, disc, mbtiType, primaryDisc, rawScores, discDesc } = realResults;
  const arch = getArchetype(mbtiType);
  const career = TOP_CAREER_MAP[mbtiType] || TOP_CAREER_MAP.INTP;
  const topBigFive = (Object.entries(bigFive) as [keyof BigFiveProfile, number][]).reduce((a, b) => a[1] > b[1] ? a : b);
  const topBigFiveLabel = TRAIT_DEEP_DIVE[topBigFive[0]]?.label || topBigFive[0];
  const reportRoleMatch = findBestRoleMatch(mbtiType, primaryDisc, bigFive);
  const [reportPrimaryRole] = buildPremiumRoleMatchCards({ roleMatch: reportRoleMatch, mbtiType, primaryDisc, disc, bigFive });
  const reportRoleTitle = reportPrimaryRole?.title || career.title;
  const reportRoleSalary = reportPrimaryRole?.salary || career.salary;
  const reportIdentity = SOCIAL_IDENTITY_TITLES[mbtiType] || `${stripLeadingThe(arch)} Builder`;
  const reportSummary = buildResultSummaryLine({
    roleTitle: reportRoleTitle,
    identity: reportIdentity,
    mbtiType,
    discLabel: DISC_LABELS[primaryDisc] || primaryDisc,
    topTraitLabel: topBigFiveLabel,
  });
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const sessionId = searchParams?.get("sessionId") || undefined;

  const reportPayload: ShareReportPayload = {
    sessionId,
    title: `KnowYouRole Result — ${mbtiType}`,
    subtitle: `${mbtiType} — ${arch}`,
    mbtiType,
    archetype: arch,
    primaryDisc,
    population: POPULATION_RATES[mbtiType] || "2.4%",
    career: {
      title: reportRoleTitle,
      salary: reportRoleSalary,
      summary: `${reportSummary} Try your own result at knowyourole.com.`,
    },
    bigFive,
    disc,
    sections: [
      {
        title: "MBTI",
        subtitle: `${mbtiType} — ${arch}`,
        body: `MBTI is your navigation app: it reveals the route your mind keeps selecting. Try your own result at knowyourole.com.`,
      },
      {
        title: "DISC",
        subtitle: `${primaryDisc} — ${DISC_LABELS[primaryDisc] || "Primary Style"}`,
        body: discDesc || `Your primary DISC style is ${primaryDisc}, which describes your visible work behavior around pace, pressure, and standards.`,
      },
      {
        title: "Big Five",
        subtitle: `${topBigFiveLabel} dominant · ${topBigFive[1]}%`,
        body: `Big Five is your climate report: the trait environment you operate inside.`,
      },
    ],
  };

  const openShareModal = (source = "orbital_share") => {
    trackKyrEvent("share_modal_opened", { result_page: "orbital_glass_v2", source, mbti_type: mbtiType, primary_disc: primaryDisc });
    setShareOpen(true);
  };

  return (
    <>
      <OrbitalGlassV2Results bigFive={bigFive} disc={disc} mbtiType={mbtiType} primaryDisc={primaryDisc} rawScores={rawScores} discDesc={discDesc} onShare={openShareModal} />
      <ShareResultsModal open={shareOpen} onClose={() => setShareOpen(false)} report={reportPayload} />
    </>
  );
}
