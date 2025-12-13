import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import KnowRoleHeader from "@/components/KnowRoleHeader";
import AgeTierSelector from "@/components/AgeTierSelector";
import { ThemeMode } from "@/components/ThemeToggle";

const ROTATING_TAGLINES = [
  { text: "What career fits your brain?", icon: "compass" },
  { text: "What makes you... you?", icon: "sparkle" },
  { text: "Discover your hidden traits", icon: "compass" },
  { text: "Find your hidden superpowers", icon: "sparkle" },
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
    }, 1970);
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
    // Clear ALL knowrole data for fresh quiz experience (except theme preference)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("knowrole-") && key !== "knowrole-theme") {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear all session storage for fresh start
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("knowrole-")) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
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
      <main className="relative z-10 flex flex-col items-center px-5 pt-20 pb-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
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
                        <Sparkles className="w-6 h-6 text-terracotta dark:text-[#A78BFA]" />
                      ) : (
                        <Compass className="w-6 h-6 text-sage-green dark:text-[#67E8F9]" />
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
              
              <div className="flex justify-center gap-1.5 mt-2">
                {ROTATING_TAGLINES.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === taglineIndex 
                        ? "w-6 bg-terracotta dark:bg-[#A78BFA] dark:shadow-[0_0_10px_rgba(167,139,250,0.5)]" 
                        : "w-1.5 bg-warm-gray/20 dark:bg-[#A78BFA]/20"
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
        <p className="text-sm italic font-handwritten text-warm-gray/50 dark:text-[#64748B] cursor-pointer hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors">
          Unfold your trait trail
        </p>
      </footer>
    </div>
  );
}
