import { useState } from "react";
import FunModeToggle from "../FunModeToggle";

export default function FunModeToggleExample() {
  const [funMode, setFunMode] = useState(false);

  return (
    <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-nebula-core to-white dark:from-indigo-deep dark:to-[#162942] rounded-2xl">
      <FunModeToggle enabled={funMode} onToggle={setFunMode} />
    </div>
  );
}
