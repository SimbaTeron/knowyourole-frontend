import { useState } from "react";
import { Check, Zap, BookOpen, Compass, MapPin, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CompassNeedle from "./CompassNeedle";
import landmarksData from "@/data/landmarks.json";

interface MoodOption {
  value: string;
  label: string;
  description: string;
  Icon: typeof Zap;
}

const moodOptions: MoodOption[] = [
  { value: "energized", label: "Energized", description: "Ready to move forward with energy!", Icon: Zap },
  { value: "reflective", label: "Reflective", description: "Taking time to think and process", Icon: BookOpen },
  { value: "stuck", label: "Finding my way", description: "Looking for direction and clarity", Icon: Compass },
];


export interface LandmarkInfo {
  landmark: string;
  class: string;
  lucideIcon: string;
  type: string;
  city?: string;
  country?: string;
}

const triggerHaptic = (duration = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

interface MoodSelectorProps {
  mood: string;
  onMoodChange: (mood: string) => void;
  onLandmarkChange?: (landmark: LandmarkInfo | null) => void;
  landmark?: LandmarkInfo | null;
}

export default function MoodSelector({ mood, onMoodChange, onLandmarkChange, landmark }: MoodSelectorProps) {
  const [showLocalFlavor, setShowLocalFlavor] = useState(false);
  const [postal, setPostal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundCity, setFoundCity] = useState<string | null>(null);

  const handleLocationSubmit = async () => {
    if (!postal.trim()) {
      setShowLocalFlavor(false);
      return;
    }

    setLoading(true);
    setError("");
    setFoundCity(null);

    try {
      const cleanPostal = postal.trim().replace(/\s+/g, "");
      const response = await fetch(
        `https://api.zippopotam.us/us/${cleanPostal}`
      );

      if (!response.ok) {
        throw new Error("Location not found");
      }

      const data = await response.json();
      const city = data.places?.[0]?.["place name"] || "";
      const state = data.places?.[0]?.["state"] || "";
      const country = "United States";

      setFoundCity(city);

      const countryLandmarks = (landmarksData as Record<string, Record<string, LandmarkInfo>>)["us"];
      
      let landmarkInfo: LandmarkInfo | null = null;

      if (countryLandmarks) {
        for (const [cityName, info] of Object.entries(countryLandmarks)) {
          if (
            city.toLowerCase().includes(cityName.toLowerCase()) ||
            cityName.toLowerCase().includes(city.toLowerCase()) ||
            state?.toLowerCase().includes(cityName.toLowerCase())
          ) {
            landmarkInfo = { ...info, city: cityName, country };
            break;
          }
        }
      }

      if (!landmarkInfo) {
        const fallbacks = (landmarksData as Record<string, Record<string, LandmarkInfo>>).fallback;
        landmarkInfo = { ...fallbacks.urban, city, country };
      }

      triggerHaptic(80);
      onLandmarkChange?.(landmarkInfo);

    } catch (err) {
      setError("Couldn't find that location");
      const fallbacks = (landmarksData as Record<string, Record<string, LandmarkInfo>>).fallback;
      onLandmarkChange?.({ ...fallbacks.urban, city: "Your City", country: "Unknown" });
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setPostal("");
    setFoundCity(null);
    setError("");
    onLandmarkChange?.(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-headline text-warm-gray dark:text-soft-cream mb-0.5">
            How are you feeling?
          </h2>
          <p className="text-subhead text-warm-gray/70 dark:text-soft-cream/60 text-sm">
            Your current state shapes your path
          </p>
        </div>
        <CompassNeedle mood={mood} size={52} />
      </div>

      <div className="grid grid-cols-1 gap-3 mb-5">
        {moodOptions.map((option, index) => {
          const isSelected = mood === option.value;
          const Icon = option.Icon;
          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                triggerHaptic(50);
                onMoodChange(option.value);
              }}
              className={`relative min-h-[88px] p-5 text-left rounded-xl shadow-md transition-all duration-200 border-2 ${
                isSelected 
                  ? "bg-terracotta/15 dark:bg-terracotta/25 border-terracotta shadow-lg ring-2 ring-terracotta ring-offset-2" 
                  : "bg-white dark:bg-gray-800 border-transparent hover:border-terracotta/20 hover:shadow-lg"
              }`}
              aria-label={`Select mood: ${option.label} - ${option.description}`}
              data-testid={`button-mood-${option.value}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected 
                    ? "bg-terracotta" 
                    : "bg-terracotta/10 dark:bg-terracotta/20"
                }`}>
                  <Icon className={`w-6 h-6 transition-colors ${
                    isSelected ? "text-white" : "text-terracotta"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-bold block text-2xl leading-tight ${
                    isSelected ? "text-terracotta dark:text-white" : "text-black dark:text-white"
                  }`}>
                    {option.label}
                  </span>
                  <span className={`text-base block mt-1 ${
                    isSelected ? "text-terracotta/80 dark:text-soft-cream/90" : "text-gray-600 dark:text-gray-300"
                  }`}>
                    {option.description}
                  </span>
                </div>
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0"
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="border-t border-terracotta/10 dark:border-terracotta/20 pt-4">
        <button
          onClick={() => {
            triggerHaptic(30);
            setShowLocalFlavor(!showLocalFlavor);
          }}
          className="w-full flex items-center justify-between py-2 group"
          data-testid="button-toggle-local-flavor"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-dusty-blue" />
            <span className="text-sm font-medium text-warm-gray/70 dark:text-soft-cream/60 group-hover:text-warm-gray dark:group-hover:text-soft-cream transition-colors">
              Tune your path to your spot?
            </span>
            <span className="text-xs text-warm-gray/40 dark:text-soft-cream/30">(Optional)</span>
          </div>
          {showLocalFlavor ? (
            <ChevronUp className="w-4 h-4 text-warm-gray/50 dark:text-soft-cream/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-warm-gray/50 dark:text-soft-cream/40" />
          )}
        </button>

        <AnimatePresence>
          {showLocalFlavor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-2 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={postal}
                      onChange={(e) => setPostal(e.target.value)}
                      placeholder="Enter ZIP code (e.g. 10001)"
                      className="w-full h-10 px-3 rounded-lg bg-soft-cream/60 dark:bg-deep-cream/40 border border-terracotta/8 text-warm-gray dark:text-soft-cream text-sm placeholder:text-warm-gray/35 dark:placeholder:text-soft-cream/25 focus:outline-none focus:border-terracotta/25 focus:ring-2 focus:ring-terracotta/10 transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleLocationSubmit()}
                      data-testid="input-postal-inline"
                      maxLength={5}
                    />
                    {foundCity && (
                      <button
                        onClick={clearLocation}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Clear location"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleLocationSubmit}
                    disabled={loading || !postal.trim()}
                    className="h-10 px-4 rounded-lg bg-dusty-blue/80 hover:bg-dusty-blue text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    data-testid="button-find-location"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" />
                        Find
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-terracotta/80 flex items-center gap-1.5">
                    <X className="w-3 h-3" />
                    {error}
                  </p>
                )}

                {foundCity && landmark && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-sage-green"
                  >
                    <Check className="w-4 h-4" />
                    <span>Found: <strong>{foundCity}</strong> - {landmark.landmark}</span>
                  </motion.div>
                )}

                <p className="text-center text-[10px] text-warm-gray/30 dark:text-soft-cream/20">
                  Anon aggregate only — no data stored
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
