import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DarkModeToggle() {
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
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="text-indigo-deep dark:text-nebula-core"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-testid="button-dark-mode"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
