'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");
  const [funMode, setFunMode] = useState(false);
  const [landmark, setLandmark] = useState<LandmarkResult | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
      return stored === "light" ? "light" : "dark";
    }
    return "dark";
  });
  const { setLocality, teamName, isLocalitySet } = useLocalityTheme();

  useEffect(() => {
    const storedFunMode = sessionStorage.getItem("knowrole-funmode");
    const storedLandmark = sessionStorage.getItem("knowrole-landmark");
    
    if (storedFunMode === "true") {
      setFunMode(true);
    }
    if (storedLandmark) {
      setLandmark(JSON.parse(storedLandmark));
    }
    
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    if (theme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  }, [theme]);

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

  const lookupPostalCode = async (code: string) => {
    if (code.length < 3) return;
    
    setIsLoading(true);
    try {
      const rawPostal = code.trim();
      const isCanadianFormat = /^[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d$/i.test(rawPostal);
      const isUSFormat = /^\d{5}(-\d{4})?$/.test(rawPostal);
      
      let response: Response;
      let countryCode: string;
      
      if (isCanadianFormat) {
        const cleanCanadian = rawPostal.toUpperCase().replace(/[\s-]/g, '');
        const formattedCanadian = cleanCanadian.slice(0, 3) + ' ' + cleanCanadian.slice(3);
        response = await fetch(`https://api.zippopotam.us/ca/${encodeURIComponent(formattedCanadian)}`);
        countryCode = "ca";
      } else if (isUSFormat) {
        const cleanUS = rawPostal.slice(0, 5);
        response = await fetch(`https://api.zippopotam.us/us/${cleanUS}`);
        countryCode = "us";
      } else {
        response = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(rawPostal)}`);
        countryCode = "us";
        
        if (!response.ok) {
          const cleanCanadian = rawPostal.toUpperCase().replace(/[\s-]/g, '');
          if (cleanCanadian.length === 6) {
            const formattedCanadian = cleanCanadian.slice(0, 3) + ' ' + cleanCanadian.slice(3);
            response = await fetch(`https://api.zippopotam.us/ca/${encodeURIComponent(formattedCanadian)}`);
            countryCode = "ca";
          }
        }
      }

      if (!response.ok) {
        throw new Error("Location not found");
      }

      const data = await response.json();
      const city = data.places?.[0]?.["place name"] || "";
      const state = data.places?.[0]?.["state abbreviation"] || data.places?.[0]?.["state"] || "";
      
      if (city) {
        setDetectedCity(city);
        setDetectedState(state);
        setCountry(countryCode.toUpperCase());
        
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
      setDetectedCity(null);
      setDetectedState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostalChange = (value: string) => {
    setPostalCode(value);
    if (value.length >= 5) {
      lookupPostalCode(value);
    } else if (value.length >= 3 && /^[A-Za-z]\d[A-Za-z]/i.test(value)) {
      lookupPostalCode(value);
    }
  };

  const handleFunModeToggle = (enabled: boolean) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setFunMode(enabled);
    sessionStorage.setItem("knowrole-funmode", enabled.toString());
  };

  const handleBeginJourney = () => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    router.push("/quiz");
  };

  const handleSkip = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    router.push("/quiz");
  };

  const handleBack = () => {
    router.push("/mood-mixer");
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-terracotta/10 dark:bg-[#A78BFA]/20 mb-4">
              <Compass className="w-8 h-8 text-terracotta dark:text-[#A78BFA]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold compass-gradient-text mb-3">
              Personalize Your Path
            </h1>
            <p className="text-warm-gray/70 dark:text-[#94A3B8] text-base">
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
              <label className="text-sm font-medium text-warm-gray dark:text-[#F8FAFC] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta dark:text-[#A78BFA]" />
                Your Area (Zip Code)
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => handlePostalChange(e.target.value.toUpperCase())}
                placeholder="Enter zip code (e.g., 10001)"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl bg-soft-cream/50 dark:bg-[#1E1E2E]/50 border border-terracotta/10 dark:border-[#A78BFA]/20 text-warm-gray dark:text-[#F8FAFC] placeholder:text-warm-gray/40 dark:placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-terracotta/30 dark:focus:ring-[#A78BFA]/30"
                data-testid="input-postal"
              />
              <p className="text-xs text-warm-gray/50 dark:text-[#64748B] text-center">
                US and Canada zip codes supported
              </p>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-terracotta/10"
                >
                  <div className="w-4 h-4 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
                  <span className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
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

            <div className="pt-4 border-t border-terracotta/8 dark:border-[#A78BFA]/10">
              <FunModeToggle 
                enabled={funMode} 
                onToggle={handleFunModeToggle}
              />
            </div>
          </motion.div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-[#0A0A0F] dark:via-[#0A0A0F]/95 pb-8">
        <div className="max-w-md mx-auto space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleBeginJourney}
            className={`w-full py-5 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 ${
              isLocalitySet 
                ? "locality-button" 
                : "trail-button text-white"
            }`}
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
            className="w-full py-3 text-sm text-warm-gray/50 dark:text-[#64748B] flex items-center justify-center gap-1 hover:text-warm-gray/70 dark:hover:text-[#94A3B8] transition-colors"
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
