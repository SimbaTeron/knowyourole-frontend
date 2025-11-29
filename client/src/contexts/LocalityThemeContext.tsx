import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { LocalityTheme, hexToHSL, getLocalityTheme, genericThemes } from "@/data/cityThemes";

interface LocalityThemeContextType {
  localityTheme: LocalityTheme | null;
  teamName: string | null;
  cityName: string | null;
  setLocality: (city: string, state?: string, country?: string) => void;
  clearLocality: () => void;
  isLocalitySet: boolean;
}

const LocalityThemeContext = createContext<LocalityThemeContextType | undefined>(undefined);

export function LocalityThemeProvider({ children }: { children: React.ReactNode }) {
  const [localityTheme, setLocalityTheme] = useState<LocalityTheme | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);

  const applyLocalityColors = useCallback((theme: LocalityTheme) => {
    const root = document.documentElement;
    
    const primaryHSL = hexToHSL(theme.primary);
    const secondaryHSL = hexToHSL(theme.secondary);
    const accentHSL = hexToHSL(theme.accent);
    
    root.style.setProperty("--locality-primary", `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    root.style.setProperty("--locality-secondary", `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`);
    root.style.setProperty("--locality-accent", `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
    
    root.style.setProperty("--locality-primary-hex", theme.primary);
    root.style.setProperty("--locality-secondary-hex", theme.secondary);
    root.style.setProperty("--locality-accent-hex", theme.accent);
    
    root.style.setProperty("--locality-text-on-primary", theme.textOnPrimary === "light" ? "0 0% 100%" : "0 0% 10%");
    root.style.setProperty("--locality-text-on-secondary", theme.textOnSecondary === "light" ? "0 0% 100%" : "0 0% 10%");
    
    root.classList.add("locality-themed");
  }, []);

  const clearLocalityColors = useCallback(() => {
    const root = document.documentElement;
    
    root.style.removeProperty("--locality-primary");
    root.style.removeProperty("--locality-secondary");
    root.style.removeProperty("--locality-accent");
    root.style.removeProperty("--locality-primary-hex");
    root.style.removeProperty("--locality-secondary-hex");
    root.style.removeProperty("--locality-accent-hex");
    root.style.removeProperty("--locality-text-on-primary");
    root.style.removeProperty("--locality-text-on-secondary");
    
    root.classList.remove("locality-themed");
  }, []);

  const setLocality = useCallback((city: string, state?: string, country?: string) => {
    const theme = getLocalityTheme(city, state, country);
    setLocalityTheme(theme);
    setCityName(city);
    setTeamName(theme.team);
    applyLocalityColors(theme);
    
    sessionStorage.setItem("knowrole-locality", JSON.stringify({
      city,
      state,
      country,
      theme
    }));
  }, [applyLocalityColors]);

  const clearLocality = useCallback(() => {
    setLocalityTheme(null);
    setCityName(null);
    setTeamName(null);
    clearLocalityColors();
    sessionStorage.removeItem("knowrole-locality");
  }, [clearLocalityColors]);

  useEffect(() => {
    const stored = sessionStorage.getItem("knowrole-locality");
    if (stored) {
      try {
        const { city, state, country, theme } = JSON.parse(stored);
        setLocalityTheme(theme);
        setCityName(city);
        setTeamName(theme.team);
        applyLocalityColors(theme);
      } catch (e) {
        console.error("Failed to parse stored locality theme", e);
      }
    }
  }, [applyLocalityColors]);

  return (
    <LocalityThemeContext.Provider
      value={{
        localityTheme,
        teamName,
        cityName,
        setLocality,
        clearLocality,
        isLocalitySet: localityTheme !== null
      }}
    >
      {children}
    </LocalityThemeContext.Provider>
  );
}

export function useLocalityTheme() {
  const context = useContext(LocalityThemeContext);
  if (context === undefined) {
    throw new Error("useLocalityTheme must be used within a LocalityThemeProvider");
  }
  return context;
}
