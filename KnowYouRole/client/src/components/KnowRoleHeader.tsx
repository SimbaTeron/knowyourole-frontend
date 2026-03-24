import { Settings } from "lucide-react";
import ThemeToggle, { ThemeMode } from "./ThemeToggle";
import UserMenu from "./UserMenu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


interface KnowRoleHeaderProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export default function KnowRoleHeader({ theme, onThemeChange }: KnowRoleHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-lg mx-auto flex justify-between items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-soft-cream/80 dark:bg-[#12121A]/80 backdrop-blur-sm border border-terracotta/8 dark:border-[#A78BFA]/20 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20 dark:hover:border-[#A78BFA]/40 dark:hover:shadow-[0_0_20px_rgba(167,139,250,0.15)]"
              aria-label="Settings"
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5 md:h-6 md:w-6 text-warm-gray/60 dark:text-[#A78BFA]" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 bg-warm-white dark:bg-[#12121A] border-terracotta/10 dark:border-[#A78BFA]/20" align="start">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-warm-gray dark:text-[#F8FAFC]">How it works</h4>
              <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed">
                Answer a few quick questions to discover your personality traits. Your responses map your unique path of growth and self-discovery.
              </p>
              <div className="pt-2 border-t border-terracotta/10 dark:border-[#A78BFA]/20">
                <p className="text-xs text-warm-gray/50 dark:text-[#A78BFA] font-handwritten text-lg">
                  3-5 taps to begin
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center gap-2">
          <h1
            className="text-display compass-gradient-text dark:bg-gradient-to-r dark:from-[#A78BFA] dark:via-[#C4B5FD] dark:to-[#67E8F9] dark:bg-clip-text dark:text-transparent"
            data-testid="text-title"
          >
            KnowYouRole
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle
            currentTheme={theme}
            onThemeChange={onThemeChange}
          />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
