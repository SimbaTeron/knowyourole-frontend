import { Button } from "@/components/ui/button";

interface AgeTier {
  id: string;
  label: string;
  icon: string;
}

const ageTiers: AgeTier[] = [
  { id: "7-12", label: "Mini Explorer (7-12)", icon: "🌟" },
  { id: "13-18", label: "Teen Navigator (13-18)", icon: "🚀" },
  { id: "19-25", label: "Young Trailblazer (19-25)", icon: "⚡" },
  { id: "25+", label: "Adult Anchor (25+)", icon: "🌙" },
];

interface AgeTierSelectorProps {
  selectedTier: string | null;
  onSelect: (tierId: string) => void;
}

export default function AgeTierSelector({ selectedTier, onSelect }: AgeTierSelectorProps) {
  return (
    <div className="w-full space-y-3">
      <h2 className="text-xl font-semibold text-indigo-deep dark:text-nebula-core mb-4 text-center">
        What's your quest level?
      </h2>
      <div className="space-y-2">
        {ageTiers.map((tier) => (
          <Button
            key={tier.id}
            variant="ghost"
            onClick={() => onSelect(tier.id)}
            className={`w-full p-4 h-auto justify-start text-left transition-all rounded-lg ${
              selectedTier === tier.id
                ? "bg-violet-echo text-white"
                : "bg-mint-veil text-indigo-deep hover:bg-lavender-shift"
            }`}
            aria-label={`Select ${tier.label}`}
            data-testid={`button-tier-${tier.id}`}
          >
            <span className="mr-3 text-xl">{tier.icon}</span>
            <span className="font-medium">{tier.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
