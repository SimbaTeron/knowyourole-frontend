import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Beaker } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import CompactHeader from "@/components/CompactHeader";
import { ThemeMode } from "@/components/ThemeToggle";
import MoodAlchemyLab from "@/components/MoodAlchemyLab";

export default function MoodMixerPage() {
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [hasBrewedMood, setHasBrewedMood] = useState(false);
  const [blendName, setBlendName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    if (stored && (stored === "light" || stored === "dark")) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
    
  }, []);

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
    setLocation("/pre-quiz");
  };

  const handleBack = () => {
    setLocation("/");
  };

  const getThemeClass = () => {
    return theme === "dark" ? "dark-mysterious" : "light-clinical";
  };

  const handleMoodBrewed = (mood1: string, mood2: string, name: string) => {
    setHasBrewedMood(true);
    setBlendName(name);
  };

  const handleSkipNeutral = () => {
    setHasBrewedMood(true);
    setBlendName("Balanced Explorer");
    setTimeout(() => setLocation("/pre-quiz"), 300);
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
            className="text-center mb-4"
          >
            <motion.div 
              className="inline-flex items-center justify-center gap-2 mb-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Beaker className="w-7 h-7 text-purple-500 dark:text-purple-400" />
              </motion.div>
              <span className="text-xs uppercase tracking-widest text-purple-600/70 dark:text-purple-400/70 font-medium">
                Mood Alchemy Lab
              </span>
            </motion.div>
            <h1 className="md:text-4xl font-display font-semibold compass-gradient-text mb-3 text-[36px]">
              How are you feeling?
            </h1>
            <p className="text-warm-gray/70 dark:text-[#94A3B8] max-w-sm mx-auto text-[16px]">
              Tap two moods to brew your unique blend. This personalizes your questions and boosts specific traits.
            </p>
          </motion.div>

          <MoodAlchemyLab 
            onMoodBrewed={handleMoodBrewed} 
            onSkip={handleSkipNeutral}
          />
          
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-[#0A0A0F] dark:via-[#0A0A0F]/95 pb-8">
        <div className="max-w-md mx-auto space-y-2">
          {hasBrewedMood && blendName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-2"
            >
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Your blend: {blendName}
              </span>
            </motion.div>
          )}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleContinue}
            className="w-full py-5 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 trail-button text-white"
            data-testid="button-continue-mixer"
          >
            {hasBrewedMood ? "Continue with Your Blend" : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
