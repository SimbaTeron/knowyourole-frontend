import { Check, Compass, Rocket, Zap, Anchor } from "lucide-react";

interface AgeTier {
  id: string;
  label: string;
  sublabel: string;
  Icon: typeof Compass;
}

const ageTiers: AgeTier[] = [
  { id: "7-12", label: "Mini Explorer", sublabel: "Ages 7-12", Icon: Compass },
  { id: "13-18", label: "Teen Navigator", sublabel: "Ages 13-18", Icon: Rocket },
  { id: "19-25", label: "Young Trailblazer", sublabel: "Ages 19-25", Icon: Zap },
  { id: "25+", label: "Adult Anchor", sublabel: "Ages 25+", Icon: Anchor },
];

interface AgeTierSelectorProps {
  selectedTier: string | null;
  onSelect: (tierId: string) => void;
}

export default function AgeTierSelector({ selectedTier, onSelect }: AgeTierSelectorProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-headline text-warm-gray dark:text-soft-cream mb-2">
          Choose your path
        </h2>
        <p className="text-subhead text-warm-gray dark:text-soft-cream">
          Select the journey that fits you best
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {ageTiers.map((tier, index) => {
          const isSelected = selectedTier === tier.id;
          const Icon = tier.Icon;
          return (
            <button
              key={tier.id}
              onClick={() => onSelect(tier.id)}
              className={`group relative p-5 text-left tier-card-premium ${isSelected ? "selected" : ""}`}
              style={{ 
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
                animation: `slideUp 0.5s ease-out ${index * 0.08}s forwards`
              }}
              aria-label={`Select ${tier.label}`}
              data-testid={`button-tier-${tier.id}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              <div className={`icon-capsule mb-3 ${isSelected ? "active" : ""}`}>
                <Icon className={`w-4 h-4 transition-colors ${
                  isSelected ? "text-white" : "text-terracotta"
                }`} />
              </div>
              
              <span className={`font-semibold block text-sm ${
                isSelected ? "text-white" : "text-warm-gray dark:text-soft-cream"
              }`}>
                {tier.label}
              </span>
              <span className={`text-xs mt-0.5 block ${
                isSelected ? "text-white/70" : "text-warm-gray/50 dark:text-soft-cream/40"
              }`}>
                {tier.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
