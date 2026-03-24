import { useState } from "react";
import { MapPin, Loader2, Check, X } from "lucide-react";
import landmarksData from "@/data/landmarks.json";

interface LandmarkInfo {
  landmark: string;
  class: string;
  lucideIcon: string;
  type: string;
  city?: string;
  country?: string;
}

interface PostalInputProps {
  onLandmarkFound: (landmark: LandmarkInfo | null) => void;
  onSkip: () => void;
}

export default function PostalInput({ onLandmarkFound, onSkip }: PostalInputProps) {
  const [postal, setPostal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundCity, setFoundCity] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!postal.trim()) {
      onSkip();
      return;
    }

    setLoading(true);
    setError("");
    setFoundCity(null);

    try {
      const rawPostal = postal.trim();
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
      const state = data.places?.[0]?.["state"] || "";
      const country = data.country || "";

      setFoundCity(city);

      const countryLandmarks = (landmarksData as Record<string, Record<string, LandmarkInfo>>)[countryCode];
      
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

      setTimeout(() => {
        onLandmarkFound(landmarkInfo);
      }, 400);

    } catch (err) {
      setError("Couldn't find that zip code");
      const fallbacks = (landmarksData as Record<string, Record<string, LandmarkInfo>>).fallback;
      setTimeout(() => {
        onLandmarkFound({ ...fallbacks.urban, city: "Your City", country: "Unknown" });
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dusty-blue/8 mb-4">
          <MapPin className="w-3 h-3 text-dusty-blue" />
          <span className="text-micro text-dusty-blue">Optional</span>
        </div>
        <h2 className="text-headline text-warm-gray dark:text-soft-cream mb-1">
          Add local flavor
        </h2>
        <p className="text-subhead text-warm-gray dark:text-soft-cream text-sm">
          Get a theme inspired by your location
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            placeholder="Enter zip code (e.g., 10001)"
            className="w-full h-12 px-4 rounded-xl bg-soft-cream/60 dark:bg-deep-cream/40 border border-terracotta/8 text-warm-gray dark:text-soft-cream placeholder:text-warm-gray/35 dark:placeholder:text-soft-cream/25 focus:outline-none focus:border-terracotta/25 focus:ring-2 focus:ring-terracotta/10 transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            data-testid="input-postal"
          />
          {foundCity && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sage-green text-xs font-medium">
              <Check className="w-3.5 h-3.5" />
              {foundCity}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-terracotta/80 flex items-center gap-1.5 pl-1">
            <X className="w-3 h-3" />
            {error}
          </p>
        )}
        
        <p className="text-xs text-warm-gray/40 dark:text-soft-cream/30 text-center">
          US and Canada zip codes supported
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onSkip}
          className="flex-1 h-12 rounded-xl text-warm-gray/60 dark:text-soft-cream/50 font-medium text-sm hover:text-warm-gray dark:hover:text-soft-cream transition-colors"
          data-testid="button-skip-postal"
        >
          Skip this step
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 h-12 rounded-xl trail-button text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          data-testid="button-submit-postal"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Find Location
            </>
          )}
        </button>
      </div>

      <p className="text-center text-micro text-warm-gray/30 dark:text-soft-cream/20">
        Anonymous only — no data stored
      </p>
    </div>
  );
}
