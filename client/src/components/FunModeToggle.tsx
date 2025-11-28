import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FunModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function FunModeToggle({ enabled, onToggle }: FunModeToggleProps) {
  return (
    <div className="w-full p-4 bg-white dark:bg-indigo-deep/50 rounded-lg border border-indigo-deep/20 dark:border-nebula-core/20">
      <div className="flex items-center gap-3">
        <Checkbox
          id="fun-mode"
          checked={enabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
          className="border-indigo-deep/50 dark:border-nebula-core/50 data-[state=checked]:bg-pink-tide data-[state=checked]:border-pink-tide"
          aria-label="Enable Fun Mode for playful roasts"
          data-testid="checkbox-fun-mode"
        />
        <Label
          htmlFor="fun-mode"
          className="flex items-center gap-2 cursor-pointer text-indigo-deep dark:text-nebula-core"
        >
          <span className="text-lg">😏</span>
          <span className="font-medium">Fun Mode: Roast my results?</span>
        </Label>
      </div>
      {enabled && (
        <p className="mt-2 ml-8 text-sm text-pink-tide opacity-80">
          Brace yourself for some playful personality roasts!
        </p>
      )}
    </div>
  );
}
