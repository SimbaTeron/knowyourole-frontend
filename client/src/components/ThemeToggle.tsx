import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export type ThemeMode = "light" | "dark";

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const triggerHaptic = (duration = 30) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

export default function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  const handleToggle = () => {
    triggerHaptic(30);
    const newTheme = currentTheme === "light" ? "dark" : "light";
    onThemeChange(newTheme);
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.95 }}
      className="w-12 h-12 rounded-xl bg-soft-cream/80 dark:bg-deep-cream/60 backdrop-blur-sm border border-terracotta/8 dark:border-sunset-amber/20 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20 dark:hover:border-sunset-amber/30"
      aria-label={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
      data-testid="button-theme-toggle"
    >
      <motion.div
        initial={false}
        animate={{ rotate: currentTheme === "dark" ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {currentTheme === "dark" ? (
          <Moon className="w-8 h-8 text-sunset-amber" />
        ) : (
          <Sun className="w-8 h-8 text-terracotta" />
        )}
      </motion.div>
    </motion.button>
  );
}
