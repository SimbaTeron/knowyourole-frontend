import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import KnowRoleHeader from "@/components/KnowRoleHeader";
import StepIndicator from "@/components/StepIndicator";
import AgeTierSelector from "@/components/AgeTierSelector";
import MoodSelector from "@/components/MoodSelector";
import FunModeToggle from "@/components/FunModeToggle";
import PostalInput from "@/components/PostalInput";
import LandmarkBadge from "@/components/LandmarkBadge";
import StartButton from "@/components/StartButton";
import { useToast } from "@/hooks/use-toast";

interface LandmarkInfo {
  landmark: string;
  class: string;
  lucideIcon: string;
  type: string;
  city?: string;
  country?: string;
}

type Step = "tier" | "mood" | "postal" | "ready";

export default function Home() {
  const [ageTier, setAgeTier] = useState<string | null>(null);
  const [mood, setMood] = useState("");
  const [funMode, setFunMode] = useState(false);
  const [landmark, setLandmark] = useState<LandmarkInfo | null>(null);
  const [step, setStep] = useState<Step>("tier");
  const { toast } = useToast();

  const handleTierSelect = (tierId: string) => {
    setAgeTier(tierId);
    setTimeout(() => setStep("mood"), 250);
  };

  const handleMoodComplete = () => {
    if (mood) {
      setStep("postal");
    }
  };

  const handleLandmarkFound = (info: LandmarkInfo | null) => {
    setLandmark(info);
    setStep("ready");
  };

  const handleSkipPostal = () => {
    setLandmark(null);
    setStep("ready");
  };

  const handleBack = () => {
    if (step === "mood") setStep("tier");
    else if (step === "postal") setStep("mood");
    else if (step === "ready") setStep("postal");
  };

  const handleStart = () => {
    toast({
      title: "Your journey begins",
      description: landmark 
        ? `Exploring your ${landmark.landmark} inspired path...`
        : "Mapping your personalized discovery path...",
    });
  };

  const getStepNumber = () => {
    switch (step) {
      case "tier": return 1;
      case "mood": return 2;
      case "postal": return 3;
      case "ready": return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen grain-overlay">
      <PathCanvas />
      <KnowRoleHeader />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 pt-32 pb-24">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6 animate-fade-in" style={{ animationDuration: '0.8s' }}>
            <p
              className="text-subhead text-warm-gray dark:text-soft-cream max-w-xs mx-auto"
              data-testid="text-subtitle"
            >
              Chart your everyday path to discover traits, sparks, and growth
            </p>
          </div>

          <StepIndicator currentStep={getStepNumber()} totalSteps={4} />

          <div className="floating-card">
            <div className="premium-card rounded-2xl p-7 md:p-8">
              {step === "tier" && (
                <AgeTierSelector selectedTier={ageTier} onSelect={handleTierSelect} />
              )}

              {step === "mood" && (
                <div className="space-y-6">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-terracotta/80 transition-colors hover:text-terracotta"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <MoodSelector mood={mood} onMoodChange={setMood} />
                  
                  <FunModeToggle enabled={funMode} onToggle={setFunMode} />

                  <StartButton
                    disabled={!mood}
                    onClick={handleMoodComplete}
                    label="Continue"
                  />
                </div>
              )}

              {step === "postal" && (
                <div className="space-y-4">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-terracotta/80 transition-colors hover:text-terracotta"
                    data-testid="button-back-postal"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <PostalInput
                    onLandmarkFound={handleLandmarkFound}
                    onSkip={handleSkipPostal}
                  />
                </div>
              )}

              {step === "ready" && (
                <div className="space-y-6" style={{ animation: 'slideUp 0.5s ease-out forwards' }}>
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-terracotta/80 transition-colors hover:text-terracotta"
                    data-testid="button-back-ready"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <div className="text-center space-y-5">
                    <div>
                      <h2 className="text-headline text-warm-gray dark:text-soft-cream mb-1">
                        You're all set
                      </h2>
                      <p className="text-subhead text-warm-gray dark:text-soft-cream text-sm">
                        Your personalized path awaits
                      </p>
                    </div>

                    {landmark && (
                      <div className="flex justify-center py-2">
                        <LandmarkBadge
                          landmark={landmark.landmark}
                          lucideIcon={landmark.lucideIcon}
                          themeClass={landmark.class}
                          city={landmark.city}
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-terracotta/8 text-terracotta text-xs font-medium">
                        {ageTier}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-sage-green/10 text-sage-green text-xs font-medium capitalize">
                        {mood}
                      </span>
                      {funMode && (
                        <span className="px-3 py-1.5 rounded-full bg-dusty-blue/10 text-dusty-blue text-xs font-medium">
                          Fun Mode
                        </span>
                      )}
                    </div>
                  </div>

                  <StartButton onClick={handleStart} label="Begin Your Journey" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 py-5 text-center">
        <p className="text-micro text-warm-gray/40 dark:text-soft-cream/30">
          Discover your constellation of traits
        </p>
      </footer>
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
