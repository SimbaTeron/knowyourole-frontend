import StartButton from "../StartButton";

export default function StartButtonExample() {
  return (
    <div className="max-w-md mx-auto p-8 space-y-6 bg-gradient-to-br from-nebula-core to-white dark:from-indigo-deep dark:to-[#162942] rounded-2xl">
      <StartButton onClick={() => console.log("Start clicked!")} />
      <StartButton disabled onClick={() => {}} />
    </div>
  );
}
