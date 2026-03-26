import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalityThemeProvider } from "@/contexts/LocalityThemeContext";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MoodPage from "@/pages/mood";
import MoodMixerPage from "@/pages/mood-mixer";
import LocationPage from "@/pages/location";
import QuizPage from "@/pages/quiz";
import CheckoutSuccess from "@/pages/checkout-success";
import CheckoutCancel from "@/pages/checkout-cancel";
import CrossroadsPage from "@/pages/crossroads";

// Lazy-load pages not needed on initial load to reduce bundle size
const ProfilePage = lazy(() => import("@/pages/profile"));
const About = lazy(() => import("@/pages/about"));
const Faq = lazy(() => import("@/pages/faq"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Careers = lazy(() => import("@/pages/careers"));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mood" component={MoodPage} />
      <Route path="/mood-mixer" component={MoodMixerPage} />
      <Route path="/location" component={LocationPage} />
      <Route path="/pre-quiz">{() => <Redirect to="/quiz" />}</Route>
      <Route path="/quiz" component={QuizPage} />
      <Route path="/crossroads" component={CrossroadsPage} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/profile">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        )}
      </Route>
      <Route path="/about">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <About />
          </Suspense>
        )}
      </Route>
      <Route path="/faq">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Faq />
          </Suspense>
        )}
      </Route>
      <Route path="/privacy">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Privacy />
          </Suspense>
        )}
      </Route>
      <Route path="/terms">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Terms />
          </Suspense>
        )}
      </Route>
      <Route path="/careers">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Careers />
          </Suspense>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocalityThemeProvider>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <ScrollToTop />
          <Toaster />
          <div id="main-content">
            <Router />
          </div>
          <CookieConsentBanner />
        </LocalityThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
