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
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="w-10" />
        
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight premium-gradient-text" data-testid="text-title">
            KnowRole
          </h1>
          <div className="h-1 w-16 mt-2 rounded-full bg-gradient-to-r from-spark-gold via-violet-echo to-pink-tide opacity-60" />
        </div>

        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl glass-card flex items-center justify-center transition-all duration-300 hover:scale-105"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          data-testid="button-dark-mode"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-spark-gold" />
          ) : (
            <Moon className="h-5 w-5 text-violet-echo" />
          )}
        </button>
      </div>
    </header>
  );
}
