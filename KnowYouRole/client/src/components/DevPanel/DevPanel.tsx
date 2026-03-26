import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { isTestMode, getFakeScores } from "@/utils/devTest";
import { StateInspectorSection, ErrorInjectionSection, ViewportThemeSection, ResultsSharingSection } from "./Sections";
import { PerformanceSection, UtilitiesSection } from "./Sections2";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthState = "logged_out" | "logged_in_free" | "logged_in_premium";

interface MbtiSliders {
  E: number; // E=0 means full I, E=100 means full E
  S: number; // S=0 means full N, S=100 means full S
  T: number; // T=0 means full F, T=100 means full T
  J: number; // J=0 means full P, J=100 means full J
}

// ─── Accordion Shell ──────────────────────────────────────────────────────────

function AccordionSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: "1px solid #333" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 12px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: open ? "#252525" : "transparent",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#d4d4d4" }}>
          {icon} {title}
        </span>
        <span style={{ color: "#666", fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div style={{ padding: "8px 12px" }}>{children}</div>}
    </div>
  );
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  padding: "5px 10px",
  background: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: 6,
  color: "#d4d4d4",
  cursor: "pointer",
  fontSize: 11,
  fontFamily: "monospace",
};

const btnActiveStyle: React.CSSProperties = {
  ...btnStyle,
  background: "#007acc",
  border: "1px solid #007acc",
  color: "#fff",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#888",
  letterSpacing: "0.08em",
  marginBottom: 6,
  textTransform: "uppercase",
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 6,
  alignItems: "center",
  marginBottom: 6,
  flexWrap: "wrap",
};

// ─── Section 1: Quick Navigation ─────────────────────────────────────────────

