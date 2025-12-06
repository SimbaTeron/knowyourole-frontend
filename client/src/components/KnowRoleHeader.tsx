import { Settings } from "lucide-react";
import ThemeToggle, { ThemeMode } from "./ThemeToggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import appIcon from "@assets/image (5)_1764388202854.jpg";

interface KnowRoleHeaderProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export default function KnowRoleHeader({ theme, onThemeChange }: KnowRoleHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-12 h-12 rounded-xl bg-soft-cream/80 dark:bg-deep-cream/60 backdrop-blur-sm border border-terracotta/8 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20"
              aria-label="Settings"
              data-testid="button-settings"
            >
              <Settings className="h-8 w-8 text-warm-gray/60 dark:text-soft-cream/60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 bg-warm-white dark:bg-deep-cream border-terracotta/10" align="start">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-warm-gray dark:text-soft-cream">How it works</h4>
              <p className="text-xs text-warm-gray/70 dark:text-soft-cream/60 leading-relaxed">
                Answer a few quick questions to discover your personality traits. Your responses map your unique path of growth and self-discovery.
              </p>
              <div className="pt-2 border-t border-terracotta/10">
                <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40 font-handwritten text-lg">
                  3-5 taps to begin
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center gap-3">
          <img 
            src={appIcon} 
            alt="KnowRole compass icon" 
            className="w-14 h-14 rounded-xl shadow-md object-cover"
            data-testid="img-app-icon-left"
          />
          <h1
            className="text-display compass-gradient-text"
            data-testid="text-title"
          >
            KnowRole
          </h1>
          <img 
            src={appIcon} 
            alt="KnowRole compass icon" 
            className="w-14 h-14 rounded-xl shadow-md object-cover"
            data-testid="img-app-icon-right"
          />
        </div>

        <ThemeToggle
          currentTheme={theme}
          onThemeChange={onThemeChange}
        />
      </div>
    </header>
  );
}
