import { Check } from "lucide-react";

interface AgeTier {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
}

const ageTiers: AgeTier[] = [
  { id: "7-12", label: "Mini Explorer", sublabel: "Ages 7-12", icon: "🌟" },
  { id: "13-18", label: "Teen Navigator", sublabel: "Ages 13-18", icon: "🚀" },
  { id: "19-25", label: "Young Trailblazer", sublabel: "Ages 19-25", icon: "⚡" },
  { id: "25+", label: "Adult Anchor", sublabel: "Ages 25+", icon: "🌙" },
];

interface AgeTierSelectorProps {
  selectedTier: string | null;
  onSelect: (tierId: string) => void;
}

export default function AgeTierSelector({ selectedTier, onSelect }: AgeTierSelectorProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <p className="text-sm font-medium tracking-widest uppercase text-violet-echo dark:text-lavender-shift mb-2">
          Step 1 of 2
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-deep dark:text-white">
          What's your quest level?
        </h2>
        <p className="mt-2 text-indigo-deep/60 dark:text-white/60">
          Choose the experience tailored to you
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {ageTiers.map((tier, index) => {
          const isSelected = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => onSelect(tier.id)}
              className={`group relative p-5 rounded-2xl text-left transition-all duration-500 animate-slide-up ${
                isSelected 
                  ? "tier-card selected text-white scale-[1.02]" 
                  : "tier-card text-indigo-deep dark:text-indigo-deep"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              aria-label={`Select ${tier.label}`}
              data-testid={`button-tier-${tier.id}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <span className="text-3xl block mb-3 transition-transform duration-300 group-hover:scale-110">
                {tier.icon}
              </span>
              <span className={`font-semibold block text-base ${isSelected ? "text-white" : ""}`}>
                {tier.label}
              </span>
              <span className={`text-sm mt-1 block ${isSelected ? "text-white/70" : "opacity-60"}`}>
                {tier.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
