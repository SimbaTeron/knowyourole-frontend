import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { X, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithPopup, loginWithRedirect, isAuthenticated } = useAuth0();

  const handleGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithPopup();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("popup")) {
        setError("Popup was blocked. Please allow popups for this site.");
      } else {
        setError(msg || "Google sign-in failed. Please try again.");
      }
      setLoading(false);
    }
  }, [loginWithPopup, onSuccess]);

  const handleEmailRedirect = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // Store returnTo so callback.tsx knows where to send the user after Auth0 processes the redirect
      sessionStorage.setItem("knowrole-auth-returnTo", "/results?page=2");
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin + "/callback",
          // screen_hint: 'signup' shows the registration screen,
          // screen_hint: 'login' shows the login screen
          screen_hint: mode === "signup" ? "signup" : "login",
        },
      });
      // Auth0 will redirect away — code after this line may not run
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [loginWithRedirect, mode]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          style={{
            width: "100%", maxWidth: 420,
            background: "linear-gradient(160deg, #12082a 0%, #0a0516 100%)",
            borderRadius: 24,
            border: "1px solid rgba(168,85,247,0.25)",
            boxShadow: "0 0 80px rgba(120,0,255,0.2), 0 40px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, rgba(120,0,255,0.15), rgba(0,200,255,0.08))",
            padding: "28px 28px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}>
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "rgba(255,255,255,0.06)", border: "none",
                borderRadius: "50%", width: 32, height: 32,
                color: "rgba(255,255,255,0.5)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🔐</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4, fontFamily: "'Outfit',sans-serif" }}>
              {mode === "signin" ? "Sign in to see your full results" : "Free forever — takes 30 seconds"}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 28px 28px" }}>
            {/* Google Button — PRIMARY */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: "100%", padding: "14px 20px",
                background: "#fff", color: "#1a1a2e",
                border: "none", borderRadius: 14,
                fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, marginBottom: 20, fontFamily: "'Outfit',sans-serif",
                opacity: loading ? 0.6 : 1, transition: "all 0.2s",
                boxShadow: "0 2px 12px rgba(255,255,255,0.15)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Outfit',sans-serif" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Email Button — redirects to Auth0 Universal Login */}
            <button
              type="button"
              onClick={handleEmailRedirect}
              disabled={loading}
              style={{
                width: "100%", padding: "14px 20px",
                background: mode === "signup"
                  ? "linear-gradient(135deg, #7800FF, #00C8FF)"
                  : "#7800FF",
                color: "#fff", border: "none",
                borderRadius: 12, fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                fontFamily: "'Outfit', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, transition: "all 0.2s",
                boxShadow: "0 4px 20px rgba(120,0,255,0.3)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />
                  Redirecting...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {mode === "signup" ? "Sign up with Email" : "Sign in with Email"}
                </>
              )}
            </button>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(255,50,50,0.1)",
                border: "1px solid rgba(255,80,80,0.2)",
                borderRadius: 10, color: "#ff7070",
                fontSize: 13, marginTop: 14,
                textAlign: "center", fontFamily: "'Outfit',sans-serif",
              }}>
                {error}
              </div>
            )}

            {/* Toggle */}
            <p style={{
              marginTop: 18, fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              textAlign: "center", fontFamily: "'Outfit',sans-serif",
            }}>
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
                style={{ color: "#00C8FF", cursor: "pointer", fontWeight: 600 }}
              >
                {mode === "signin" ? "Sign up free" : "Sign in"}
              </span>
            </p>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }}`}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
