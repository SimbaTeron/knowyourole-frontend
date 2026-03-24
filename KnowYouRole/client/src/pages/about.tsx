import { Link } from "wouter";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

export default function AboutPage() {
  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      <AppHeader />

      {/* Hero */}
      <div style={{ paddingTop: 140, paddingBottom: 60, textAlign: "center", padding: "140px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>
          About <span style={{ background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>KnowYouRole</span>
        </h1>
        <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
          Personality science made fun, fast, and genuinely useful.
        </p>
      </div>

      {/* How It Works */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, textAlign: "center", marginBottom: 48, fontFamily: "'Outfit',sans-serif" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { num: "01", title: "Take the Quiz", desc: "Answer simple questions about how you think, feel, and act. Takes just 3-5 minutes." },
            { num: "02", title: "Get Your Profile", desc: "Receive your detailed personality breakdown based on the Big Five model." },
            { num: "03", title: "Explore Your Path", desc: "Discover career matches, growth insights, and personalized recommendations." },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28, textAlign: "center" }}>
              <p style={{ fontSize: 48, fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>{s.num}</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontFamily: "'Outfit',sans-serif" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Science */}
      <section style={{ padding: "0 24px 80px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 40, textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>The Science Behind It</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 32, maxWidth: 600, margin: "0 auto 32px", fontFamily: "'Outfit',sans-serif" }}>
            Based on the Big Five personality model — the most validated psychological framework for understanding human personality. Used by researchers, therapists, and Fortune 500 companies alike.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { val: "50+", label: "years of research", color: "#00C8FF" },
              { val: "500K+", label: "peer-reviewed studies", color: "#7800FF" },
              { val: "100+", label: "cultures validated", color: "#39FF14" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "16px" }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>{s.val}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 24px 100px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>Ready to discover yourself?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 32, fontFamily: "'Outfit',sans-serif" }}>Join millions who have unlocked their potential.</p>
        <Link href="/quiz" style={{ textDecoration: "none" }}>
          <button style={{ padding: "16px 36px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 50, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 30px rgba(0,200,255,0.4)" }}>
            Start Your Journey →
          </button>
        </Link>
      </section>

      <AppFooter />
    </div>
  );
}
