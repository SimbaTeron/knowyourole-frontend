import { ArrowRight, Sparkles } from "lucide-react";

interface StartButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export default function StartButton({ disabled = false, onClick }: StartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-500 flex items-center justify-center gap-3 ${
        disabled
          ? "bg-indigo-deep/10 dark:bg-white/10 text-indigo-deep/40 dark:text-white/40 cursor-not-allowed"
          : "premium-button text-white"
      }`}
      aria-label="Begin discovery journey"
      data-testid="button-start"
    >
      <Sparkles className={`h-5 w-5 transition-all duration-300 ${!disabled && "group-hover:rotate-12"}`} />
      <span>Begin Discovery</span>
      <ArrowRight className={`h-5 w-5 transition-all duration-300 ${!disabled && "group-hover:translate-x-1"}`} />
    </button>
  );
}
