import PathCanvas from "../PathCanvas";

export default function PathCanvasExample() {
  return (
    <div className="relative min-h-[300px] bg-soft-cream dark:bg-deep-cream rounded-xl overflow-hidden">
      <PathCanvas />
      <div className="relative z-10 flex items-center justify-center h-full min-h-[300px]">
        <p className="text-warm-gray dark:text-soft-cream text-sm font-medium">Animated life trail paths</p>
      </div>
    </div>
  );
}