function QuickNavSection({
  autoSeed,
  setAutoSeed,
}: {
  autoSeed: boolean;
  setAutoSeed: (v: boolean) => void;
}) {
  const [jumpNum, setJumpNum] = useState("1");
  const [selectedTier, setSelectedTier] = useState("25+");

  const TIER_OPTIONS = [
    { id: "25+", label: "Adults 25+" },
    { id: "19-25", label: "Young Adults 18-25" },
    { id: "13-18", label: "Youth 12-17" },
    { id: "7-12", label: "Kids 12 & Under" },
  ];

  const navButtons: { path: string; label: string }[] = [
    { path: "/quiz-gateway", label: "1. Quiz Gateway" },
    { path: "/mood-mixer", label: "2. Mood Mixer" },
    { path: "/quiz/questions", label: "3. Quiz Questions" },
    { path: "/results?test=true&page=1", label: "4. Results P1" },
    { path: "/results?test=true&page=2", label: "5. Results P2" },
    { path: "/results?test=true&page=3&force=true", label: "6. Results P3 🔓" },
    { path: "/auth", label: "7. Auth Page" },
  ];

  const handleNav = (path: string) => {
    if (autoSeed) {
      sessionStorage.setItem("knowrole-tier", selectedTier);
      const fakeScores = getFakeScores(selectedTier);
      sessionStorage.setItem("knowrole-fake-scores", JSON.stringify(fakeScores));
    }
    window.location.href = path;
  };

  return (
    <div>
      {/* Auto-seed toggle */}
      <div style={sectionLabel}>Auto-Seed with Fake Data</div>
      <div style={{ ...row, marginBottom: 10 }}>
        <label
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={autoSeed}
            onChange={(e) => setAutoSeed(e.target.checked)}
          />
          <span style={{ fontSize: 11, color: "#d4d4d4" }}>
            Auto-fill fake data on navigation
          </span>
        </label>
      </div>

      {/* Tier selector for auto-seed */}
      {autoSeed && (
        <div style={{ marginBottom: 10 }}>
          <div style={sectionLabel}>Tier for Auto-Seed</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {TIER_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                style={
                  selectedTier === t.id ? btnActiveStyle : btnStyle
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={sectionLabel}>Quick Routes</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navButtons.map((b) => (
          <button
            key={b.path}
            onClick={() => handleNav(b.path)}
            style={{
              ...btnStyle,
              width: "100%",
              textAlign: "left",
              padding: "7px 10px",
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Question jumper */}
      <div style={{ marginTop: 12 }}>
        <div style={sectionLabel}>Jump to Question</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="number"
            min={1}
            max={40}
            value={jumpNum}
            onChange={(e) =>
              setJumpNum(
                String(Math.min(40, Math.max(1, parseInt(e.target.value) || 1)))
              )
            }
            style={{
              width: 60,
              padding: "5px 8px",
              background: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: 6,
              color: "#d4d4d4",
              fontSize: 11,
              fontFamily: "monospace",
            }}
          />
          <button
            onClick={() => {
              const q = Math.min(40, Math.max(1, parseInt(jumpNum) || 1));
              sessionStorage.setItem("knowrole-jump-to-question", String(q));
              window.location.href = "/quiz/questions";
            }}
            style={{ ...btnStyle, padding: "5px 12px" }}
          >
            Go to Question {jumpNum}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Auth Simulator ───────────────────────────────────────────────

function AuthSimulatorSection() {
  const [authState, setAuthState] = useState<AuthState>("logged_out");
  const [userName, setUserName] = useState("Alex Morgan");
  const [userEmail, setUserEmail] = useState("alex.morgan@example.com");

  const tierDisplay: Record<AuthState, string> = {
    logged_out: "—",
    logged_in_free: "Free",
    logged_in_premium: "Premium",
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("knowrole-auth-state") as AuthState | null;
    if (stored) setAuthState(stored);
  }, []);

  const applyAuth = (state: AuthState) => {
    setAuthState(state);
    sessionStorage.setItem("knowrole-auth-state", state);
  };

  // Fake decoded JWT payload
  const fakeTokenPayload = {
    sub: "usr_7x9k2mNpQr",
    email: userEmail,
    name: userName,
    tier: tierDisplay[authState].toLowerCase(),
    iat: Math.floor(Date.now() / 1000) - 3600,
    exp: Math.floor(Date.now() / 1000) + 86400,
    iss: "knowyourrole.app",
    ver: "HS256",
  };

  return (
    <div>
      {/* Auth state buttons */}
      <div style={sectionLabel}>Auth State</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {(
          [
            { val: "logged_out" as AuthState, label: "Logged Out" },
            { val: "logged_in_free" as AuthState, label: "Logged In (Free)" },
            { val: "logged_in_premium" as AuthState, label: "Logged In (Premium)" },
          ]
        ).map((opt) => (
          <button
            key={opt.val}
            onClick={() => applyAuth(opt.val)}
            style={authState === opt.val ? btnActiveStyle : btnStyle}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Mock user editor — shown when logged in */}
      {authState !== "logged_out" && (
        <div style={{ marginBottom: 10 }}>
          <div style={sectionLabel}>Mock User</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div>
              <div style={{ fontSize: 10, color: "#666", marginBottom: 2 }}>Name</div>
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px 8px",
                  background: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: 6,
                  color: "#d4d4d4",
                  fontSize: 11,
                  fontFamily: "monospace",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#666", marginBottom: 2 }}>Email</div>
              <input
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px 8px",
                  background: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: 6,
                  color: "#d4d4d4",
                  fontSize: 11,
                  fontFamily: "monospace",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#666" }}>Tier:</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color:
                    authState === "logged_in_premium"
                      ? "#FFD700"
                      : "#d4d4d4",
                }}
              >
                {tierDisplay[authState]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Token inspector */}
      {authState !== "logged_out" && (
        <div style={{ marginBottom: 10 }}>
          <div style={sectionLabel}>Token (Decoded Payload)</div>
          <pre
            style={{
              background: "#0d0d1a",
              border: "1px solid #333",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 10,
              color: "#00C8FF",
              overflowX: "auto",
              margin: 0,
              fontFamily: "monospace",
            }}
          >
            {JSON.stringify(fakeTokenPayload, null, 2)}
          </pre>
          <button
            onClick={() => {
              const token =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                btoa(JSON.stringify(fakeTokenPayload)) +
                ".fake_signature";
              navigator.clipboard.writeText(token).catch(() => {});
            }}
            style={{ ...btnStyle, marginTop: 6, width: "100%" }}
          >
            📋 Copy Token
          </button>
        </div>
      )}

      {/* Auth flow */}
      <div>
        <div style={sectionLabel}>Auth Flow</div>
        <button
          onClick={() => {
            sessionStorage.removeItem("knowrole-auth-state");
            window.location.href = "/auth";
          }}
          style={{
            ...btnStyle,
            width: "100%",
            padding: "7px",
            background: "#3a1a1a",
            border: "1px solid #c0392b",
            color: "#ff6b6b",
          }}
        >
          🚪 Trigger Logout → /auth
        </button>
      </div>
    </div>
  );
}

// ─── Section 3: Fake Data Generator ──────────────────────────────────────────

function FakeDataGeneratorSection() {
  const [tier, setTier] = useState("25+");
  const [autoSeed, setAutoSeed] = useState(false);

  // MBTI sliders: 0 = left letter (e.g. I), 100 = right letter (e.g. E)
  const [sliders, setSliders] = useState<MbtiSliders>({ E: 30, S: 50, T: 60, J: 70 });

  const TIER_OPTIONS = [
    { id: "25+", label: "Adults 25+" },
    { id: "19-25", label: "Young Adults 18-25" },
    { id: "13-18", label: "Youth 12-17" },
    { id: "7-12", label: "Kids 12 & Under" },
  ];

  // Live MBTI type preview from sliders
  const previewMBTI = [
    sliders.E >= 50 ? "E" : "I",
    sliders.S >= 50 ? "S" : "N",
    sliders.T >= 50 ? "T" : "F",
    sliders.J >= 50 ? "J" : "P",
  ].join("");

  const randomBetween = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const setSlider = (key: keyof MbtiSliders, val: number) => {
    setSliders((prev) => ({ ...prev, [key]: val }));
  };

  const applyScores = (scores: { E: number; I: number; N: number; S: number; T: number; F: number; J: number; P: number }) => {
    sessionStorage.setItem("knowrole-tier", tier);
    const fake = getFakeScores(tier);
    const combined = { ...fake, mbti: scores };
    sessionStorage.setItem("knowrole-fake-scores", JSON.stringify(combined));
    // Also update slider UI
    setSliders({ E: scores.E, S: scores.N, T: scores.T, J: scores.J });
  };

  // Slider format: {E: 0-100, S: 0-100, T: 0-100, J: 0-100}
  // Value >= 50 = right letter (E/I/N/F/P), < 50 = left letter (I/S/T/J)
  // To get slider from pair: dominant_score / (dominant + recessive) * 100
  const randomScores = () => {
    // Random MBTI: pick a dominant letter for each pair
    const pick = (a: number, b: number) => (Math.random() < 0.5 ? a : b);
    const dominantE = pick(randomBetween(55, 95), randomBetween(5, 45));
    const dominantS = pick(randomBetween(55, 95), randomBetween(5, 45));
    const dominantT = pick(randomBetween(55, 95), randomBetween(5, 45));
    const dominantJ = pick(randomBetween(55, 95), randomBetween(5, 45));
    return {
      E: dominantE,
      I: 100 - dominantE,
      S: dominantS,
      N: 100 - dominantS,
      T: dominantT,
      F: 100 - dominantT,
      J: dominantJ,
      P: 100 - dominantJ,
    };
  };

  const extremeScores = () => ({
    E: 90, I: 10, N: 90, S: 10, T: 90, F: 10, J: 90, P: 10,
  });

  const neutralScores = () => ({
    E: 50, I: 50, N: 50, S: 50, T: 50, F: 50, J: 50, P: 50,
  });

  // Seed all 40 questions as answered
  const seedAllQuestions = () => {
    const answered = Array.from({ length: 40 }, (_, i) => ({
      questionId: i + 1,
      response: i % 2,
      time: 4000 + Math.random() * 3000,
    }));
    sessionStorage.setItem("knowrole-quiz-progress", JSON.stringify(answered));
  };

  const resetQuizProgress = () => {
    sessionStorage.removeItem("knowrole-quiz-progress");
  };

  const setRandomMood = () => {
    const moods = ["energetic", "calm", "melancholic", "euphoric", "anxious", "serene"];
    const weights = [0.3, 0.3, 0.15, 0.15, 0.05, 0.05];
    let r = Math.random();
    let selected = moods[0];
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        selected = moods[i];
        break;
      }
    }
    const blend = {
      primary: selected,
      intensity: Math.floor(Math.random() * 100),
      secondary: moods[Math.floor(Math.random() * moods.length)],
    };
    sessionStorage.setItem("knowrole-mood", JSON.stringify(blend));
  };

  return (
    <div>
      {/* Tier selector */}
      <div style={sectionLabel}>Target Tier</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {TIER_OPTIONS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTier(t.id)}
            style={tier === t.id ? btnActiveStyle : btnStyle}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Score generators */}
      <div style={sectionLabel}>Score Generators</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
        <button
          onClick={() => applyScores(randomScores())}
          style={{ ...btnStyle, width: "100%", padding: "7px" }}
        >
          🎲 Random Scores
        </button>
        <button
          onClick={() => applyScores(extremeScores())}
          style={{ ...btnStyle, width: "100%", padding: "7px" }}
        >
          ⚡ Extreme Scores (90/10 splits)
        </button>
        <button
          onClick={() => applyScores(neutralScores())}
          style={{ ...btnStyle, width: "100%", padding: "7px" }}
        >
          ➖ Neutral Scores (50/50)
        </button>
        <button
          onClick={() => {
            const fake = getFakeScores(tier);
            sessionStorage.setItem("knowrole-tier", tier);
            sessionStorage.setItem("knowrole-fake-scores", JSON.stringify(fake));
          }}
          style={{ ...btnStyle, width: "100%", padding: "7px", background: "#1a2a3a", border: "1px solid #007acc" }}
        >
          💉 Use getFakeScores({tier})
        </button>
      </div>

      {/* Custom MBTI sliders */}
      <div style={sectionLabel}>Custom MBTI Sliders</div>
      <div
        style={{
          background: "#0d0d1a",
          border: "1px solid #333",
          borderRadius: 8,
          padding: "10px 12px",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#007acc",
            textAlign: "center",
            marginBottom: 10,
            fontFamily: "monospace",
            letterSpacing: "0.1em",
          }}
        >
          {previewMBTI}
        </div>

        {(
          [
            { key: "E" as const, left: "I", right: "E" },
            { key: "S" as const, left: "N", right: "S" },
            { key: "T" as const, left: "F", right: "T" },
            { key: "J" as const, left: "P", right: "J" },
          ] as const
        ).map(({ key, left, right }) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#888",
                marginBottom: 3,
              }}
            >
              <span>{left}</span>
              <span style={{ color: "#007acc", fontWeight: 700 }}>
                {sliders[key]}
              </span>
              <span>{right}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sliders[key]}
              onChange={(e) => setSlider(key, parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#007acc" }}
            />
          </div>
        ))}

        <button
          onClick={() => {
            // Convert slider 0-100 to mbti scale 1-5
            // 0-20 -> 1, 20-40 -> 2, 40-60 -> 3, 60-80 -> 4, 80-100 -> 5 for right letter
            const toScore = (v: number, preferRight: boolean) => {
              if (preferRight) {
                return v < 20 ? 1 : v < 40 ? 2 : v < 60 ? 3 : v < 80 ? 4 : 5;
              } else {
                return v < 20 ? 5 : v < 40 ? 4 : v < 60 ? 3 : v < 80 ? 2 : 1;
              }
            };
            const scores = {
              E: toScore(sliders.E, true),
              I: toScore(sliders.E, false),
              S: toScore(sliders.S, true),
              N: toScore(sliders.S, false),
              T: toScore(sliders.T, true),
              F: toScore(sliders.T, false),
              J: toScore(sliders.J, true),
              P: toScore(sliders.J, false),
            };
            applyScores(scores);
          }}
          style={{ ...btnStyle, width: "100%", marginTop: 4, background: "#1a3a1a", border: "1px solid #27ae60" }}
        >
          ✅ Apply Slider Scores
        </button>
      </div>

      {/* Mood seeder */}
      <div style={sectionLabel}>Mood Seeder</div>
      <button
        onClick={setRandomMood}
        style={{ ...btnStyle, width: "100%", padding: "7px", marginBottom: 10 }}
      >
        🎨 Random Mood Blend
      </button>

      {/* Quiz progress */}
      <div style={sectionLabel}>Quiz Progress</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <button
          onClick={seedAllQuestions}
          style={{ ...btnStyle, width: "100%", padding: "7px", background: "#1a3a1a", border: "1px solid #27ae60" }}
        >
          ✅ Seed All 40 Answered
        </button>
        <button
          onClick={resetQuizProgress}
          style={{ ...btnStyle, width: "100%", padding: "7px", background: "#3a1a1a", border: "1px solid #c0392b", color: "#ff6b6b" }}
        >
          🔄 Reset Quiz Progress
        </button>
      </div>
    </div>
  );
}

// ─── Minimized Pill ───────────────────────────────────────────────────────────

function MinimizedPill({ onOpen }: { onOpen: () => void }) {
  const [fps, setFps] = useState(60);
  const [route, setRoute] = useState("");
  const [authStatus, setAuthStatus] = useState("●");

  useEffect(() => {
    // Route
    setRoute(window.location.pathname);

    // Auth status
    const storedAuth = sessionStorage.getItem("knowrole-auth-state") as
      | AuthState
      | null;
    if (!storedAuth || storedAuth === "logged_out") setAuthStatus("○");
    else if (storedAuth === "logged_in_free") setAuthStatus("●");
    else setAuthStatus("★");

    // FPS counter
    let lastTime = performance.now();
    let frames = 0;
    let rafId: number;
    const tick = (now: number) => {
      frames++;
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      onClick={onOpen}
      title="Open Dev Panel"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        background: "linear-gradient(135deg, #007acc, #7800FF)",
        borderRadius: 999,
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,122,204,0.5)",
        zIndex: 99999,
        fontFamily: "monospace",
        fontSize: 11,
        color: "#fff",
        fontWeight: 700,
      }}
    >
      <span style={{ fontSize: 14 }}>⚡</span>
      <span
        style={{
          maxWidth: 120,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {route || "/"}
      </span>
      <span style={{ color: "#fff8", fontSize: 10 }}>{fps}fps</span>
      <span style={{ color: "#fff8", fontSize: 10 }}>{authStatus}</span>
    </div>
  );
}

// ─── Main DevPanel Component ─────────────────────────────────────────────────

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [autoSeed, setAutoSeed] = useState(false);

  // Only show in dev or test mode
  const isActive = import.meta.env.DEV || isTestMode();
  if (!isActive) return null;

  return createPortal(
    <div>
      {/* Minimized pill */}
      {!isOpen && <MinimizedPill onOpen={() => setIsOpen(true)} />}

      {/* Full panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 420,
            maxHeight: "80vh",
            background: "#1e1e1e",
            border: "1px solid #333",
            borderRadius: 12,
            boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
            zIndex: 99999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            fontFamily: "monospace",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#007acc",
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              ⚡ DEV PANEL
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "none",
                borderRadius: 4,
                color: "#fff",
                cursor: "pointer",
                padding: "2px 8px",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              − Minimize
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            <AccordionSection title="Quick Navigation" icon="🚀">
              <QuickNavSection autoSeed={autoSeed} setAutoSeed={setAutoSeed} />
            </AccordionSection>

            <AccordionSection title="Auth Simulator" icon="🎭">
              <AuthSimulatorSection />
            </AccordionSection>

            <AccordionSection title="Fake Data Generator" icon="🎲">
              <FakeDataGeneratorSection />
            </AccordionSection>

            <AccordionSection title="State Inspector" icon="📦">
              <StateInspectorSection />
            </AccordionSection>

            <AccordionSection title="Error Injection" icon="⚠️">
              <ErrorInjectionSection />
            </AccordionSection>

            <AccordionSection title="Viewport & Theme" icon="📱">
              <ViewportThemeSection />
            </AccordionSection>

            <AccordionSection title="Results & Sharing" icon="🔗">
              <ResultsSharingSection />
            </AccordionSection>

            <AccordionSection title="Performance Monitor" icon="⚡">
              <PerformanceSection />
            </AccordionSection>

            <AccordionSection title="Utilities" icon="🔧">
              <UtilitiesSection />
            </AccordionSection>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
