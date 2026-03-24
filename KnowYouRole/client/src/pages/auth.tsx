import { useState } from "react";
import { Link } from "wouter";
import { useAuth0 } from "@auth0/auth0-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { loginWithRedirect } = useAuth0();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithRedirect({ authorizationParams: { redirect_uri: window.location.origin + "/callback" } });
  };

  const handleGoogle = async () => {
    await loginWithRedirect({ authorizationParams: { connection: "google-oauth2", redirect_uri: window.location.origin + "/callback" } });
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", display: "flex" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* LEFT — Branding */}
      <div style={{ display: "none", flex: "1", flexDirection: "column", justifyContent: "center", padding: "clamp(32px, 6vw, 80px)", position: "relative", overflow: "hidden" }
        + /* @media min-768px: */ "" as unknown as React.CSSProperties}
      >
        {/* Gradient orbs */}
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,200,255,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(120,0,255,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #00C8FF, #7800FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900 }}>KnowYouRole</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
            Your personality,<br />
            <span style={{ background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>decoded.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 380, marginBottom: 48 }}>
            The Gen Z personality quiz. Combined Big Five, MBTI, and DISC into one wild ride. Know yourself. Own your energy.
          </p>

          {/* Phone preview */}
          <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24, maxWidth: 240 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Your Type</p>
            <p style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>INTJ-A</p>
            <p style={{ fontSize: 13, color: "#00C8FF", fontWeight: 700 }}>The Architect</p>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              {["O:78%", "C:85%", "E:42%"].map(s => (
                <span key={s} style={{ fontSize: 10, padding: "2px 8px", background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: 50, color: "#00C8FF" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 5vw, 64px)" }}>
        {/* Mobile logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00C8FF, #7800FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 900 }}>KnowYouRole</span>
        </div>

        {/* Form card */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "clamp(24px, 5vw, 40px)", width: "100%", maxWidth: 420 }}>
          {/* Tab toggle */}
          <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 12, marginBottom: 32 }}>
            {(["signin", "signup"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: mode === m ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "transparent", color: mode === m ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle} style={{ width: "100%", padding: "14px", background: "#fff", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, fontFamily: "'Outfit',sans-serif" }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Email */}
          <input type="email" placeholder="Email" style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 15, marginBottom: 12, outline: "none", fontFamily: "'Outfit',sans-serif", boxSizing: "border-box" }} />
          <input type="password" placeholder="Password" style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 15, marginBottom: 20, outline: "none", fontFamily: "'Outfit',sans-serif", boxSizing: "border-box" }} />

          <button onClick={handleSubmit} style={{ width: "100%", padding: "15px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 30px rgba(0,200,255,0.3)" }}>
            {mode === "signin" ? "Sign In" : "Get Started"}
          </button>

          {mode === "signin" && (
            <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#00C8FF", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Forgot password?</p>
          )}
        </div>

        <p style={{ marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", fontFamily: "'Outfit',sans-serif" }}>
          By continuing, you agree to our <Link href="/terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</Link> and <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
