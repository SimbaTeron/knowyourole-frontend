import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

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
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        <div className="w-10" />
        
        <div className="flex flex-col items-center">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight compass-gradient-text"
            data-testid="text-title"
          >
            KnowRole
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-8 h-0.5 rounded-full bg-terracotta/40" />
            <div className="w-2 h-2 rounded-full bg-sage-green/60" />
            <div className="w-8 h-0.5 rounded-full bg-sage-green/40" />
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl bg-soft-cream dark:bg-deep-cream/80 border border-terracotta/10 dark:border-terracotta/20 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/30"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          data-testid="button-dark-mode"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-terracotta" />
          ) : (
            <Moon className="h-5 w-5 text-warm-gray" />
          )}
        </button>
      </div>
    </header>
  );
}
