import { useState, useEffect, useRef } from "react";
import type { TouchEvent } from "react";
import { Link, useLocation, useSearchParams } from "wouter";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { isTestMode, getFakeScores, getFakeMBTIType } from "@/utils/devTest";
import { calculateResult, findBestRoleMatch } from "@/components/results/resultsData";
import { useAuth0 } from "@auth0/auth0-react";
import type { QuizScores } from "@/components/Quiz";
import { AuthModal } from "@/components/AuthModal";

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
  textMuted: "rgba(255, 255, 255, 0.5)",
  textDim: "rgba(255, 255, 255, 0.3)",
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

function useRealResults() {
  const scores = getStoredScores();
  const tier = (typeof window !== "undefined" ? sessionStorage.getItem("kyr_tier") : null) || "25+";

  // No stored scores — in test or demo mode, generate fake scores inline
  if (!scores) {
    const urlParams = new URLSearchParams(window.location.search);
    const inTestMode = urlParams.get("test") === "true";
    const inDemoMode = urlParams.get("demo") === "true";
    if (inTestMode || inDemoMode) {
      const testTier = (urlParams.get("tier") || tier) as "7-12" | "13-18" | "19-25" | "25plus";
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
      return { type, tier: testTier, bigFive, disc, mbtiType: result.mbtiType, primaryDisc, rawScores: fakeScores as unknown as QuizScores, isDemo: inDemoMode };
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
  const urlParams = new URLSearchParams(window.location.search);
  const isDemo = urlParams.get("demo") === "true";

  return { type, tier, bigFive, disc, mbtiType, primaryDisc, rawScores: scores, isDemo };
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

function BottomBar({ active = "p1", onNavigate, onFullPortraitClick, onPremiumClick, onRestart }: {
  active?: string;
  onNavigate?: (page: 1 | 2 | 3) => void;
  onFullPortraitClick?: () => void;
  onPremiumClick?: () => void;
  onRestart?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const btns = [
    { id: "p1", icon: "🏆", label: "Quick Glimpse" },
    { id: "p2", icon: "📋", label: "Full Portrait" },
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
    } else if (id === "p2") {
      onFullPortraitClick?.();
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
    }}>
      {btns.map(b => (
        <button key={b.id} onClick={() => handleClick(b.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none",
          color: active === b.id ? C.cyan : C.textMuted,
          opacity: active === b.id ? 1 : 0.5,
          fontSize: 9, fontWeight: 600, cursor: "pointer",
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

// ─── PAGE 1: Quick Glimpse ───────────────────────────────────────────────────
function Page1QuickGlimpse({ type, bigFive, disc, mbtiType, primaryDisc, rawScores, onLoginFree, onPremium, premiumError }: {
  type: string; bigFive: { O: number; C: number; E: number; A: number; N: number };
  disc: { D: number; I: number; S: number; C: number };
  mbtiType: string; primaryDisc: string;
  rawScores?: QuizScores;
  onLoginFree: () => void;
  onPremium: () => void;
  premiumError?: string | null;
}) {
  const base = type.split("-")[0];
  const arch = getArchetype(base);
  const primary = primaryDisc;
  const discColor = DISC_COLORS[primary];
  const pct = (v: number) => v; // Real normalized scores — no random jitter
  const career = TOP_CAREER_MAP[mbtiType] || TOP_CAREER_MAP.INTP;

  const bigFiveRows = [
    { label: "Openness", value: bigFive.O, color: C.cyan, sub: `${pct(bigFive.O)}th%` },
    { label: "Conscientious", value: bigFive.C, color: C.purple, sub: `${pct(bigFive.C)}th%` },
    { label: "Extroversion", value: bigFive.E, color: C.pink, sub: `${pct(bigFive.E)}th%` },
    { label: "Agreeable", value: bigFive.A, color: C.gold, sub: `${pct(bigFive.A)}th%` },
    { label: "Neuroticism", value: bigFive.N, color: "#64748b", sub: `${pct(bigFive.N)}th%` },
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
        }}>🏆 Your Quick Glimpse</div>
        <h1 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: "-0.3px",
        }}>Here's Who You Are</h1>
        <p style={{ fontSize: 13, color: C.textMuted }}>Free results · No login needed</p>
      </div>

      {/* 💼 Career Card — job title only, no header */}
      <div style={{
        borderRadius: C.cardRadius, padding: 18, marginBottom: 12,
        background: `linear-gradient(135deg, rgba(245,158,11,0.07), rgba(168,85,247,0.04))`,
        border: `1px solid rgba(245,158,11,0.15)`,
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
      <div style={{ borderRadius: C.cardRadius, padding: 18, marginBottom: 12, background: C.glassBg, backdropFilter: "blur(20px)", border: `1px solid ${C.glassBorder}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.purple}, ${C.pink})`, margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0` }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(168,85,247,0.1)", border: `1px solid rgba(168,85,247,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{type.split("-")[0]} — {arch}</div>
              <div style={{ fontSize: 10, color: C.textDim }}>16 Personalities · {MBTI_TAGLINES[mbtiType] || "Strategist"}</div>
            </div>
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(168,85,247,0.1)", border: `1px solid rgba(168,85,247,0.3)`, color: C.purple }}>{POPULATION_RATES[mbtiType] || "2.4%"}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {([
            { label: "Mind",    A: mbtiType[0] === "E" ? rawScores?.mbti.E ?? 50 : rawScores?.mbti.I ?? 50, B: mbtiType[0] === "E" ? rawScores?.mbti.I ?? 50 : rawScores?.mbti.E ?? 50, leftLabel: "E", rightLabel: "I" },
            { label: "Energy",  A: mbtiType[1] === "N" ? rawScores?.mbti.N ?? 50 : rawScores?.mbti.S ?? 50, B: mbtiType[1] === "N" ? rawScores?.mbti.S ?? 50 : rawScores?.mbti.N ?? 50, leftLabel: "N", rightLabel: "S" },
            { label: "Nature",  A: mbtiType[2] === "T" ? rawScores?.mbti.T ?? 50 : rawScores?.mbti.F ?? 50, B: mbtiType[2] === "T" ? rawScores?.mbti.F ?? 50 : rawScores?.mbti.T ?? 50, leftLabel: "T", rightLabel: "F" },
            { label: "Tactics", A: mbtiType[3] === "J" ? rawScores?.mbti.J ?? 50 : rawScores?.mbti.P ?? 50, B: mbtiType[3] === "J" ? rawScores?.mbti.P ?? 50 : rawScores?.mbti.J ?? 50, leftLabel: "J", rightLabel: "P" },
          ] as { label: string; A: number; B: number; leftLabel: string; rightLabel: string }[]).map(d => {
            const total = d.A + d.B || 1;
            const leftPct = Math.round((d.A / total) * 100);
            const rightPct = Math.round((d.B / total) * 100);
            return (
              <div key={d.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, padding: "8px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: C.cyan }}>{d.leftLabel}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textDim }}>{d.label}</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: C.purpleDim }}>{d.rightLabel}</div>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", position: "relative", marginBottom: 3 }}>
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "rgba(255,255,255,0.15)" }} />
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${leftPct}%`, background: `linear-gradient(90deg, ${C.cyan}88, ${C.cyan})`, borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${rightPct}%`, background: `linear-gradient(90deg, ${C.purple}, ${C.purple}88)`, borderRadius: "0 3px 3px 0" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 8, fontWeight: 600, color: C.cyan }}>{leftPct}%</div>
                  <div style={{ fontSize: 8, fontWeight: 600, color: C.purpleDim }}>{rightPct}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📊 DISC Card */}
      <div style={{ borderRadius: C.cardRadius, padding: 18, marginBottom: 12, background: C.glassBg, backdropFilter: "blur(20px)", border: `1px solid ${C.glassBorder}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#3b82f6)`, margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${discColor}18`, border: `1px solid ${discColor}4d`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{primary} — {DISC_LABELS[primary]}</div>
            <div style={{ fontSize: 10, color: C.textDim }}>DISC Profile · Primary Style</div>
          </div>
        </div>
        {(["D", "I", "S", "C"] as const).map(l => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800, width: 14, textAlign: "center", color: DISC_COLORS[l] }}>{l}</div>
            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${disc[l]}%`, height: "100%", background: DISC_COLORS[l], borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, width: 28, textAlign: "right" }}>{disc[l]}%</div>
          </div>
        ))}
      </div>

      {/* 🧬 Big Five Card */}
      <div style={{ borderRadius: C.cardRadius, padding: 18, marginBottom: 12, background: C.glassBg, backdropFilter: "blur(20px)", border: `1px solid ${C.glassBorder}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`, margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(34,211,238,0.1)", border: `1px solid rgba(34,211,238,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧬</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Big Five · {(() => { const entries = Object.entries(bigFive) as [string, number][]; const top = entries.reduce((a, b) => a[1] > b[1] ? a : b); return `${top[0] === "O" ? "Openness" : top[0] === "C" ? "Conscientiousness" : top[0] === "E" ? "Extroversion" : top[0] === "A" ? "Agreeableness" : "Neuroticism"} Dominant`; })()}</div>
            <div style={{ fontSize: 10, color: C.textDim }}>{(() => { const entries = Object.entries(bigFive) as [string, number][]; const top = entries.reduce((a, b) => a[1] > b[1] ? a : b); return `${top[1]}th percentile`; })()} · US adults</div>
          </div>
        </div>
        {bigFiveRows.map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: r.color, width: 100, flexShrink: 0 }}>{r.label}</div>
            <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${r.value}%`, height: "100%", background: `linear-gradient(90deg, ${r.color}, ${r.color}88)`, borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, width: 34, textAlign: "right", color: r.color }}>
              <span style={{ fontSize: 9, fontWeight: 400, color: C.textDim }}>{r.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 🔓 Dual CTA */}
      <div style={{
        borderRadius: C.cardRadius, padding: 20,
        background: `linear-gradient(135deg, rgba(168,85,247,0.1), rgba(34,211,238,0.05))`,
        border: `1px solid rgba(168,85,247,0.18)`,
        textAlign: "center", marginBottom: 12, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`, borderRadius: "1px", margin: "-5px -5px 0", width: "calc(100% + 10px)" }} />
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔓</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Want More?</div>
        <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 16 }}>
          Login free or unlock premium to see full trait breakdowns, city matches, and personality insights.
        </div>
        <button
          onClick={onLoginFree}
          style={{
          display: "block", width: "100%", padding: "11px",
          background: "transparent",
          border: `1px solid ${C.glassBorderBright}`,
          borderRadius: 12, color: C.textMuted,
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          fontFamily: "Inter, sans-serif", marginBottom: 10,
          transition: "all 0.2s",
        }}>🔑 Login free for more details</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: C.glassBorder }} />
          <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>or</div>
          <div style={{ flex: 1, height: 1, background: C.glassBorder }} />
        </div>
        <button
          onClick={onPremium}
          style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          width: "100%", padding: "14px 20px",
          background: `linear-gradient(135deg, ${C.teal}, #0891b2)`,
          border: "none", borderRadius: 14,
          color: "#022c22", fontSize: 14, fontWeight: 800,
          cursor: "pointer", fontFamily: "Inter, sans-serif",
          boxShadow: "0 4px 24px rgba(6, 182, 212, 0.35)",
          transition: "all 0.2s", marginBottom: premiumError ? 8 : 14,
        }}>
          🔓 Premium Results
          <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>Blindspots · 3 Role Matches · Dream Advisor · Career Simulator</span>
        </button>
        {premiumError && (
          <div style={{
            padding: "8px 12px",
            background: "rgba(255, 80, 80, 0.08)",
            border: "1px solid rgba(255, 80, 80, 0.2)",
            borderRadius: 8,
            color: "#ff8080",
            fontSize: 12,
            textAlign: "center",
            marginBottom: 14,
          }}>
            {premiumError}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5 }}>
          {["🛡 Blindspot Discovery", "🎯 3 Role Matches", "💭 Dream Role Advisor", "🎮 Career Simulator"].map(f => (
            <div key={f} style={{
              fontSize: 9, fontWeight: 600, padding: "3px 8px",
              background: "rgba(6, 182, 212, 0.08)",
              border: `1px solid rgba(6, 182, 212, 0.2)`,
              borderRadius: 100, color: C.teal,
            }}>{f}</div>
          ))}
        </div>
      </div>

      <PrivacyStrip />
    </div>
  );
}

