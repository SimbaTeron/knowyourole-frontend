import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Quiz, { QuizScores } from "@/components/Quiz";
import ResultsPage from "@/pages/results";
import { ThemeMode } from "@/components/ThemeToggle";
import { LocalityThemeProvider } from "@/contexts/LocalityThemeContext";
import { isTestMode, getFakeScores, getFakeMBTIType } from "@/utils/devTest";

type TierValue = "7-12" | "13-18" | "19-25" | "25plus";

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [quizScores, setQuizScores] = useState<QuizScores | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Read tier from sessionStorage (set by quiz-gateway)
  const sessionTier = (sessionStorage.getItem("knowrole-tier") || "25plus") as TierValue;
  // Read mood from localStorage kyr_mood_blend (set by mood-mixer) - it's stored as JSON
  const moodBlendStr = localStorage.getItem("kyr_mood_blend");
  const moodBlend = moodBlendStr ? JSON.parse(moodBlendStr) : null;
  const sessionMood = moodBlend?.label || "";
  const sessionFunMode = sessionStorage.getItem("knowrole-funmode") === "true";
  const landmarkData = sessionStorage.getItem("knowrole-landmark");
  const sessionLandmark = landmarkData ? JSON.parse(landmarkData) : null;

  const ageTier: TierValue = sessionTier;
  const mood = sessionMood;
  const funMode = sessionFunMode;
  const landmark = sessionLandmark?.landmark;

  // Dev test mode: skip quiz and jump straight to results page (inline)
  // Only fires when ?test=true is explicitly in URL (not on all localhost routes)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("test") !== "true") return;
    const urlParams = new URLSearchParams(window.location.search);
    const testTier = (urlParams.get("tier") || "25+") as TierValue;
    const fakeScores = getFakeScores(testTier);
    // Store fake scores in sessionStorage so ResultsPage can read them
    sessionStorage.setItem("knowrole-tier", testTier);
    sessionStorage.setItem("knowrole-mood-blend", JSON.stringify({ mood1: "focused", mood2: "curious", label: "Zen Master" }));
    sessionStorage.setItem("kyr_fake_scores", JSON.stringify({
      mbti: fakeScores.mbti,
      disc: fakeScores.disc,
      bigFive: fakeScores.bigFive,
    }));
    sessionStorage.setItem("kyr_tier", testTier);
    sessionStorage.setItem("kyr_fake_type", `${getFakeMBTIType(fakeScores)}-A`);
    // Show results inline on this page instead of redirecting
    setQuizScores(fakeScores as unknown as QuizScores);
    setShowResults(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    document.documentElement.classList.add("dark", "dark-mysterious");
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("knowrole-theme", newTheme);
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    document.documentElement.classList.add(newTheme === "dark" ? "dark" : "light-clinical");
  };

  const handleQuizComplete = (scores: QuizScores) => {
    // Always store full real scores in sessionStorage so ResultsPage can read them
    sessionStorage.setItem("kyr_real_scores", JSON.stringify(scores));
    sessionStorage.setItem("kyr_tier", ageTier);
    setQuizScores(scores);
    setShowResults(true);
  };

  const handleQuizExit = () => {
    sessionStorage.clear();
    setQuizScores(null);
    setShowResults(false);
    setLocation("/");
  };

  const handleRestart = () => {
    sessionStorage.clear();
    setQuizScores(null);
    setShowResults(false);
    setLocation("/");
  };

  if (showResults) {
    return (
      <LocalityThemeProvider>
        <ResultsPage />
      </LocalityThemeProvider>
    );
  }

  return (
    <LocalityThemeProvider>
      <div className="min-h-screen relative overflow-hidden" style={{ background: "#050510" }}>
        <Quiz
          tier={ageTier}
          mood={mood}
          funMode={funMode}
          landmark={landmark}
          theme={theme}
          onComplete={handleQuizComplete}
          onExit={handleQuizExit}
        />
      </div>
    </LocalityThemeProvider>
  );
}
