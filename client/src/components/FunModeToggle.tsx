import { Check } from "lucide-react";

interface FunModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function FunModeToggle({ enabled, onToggle }: FunModeToggleProps) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`w-full p-4 rounded-xl transition-all duration-300 border text-left ${
        enabled
          ? "bg-sage-green/10 dark:bg-sage-green/20 border-sage-green/40"
          : "bg-soft-cream dark:bg-deep-cream/60 border-terracotta/10 dark:border-terracotta/20 hover:border-terracotta/30"
      }`}
      data-testid="button-fun-mode"
      aria-pressed={enabled}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`text-xl transition-transform duration-300 ${enabled ? "animate-gentle-float" : ""}`}>
            😏
          </span>
          <div>
            <span className="font-medium text-sm text-warm-gray dark:text-soft-cream block">
              Add trail twists?
            </span>
            <span className="text-xs text-warm-gray/50 dark:text-soft-cream/40">
              Get playful insights with your results
            </span>
          </div>
        </div>
        
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          enabled
            ? "bg-sage-green border-sage-green"
            : "border-warm-gray/30 dark:border-soft-cream/30"
        }`}>
          {enabled && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
    </button>
  );
}
