import { useState } from "react";
import AgeTierSelector from "../AgeTierSelector";

export default function AgeTierSelectorExample() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-nebula-core to-white dark:from-indigo-deep dark:to-[#162942] rounded-2xl">
      <AgeTierSelector selectedTier={selected} onSelect={setSelected} />
    </div>
  );
}
