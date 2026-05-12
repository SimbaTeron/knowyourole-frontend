'use client';

import { AppHeader } from "@/components/layout/AppHeader";

const FEATURES = [
  { emoji: "🎯", title: "Three-model profile", description: "Big Five depth, MBTI-style patterning, and DISC behavior cues in one result." },
  { emoji: "💼", title: "Career fit", description: "Role suggestions tied to your traits, work style, and energy — not generic job lists." },
  { emoji: "🎮", title: "Actually fun", description: "A faster, cleaner quiz flow designed to feel easy without dumbing down the science." },
  { emoji: "🔒", title: "Private by default", description: "Your results stay yours. We do not sell your data or share it without permission." },
];

const TESTIMONIALS = [
  {
    quote: "Finally a quiz that actually gets me. The career suggestions were spot-on.",
    initials: "JM",
    name: "Jordan M.",
    title: "Software Engineer at Stripe",
    gradient: "linear-gradient(135deg, #00C8FF, #7800FF)",
  },
  {
    quote: "The mood tracking is addictive. I've learned so much about myself.",
    initials: "AT",
    name: "Aaliyah T.",
    title: "Product Designer at Figma",
    gradient: "linear-gradient(135deg, #7800FF, #FF00E5)",
  },
  {
    quote: "Took it for fun, stayed for the science. Incredibly accurate.",
    initials: "MR",
    name: "Marcus R.",
    title: "Medical Student, NYU",
    gradient: "linear-gradient(135deg, #FF00E5, #00C8FF)",
  },
];

const SCIENCE_MODELS = [
  { label: "Big Five", detail: "Trait depth", description: "Measures openness, conscientiousness, extraversion, agreeableness, and emotional range.", color: "#00C8FF" },
  { label: "MBTI-style", detail: "Cognitive pattern", description: "Translates preference patterns into a familiar type language without pretending people fit boxes perfectly.", color: "#7800FF" },
  { label: "DISC", detail: "Behavior style", description: "Highlights how you tend to communicate, decide, lead, and respond under pressure.", color: "#FF00E5" },
];

const STATS = [
  { num: "8 min", label: "Avg Quiz" },
  { num: "45", label: "Questions" },
  { num: "3", label: "Models" },
  { num: "100%", label: "Private Results" },
];

const phoneCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "24px",
  padding: "24px",
};

