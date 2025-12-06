import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import KnowRoleHeader from "@/components/KnowRoleHeader";
import AgeTierSelector from "@/components/AgeTierSelector";
import { ThemeMode } from "@/components/ThemeToggle";

const ROTATING_TAGLINES = [
  { text: "Night owl or early bird?", icon: "sparkle" },
  { text: "What career fits your brain?", icon: "compass" },
  { text: "Discover traits you didn't know you had", icon: "sparkle" },
  { text: "Are you a leader or a listener?", icon: "compass" },
  { text: "Find your hidden superpowers", icon: "sparkle" },
  { text: "What makes you... you?", icon: "compass" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [ageTier, setAgeTier] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    if (stored && (stored === "light" || stored === "dark")) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("knowrole-theme", newTheme);
    
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  };

  const handleTierSelect = (tierId: string) => {
    setAgeTier(tierId);
    sessionStorage.setItem("knowrole-tier", tierId);
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    setTimeout(() => setLocation("/mood-mixer"), 300);
  };

  const getThemeClass = () => {
    return theme === "dark" ? "dark-mysterious" : "light-clinical";
  };

  return (
    <div className={`min-h-screen grain-overlay ${getThemeClass()}`}>
      <PathCanvas />
      <KnowRoleHeader 
        theme={theme} 
        onThemeChange={handleThemeChange} 
      />
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 pt-32 pb-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="h-[72px] flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={taglineIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex items-center justify-center gap-3"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="flex-shrink-0"
                    >
                      {ROTATING_TAGLINES[taglineIndex].icon === "sparkle" ? (
                        <Sparkles className="w-6 h-6 text-terracotta" />
                      ) : (
                        <Compass className="w-6 h-6 text-sage-green" />
                      )}
                    </motion.div>
                    <p
                      className="text-xl md:text-2xl font-medium text-warm-gray dark:text-soft-cream"
                      data-testid="text-subtitle"
                    >
                      {ROTATING_TAGLINES[taglineIndex].text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="flex justify-center gap-1.5 mt-4">
                {ROTATING_TAGLINES.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === taglineIndex 
                        ? "w-6 bg-terracotta" 
                        : "w-1.5 bg-warm-gray/20 dark:bg-soft-cream/20"
                    }`}
                    animate={i === taglineIndex ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

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
