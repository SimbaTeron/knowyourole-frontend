import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

const TRAITS = [
  { label: "Openness", value: 92, color: "#A78BFA" },
  { label: "Conscientiousness", value: 74, color: "#60A5FA" },
  { label: "Extraversion", value: 61, color: "#34D399" },
  { label: "Agreeableness", value: 55, color: "#34D399" },
  { label: "Neuroticism", value: 68, color: "#F87171" },
];

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

const TABS = ["Personality", "Careers", "Growth"];

export default function Results() {
  const [tab, setTab] = useState("Personality");

  const glassCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "0",
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>
      <AppHeader />

      <div style={{ paddingTop: 120, padding: "clamp(80px, 12vw, 120px) clamp(16px, 4vw, 48px)", maxWidth: 800, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 900, marginBottom: 20, fontFamily: "'Outfit',sans-serif" }}>Your Results</h1>
          <div style={{ display: "inline-block", padding: "12px 32px", borderRadius: 50, background: "linear-gradient(90deg, #00C8FF, #7800FF)", boxShadow: "0 0 40px rgba(0,200,255,0.4)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, marginBottom: 12 }}>INTJ-A</div>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>The Architect — Strategic, independent, and determined</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 50, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 32 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 50,
                border: "none",
                background: tab === t ? "#00C8FF" : "transparent",
                color: tab === t ? "#000" : "rgba(255,255,255,0.5)",
                fontWeight: tab === t ? 700 : 500,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
                transition: "all 0.25s ease",
              }}
            >{t}</button>
          ))}
        </div>

        {/* Personality Tab */}
        {tab === "Personality" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ ...glassCard, padding: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Big Five Profile</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {TRAITS.map(t => (
                  <div key={t.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.value}%</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${t.value}%`, height: "100%", background: t.color, borderRadius: 10 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...glassCard, padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Your Personality Type</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                As an INTJ-A, you're a strategic visionary with a rare combination of analytical brilliance and quiet confidence. You see patterns others miss, question assumptions that others take for granted, and quietly build systems and visions that reshape the world around you.
              </p>
            </div>
          </div>
        )}

        {/* Careers Tab */}
        {tab === "Careers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Dream Roles</h2>
            {CAREERS.map(c => (
              <div key={c.title} style={{ ...glassCard, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{c.title}</h3>
                  <span style={{ background: c.match >= 90 ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "rgba(0,200,255,0.15)", padding: "4px 12px", borderRadius: 50, fontSize: 12, fontWeight: 700, color: c.match >= 90 ? "#fff" : "#00C8FF" }}>{c.match}%</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{c.salary}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{c.desc}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#39FF14" }}>{c.trend}</p>
              </div>
            ))}
          </div>
        )}

        {/* Growth Tab */}
        {tab === "Growth" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Your Growth Journey</h2>
            {GROWTH.map((g, i) => (
              <div key={i} style={{ ...glassCard, padding: 24, display: "flex", gap: 16 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#00C8FF", boxShadow: "0 0 10px #00C8FF", flexShrink: 0, marginTop: 4 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#00C8FF", marginBottom: 6 }}>{g.label}</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{g.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Premium Unlock */}
        <div style={{ marginTop: 40, padding: 28, borderRadius: 24, border: "2px solid transparent", backgroundImage: "linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0.04)), linear-gradient(90deg, #00C8FF, #7800FF)", backgroundOrigin: "border-box", textAlign: "center" }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Unlock Your Full Report</h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Deep dive into your personality with premium insights</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left", maxWidth: 280, margin: "0 auto 24px" }}>
            {["50-page personality report", "Relationship compatibility analysis", "Career path deep dive", "Personal growth action plan", "Shareable PDF report"].map(f => (
              <div key={f} style={{ display: "flex", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                <span style={{ color: "#39FF14" }}>✓</span> {f}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>$9.99<span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>/month</span></div>
          <button style={{ padding: "14px 36px", background: "#39FF14", border: "none", borderRadius: 50, fontWeight: 700, fontSize: 16, color: "#000", cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 30px rgba(57,255,20,0.4)" }}>
            Start Free Trial →
          </button>
        </div>
      </div>
    </div>
  );
}
