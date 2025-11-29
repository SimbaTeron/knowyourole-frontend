import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Compass, ArrowRight, SkipForward, Sparkles } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import CompactHeader from "@/components/CompactHeader";
import FunModeToggle from "@/components/FunModeToggle";
import { ThemeMode } from "@/components/ThemeToggle";
import { useLocalityTheme } from "@/contexts/LocalityThemeContext";
import landmarksData from "@/data/landmarks.json";

interface LandmarkResult {
  landmark: string;
  city: string;
  theme?: string;
}

export default function LocationPage() {
  const [, setLocation] = useLocation();
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");
  const [funMode, setFunMode] = useState(false);
  const [landmark, setLandmark] = useState<LandmarkResult | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const { setLocality, teamName, isLocalitySet } = useLocalityTheme();

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    const storedFunMode = sessionStorage.getItem("knowrole-funmode");
    const storedLandmark = sessionStorage.getItem("knowrole-landmark");
    
    if (stored && (stored === "light" || stored === "dark")) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
    if (storedFunMode === "true") {
      setFunMode(true);
    }
    if (storedLandmark) {
      setLandmark(JSON.parse(storedLandmark));
    }
  }, []);

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

  const [isLoading, setIsLoading] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [detectedState, setDetectedState] = useState<string | null>(null);

  const lookupPostalCode = async (code: string, countryCode: string) => {
    if (code.length < 3) return;
    
    setIsLoading(true);
    try {
      const cleanPostal = code.trim().replace(/\s+/g, "%20");
      const response = await fetch(
        `https://api.zippopotam.us/${countryCode}/${cleanPostal}`
      );

      if (!response.ok) {
        throw new Error("Location not found");
      }

      const data = await response.json();
      const city = data.places?.[0]?.["place name"] || "";
      const state = data.places?.[0]?.["state abbreviation"] || data.places?.[0]?.["state"] || "";
      
      if (city) {
        setDetectedCity(city);
        setDetectedState(state);
        
        setLocality(city, state, countryCode);
        
        const countryData = (landmarksData as Record<string, Record<string, { landmark: string; theme?: string }>>)[countryCode.toLowerCase()];
        if (countryData) {
          for (const [cityName, info] of Object.entries(countryData)) {
            if (city.toLowerCase().includes(cityName.toLowerCase()) ||
                cityName.toLowerCase().includes(city.toLowerCase())) {
              const landmarkResult = {
                landmark: info.landmark,
                city: cityName,
                theme: info.theme,
              };
              setLandmark(landmarkResult);
              sessionStorage.setItem("knowrole-landmark", JSON.stringify(landmarkResult));
              break;
            }
          }
        }
      }
    } catch (err) {
      console.log("Could not look up postal code:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostalChange = (value: string) => {
    setPostalCode(value);
    if (value.length >= 5 && country === "US") {
      lookupPostalCode(value, country);
    } else if (value.length >= 3) {
      lookupPostalCode(value, country);
    }
  };

  const handleFunModeToggle = (enabled: boolean) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setFunMode(enabled);
    sessionStorage.setItem("knowrole-funmode", enabled.toString());
  };

  const handleBeginJourney = () => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    setLocation("/quiz");
  };

  const handleSkip = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    setLocation("/quiz");
  };

  const handleBack = () => {
    setLocation("/mood");
  };

  const getThemeClass = () => {
    return theme === "dark" ? "dark-mysterious" : "light-clinical";
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${getThemeClass()}`}>
      <PathCanvas />
      <CompactHeader
        onBack={handleBack}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      <main className="relative z-10 pt-24 pb-40 px-4 min-h-screen flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-terracotta/10 dark:bg-sunset-amber/20 mb-4">
              <Compass className="w-8 h-8 text-terracotta dark:text-sunset-amber" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold compass-gradient-text mb-3">
              Personalize Your Path
            </h1>
            <p className="text-warm-gray/70 dark:text-soft-cream/60 text-base">
              Add local flavor to your journey (optional)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-6 space-y-6"
          >
            <div className="space-y-3">
              <label className="text-sm font-medium text-warm-gray dark:text-soft-cream flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta dark:text-sunset-amber" />
                Your Area (Postal Code)
              </label>
              <div className="flex gap-3">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-24 px-3 py-3 rounded-xl bg-soft-cream/50 dark:bg-deep-cream/30 border border-terracotta/10 dark:border-sunset-amber/20 text-warm-gray dark:text-soft-cream focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  data-testid="select-country"
                >
                  <option value="US">US</option>
                  <option value="CA">CA</option>
                  <option value="UK">UK</option>
                  <option value="AU">AU</option>
                  <option value="DE">DE</option>
                  <option value="FR">FR</option>
                  <option value="JP">JP</option>
                  <option value="BR">BR</option>
                  <option value="IN">IN</option>
                  <option value="MX">MX</option>
                </select>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => handlePostalChange(e.target.value.toUpperCase())}
                  placeholder="e.g., 10001"
                  maxLength={10}
                  className="flex-1 px-4 py-3 rounded-xl bg-soft-cream/50 dark:bg-deep-cream/30 border border-terracotta/10 dark:border-sunset-amber/20 text-warm-gray dark:text-soft-cream placeholder:text-warm-gray/40 dark:placeholder:text-soft-cream/30 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  data-testid="input-postal"
                />
              </div>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-terracotta/10"
                >
                  <div className="w-4 h-4 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
                  <span className="text-sm text-warm-gray/70 dark:text-soft-cream/60">
                    Finding your area...
                  </span>
                </motion.div>
              )}
              
              {!isLoading && detectedCity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg locality-gradient text-white">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {detectedCity}{detectedState ? `, ${detectedState}` : ""}
                    </span>
                  </div>
                  {teamName && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-soft-cream/80 dark:bg-deep-cream/50 border border-terracotta/10">
                      <Sparkles className="w-4 h-4 locality-primary-text" />
                      <span className="text-sm text-warm-gray dark:text-soft-cream">
                        Theme: <span className="font-medium locality-gradient-text">{teamName}</span>
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
              
              {!isLoading && !detectedCity && landmark && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sage-green/10 dark:bg-sage-green/20 border border-sage-green/20"
                >
                  <Sparkles className="w-4 h-4 text-sage-green" />
                  <span className="text-sm text-sage-green dark:text-sage-green/90">
                    Near {landmark.landmark}
                  </span>
                </motion.div>
              )}
            </div>

            <div className="pt-4 border-t border-terracotta/8 dark:border-sunset-amber/10">
              <FunModeToggle 
                enabled={funMode} 
                onToggle={handleFunModeToggle}
              />
            </div>
          </motion.div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-deep-cream dark:via-deep-cream/95 pb-8">
        <div className="max-w-md mx-auto space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleBeginJourney}
            className="w-full py-5 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 trail-button text-white"
            data-testid="button-begin-journey"
          >
            <Compass className="w-5 h-5" />
            Begin Journey
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={handleSkip}
            className="w-full py-3 text-sm text-warm-gray/50 dark:text-soft-cream/40 flex items-center justify-center gap-1 hover:text-warm-gray/70 dark:hover:text-soft-cream/60 transition-colors"
            data-testid="button-skip-location"
          >
            <SkipForward className="w-4 h-4" />
            Skip personalization
          </motion.button>
        </div>
      </div>
    </div>
  );
}
