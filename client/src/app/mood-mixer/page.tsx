"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import CompactHeader from "@/components/CompactHeader";
import { ThemeMode } from "@/components/ThemeToggle";

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  color: string;
  glowColor: string;
  trait: string;
  boost: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: "focused", emoji: "🎯", label: "Focused", color: "#14B8A6", glowColor: "rgba(20,184,166,0.4)", trait: "Conscientiousness", boost: "+8%" },
  { id: "creative", emoji: "🎨", label: "Creative", color: "#A78BFA", glowColor: "rgba(167,139,250,0.4)", trait: "Openness", boost: "+10%" },
  { id: "calm", emoji: "🌊", label: "Calm", color: "#60A5FA", glowColor: "rgba(96,165,250,0.4)", trait: "Emotional Stability", boost: "+5%" },
  { id: "energetic", emoji: "⚡", label: "Energetic", color: "#FBBF24", glowColor: "rgba(251,191,36,0.4)", trait: "Extraversion", boost: "+8%" },
  { id: "curious", emoji: "🔮", label: "Curious", color: "#F472B6", glowColor: "rgba(244,114,182,0.4)", trait: "Openness", boost: "+8%" },
  { id: "determined", emoji: "💪", label: "Determined", color: "#F87171", glowColor: "rgba(248,113,113,0.4)", trait: "Conscientiousness", boost: "+8%" },
  { id: "social", emoji: "🤝", label: "Social", color: "#34D399", glowColor: "rgba(52,211,153,0.4)", trait: "Extraversion", boost: "+10%" },
  { id: "reflective", emoji: "🌙", label: "Reflective", color: "#67E8F9", glowColor: "rgba(103,232,249,0.4)", trait: "First Principles", boost: "+5%" },
];

const MOOD_BLEND_NAMES: Record<string, string> = {
  "focused+energetic": "Laser Focus",
  "focused+creative": "Master Craftsperson",
  "focused+calm": "Zen Master",
  "focused+curious": "Deep Diver",
  "focused+determined": "Unstoppable Force",
  "focused+social": "Relationship Builder",
  "focused+reflective": "Thoughtful Achiever",
  "creative+energetic": "Wild Innovator",
  "creative+calm": "Serene Artist",
  "creative+curious": "Inventive Mind",
  "creative+determined": "Ambitious Maker",
  "creative+social": "Collaborative Artist",
  "creative+reflective": "Imaginative Thinker",
  "calm+energetic": "Cool Under Pressure",
  "calm+curious": "Thoughtful Explorer",
  "calm+determined": "Steady Achiever",
  "calm+social": "Gentle Connector",
  "calm+reflective": "Peaceful Observer",
  "energetic+curious": "Adventurous Explorer",
  "energetic+determined": "Goal Crusher",
  "energetic+social": "Life of the Party",
  "energetic+reflective": "Passionate Dreamer",
  "curious+determined": "Knowledge Hunter",
  "curious+social": "People Watcher",
  "curious+reflective": "Deep Thinker",
  "determined+social": "Team Leader",
  "determined+reflective": "Purposeful Strategist",
  "social+reflective": "Intuitive Connector",
};

function getBlendName(mood1: string, mood2: string): string {
  const key = [mood1, mood2].sort().join("+");
  return MOOD_BLEND_NAMES[key] || "Unique Blend";
}

