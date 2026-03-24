import { motion } from "framer-motion";

interface CompassNeedleProps {
  mood: string;
  size?: number;
}

const moodAngles: Record<string, number> = {
  energized: 0,
  reflective: -90,
  stuck: 180,
  "": 45,
};

export default function CompassNeedle({ mood, size = 48 }: CompassNeedleProps) {
  const angle = moodAngles[mood] ?? 45;

  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
      aria-label={`Compass pointing ${mood || "neutral"}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-full h-full"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-terracotta/20"
        />
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="0.75"
          className="text-terracotta/10"
          strokeDasharray="2 4"
        />
        
        <text x="24" y="8" textAnchor="middle" className="fill-terracotta/40 text-[6px] font-medium">N</text>
        <text x="42" y="26" textAnchor="middle" className="fill-terracotta/40 text-[6px] font-medium">E</text>
        <text x="24" y="44" textAnchor="middle" className="fill-terracotta/40 text-[6px] font-medium">S</text>
        <text x="6" y="26" textAnchor="middle" className="fill-terracotta/40 text-[6px] font-medium">W</text>

        <motion.g
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 12 }}
          style={{ transformOrigin: "24px 24px" }}
        >
          <path
            d="M24 8 L26 24 L24 28 L22 24 Z"
            className="fill-terracotta"
          />
          <path
            d="M24 40 L22 24 L24 20 L26 24 Z"
            className="fill-sage-green/60"
          />
        </motion.g>

        <circle
          cx="24"
          cy="24"
          r="3"
          className="fill-terracotta"
        />
        <circle
          cx="24"
          cy="24"
          r="1.5"
          className="fill-soft-cream dark:fill-deep-cream"
        />
      </svg>
    </div>
  );
}
