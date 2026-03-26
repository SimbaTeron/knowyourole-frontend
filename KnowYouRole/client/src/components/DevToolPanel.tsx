import { useState, useEffect } from "react";
import { isTestMode, getFakeScores, getFakeMBTIType } from "@/utils/devTest";

const TIER_OPTIONS = [
  { id: "25+", label: "Adults 25+" },
  { id: "19-25", label: "Young Adults 18-25" },
  { id: "13-18", label: "Youth 12-17" },
  { id: "7-12", label: "Kids 12 & Under" },
];

const PAGE_OPTIONS = [
  { path: "/quiz-gateway", label: "1. Quiz Gateway", desc: "Age tier selection screen" },
  { path: "/mood-mixer", label: "2. Mood Mixer", desc: "Pick your mood blend" },
  { path: "/quiz/questions", label: "3. Quiz Questions", desc: "Answer 40 personality questions" },
  { path: "/results", label: "4. Results Page", desc: "See your personality results" },
  { path: "/auth", label: "Auth Login", desc: "Login/signup page" },
  { path: "/about", label: "About Page", desc: "About KnowYouRole" },
  { path: "/faq", label: "FAQ Page", desc: "Frequently asked questions" },
];

const MBTI_TYPES = ["INTJ", "ENTJ", "INTP", "ENTP", "INFJ", "ENFJ", "INFP", "ENFP", "ISTJ", "ESTJ", "ISFJ", "ESFJ", "ISTP", "ESTP", "ISFP", "ESFP"];
const DISC_TYPES = ["D", "I", "S", "C", "DI", "IS", "SC", "DS"];

