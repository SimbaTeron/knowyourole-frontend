import { useState, useCallback } from "react";

const AUTH0_DOMAIN = "dev-f0lrnyg4uigdvae1.us.auth0.com";
const CLIENT_ID = "edp3GnoatCBItXXQiu6jsxjL0Tc3CTIM";
const DB_CONNECTION = "Username-Password-Authentication";

interface AuthResult {
  access_token?: string;
  id_token?: string;
  error?: string;
  description?: string;
}

async function auth0DbAction(action: "signup" | "login", email: string, password: string): Promise<AuthResult> {
  if (action === "signup") {
    const res = await fetch(`https://${AUTH0_DOMAIN}/dbconnections/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: CLIENT_ID, email, password, connection: DB_CONNECTION }),
    });
    return res.json();
  } else {
    const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/ro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        username: email,
        password,
        grant_type: "password",
        connection: DB_CONNECTION,
        scope: "openid profile email",
      }),
    });
    return res.json();
  }
}

async function auth0GooglePopup(): Promise<{ access_token?: string; id_token?: string; error?: string }> {
  const width = 400;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(
    `https://${AUTH0_DOMAIN}/authorize?response_type=token%20id_token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + "/callback")}&scope=openid%20profile%20email&nonce=b_${Date.now()}&connection=google-oauth2`,
    "auth0-google",
    `width=${width},height=${height},left=${left},top=${top},popup=1`
  );

  return new Promise((resolve) => {
    if (!popup) {
      resolve({ error: "Popup was blocked. Please allow popups for this site." });
      return;
    }
    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          resolve({ error: "Authentication was cancelled." });
          return;
        }
        const hash = popup.location.hash;
        if (hash && hash.includes("access_token")) {
          popup.close();
          clearInterval(interval);
          const params = new URLSearchParams(hash.substring(1));
          resolve({ access_token: params.get("access_token") ?? undefined, id_token: params.get("id_token") ?? undefined });
        }
      } catch (_) {
        // cross-origin still loading â€” wait
      }
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      if (!popup.closed) popup.close();
      resolve({ error: "Authentication timed out." });
    }, 120_000);
  });
}

export default function AuthFormEmbedded() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await auth0DbAction(mode === "signin" ? "login" : "signup", email.trim(), password);
      if (result.error) {
        setError(result.description || result.error);
        setLoading(false);
        return;
      }

      if (result.access_token || result.id_token) {
        const token = result.access_token || result.id_token!;
        // Decode JWT payload (no verification — Auth0 already validated)
        const payload = JSON.parse(atob(token.split(".")[1]));
        const user = {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        };
        sessionStorage.setItem("auth0_token", token);
        sessionStorage.setItem("auth0_user", JSON.stringify(user));
        // Trigger Auth0 SDK re-sync by dispatching storage event
        window.dispatchEvent(new StorageEvent("storage", { key: "auth0_token", newValue: token }));
        setSuccess(true);
        setTimeout(() => window.location.reload(), 800);
      } else if (mode === "signup") {
        // Auth0 signup returns {} on success â€” prompt login
        setSuccess(true);
        setError(null);
        setMode("signin");
        setLoading(false);
      } else {
        setError("Unexpected response from server.");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [mode, email, password]);

  const handleGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    const result = await auth0GooglePopup();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result.access_token) {
      const payload = JSON.parse(atob(result.access_token.split(".")[1]));
      sessionStorage.setItem("auth0_token", result.access_token);
      sessionStorage.setItem("auth0_user", JSON.stringify({
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      }));
      window.dispatchEvent(new StorageEvent("storage", { key: "auth0_token", newValue: result.access_token }));
      setTimeout(() => window.location.reload(), 500);
    }
  }, []);

  const buttonColor = "#7800FF";

  return (
    <div style={{ width: "100%", maxWidth: 400, margin: "0 auto", fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
          {mode === "signin" ? "Welcome back" : "Create account"}
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          {mode === "signin" ? "Sign in to see your results" : "Start for free â€” takes 30 seconds"}
        </div>
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        style={{
          width: "100%",
          padding: "13px 20px",
          background: "#fff",
          color: "#1a1a2e",
          border: "none",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 20,
          opacity: loading ? 0.6 : 1,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: "13px 16px",
              background: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              color: "#fff",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'Outfit', sans-serif",
            }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <input
            type="password"
            placeholder={mode === "signup" ? "Create a password (8+ chars)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={{
              width: "100%",
              padding: "13px 16px",
              background: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              color: "#fff",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'Outfit', sans-serif",
            }}
          />
        </div>

        {error && (
          <div style={{
            padding: "10px 14px",
            background: "rgba(255,50,50,0.12)",
            border: "1px solid rgba(255,80,80,0.25)",
            borderRadius: 8,
            color: "#ff6060",
            fontSize: 13,
            marginBottom: 14,
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        {success && mode === "signup" && (
          <div style={{
            padding: "10px 14px",
            background: "rgba(50,200,100,0.1)",
            border: "1px solid rgba(50,200,100,0.25)",
            borderRadius: 8,
            color: "#6effc0",
            fontSize: 13,
            marginBottom: 14,
            textAlign: "center",
          }}>
            Account created! Signing you in now...
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: mode === "signup" ? `linear-gradient(135deg, ${buttonColor}, #00C8FF)` : buttonColor,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {loading
            ? (mode === "signup" ? "Creating account..." : "Signing in...")
            : (mode === "signup" ? "Create Account" : "Sign In")}
        </button>
      </form>

      {/* Toggle */}
      <p style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
        <span
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
          style={{ color: "#00C8FF", cursor: "pointer", fontWeight: 600 }}
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </span>
      </p>
    </div>
  );
}

