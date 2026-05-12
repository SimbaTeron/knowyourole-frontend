'use client';

import { useEffect, useState } from "react";
import { isTestMode } from "@/utils/devTest";

const TIERS = [
  { id: "25+", emoji: "💼", title: "Adults", age: "25+" },
  { id: "19-25", emoji: "🎓", title: "Young Adults", age: "18–25" },
  { id: "13-18", emoji: "🎒", title: "Teens", age: "13–17" },
];

export default function QuizGateway() {
  const [selected, setSelected] = useState<string | null>(null);

  // Dev test mode: if ?test=true in URL, auto-select tier and keep normal flow intact.
  useEffect(() => {
    if (!isTestMode()) return;
    const urlParams = new URLSearchParams(window.location.search);
    let tier = urlParams.get("tier");
    if (!tier) tier = "25+";
    const normalizedTier = tier.trim();
    const matchedTier = TIERS.find(t => t.id === normalizedTier || t.id.startsWith(normalizedTier));
    if (matchedTier) {
      sessionStorage.setItem("kyr_quiz_tier", matchedTier.id);
    }
  }, []);

  const startQuiz = (tierId: string) => {
    setSelected(tierId);
    sessionStorage.setItem("kyr_quiz_tier", tierId);
    sessionStorage.removeItem("knowrole-onboarding-intro-done");
    sessionStorage.removeItem("knowrole-onboarding-slider-done");
    window.location.href = "/mood-mixer";
  };

  return (
    <div className="kyr-page" style={{ background: "#050510", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>
      <style>{`
        .gateway-shell {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(92px, 12vw, 124px) clamp(16px, 4vw, 48px) clamp(40px, 7vw, 72px);
          box-sizing: border-box;
          overflow: hidden;
          background:
            radial-gradient(circle at 22% 18%, rgba(0,200,255,0.16), transparent 32%),
            radial-gradient(circle at 78% 82%, rgba(255,0,229,0.12), transparent 34%),
            radial-gradient(circle at 50% 45%, rgba(120,0,255,0.12), transparent 42%);
        }
        .gateway-inner {
          width: 100%;
          max-width: 940px;
          text-align: center;
        }
        .gateway-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(0,200,255,0.18);
          background: rgba(0,200,255,0.08);
          color: #00C8FF;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .gateway-title {
          font-size: clamp(2.15rem, 6vw, 4.45rem);
          line-height: 0.92;
          font-weight: 950;
          letter-spacing: -0.055em;
          margin: 0 0 10px;
          white-space: nowrap;
        }
        .gateway-subtitle {
          margin: 0 auto clamp(18px, 3.5vw, 32px);
          color: rgba(255,255,255,0.52);
          font-size: clamp(0.95rem, 2vw, 1.1rem);
        }
        .tier-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(14px, 2.5vw, 22px);
        }
        .tier-button {
          position: relative;
          min-height: 238px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px 999px 36px 36px;
          background: linear-gradient(180deg, rgba(255,255,255,0.085), rgba(255,255,255,0.035));
          color: #fff;
          cursor: pointer;
          padding: 28px 18px 24px;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }
        .tier-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 18%, rgba(0,200,255,0.22), transparent 42%);
          opacity: 0;
          transition: opacity 180ms ease;
        }
        .tier-button:hover,
        .tier-button:focus-visible,
        .tier-button.selected {
          transform: translateY(-5px);
          border-color: rgba(0,200,255,0.62);
          box-shadow: 0 24px 80px rgba(0,200,255,0.18), 0 0 0 1px rgba(0,200,255,0.2) inset;
          outline: none;
        }
        .tier-button:hover::before,
        .tier-button:focus-visible::before,
        .tier-button.selected::before {
          opacity: 1;
        }
        .tier-content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .tier-emoji {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 38px;
          margin-bottom: 18px;
        }
        .tier-title {
          display: block;
          font-size: clamp(1.05rem, 2.3vw, 1.35rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .tier-age {
          display: block;
          color: #00C8FF;
          font-size: clamp(1.55rem, 4vw, 2.45rem);
          font-weight: 950;
          letter-spacing: -0.045em;
        }
        .gateway-footnote {
          margin-top: clamp(22px, 4vw, 34px);
          color: rgba(255,255,255,0.34);
          font-size: 13px;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        @media (max-width: 760px) {
          .gateway-shell {
            align-items: flex-start;
            padding-top: 80px;
          }
          .gateway-kicker { margin-bottom: 12px; }
          .gateway-title { font-size: clamp(1.85rem, 9.6vw, 2.85rem); }
          .gateway-subtitle { margin-bottom: 16px; }
          .tier-grid {
            grid-template-columns: 1fr;
            max-width: 360px;
            margin: 0 auto;
            gap: 12px;
          }
          .tier-button {
            min-height: 112px;
            border-radius: 28px;
            padding: 16px 18px;
          }
          .tier-content {
            flex-direction: row;
            justify-content: flex-start;
            text-align: left;
            gap: 16px;
          }
          .tier-emoji {
            width: 58px;
            height: 58px;
            font-size: 28px;
            margin: 0;
            flex: 0 0 auto;
          }
          .tier-title { margin-bottom: 2px; }
          .tier-age { font-size: 1.75rem; }
        }
      `}</style>

      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(5,5,16,0.78)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#00C8FF", letterSpacing: "0.16em" }}>STEP 1 OF 3</span>
      </header>

      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.08)", zIndex: 50 }}>
        <div style={{ width: "33%", height: "100%", background: "linear-gradient(90deg, #00C8FF, #7800FF)" }} />
      </div>

      <main className="gateway-shell">
        <div className="gateway-inner">
          <div className="gateway-kicker">Quick setup</div>
          <h1 className="gateway-title">Pick your age range.</h1>
          <p className="gateway-subtitle">One tap and you’re in.</p>

          <div className="tier-grid" aria-label="Choose your age range">
            {TIERS.map((tier) => {
              const isSelected = selected === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  aria-label={`${tier.title}, ${tier.age}`}
                  onClick={() => startQuiz(tier.id)}
                  className={`tier-button${isSelected ? " selected" : ""}`}
                >
                  <span className="tier-content">
                    <span className="tier-emoji" aria-hidden="true">{tier.emoji}</span>
                    <span>
                      <span className="tier-title">{tier.title}</span>
                      <span className="tier-age">{tier.age}</span>
                      <span className="sr-only">
                        {tier.id === "25+" ? "Adults (25+)" : tier.id === "19-25" ? "Young Adults (18-25)" : "Teens (13-17)"}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="gateway-footnote">Private results • Takes about 8 minutes</p>
        </div>
      </main>
    </div>
  );
}
