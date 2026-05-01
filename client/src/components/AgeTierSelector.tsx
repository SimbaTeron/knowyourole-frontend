import { Check, Rocket, Zap, Anchor, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AgeTier {
  id: string;
  label: string;
  sublabel: string;
  tagline: string;
  Icon: typeof Rocket;
}

const ageTiers: AgeTier[] = [
  { id: "25+", label: "Adult Anchor", sublabel: "Ages 25+", tagline: "Career strategy & leadership insights", Icon: Anchor },
  { id: "19-25", label: "Young Trailblazer", sublabel: "Ages 19-25", tagline: "Find your path & unlock potential", Icon: Zap },
  { id: "13-18", label: "Teen Navigator", sublabel: "Ages 13-18", tagline: "Discover strengths & future direction", Icon: Rocket },
];

const triggerHaptic = (duration = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

interface AgeTierSelectorProps {
  selectedTier: string | null;
  onSelect: (tierId: string) => void;
  onConfirm?: () => void;
}

export default function AgeTierSelector({ selectedTier, onSelect, onConfirm }: AgeTierSelectorProps) {
  const handleSelect = (tierId: string) => {
    triggerHaptic(50);
    onSelect(tierId);
  };

  const selectedTierData = ageTiers.find(t => t.id === selectedTier);

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <h2 className="text-xl md:text-3xl font-display font-semibold text-warm-gray dark:text-[#F8FAFC] mb-1.5">
          Choose your path
        </h2>
        <p className="text-sm md:text-lg text-warm-gray/70 dark:text-[#94A3B8]">
          Select the journey that fits you best
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ageTiers.map((tier, index) => {
          const isSelected = selectedTier === tier.id;
          const Icon = tier.Icon;
          return (
            <motion.button
              key={tier.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1]
              }}
              onClick={() => handleSelect(tier.id)}
              className={`group relative w-full p-4 md:p-6 text-left tier-card-premium ${isSelected ? "selected" : ""}`}
              aria-label={`Select ${tier.label}, ${tier.sublabel}`}
              data-testid={`button-tier-${tier.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all ${
                  isSelected 
                    ? "bg-white/20" 
                    : "bg-terracotta/10 dark:bg-[#A78BFA]/20"
                }`}>
                  <Icon className={`w-5 h-5 md:w-7 md:h-7 transition-colors ${
                    isSelected ? "text-white" : "text-terracotta dark:text-[#A78BFA]"
                  }`} />
                </div>
                
                <div className="flex-1">
                  <span className={`font-semibold block text-base md:text-xl ${
                    isSelected ? "text-white" : "text-warm-gray dark:text-[#F8FAFC]"
                  }`}>
                    {tier.label}
                  </span>
                  <span className={`text-sm md:text-base mt-0.5 block font-medium ${
                    isSelected ? "text-white/70" : "text-warm-gray/50 dark:text-[#94A3B8]"
                  }`}>
                    {tier.sublabel}
                  </span>
                  <span className={`text-[11px] md:text-xs mt-0.5 block ${
                    isSelected ? "text-white/60" : "text-warm-gray/40 dark:text-[#64748B]"
                  }`}>
                    {tier.tagline}
                  </span>
                </div>

                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/25 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTier && selectedTierData && onConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-5"
          >
            <Button
              onClick={onConfirm}
              className="w-full py-5 md:py-6 text-base md:text-lg font-bold bg-gradient-to-r from-terracotta to-sage-green dark:from-[#A78BFA] dark:to-[#67E8F9] text-white border-0 rounded-xl"
              data-testid="button-start-journey"
            >
              Start My {selectedTierData.label} Journey
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs md:text-sm text-warm-gray/50 dark:text-[#64748B] italic mt-4 md:mt-6">
        {selectedTier ? "Ready? Hit the button above to begin" : "Tap to select your age tier"}
      </p>
    </div>
  );
}