export default function MoodMixerPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [selected, setSelected] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [blendName, setBlendName] = useState("");

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("knowrole-theme", newTheme);
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  };

  const handleBack = () => {
    router.push("/quiz-gateway");
  };

  const handleMoodSelect = (moodId: string) => {
    if (selected.includes(moodId)) {
      setSelected(prev => prev.filter(id => id !== moodId));
    } else if (selected.length < 2) {
      const newSelected = [...selected, moodId];
      setSelected(newSelected);

      if (newSelected.length === 2) {
        const name = getBlendName(newSelected[0], newSelected[1]);
        setBlendName(name);
        setShowResult(true);
      }
    }
  };

  const handleContinue = () => {
    if (selected.length === 2) {
      const [mood1, mood2] = selected;
      const name = getBlendName(mood1, mood2);
      sessionStorage.setItem("knowrole-mood", mood1);
      sessionStorage.setItem("kyr_mood_blend", JSON.stringify({ mood1, mood2, label: name }));
      if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
      router.push("/quiz");
    } else {
      if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
      router.push("/quiz");
    }
  };

  const handleSkip = () => {
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    router.push("/quiz");
  };

  const selectedMoods = MOOD_OPTIONS.filter(m => selected.includes(m.id));
  const indicatorText = selected.length === 0
    ? "Select 2 moods"
    : selected.length === 1
    ? "Select 1 more mood"
    : "Blend Ready";

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050510]">
      <PathCanvas />

      {/* Step indicator + back */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="text-white text-lg">←</span>
          </button>
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#7800FF", letterSpacing: "0.12em" }}
          >
            STEP 2 OF 3
          </span>
          <div style={{ width: 40 }} />
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 pt-20 pb-32 px-4 min-h-screen flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#FF00E5", letterSpacing: "0.25em" }}
            >
              Set Your Vibe
            </div>
            <h1
              className="text-4xl font-black tracking-tight text-white"
              style={{ letterSpacing: "-0.03em", fontFamily: "Outfit, sans-serif" }}
            >
              Mood Mixer
            </h1>
            <p className="mt-3 text-base text-white/60">
              Tap two moods to brew your unique blend.
            </p>
          </motion.div>

          {/* Mood grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-4 gap-3 mb-6"
          >
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selected.includes(mood.id);
              return (
                <motion.button
                  key={mood.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood.id)}
                  disabled={selected.length >= 2 && !isSelected}
                  className={`
                    flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all
                    ${isSelected
                      ? "border-white/60 bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }
                    disabled:opacity-30
                  `}
                  style={{
                    boxShadow: isSelected ? `0 0 20px ${mood.glowColor}` : "none",
                  }}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span
                    className="text-xs font-semibold text-white/80"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {mood.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Selected moods display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "#A78BFA" }}>
                ✦ {indicatorText} ✦
              </span>
            </div>

            {/* Selected mood badges */}
            <div className="flex items-center justify-center gap-3">
              <AnimatePresence mode="wait">
                {selectedMoods.map((mood, i) => (
                  <motion.div
                    key={mood.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                    style={{
                      borderColor: mood.color,
                      boxShadow: `0 0 16px ${mood.glowColor}`,
                      background: `${mood.color}15`,
                    }}
                  >
                    <span className="text-lg">{mood.emoji}</span>
                    <span className="text-sm font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {mood.label}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Blend result */}
          <AnimatePresence>
            {showResult && selected.length === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="text-center mb-6"
              >
                <div
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2"
                  style={{
                    borderColor: "#7800FF",
                    background: "rgba(120,0,255,0.1)",
                    boxShadow: "0 0 30px rgba(120,0,255,0.3)",
                  }}
                >
                  <Beaker className="w-5 h-5" style={{ color: "#7800FF" }} />
                  <div className="text-left">
                    <div
                      className="text-sm font-bold text-white"
                      style={{ color: "#7800FF", fontFamily: "Outfit, sans-serif" }}
                    >
                      Your Blend
                    </div>
                    <div
                      className="text-xl font-black text-white"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {blendName}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {selected.length === 2 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full py-4 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7800FF, #00E5FF)",
                  boxShadow: "0 4px 24px rgba(120,0,255,0.5)",
                }}
              >
                Continue with Your Blend
                <span>→</span>
              </motion.button>
            )}

            <button
              onClick={handleSkip}
              className="w-full py-3 text-center text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
            >
              Skip this step →
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/5">
        <div className="max-w-md mx-auto">
          <p className="text-xs text-white/30 text-center">
            © 2026 KnowYouRole. Personality science made accessible, fun, and genuinely useful.
          </p>
        </div>
      </footer>
    </div>
  );
}
