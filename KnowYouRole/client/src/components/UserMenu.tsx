import { LogIn, LogOut, User, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface UserMenuProps {
  compact?: boolean;
}

export default function UserMenu({ compact = false }: UserMenuProps) {
  const { loginWithRedirect, logout: auth0Logout } = useAuth0();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname + window.location.search }
    });
  };

  const handleLogout = () => {
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    auth0Logout({
      logoutParams: { returnTo: window.location.origin }
    });
  };

  const handleProfile = () => {
    setOpen(false);
    window.location.href = "/profile";
  };

  if (isLoading) {
    return (
      <div
        className={`${compact ? "w-8 h-8" : "w-9 h-9 md:w-10 md:h-10"} rounded-full bg-soft-cream/60 dark:bg-[#12121A]/80 animate-pulse`}
        data-testid="user-menu-loading"
      />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={handleLogin}
        className={`${compact ? "h-8 px-3 text-xs gap-1.5" : "h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm gap-1.5"} rounded-lg bg-soft-cream/80 dark:bg-[#12121A]/80 backdrop-blur-sm border border-terracotta/8 dark:border-[#A78BFA]/20 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-terracotta/20 dark:hover:border-[#A78BFA]/40 dark:hover:shadow-[0_0_20px_rgba(167,139,250,0.15)] text-warm-gray/80 dark:text-[#C4B5FD] font-medium`}
        aria-label="Sign in"
        data-testid="button-sign-in"
      >
        <LogIn className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
        Sign In
      </button>
    );
  }

  const getInitials = () => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`${compact ? "h-8 gap-1.5" : "h-9 md:h-10 gap-2"} flex items-center rounded-lg bg-soft-cream/80 dark:bg-[#12121A]/80 backdrop-blur-sm border border-terracotta/8 dark:border-[#A78BFA]/20 px-1.5 transition-all duration-300 hover:scale-105 hover:border-terracotta/20 dark:hover:border-[#A78BFA]/40 dark:hover:shadow-[0_0_20px_rgba(167,139,250,0.15)]`}
          aria-label="User menu"
          data-testid="button-user-menu"
        >
          <Avatar className={`${compact ? "w-6 h-6" : "w-7 h-7"}`}>
            <AvatarImage src={user.profileImageUrl ?? undefined} />
            <AvatarFallback className="text-[10px] bg-gradient-to-br from-terracotta to-dusty-blue text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"} text-warm-gray/50 dark:text-[#A78BFA]/60`} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 bg-warm-white dark:bg-[#12121A] border-terracotta/10 dark:border-[#A78BFA]/20"
        align="end"
        sideOffset={8}
      >
        <div className="px-3 py-3 border-b border-terracotta/8 dark:border-[#A78BFA]/10">
          <p className="text-sm font-semibold text-warm-gray dark:text-[#F8FAFC] truncate" data-testid="text-user-name">
            {user.firstName || user.lastName
              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
              : user.email || "User"}
          </p>
          {user.email && (
            <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8] truncate mt-0.5" data-testid="text-user-email">
              {user.email}
            </p>
          )}
        </div>
        <div className="py-1">
          <button
            onClick={handleProfile}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-warm-gray dark:text-[#F8FAFC] hover-elevate transition-colors"
            data-testid="button-menu-profile"
          >
            <User className="w-4 h-4 text-warm-gray/60 dark:text-[#A78BFA]" />
            My Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-warm-gray dark:text-[#F8FAFC] hover-elevate transition-colors"
            data-testid="button-menu-sign-out"
          >
            <LogOut className="w-4 h-4 text-warm-gray/60 dark:text-[#A78BFA]" />
            Sign Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
