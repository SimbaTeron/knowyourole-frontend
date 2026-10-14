"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const REVIEW_THEMES = [
  { id: "workday", label: "Workday", short: "WD", description: "sunlit editorial" },
  { id: "evidence", label: "Evidence", short: "ER", description: "inspectable dossier" },
  { id: "studio", label: "Studio", short: "SC", description: "creative critique" },
  { id: "simulator", label: "Simulator", short: "DS", description: "decision system" },
  { id: "dispatch", label: "Dispatch", short: "PD", description: "personal brief" },
] as const;

export type ReviewThemeId = (typeof REVIEW_THEMES)[number]["id"];

function isReviewTheme(value: string | null): value is ReviewThemeId {
  return REVIEW_THEMES.some((theme) => theme.id === value);
}

/**
 * Review-only visual layer. It changes no scoring, navigation, quiz state, or result DTO.
 * Activate explicitly with ?design=workday|evidence|studio|simulator|dispatch.
 */
export function ThemeReviewController() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedTheme = searchParams.get("design");
  const activeTheme = isReviewTheme(requestedTheme) ? requestedTheme : null;

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (activeTheme) {
      root.dataset.kyrReviewTheme = activeTheme;
    } else {
      delete root.dataset.kyrReviewTheme;
    }
  }, [activeTheme]);

  if (!activeTheme) return null;

  const themeHref = (theme: ReviewThemeId) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("design", theme);
    return `${pathname}?${next.toString()}`;
  };

  const exitHref = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("design");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <aside className={`kyr-design-review kyr-design-review--${activeTheme}`} aria-label="Design review theme switcher">
      <div className="kyr-design-review__identity">
        <span>KYR visual review</span>
        <strong>{REVIEW_THEMES.find((theme) => theme.id === activeTheme)?.description}</strong>
      </div>
      <div className="kyr-design-review__themes" role="group" aria-label="Choose a visual direction">
        {REVIEW_THEMES.map((theme) => (
          <a
            aria-current={activeTheme === theme.id ? "page" : undefined}
            aria-label={`Switch to ${theme.label} visual direction`}
            className={activeTheme === theme.id ? "is-active" : undefined}
            href={themeHref(theme.id)}
            key={theme.id}
            title={theme.label}
          >
            <span>{theme.short}</span>
            {theme.label}
          </a>
        ))}
      </div>
      <a className="kyr-design-review__exit" href={exitHref()}>
        Exit review
      </a>
    </aside>
  );
}
