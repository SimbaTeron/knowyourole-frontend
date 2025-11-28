import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`step-pill ${
              step === currentStep
                ? "active"
                : step < currentStep
                ? "completed"
                : ""
            }`}
          >
            {step < currentStep ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div
              className={`w-8 h-0.5 mx-1 rounded-full transition-colors duration-500 ${
                step < currentStep ? "bg-sage-green/40" : "bg-terracotta/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
