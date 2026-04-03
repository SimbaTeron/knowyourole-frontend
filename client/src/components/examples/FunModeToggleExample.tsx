import { useState } from "react";
import FunModeToggle from "../FunModeToggle";

export default function FunModeToggleExample() {
  const [funMode, setFunMode] = useState(false);

  return (
    <div className="max-w-sm mx-auto p-6 bg-soft-cream dark:bg-deep-cream rounded-xl">
      <FunModeToggle enabled={funMode} onToggle={setFunMode} />
    </div>
  );
}
