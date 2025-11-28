import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MoodOption {
  value: string;
  label: string;
  icon: string;
}

const moodOptions: MoodOption[] = [
  { value: "energized", label: "Energized", icon: "🚀" },
  { value: "reflective", label: "Reflective", icon: "🌌" },
  { value: "stuck", label: "Stuck", icon: "❓" },
];

interface MoodSelectorProps {
  mood: string;
  onMoodChange: (mood: string) => void;
}

export default function MoodSelector({ mood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-indigo-deep dark:text-nebula-core mb-4 text-center">
        Quick vibe check?
      </h2>
      <Select value={mood} onValueChange={onMoodChange}>
        <SelectTrigger
          className="w-full p-4 h-auto bg-white dark:bg-indigo-deep/50 border-indigo-deep/30 dark:border-nebula-core/30 rounded-lg text-indigo-deep dark:text-nebula-core"
          aria-label="Mood selector"
          data-testid="select-mood"
        >
          <SelectValue placeholder="How are you feeling?" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-indigo-deep border-indigo-deep/20 dark:border-nebula-core/20">
          {moodOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-indigo-deep dark:text-nebula-core cursor-pointer"
              data-testid={`option-mood-${option.value}`}
            >
              <span className="flex items-center gap-2">
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
