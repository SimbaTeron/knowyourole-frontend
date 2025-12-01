import { Check, Compass, Rocket, Zap, Anchor } from "lucide-react";
import { motion } from "framer-motion";

interface AgeTier {
  id: string;
  label: string;
  sublabel: string;
  Icon: typeof Compass;
}

const ageTiers: AgeTier[] = [
  { id: "7-12", label: "Mini Explorer", sublabel: "Ages 12 and under", Icon: Compass },
  { id: "13-18", label: "Teen Navigator", sublabel: "Ages 13-18", Icon: Rocket },
  { id: "19-25", label: "Young Trailblazer", sublabel: "Ages 19-25", Icon: Zap },
  { id: "25+", label: "Adult Anchor", sublabel: "Ages 25+", Icon: Anchor },
];

const triggerHaptic = (duration = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

interface AgeTierSelectorProps {
  selectedTier: string | null;
  onSelect: (tierId: string) => void;
}

export default function AgeTierSelector({ selectedTier, onSelect }: AgeTierSelectorProps) {
  const handleSelect = (tierId: string) => {
    triggerHaptic(50);
    onSelect(tierId);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="md:text-3xl font-display font-semibold text-warm-gray dark:text-soft-cream mb-2 text-[36px]">
          Choose your path
        </h2>
        <p className="text-base md:text-lg text-warm-gray/70 dark:text-soft-cream/60">
          Select the journey that fits you best
        </p>
      </div>
      <div className="space-y-3">
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
              className={`group relative w-full p-5 md:p-6 text-left tier-card-premium ${isSelected ? "selected" : ""}`}
              aria-label={`Select ${tier.label}, ${tier.sublabel}`}
              data-testid={`button-tier-${tier.id}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  isSelected 
                    ? "bg-white/20" 
                    : "bg-terracotta/10 dark:bg-sunset-amber/20"
                }`}>
                  <Icon className={`w-7 h-7 transition-colors ${
                    isSelected ? "text-white" : "text-terracotta dark:text-sunset-amber"
                  }`} />
                </div>
                
                <div className="flex-1">
                  <span className={`font-semibold block text-2xl md:text-3xl ${
                    isSelected ? "text-white" : "text-warm-gray dark:text-soft-cream"
                  }`}>
                    {tier.label}
                  </span>
                  <span className={`text-xl md:text-2xl mt-1 block font-medium ${
                    isSelected ? "text-white/70" : "text-warm-gray/50 dark:text-soft-cream/40"
                  }`}>
                    {tier.sublabel}
                  </span>
                </div>

                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      <p className="text-center text-sm text-warm-gray/50 dark:text-soft-cream/40 italic mt-6">
        Tap to select your age tier
      </p>
    </div>
  );
}
