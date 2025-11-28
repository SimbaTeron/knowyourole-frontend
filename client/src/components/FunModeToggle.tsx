import { Sparkles } from "lucide-react";

interface FunModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function FunModeToggle({ enabled, onToggle }: FunModeToggleProps) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`w-full p-4 rounded-xl transition-all duration-400 border text-left ${
        enabled
          ? "bg-gradient-to-r from-sage-green/10 to-terracotta/10 border-sage-green/20 dark:from-sage-green/20 dark:to-terracotta/20"
          : "bg-soft-cream/50 dark:bg-deep-cream/40 border-terracotta/6 hover:border-terracotta/12"
      }`}
      data-testid="button-fun-mode"
      aria-pressed={enabled}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`icon-capsule ${enabled ? "!bg-gradient-to-br from-sage-green/20 to-terracotta/20" : ""}`}>
            <Sparkles className={`w-4 h-4 transition-all duration-300 ${
              enabled ? "text-terracotta" : "text-warm-gray/50"
            }`} />
          </div>
          <div>
            <span className="font-medium text-sm text-warm-gray dark:text-soft-cream block">
              Add some personality twists
            </span>
            <span className="text-xs text-warm-gray/50 dark:text-soft-cream/40">
              Get playful insights with your results
            </span>
          </div>
        </div>
        
        <div 
          className={`premium-toggle ${enabled ? "active" : ""}`}
          role="switch"
          aria-checked={enabled}
        />
      </div>
    </button>
  );
}
