import { ArrowRight } from "lucide-react";

interface StartButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export default function StartButton({ disabled = false, onClick }: StartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group w-full py-4 px-6 rounded-xl font-medium text-base transition-all duration-300 flex items-center justify-center gap-3 ${
        disabled
          ? "bg-warm-gray/10 dark:bg-soft-cream/10 text-warm-gray/40 dark:text-soft-cream/30 cursor-not-allowed"
          : "trail-button text-white"
      }`}
      aria-label="Begin discovery journey"
      data-testid="button-start"
    >
      <span>Chart My Path</span>
      <ArrowRight className={`h-4 w-4 transition-all duration-300 ${!disabled && "group-hover:translate-x-1"}`} />
    </button>
  );
}
