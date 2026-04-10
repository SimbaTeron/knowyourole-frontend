import { useState } from "react";
import { isTestMode, getFakeScores, getFakeMBTIType } from "../utils/devTest";

const TIER_OPTIONS = [
  { id: "25+", label: "Adults 25+" },
  { id: "19-25", label: "Young Adults 18-25" },
  { id: "13-18", label: "Youth 12-17" },
  { id: "7-12", label: "Kids 12 & Under" },
];

const PAGE_OPTIONS = [
    { id: "0", label: "Home", path: "/" },
    { id: "1", label: "Quiz Gateway", path: "/quiz" },
    { id: "2", label: "Mood Mixer", path: "/mood-mixer" },
    { id: "3", label: "Quiz Questions", path: "/quiz/questions" },
    { id: "4", label: "Results Page", path: "/results" },
    { id: "5", label: "Auth Login", path: "/auth" },
    { id: "6", label: "About Page", path: "/about" },
    { id: "7", label: "FAQ Page", path: "/faq" },
    { id: "8", label: "Careers Page", path: "/careers" },
    { id: "9", label: "Profile Page", path: "/profile" },
    { id: "10", label: "Privacy Policy", path: "/privacy" },
    { id: "11", label: "Terms of Service", path: "/terms" },
    { id: "12", label: "Checkout Success", path: "/checkout-success" },
    { id: "13", label: "Checkout Cancel", path: "/checkout-cancel" },
];

const MBTI_TYPES = ["INTJ", "ENTJ", "INTP", "ENTP", "INFJ", "ENFJ", "INFP", "ENFP", "ISTJ", "ESTJ", "ISFJ", "ESFJ", "ISTP", "ESTP", "ISFP", "ESFP"];

export default function DevToolPanel() {
  const [selectedTier, setSelectedTier] = useState("25+");
  const [selectedMBTI, setSelectedMBTI] = useState("INTJ");
  const [expanded, setExpanded] = useState(true);

  if (!isTestMode()) return null;

  const writeFakeData = (tier: string, mbti: string) => {
    const fakeScores = getFakeScores(tier, mbti);
    sessionStorage.setItem("kyr_tier", tier);
    sessionStorage.setItem("kyr_fake_scores", JSON.stringify(fakeScores));
    sessionStorage.setItem("kyr_fake_mbti", mbti);
    sessionStorage.setItem("kyr_fake_type", mbti + "-A");
    sessionStorage.setItem("knowrole-tier", tier);
// TODO(Stripe): Remove orphan key — this is written but never read anywhere
// sessionStorage.setItem("knowrole-fake-scores", JSON.stringify(fakeScores));
// NOTE: DevToolPanel intentionally writes kyr_tier, kyr_fake_scores, kyr_fake_mbti, and kyr_fake_type
// for dev/test override. kyr_real_scores is the production key written by the real quiz.
  };

  const handleNavigate = (path: string) => {
    writeFakeData(selectedTier, selectedMBTI);

    // Map DevToolPanel tier format to URL format
    const tierMap: Record<string, string> = {
      "25+": "25plus",
      "19-25": "19-25",
      "13-18": "13-18",
      "7-12": "7-12",
    };
    const urlTier = tierMap[selectedTier] || selectedTier;

    if (path === "/results") {
      // Results reads ?tier= and ?page= from URL, plus kyr_fake_mbti from sessionStorage
      window.location.assign(`${path}?test=true&tier=${encodeURIComponent(urlTier)}`);
    } else if (path === "/quiz") {
      // Quiz gateway reads ?tier= from URL
      window.location.assign(`${path}?tier=${encodeURIComponent(selectedTier)}`);
    } else {
      window.location.assign(path + "?test=true");
    }
  };

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <div style={{
      position: "fixed", top: 10, left: 10, zIndex: 99999,
      width: expanded ? 255 : 36, background: "#1a1a2e",
      border: "2px solid #FFD700", borderRadius: 9,
      boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
      fontFamily: "'Courier New', monospace", fontSize: 11, color: "#fff",
      overflow: "hidden", transition: "width 0.2s ease",
      maxHeight: "95vh", overflowY: "auto",
    }}>
      <div onClick={() => setExpanded(!expanded)} style={{ background: "#FFD700", color: "#000", padding: "8px 12px", cursor: "pointer", fontWeight: 900, fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
        <span>🛠️ DEV TOOL</span>
        <span style={{ fontSize: 14 }}>{expanded ? "−" : "+"}</span>
      </div>
      {expanded && (
        <div style={{ padding: 12 }}>
          <div style={{ background: "#0d0d1a", borderRadius: 6, padding: "6px 10px", marginBottom: 12 }}>
            <div style={{ color: "#888", fontSize: 9, marginBottom: 2 }}>CURRENT PAGE</div>
            <div style={{ color: "#00C8FF", fontWeight: 700, fontSize: 12 }}>{currentPath || "/"}</div>
          </div>
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
                    borderRadius: 6, padding: "5px 8px", color: currentPath === opt.path ? "#00C8FF" : "#ccc", cursor: "pointer", textAlign: "left", fontSize: 10, fontFamily: "'Courier New', monospace",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
