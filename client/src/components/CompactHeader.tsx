import { ArrowLeft, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeMode } from "@/components/ThemeToggle";
import UserMenu from "./UserMenu";

interface CompactHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export default function CompactHeader({
  onBack,
  showBack = true,
  currentTheme,
  onThemeChange,
}: CompactHeaderProps) {
  const triggerHaptic = (duration = 30) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  const toggleTheme = () => {
    triggerHaptic(20);
    onThemeChange(currentTheme === "light" ? "dark" : "light");
  };

  const getThemeIcon = () => {
    return currentTheme === "dark" 
      ? <Moon className="w-4 h-4" /> 
      : <Sun className="w-4 h-4" />;
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 h-[60px] backdrop-blur-xl bg-soft-cream/80 dark:bg-[#0A0A0F]/90 border-b border-terracotta/8 dark:border-[#A78BFA]/10"
      data-testid="compact-header"
    >
      <div className="h-full max-w-md mx-auto px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              onClick={() => {
                triggerHaptic(30);
                onBack();
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-warm-gray dark:text-[#F8FAFC] hover:bg-terracotta/10 dark:hover:bg-[#A78BFA]/10 transition-colors"
              aria-label="Go back"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-semibold compass-gradient-text dark:bg-gradient-to-r dark:from-[#A78BFA] dark:via-[#C4B5FD] dark:to-[#67E8F9] dark:bg-clip-text dark:text-transparent tracking-tight">
            knowrole
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-soft-cream/60 dark:bg-[#12121A]/80 backdrop-blur-sm border border-terracotta/8 dark:border-[#A78BFA]/20 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20 dark:hover:border-[#A78BFA]/40 text-warm-gray dark:text-[#A78BFA]"
            aria-label={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
            data-testid="button-compact-theme"
          >
            {getThemeIcon()}
          </button>
          <UserMenu compact />
        </div>
      </div>
    </motion.header>
  );
}
