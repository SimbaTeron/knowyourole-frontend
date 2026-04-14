import { useEffect, Component, ReactNode } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { isTestMode } from "@/utils/devTest";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DevToolPanel from "@/components/DevToolPanel";
import Home from "@/pages/home";
import MoodPage from "@/pages/mood";
import MoodMixerPage from "@/pages/mood-mixer";
import LocationPage from "@/pages/location";
import QuizPage from "@/pages/quiz";
import QuizGatewayPage from "@/pages/quiz-gateway";
import CheckoutSuccess from "@/pages/checkout-success";
import CheckoutCancel from "@/pages/checkout-cancel";
import CrossroadsPage from "@/pages/crossroads";
import ProfilePage from "@/pages/profile";
import Callback from "@/pages/callback";
import About from "@/pages/about";
import AuthPage from "@/pages/auth";
import Faq from "@/pages/faq";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Careers from "@/pages/careers";
import ResultsPage from "@/pages/results";

/** Root-level error boundary — catches any uncaught error in the entire app */
class RootErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(e: Error) {
    return { hasError: true, error: e?.message ?? "An unexpected error occurred" };
  }
  componentDidCatch(e: Error, info: any) {
    console.error("[RootErrorBoundary]", e, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", borderRadius: 20, padding: "24px 32px", maxWidth: 420, textAlign: "center" }}>
            <p style={{ color: "#ff3b30", fontSize: 16, marginBottom: 8, fontWeight: 700 }}>Something went wrong</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>{this.state.error}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: "" }); window.location.href = "/"; }}
              style={{ padding: "10px 24px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Test mode: /?test=true → Home with test data loaded (dev panel shortcut) */}
      <Route path="/">{() => {
        if (new URLSearchParams(window.location.search).get("test") === "true") {
          // Set fake session data and show Home page — dev panel controls which page to go to next
          const fakeScores = {
            mbti: { E: 1, I: 3, S: 2, N: 3, T: 3, F: 1, J: 3, P: 1 },
            disc: { D: 4, I: 1, S: 2, C: 3 },
            bigFive: { O: 75, C: 85, E: 45, A: 60, N: 38 },
          };
          sessionStorage.setItem("knowrole-tier", "25+");
          sessionStorage.setItem("kyr_tier", "25+");
          sessionStorage.setItem("knowrole-mood-blend", "Focused + Curious Blend");
          localStorage.setItem("kyr_mood_blend", JSON.stringify({ mood1: "focused", mood2: "curious", label: "Focused + Curious Blend" }));
          sessionStorage.setItem("kyr_fake_scores", JSON.stringify(fakeScores));
          sessionStorage.setItem("kyr_fake_type", "INTJ-A");
          // Don't redirect — show Home page so dev can navigate wherever they want
        }
        return <Home />;
      }}</Route>
      <Route path="/mood" component={MoodPage} />
      <Route path="/mood-mixer" component={MoodMixerPage} />
      <Route path="/location" component={LocationPage} />
      <Route path="/pre-quiz">{() => <Redirect to="/quiz" />}</Route>
      <Route path="/quiz/gateway" component={QuizGatewayPage} />
      <Route path="/quiz/questions" component={QuizPage} />
      <Route path="/quiz" component={QuizGatewayPage} />
      <Route path="/crossroads" component={CrossroadsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/checkout-success" component={CheckoutSuccess} />
      <Route path="/checkout-cancel" component={CheckoutCancel} />
      <Route path="/callback" component={Callback} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={About} />
      <Route path="/faq" component={Faq} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/careers" component={Careers} />
      <Route path="/results" component={ResultsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <DevToolPanel />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}

export default App;
