import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Quiz, { QuizScores } from "@/components/Quiz";
import Results from "@/components/Results";
import { ThemeMode } from "@/components/ThemeToggle";
import { LocalityThemeProvider } from "@/contexts/LocalityThemeContext";

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

  if (showResults && quizScores) {
    return (
      <LocalityThemeProvider>
        <Results
          scores={quizScores}
          tier={ageTier}
          mood={mood}
          funMode={funMode}
          landmark={landmark}
          theme={theme}
          sessionId={null}
          apiScales={null}
          earnedBadges={[]}
          hybridTypes={[]}
          startOnPremiumPage={false}
          onRestart={handleRestart}
          onShare={() => {
            if (navigator.share) {
              navigator.share({ title: "My KnowRole Result", text: "I discovered my personality path!", url: window.location.origin });
            } else {
              navigator.clipboard.writeText("I discovered my personality path!");
            }
          }}
          onDownloadPDF={() => window.print()}
        />
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
