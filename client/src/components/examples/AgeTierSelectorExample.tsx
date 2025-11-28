import { useState } from "react";
import AgeTierSelector from "../AgeTierSelector";

export default function AgeTierSelectorExample() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-sm mx-auto p-6 bg-soft-cream dark:bg-deep-cream rounded-xl">
      <AgeTierSelector selectedTier={selected} onSelect={setSelected} />
    </div>
  );
}
