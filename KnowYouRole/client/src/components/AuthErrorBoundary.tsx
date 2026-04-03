import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

/** Catches React rendering errors and shows a clean error message instead of a blank page */
export default class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(e: Error): State {
    return { hasError: true, error: e?.message ?? "An unexpected error occurred" };
  }

  componentDidCatch(e: Error, info: unknown): void {
    console.error("[AuthErrorBoundary]", e, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050510",
          color: "#fff",
          fontFamily: "'Outfit', sans-serif",
          padding: "20px",
          textAlign: "center",
        }}>
          <div>
            <h2 style={{ color: "#ff4444", marginBottom: "8px" }}>Something went wrong</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: "" })}
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #7800FF, #00C8FF)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
