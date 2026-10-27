"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export const COOKIE_CONSENT_KEY = "kyr_cookie_consent";
export const COOKIE_CONSENT_EVENT = "kyr-cookie-consent-updated";
export const COOKIE_PREFERENCES_EVENT = "kyr-open-cookie-preferences";

export type CookieConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: 1;
};

const defaultConsent: CookieConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: "",
  version: 1,
};

export function readCookieConsent(): CookieConsentState | null {
  if (typeof globalThis.window === "undefined") return null;
  try {
    const stored = globalThis.window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<CookieConsentState>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : "",
      version: 1,
    };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return readCookieConsent()?.analytics ?? false;
}

export function hasMarketingConsent() {
  return readCookieConsent()?.marketing ?? false;
}

function persistConsent(nextConsent: CookieConsentState) {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(nextConsent));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: nextConsent }));
}

export type CookieBannerPlacement = "quiz-flow" | "results-sheet" | "bottom-dock";

/** Quiz is included. Onboarding still hides the banner so it cannot cover that overlay. */
export function shouldShowCookieBanner(input: { showBanner: boolean; onboardingActive: boolean }): boolean {
  return input.showBanner && !input.onboardingActive;
}

export function cookieBannerPlacement(pathname: string): CookieBannerPlacement {
  if (pathname.startsWith("/results")) return "results-sheet";
  if (pathname === "/quiz" || pathname.startsWith("/quiz/")) return "quiz-flow";
  return "bottom-dock";
}

function buildConsent(values: Pick<CookieConsentState, "analytics" | "marketing">): CookieConsentState {
  return {
    necessary: true,
    analytics: values.analytics,
    marketing: values.marketing,
    timestamp: new Date().toISOString(),
    version: 1,
  };
}

