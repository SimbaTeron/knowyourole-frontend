import { useState } from "react";
import MoodSelector from "../MoodSelector";

export default function MoodSelectorExample() {
  const [mood, setMood] = useState("");

  return (
    <div className="max-w-sm mx-auto p-6 bg-soft-cream dark:bg-deep-cream rounded-xl">
      <MoodSelector mood={mood} onMoodChange={setMood} />
    </div>
  );
}
