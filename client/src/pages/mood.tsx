import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, BookOpen, HelpCircle, ArrowRight, SkipForward } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import CompactHeader from "@/components/CompactHeader";
import { ThemeMode } from "@/components/ThemeToggle";
import EmojiMoodMixer from "@/components/EmojiMoodMixer";

const MOODS = [
  { id: "energized", label: "Energized", desc: "Ready to take on anything", icon: Zap },
  { id: "stuck", label: "Stuck", desc: "Looking for direction", icon: HelpCircle },
  { id: "reflective", label: "Reflective", desc: "In a thoughtful headspace", icon: BookOpen },
];

export default function MoodPage() {
  const [, setLocation] = useLocation();
  const [mood, setMood] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    const storedMood = sessionStorage.getItem("knowrole-mood");
    if (stored && (stored === "light" || stored === "dark")) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
    if (storedMood) {
      setMood(storedMood);
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

  const handleMoodSelect = (moodId: string) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setMood(moodId);
    sessionStorage.setItem("knowrole-mood", moodId);
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
    setLocation("/");
  };

  const getThemeClass = () => {
    return theme === "dark" ? "dark-mysterious" : "light-clinical";
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${getThemeClass()}`}>
      <PathCanvas />
      <CompactHeader
        onBack={handleBack}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />
      <main className="relative z-10 pt-24 pb-32 px-4 min-h-screen flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-display font-semibold compass-gradient-text mb-3">
              How are you feeling today?
            </h1>
            <p className="text-warm-gray/70 dark:text-soft-cream/60 text-base">
              Your current state helps personalize your journey
            </p>
          </motion.div>

          {/* Mood Mixer - Now at top */}
          <EmojiMoodMixer />

          {/* 3 Mood Icon Buttons - Side by side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="flex justify-center gap-4">
              {MOODS.map((moodOption, index) => {
                const Icon = moodOption.icon;
                const isSelected = mood === moodOption.id;
                
                return (
                  <motion.button
                    key={moodOption.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                    }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() => handleMoodSelect(moodOption.id)}
                    className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-br from-terracotta to-sunset-amber shadow-lg shadow-terracotta/30 scale-110"
                        : "bg-warm-gray/10 dark:bg-soft-cream/10 hover:bg-warm-gray/20 dark:hover:bg-soft-cream/20"
                    }`}
                    data-testid={`button-mood-${moodOption.id}`}
                  >
                    {/* Pulse animation for unselected */}
                    {!mood && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-terracotta/30"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                      />
                    )}
                    
                    {/* Selection ring */}
                    {isSelected && (
                      <motion.div
                        layoutId="mood-ring"
                        className="absolute inset-0 rounded-2xl ring-2 ring-white/50"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    <Icon className={`w-8 h-8 ${
                      isSelected 
                        ? "text-white" 
                        : "text-terracotta dark:text-sunset-amber"
                    }`} />
                  </motion.button>
                );
              })}
            </div>

            {/* Selected mood label - appears below icons */}
            <AnimatePresence mode="wait">
              {mood && (
                <motion.div
                  key={mood}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 text-center"
                >
                  <h3 className="text-xl font-semibold text-warm-gray dark:text-soft-cream">
                    {MOODS.find(m => m.id === mood)?.label}
                  </h3>
                  <p className="text-warm-gray/60 dark:text-soft-cream/50 mt-1 text-[18px]">
                    {MOODS.find(m => m.id === mood)?.desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint text when no selection */}
            {!mood && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center text-sm text-warm-gray/40 dark:text-soft-cream/30"
              >
                Tap an icon to select your mood
              </motion.p>
            )}
          </motion.div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-deep-cream dark:via-deep-cream/95 pb-8">
        <div className="max-w-md mx-auto space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleContinue}
            disabled={!mood}
            className={`w-full py-5 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              mood
                ? "trail-button text-white"
                : "bg-warm-gray/20 text-warm-gray/40 dark:bg-deep-cream/40 dark:text-soft-cream/30 cursor-not-allowed"
            }`}
            data-testid="button-continue-mood"
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
            data-testid="button-skip-mood"
          >
            <SkipForward className="w-4 h-4" />
            Skip this step
          </motion.button>
        </div>
      </div>
    </div>
  );
}
