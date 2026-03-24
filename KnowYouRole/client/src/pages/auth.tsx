import { Component, ReactNode, useState } from "react";
import { Link } from "wouter";
import { useAuth0 } from "@auth0/auth0-react";

/** Error boundary to prevent auth page from going blank if Auth0 fails */
class AuthErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(e: Error) {
    return { hasError: true, error: e.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", borderRadius: 20, padding: "24px 32px", maxWidth: 400, textAlign: "center" }}>
            <p style={{ color: "#ff3b30", fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Sign-In Currently Unavailable</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>Please try again in a moment.</p>
            <button onClick={() => (window.location.href = "/")} style={{ padding: "10px 24px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Go Home</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function SocialButton({ provider, label, icon, bgColor, textColor = "#fff" }: {
  provider: string; label: string; icon: string; bgColor: string; textColor?: string;
}) {
  const { loginWithRedirect } = useAuth0();
  const handleClick = () => {
    const params: Record<string, string> = {};
    if (provider !== "google-oauth2") params.connection = provider;
    loginWithRedirect({ authorizationParams: params }).catch(console.error);
  };
  return (
    <button onClick={handleClick} style={{
      width: "100%", padding: "14px", background: bgColor, border: "none", borderRadius: 14,
      fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex",
      alignItems: "center", justifyContent: "center", gap: 10, color: textColor,
      fontFamily: "'Outfit',sans-serif", transition: "opacity 0.2s",
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      <span style={{ fontSize: 18 }} dangerouslySetInnerHTML={{ __html: icon }} />
      {label}
    </button>
  );
}

function AuthContent() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { loginWithRedirect, isLoading, error: authError } = useAuth0();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    try {
      await loginWithRedirect({
        authorizationParams: { login_hint: email },
      });
    } catch (err) { console.error("Login error:", err); }
  };

  if (authError) {
    return (
      <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", borderRadius: 20, padding: "24px 32px", maxWidth: 400, textAlign: "center" }}>
          <p style={{ color: "#ff3b30", fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Authentication Error</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{authError.message}</p>
          <button onClick={() => (window.location.href = "/")} style={{ marginTop: 16, padding: "10px 24px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Go Home</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(0,200,255,0.2)", borderTopColor: "#00C8FF", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
        <p style={{ color: "#00C8FF", fontSize: 14, fontWeight: 500 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-header { display: flex !important; }
        }
        @media (min-width: 768px) {
          .mobile-header { display: none !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>

      {/* DESKTOP TOP NAV */}
      <header style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #00C8FF, #7800FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>KnowYouRole</span>
        </Link>
        <nav className="desktop-nav" style={{ display: "flex", gap: 20 }}>
          {[["/", "Home"], ["/about", "About"], ["/faq", "FAQ"], ["/quiz", "Quiz"]].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontFamily: "'Outfit',sans-serif" }}>{label}</Link>
          ))}
        </nav>
      </header>

      {/* MOBILE HEADER */}
      <header className="mobile-header" style={{ display: "none", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #00C8FF, #7800FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>KnowYouRole</span>
        </Link>
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 4 }}>
          {mobileNavOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* MOBILE NAV DRAWER */}
      {mobileNavOpen && (
        <nav className="mobile-nav" style={{ display: "flex", flexDirection: "column", background: "rgba(5,5,16,0.98)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px 20px", gap: 4 }}>
          {[["/", "Home"], ["/about", "About"], ["/faq", "FAQ"], ["/quiz", "Quiz"]].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMobileNavOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "10px 0", fontFamily: "'Outfit',sans-serif", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{label}</Link>
          ))}
        </nav>
      )}

      {/* PAGE CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 5vw, 64px)" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "clamp(24px, 5vw, 40px)", width: "100%", maxWidth: 420 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, textAlign: "center", marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 28, fontFamily: "'Outfit',sans-serif" }}>
            {mode === "signin" ? "Sign in to access your results" : "Start your personality journey"}
          </p>

          {/* Social login buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <SocialButton
              provider="google-oauth2"
              label="Continue with Google"
              icon='<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>'
              bgColor="#fff"
              textColor="#3c4043"
            />
            <SocialButton
              provider="apple-one-tap"
              label="Continue with Apple"
              icon='<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>'
              bgColor="#000"
            />
            <SocialButton
              provider="twitter"
              label="Continue with X"
              icon='<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
              bgColor="#000"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Email */}
          <form onSubmit={handleEmailSubmit}>
            <input name="email" type="email" placeholder="Email" required style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 15, marginBottom: 12, outline: "none", fontFamily: "'Outfit',sans-serif", boxSizing: "border-box" }} />
            <input name="password" type="password" placeholder="Password" style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 15, marginBottom: 20, outline: "none", fontFamily: "'Outfit',sans-serif", boxSizing: "border-box" }} />
            <button type="submit" style={{ width: "100%", padding: "15px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 30px rgba(0,200,255,0.3)" }}>
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

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
  return (
    <AuthErrorBoundary>
      <AuthContent />
    </AuthErrorBoundary>
  );
}
