import { useState } from "react";
import { MapPin, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import landmarksData from "@/data/landmarks.json";

const countries = [
  { code: "us", name: "United States", placeholder: "10001" },
  { code: "in", name: "India", placeholder: "110001" },
  { code: "gb", name: "United Kingdom", placeholder: "SW1A 1AA" },
  { code: "fr", name: "France", placeholder: "75001" },
  { code: "jp", name: "Japan", placeholder: "100-0001" },
  { code: "au", name: "Australia", placeholder: "2000" },
  { code: "cn", name: "China", placeholder: "100000" },
  { code: "br", name: "Brazil", placeholder: "01310-100" },
  { code: "ae", name: "UAE", placeholder: "00000" },
  { code: "it", name: "Italy", placeholder: "00100" },
];

interface LandmarkInfo {
  landmark: string;
  class: string;
  icon: string;
  type: string;
  city?: string;
  country?: string;
}

interface PostalInputProps {
  onLandmarkFound: (landmark: LandmarkInfo | null) => void;
  onSkip: () => void;
}

export default function PostalInput({ onLandmarkFound, onSkip }: PostalInputProps) {
  const [countryCode, setCountryCode] = useState("us");
  const [postal, setPostal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundCity, setFoundCity] = useState<string | null>(null);

  const selectedCountry = countries.find(c => c.code === countryCode);

  const handleSubmit = async () => {
    if (!postal.trim()) {
      onSkip();
      return;
    }

    setLoading(true);
    setError("");
    setFoundCity(null);

    try {
      const cleanPostal = postal.trim().replace(/\s+/g, "%20");
      const response = await fetch(
        `https://api.zippopotam.us/${countryCode}/${cleanPostal}`
      );

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
      }, 500);

    } catch (err) {
      setError("Couldn't find that location. Try another or skip.");
      const fallbacks = (landmarksData as Record<string, Record<string, LandmarkInfo>>).fallback;
      setTimeout(() => {
        onLandmarkFound({ ...fallbacks.urban, city: "Your City", country: "Unknown" });
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 animate-slide-up">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dusty-blue/10 text-dusty-blue text-xs font-medium mb-3">
          <MapPin className="w-3 h-3" />
          Optional
        </div>
        <h2 className="text-xl font-semibold text-warm-gray dark:text-soft-cream">
          Add local flavor?
        </h2>
        <p className="mt-1 text-sm text-warm-gray/60 dark:text-soft-cream/50">
          Postal code for personalized path themes
        </p>
      </div>

      <div className="space-y-3">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger 
            className="w-full bg-soft-cream dark:bg-deep-cream/60 border-terracotta/15 dark:border-terracotta/25"
            data-testid="select-country"
          >
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="bg-warm-white dark:bg-deep-cream border-terracotta/20">
            {countries.map((country) => (
              <SelectItem 
                key={country.code} 
                value={country.code}
                className="text-warm-gray dark:text-soft-cream"
              >
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <input
            type="text"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            placeholder={selectedCountry?.placeholder || "Enter postal code"}
            className="w-full p-4 rounded-xl bg-soft-cream dark:bg-deep-cream/60 border border-terracotta/15 dark:border-terracotta/25 text-warm-gray dark:text-soft-cream placeholder:text-warm-gray/40 dark:placeholder:text-soft-cream/30 focus:outline-none focus:border-terracotta/40 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            data-testid="input-postal"
          />
          {foundCity && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sage-green text-sm">
              <Check className="w-4 h-4" />
              {foundCity}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-terracotta flex items-center gap-1">
            <X className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="flex-1 text-warm-gray/70 dark:text-soft-cream/60 hover:text-warm-gray dark:hover:text-soft-cream"
          data-testid="button-skip-postal"
        >
          Skip
        </Button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 px-4 rounded-xl trail-button text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          data-testid="button-submit-postal"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Find My Path
            </>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-warm-gray/40 dark:text-soft-cream/30 italic">
        Local flavor only — anonymous aggregate
      </p>
    </div>
  );
}
