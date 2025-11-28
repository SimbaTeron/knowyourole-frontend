import { useState } from "react";
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
    setStep("preferences");
  };

  const handleStart = () => {
    toast({
      title: "Journey Initiated!",
      description: `Starting ${funMode ? "fun" : "standard"} discovery for ${ageTier} tier with ${mood || "balanced"} energy.`,
    });
    console.log("Starting discovery:", { ageTier, mood, funMode });
  };

  const canStart = ageTier && mood;

  return (
    <div className="min-h-screen bg-nebula-core dark:bg-indigo-deep transition-colors duration-300">
      <NebulaCanvas />
      <KnowRoleHeader />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-8">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-2">
            <p
              className="text-lg text-indigo-deep/80 dark:text-nebula-core/80"
              data-testid="text-subtitle"
            >
              Swipe to map your inner nebula—traits, sparks, and growth awaits.
            </p>
          </div>

          <div className="space-y-6">
            {step === "tier" && (
              <AgeTierSelector
                selectedTier={ageTier}
                onSelect={handleTierSelect}
              />
            )}

            {step === "preferences" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <button
                    onClick={() => setStep("tier")}
                    className="text-sm text-violet-echo dark:text-lavender-shift underline underline-offset-2"
                    data-testid="button-back"
                  >
                    Change tier ({ageTier})
                  </button>
                </div>

                <MoodSelector mood={mood} onMoodChange={setMood} />
                
                <FunModeToggle enabled={funMode} onToggle={setFunMode} />

                <StartButton
                  disabled={!canStart}
                  onClick={handleStart}
                />

                {!canStart && (
                  <p className="text-sm text-indigo-deep/60 dark:text-nebula-core/60">
                    Select your mood to continue
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 p-4 text-center">
        <p className="text-xs text-indigo-deep/50 dark:text-nebula-core/50">
          Discover your constellation of traits
        </p>
      </footer>
    </div>
  );
}
