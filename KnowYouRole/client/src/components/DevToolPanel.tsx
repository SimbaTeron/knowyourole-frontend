import { useState } from "react";
import { useLocation } from "wouter";
import { isTestMode, getConsistentFakeScores, getFakeScores } from "@/utils/devTest";

const TIER_OPTIONS = [
  { id: "25+", label: "Adults 25+" },
  { id: "19-25", label: "Young Adults 18-25" },
  { id: "13-18", label: "Youth 12-17" },
  { id: "7-12", label: "Kids 12 & Under" },
];

const PAGE_OPTIONS = [
  { path: "/", label: "0. Home", desc: "Landing page" },
  { path: "/quiz/gateway", label: "1. Quiz Gateway", desc: "Age tier selection screen" },
  { path: "/mood-mixer", label: "2. Mood Mixer", desc: "Pick your mood blend" },
  { path: "/quiz/questions", label: "3. Quiz Questions", desc: "Answer 40 personality questions" },
  { path: "/results", label: "4. Results Page", desc: "See your personality results" },
  { path: "/auth", label: "Auth Login", desc: "Login/signup page" },
  { path: "/about", label: "About Page", desc: "About KnowYourRole" },
  { path: "/faq", label: "FAQ Page", desc: "Frequently asked questions" },
  { path: "/careers", label: "Careers Page", desc: "Career matching" },
  { path: "/profile", label: "Profile Page", desc: "User profile" },
  { path: "/privacy", label: "Privacy Policy", desc: "Privacy policy" },
  { path: "/terms", label: "Terms of Service", desc: "Terms of service" },
  { path: "/checkout-success", label: "Checkout Success", desc: "Payment success page" },
  { path: "/checkout-cancel", label: "Checkout Cancel", desc: "Payment cancelled page" },
];

const MBTI_TYPES = ["INTJ", "ENTJ", "INTP", "ENTP", "INFJ", "ENFJ", "INFP", "ENFP", "ISTJ", "ESTJ", "ISFJ", "ESFJ", "ISTP", "ESTP", "ISFP", "ESFP"];
const DISC_TYPES = ["D", "I", "S", "C", "DI", "IS", "SC", "DS"];

