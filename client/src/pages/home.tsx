import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PathCanvas from "@/components/PathCanvas";
import KnowRoleHeader from "@/components/KnowRoleHeader";
import StepIndicator from "@/components/StepIndicator";
import AgeTierSelector from "@/components/AgeTierSelector";
import MoodSelector from "@/components/MoodSelector";
import FunModeToggle from "@/components/FunModeToggle";
import PostalInput from "@/components/PostalInput";
import LandmarkBadge from "@/components/LandmarkBadge";
import StartButton from "@/components/StartButton";
import FeedbackModal from "@/components/FeedbackModal";
import { ThemeMode, RandomTheme } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

interface LandmarkInfo {
  landmark: string;
  class: string;
  lucideIcon: string;
  type: string;
  city?: string;
  country?: string;
}

type Step = "tier" | "mood" | "postal" | "ready";

export default function Home() {
  const [ageTier, setAgeTier] = useState<string | null>(null);
  const [mood, setMood] = useState("");
  const [funMode, setFunMode] = useState(false);
  const [landmark, setLandmark] = useState<LandmarkInfo | null>(null);
  const [step, setStep] = useState<Step>("tier");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [randomTheme, setRandomTheme] = useState<RandomTheme | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackTriggeredRef = useRef(false);
  const hasStartedRef = useRef(false);
  const { toast } = useToast();

  const shouldShowFeedback = useCallback(() => {
    return Math.random() < 0.5;
  }, []);

  useEffect(() => {
    if (step === "ready" && !feedbackTriggeredRef.current && hasStartedRef.current) {
      if (shouldShowFeedback()) {
        const timer = setTimeout(() => {
          setShowFeedback(true);
          feedbackTriggeredRef.current = true;
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [step, shouldShowFeedback]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (step !== "tier" && !feedbackTriggeredRef.current && shouldShowFeedback()) {
        feedbackTriggeredRef.current = true;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, shouldShowFeedback]);

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const handleThemeChange = (newTheme: ThemeMode, newRandomTheme?: RandomTheme) => {
    setTheme(newTheme);
    localStorage.setItem("knowrole-theme", newTheme);
    
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    document.body.classList.remove(
      "sunburst-trail-vibe", "neon-urban-vibe", "forest-whisper-vibe",
      "ocean-drift-vibe", "desert-bloom-vibe", "city-pulse-vibe", "meadow-dream-vibe"
    );

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
      setRandomTheme(null);
    } else if (newTheme === "light") {
      document.documentElement.classList.add("light-clinical");
      setRandomTheme(null);
    } else if (newTheme === "random" && newRandomTheme) {
      setRandomTheme(newRandomTheme);
      document.body.classList.add(`${newRandomTheme.id}-vibe`);
    }
  };

  const handleTierSelect = (tierId: string) => {
    setAgeTier(tierId);
    setTimeout(() => setStep("mood"), 250);
  };

  const handleMoodComplete = () => {
    if (mood) {
      setStep("postal");
    }
  };

  const handleLandmarkFound = (info: LandmarkInfo | null) => {
    setLandmark(info);
    setStep("ready");
  };

  const handleSkipPostal = () => {
    setLandmark(null);
    setStep("ready");
  };

  const handleBack = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    if (step === "mood") setStep("tier");
    else if (step === "postal") setStep("mood");
    else if (step === "ready") setStep("postal");
  };

  const handleStart = () => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    hasStartedRef.current = true;
    toast({
      title: "Your journey begins",
      description: landmark 
        ? `Exploring your ${landmark.landmark} inspired path...`
        : "Mapping your personalized discovery path...",
    });

    if (!feedbackTriggeredRef.current && shouldShowFeedback()) {
      setTimeout(() => {
        setShowFeedback(true);
        feedbackTriggeredRef.current = true;
      }, 2000);
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case "tier": return 1;
      case "mood": return 2;
      case "postal": return 3;
      case "ready": return 4;
      default: return 1;
    }
  };

  const getThemeClass = () => {
    if (theme === "random" && randomTheme) {
      return `${randomTheme.id}-vibe`;
    }
    if (theme === "dark") return "dark-mysterious";
    return "light-clinical";
  };

  return (
    <div className={`min-h-screen grain-overlay ${getThemeClass()}`}>
      <PathCanvas />
      <KnowRoleHeader 
        theme={theme} 
        randomTheme={randomTheme} 
        onThemeChange={handleThemeChange} 
      />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 pt-32 pb-24">
        <div className="w-full max-w-sm">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <p
              className="text-subhead text-warm-gray dark:text-soft-cream max-w-xs mx-auto leading-6"
              data-testid="text-subtitle"
            >
              Chart your everyday path to discover traits, sparks, and growth
            </p>
          </motion.div>

          <StepIndicator currentStep={getStepNumber()} totalSteps={4} />

          <div className="floating-card">
            <div className="premium-card rounded-2xl p-7 md:p-8">
              <AnimatePresence mode="wait">
                {step === "tier" && (
                  <motion.div
                    key="tier"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AgeTierSelector selectedTier={ageTier} onSelect={handleTierSelect} />
                  </motion.div>
                )}

                {step === "mood" && (
                  <motion.div
                    key="mood"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-sm font-medium text-terracotta/80 transition-colors hover:text-terracotta"
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <MoodSelector mood={mood} onMoodChange={setMood} />
                    
                    <FunModeToggle enabled={funMode} onToggle={setFunMode} />

                    <StartButton
                      disabled={!mood}
                      onClick={handleMoodComplete}
                      label="Continue"
                    />
                  </motion.div>
                )}

                {step === "postal" && (
                  <motion.div
                    key="postal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-sm font-medium text-terracotta/80 transition-colors hover:text-terracotta"
                      data-testid="button-back-postal"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <PostalInput
                      onLandmarkFound={handleLandmarkFound}
                      onSkip={handleSkipPostal}
                    />
                  </motion.div>
                )}

                {step === "ready" && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-sm font-medium text-terracotta/80 transition-colors hover:text-terracotta"
                      data-testid="button-back-ready"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <div className="text-center space-y-5">
                      <div>
                        <h2 className="text-headline text-warm-gray dark:text-soft-cream mb-1">
                          You're all set
                        </h2>
                        <p className="text-subhead text-warm-gray dark:text-soft-cream text-sm">
                          Your personalized path awaits
                        </p>
                      </div>

                      {landmark && (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex justify-center py-2"
                        >
                          <LandmarkBadge
                            landmark={landmark.landmark}
                            lucideIcon={landmark.lucideIcon}
                            themeClass={landmark.class}
                            city={landmark.city}
                          />
                        </motion.div>
                      )}

                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-terracotta/8 text-terracotta text-xs font-medium">
                          {ageTier}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-sage-green/10 text-sage-green text-xs font-medium capitalize">
                          {mood}
                        </span>
                        {funMode && (
                          <span className="px-3 py-1.5 rounded-full bg-dusty-blue/10 text-dusty-blue text-xs font-medium">
                            Fun Mode
                          </span>
                        )}
                      </div>
                    </div>

                    <StartButton onClick={handleStart} label="Begin Your Journey" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 py-5 text-center">
        <p className="text-sm italic font-handwritten text-warm-gray/50 dark:text-soft-cream/40 cursor-pointer hover:text-terracotta transition-colors">
          Unfold your trait trail →
        </p>
      </footer>

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        tier={ageTier || undefined}
        selectedTheme={theme}
      />
    </div>
  );
}
