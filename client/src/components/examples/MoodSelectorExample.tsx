import { useState } from "react";
import MoodSelector from "../MoodSelector";

export default function MoodSelectorExample() {
  const [mood, setMood] = useState("");

  return (
    <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-nebula-core to-white dark:from-indigo-deep dark:to-[#162942] rounded-2xl">
      <MoodSelector mood={mood} onMoodChange={setMood} />
    </div>
  );
}
