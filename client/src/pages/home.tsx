import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass, Rocket, Zap, Anchor, Trophy, Star, ChevronRight, Settings, Moon, Sun } from "lucide-react";

const ROTATING_TAGLINES = [
  { text: "Unlock your superpowers!", icon: "star" },
  { text: "What makes you... you?", icon: "sparkle" },
  { text: "Discover your hidden traits", icon: "compass" },
  { text: "Level up your self-knowledge", icon: "trophy" },
];

interface AgeTier {
  id: string;
  label: string;
  sublabel: string;
  Icon: typeof Compass;
  color: string;
  emoji: string;
}

const ageTiers: AgeTier[] = [
  { id: "25+", label: "Adult Explorer", sublabel: "Ages 25+", Icon: Anchor, color: "purple", emoji: "anchor" },
  { id: "19-25", label: "Young Trailblazer", sublabel: "Ages 19-25", Icon: Zap, color: "coral", emoji: "lightning" },
  { id: "13-18", label: "Teen Navigator", sublabel: "Ages 13-18", Icon: Rocket, color: "teal", emoji: "rocket" },
  { id: "7-12", label: "Mini Explorer", sublabel: "Ages 12 & under", Icon: Compass, color: "yellow", emoji: "compass" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("knowrole-theme");
      return stored === "dark";
    }
    return false;
  });
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isHoveredTier, setIsHoveredTier] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("knowrole-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

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
    
    setSelectedTier(tierId);
    sessionStorage.setItem("knowrole-tier", tierId);
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    setTimeout(() => setLocation("/mood-mixer"), 400);
  };

  const getIconForTagline = (icon: string) => {
    switch (icon) {
      case "star": return <Star className="w-7 h-7" />;
      case "sparkle": return <Sparkles className="w-7 h-7" />;
      case "compass": return <Compass className="w-7 h-7" />;
      case "trophy": return <Trophy className="w-7 h-7" />;
      default: return <Sparkles className="w-7 h-7" />;
    }
  };

  return (
    <div className="playful-page min-h-screen relative overflow-hidden">
      <div className="blob-purple -top-32 -left-32 opacity-60" />
      <div className="blob-coral top-1/2 -right-24 opacity-50" />
      <div className="blob-teal bottom-20 left-1/4 opacity-40" />

      <header className="playful-header fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-xl bg-hsl(var(--game-bg-elevated)) flex items-center justify-center border-2 border-[hsl(var(--game-border))] hover:border-[hsl(var(--game-purple))] transition-colors"
            aria-label="Settings"
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5 text-[hsl(var(--game-text-secondary))]" />
          </motion.button>
          
          <motion.h1 
            className="playful-logo"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            data-testid="text-title"
          >
            KnowYouRole
          </motion.h1>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="w-11 h-11 rounded-xl bg-[hsl(var(--game-bg-elevated))] flex items-center justify-center border-2 border-[hsl(var(--game-border))] hover:border-[hsl(var(--game-purple))] transition-colors"
            aria-label="Toggle theme"
            data-testid="button-theme-toggle"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-[hsl(var(--game-yellow))]" />
            ) : (
              <Moon className="h-5 w-5 text-[hsl(var(--game-purple))]" />
            )}
          </motion.button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center px-5 pt-24 pb-28 min-h-screen">
        <div className="w-full max-w-md">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-20 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex items-center justify-center gap-3"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-[hsl(var(--game-purple))]"
                  >
                    {getIconForTagline(ROTATING_TAGLINES[taglineIndex].icon)}
                  </motion.div>
                  <p
                    className="text-xl md:text-2xl font-bold text-[hsl(var(--game-text-primary))]"
                    style={{ fontFamily: 'var(--font-playful)' }}
                    data-testid="text-subtitle"
                  >
                    {ROTATING_TAGLINES[taglineIndex].text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex justify-center gap-2 mt-3">
              {ROTATING_TAGLINES.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === taglineIndex 
                      ? "w-8 bg-[hsl(var(--game-purple))]" 
                      : "w-2 bg-[hsl(var(--game-border))]"
                  }`}
                  animate={i === taglineIndex ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="game-card p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--game-text-primary))] mb-2" style={{ fontFamily: 'var(--font-display-playful)' }}>
                Pick your adventure!
              </h2>
              <p className="text-[hsl(var(--game-text-secondary))]" style={{ fontFamily: 'var(--font-playful)' }}>
                Choose your age group to start
              </p>
            </div>

            <div className="space-y-3">
              {ageTiers.map((tier, index) => {
                const isSelected = selectedTier === tier.id;
                const isHovered = isHoveredTier === tier.id;
                const Icon = tier.Icon;
                
                return (
                  <motion.button
                    key={tier.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                    onClick={() => handleTierSelect(tier.id)}
                    onMouseEnter={() => setIsHoveredTier(tier.id)}
                    onMouseLeave={() => setIsHoveredTier(null)}
                    className={`tier-card-playful w-full text-left ${isSelected ? "selected" : ""}`}
                    aria-label={`Select ${tier.label}, ${tier.sublabel}`}
                    data-testid={`button-tier-${tier.id}`}
                  >
                    <div className="relative z-10 flex items-center gap-4">
                      <motion.div 
                        className={`icon-badge ${tier.color} ${isSelected ? "selected" : ""}`}
                        animate={isHovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`font-bold block text-lg md:text-xl truncate ${
                          isSelected ? "text-white" : "text-[hsl(var(--game-text-primary))]"
                        }`} style={{ fontFamily: 'var(--font-playful)' }}>
                          {tier.label}
                        </span>
                        <span className={`text-sm md:text-base block ${
                          isSelected ? "text-white/80" : "text-[hsl(var(--game-text-secondary))]"
                        }`}>
                          {tier.sublabel}
                        </span>
                      </div>

                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected 
                            ? "bg-white/25" 
                            : "bg-[hsl(var(--game-purple)/0.1)]"
                        }`}
                        animate={isHovered || isSelected ? { x: 5 } : { x: 0 }}
                      >
                        <ChevronRight className={`w-5 h-5 ${
                          isSelected ? "text-white" : "text-[hsl(var(--game-purple))]"
                        }`} />
                      </motion.div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.p 
              className="text-center text-sm text-[hsl(var(--game-text-muted))] mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ fontFamily: 'var(--font-playful)' }}
            >
              Tap to begin your personality quest
            </motion.p>
          </motion.div>

          <motion.div 
            className="mt-6 flex justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="achievement-badge purple">
              <Trophy className="w-4 h-4" />
              <span>Fun Quiz</span>
            </div>
            <div className="achievement-badge teal">
              <Sparkles className="w-4 h-4" />
              <span>5 min</span>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 py-4 text-center bg-gradient-to-t from-[hsl(var(--game-bg-light))] to-transparent">
        <motion.p 
          className="text-sm font-medium text-[hsl(var(--game-text-muted))]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontFamily: 'var(--font-playful)' }}
        >
          Your personality adventure awaits
        </motion.p>
      </footer>
    </div>
  );
}
