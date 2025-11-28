import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import NebulaCanvas from "@/components/NebulaCanvas";
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
    setTimeout(() => setStep("preferences"), 300);
  };

  const handleBack = () => {
    setStep("tier");
  };

  const handleStart = () => {
    toast({
      title: "Journey Initiated",
      description: "Preparing your personalized discovery experience...",
    });
  };

  const canStart = ageTier && mood;

  return (
    <div className="min-h-screen bg-gradient-to-br from-nebula-core via-white to-nebula-core dark:from-indigo-deep dark:via-[#162942] dark:to-indigo-deep transition-colors duration-700">
      <NebulaCanvas />
      <KnowRoleHeader />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-28 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 animate-slide-up">
            <p className="text-base md:text-lg text-indigo-deep/70 dark:text-white/70 max-w-sm mx-auto leading-relaxed" data-testid="text-subtitle">
              Map your inner nebula through a journey of self-discovery
            </p>
          </div>

          <div className="glass-card-elevated rounded-3xl p-6 md:p-8">
            {step === "tier" && (
              <AgeTierSelector selectedTier={ageTier} onSelect={handleTierSelect} />
            )}

            {step === "preferences" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm font-medium text-violet-echo dark:text-lavender-shift transition-colors hover:text-indigo-deep dark:hover:text-white"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <span className="text-sm font-medium tracking-widest uppercase text-violet-echo dark:text-lavender-shift">
                    Step 2 of 2
                  </span>
                </div>

                <MoodSelector mood={mood} onMoodChange={setMood} />
                
                <div className="pt-2">
                  <FunModeToggle enabled={funMode} onToggle={setFunMode} />
                </div>

                <div className="pt-4">
                  <StartButton disabled={!canStart} onClick={handleStart} />
                </div>

                {!canStart && (
                  <p className="text-center text-sm text-indigo-deep/50 dark:text-white/50">
                    Select your current vibe to continue
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === "tier" ? "bg-violet-echo w-6" : "bg-indigo-deep/20 dark:bg-white/20"}`} />
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === "preferences" ? "bg-violet-echo w-6" : "bg-indigo-deep/20 dark:bg-white/20"}`} />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 py-4 text-center">
        <p className="text-xs font-medium tracking-wide text-indigo-deep/40 dark:text-white/40">
          Discover your constellation of traits
        </p>
      </footer>
    </div>
  );
}
