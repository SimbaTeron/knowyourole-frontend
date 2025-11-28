import NebulaCanvas from "../NebulaCanvas";

export default function NebulaCanvasExample() {
  return (
    <div className="relative min-h-[300px] bg-indigo-deep rounded-lg overflow-hidden">
      <NebulaCanvas />
      <div className="relative z-10 flex items-center justify-center h-full min-h-[300px]">
        <p className="text-nebula-core text-lg">Hover to see particle ripples</p>
      </div>
    </div>
  );
}