export function CookieConsentBanner() {
  const pathname = usePathname() ?? "";
  const placement = cookieBannerPlacement(pathname);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState>(defaultConsent);
  const [isQuizOnboardingActive, setIsQuizOnboardingActive] = useState(false);

  useEffect(() => {
    const stored = readCookieConsent();
    if (stored) {
      setConsent(stored);
    } else {
      const timer = window.setTimeout(() => setShowBanner(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const openPreferences = () => {
      setConsent(readCookieConsent() ?? defaultConsent);
      setShowPreferences(true);
      setShowBanner(true);
    };

    const handleHashChange = () => {
      if (window.location.hash === "#cookie-preferences") openPreferences();
    };

    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const updateOnboardingState = () => {
      setIsQuizOnboardingActive(Boolean(document.querySelector("[data-testid='quiz-onboarding-overlay']")));
    };

    updateOnboardingState();
    const observer = new MutationObserver(updateOnboardingState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const summary = useMemo(() => {
    if (consent.analytics && consent.marketing) return "All optional cookies enabled";
    if (!consent.analytics && !consent.marketing) return "Only essential cookies enabled";
    return "Some optional cookies enabled";
  }, [consent.analytics, consent.marketing]);

  const save = (nextConsent: CookieConsentState) => {
    setConsent(nextConsent);
    persistConsent(nextConsent);
    setShowBanner(false);
    setShowPreferences(false);
  };

  // Results are decision content. A translucent, fixed bottom sheet obscured the
  // direction card on small screens; consent must clearly own the interaction or
  // stay out of the way—not create an unreadable layer collision.
  const shellClassName = placement === "results-sheet"
    ? "fixed inset-0 z-[9000] flex items-end justify-center bg-[#12263a]/65 px-3 pb-[calc(10px+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-sm pointer-events-none sm:p-4"
    : placement === "quiz-flow"
      ? "kyr-cookie-quiz-flow relative w-full px-3 py-4"
      : "fixed bottom-0 left-0 right-0 z-[9000] p-4 pointer-events-none";

  const panelClassName = placement === "results-sheet"
    ? "mx-auto w-full max-w-md rounded-2xl border border-[#12263a]/20 bg-[#fffdf8] p-3 text-[#12263a] shadow-2xl pointer-events-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto sm:max-h-[min(72dvh,420px)] sm:p-5"
    : "mx-auto max-w-2xl rounded-2xl border border-[#12263a]/20 bg-[#fffdf8]/95 p-5 text-[#12263a] shadow-2xl backdrop-blur-xl pointer-events-auto";

  const primaryActionsClassName = placement === "results-sheet"
    ? "grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end"
    : "flex flex-wrap justify-end gap-2";

  const buttonClassName = "min-h-11 text-xs";

  return (
    <>
      <style>{`
        @keyframes kyr-cookie-enter {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        .kyr-cookie-enter { animation: kyr-cookie-enter 0.25s ease-out; }
        .kyr-cookie-quiz-flow { overflow-anchor: none; }
        @media (prefers-reduced-motion: reduce) {
          .kyr-cookie-enter { animation: none; }
        }
      `}</style>
      {shouldShowCookieBanner({ showBanner, onboardingActive: isQuizOnboardingActive }) && (
        <div
          className={`${shellClassName} kyr-cookie-enter`}
          role="region"
          aria-label="Cookie consent"
        >
          <div className={panelClassName}>
            {!showPreferences ? (
              <>
                <div className="mb-3 flex items-start gap-3 sm:mb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dcedf0] text-[#315f74] sm:h-10 sm:w-10">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="mb-1 text-base font-semibold">Cookie choices</h2>
                    <p className="text-xs leading-relaxed text-[#405f72] sm:text-sm">
                      KnowYouRole uses essential browser storage for quiz progress and consent choices. Google Analytics loads only if you allow analytics. No advertising technology is active today.
                    </p>
                    <Link href="/privacy" className="mt-2 inline-block text-xs text-[#315f74] underline underline-offset-4 sm:text-sm">
                      Read the Privacy Policy
                    </Link>
                  </div>
                </div>
                <div className={primaryActionsClassName}>
                  <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)} className={buttonClassName}>
                    Manage preferences
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => save(buildConsent({ analytics: false, marketing: false }))} className={buttonClassName}>
                    Reject non-essential
                  </Button>
                  <Button size="sm" onClick={() => save(buildConsent({ analytics: true, marketing: true }))} className={`bg-[#ffca42] text-[#12263a] hover:bg-[#f3b91d] ${buttonClassName}`}>
                    Accept all
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-base font-semibold">Manage cookie preferences</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#405f72]">{summary}</p>
                </div>

                <div className="mb-4 space-y-3">
                  <div className="rounded-xl border border-[#12263a]/15 bg-[#fffaf0] p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#12263a]">Essential</p>
                        <p className="text-xs leading-relaxed text-[#405f72]">Required for quiz state, consent storage, and basic site functionality.</p>
                      </div>
                      <span className="rounded-full bg-[#dcedf0] px-3 py-1 text-xs font-semibold text-[#315f74]">Always on</span>
                    </div>
                  </div>

                  {([
                    ["analytics", "Analytics", "Loads Google Analytics to measure page views, quiz flow, and site performance. Quiz answers and email addresses are not intentionally sent to Google Analytics."],
                    ["marketing", "Advertising", "No advertising technology is active today. This preference is saved so you can keep advertising disabled if that changes later."],
                  ] as const).map(([key, label, description]) => (
                    <div key={key} className="rounded-xl border border-[#12263a]/15 bg-[#fffaf0] p-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#12263a]">{label}</p>
                          <p className="text-xs leading-relaxed text-[#405f72]">{description}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`${consent[key] ? "Disable" : "Enable"} ${label}`}
                          aria-pressed={consent[key]}
                          onClick={() => setConsent((prev) => ({ ...prev, [key]: !prev[key] }))}
                          className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3402b] ${consent[key] ? "justify-end bg-[#315f74]" : "justify-start bg-[#9eb3bd]"}`}
                        >
                          <span className="h-5 w-5 rounded-full bg-white shadow" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={primaryActionsClassName}>
                  <Button variant="outline" size="sm" onClick={() => setShowPreferences(false)} className={buttonClassName}>
                    Back
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => save(buildConsent({ analytics: false, marketing: false }))} className={buttonClassName}>
                    Reject non-essential
                  </Button>
                  <Button size="sm" onClick={() => save(buildConsent({ analytics: consent.analytics, marketing: consent.marketing }))} className={`bg-[#ffca42] text-[#12263a] hover:bg-[#f3b91d] ${buttonClassName}`}>
                    Save choices
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function useCookieConsent() {
  return { getConsent: readCookieConsent, hasAnalyticsConsent, hasMarketingConsent };
}
