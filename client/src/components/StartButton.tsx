import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface StartButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export default function StartButton({ disabled = false, onClick }: StartButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 h-auto text-lg font-semibold rounded-lg transition-all ${
        disabled
          ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-violet-echo to-pink-tide text-white shadow-lg"
      }`}
      aria-label="Begin discovery journey"
      data-testid="button-start"
    >
      <Sparkles className="mr-2 h-5 w-5" />
      Begin Your Discovery
    </Button>
  );
}