export default function Home() {
  return (
    <div className="kyr-page" style={{ background: "#050510", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>

      <style>{`
        .hero-gradient {
          background: linear-gradient(90deg, #00C8FF, #7800FF, #FF00E5);
          background-size: 400% 400%;
          animation: gradientShift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(0,200,255,0.3);
          transform: translateY(-4px);
        }
        .home-hero {
          position: relative;
          min-height: 88dvh;
          display: flex;
          align-items: center;
          padding: clamp(88px, 12vw, 112px) clamp(16px, 4vw, 64px) clamp(36px, 6vw, 72px);
          background: radial-gradient(ellipse at 30% 20%, rgba(120,0,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,200,255,0.1) 0%, transparent 50%);
        }
        .home-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: clamp(28px, 5vw, 52px);
          flex-wrap: wrap;
        }
        .home-hero-copy { flex: 1 1 500px; }
        .home-hero-title {
          font-size: clamp(2.5rem, 8vw, 5.5rem);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -0.04em;
          margin-bottom: 18px;
          font-family: 'Outfit', sans-serif;
        }
        .home-hero-subtitle {
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          color: rgba(255,255,255,0.6);
          line-height: 1.62;
          margin-bottom: 24px;
          max-width: 520px;
        }
        .home-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .home-hero-visual { flex: 1 1 300px; display: flex; justify-content: center; transform: translateY(12px); }
        .home-phone-stack { position: relative; width: min(280px, 80vw); height: min(500px, 126vw); }
        .home-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .home-stat { text-align: center; padding: 30px 16px; }
        @media (max-width: 700px) {
          .home-hero {
            min-height: auto;
            align-items: flex-start;
            padding: 104px 18px 34px;
          }
          .home-hero-inner { gap: 28px; }
          .home-hero-copy { flex-basis: 100%; }
          .home-hero-title { margin-bottom: 16px; }
          .home-hero-subtitle { margin-bottom: 20px; line-height: 1.58; }
          .home-hero-actions a,
          .home-hero-actions button { width: 100%; }
          .home-hero-visual { flex-basis: 100%; transform: none; }
          .home-phone-stack { width: min(260px, 76vw); height: 220px; }
          .home-stats { grid-template-columns: repeat(2, 1fr); }
          .home-stat { padding: 22px 12px; }
        }
      `}</style>

      <AppHeader />

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-inner">

          {/* Left: Content */}
          <div className="home-hero-copy">
            <h1 className="home-hero-title">
              Find out<br />who you{" "}
              <span className="hero-gradient">really</span><br />are.
            </h1>
            <p className="home-hero-subtitle">
              One simple, playful quiz combining Big Five, MBTI, and DISC into a clearer path to self-knowledge. Know yourself. Own your energy.
            </p>
            <div className="home-hero-actions">
              <a href="/quiz-gateway" style={{ textDecoration: "none" }}>
                <button style={{ background: "linear-gradient(90deg, #00C8FF, #7800FF)", padding: "14px 28px", borderRadius: 50, fontWeight: 700, fontSize: 14, color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 0 30px rgba(0,200,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>
                  Take the Quiz — It's Free →
                </button>
              </a>
              <a href="/about" style={{ textDecoration: "none" }}>
                <button style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", padding: "14px 28px", borderRadius: 16, fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                  Learn More
                </button>
              </a>
            </div>
          </div>

          {/* Right: Phone Stack */}
          <div className="home-hero-visual">
            <div className="home-phone-stack">
              <div style={{ ...phoneCardStyle, position: "absolute", width: "90%", top: 0, right: 0, zIndex: 3, transform: "rotate(3deg)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Your Type</p>
                <p style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Outfit',sans-serif" }}>INTJ-A</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#00C8FF" }}>The Architect</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>12.4% of population</p>
              </div>
              <div style={{ ...phoneCardStyle, position: "absolute", width: "85%", top: 20, right: 20, zIndex: 2, transform: "rotate(-2deg)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Big Five</p>
                <p style={{ fontSize: 14, fontWeight: 900, color: "#fff", lineHeight: 1.6 }}>O: 78% C: 85%<br />E: 42% A: 61%<br />N: 28%</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 8, lineHeight: 1.4 }}>Openness · Conscientiousness<br />Extraversion · Agreeableness<br />Neuroticism</p>
              </div>
              <div style={{ ...phoneCardStyle, position: "absolute", width: "80%", top: 40, right: 40, zIndex: 1, transform: "rotate(1deg)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>DISC Profile</p>
                <p style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Outfit',sans-serif" }}>DC</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#00C8FF" }}>The Challenger</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>High dominance, high conscientiousness</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="home-stats">
        {STATS.map((s) => (
          <div key={s.label} className="home-stat">
            <p style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>{s.num}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* REAL INSIGHTS */}
      <section style={{ padding: "clamp(48px, 8vw, 100px) clamp(16px, 4vw, 48px)", background: "linear-gradient(180deg, transparent, rgba(120,0,255,0.05))" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00C8FF", marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>Real Insights</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", fontFamily: "'Outfit',sans-serif" }}>Real insight, no fake numbers.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="glass-card" style={{ padding: 28, margin: 0, minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <blockquote style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.82)", lineHeight: 1.55, margin: "0 0 28px", fontFamily: "'Outfit',sans-serif" }}>
                  “{t.quote}”
                </blockquote>
                <figcaption style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0, fontFamily: "'Outfit',sans-serif" }}>{t.initials}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit',sans-serif" }}>{t.title}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "clamp(48px, 8vw, 100px) clamp(16px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00C8FF", marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>Why KnowYouRole</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", fontFamily: "'Outfit',sans-serif" }}>Not your average personality quiz.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card" style={{ padding: "clamp(20px, 4vw, 32px)" }}>
                <div style={{ width: 48, height: 48, background: "rgba(0,200,255,0.15)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 16 }}>{f.emoji}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontFamily: "'Outfit',sans-serif" }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE SCIENCE */}
      <section style={{ padding: "clamp(56px, 9vw, 104px) clamp(16px, 4vw, 48px)", background: "radial-gradient(circle at 50% 0%, rgba(0,200,255,0.08), transparent 42%)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 42 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#7800FF", marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>The Science</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 900, letterSpacing: "-0.03em", fontFamily: "'Outfit',sans-serif" }}>Three lenses. One clearer picture.</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.52)", lineHeight: 1.65, margin: "14px auto 0", maxWidth: 660, fontFamily: "'Outfit',sans-serif" }}>
              KnowYouRole combines Big Five traits, MBTI-style patterns, and DISC behavior signals so your results feel useful from more than one angle.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {SCIENCE_MODELS.map((model, index) => (
              <div key={model.label} className="glass-card" style={{ padding: "clamp(22px, 4vw, 30px)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 20% 0%, ${model.color}22, transparent 45%)`, pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 12, background: `${model.color}22`, border: `1px solid ${model.color}66`, color: model.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>0{index + 1}</span>
                    <span style={{ fontSize: 11, color: model.color, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Outfit',sans-serif" }}>{model.detail}</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>{model.label}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontFamily: "'Outfit',sans-serif" }}>{model.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: "rgba(255,255,255,0.28)", fontFamily: "'Outfit',sans-serif" }}>
            Want the methodology? <a href="/about" style={{ color: "#00C8FF", textDecoration: "none" }}>Read the full breakdown</a>
          </p>
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section style={{ padding: "clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF00E5", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>About KYR</p>
            <h3 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>We're here to help you<br /><span style={{ color: "#00C8FF" }}>know yourself.</span></h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontFamily: "'Outfit',sans-serif" }}>
              KnowYouRole was built for people who refuse to be put in a box. We combine rigorous psychological science with a fast, modern experience — because self-knowledge shouldn't be boring.
            </p>
            <a href="/about" style={{ display: "inline-block", marginTop: 20, color: "#00C8FF", textDecoration: "none", fontWeight: 600, fontSize: 14, fontFamily: "'Outfit',sans-serif" }}>Meet the team →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { emoji: "🔬", stat: "50+", label: "Published studies cited" },
              { emoji: "🧬", stat: "5", label: "Personality dimensions" },
              { emoji: "⚡", stat: "<10min", label: "Average completion" },
              { emoji: "🔒", stat: "0", label: "Data points sold" },
            ].map((item) => (
              <div key={item.label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "16px 14px", textAlign: "center",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.emoji}</div>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 2, fontFamily: "'Outfit',sans-serif" }}>{item.stat}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(60px, 10vw, 120px) clamp(16px, 4vw, 48px)", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>
            Stop scrolling.<br /><span className="hero-gradient">Start knowing.</span>
          </h2>
          <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "rgba(255,255,255,0.5)", marginBottom: 40, fontFamily: "'Outfit',sans-serif" }}>
            Eight minutes now. Better self-knowledge for the next eight years.
          </p>
          <a href="/quiz-gateway" style={{ textDecoration: "none" }}>
            <button style={{ background: "linear-gradient(90deg, #00C8FF, #7800FF)", padding: "16px 36px", borderRadius: 16, fontWeight: 700, fontSize: 16, color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 0 40px rgba(0,200,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>
              Take the Free Quiz →
            </button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px clamp(16px, 4vw, 48px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit',sans-serif" }}>
        <span>© 2026 KnowYouRole</span>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy</a>
          <a href="/terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</a>
          <a href="/faq" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>FAQ</a>
          <a href="/about" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>About</a>
        </div>
      </footer>

    </div>
  );
}
