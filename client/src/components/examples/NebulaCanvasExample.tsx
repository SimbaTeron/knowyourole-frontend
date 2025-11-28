import NebulaCanvas from "../NebulaCanvas";

export default function NebulaCanvasExample() {
  return (
    <div className="relative min-h-[400px] bg-gradient-to-br from-nebula-core to-white dark:from-indigo-deep dark:to-[#162942] rounded-2xl overflow-hidden">
      <NebulaCanvas />
      <div className="relative z-10 flex items-center justify-center h-full min-h-[400px]">
        <p className="text-indigo-deep dark:text-nebula-core text-lg font-medium">Interactive particle nebula</p>
      </div>
    </div>
  );
}
