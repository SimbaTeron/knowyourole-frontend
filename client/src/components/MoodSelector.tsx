import { Check, Coffee, BookOpen, Map } from "lucide-react";
import Select, { SingleValue, StylesConfig } from "react-select";
import CompassNeedle from "./CompassNeedle";

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

interface SelectOption {
  value: string;
  label: string;
  description: string;
}

const selectOptions: SelectOption[] = moodOptions.map(m => ({
  value: m.value,
  label: m.label,
  description: m.description,
}));

const customStyles: StylesConfig<SelectOption, false> = {
  control: (base) => ({
    ...base,
    background: 'rgba(253,248,243,0.8)',
    border: '1px solid rgba(198,123,92,0.1)',
    borderRadius: '0.875rem',
    padding: '0.25rem 0.5rem',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: 'rgba(198,123,92,0.2)',
    },
  }),
  menu: (base) => ({
    ...base,
    background: '#FFFBF7',
    border: '1px solid rgba(198,123,92,0.1)',
    borderRadius: '0.875rem',
    boxShadow: '0 8px 24px rgba(198,123,92,0.12)',
  }),
  option: (base, { isSelected, isFocused }) => ({
    ...base,
    padding: '0.75rem 1rem',
    background: isSelected ? '#C67B5C' : isFocused ? 'rgba(198,123,92,0.08)' : 'transparent',
    color: isSelected ? 'white' : '#6B6B6B',
    cursor: 'pointer',
    '&:active': {
      background: isSelected ? '#C67B5C' : 'rgba(198,123,92,0.12)',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#6B6B6B',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
};

const triggerHaptic = (duration = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

interface MoodSelectorProps {
  mood: string;
  onMoodChange: (mood: string) => void;
}

export default function MoodSelector({ mood, onMoodChange }: MoodSelectorProps) {
  const handleChange = (option: SingleValue<SelectOption>) => {
    if (option) {
      triggerHaptic(50);
      onMoodChange(option.value);
    }
  };

  const selectedOption = selectOptions.find(o => o.value === mood) || null;

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

      <div className="flex items-center gap-6 mb-6">
        <div className="flex-1">
          <Select
            options={selectOptions}
            value={selectedOption}
            onChange={handleChange}
            styles={customStyles}
            placeholder="Select your mood..."
            classNamePrefix="knowrole-select"
            formatOptionLabel={(option) => (
              <div className="flex items-center gap-2">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs opacity-60">- {option.description}</span>
              </div>
            )}
            aria-label="Select your current mood"
          />
        </div>
        <CompassNeedle mood={mood} size={56} />
      </div>

      <div className="space-y-2">
        {moodOptions.map((option, index) => {
          const isSelected = mood === option.value;
          const Icon = option.Icon;
          return (
            <button
              key={option.value}
              onClick={() => {
                triggerHaptic(50);
                onMoodChange(option.value);
              }}
              className={`w-full group relative p-4 text-left mood-card-premium ${isSelected ? "selected" : ""}`}
              style={{ 
                opacity: 0,
                animation: `slideUp 0.4s ease-out ${index * 0.08}s forwards`
              }}
              aria-label={`Select mood: ${option.label} - ${option.description}`}
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
