import { ArrowLeft, Sun, Moon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeMode, RandomTheme } from "@/components/ThemeToggle";

interface CompactHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  currentTheme: ThemeMode;
  currentRandomTheme: RandomTheme | null;
  onThemeChange: (theme: ThemeMode, randomTheme?: RandomTheme) => void;
}

export default function CompactHeader({
  onBack,
  showBack = true,
  currentTheme,
  currentRandomTheme,
  onThemeChange,
}: CompactHeaderProps) {
  const triggerHaptic = (duration = 30) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  const cycleTheme = () => {
    triggerHaptic(20);
    if (currentTheme === "light") {
      onThemeChange("dark");
    } else if (currentTheme === "dark") {
      onThemeChange("random");
    } else {
      onThemeChange("light");
    }
  };

  const getThemeIcon = () => {
    if (currentTheme === "dark") return <Moon className="w-4 h-4" />;
    if (currentTheme === "random") return <Sparkles className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 h-[60px] backdrop-blur-xl bg-soft-cream/80 dark:bg-deep-cream/80 border-b border-terracotta/8"
      data-testid="compact-header"
    >
      <div className="h-full max-w-md mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              onClick={() => {
                triggerHaptic(30);
                onBack();
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-warm-gray dark:text-soft-cream/80 hover:bg-terracotta/10 transition-colors"
              aria-label="Go back"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-semibold compass-gradient-text tracking-tight">
            knowrole
          </h1>
        </div>

        <button
          onClick={cycleTheme}
          className="w-10 h-10 rounded-xl bg-soft-cream/60 dark:bg-deep-cream/40 backdrop-blur-sm border border-terracotta/8 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20 text-warm-gray dark:text-soft-cream"
          aria-label={`Current theme: ${currentTheme}. Tap to change.`}
          data-testid="button-compact-theme"
        >
          {getThemeIcon()}
        </button>
      </div>
    </motion.header>
  );
}
