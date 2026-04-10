interface CompactHeaderProps {
  step?: string;
  totalSteps?: number;
  title?: string;
  onBack?: () => void;
  onMenu?: () => void;
}

export function CompactHeader({ step, title, onBack, onMenu }: CompactHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="flex-between">
        {/* Left: Back */}
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Center: Step */}
        <div className="flex flex-col items-center">
          {step && (
            <span className="text-xs font-medium text-glow-blue font-display">{step}</span>
          )}
          {title && (
            <span className="text-sm font-medium text-white">{title}</span>
          )}
        </div>

        {/* Right: Menu */}
        <button
          onClick={onMenu}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
