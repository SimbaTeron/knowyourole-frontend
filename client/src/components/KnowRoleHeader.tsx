import DarkModeToggle from "./DarkModeToggle";

export default function KnowRoleHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
      <div className="w-10" />
      <h1
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-spark-gold via-coral-drift to-violet-echo bg-clip-text text-transparent"
        data-testid="text-title"
      >
        KnowRole
      </h1>
      <DarkModeToggle />
    </header>
  );
}
