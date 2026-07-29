"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { LocalityThemeProvider } from "@/contexts/LocalityThemeContext";
import AuthErrorBoundary from "@/components/AuthErrorBoundary";
import DevToolPanel from "@/components/DevToolPanel";
import { AuthProvider } from "@/components/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const showDevTools = process.env.NODE_ENV === "development";

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LocalityThemeProvider>
            <AuthErrorBoundary>
              {showDevTools ? <DevToolPanel /> : null}
              {children}
              <Toaster />
            </AuthErrorBoundary>
          </LocalityThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