export default function DevToolPanel() {
  // Read stored fake data on mount so the selector always matches what's loaded
  // (survives full page reloads from window.location.assign)
  const [selectedTier, setSelectedTier] = useState(
    typeof window !== "undefined" ? (sessionStorage.getItem("kyr_tier") || "25+") : "25+"
  );
  const [selectedMBTI, setSelectedMBTI] = useState(
    typeof window !== "undefined" ? (sessionStorage.getItem("kyr_fake_mbti") || "INTJ") : "INTJ"
  );
  const [expanded, setExpanded] = useState(true);
  const [, setLocation] = useLocation();

  // Only show on localhost test mode
  if (!isTestMode()) return null;

  const writeFakeData = (tier: string, mbti: string) => {
    const fakeScores = getFakeScores(tier, mbti);
    sessionStorage.setItem("kyr_tier", tier);
    sessionStorage.setItem("kyr_fake_scores", JSON.stringify(fakeScores));
    sessionStorage.setItem("kyr_fake_mbti", mbti); // Store MBTI override for useRealResults
    sessionStorage.setItem("kyr_fake_type", mbti + "-A");
    sessionStorage.setItem("knowrole-tier", tier);
    sessionStorage.setItem("knowrole-fake-scores", JSON.stringify(fakeScores));
  };

  const handleNavigate = (path: string) => {
    writeFakeData(selectedTier, selectedMBTI);
    setLocation(path);
  };

  const handleRandomize = () => {
    const randomMBTI = MBTI_TYPES[Math.floor(Math.random() * MBTI_TYPES.length)];

    setSelectedTier("25+");
    setSelectedMBTI(randomMBTI);

    // Use getFakeScores so stored data exactly matches what useRealResults generates:
    // getFakeScores now calls getConsistentFakeScores internally when MBTI is forced,
    // ensuring stored scores and page-derived scores are always identical.
    const fakeScores = getFakeScores("25+", randomMBTI);

    sessionStorage.setItem("kyr_tier", "25+");
    sessionStorage.setItem("kyr_fake_scores", JSON.stringify(fakeScores));
    sessionStorage.setItem("kyr_fake_mbti", randomMBTI);
    sessionStorage.setItem("kyr_fake_type", randomMBTI + "-A");
    sessionStorage.setItem("knowrole-tier", "25+");
    sessionStorage.setItem("knowrole-fake-scores", JSON.stringify(fakeScores));
    sessionStorage.setItem("knowrole-randomized", "true");

    // Navigate to results page — always land on page 1
    setLocation("/results?test=true&page=1");
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
      maxHeight: "95vh",
      overflowY: "auto",
    }}>
      {/* Header bar */}
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
          position: "sticky",
          top: 0,
        }}
      >
        <span>🛠️ DEV TOOL</span>
        <span style={{ fontSize: 14 }}>{expanded ? "−" : "+"}</span>
      </div>

      {expanded && (
        <div style={{ padding: 12 }}>
          {/* Current page indicator */}
          <div style={{ background: "#0d0d1a", borderRadius: 6, padding: "6px 10px", marginBottom: 12 }}>
            <div style={{ color: "#888", fontSize: 9, marginBottom: 2 }}>CURRENT PAGE</div>
            <div style={{ color: "#00C8FF", fontWeight: 700, fontSize: 12 }}>{currentPath || "/"}</div>
            <div style={{ color: "#666", fontSize: 9, marginTop: 2 }}>Test Mode Active</div>
          </div>

          {/* NAVIGATE */}
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
                    padding: "5px 8px",
                    color: currentPath === opt.path ? "#00C8FF" : "#ccc",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 10,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{opt.label}</div>
                  <div style={{ color: "#666", fontSize: 8, marginTop: 1 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* FAKE DATA */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 10, marginBottom: 6, letterSpacing: "0.1em" }}>⚙ FAKE DATA</div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#888", fontSize: 9, marginBottom: 4 }}>TIER</div>
              <select
                value={selectedTier}
                onChange={e => { setSelectedTier(e.target.value); writeFakeData(e.target.value, selectedMBTI); }}
                style={{
                  width: "100%",
                  background: "#0d0d1a",
                  color: "#00C8FF",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "5px 8px",
                  fontSize: 10,
                  fontFamily: "'Courier New', monospace",
                  cursor: "pointer",
                }}
              >
                {TIER_OPTIONS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#888", fontSize: 9, marginBottom: 4 }}>MBTI TYPE</div>
              <select
                value={selectedMBTI}
                onChange={e => { setSelectedMBTI(e.target.value); writeFakeData(selectedTier, e.target.value); }}
                style={{
                  width: "100%",
                  background: "#0d0d1a",
                  color: "#00C8FF",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "5px 8px",
                  fontSize: 10,
                  fontFamily: "'Courier New', monospace",
                  cursor: "pointer",
                }}
              >
                {MBTI_TYPES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ color: "#555", fontSize: 8, textAlign: "center" }}>
              Tier + MBTI selectors write to sessionStorage immediately on change
            </div>
          </div>

          {/* RANDOMISE */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 10, marginBottom: 6, letterSpacing: "0.1em" }}>🎲 RANDOMISE</div>
            <button
              onClick={handleRandomize}
              style={{
                width: "100%",
                padding: "10px",
                background: "#00C8FF",
                border: "none",
                borderRadius: 8,
                color: "#000",
                fontWeight: 900,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.05em",
              }}
          <button onClick={handleRandomize} className="dev-randomize-btn" title="Randomizes MBTI, DISC, Big Five, and career on the results pages — for dev preview only">
            🎲 Randomize Results Pages Data
          </button>
          <div style={{ color: "#555", fontSize: 8, marginTop: 4, textAlign: "center" }}>
            Randomizes MBTI, DISC, Big Five & career on results pages
          </div>
          </div>

          {/* QUICK JUMP */}
          <div>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 10, marginBottom: 6, letterSpacing: "0.1em" }}>⚡ QUICK JUMP</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { label: "Results P1", path: "/results?page=1&test=true" },
                { label: "Results P2", path: "/results?page=2&test=true" },
                { label: "Results P3", path: "/results?page=3&test=true" },
                { label: "Auth Page", path: "/auth?test=true" },
                { label: "Home", path: "/?test=true" },
                { label: "Careers", path: "/careers?test=true" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { writeFakeData(selectedTier, selectedMBTI); setLocation(item.path); }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    padding: "6px 8px",
                    color: "#ccc",
                    fontSize: 9,
                    cursor: "pointer",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
