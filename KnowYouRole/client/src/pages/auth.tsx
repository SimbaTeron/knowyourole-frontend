import { useState } from "react";
import { Link } from "wouter";

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
};

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", display: "flex" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Left panel — branding */}
      <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(32px, 6vw, 80px)", position: "relative", overflow: "hidden" }}>
        {/* Background gradient */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(120,0,255,0.2) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 70%, rgba(0,200,255,0.15) 0%, transparent 50%)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #00C8FF, #7800FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900 }}>KnowYouRole</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.04em", marginBottom: 24 }}>
            Your personality<br />
            <span style={{ background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>decoded.</span>
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 48, maxWidth: 400 }}>
            Join 2 million people who know who they are. Science-backed, brutally honest, and actually fun.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32 }}>
            {[["2M+", "Assessments"], ["4.9★", "Avg Rating"], ["3 min", "Avg Quiz"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 5vw, 64px)", position: "relative" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ ...glassCard, padding: 32 }}>
            {/* Tab toggle */}
            <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 50, marginBottom: 28 }}>
              {(["signin", "signup"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 50,
                    border: "none",
                    background: mode === m ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "transparent",
                    color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
                    fontWeight: mode === m ? 700 : 500,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Google button */}
            <button style={{ width: "100%", padding: "14px", background: "#fff", border: "none", borderRadius: 16, fontWeight: 700, fontSize: 14, color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, fontFamily: "'Outfit',sans-serif" }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontSize: 15, fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontSize: 15, fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Submit */}
            <button style={{ width: "100%", padding: "16px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 16, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 30px rgba(0,200,255,0.3)", marginBottom: 16 }}>
              {mode === "signin" ? "Sign In" : "Get Started"}
            </button>

            {mode === "signin" && (
              <p style={{ textAlign: "center", fontSize: 13, color: "#00C8FF", cursor: "pointer", marginBottom: 16 }}>Forgot password?</p>
            )}

            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              By continuing, you agree to our <Link href="/terms" style={{ color: "rgba(255,255,255,0.5)" }}>Terms</Link> and <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)" }}>Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
