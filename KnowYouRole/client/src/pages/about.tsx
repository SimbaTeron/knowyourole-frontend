import { Link } from "wouter";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
};

const STEPS = [
  { num: "01", title: "Take the Quiz", desc: "Answer simple questions about how you think, feel, and act. Takes just 3-5 minutes." },
  { num: "02", title: "Get Your Profile", desc: "Receive your detailed personality breakdown based on the Big Five model." },
  { num: "03", title: "Explore Your Path", desc: "Discover career matches, growth insights, and personalized recommendations." },
];

export default function About() {
  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>
      <AppHeader />

      {/* Hero */}
      <div style={{ padding: "clamp(80px, 15vw, 140px) clamp(16px, 4vw, 64px) clamp(48px, 8vw, 80px)", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 900, marginBottom: 16, letterSpacing: "-0.03em", fontFamily: "'Outfit',sans-serif" }}>
          About <span style={{ background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>KnowYouRole</span>
        </h1>
        <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
          Personality science made fun, fast, and genuinely useful.
        </p>
      </div>

      {/* How It Works */}
      <div style={{ padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 64px)", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, textAlign: "center", marginBottom: 48, letterSpacing: "-0.02em" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {STEPS.map(s => (
            <div key={s.num} style={{ ...glassCard, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>{s.num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Science */}
      <div style={{ padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 64px)", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ ...glassCard, padding: 40 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, textAlign: "center", marginBottom: 20 }}>The Science Behind It</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.8, marginBottom: 40, maxWidth: 700, margin: "0 auto 40px" }}>
            Based on the Big Five personality model — the most validated psychological framework for understanding human personality. Used by researchers, therapists, and Fortune 500 companies alike.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[["50+", "years of research", "#00C8FF"], ["500K+", "peer-reviewed studies", "#7800FF"], ["100+", "cultures validated", "#39FF14"]].map(([n, l, c]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, color: c as string, textShadow: `0 0 20px ${c}` }}>{n}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "clamp(60px, 10vw, 120px) clamp(16px, 4vw, 64px)", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, marginBottom: 16 }}>Ready to discover yourself?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>Join millions who have unlocked their potential.</p>
        <Link href="/quiz" style={{ textDecoration: "none" }}>
          <button style={{ padding: "16px 40px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 50, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 30px rgba(0,200,255,0.4)" }}>
            Start Your Journey →
          </button>
        </Link>
      </div>

      <AppFooter />
    </div>
  );
}
