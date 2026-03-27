import { useState, useEffect } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { isTestMode, getFakeScores, getFakeMBTIType } from "@/utils/devTest";

const TRAITS = [
  { label: "Openness", value: 92, color: "#A78BFA" },
  { label: "Conscientiousness", value: 74, color: "#60A5FA" },
  { label: "Extraversion", value: 61, color: "#34D399" },
  { label: "Agreeableness", value: 55, color: "#34D399" },
  { label: "Neuroticism", value: 68, color: "#F87171" },
];

// Maps MBTI base type to archetype name
function getArchetypeFromMBTI(mbti: string): string {
  const archetypes: Record<string, string> = {
    INTJ: "The Architect", INTP: "The Thinker", ENTJ: "The Commander", ENTP: "The Debater",
    INFJ: "The Advocate", INFP: "The Mediator", ENFJ: "The Protagonist", ENFP: "The Campaigner",
    ISTJ: "The Logistician", ISFJ: "The Defender", ESTJ: "The Executive", ESFJ: "The Consul",
    ISTP: "The Virtuoso", ISFP: "The Adventurer", ESTP: "The Entrepreneur", ESFP: "The Entertainer",
  };
  return archetypes[mbti] || "The Architect";
}

const CAREERS = [
  { title: "Software Architect", match: 94, salary: "$120K – $180K", trend: "↑ 18% growth", desc: "Design systems that scale. Lead technical direction." },
  { title: "Data Scientist", match: 91, salary: "$100K – $160K", trend: "↑ 22% growth", desc: "Find patterns in chaos. Turn data into decisions." },
  { title: "Strategy Consultant", match: 88, salary: "$90K – $150K", trend: "↑ 12% growth", desc: "Shape decisions at the highest levels." },
  { title: "Product Manager", match: 85, salary: "$110K – $170K", trend: "↑ 15% growth", desc: "Bridge technical and human. Ship things that matter." },
];

const GROWTH = [
  { label: "Age 16", text: "Openness scored 78% — already showing strong curiosity and creative thinking." },
  { label: "Age 22", text: "Conscientiousness at 85% — career focus sharpened your discipline." },
  { label: "Age 28", text: "Emotional Stability at 68% — life experience built real resilience." },
  { label: "Today", text: "Pattern shows continued growth in strategic thinking and leadership." },
];

function getMoodDescription(moodBlend: {label: string; emoji: string; mood1: string; mood2: string}): string {
  const { mood1, mood2 } = moodBlend;
  const descriptions: Record<string, string> = {
    "Focused + Creative": "As an INTJ-A shaped by focused creative energy, you blend analytical precision with bold imagination. You're the rare type who can both dream up visionary systems AND engineer them into existence. Ideas don't stay abstract for long in your hands.",
    "Focused + Calm": "Your focused calm gives you the patience of a master strategist. While others rush, you calculate — observing, planning, and executing with quiet precision that unnerves even seasoned professionals.",
    "Creative + Energetic": "A creative-energetic fusion makes you a force of nature. Your ideas spark like electricity and your drive turns inspiration into immediate action. You're not just creative — you're relentlessly productive.",
    "Calm + Curious": "Your calm curiosity makes you a quiet explorer of deep truths. You ask questions others overlook, sit with complexity longer than most, and emerge with insights that reshape how everyone sees things.",
    "Determined + Focused": "Determination meets focus in you like a laser beam. Once you set your sights on a goal, nothing derails you. Your combination of relentless drive and pinpoint focus makes peak performance your baseline.",
    "Social + Creative": "You're the kind of creative who builds things people actually want to be part of. Your social creativity isn't just about connection — it's about co-creation. You lift others' ideas while contributing your own.",
    "Reflective + Determined": "Your reflective determination is a rare superpower — you think deeply before committing, then commit completely. Unlike pure strategists or pure doers, you embody both. Every action has been weighed; every step is intentional.",
    "Curious + Creative": "Your curious creativity makes you a perpetual idea generator. You don't just learn — you extrapolate, combine, and reimagine. The world gives you information; you return it as innovation.",
  };
  const key = moodBlend.label;
  return descriptions[key] || `As an INTJ-A with ${mood1 && mood2 ? `a blend of ${mood1} and ${mood2} energy` : mood1 || mood2 || 'your unique mood blend'}, you're a strategic visionary shaped by distinctive emotional textures. Your combination brings rare depth to your natural analytical brilliance — you see what others miss, feel what drives them, and build accordingly.`;
}

