import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  "Age tier selection",
  "Mood path forked",
  "Location discovery",
  "Ready to begin"
];

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div 
      className="flex items-center justify-center gap-3 mb-8"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}: ${stepLabels[currentStep - 1] || ""}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            initial={false}
            animate={{
              scale: step === currentStep ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`step-pill ${
              step === currentStep
                ? "active"
                : step < currentStep
                ? "completed"
                : ""
            }`}
            aria-current={step === currentStep ? "step" : undefined}
          >
            {step < currentStep ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              step
            )}
          </motion.div>
          {step < totalSteps && (
            <motion.div
              initial={false}
              animate={{
                backgroundColor: step < currentStep 
                  ? "rgba(139,154,109,0.4)" 
                  : "rgba(198,123,92,0.1)"
              }}
              className="w-8 h-0.5 mx-1 rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}
