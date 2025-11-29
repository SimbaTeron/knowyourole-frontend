import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOOD_INGREDIENTS = [
  { id: "happy", icon: "sun", label: "Happy", color: "bg-amber-400" },
  { id: "calm", icon: "moon", label: "Calm", color: "bg-blue-400" },
  { id: "curious", icon: "search", label: "Curious", color: "bg-purple-400" },
  { id: "determined", icon: "target", label: "Determined", color: "bg-red-400" },
  { id: "creative", icon: "brush", label: "Creative", color: "bg-pink-400" },
  { id: "social", icon: "users", label: "Social", color: "bg-green-400" },
];

const HYBRID_HINTS: Record<string, { title: string; desc: string }> = {
  "happy+calm": { title: "Peaceful Optimist", desc: "You bring steady sunshine to every situation" },
  "happy+curious": { title: "Wonder Seeker", desc: "You find joy in learning new things" },
  "happy+determined": { title: "Driven Enthusiast", desc: "You chase goals with a smile" },
  "happy+creative": { title: "Joyful Creator", desc: "You make beautiful things with positive energy" },
  "happy+social": { title: "Life of the Party", desc: "Your energy lights up every room" },
  "calm+curious": { title: "Thoughtful Explorer", desc: "You ponder deeply before diving in" },
  "calm+determined": { title: "Steady Achiever", desc: "You reach goals without breaking a sweat" },
  "calm+creative": { title: "Serene Artist", desc: "You create from a place of peace" },
  "calm+social": { title: "Gentle Connector", desc: "You build lasting bonds through patience" },
  "curious+determined": { title: "Knowledge Hunter", desc: "You won't stop until you understand" },
  "curious+creative": { title: "Inventive Mind", desc: "You see possibilities others miss" },
  "curious+social": { title: "People Watcher", desc: "You love understanding what makes others tick" },
  "determined+creative": { title: "Ambitious Maker", desc: "You turn visions into reality" },
  "determined+social": { title: "Team Leader", desc: "You inspire others to reach their potential" },
  "creative+social": { title: "Collaborative Artist", desc: "You bring out creativity in everyone" },
};

function getHybridKey(id1: string, id2: string): string {
  return [id1, id2].sort().join("+");
}

export default function EmojiMoodMixer() {
  const [cauldronMoods, setCauldronMoods] = useState<string[]>([]);
  const [hybridResult, setHybridResult] = useState<{ title: string; desc: string } | null>(null);
  const [isBrewing, setIsBrewing] = useState(false);
  const cauldronRef = useRef<HTMLDivElement>(null);

  const handleIngredientClick = (moodId: string) => {
    if (cauldronMoods.length >= 2) return;
    if (cauldronMoods.includes(moodId)) return;
    
    if (navigator.vibrate) navigator.vibrate(30);
    const newMoods = [...cauldronMoods, moodId];
    setCauldronMoods(newMoods);
    
    if (newMoods.length === 2) {
      setIsBrewing(true);
      setTimeout(() => {
        const key = getHybridKey(newMoods[0], newMoods[1]);
        setHybridResult(HYBRID_HINTS[key] || { title: "Unique Blend", desc: "A one-of-a-kind personality mix!" });
        setIsBrewing(false);
      }, 1500);
    }
  };

  const handleReset = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    setCauldronMoods([]);
    setHybridResult(null);
    setIsBrewing(false);
  };

  const availableIngredients = MOOD_INGREDIENTS.filter(m => !cauldronMoods.includes(m.id));
  const selectedIngredients = MOOD_INGREDIENTS.filter(m => cauldronMoods.includes(m.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/30 dark:border-purple-700/30"
    >
      <div className="text-center mb-4">
        <p className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Mood Mixer
        </p>
        <p className="text-xs text-purple-600/60 dark:text-purple-400/50">
          Tap two ingredients to brew your hybrid
        </p>
      </div>

      {/* Ingredient Pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {availableIngredients.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleIngredientClick(mood.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium text-white ${mood.color} shadow-sm transition-all disabled:opacity-50`}
            disabled={cauldronMoods.length >= 2}
            data-testid={`button-ingredient-${mood.id}`}
          >
            {mood.label}
          </motion.button>
        ))}
      </div>

      {/* Cauldron */}
      <div 
        ref={cauldronRef}
        className={`relative mx-auto w-32 h-24 rounded-b-full bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center gap-2 ${
          isBrewing ? "animate-pulse" : ""
        }`}
      >
        {/* Cauldron rim */}
        <div className="absolute -top-2 left-0 right-0 h-4 bg-gray-600 rounded-full" />
        
        {/* Selected moods in cauldron */}
        <AnimatePresence>
          {selectedIngredients.map((mood, idx) => (
            <motion.div
              key={mood.id}
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              className={`w-8 h-8 rounded-full ${mood.color} flex items-center justify-center shadow-lg text-white text-xs font-bold`}
            >
              {mood.label[0]}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Brewing bubbles */}
        {isBrewing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ y: [-5, -15, -5], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-purple-400/60"
            />
          </div>
        )}
      </div>

      {/* Result */}
      <AnimatePresence>
        {hybridResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700"
          >
            <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">
              {hybridResult.title}
            </p>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/60">
              {hybridResult.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button */}
      {cauldronMoods.length > 0 && (
        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800"
            data-testid="button-reset-mixer"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        </div>
      )}
    </motion.div>
  );
}
