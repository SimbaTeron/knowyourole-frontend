import { useState } from "react";
import { Link } from "wouter";
import { useAuth0 } from "@auth0/auth0-react";

function AuthContent() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { loginWithRedirect, isLoading, error: authError } = useAuth0();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin + "/callback",
        },
      });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: "google-oauth2",
          redirect_uri: window.location.origin + "/callback",
        },
      });
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  if (authError) {
    return (
      <div style={{
        background: "#050510",
        minHeight: "100vh",
        fontFamily: "'Outfit',sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <div style={{
          background: "rgba(255,59,48,0.1)",
          border: "1px solid rgba(255,59,48,0.3)",
          borderRadius: 20,
          padding: "24px 32px",
          maxWidth: 400,
          textAlign: "center",
        }}>
          <p style={{ color: "#ff3b30", fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Authentication Error</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{authError.message}</p>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              background: "linear-gradient(90deg, #00C8FF, #7800FF)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        background: "#050510",
        minHeight: "100vh",
        fontFamily: "'Outfit',sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid rgba(0,200,255,0.2)",
          borderTopColor: "#00C8FF",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: 16,
        }} />
        <p style={{ color: "#00C8FF", fontSize: 14, fontWeight: 500 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", display: "flex" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>

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

export default function AuthPage() {
  return <AuthContent />;
}
