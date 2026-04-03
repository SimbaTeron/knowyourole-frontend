import StartButton from "../StartButton";

export default function StartButtonExample() {
  return (
    <div className="max-w-sm mx-auto p-6 space-y-4 bg-soft-cream dark:bg-deep-cream rounded-xl">
      <StartButton onClick={() => console.log("Start clicked!")} />
      <StartButton disabled onClick={() => {}} />
    </div>
  );
}
