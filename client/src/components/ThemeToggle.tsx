import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import randomThemesData from "@/data/random-themes.json";

export type ThemeMode = "light" | "dark" | "random";

export interface RandomTheme {
  id: string;
  name: string;
  description: string;
  class: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  motif: string;
}

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
      className="relative p-2 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors"
      whileTap={{ scale: 0.92 }}
      aria-label={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: currentTheme === "light" ? 0 : 180 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-5 h-5"
      >
        {currentTheme === "light" ? (
          <Sun className="w-5 h-5 text-amber-600" />
        ) : (
          <Moon className="w-5 h-5 text-violet-400" />
        )}
      </motion.div>
    </motion.button>
  );
}
