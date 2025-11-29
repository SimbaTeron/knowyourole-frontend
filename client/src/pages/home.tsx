import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import PathCanvas from "@/components/PathCanvas";
import KnowRoleHeader from "@/components/KnowRoleHeader";
import AgeTierSelector from "@/components/AgeTierSelector";
import { ThemeMode, RandomTheme } from "@/components/ThemeToggle";

export default function Home() {
  const [, setLocation] = useLocation();
  const [ageTier, setAgeTier] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [randomTheme, setRandomTheme] = useState<RandomTheme | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const handleThemeChange = (newTheme: ThemeMode, newRandomTheme?: RandomTheme) => {
    setTheme(newTheme);
    localStorage.setItem("knowrole-theme", newTheme);
    
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    document.body.classList.remove(
      "sunburst-trail-vibe", "neon-urban-vibe", "forest-whisper-vibe",
      "ocean-drift-vibe", "desert-bloom-vibe", "city-pulse-vibe", "meadow-dream-vibe"
    );

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
      setRandomTheme(null);
    } else if (newTheme === "light") {
      document.documentElement.classList.add("light-clinical");
      setRandomTheme(null);
    } else if (newTheme === "random" && newRandomTheme) {
      setRandomTheme(newRandomTheme);
      document.body.classList.add(`${newRandomTheme.id}-vibe`);
    }
  };

  const handleTierSelect = (tierId: string) => {
    setAgeTier(tierId);
    sessionStorage.setItem("knowrole-tier", tierId);
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    setTimeout(() => setLocation("/mood"), 300);
  };

  const getThemeClass = () => {
    if (theme === "random" && randomTheme) {
      return `${randomTheme.id}-vibe`;
    }
    if (theme === "dark") return "dark-mysterious";
    return "light-clinical";
  };

  return (
    <div className={`min-h-screen grain-overlay ${getThemeClass()}`}>
      <PathCanvas />
      <KnowRoleHeader 
        theme={theme} 
        randomTheme={randomTheme} 
        onThemeChange={handleThemeChange} 
      />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 pt-32 pb-24">
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <p
              className="text-lg md:text-xl text-warm-gray dark:text-soft-cream max-w-sm mx-auto leading-relaxed"
              data-testid="text-subtitle"
            >
              Chart your everyday path to discover traits, sparks, and growth
            </p>
          </motion.div>

          <div className="floating-card">
            <div className="premium-card rounded-2xl p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key="tier"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AgeTierSelector selectedTier={ageTier} onSelect={handleTierSelect} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 py-5 text-center">
        <p className="text-sm italic font-handwritten text-warm-gray/50 dark:text-soft-cream/40 cursor-pointer hover:text-terracotta transition-colors">
          Unfold your trait trail
        </p>
      </footer>
    </div>
  );
}
