import { Moon, Sun, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function KnowRoleHeader() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("knowrole-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("knowrole-theme", "light");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-9 h-9 rounded-xl bg-soft-cream/80 dark:bg-deep-cream/60 backdrop-blur-sm border border-terracotta/8 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20"
              aria-label="Help"
              data-testid="button-help"
            >
              <HelpCircle className="h-4 w-4 text-warm-gray/60 dark:text-soft-cream/60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 bg-warm-white dark:bg-deep-cream border-terracotta/10" align="start">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-warm-gray dark:text-soft-cream">How it works</h4>
              <p className="text-xs text-warm-gray/70 dark:text-soft-cream/60 leading-relaxed">
                Answer a few quick questions to discover your personality traits. Your responses help us map your unique path of growth and self-discovery.
              </p>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex flex-col items-center">
          <h1
            className="text-display compass-gradient-text"
            data-testid="text-title"
          >
            KnowRole
          </h1>
          <p className="text-micro text-warm-gray/50 dark:text-soft-cream/40 mt-1">
            Your everyday compass
          </p>
        </div>

        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl bg-soft-cream/80 dark:bg-deep-cream/60 backdrop-blur-sm border border-terracotta/8 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          data-testid="button-dark-mode"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-terracotta" />
          ) : (
            <Moon className="h-4 w-4 text-warm-gray/60" />
          )}
        </button>
      </div>
    </header>
  );
}
