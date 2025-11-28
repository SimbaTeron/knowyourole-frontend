import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import KnowRoleHeader from "@/components/KnowRoleHeader";
import AgeTierSelector from "@/components/AgeTierSelector";
import MoodSelector from "@/components/MoodSelector";
import FunModeToggle from "@/components/FunModeToggle";
import StartButton from "@/components/StartButton";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [ageTier, setAgeTier] = useState<string | null>(null);
  const [mood, setMood] = useState("");
  const [funMode, setFunMode] = useState(false);
  const [step, setStep] = useState<"tier" | "preferences">("tier");
  const { toast } = useToast();

  const handleTierSelect = (tierId: string) => {
    setAgeTier(tierId);
    setTimeout(() => setStep("preferences"), 200);
  };

  const handleBack = () => {
    setStep("tier");
  };

  const handleStart = () => {
    toast({
      title: "Journey Started",
      description: "Preparing your personalized discovery path...",
    });
  };

  const canStart = ageTier && mood;

  return (
    <div className="min-h-screen bg-soft-cream dark:bg-deep-cream transition-colors duration-500">
      <PathCanvas />
      <KnowRoleHeader />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 pt-28 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10 animate-slide-up">
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

            {step === "preferences" && (
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
                    Step 2 of 2
                  </span>
                </div>

                <MoodSelector mood={mood} onMoodChange={setMood} />
                
                <FunModeToggle enabled={funMode} onToggle={setFunMode} />

                <div className="pt-2">
                  <StartButton disabled={!canStart} onClick={handleStart} />
                </div>

                {!canStart && (
                  <p className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40">
                    Select your vibe to continue
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              step === "tier" ? "bg-terracotta w-6" : "bg-terracotta/20 w-1.5"
            }`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              step === "preferences" ? "bg-terracotta w-6" : "bg-terracotta/20 w-1.5"
            }`} />
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
