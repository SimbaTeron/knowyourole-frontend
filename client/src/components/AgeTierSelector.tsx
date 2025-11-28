import { Check } from "lucide-react";

interface AgeTier {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
}

const ageTiers: AgeTier[] = [
  { id: "7-12", label: "Mini Explorer", sublabel: "Ages 7-12", icon: "~" },
  { id: "13-18", label: "Teen Navigator", sublabel: "Ages 13-18", icon: "/" },
  { id: "19-25", label: "Young Trailblazer", sublabel: "Ages 19-25", icon: "^" },
  { id: "25+", label: "Adult Anchor", sublabel: "Ages 25+", icon: "#" },
];

interface AgeTierSelectorProps {
  selectedTier: string | null;
  onSelect: (tierId: string) => void;
}

export default function AgeTierSelector({ selectedTier, onSelect }: AgeTierSelectorProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-terracotta mb-3">
          Step 1 of 2
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-warm-gray dark:text-soft-cream">
          What's your quest level?
        </h2>
        <p className="mt-2 text-warm-gray/70 dark:text-soft-cream/60 text-sm">
          Pick the path that fits your journey
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {ageTiers.map((tier, index) => {
          const isSelected = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => onSelect(tier.id)}
              className={`group relative p-5 text-left transition-all duration-300 animate-slide-up tier-blob ${
                isSelected ? "selected" : ""
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
              aria-label={`Select ${tier.label}`}
              data-testid={`button-tier-${tier.id}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              <span className={`text-2xl font-light block mb-2 transition-transform duration-300 group-hover:translate-x-1 ${
                isSelected ? "text-white/80" : "text-terracotta"
              }`}>
                {tier.icon}
              </span>
              <span className={`font-semibold block text-sm ${
                isSelected ? "text-white" : "text-warm-gray dark:text-deep-cream"
              }`}>
                {tier.label}
              </span>
              <span className={`text-xs mt-0.5 block ${
                isSelected ? "text-white/70" : "text-warm-gray/60 dark:text-warm-gray"
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
