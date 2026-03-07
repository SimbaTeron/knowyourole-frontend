import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass, Brain, Briefcase, Gift, UserCheck, ClipboardList, BarChart3 } from "lucide-react";
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

const FEATURES = [
  { icon: Brain, label: "3 Test Types", description: "Big Five, MBTI & DISC", color: "text-[#A78BFA]" },
  { icon: Briefcase, label: "Career Matching", description: "150+ matched roles", color: "text-[#67E8F9]" },
  { icon: Gift, label: "100% Free", description: "No sign-up required", color: "text-[#34D399]" },
];

const STEPS = [
  { icon: UserCheck, step: "1", title: "Choose Your Age", description: "Pick the tier that fits you" },
  { icon: ClipboardList, step: "2", title: "Take the Quiz", description: "Answer fun, quick questions" },
  { icon: BarChart3, step: "3", title: "Get Results", description: "Explore your personality & careers" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [ageTier, setAgeTier] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
      return stored === "light" ? "light" : "dark";
    }
    return "dark";
  });
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    if (theme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  }, [theme]);

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
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("knowrole-") && key !== "knowrole-theme") {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
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
      <main className="relative z-10 flex flex-col items-center px-5 pt-16 pb-24">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-3"
          >
            <h1
              className="text-3xl md:text-4xl font-display font-bold text-warm-gray dark:text-[#F8FAFC] mb-1 leading-tight"
              data-testid="text-hero-headline"
            >
              Discover Your <span className="italic text-terracotta dark:text-[#A78BFA]">True</span> Potential
            </h1>
            <p
              className="text-base text-warm-gray/70 dark:text-[#94A3B8] mb-3"
              data-testid="text-hero-subtext"
            >
              Science-backed personality insights and career matching in minutes
            </p>
          </motion.div>

          <div className="text-center mb-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="h-[52px] flex items-center justify-center overflow-hidden">
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
                        <Sparkles className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
                      ) : (
                        <Compass className="w-5 h-5 text-sage-green dark:text-[#67E8F9]" />
                      )}
                    </motion.div>
                    <p
                      className="text-lg md:text-xl font-medium text-warm-gray dark:text-soft-cream"
                      data-testid="text-subtitle"
                    >
                      {ROTATING_TAGLINES[taglineIndex].text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="flex justify-center gap-1.5 mt-1">
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

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center gap-4 mb-5"
            data-testid="section-feature-highlights"
          >
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center text-center flex-1"
                data-testid={`feature-${feature.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-10 h-10 rounded-full bg-warm-gray/5 dark:bg-white/5 flex items-center justify-center mb-1.5">
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <span className="text-xs font-semibold text-warm-gray dark:text-[#F8FAFC] leading-tight">
                  {feature.label}
                </span>
                <span className="text-[11px] text-warm-gray/60 dark:text-[#64748B] leading-tight mt-0.5">
                  {feature.description}
                </span>
              </div>
            ))}
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

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6"
            data-testid="section-how-it-works"
          >
            <p className="text-xs uppercase tracking-widest text-center text-warm-gray/50 dark:text-[#64748B] font-semibold mb-3">
              How it works
            </p>
            <div className="flex items-start justify-between gap-2">
              {STEPS.map((step, index) => (
                <div key={step.step} className="flex flex-col items-center text-center flex-1 relative">
                  <div className="w-9 h-9 rounded-full bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/20 flex items-center justify-center mb-1.5">
                    <step.icon className="w-4 h-4 text-terracotta dark:text-[#A78BFA]" />
                  </div>
                  <span className="text-xs font-semibold text-warm-gray dark:text-[#F8FAFC] leading-tight">
                    {step.title}
                  </span>
                  <span className="text-[11px] text-warm-gray/60 dark:text-[#64748B] leading-tight mt-0.5">
                    {step.description}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className="absolute top-4 -right-1 w-2 flex items-center" style={{ visibility: "visible" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-warm-gray/20 dark:text-[#A78BFA]/30">
                        <path d="M1 1L5 4L1 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
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
