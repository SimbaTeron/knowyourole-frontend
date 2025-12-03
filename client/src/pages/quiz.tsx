import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import PathCanvas from "@/components/PathCanvas";
import Quiz, { QuizScores } from "@/components/Quiz";
import Results from "@/components/Results";
import { ThemeMode } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocalityTheme } from "@/contexts/LocalityThemeContext";

interface APIScales {
  critical: { value: number; traits: string; quest: string };
  firstPrinciples: { value: number; traits: string; quest: string };
}

// Phase 2.2: Badge interface for earned achievements
interface EarnedBadge {
  name: string;
  type: string;
  icon: string;
  color: string;
}

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [quizScores, setQuizScores] = useState<QuizScores | null>(null);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const [apiScales, setApiScales] = useState<APIScales | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [hybridTypes, setHybridTypes] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { teamName, isLocalitySet } = useLocalityTheme();

  // Type for age tiers
  type TierValue = "7-12" | "13-18" | "19-25" | "25plus";
  
  // State for tier/mood/etc - can be overridden by stored results
  const [storedTier, setStoredTier] = useState<TierValue | null>(null);
  const [storedMood, setStoredMood] = useState<string | null>(null);
  const [storedFunMode, setStoredFunMode] = useState<boolean | null>(null);
  const [storedLandmark, setStoredLandmark] = useState<string | null>(null);

  const sessionTier = (sessionStorage.getItem("knowrole-tier") || "25plus") as TierValue;
  const sessionMood = sessionStorage.getItem("knowrole-mood") || "";
  const sessionFunMode = sessionStorage.getItem("knowrole-funmode") === "true";
  const landmarkData = sessionStorage.getItem("knowrole-landmark");
  const sessionLandmark = landmarkData ? JSON.parse(landmarkData) : null;

  // Use stored values if available, otherwise fall back to session values
  const ageTier: TierValue = storedTier ?? sessionTier;
  const mood = storedMood ?? sessionMood;
  const funMode = storedFunMode ?? sessionFunMode;
  const landmark = storedLandmark ? { landmark: storedLandmark } : sessionLandmark;

  // Check for stored premium results on mount (for returning from Crossroads, etc.)
  useEffect(() => {
    const storedResults = localStorage.getItem("knowrole-premium-results");
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        if (parsed.scores) {
          setQuizScores(parsed.scores);
          setQuizSessionId(parsed.sessionId || null);
          setApiScales(parsed.apiScales || null);
          setEarnedBadges(parsed.earnedBadges || []);
          setHybridTypes(parsed.hybridTypes || []);
          // Restore tier/mood/funMode/landmark from stored results
          if (parsed.tier) setStoredTier(parsed.tier as TierValue);
          if (parsed.mood !== undefined) setStoredMood(parsed.mood);
          if (parsed.funMode !== undefined) setStoredFunMode(parsed.funMode);
          if (parsed.landmark) setStoredLandmark(parsed.landmark);
          if (parsed.theme) setTheme(parsed.theme);
          setShowResults(true);
        }
      } catch (e) {
        console.error("Failed to parse stored results:", e);
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    if (stored && (stored === "light" || stored === "dark")) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark", "dark-mysterious");
      } else {
        document.documentElement.classList.add("light-clinical");
      }
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

  const handleQuizComplete = async (scores: QuizScores) => {
    setQuizScores(scores);
    
    let sessionId: string | null = null;
    let scales: APIScales | null = null;
    let badges: EarnedBadge[] = [];
    let hybrids: string[] = [];
    
    try {
      const response = await apiRequest("POST", "/api/score", {
        tier: ageTier,
        mood,
        funMode,
        landmark: landmark?.landmark,
        theme,
        scores,
      });
      const data = await response.json();
      if (data.sessionId) {
        sessionId = data.sessionId;
        setQuizSessionId(data.sessionId);
      }
      if (data.result?.scales) {
        scales = data.result.scales;
        setApiScales(data.result.scales);
      }
      // Phase 2.2: Extract badges and hybrid types from API response
      if (data.result?.earnedBadges) {
        badges = data.result.earnedBadges;
        setEarnedBadges(data.result.earnedBadges);
      }
      if (data.result?.hybridTypes) {
        hybrids = data.result.hybridTypes;
        setHybridTypes(data.result.hybridTypes);
      }
      
      // Store premium results for returning from other pages (Crossroads, etc.)
      const premiumResults = {
        scores,
        sessionId,
        apiScales: scales,
        earnedBadges: badges,
        hybridTypes: hybrids,
        tier: ageTier,
        mood,
        funMode,
        landmark: landmark?.landmark,
        theme,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem("knowrole-premium-results", JSON.stringify(premiumResults));
      
    } catch (error) {
      console.error("Failed to save quiz results:", error);
    }

    setShowResults(true);
  };

  const handleQuizExit = () => {
    setLocation("/location");
  };

  const handleRestart = () => {
    sessionStorage.clear();
    localStorage.removeItem("knowrole-premium-results"); // Clear stored results on explicit restart
    setQuizScores(null);
    setQuizSessionId(null);
    setShowResults(false);
    setLocation("/");
  };

  const handleShare = async () => {
    if (!quizScores) return;

    const mbtiType = [
      quizScores.mbti.E > quizScores.mbti.I ? "E" : "I",
      quizScores.mbti.S > quizScores.mbti.N ? "S" : "N",
      quizScores.mbti.T > quizScores.mbti.F ? "T" : "F",
      quizScores.mbti.J > quizScores.mbti.P ? "J" : "P",
    ].join("");

    const shareText = `I discovered my personality path! I'm a ${mbtiType} on KnowRole`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My KnowRole Result",
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Share your result with friends!",
      });
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else {
      setLocation("/location");
    }
  };

  const getThemeClass = () => {
    return theme === "dark" ? "dark-mysterious" : "light-clinical";
  };

  if (showResults && quizScores) {
    return (
      <Results
        scores={quizScores}
        tier={ageTier}
        mood={mood}
        funMode={funMode}
        landmark={landmark?.landmark}
        theme={theme}
        sessionId={quizSessionId}
        apiScales={apiScales}
        earnedBadges={earnedBadges}
        hybridTypes={hybridTypes}
        onRestart={handleRestart}
        onShare={handleShare}
      />
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${getThemeClass()}`}>
      <PathCanvas />
      
      <main className="relative z-10">
        <Quiz
          tier={ageTier}
          mood={mood}
          funMode={funMode}
          landmark={landmark?.landmark}
          theme={theme}
          onComplete={handleQuizComplete}
          onExit={handleQuizExit}
        />
      </main>
    </div>
  );
}
