import { Check } from "lucide-react";

interface MoodOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

const moodOptions: MoodOption[] = [
  { value: "energized", label: "Energized", description: "Ready to move", icon: "coffee" },
  { value: "reflective", label: "Reflective", description: "Deep in thought", icon: "book" },
  { value: "stuck", label: "Finding my way", description: "Need a path", icon: "trail" },
];

interface MoodSelectorProps {
  mood: string;
  onMoodChange: (mood: string) => void;
}

export default function MoodSelector({ mood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <h2 className="text-xl font-semibold text-warm-gray dark:text-soft-cream">
          Current vibe check
        </h2>
        <p className="mt-1 text-sm text-warm-gray/60 dark:text-soft-cream/50">
          How are you feeling today?
        </p>
      </div>

      <div className="space-y-2.5">
        {moodOptions.map((option, index) => {
          const isSelected = mood === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onMoodChange(option.value)}
              className={`w-full group relative p-4 rounded-xl text-left transition-all duration-300 animate-slide-up border ${
                isSelected
                  ? "bg-terracotta text-white border-terracotta shadow-lg shadow-terracotta/20"
                  : "bg-soft-cream dark:bg-deep-cream/60 border-terracotta/15 dark:border-terracotta/25 hover:border-terracotta/40 hover:bg-soft-cream/80"
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
              data-testid={`button-mood-${option.value}`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${
                  isSelected ? "" : ""
                }`}>
                  {option.icon === "coffee" && "☕"}
                  {option.icon === "book" && "📖"}
                  {option.icon === "trail" && "🛤️"}
                </span>
                <div className="flex-1">
                  <span className={`font-medium block text-sm ${
                    isSelected ? "text-white" : "text-warm-gray dark:text-soft-cream"
                  }`}>
                    {option.label}
                  </span>
                  <span className={`text-xs ${
                    isSelected ? "text-white/70" : "text-warm-gray/50 dark:text-soft-cream/40"
                  }`}>
                    {option.description}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
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
