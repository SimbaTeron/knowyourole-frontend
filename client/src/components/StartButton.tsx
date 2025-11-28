import { ArrowRight, Sparkles } from "lucide-react";

interface StartButtonProps {
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}

export default function StartButton({ disabled = false, onClick, label = "Begin Your Journey" }: StartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group w-full py-4 px-6 rounded-xl font-medium text-base transition-all duration-500 flex items-center justify-center gap-3 ${
        disabled
          ? "bg-warm-gray/8 text-warm-gray/30 dark:bg-soft-cream/5 dark:text-soft-cream/20 cursor-not-allowed"
          : "trail-button text-white"
      }`}
      aria-label={label}
      data-testid="button-start"
    >
      {!disabled && <Sparkles className="h-4 w-4 opacity-80" />}
      <span>{label}</span>
      <ArrowRight className={`h-4 w-4 transition-all duration-300 ${
        !disabled ? "group-hover:translate-x-1" : ""
      }`} />
    </button>
  );
}
