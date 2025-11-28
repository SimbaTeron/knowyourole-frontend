import { useState } from "react";
import { Sun, Moon, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import randomThemesData from "@/data/random-themes.json";

export type ThemeMode = "light" | "dark" | "random";
export type RandomTheme = typeof randomThemesData.themes[number];

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  currentRandomTheme: RandomTheme | null;
  onThemeChange: (theme: ThemeMode, randomTheme?: RandomTheme) => void;
}

const triggerHaptic = (duration = 30) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

export default function ThemeToggle({ currentTheme, currentRandomTheme, onThemeChange }: ThemeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (theme: ThemeMode) => {
    triggerHaptic(30);
    
    if (theme === "random") {
      const themes = randomThemesData.themes;
      const randomIndex = Math.floor(Math.random() * themes.length);
      const selectedTheme = themes[randomIndex];
      console.log(`Theme: ${selectedTheme.id} - Openness proxy +1`);
      onThemeChange("random", selectedTheme);
    } else {
      onThemeChange(theme);
    }
    setIsOpen(false);
  };

  const getThemeIcon = () => {
    if (currentTheme === "dark") return <Moon className="w-4 h-4" />;
    if (currentTheme === "random") return <Sparkles className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  return (
    <>
      <button
        onClick={() => {
          triggerHaptic(20);
          setIsOpen(true);
        }}
        className="w-9 h-9 rounded-xl bg-soft-cream/80 dark:bg-deep-cream/60 backdrop-blur-sm border border-terracotta/8 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20"
        aria-label="Toggle theme"
        data-testid="button-theme-toggle"
      >
        {getThemeIcon()}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xs z-50 premium-card rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-warm-gray dark:text-soft-cream">
                  Choose Theme
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-gray/60 hover:text-warm-gray dark:text-soft-cream/60 dark:hover:text-soft-cream transition-colors"
                  data-testid="button-close-theme"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleThemeSelect("light")}
                  className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                    currentTheme === "light"
                      ? "bg-clinical-white border-warm-gray/20 shadow-sm"
                      : "bg-soft-cream/50 border-transparent hover:bg-soft-cream"
                  }`}
                  data-testid="button-theme-light"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-clinical-white border border-gray-200 flex items-center justify-center">
                      <Sun className="w-5 h-5 text-warm-gray" />
                    </div>
                    <div>
                      <span className="font-medium text-warm-gray block">Light</span>
                      <span className="text-xs text-warm-gray/60">Crisp & Clear</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleThemeSelect("dark")}
                  className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                    currentTheme === "dark"
                      ? "bg-mysterious-deep border-sunset-amber/30 shadow-sm"
                      : "bg-soft-cream/50 dark:bg-deep-cream/50 border-transparent hover:bg-soft-cream dark:hover:bg-deep-cream/80"
                  }`}
                  data-testid="button-theme-dark"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-mysterious-deep border border-sunset-amber/20 flex items-center justify-center">
                      <Moon className="w-5 h-5 text-sunset-amber" />
                    </div>
                    <div>
                      <span className={`font-medium block ${currentTheme === "dark" ? "text-soft-cream" : "text-warm-gray dark:text-soft-cream"}`}>
                        Dark
                      </span>
                      <span className={`text-xs ${currentTheme === "dark" ? "text-soft-cream/60" : "text-warm-gray/60 dark:text-soft-cream/50"}`}>
                        Mysterious & Warm
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleThemeSelect("random")}
                  className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                    currentTheme === "random"
                      ? "bg-gradient-to-r from-sunburst-orange/20 to-neon-cyan/20 border-vibrant-burst/30 shadow-sm"
                      : "bg-soft-cream/50 dark:bg-deep-cream/50 border-transparent hover:bg-soft-cream dark:hover:bg-deep-cream/80"
                  }`}
                  data-testid="button-theme-random"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sunburst-orange to-neon-magenta flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-warm-gray dark:text-soft-cream block">Random</span>
                      <span className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
                        {currentRandomTheme ? currentRandomTheme.name : "Surprise Burst"}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