// ─── PAGE 2: Full Portrait ────────────────────────────────────────────────────
function Page2FullPortrait({ type, bigFive, disc, mbtiType, primaryDisc }: {
  type: string; bigFive: { O: number; C: number; E: number; A: number; N: number };
  disc: { D: number; I: number; S: number; C: number };
  mbtiType: string; primaryDisc: string;
}) {
  const base = type.split("-")[0];
  const arch = getArchetype(base);
  const primary = primaryDisc;
  const discColor = DISC_COLORS[primary];

  const pct = (v: number) => v; // Real normalized scores — no random jitter

  const bigFiveRows = [
    { label: "Openness", value: bigFive.O, color: C.cyan, sub: `${pct(bigFive.O)}th %ile`, subLabel: "Curiosity & Ideas" },
    { label: "Conscientiousness", value: bigFive.C, color: C.purple, sub: `${pct(bigFive.C)}th %ile`, subLabel: "Organization & Duty" },
    { label: "Extroversion", value: bigFive.E, color: C.pink, sub: `${pct(bigFive.E)}th %ile`, subLabel: "Social Energy" },
    { label: "Agreeableness", value: bigFive.A, color: C.gold, sub: `${pct(bigFive.A)}th %ile`, subLabel: "Compassion & Trust" },
    { label: "Neuroticism", value: bigFive.N, color: "#64748b", sub: `${pct(bigFive.N)}th %ile`, subLabel: "Emotional Sensitivity" },
  ];

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 16px 100px" }}>
      {/* Hero */}
      <div style={{ padding: "28px 0 20px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px",
          background: "rgba(34,211,238,0.08)",
          border: `1px solid rgba(34,211,238,0.25)`,
          borderRadius: 100, fontSize: 10, fontWeight: 700,
          color: C.cyan, letterSpacing: 1.5, textTransform: "uppercase",
          marginBottom: 16, boxShadow: "0 0 20px rgba(34,211,238,0.1)",
        }}>📋 Full Portrait · Logged In</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: "-0.3px" }}>Your Complete Portrait</h1>
      </div>

      {/* Profile Stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {/* Big type card */}
        <div style={{ borderRadius: C.cardRadius, padding: "20px 22px", background: C.glassBg, backdropFilter: "blur(20px)", border: `1px solid ${C.glassBorder}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(34,211,238,0.12), rgba(168,85,247,0.08))`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.purple}, ${C.pink})` }} />
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: C.textDim, marginBottom: 8, display: "block" }}>Your Type</div>
          <div style={{ fontSize: 40, fontWeight: 800, background: `linear-gradient(135deg, ${C.cyan}, #67e8f9, ${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1, marginBottom: 4, letterSpacing: "-1px" }}>{type}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.cyan, marginBottom: 2 }}>{arch}</div>
          <div style={{ fontSize: 10, color: C.textDim }}>Only <strong style={{ color: C.textMuted }}>{POPULATION_RATES[mbtiType] || "2.4%"}</strong> of the population shares this type</div>
        </div>
        {/* Mini cards row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { icon: "📊", value: `${primary} ${disc[primary as keyof typeof disc]}%`, label: "DISC · Dominant", sub: DISC_LABELS[primary as keyof typeof DISC_LABELS], bar: disc[primary as keyof typeof disc], barColor: discColor, color: "cyan" },
            { icon: "🎯", value: `O: ${bigFive.O}%`, label: "Openness · #1", sub: `${pct(bigFive.O)}th percentile`, bar: bigFive.O, barColor: C.cyan, color: "purple" },
          ].map((c, i) => (
            <div key={i} style={{
              borderRadius: 16, padding: "14px 16px",
              background: c.color === "cyan" ? "rgba(34,211,238,0.06)" : "rgba(168,85,247,0.06)",
              border: c.color === "cyan" ? `1px solid rgba(34,211,238,0.15)` : `1px solid rgba(168,85,247,0.15)`,
              transition: "all 0.25s",
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
        {(() => {
          const cities = getTopCities(mbtiType, 2);
          const topCity = cities[0] || { name: "Austin, TX", jobs: "2,500 openings" };
          const career = TOP_CAREER_MAP[mbtiType] || TOP_CAREER_MAP.INTJ;
          const cards = [
            { icon: "💼", value: career.salary, label: "Avg Salary", sub: career.title },
            { icon: "🌍", value: topCity.name.split(",")[0], label: "#1 City Match", sub: topCity.jobs },
          ];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {cards.map((c, i) => (
                <div key={i} style={{
                  borderRadius: 16, padding: "14px 16px",
                  background: c.icon === "💼" ? "rgba(245,158,11,0.06)" : "rgba(34,211,238,0.06)",
                  border: c.icon === "💼" ? `1px solid rgba(245,158,11,0.15)` : `1px solid rgba(34,211,238,0.15)`,
                }}>
                  <div style={{ fontSize: 18, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 2, lineHeight: 1 }}>{c.value}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textDim }}>{c.label}</div>
                  <div style={{ fontSize: 9, color: C.textDim, marginTop: 3 }}>{c.sub}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Career Radar */}
      <SectionLabel>Your Career Radar</SectionLabel>
      <div style={{ borderRadius: C.cardRadius, padding: 18, marginBottom: 12, background: C.glassBg, backdropFilter: "blur(20px)", border: `1px solid ${C.glassBorder}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`, margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(34,211,238,0.1)", border: `1px solid rgba(34,211,238,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧭</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Your Personality Profile</div>
            <div style={{ fontSize: 10, color: C.textDim }}>5-factor radar across all dimensions</div>
          </div>
        </div>
        {/* Radar SVG */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ position: "relative", width: 200, height: 200 }}>
            <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
              <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth={1} />
              <circle cx="100" cy="100" r="60" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth={1} />
              <circle cx="100" cy="100" r="40" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth={1} />
              <circle cx="100" cy="100" r="20" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth={1} />
              <line x1="100" y1="100" x2="100" y2="20" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <line x1="100" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <line x1="100" y1="100" x2="100" y2="180" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <line x1="100" y1="100" x2="20" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <polygon points="100,28 168,100 100,156 52,100" fill="rgba(34,211,238,0.15)" stroke={C.cyan} strokeWidth={2} strokeLinejoin="round" />
              <circle cx="100" cy="28" r="4" fill={C.cyan} />
              <circle cx="168" cy="100" r="4" fill={C.purple} />
              <circle cx="100" cy="156" r="4" fill={C.pink} />
              <circle cx="52" cy="100" r="4" fill={C.gold} />
            </svg>
            <div style={{ position: "absolute", inset: 0 }}>
              {[
                { label: `O: ${bigFive.O}`, top: -2, left: "50%", transform: "translateX(-50%)", color: C.cyan },
                { label: `C: ${bigFive.C}`, top: "50%", right: -4, transform: "translateY(-50%)", color: C.purple },
                { label: `E: ${bigFive.E}`, bottom: -2, left: "50%", transform: "translateX(-50%)", color: C.pink },
                { label: `A: ${bigFive.A}`, top: "50%", left: -4, transform: "translateY(-50%)", color: C.gold },
              ].map((l, i) => (
                <div key={i} style={{ position: "absolute", top: l.top, left: l.left, right: l.right, bottom: l.bottom, transform: l.transform, fontSize: 9, fontWeight: 700, color: l.color, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{l.label}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bigFiveRows.map(r => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 90, flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: r.color }}>{r.label}</div>
                <div style={{ fontSize: 8, color: C.textDim }}>{r.sub}</div>
              </div>
              <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${r.value}%`, height: "100%", background: `linear-gradient(90deg, ${r.color}, ${r.color}80)`, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, width: 30, textAlign: "right", flexShrink: 0, color: r.color }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* City Insights */}
      <SectionLabel>Top City Matches</SectionLabel>
      <div style={{ borderRadius: C.cardRadius, padding: 18, marginBottom: 12, background: C.glassBg, backdropFilter: "blur(20px)", border: `1px solid ${C.glassBorder}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.teal}, ${C.cyan})`, margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: `${C.cardRadius} ${C.cardRadius} 0 0` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(20,184,166,0.1)", border: `1px solid rgba(20,184,166,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌍</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Best Cities for You</div>
            <div style={{ fontSize: 10, color: C.textDim }}>Based on your personality + career profile</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: C.glassBg, border: `1px solid ${C.glassBorder}`, color: C.textDim }}>🇺🇸 US</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {getTopCities(mbtiType, 4).map(c => (
            <div key={c.rank} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`,
              borderRadius: 14, padding: 12, textAlign: "center",
              transition: "all 0.2s", cursor: "pointer",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{c.rank}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: C.cyan, marginBottom: 2 }}>{c.jobs}</div>
              <div style={{ fontSize: 10, color: C.goldLight }}>{c.salary}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium CTA */}
      <div style={{
        borderRadius: C.cardRadius, padding: 20,
        background: `linear-gradient(135deg, rgba(168,85,247,0.12), rgba(34,211,238,0.06))`,
        border: `1px solid rgba(168,85,247,0.2)`,
        textAlign: "center", marginBottom: 12,
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`, borderRadius: 1, marginBottom: 14 }} />
        <div style={{ fontSize: 36, marginBottom: 8 }}>🔓</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Unlock Premium Insights</div>
        <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 14 }}>
          Get blindspot analysis, 3 role matches, Dream Role Advisor, and the full 7-card career simulator.
        </div>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 26px",
          background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
          border: "none", borderRadius: 14,
          color: "#030108", fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "Inter, sans-serif",
          boxShadow: "0 4px 20px rgba(34,211,238,0.25)",
          transition: "all 0.2s",
        }}>🔓 Unlock Premium — $9.99/mo</button>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {["🛡 Blindspot Discovery", "🎯 3 Role Matches", "💭 Dream Role Advisor", "🎮 Career Simulator"].map(f => (
            <div key={f} style={{ fontSize: 9, fontWeight: 600, padding: "4px 10px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.glassBorder}`, borderRadius: 100, color: C.textDim }}>{f}</div>
          ))}
        </div>
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
  const stripRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  const base = type.split("-")[0];
  const arch = getArchetype(base);
  const primary = primaryDisc;

  const CARD_WIDTH = 80; // 72px card + 8px gap

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const delta = e.touches[0].clientX - touchStartX;
    setTouchDeltaX(delta);
    // Prevent native scroll when actively swiping
    if (Math.abs(delta) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    // Snap: if swipe distance > 40px, advance/retreat one card
    const moved = touchDeltaX;
    const currentIndex = CONSTELLATION_ITEMS.findIndex(c => c.id === activeCard);
    if (moved < -40 && currentIndex < CONSTELLATION_ITEMS.length - 1) {
      setActiveCard(CONSTELLATION_ITEMS[currentIndex + 1].id);
    } else if (moved > 40 && currentIndex > 0) {
      setActiveCard(CONSTELLATION_ITEMS[currentIndex - 1].id);
    }
    // Scroll the newly active card into view
    if (stripRef.current) {
      const targetIndex = CONSTELLATION_ITEMS.findIndex(c => c.id === activeCard);
      const scrollLeft = stripRef.current.scrollLeft + (moved < -40 ? CARD_WIDTH : moved > 40 ? -CARD_WIDTH : 0);
      stripRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  const FEATURE_CARDS: Record<string, React.ReactNode> = {
    deepdive: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.cyan}, ${C.purple})`} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(34,211,238,0.1)", border: `1px solid rgba(34,211,238,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📖</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Deep Dive: {mbtiType}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{arch} · {primaryDisc} Cluster</div>
              </div>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: C.glassBg, border: `1px solid ${C.glassBorder}`, color: C.purple }}>RARE</div>
          </div>
          <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
            As an {type}, your unique personality blend shapes how you experience the world and make decisions. Your {arch} archetype combined with your {primaryDisc} DISC style creates a distinctive approach to life, work, and relationships.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(mbtiType => {
              const traits: Record<string, [string, string]> = {
                ENFP: ["🔮 Creative", "⚡ Energetic"], INFP: ["💜 Idealist", "🌊 Empathetic"],
                ENFJ: ["💚 Champion", "📣 Inspiring"], INFJ: ["🧠 Insightful", "🎯 Purposeful"],
                ENTJ: ["⚡ Decisive", "🏆 Strategic"], INTJ: ["📐 Architect", "🎯 Independent"],
                ENTP: ["💡 Innovator", "⚡ Curious"], INTP: ["🔬 Analytical", "🔍 Logical"],
                ESFP: ["🎭 Energetic", "😊 Spontaneous"], ISFP: ["🎨 Adventurer", "💖 Creative"],
                ESFJ: ["💛 Caring", "👐 Supportive"], ISFJ: ["🛡 Loyal", "📋 Practical"],
                ESTJ: ["📌 Organized", "⚖️ Responsible"], ISTJ: ["✅ Reliable", "📋 Detailed"],
                ESTP: ["⚡ Active", "🎯 Pragmatic"], ISTP: ["🔧 Practical", "🔍 Logical"],
              };
              const defaultTraits: [string, string] = ["⭐ Versatile", "💪 Adaptable"];
              const [t1, t2] = traits[mbtiType] || defaultTraits;
              return [t1, t2].map(t => ({ icon: t.split(" ")[0], label: t.split(" ").slice(1).join(" ") }));
            })(mbtiType).map(({ icon, label }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted }}>{label}</div>
              </div>
            ))}
          </div>
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
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Your Role Matches</div>
                <div style={{ fontSize: 10, color: C.textDim }}>Ranked by personality fit</div>
              </div>
            </div>
          </div>
          {(() => {
            const match = findBestRoleMatch(mbtiType, primaryDisc, bigFive);
            return [
              { rank: "#1", title: match.primary.title, salary: match.primary.salary, pct: 96, primary: true },
              { rank: "#2", title: match.secondary.title, salary: match.secondary.salary, pct: 80, primary: false },
            ];
          })().map(r => (
            <div key={r.rank} style={{
              background: r.primary ? `rgba(34,211,238,0.05)` : "rgba(255,255,255,0.03)",
              border: r.primary ? `1px solid rgba(34,211,238,0.2)` : `1px solid ${C.glassBorder}`,
              borderRadius: 14, padding: 12, marginBottom: 7, cursor: "pointer", transition: "all 0.2s",
              ...(r.primary ? { gridColumn: "span 2" } : {}),
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textDim }}>{r.rank}</div>
                {r.primary && <div style={{ fontSize: 10, fontWeight: 700, color: C.cyan }}>{r.pct}% match</div>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: 10, color: C.cyan, marginBottom: 6 }}>{r.salary}</div>
              {!r.primary && (
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", width: "80%", margin: "0 auto" }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`, borderRadius: 2 }} />
                </div>
              )}
            </div>
          ))}
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
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Your Blindspots</div>
                <div style={{ fontSize: 10, color: C.textDim }}>Tap to reveal the flip side</div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Emotional Blindspot", text: "You can appear coldly logical to others who need emotional warmth.", severity: "high", flip: "Your depth is a superpower when tempered with empathy." },
              { label: "Impatience with Inefficiency", text: "Your high standards can make collaboration feel like a chore.", severity: "moderate", flip: "Patience unlocks teams that surprise you." },
            ].map((b, i) => (
              <div key={i} style={{
                borderRadius: 14, overflow: "hidden",
                background: `linear-gradient(135deg, rgba(239,68,68,0.15), rgba(168,85,247,0.08))`,
                border: `1px solid rgba(239,68,68,0.2)`,
                padding: 12, cursor: "pointer", transition: "transform 0.2s",
                minHeight: 100,
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(252,165,165,0.7)", marginBottom: 4 }}>{b.label}</div>
                <div style={{ fontSize: 10, color: C.text, lineHeight: 1.4, fontWeight: 500, marginBottom: 5 }}>{b.text}</div>
                <div style={{ fontSize: 8, color: C.textDim }}>Tap to flip →</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    ),
    hustles: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.gold}, ${C.goldLight})`} />
        <div style={{ padding: 18 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(245,158,11,0.15)`, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{SIDE_HUSTLES[mbtiType]?.title || "AI Side Hustle"}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "2px 8px", borderRadius: 8 }}>{SIDE_HUSTLES[mbtiType]?.income || "+$3K/mo"}</div>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 12 }}>{SIDE_HUSTLES[mbtiType]?.desc || "Build and sell AI-powered productivity tools for strategic thinkers."}</div>
            <div style={{ display: "flex", gap: 14 }}>
              {(SIDE_HUSTLES[mbtiType]?.tags || ["⏱ 6–8 hrs/wk", "📈 $2K–$5K/mo", "🎯 High fit"]).map(m => (
                <div key={m} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textDim }}>{m}</div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    ),
    learning: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, #14b8a6, ${C.cyan})`} />
        <div style={{ padding: 18 }}>
          <div style={{ background: "rgba(20,184,166,0.06)", border: `1px solid rgba(20,184,166,0.15)`, borderRadius: 16, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }}>🎓 {LEARNING_STYLES[mbtiType]?.title || "Systems-Based Learning"}</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 12 }}>{LEARNING_STYLES[mbtiType]?.desc || "You absorb information fastest when connected to a larger system."}</div>
            {(LEARNING_STYLES[mbtiType]?.tips || ["📐 Study systematically", "🎯 Apply what you learn", "📖 Read case studies"]).map(tip => (
              <div key={tip} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 5, fontSize: 11, color: C.textMuted }}>
                <span style={{ fontSize: 14 }}>{tip.split(" ")[0]}</span>{tip.substring(2)}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    ),
    thinking: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, #6366f1, #818cf8)`} />
        <div style={{ padding: 18, textAlign: "center" }}>
          <div style={{ background: "rgba(99,102,241,0.08)", border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧩</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{mbtiType} Thinking Challenge</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 12 }}>Your cognitive style shapes how you approach complexity. Train your specific strengths daily with tailored puzzles and pattern-recognition challenges.</div>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 18px",
              background: "rgba(99,102,241,0.15)",
              border: `1px solid rgba(99,102,241,0.3)`,
              borderRadius: 10, color: "#a5b4fc",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}>▶ Start Challenge</button>
          </div>
        </div>
      </GlassCard>
    ),
    crossroads: (
      <GlassCard style={{ overflow: "hidden", marginBottom: 12 }}>
        <GradientTopBar colors={`linear-gradient(90deg, ${C.purple}, ${C.cyan})`} />
        <div style={{ padding: 18, textAlign: "center" }}>
          <div style={{
            background: `linear-gradient(135deg, rgba(168,85,247,0.1), rgba(34,211,238,0.05))`,
            border: `1px solid rgba(168,85,247,0.15)`,
            borderRadius: 16, padding: 18,
          }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>{CROSSROADS[mbtiType]?.heading || "Crossroads Adventure"}</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 14 }}>{CROSSROADS[mbtiType]?.desc || "Every major decision shapes who you become. Your type shows you the paths worth taking."}</div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
              {(CROSSROADS[mbtiType]?.tags || ["Intuition", "Strategy", "Leadership", "Growth"]).map(t => (
                <div key={t} style={{ fontSize: 9, fontWeight: 600, padding: "3px 8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.glassBorder}`, borderRadius: 100, color: C.textMuted }}>{t}</div>
              ))}
            </div>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 22px",
              background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
              border: "none", borderRadius: 12,
              color: "#030108", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 20px rgba(34,211,238,0.2)",
            }}>Begin Journey →</button>
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
            <div style={{ fontSize: 11, color: C.textMuted }}>{mbtiType} · Full Portrait · All 7 premium insights unlocked</div>
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
            <div style={{ fontSize: 10, color: C.textDim }}>Only <strong style={{ color: C.textMuted }}>2.4%</strong> of the population shares this type</div>
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
      <div style={{ fontSize: 9, color: C.textDim, textAlign: "center", marginBottom: 4 }}>
        ← Swipe to explore ›
      </div>
      <div
        ref={stripRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          overflowX: "auto",
          marginBottom: 10,
          scrollbarWidth: "none" as const,
          transform: touchStartX !== null ? `translateX(${touchDeltaX}px)` : undefined,
          transition: touchStartX !== null ? "none" : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          cursor: touchStartX !== null ? "grabbing" : "grab",
          userSelect: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ display: "flex", gap: 8, padding: "8px 0 12px", minWidth: "max-content" }}>
          {CONSTELLATION_ITEMS.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveCard(item.id)}
              style={{
                flex: "0 0 auto",
                width: 72,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                cursor: "pointer",
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, position: "relative", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                background: activeCard === item.id ? "rgba(34,211,238,0.12)" : C.glassBg,
                border: activeCard === item.id ? `1.5px solid ${C.cyan}` : `1.5px solid ${C.glassBorder}`,
                boxShadow: activeCard === item.id ? `0 0 20px rgba(34,211,238,0.25), 0 0 40px rgba(34,211,238,0.1)` : "none",
                transform: activeCard === item.id ? "scale(1.12)" : "scale(1)",
              }}>
                <style>{`
                  @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
                <div style={{
                  position: "absolute", inset: -4, borderRadius: "50%",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  animation: "orbitSpin 12s linear infinite",
                }} />
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), transparent 60%)",
                  pointerEvents: "none",
                }} />
                {item.icon}
              </div>
              <div style={{
                fontSize: 8, fontWeight: 600, color: activeCard === item.id ? C.cyan : C.textMuted,
                textAlign: "center", lineHeight: 1.3, maxWidth: 64, transition: "color 0.2s",
              }}>{item.name}</div>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: activeCard === item.id ? C.cyan : C.textDim,
                boxShadow: activeCard === item.id ? `0 0 6px ${C.cyan}` : "none",
                transition: "all 0.2s",
              }} />
            </div>
          ))}
        </div>
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
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Dream Role Advisor</div>
              <div style={{ fontSize: 11, color: C.cyanDim }}>Tell me your dream — I'll map the path</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              placeholder="e.g. Start my own AI company…"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid rgba(34,211,238,0.15)`,
                borderRadius: 12, padding: "10px 14px",
                color: C.text, fontSize: 13, outline: "none",
                fontFamily: "Inter, sans-serif", transition: "border-color 0.2s",
              }}
            />
            <button style={{
              width: 40, height: 40,
              background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
              border: "none", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16,
              boxShadow: "0 4px 15px rgba(34,211,238,0.2)",
            }}>→</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {["Tech Founder", "AI Research", "Product Strategy", "Venture Capital"].map(c => (
              <div key={c} style={{ fontSize: 10, fontWeight: 500, padding: "4px 10px", background: "rgba(255,255,255,0.04)", border: `1px solid rgba(34,211,238,0.15)`, borderRadius: 100, color: C.cyanDim, cursor: "pointer" }}>{c}</div>
            ))}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: C.textDim, marginBottom: 10 }}>Your 4-Step Path</div>
          {[
            { num: 1, text: <>Build a <strong style={{ color: C.text }}>micro-SaaS</strong> tool in months 1–3. Learn product distribution firsthand.</> },
            { num: 2, text: <>Grow to <strong style={{ color: C.text }}>100 paying users</strong> by month 6. Validate before scaling.</> },
            { num: 3, text: <>Raise a <strong style={{ color: C.text }}>pre-seed round</strong> once metrics prove retention.</> },
            { num: 4, text: <>Scale to <strong style={{ color: C.text }}>$50K MRR</strong> — your AI company is real.</> },
          ].map(s => (
            <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(34,211,238,0.1)", border: `1px solid rgba(34,211,238,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.cyan, flexShrink: 0 }}>{s.num}</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4, paddingTop: 2 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Evolution Timeline */}
      <SectionLabel>Personality Evolution</SectionLabel>
      <GlassCard style={{ marginBottom: 12 }}>
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 18 }}>📈</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Your Growth Timeline</div>
          </div>
          <div style={{ position: "relative", paddingLeft: 14 }}>
            <div style={{ position: "absolute", left: 3, top: 4, bottom: 4, width: 1, background: `linear-gradient(180deg, ${C.cyan}, rgba(168,85,247,0.2), transparent)` }} />
            {[
              { year: "Age 16", text: <>Openness scored <strong style={{ color: C.text }}>78%</strong> — already showing strong curiosity and creative thinking.</> },
              { year: "Age 22", text: <>Conscientiousness at <strong style={{ color: C.text }}>85%</strong> — career focus sharpened your discipline.</> },
              { year: "Age 28", text: <>Emotional Stability at <strong style={{ color: C.text }}>68%</strong> — life experience built real resilience.</> },
              { year: "Today", text: <>Pattern shows continued growth in <strong style={{ color: C.text }}>strategic thinking</strong> and leadership.</> },
            ].map(e => (
              <div key={e.year} style={{ position: "relative", marginBottom: 10 }}>
                <div style={{ position: "absolute", left: "-12px", top: 5, width: 8, height: 8, borderRadius: "50%", background: C.cyan, boxShadow: "0 0 8px rgba(34,211,238,0.5)" }} />
                <div style={{ fontSize: 9, fontWeight: 700, color: C.cyan, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{e.year}</div>
                <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>{e.text}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <PrivacyStrip />
    </div>
  );
}

// ─── Main Results Page ───────────────────────────────────────────────────────
export default function ResultsPage() {
  const [page, setPage] = useState<1 | 2 | 3>(() => {
    if (typeof window === 'undefined') return 1;
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page');
    return (p === '2' ? 2 : p === '3' ? 3 : 1) as 1 | 2 | 3;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();
  const realResults = useRealResults();
  const [searchParams] = useSearchParams(); // Re-renders automatically when search params change

  // ─── TEMPORARY BYPASS: Skip Stripe, go directly to Page 3 ───────────────────
  // TODO (stripe-ready): Remove this bypass once Stripe Price ID is configured.
  // When Stripe is live, set VITE_STRIPE_BYPASS=false or remove this block.
  const VITE_STRIPE_BYPASS = true; // TEMP: true = bypass Stripe, go straight to page 3
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── Sync page state ↔ URL ─────────────────────────────────────────────────
  // useSearchParams hook re-renders the component whenever search params change
  // (including when wouter setLocation updates ?page= from the same page)
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam === "2" || pageParam === "3") {
      setPage(parseInt(pageParam) as 2 | 3);
    } else {
      setPage(1);
    }
  }, [searchParams]);

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

  const { type, tier, bigFive, disc, mbtiType, primaryDisc, rawScores, isDemo } = realResults;

  // ─── Auth Guard for Page 2 ───────────────────────────────────────────────────
  // When ?page=2 is in the URL, check auth before rendering. If not authenticated,
  // open the auth modal and reset to page 1 so unauthenticated users can't bypass login.
  useEffect(() => {
    if (VITE_STRIPE_BYPASS) return; // Skip auth guard in bypass mode
    if (isLoading) return;
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    if (pageParam === "2" && !isAuthenticated) {
      setShowAuthModal(true);
      setPage(1);
    }
  }, [isLoading, isAuthenticated]);

  const bottomBarActive = page === 1 ? "p1" : page === 2 ? "p2" : "p3";

  // ─── Auth + Payment Handlers ─────────────────────────────────────────────────

  // Opens the glass auth modal (Google one-click + email fallback)
  // Bypass modal in dev/preview mode — go directly to page 2
  const handleLoginFree = () => {
    if (VITE_STRIPE_BYPASS) {
      setPage(2);
    } else {
      setShowAuthModal(true);
    }
  };

  // Called by AuthModal on successful login — close modal and go to Page 2
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setPage(2);
  };

  // Bottom bar "Full Portrait" click — auth check before navigating to page 2
  const handleFullPortraitClick = () => {
    // Bypass auth in dev/preview mode — go directly to page 2
    if (VITE_STRIPE_BYPASS || isAuthenticated) {
      setPage(2);
    } else {
      setShowAuthModal(true); // open auth modal; on success → page 2 via handleAuthSuccess
    }
  };

  const [premiumError, setPremiumError] = useState<string | null>(null);

  // Premium button - bypass Stripe, go directly to page 3
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

      {page === 1 && <Page1QuickGlimpse type={type} bigFive={bigFive} disc={disc} mbtiType={mbtiType} primaryDisc={primaryDisc} rawScores={rawScores} onLoginFree={handleLoginFree} onPremium={handlePremium} premiumError={premiumError} />}
      {page === 2 && <Page2FullPortrait type={type} bigFive={bigFive} disc={disc} mbtiType={mbtiType} primaryDisc={primaryDisc} />}
      {page === 3 && <Page3PremiumNexus type={type} bigFive={bigFive} disc={disc} mbtiType={mbtiType} primaryDisc={primaryDisc} isDemo={isDemo} />}

      <BottomBar
        active={bottomBarActive}
        onNavigate={setPage}
        onFullPortraitClick={handleFullPortraitClick}
        onPremiumClick={handleBottomBarPremiumClick}
      />

      {/* Auth modal — Google one-click + email fallback */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Site footer — consistent with rest of site */}
      <AppFooter />
    </div>
  );
}
