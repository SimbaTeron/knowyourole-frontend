import { useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";

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

export default function ResultsPage() {
  const [tab, setTab] = useState("Personality");

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 40 }} />
        <span style={{ fontSize: 16, fontWeight: 700 }}>Your Results</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Hero */}
      <div style={{ paddingTop: 100, paddingBottom: 32, textAlign: "center", padding: "100px 24px 32px" }}>
        <div style={{ display: "inline-block", background: "linear-gradient(135deg, #00C8FF, #7800FF)", borderRadius: 20, padding: "4px", marginBottom: 16 }}>
          <div style={{ background: "#050510", borderRadius: 16, padding: "clamp(16px, 4vw, 32px) clamp(24px, 6vw, 48px)" }}>
            <span style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, background: "linear-gradient(135deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Outfit',sans-serif" }}>INTJ-A</span>
          </div>
        </div>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>The Architect</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>Strategic, independent, and determined</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 24px", marginBottom: 32, background: "rgba(5,5,16,0.8)", position: "sticky", top: 57, zIndex: 40, paddingTop: 8, paddingBottom: 8 }}>
        {["Personality", "Careers", "Growth"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", borderRadius: 50, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: tab === t ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "rgba(255,255,255,0.05)", color: tab === t ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 24px 80px", maxWidth: 800, margin: "0 auto" }}>

        {tab === "Personality" && (
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
                As an INTJ-A, you're a strategic visionary with a rare combination of analytical brilliance and quiet confidence. You see patterns others miss, question assumptions, and quietly build systems and visions that reshape the world around you.
              </p>
            </div>
          </div>
        )}

        {tab === "Careers" && (
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

        {tab === "Growth" && (
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

        {/* Premium */}
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
      </div>

      <AppFooter />
    </div>
  );
}
