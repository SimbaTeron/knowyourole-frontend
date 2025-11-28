import { Check } from "lucide-react";

interface MoodOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  gradient: string;
}

const moodOptions: MoodOption[] = [
  { value: "energized", label: "Energized", description: "Ready to conquer", icon: "🚀", gradient: "from-coral-drift to-spark-gold" },
  { value: "reflective", label: "Reflective", description: "Deep in thought", icon: "🌌", gradient: "from-violet-echo to-lavender-shift" },
  { value: "stuck", label: "Seeking clarity", description: "Need direction", icon: "✨", gradient: "from-lavender-shift to-pink-tide" },
];

interface MoodSelectorProps {
  mood: string;
  onMoodChange: (mood: string) => void;
}

export default function MoodSelector({ mood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-indigo-deep dark:text-white">
          Current vibe check
        </h2>
        <p className="mt-1 text-sm text-indigo-deep/60 dark:text-white/60">
          How are you feeling right now?
        </p>
      </div>

      <div className="space-y-3">
        {moodOptions.map((option, index) => {
          const isSelected = mood === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onMoodChange(option.value)}
              className={`w-full group relative p-4 rounded-xl text-left transition-all duration-300 animate-slide-up ${
                isSelected
                  ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg`
                  : "glass-card hover:scale-[1.02]"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`button-mood-${option.value}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                  {option.icon}
                </span>
                <div className="flex-1">
                  <span className={`font-semibold block ${isSelected ? "text-white" : "text-indigo-deep dark:text-white"}`}>
                    {option.label}
                  </span>
                  <span className={`text-sm ${isSelected ? "text-white/70" : "text-indigo-deep/50 dark:text-white/50"}`}>
                    {option.description}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
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
