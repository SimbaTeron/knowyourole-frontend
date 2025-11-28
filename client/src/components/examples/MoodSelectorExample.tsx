import { useState } from "react";
import MoodSelector from "../MoodSelector";

export default function MoodSelectorExample() {
  const [mood, setMood] = useState("");

  return (
    <div className="max-w-md mx-auto p-6 bg-nebula-core dark:bg-indigo-deep rounded-lg">
      <MoodSelector mood={mood} onMoodChange={setMood} />
      {mood && (
        <p className="mt-4 text-center text-indigo-deep dark:text-nebula-core opacity-70">
          Current mood: {mood}
        </p>
      )}
    </div>
  );
}
