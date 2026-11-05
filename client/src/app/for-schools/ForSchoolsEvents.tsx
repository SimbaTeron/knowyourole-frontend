"use client";

import { useEffect } from "react";
import { forSchoolsClickEvent, trackKyrEvent } from "@/lib/analytics";

/** Listens for quiz and contact clicks on this page. Sends no names, emails, or answers. */
export function ForSchoolsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const target = forSchoolsClickEvent(href, window.location.origin);
      if (!target) return;
      trackKyrEvent(target.event, { cta: target.cta, page: "for_schools" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
