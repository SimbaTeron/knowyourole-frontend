import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, SkipForward } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import CompactHeader from "@/components/CompactHeader";
import { ThemeMode } from "@/components/ThemeToggle";
import MagneticOrbitMixer from "@/components/MagneticOrbitMixer";

export default function MoodMixerPage() {
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [hasBrewedMood, setHasBrewedMood] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    if (stored && (stored === "light" || stored === "dark")) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
    
    const storedMood = sessionStorage.getItem("knowrole-mood");
    if (!storedMood) {
      setLocation("/mood");
    }
  }, [setLocation]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("knowrole-theme", newTheme);
    
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  };

  const handleContinue = () => {
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    setLocation("/location");
  };

  const handleSkip = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    setLocation("/location");
  };

  const handleBack = () => {
    setLocation("/mood");
  };

  const getThemeClass = () => {
    return theme === "dark" ? "dark-mysterious" : "light-clinical";
  };

  const handleMoodBrewed = () => {
    setHasBrewedMood(true);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${getThemeClass()}`}>
      <PathCanvas />
      <CompactHeader
        onBack={handleBack}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />
      <main className="relative z-10 pt-16 pb-32 px-4 min-h-screen flex flex-col text-[20px]">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-display font-semibold compass-gradient-text mb-3">How are you feeling?
            Your mood helps us personalize your journey</h1>
            <p className="text-warm-gray/70 dark:text-soft-cream/60 text-base max-w-sm mx-auto">
              Tap two ingredients below to create your unique mood blend. This helps us understand your mindset right now.
            </p>
          </motion.div>

          <MagneticOrbitMixer onMoodBrewed={handleMoodBrewed} />
          
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-deep-cream dark:via-deep-cream/95 pb-8">
        <div className="max-w-md mx-auto space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleContinue}
            className="w-full py-5 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 trail-button text-white"
            data-testid="button-continue-mixer"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={handleSkip}
            className="w-full py-3 text-sm text-warm-gray/50 dark:text-soft-cream/40 flex items-center justify-center gap-1 hover:text-warm-gray/70 dark:hover:text-soft-cream/60 transition-colors"
            data-testid="button-skip-mixer"
          >
            <SkipForward className="w-4 h-4" />
            Skip this step
          </motion.button>
        </div>
      </div>
    </div>
  );
}
