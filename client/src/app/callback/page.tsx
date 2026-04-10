'use client';

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Callback() {
  const { handleRedirectCallback, isAuthenticated, isLoading } = useAuth0();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        await handleRedirectCallback();
      } catch (err: any) {
        console.error("Auth0 callback error:", err);
        setError(err.message || "Sign-in failed");
      }
    }

    if (!isLoading && !isAuthenticated) {
      processCallback();
    }
  }, [isLoading, isAuthenticated, handleRedirectCallback]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Support returnTo from appState (set via loginWithRedirect)
      const returnTo = sessionStorage.getItem("knowrole-auth-returnTo");
      sessionStorage.removeItem("knowrole-auth-returnTo");
      window.location.href = returnTo || "/results?page=2";
    }
  }, [isLoading, isAuthenticated]);

  if (error) {
    return (
      <div style={{ background: "#050510", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 24 }}>
          <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", borderRadius: 20, padding: "24px 32px" }}>
            <p style={{ color: "#ff3b30", fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Sign-in failed</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{error}</p>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{ marginTop: 16, padding: "10px 24px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#050510", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(0,200,255,0.2)",
          borderTopColor: "#00C8FF",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px"
        }} />
        <p style={{ color: "#00C8FF", fontSize: 14, fontWeight: 500 }}>Signing you in...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
