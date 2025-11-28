import StepIndicator from "../StepIndicator";

export default function StepIndicatorExample() {
  return (
    <div className="p-8 bg-soft-cream dark:bg-deep-cream rounded-xl space-y-8">
      <StepIndicator currentStep={1} totalSteps={4} />
      <StepIndicator currentStep={2} totalSteps={4} />
      <StepIndicator currentStep={3} totalSteps={4} />
      <StepIndicator currentStep={4} totalSteps={4} />
    </div>
  );
}