export default function DevToolPanel() {
  const [selectedTier, setSelectedTier] = useState("25+");
  const [selectedMBTI, setSelectedMBTI] = useState("INTJ");
  const [expanded, setExpanded] = useState(true);

  // Only show on localhost test mode
  if (!isTestMode()) return null;

  const handleNavigate = (path: string) => {
    // Set fake data in sessionStorage before navigating
    sessionStorage.setItem("knowrole-tier", selectedTier);
    const fakeScores = getFakeScores(selectedTier);
    // Override MBTI in the fake scores
    const scoresWithMBTI = { ...fakeScores, mbti: selectedMBTI };
    sessionStorage.setItem("knowrole-fake-scores", JSON.stringify(scoresWithMBTI));
    window.location.href = path + "?test=true";
  };

  const handleRandomize = () => {
    // Random tier
    const randomTier = TIER_OPTIONS[Math.floor(Math.random() * TIER_OPTIONS.length)].id;
    // Random MBTI
    const randomMBTI = MBTI_TYPES[Math.floor(Math.random() * MBTI_TYPES.length)];
    // Random DISC
    const randomDISC = DISC_TYPES[Math.floor(Math.random() * DISC_TYPES.length)];
    // Random Big Five
    const randomBigFive = {
      O: Math.floor(Math.random() * 40) + 60,  // 60-100
      C: Math.floor(Math.random() * 40) + 60,
      E: Math.floor(Math.random() * 40) + 60,
      A: Math.floor(Math.random() * 40) + 60,
      N: Math.floor(Math.random() * 40) + 60,
    };
    
    setSelectedTier(randomTier);
    setSelectedMBTI(randomMBTI);
    
    const fakeScores = getFakeScores(randomTier);
    const randomizedScores = {
      ...fakeScores,
      mbti: randomMBTI,
      disc: randomDISC,
      bigFive: randomBigFive,
    };
    
    sessionStorage.setItem("knowrole-tier", randomTier);
    sessionStorage.setItem("knowrole-fake-scores", JSON.stringify(randomizedScores));
    sessionStorage.setItem("knowrole-randomized", "true");
    
    // Reload current page with new fake data
    window.location.reload();
  };

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <div style={{
      position: "fixed",
      top: 10,
      left: 10,
      zIndex: 99999,
      width: expanded ? 340 : 48,
      background: "#1a1a2e",
      border: "2px solid #FFD700",
      borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
      fontFamily: "'Courier New', monospace",
      fontSize: 11,
      color: "#fff",
      overflow: "hidden",
      transition: "width 0.2s ease",
    }}>
      {/* Header bar - click to collapse/expand */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "#FFD700",
          color: "#000",
          padding: "8px 12px",
          cursor: "pointer",
          fontWeight: 900,
          fontSize: 11,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>🛠️ DEV TOOL</span>
        <span style={{fontSize: 14}}>{expanded ? "−" : "+"}</span>
      </div>

      {expanded && (
        <div style={{ padding: 12 }}>
          {/* Current page indicator */}
          <div style={{ background: "#0d0d1a", borderRadius: 6, padding: "6px 10px", marginBottom: 12 }}>
            <div style={{ color: "#888", fontSize: 9, marginBottom: 2 }}>CURRENT PAGE</div>
            <div style={{ color: "#00C8FF", fontWeight: 700, fontSize: 12 }}>{currentPath || "/"}</div>
            <div style={{ color: "#666", fontSize: 9, marginTop: 2 }}>Test Mode Active</div>
          </div>

          {/* NAVIGATE SECTION */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 10, marginBottom: 6, letterSpacing: "0.1em" }}>▶ NAVIGATE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {PAGE_OPTIONS.map(opt => (
                <button
                  key={opt.path}
                  onClick={() => handleNavigate(opt.path)}
                  style={{
                    background: currentPath === opt.path ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${currentPath === opt.path ? "#00C8FF" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 6,
                    padding: "6px 8px",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: currentPath === opt.path ? "#00C8FF" : "#ccc" }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 9, color: "#666", marginTop: 1 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* FAKE DATA SECTION */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 10, marginBottom: 6, letterSpacing: "0.1em" }}>⚙️ FAKE DATA</div>
            
            {/* Tier selector */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ color: "#888", fontSize: 9, marginBottom: 3 }}>TIER</div>
              <select
                value={selectedTier}
                onChange={e => setSelectedTier(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0d0d1a",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  color: "#fff",
                  padding: "4px 6px",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              >
                {TIER_OPTIONS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* MBTI selector */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ color: "#888", fontSize: 9, marginBottom: 3 }}>MBTI TYPE</div>
              <select
                value={selectedMBTI}
                onChange={e => setSelectedMBTI(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0d0d1a",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  color: "#00C8FF",
                  padding: "4px 6px",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              >
                {MBTI_TYPES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* RANDOMIZE SECTION */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 10, marginBottom: 6, letterSpacing: "0.1em" }}>🎲 RANDOMIZE</div>
            <button
              onClick={handleRandomize}
              style={{
                width: "100%",
                padding: "10px",
                background: "linear-gradient(135deg, #7800FF, #00C8FF)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontWeight: 900,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              🎲 RANDOMIZE ALL DATA
            </button>
            <div style={{ color: "#666", fontSize: 9, marginTop: 4, textAlign: "center" }}>
              Picks random tier + MBTI + DISC + Big Five
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 10, marginBottom: 6, letterSpacing: "0.1em" }}>🔗 QUICK JUMP</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <button
                onClick={() => handleNavigate("/results")}
                style={{ padding: "6px", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#ccc", cursor: "pointer", fontSize: 9 }}
              >
                Results P1
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem("knowrole-tier", selectedTier);
                  window.location.href = "/results?test=true&page=2";
                }}
                style={{ padding: "6px", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#ccc", cursor: "pointer", fontSize: 9 }}
              >
                Results P2
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem("knowrole-tier", selectedTier);
                  window.location.href = "/results?test=true&page=3&force=true";
                }}
                style={{ padding: "6px", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#ccc", cursor: "pointer", fontSize: 9 }}
              >
                Results P3
              </button>
              <button
                onClick={() => handleNavigate("/auth")}
                style={{ padding: "6px", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#ccc", cursor: "pointer", fontSize: 9 }}
              >
                Auth Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
