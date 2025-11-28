import { useState } from "react";
import FunModeToggle from "../FunModeToggle";

export default function FunModeToggleExample() {
  const [funMode, setFunMode] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 bg-nebula-core dark:bg-indigo-deep rounded-lg">
      <FunModeToggle enabled={funMode} onToggle={setFunMode} />
    </div>
  );
}
