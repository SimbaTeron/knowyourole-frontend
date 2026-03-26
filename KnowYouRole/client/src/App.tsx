import { useEffect, Component, ReactNode } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
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
      <Route path="/" component={Home} />
      <Route path="/mood" component={MoodMixerPage} />
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
      <DevToolPanel />
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
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}

export default App;
