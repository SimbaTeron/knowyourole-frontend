"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { LocalityThemeProvider } from "@/contexts/LocalityThemeContext";
import AuthErrorBoundary from "@/components/AuthErrorBoundary";
import DevToolPanel from "@/components/DevToolPanel";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocalityThemeProvider>
          <AuthErrorBoundary>
            <DevToolPanel />
            {children}
            <Toaster />
          </AuthErrorBoundary>
        </LocalityThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
