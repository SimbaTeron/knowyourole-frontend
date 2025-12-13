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
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
      return stored === "light" ? "light" : "dark";
    }
    return "dark";
  });
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


  useEffect(() => {
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
      
      
    } catch (error) {
      console.error("Failed to save quiz results:", error);
    }

    setShowResults(true);
  };

  const handleQuizExit = () => {
    // Clear all session data and go to home
    sessionStorage.clear();
    setQuizScores(null);
    setQuizSessionId(null);
    setShowResults(false);
    setLocation("/");
  };

  const handleRestart = () => {
    sessionStorage.clear();
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
  
  // PDF Download - triggers browser print dialog with beautiful design
  const handleDownloadPDF = () => {
    if (!quizScores) return;
    
    const mbtiType = [
      quizScores.mbti.E > quizScores.mbti.I ? "E" : "I",
      quizScores.mbti.S > quizScores.mbti.N ? "S" : "N",
      quizScores.mbti.T > quizScores.mbti.F ? "T" : "F",
      quizScores.mbti.J > quizScores.mbti.P ? "J" : "P",
    ].join("");
    
    const disc = quizScores.disc;
    const discMax = Math.max(disc.D, disc.I, disc.S, disc.C);
    const discType = disc.D === discMax ? "D" : disc.I === discMax ? "I" : disc.S === discMax ? "S" : "C";
    
    // MBTI Labels
    const mbtiLabels: Record<string, { label: string; desc: string }> = {
      "INTJ": { label: "The Architect", desc: "Strategic, independent, and determined. You see the big picture and work relentlessly toward your vision." },
      "INTP": { label: "The Logician", desc: "Innovative, curious, and analytical. You love exploring ideas and finding creative solutions." },
      "ENTJ": { label: "The Commander", desc: "Bold, decisive, and driven. You naturally take charge and inspire others to follow your lead." },
      "ENTP": { label: "The Debater", desc: "Clever, curious, and quick-witted. You love intellectual challenges and thinking outside the box." },
      "INFJ": { label: "The Advocate", desc: "Idealistic, insightful, and principled. You're driven by a deep sense of purpose and meaning." },
      "INFP": { label: "The Mediator", desc: "Empathetic, creative, and idealistic. You seek authenticity and strive to make a positive difference." },
      "ENFJ": { label: "The Protagonist", desc: "Charismatic, inspiring, and empathetic. You naturally bring out the best in others." },
      "ENFP": { label: "The Campaigner", desc: "Enthusiastic, creative, and sociable. You see life as full of possibilities and inspire others." },
      "ISTJ": { label: "The Logistician", desc: "Practical, dependable, and thorough. You value tradition and work diligently toward your goals." },
      "ISFJ": { label: "The Defender", desc: "Warm, dedicated, and responsible. You take care of others and maintain harmony in your environment." },
      "ESTJ": { label: "The Executive", desc: "Organized, logical, and assertive. You excel at managing people and projects efficiently." },
      "ESFJ": { label: "The Consul", desc: "Caring, sociable, and traditional. You create harmony and support those around you." },
      "ISTP": { label: "The Virtuoso", desc: "Bold, practical, and experimental. You love working with your hands and solving real problems." },
      "ISFP": { label: "The Adventurer", desc: "Gentle, sensitive, and artistic. You live in the moment and express yourself through action." },
      "ESTP": { label: "The Entrepreneur", desc: "Energetic, perceptive, and direct. You thrive on action and live life to the fullest." },
      "ESFP": { label: "The Entertainer", desc: "Spontaneous, energetic, and fun-loving. You bring joy and excitement wherever you go." },
    };
    
    // DISC Labels
    const discLabels: Record<string, { label: string; desc: string; color: string }> = {
      "D": { label: "Dominance", desc: "Results-oriented, confident, and decisive. You tackle challenges head-on.", color: "#EF4444" },
      "I": { label: "Influence", desc: "Enthusiastic, optimistic, and collaborative. You inspire and motivate others.", color: "#F59E0B" },
      "S": { label: "Steadiness", desc: "Reliable, patient, and team-oriented. You create stability and support others.", color: "#10B981" },
      "C": { label: "Conscientiousness", desc: "Analytical, precise, and quality-focused. You value accuracy and expertise.", color: "#3B82F6" },
    };
    
    // Big Five trait descriptions
    const bigFiveDesc: Record<string, { high: string; low: string }> = {
      O: { high: "Curious, creative, and open to new experiences", low: "Practical, conventional, and grounded" },
      C: { high: "Organized, disciplined, and goal-oriented", low: "Flexible, spontaneous, and adaptable" },
      E: { high: "Outgoing, energetic, and sociable", low: "Reflective, reserved, and independent" },
      A: { high: "Cooperative, trusting, and helpful", low: "Competitive, skeptical, and analytical" },
      N: { high: "Emotionally aware and sensitive", low: "Calm, resilient, and even-tempered" },
    };
    
    const mbtiInfo = mbtiLabels[mbtiType] || { label: "Explorer", desc: "You have a unique personality blend." };
    const discInfo = discLabels[discType] || { label: "Balanced", desc: "You adapt your style to different situations.", color: "#8B5CF6" };
    
    // Generate trait bars HTML
    const traitBars = Object.entries(quizScores.bigFive).map(([trait, value]) => {
      const traitNames: Record<string, string> = { O: "Openness", C: "Conscientiousness", E: "Extraversion", A: "Agreeableness", N: "Neuroticism" };
      const traitColors: Record<string, string> = { O: "#8B5CF6", C: "#3B82F6", E: "#F59E0B", A: "#10B981", N: "#EF4444" };
      const desc = value >= 50 ? bigFiveDesc[trait].high : bigFiveDesc[trait].low;
      return `
        <div class="trait-row">
          <div class="trait-header">
            <span class="trait-name">${traitNames[trait]}</span>
            <span class="trait-value" style="color: ${traitColors[trait]}">${value.toFixed(0)}%</span>
          </div>
          <div class="trait-bar-bg">
            <div class="trait-bar" style="width: ${value}%; background: ${traitColors[trait]}"></div>
          </div>
          <p class="trait-desc">${desc}</p>
        </div>
      `;
    }).join('');
    
    // Badges HTML
    const badgesHtml = earnedBadges.length > 0 ? `
      <div class="section">
        <h2>Earned Badges</h2>
        <div class="badges">
          ${earnedBadges.map(b => `<span class="badge">${b.name}</span>`).join('')}
        </div>
      </div>
    ` : '';
    
    // Hybrid types HTML
    const hybridsHtml = hybridTypes.length > 0 ? `
      <div class="section">
        <h2>Your Unique Blends</h2>
        <div class="hybrids">
          ${hybridTypes.map(h => `<span class="hybrid">${h}</span>`).join('')}
        </div>
      </div>
    ` : '';
    
    // API Scales HTML
    const scalesHtml = apiScales ? `
      <div class="section">
        <h2>Thinking Skills</h2>
        <div class="scales-grid">
          <div class="scale-item">
            <div class="scale-header">
              <span class="scale-name">Critical Thinking</span>
              <span class="scale-value">${apiScales.critical.value}%</span>
            </div>
            <div class="trait-bar-bg">
              <div class="trait-bar" style="width: ${apiScales.critical.value}%; background: #6366F1"></div>
            </div>
            <p class="trait-desc">${apiScales.critical.traits}</p>
          </div>
          <div class="scale-item">
            <div class="scale-header">
              <span class="scale-name">First Principles</span>
              <span class="scale-value">${apiScales.firstPrinciples.value}%</span>
            </div>
            <div class="trait-bar-bg">
              <div class="trait-bar" style="width: ${apiScales.firstPrinciples.value}%; background: #EC4899"></div>
            </div>
            <p class="trait-desc">${apiScales.firstPrinciples.traits}</p>
          </div>
        </div>
      </div>
    ` : '';
    
    // Location info
    const locationHtml = isLocalitySet && teamName ? `
      <div class="location-badge">
        <span>Personalized for ${teamName}</span>
      </div>
    ` : '';
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>My KnowRole Personality Profile - ${mbtiType}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            
            body { 
              font-family: 'Inter', system-ui, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 32px; 
              color: #1F2937; 
              background: linear-gradient(180deg, #FEF7ED 0%, #FFFFFF 100%);
              line-height: 1.5;
            }
            
            .header {
              text-align: center;
              margin-bottom: 32px;
              padding-bottom: 24px;
              border-bottom: 2px solid #E5E7EB;
            }
            
            .logo {
              font-size: 28px;
              font-weight: 700;
              color: #C65D3B;
              margin-bottom: 4px;
              letter-spacing: -0.5px;
            }
            
            .tagline {
              font-size: 14px;
              color: #6B7280;
            }
            
            .location-badge {
              display: inline-block;
              margin-top: 12px;
              padding: 6px 16px;
              background: linear-gradient(135deg, #C65D3B 0%, #5F7A61 100%);
              color: white;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .hero {
              background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%);
              border-radius: 16px;
              padding: 32px;
              margin-bottom: 24px;
              text-align: center;
              border: 2px solid #F59E0B;
            }
            
            .mbti-type {
              font-size: 56px;
              font-weight: 700;
              color: #C65D3B;
              letter-spacing: 4px;
              margin-bottom: 8px;
            }
            
            .mbti-label {
              font-size: 24px;
              font-weight: 600;
              color: #92400E;
              margin-bottom: 12px;
            }
            
            .mbti-desc {
              font-size: 16px;
              color: #78350F;
              max-width: 500px;
              margin: 0 auto;
            }
            
            .personality-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            
            .card {
              background: white;
              border-radius: 12px;
              padding: 20px;
              border: 1px solid #E5E7EB;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .card-full {
              grid-column: 1 / -1;
            }
            
            .disc-card {
              border-left: 4px solid ${discInfo.color};
            }
            
            .card-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;
            }
            
            .card-icon {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
            }
            
            .card-title {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #9CA3AF;
              margin-bottom: 4px;
            }
            
            .card-value {
              font-size: 20px;
              font-weight: 700;
              color: #1F2937;
            }
            
            .card-desc {
              font-size: 14px;
              color: #6B7280;
            }
            
            .section {
              margin-bottom: 24px;
            }
            
            h2 {
              font-size: 18px;
              font-weight: 700;
              color: #5F7A61;
              margin-bottom: 16px;
              padding-bottom: 8px;
              border-bottom: 2px solid #D1FAE5;
            }
            
            .trait-row {
              margin-bottom: 16px;
            }
            
            .trait-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 6px;
            }
            
            .trait-name {
              font-size: 14px;
              font-weight: 600;
              color: #374151;
            }
            
            .trait-value {
              font-size: 16px;
              font-weight: 700;
            }
            
            .trait-bar-bg {
              height: 10px;
              background: #E5E7EB;
              border-radius: 5px;
              overflow: hidden;
              margin-bottom: 6px;
            }
            
            .trait-bar {
              height: 100%;
              border-radius: 5px;
              transition: width 0.3s ease;
            }
            
            .trait-desc {
              font-size: 12px;
              color: #6B7280;
              font-style: italic;
            }
            
            .scales-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
            
            .scale-item {
              background: #F9FAFB;
              padding: 16px;
              border-radius: 8px;
            }
            
            .scale-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            
            .scale-name {
              font-weight: 600;
              font-size: 14px;
            }
            
            .scale-value {
              font-weight: 700;
              color: #6366F1;
            }
            
            .badges {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            
            .badge {
              background: linear-gradient(135deg, #FEF3C7, #FDE68A);
              color: #92400E;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              border: 1px solid #F59E0B;
            }
            
            .hybrids {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            
            .hybrid {
              background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
              color: #5B21B6;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              border: 1px solid #A78BFA;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 24px;
              border-top: 2px solid #E5E7EB;
              text-align: center;
            }
            
            .footer-text {
              font-size: 12px;
              color: #9CA3AF;
              margin-bottom: 8px;
            }
            
            .footer-date {
              font-size: 14px;
              color: #6B7280;
              font-weight: 500;
            }
            
            .footer-cta {
              margin-top: 16px;
              padding: 12px 24px;
              background: #C65D3B;
              color: white;
              border-radius: 8px;
              display: inline-block;
              font-weight: 600;
              font-size: 14px;
            }
            
            @media print {
              body {
                background: white;
                padding: 20px;
              }
              .hero {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .trait-bar, .badge, .hybrid {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">KnowRole</div>
            <div class="tagline">Your Everyday Compass to Self-Discovery</div>
            ${locationHtml}
          </div>
          
          <div class="hero">
            <div class="mbti-type">${mbtiType}</div>
            <div class="mbti-label">${mbtiInfo.label}</div>
            <p class="mbti-desc">${mbtiInfo.desc}</p>
          </div>
          
          <div class="personality-grid">
            <div class="card disc-card">
              <div class="card-header">
                <div class="card-icon" style="background: ${discInfo.color}20; color: ${discInfo.color};">
                  ${discType}
                </div>
                <div>
                  <div class="card-title">Work Style</div>
                  <div class="card-value">${discInfo.label}</div>
                </div>
              </div>
              <p class="card-desc">${discInfo.desc}</p>
            </div>
            
            <div class="card">
              <div class="card-header">
                <div class="card-icon" style="background: #FEF3C7; color: #F59E0B;">
                  &#9733;
                </div>
                <div>
                  <div class="card-title">Top Strength</div>
                  <div class="card-value">${Object.entries(quizScores.bigFive).sort((a, b) => b[1] - a[1])[0][0] === 'O' ? 'Openness' : Object.entries(quizScores.bigFive).sort((a, b) => b[1] - a[1])[0][0] === 'C' ? 'Conscientiousness' : Object.entries(quizScores.bigFive).sort((a, b) => b[1] - a[1])[0][0] === 'E' ? 'Extraversion' : Object.entries(quizScores.bigFive).sort((a, b) => b[1] - a[1])[0][0] === 'A' ? 'Agreeableness' : 'Neuroticism'}</div>
                </div>
              </div>
              <p class="card-desc">${Object.entries(quizScores.bigFive).sort((a, b) => b[1] - a[1])[0][1].toFixed(0)}% - Your standout personality trait</p>
            </div>
          </div>
          
          ${badgesHtml}
          ${hybridsHtml}
          
          <div class="section">
            <h2>Big Five Personality Profile</h2>
            ${traitBars}
          </div>
          
          ${scalesHtml}
          
          <div class="footer">
            <p class="footer-text">This personality profile was generated by KnowRole</p>
            <p class="footer-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div class="footer-cta">Retake the quiz at knowrole.app</div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
        onDownloadPDF={handleDownloadPDF}
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
