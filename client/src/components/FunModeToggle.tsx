import { Switch } from "@/components/ui/switch";

interface FunModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function FunModeToggle({ enabled, onToggle }: FunModeToggleProps) {
  return (
    <div 
      className={`w-full p-4 rounded-xl transition-all duration-500 ${
        enabled 
          ? "bg-gradient-to-r from-pink-tide/20 to-violet-echo/20 dark:from-pink-tide/30 dark:to-violet-echo/30" 
          : "glass-card"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`text-2xl transition-all duration-300 ${enabled ? "animate-bounce" : ""}`}>
            😏
          </span>
          <div>
            <span className="font-semibold text-indigo-deep dark:text-white block">
              Fun Mode
            </span>
            <span className="text-sm text-indigo-deep/60 dark:text-white/60">
              Get playful roasts with your results
            </span>
          </div>
        </div>
        
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-tide data-[state=checked]:to-violet-echo"
          aria-label="Enable Fun Mode"
          data-testid="switch-fun-mode"
        />
      </div>
    </div>
  );
}
