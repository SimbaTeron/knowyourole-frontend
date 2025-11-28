import { useState } from "react";
import AgeTierSelector from "../AgeTierSelector";

export default function AgeTierSelectorExample() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto p-6 bg-nebula-core dark:bg-indigo-deep rounded-lg">
      <AgeTierSelector selectedTier={selected} onSelect={setSelected} />
      {selected && (
        <p className="mt-4 text-center text-indigo-deep dark:text-nebula-core opacity-70">
          Selected: {selected}
        </p>
      )}
    </div>
  );
}
