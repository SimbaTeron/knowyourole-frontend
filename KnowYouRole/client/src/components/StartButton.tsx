import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface StartButtonProps {
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}

const triggerHaptic = (duration = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

export default function StartButton({ disabled = false, onClick, label = "Begin Your Journey" }: StartButtonProps) {
  const handleClick = () => {
    if (!disabled) {
      triggerHaptic(80);
      onClick();
    }
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={handleClick}
      disabled={disabled}
      className={`group w-full py-4 px-6 rounded-xl font-medium text-base transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden relative ${
        disabled
          ? "bg-warm-gray/8 text-warm-gray/30 dark:bg-soft-cream/5 dark:text-soft-cream/20 cursor-not-allowed"
          : "trail-button text-white"
      }`}
      aria-label={label}
      data-testid="button-start"
    >
      {!disabled && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-white/10 animate-unroll"
          style={{ transformOrigin: "left center" }}
        />
      )}
      {!disabled && <Sparkles className="h-4 w-4 opacity-80 relative z-10" />}
      <span className="relative z-10">{label}</span>
      <ArrowRight className={`h-4 w-4 transition-all duration-300 relative z-10 ${
        !disabled ? "group-hover:translate-x-1" : ""
      }`} />
    </motion.button>
  );
}
