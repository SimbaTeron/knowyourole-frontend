import { useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalityThemeProvider } from "@/contexts/LocalityThemeContext";
import { AnimatedBackground } from "./components/layout/AnimatedBackground";
import NotFound from "@/pages/not-found";
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
      <Route path="/quiz" component={QuizGatewayPage} />
      <Route path="/crossroads" component={CrossroadsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocalityThemeProvider>
          <AnimatedBackground />
          <ScrollToTop />
          <Toaster />
          <Router />
        </LocalityThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