export default function ResultsPage() {
  const [tab, setTab] = useState("Personality");
  const [moodBlend, setMoodBlend] = useState<{label: string; emoji: string; mood1: string; mood2: string} | null>(null);

  // Dev test state
  const [devPage, setDevPage] = useState<1 | 2 | 3>(1);
  const [devPremium, setDevPremium] = useState(false);

  // Fake MBTI type for dev panel — reads from DevPanel's kyr_fake_type if set
  const fakeTier = (typeof window !== "undefined" ? sessionStorage.getItem("kyr_tier") : null) || "25+";
  const storedFakeType = (typeof window !== "undefined" ? sessionStorage.getItem("kyr_fake_type") : null);
  const fakeType = storedFakeType || `${getFakeMBTIType(getFakeScores(fakeTier))}-A`;

  useEffect(() => {
    // Initialize dev state from URL params
    if (isTestMode()) {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get("page");
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (p === 1 || p === 2 || p === 3) setDevPage(p as 1 | 2 | 3);
      }
      const force = params.get("force");
      if (force === "true") setDevPremium(true);
    }

    // ?test=true skips the redirect and uses fake scores
    if (isTestMode()) return;
    const resultsStr = localStorage.getItem("kyr_results");
    if (!resultsStr) {
      const quizAnswers = localStorage.getItem("kyr_quiz_answers");
      if (!quizAnswers) {
        window.location.href = "/quiz";
      }
      return;
    }
    const results = JSON.parse(resultsStr);
    if (results.moodBlend) {
      setMoodBlend(results.moodBlend);
    }
  }, []);

  // When devPage changes, sync the visual tab selection
  useEffect(() => {
    if (isTestMode()) {
      const tabMap: Record<1 | 2 | 3, string> = { 1: "Personality", 2: "Careers", 3: "Growth" };
      setTab(tabMap[devPage]);
    }
  }, [devPage]);

  // Determine active tab: use devPage in test mode, otherwise use the user's tab state
  const activeTab = isTestMode() ? (["Personality", "Careers", "Growth"][devPage - 1] as typeof tab) : tab;

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(255,0,229,0.2); }
          50% { box-shadow: 0 0 25px rgba(255,0,229,0.45); }
        }
      `}</style>

      {/* DEV TEST CONTROL PANEL - DEPRECATED: use DevToolPanel instead */}
      {isTestMode() && (
        <div style={{
          position: "fixed",
          top: 60,
          left: 16,
          zIndex: 1,
          background: "#FFD700",
          color: "#000",
          padding: "12px 16px",
          borderRadius: 12,
          fontFamily: "monospace",
          fontSize: 12,
          fontWeight: 700,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          minWidth: 200,
        }}>
          <div style={{ marginBottom: 8, fontSize: 11 }}>DEV TEST MODE</div>
          <div style={{ marginBottom: 8 }}>Fake: {fakeType} | Tier: {fakeTier}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button onClick={() => setDevPage(1)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: devPage === 1 ? "#7800FF" : "#ccc", color: "#fff", cursor: "pointer" }}>P1</button>
            <button onClick={() => setDevPage(2)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: devPage === 2 ? "#7800FF" : "#ccc", color: "#fff", cursor: "pointer" }}>P2</button>
            <button onClick={() => setDevPage(3)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: devPage === 3 ? "#7800FF" : "#ccc", color: "#fff", cursor: "pointer" }}>P3</button>
          </div>
          <button onClick={() => setDevPremium(p => !p)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: devPremium ? "#39FF14" : "#ccc", color: "#000", cursor: "pointer", fontWeight: 700 }}>
            {devPremium ? "🔓 PREMIUM ON" : "🔒 PREMIUM OFF"}
          </button>
        </div>
      )}

      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 40 }} />
        <span style={{ fontSize: 16, fontWeight: 700 }}>Your Results</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Mood blend banner — hidden in test mode */}
      {!isTestMode() && moodBlend && (
        <div style={{
          paddingTop: 100,
          padding: "100px 24px 0",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,0,229,0.1)",
            border: "1px solid rgba(255,0,229,0.25)",
            borderRadius: 50,
            padding: "8px 20px",
            marginBottom: 20,
            animation: "pulseGlow 3s ease-in-out infinite",
          }}>
            <span style={{ fontSize: "1.4rem" }}>{moodBlend.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#FF00E5", fontFamily: "'Outfit',sans-serif" }}>
              Your Mood Blend: {moodBlend.label}
            </span>
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{ paddingTop: isTestMode() ? 60 : moodBlend ? 0 : 100, paddingBottom: 32, textAlign: "center", padding: `${isTestMode() ? 60 : moodBlend ? 0 : 100}px 24px 32px` }}>
        <div style={{ display: "inline-block", background: "linear-gradient(135deg, #00C8FF, #7800FF)", borderRadius: 20, padding: "4px", marginBottom: 16 }}>
          <div style={{ background: "#050510", borderRadius: 16, padding: "clamp(16px, 4vw, 32px) clamp(24px, 6vw, 48px)" }}>
            <span style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, background: "linear-gradient(135deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Outfit',sans-serif" }}>{fakeType}</span>
          </div>
        </div>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>{getArchetypeFromMBTI(fakeType.split("-")[0])}</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>Strategic, independent, and determined</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 24px", marginBottom: 32, background: "rgba(5,5,16,0.8)", position: "sticky", top: 57, zIndex: 40, paddingTop: 8, paddingBottom: 8 }}>
        {["Personality", "Careers", "Growth"].map(t => (
          <button key={t} onClick={() => {
            setTab(t);
            if (isTestMode()) {
              const map: Record<string, 1 | 2 | 3> = { Personality: 1, Careers: 2, Growth: 3 };
              setDevPage(map[t]);
            }
          }} style={{ flex: 1, padding: "10px", borderRadius: 50, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: activeTab === t ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "rgba(255,255,255,0.05)", color: activeTab === t ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 24px 80px", maxWidth: 800, margin: "0 auto" }}>

        {activeTab === "Personality" && (
          <div>
            <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28, marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#00C8FF", marginBottom: 24, fontFamily: "'Outfit',sans-serif" }}>Big Five Profile</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {TRAITS.map(t => (
                  <div key={t.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>{t.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.color, fontFamily: "'Outfit',sans-serif" }}>{t.value}%</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 50, overflow: "hidden" }}>
                      <div style={{ width: `${t.value}%`, height: "100%", background: t.color, borderRadius: 50, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>Your Personality Type</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontFamily: "'Outfit',sans-serif" }}>
                {moodBlend ? getMoodDescription(moodBlend) : "As an INTJ-A, you're a strategic visionary with a rare combination of analytical brilliance and quiet confidence. You see patterns others miss, question assumptions, and quietly build systems and visions that reshape the world around you."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "Careers" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, fontFamily: "'Outfit',sans-serif" }}>Dream Roles</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {CAREERS.map(c => (
                <div key={c.title} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{c.title}</h3>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 50, background: c.match >= 90 ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "rgba(0,200,255,0.15)", color: c.match >= 90 ? "#fff" : "#00C8FF", fontFamily: "'Outfit',sans-serif" }}>{c.match}%</span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>{c.salary}</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 8, lineHeight: 1.5, fontFamily: "'Outfit',sans-serif" }}>{c.desc}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#39FF14", fontFamily: "'Outfit',sans-serif" }}>{c.trend}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Growth" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, fontFamily: "'Outfit',sans-serif" }}>Your Growth Journey</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {GROWTH.map((g, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 24 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00C8FF", marginTop: 6, flexShrink: 0, boxShadow: "0 0 8px #00C8FF" }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#00C8FF", marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>{g.label}</p>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontFamily: "'Outfit',sans-serif" }}>{g.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium upsell — shown in test mode based on devPremium, otherwise always shown */}
        {(!isTestMode() || !devPremium) && (
          <div style={{ marginTop: 40, borderRadius: 24, padding: "2px", background: "linear-gradient(135deg, #00C8FF, #7800FF)" }}>
            <div style={{ background: "#050510", borderRadius: 22, padding: 32, textAlign: "center" }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>Unlock Your Full Report</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24, fontFamily: "'Outfit',sans-serif" }}>Deep dive into your personality with premium insights</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
                {["50-page personality report", "Relationship compatibility analysis", "Career path deep dive", "Personal growth action plan", "Shareable PDF report"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit',sans-serif" }}>
                    <span style={{ color: "#39FF14", fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>$9.99</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>/month</span>
              </div>
              <button style={{ width: "100%", padding: "16px", background: "#39FF14", border: "none", borderRadius: 16, color: "#000", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 30px rgba(57,255,20,0.4)" }}>
                Start Free Trial →
              </button>
            </div>
          </div>
        )}

        {/* Premium unlocked placeholder — shown when devPremium is true in test mode */}
        {isTestMode() && devPremium && (
          <div style={{ marginTop: 40, borderRadius: 24, padding: "2px", background: "linear-gradient(135deg, #39FF14, #00C8FF)", opacity: 0.5 }}>
            <div style={{ background: "#050510", borderRadius: 22, padding: 32, textAlign: "center" }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#39FF14", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>✅ Premium Unlocked</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>Full report content would appear here when premium is active.</p>
            </div>
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
}
