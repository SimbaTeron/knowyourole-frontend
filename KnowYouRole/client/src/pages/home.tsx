import { Link } from "wouter";
import { AppHeader } from "@/components/layout/AppHeader";

const FEATURES = [
  { emoji: "🎯", title: "Precision Insights", description: "Deep psychological analysis based on the Big Five model — the gold standard in personality science." },
  { emoji: "🧠", title: "Mood Alchemy Lab", description: "Track how your emotions shift and blend across different situations and environments." },
  { emoji: "💼", title: "Career Compass", description: "Discover roles where your natural traits translate into satisfaction and success." },
  { emoji: "🎮", title: "Quizzes That Don't Suck", description: "Say goodbye to boring quizzes. Ours are engaging, beautiful, and actually fun." },
  { emoji: "🔒", title: "Privacy First", description: "Your results are yours. Always. We never sell data or share anything without permission." },
  { emoji: "⚡", title: "Instant Results", description: "Get your full personality breakdown in under 10 minutes. No waiting, no surveys." },
];

const TESTIMONIALS = [
  { name: "Jordan M.", role: "Software Engineer at Stripe", quote: "Finally a quiz that actually gets me. The career suggestions were spot-on.", initials: "JM", gradient: "linear-gradient(135deg, #00C8FF, #7800FF)" },
  { name: "Aaliyah T.", role: "Product Designer at Figma", quote: "The mood tracking is addictive. I've learned so much about myself.", initials: "AT", gradient: "linear-gradient(135deg, #7800FF, #FF00E5)" },
  { name: "Marcus R.", role: "Medical Student, NYU", quote: "Took it for fun, stayed for the science. Incredibly accurate.", initials: "MR", gradient: "linear-gradient(135deg, #FF00E5, #00C8FF)" },
];

const STATS = [
  { num: "2M+", label: "Assessments" },
  { num: "4.9★", label: "Avg Rating" },
  { num: "3 min", label: "Avg Quiz" },
  { num: "100%", label: "Private" },
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
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
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
      `}</style>

      <AppHeader />

      {/* HERO */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", alignItems: "center",
        padding: "clamp(60px, 10vw, 120px) clamp(16px, 4vw, 64px)",
        background: "radial-gradient(ellipse at 30% 20%, rgba(120,0,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,200,255,0.1) 0%, transparent 50%)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", flexDirection: "row", alignItems: "center", gap: "48px", flexWrap: "wrap" }}>

          {/* Left: Content */}
          <div style={{ flex: "1 1 500px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.3)", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 600, color: "#00C8FF", marginBottom: 24 }}>
              ✦ 100% Free — No Account Needed
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.04em", marginBottom: 20, fontFamily: "'Outfit',sans-serif" }}>
              Find out<br />who you{" "}
              <span className="hero-gradient">really</span><br />are.
            </h1>
            <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              The Gen Z personality quiz. Combined Big Five, MBTI, and DISC into one wild ride. Know yourself. Own your energy.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/quiz" style={{ textDecoration: "none" }}>
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
          <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "min(280px, 80vw)", height: "min(560px, 150vw)" }}>
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
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ textAlign: "center", padding: "40px 16px" }}>
            <p style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>{s.num}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
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

      {/* TESTIMONIALS */}
      <section style={{ padding: "clamp(48px, 8vw, 100px) clamp(16px, 4vw, 48px)", background: "linear-gradient(180deg, transparent, rgba(120,0,255,0.05))" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00C8FF", marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>What People Say</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", fontFamily: "'Outfit',sans-serif" }}>Real people, real insights.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card" style={{ padding: 28 }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 24, fontStyle: "italic", fontFamily: "'Outfit',sans-serif" }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0, fontFamily: "'Outfit',sans-serif" }}>{t.initials}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE SCIENCE */}
      <section style={{ padding: "clamp(60px, 10vw, 120px) clamp(16px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#7800FF", marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>The Science</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", fontFamily: "'Outfit',sans-serif" }}>Built on the Big Five.</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 12, maxWidth: 560, margin: "12px auto 0", fontFamily: "'Outfit',sans-serif" }}>
              The most validated personality model in psychology. Five traits, infinite depth.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { letter: "O", name: "Openness", desc: "Curiosity, creativity, and open-mindedness", color: "#00C8FF" },
              { letter: "C", name: "Conscientiousness", desc: "Organization, discipline, and dependability", color: "#7800FF" },
              { letter: "E", name: "Extraversion", desc: "Social energy, assertiveness, and enthusiasm", color: "#FF00E5" },
              { letter: "A", name: "Agreeableness", desc: "Compassion, trust, and cooperation", color: "#39FF14" },
              { letter: "N", name: "Neuroticism", desc: "Emotional stability and resilience", color: "#FF6B00" },
            ].map((trait) => (
              <div key={trait.letter} style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: "20px 18px", textAlign: "center",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: `rgba(${trait.color === "#00C8FF" ? "0,200,255" : trait.color === "#7800FF" ? "120,0,255" : trait.color === "#FF00E5" ? "255,0,229" : trait.color === "#39FF14" ? "57,255,20" : "255,107,0"},0.15)`,
                  border: `1px solid ${trait.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px", fontSize: 20, fontWeight: 900, color: trait.color,
                  fontFamily: "'Outfit',sans-serif",
                }}>
                  {trait.letter}
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>{trait.name}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, fontFamily: "'Outfit',sans-serif" }}>{trait.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Outfit',sans-serif" }}>
            Learn more about the research behind it → <a href="/about" style={{ color: "#00C8FF", textDecoration: "none" }}>Read the full breakdown</a>
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
              KnowYouRole was built for a generation that refuses to be put in a box. We combine rigorous psychological science with a Gen Z-first experience — because self-knowledge shouldn't be boring.
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
            2.4 million people already know who they are. Your turn.
          </p>
          <a href="/quiz" style={{ textDecoration: "none" }}>
            <button style={{ background: "linear-gradient(90deg, #00C8FF, #7800FF)", padding: "16px 36px", borderRadius: 16, fontWeight: 700, fontSize: 16, color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 0 40px rgba(0,200,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>
              Take the Free Quiz →
            </button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px clamp(16px, 4vw, 48px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit',sans-serif" }}>
        <span>© 2026 KnowYouRole</span>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Privacy</a>
          <a href="/terms" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Terms</a>
          <a href="/faq" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>FAQ</a>
          <a href="/about" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>About</a>
        </div>
      </footer>

    </div>
  );
}
