import { useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

interface FunModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function FunModeToggle({ enabled, onToggle }: FunModeToggleProps) {
  const confettiContainerRef = useRef<HTMLDivElement>(null);

  const triggerConfetti = useCallback(() => {
    if (!confettiContainerRef.current) return;

    const container = confettiContainerRef.current;
    const colors = ["#C67B5C", "#7B9E7B", "#6B8BA4", "#F5D5B5", "#E8B4A0"];
    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 20; i++) {
      const piece = document.createElement("div");
      piece.className = "absolute w-2 h-2 rounded-full pointer-events-none";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = "50%";
      piece.style.top = "50%";
      piece.style.transform = "translate(-50%, -50%)";
      piece.style.opacity = "1";
      
      container.appendChild(piece);
      pieces.push(piece);

      const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.5;
      const velocity = 60 + Math.random() * 40;
      const targetX = Math.cos(angle) * velocity;
      const targetY = Math.sin(angle) * velocity - 20;

      piece.animate([
        { 
          transform: "translate(-50%, -50%) scale(0)", 
          opacity: 1 
        },
        { 
          transform: `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(1) rotate(${Math.random() * 360}deg)`, 
          opacity: 1,
          offset: 0.4
        },
        { 
          transform: `translate(calc(-50% + ${targetX * 1.2}px), calc(-50% + ${targetY + 30}px)) scale(0.5) rotate(${Math.random() * 720}deg)`, 
          opacity: 0 
        }
      ], {
        duration: 600,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        fill: "forwards"
      });
    }

    setTimeout(() => {
      pieces.forEach(p => p.remove());
    }, 700);
  }, []);

  const handleToggle = () => {
    const newState = !enabled;
    if (navigator.vibrate) navigator.vibrate(newState ? [30, 20, 30, 20, 50] : 30);
    
    if (newState) {
      triggerConfetti();
    }
    
    onToggle(newState);
  };

  return (
    <div className="relative">
      <div 
        ref={confettiContainerRef} 
        className="absolute inset-0 overflow-visible pointer-events-none z-10"
      />
      
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`w-full p-5 rounded-2xl transition-all duration-300 border-2 flex items-center justify-center gap-3 ${
          enabled
            ? "bg-terracotta/15 border-terracotta/40 dark:bg-terracotta/25 dark:border-terracotta/50"
            : "bg-soft-cream/60 dark:bg-gray-800/60 border-terracotta/10 hover:border-terracotta/25"
        }`}
        data-testid="button-fun-mode"
        aria-pressed={enabled}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          enabled 
            ? "bg-terracotta/20" 
            : "bg-terracotta/5 dark:bg-terracotta/10"
        }`}>
          <motion.div
            animate={enabled ? { rotate: [0, 15, -15, 0] } : {}}
            transition={{ duration: 0.5, repeat: enabled ? Infinity : 0, repeatDelay: 2 }}
          >
            <Sparkles className={`w-5 h-5 transition-colors ${
              enabled ? "text-terracotta" : "text-warm-gray/50 dark:text-soft-cream/50"
            }`} />
          </motion.div>
        </div>
        
        <div className="flex-1 text-left">
          <span className={`font-bold text-xl md:text-2xl block leading-tight ${
            enabled ? "text-terracotta" : "text-black dark:text-white"
          }`}>
            {enabled ? "Fun Mode Active!" : "Add Personality Twists"}
          </span>
          <span className={`text-base block mt-1 ${
            enabled ? "text-terracotta/70" : "text-gray-600 dark:text-gray-300"
          }`}>
            {enabled 
              ? "Your results will include playful roasts & vibe checks"
              : "Unlock funny nicknames, roasts & casual vibes"}
          </span>
        </div>
        
        <div 
          className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ${
            enabled ? "bg-terracotta" : "bg-gray-300 dark:bg-gray-600"
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <motion.div 
            className="w-5 h-5 rounded-full bg-white shadow-sm"
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-terracotta"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
