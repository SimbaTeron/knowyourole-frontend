import { Sun, Moon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeMode, RandomTheme } from "@/components/ThemeToggle";
import randomThemesData from "@/data/random-themes.json";

interface MobileThemeFABProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode, randomTheme?: RandomTheme) => void;
}

export default function MobileThemeFAB({ currentTheme, onThemeChange }: MobileThemeFABProps) {
  const triggerHaptic = (duration = 30) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  const cycleTheme = () => {
    triggerHaptic(30);
    if (currentTheme === "light") {
      onThemeChange("dark");
    } else if (currentTheme === "dark") {
      const themes = randomThemesData.themes;
      const randomIndex = Math.floor(Math.random() * themes.length);
      onThemeChange("random", themes[randomIndex]);
    } else {
      onThemeChange("light");
    }
  };

  const getThemeIcon = () => {
    if (currentTheme === "dark") return <Moon className="w-5 h-5" />;
    if (currentTheme === "random") return <Sparkles className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  const getThemeLabel = () => {
    if (currentTheme === "dark") return "Dark";
    if (currentTheme === "random") return "Random";
    return "Light";
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      onClick={cycleTheme}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-terracotta shadow-lg shadow-terracotta/30 flex items-center justify-center text-white md:hidden"
      aria-label={`Current theme: ${getThemeLabel()}. Tap to change.`}
      data-testid="button-mobile-theme-fab"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTheme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {getThemeIcon()}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
