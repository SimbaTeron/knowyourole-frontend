import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalityThemeProvider } from "@/contexts/LocalityThemeContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MoodPage from "@/pages/mood";
import MoodMixerPage from "@/pages/mood-mixer";
import LocationPage from "@/pages/location";
import QuizPage from "@/pages/quiz";
import CheckoutSuccess from "@/pages/checkout-success";
import CheckoutCancel from "@/pages/checkout-cancel";
import CrossroadsPage from "@/pages/crossroads";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mood" component={MoodPage} />
      <Route path="/mood-mixer" component={MoodMixerPage} />
      <Route path="/location" component={LocationPage} />
      <Route path="/quiz" component={QuizPage} />
      <Route path="/crossroads" component={CrossroadsPage} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocalityThemeProvider>
          <Toaster />
          <Router />
        </LocalityThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
