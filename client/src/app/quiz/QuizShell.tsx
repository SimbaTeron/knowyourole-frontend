"use client";

import { Toaster } from "@/components/ui/toaster";
import { LocalityThemeProvider } from "@/contexts/LocalityThemeContext";

/** Quiz needs locality theme and toasts. Auth and the data client stay off this route. */
export default function QuizShell({ children }: { children: React.ReactNode }) {
  return (
    <LocalityThemeProvider>
      {children}
      <Toaster />
    </LocalityThemeProvider>
  );
}
