import StartButton from "../StartButton";

export default function StartButtonExample() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-4 bg-nebula-core dark:bg-indigo-deep rounded-lg">
      <StartButton onClick={() => console.log("Start clicked!")} />
      <StartButton disabled onClick={() => {}} />
    </div>
  );
}
