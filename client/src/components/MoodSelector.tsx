import { Check, Coffee, BookOpen, Map } from "lucide-react";

interface MoodOption {
  value: string;
  label: string;
  description: string;
  Icon: typeof Coffee;
}

const moodOptions: MoodOption[] = [
  { value: "energized", label: "Energized", description: "Ready to move forward", Icon: Coffee },
  { value: "reflective", label: "Reflective", description: "Taking time to think", Icon: BookOpen },
  { value: "stuck", label: "Finding my way", description: "Looking for direction", Icon: Map },
];

interface MoodSelectorProps {
  mood: string;
  onMoodChange: (mood: string) => void;
}

export default function MoodSelector({ mood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-headline text-warm-gray dark:text-soft-cream mb-1">
          How are you feeling?
        </h2>
        <p className="text-subhead text-warm-gray dark:text-soft-cream text-sm">
          Your current state helps personalize your path
        </p>
      </div>

      <div className="space-y-2.5">
        {moodOptions.map((option, index) => {
          const isSelected = mood === option.value;
          const Icon = option.Icon;
          return (
            <button
              key={option.value}
              onClick={() => onMoodChange(option.value)}
              className={`w-full group relative p-4 text-left mood-card-premium ${isSelected ? "selected" : ""}`}
              style={{ 
                opacity: 0,
                animation: `slideUp 0.4s ease-out ${index * 0.08}s forwards`
              }}
              data-testid={`button-mood-${option.value}`}
            >
              <div className="flex items-center gap-4">
                <div className={`icon-capsule ${isSelected ? "active" : ""}`}>
                  <Icon className={`w-4 h-4 transition-colors ${
                    isSelected ? "text-white" : "text-terracotta"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold block text-sm ${
                    isSelected ? "text-white" : "text-warm-gray dark:text-soft-cream"
                  }`}>
                    {option.label}
                  </span>
                  <span className={`text-xs truncate block ${
                    isSelected ? "text-white/70" : "text-warm-gray/50 dark:text-soft-cream/40"
                  }`}>
                    {option.description}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
