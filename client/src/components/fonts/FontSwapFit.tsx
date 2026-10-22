"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __kyrStabilizeFonts?: () => void;
  }
}

/** Re-fit after a client navigation. The first load is handled by /font-swap-fit.js. */
export function FontSwapFit() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const run = () => window.__kyrStabilizeFonts?.();
    if (document.fonts.status === "loaded") run();
    else void document.fonts.ready.then(run);
  }, [pathname]);
  return null;
}
