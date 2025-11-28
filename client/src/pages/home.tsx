import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import KnowRoleHeader from "@/components/KnowRoleHeader";
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
  icon: string;
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
    setTimeout(() => setStep("mood"), 200);
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
      title: "Journey Started",
      description: landmark 
        ? `Exploring your ${landmark.landmark} inspired path...`
        : "Preparing your personalized discovery path...",
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

  const themeClass = landmark?.class || "";

  return (
    <div className="min-h-screen bg-soft-cream dark:bg-deep-cream transition-colors duration-500">
      <PathCanvas />
      <KnowRoleHeader />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 pt-28 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 animate-slide-up">
            <p
              className="text-base text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed"
              data-testid="text-subtitle"
            >
              Swipe your everyday path to traits, sparks, and growth.
            </p>
          </div>

          <div className="journal-card-elevated rounded-2xl p-6 md:p-7">
            {step === "tier" && (
              <AgeTierSelector selectedTier={ageTier} onSelect={handleTierSelect} />
            )}

            {step === "mood" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-terracotta transition-colors hover:text-terracotta-dark"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-terracotta">
                    Step 2 of 4
                  </span>
                </div>

                <MoodSelector mood={mood} onMoodChange={setMood} />
                
                <FunModeToggle enabled={funMode} onToggle={setFunMode} />

                <div className="pt-2">
                  <button
                    onClick={handleMoodComplete}
                    disabled={!mood}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      mood
                        ? "trail-button text-white"
                        : "bg-warm-gray/10 text-warm-gray/40 cursor-not-allowed"
                    }`}
                    data-testid="button-continue-mood"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === "postal" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-terracotta transition-colors hover:text-terracotta-dark"
                    data-testid="button-back-postal"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-terracotta">
                    Step 3 of 4
                  </span>
                </div>

                <PostalInput
                  onLandmarkFound={handleLandmarkFound}
                  onSkip={handleSkipPostal}
                />
              </div>
            )}

            {step === "ready" && (
              <div className="space-y-6 animate-slide-up">
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-terracotta transition-colors hover:text-terracotta-dark"
                    data-testid="button-back-ready"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-sage-green">
                    Ready!
                  </span>
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold text-warm-gray dark:text-soft-cream">
                    Your path is set
                  </h2>

                  {landmark && (
                    <div className="flex justify-center">
                      <LandmarkBadge
                        landmark={landmark.landmark}
                        icon={landmark.icon}
                        themeClass={landmark.class}
                        city={landmark.city}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-terracotta/10 text-terracotta">
                      {ageTier}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-sage-green/10 text-sage-green">
                      {mood}
                    </span>
                    {funMode && (
                      <span className="px-3 py-1 rounded-full bg-dusty-blue/10 text-dusty-blue">
                        😏 Fun Mode
                      </span>
                    )}
                  </div>
                </div>

                <StartButton onClick={handleStart} />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  n === getStepNumber() ? "bg-terracotta w-6" : n < getStepNumber() ? "bg-sage-green w-1.5" : "bg-terracotta/20 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 py-4 text-center">
        <a
          href="#"
          className="text-xs italic text-warm-gray/50 dark:text-soft-cream/40 hover:text-terracotta dark:hover:text-terracotta transition-colors group"
          data-testid="link-footer"
        >
          Chart your everyday constellation of traits
          <span className="inline-block ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </footer>
    </div>
  );
}
