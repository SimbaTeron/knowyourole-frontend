"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
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
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
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
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState>(defaultConsent);
  const [isResultsRoute, setIsResultsRoute] = useState(false);
  const [isQuizRoute, setIsQuizRoute] = useState(false);
  const [isQuizOnboardingActive, setIsQuizOnboardingActive] = useState(false);

  useEffect(() => {
    setIsResultsRoute(window.location.pathname.startsWith("/results"));
    setIsQuizRoute(window.location.pathname.startsWith("/quiz"));

    const openPreferences = () => {
      setConsent(readCookieConsent() ?? defaultConsent);
      setShowPreferences(true);
      setShowBanner(true);
    };

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

  const shellClassName = isResultsRoute
    ? "fixed bottom-0 left-0 right-0 z-[9000] px-3 pb-[calc(10px+env(safe-area-inset-bottom,0px))] pt-2 pointer-events-none sm:p-4"
    : "fixed bottom-0 left-0 right-0 z-[9000] p-4 pointer-events-none";

  const panelClassName = isResultsRoute
    ? "mx-auto max-w-md rounded-2xl border border-white/15 bg-[#111122]/95 p-3 text-white shadow-2xl backdrop-blur-xl pointer-events-auto max-h-[42dvh] overflow-y-auto sm:max-h-[min(72dvh,420px)] sm:p-5"
    : "mx-auto max-w-2xl rounded-2xl border border-white/15 bg-[#111122]/95 p-5 text-white shadow-2xl backdrop-blur-xl pointer-events-auto";

  const primaryActionsClassName = isResultsRoute
    ? "grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end"
    : "flex flex-wrap justify-end gap-2";

  const buttonClassName = "min-h-11 text-xs";

  return (
    <AnimatePresence>
      {showBanner && !isQuizRoute && !isQuizOnboardingActive && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={shellClassName}
          role="region"
          aria-label="Cookie consent"
        >
          <div className={panelClassName}>
            {!showPreferences ? (
              <>
                <div className="mb-3 flex items-start gap-3 sm:mb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00C8FF]/15 text-[#00C8FF] sm:h-10 sm:w-10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="mb-1 text-base font-semibold">Cookie choices</h2>
                    <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
                      KnowYouRole uses essential storage for the quiz and optional cookies for analytics or future advertising only if you allow them. You can change this later from the Privacy page.
                    </p>
                    <Link href="/privacy" className="mt-2 inline-block text-xs text-[#00C8FF] underline underline-offset-4 sm:text-sm">
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
                  <Button size="sm" onClick={() => save(buildConsent({ analytics: true, marketing: true }))} className={`bg-[#00C8FF] text-black hover:bg-[#00C8FF]/90 ${buttonClassName}`}>
                    Accept all
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-base font-semibold">Manage cookie preferences</h2>
                  <p className="mt-1 text-xs text-white/55">{summary}</p>
                </div>

                <div className="mb-4 space-y-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">Essential</p>
                        <p className="text-xs text-white/60">Required for quiz state, consent storage, and basic site functionality.</p>
                      </div>
                      <span className="rounded-full bg-[#00C8FF]/20 px-3 py-1 text-xs font-semibold text-[#00C8FF]">Always on</span>
                    </div>
                  </div>

                  {([
                    ["analytics", "Analytics", "Helps us understand pages visited, quiz start/completion flow, and site performance."],
                    ["marketing", "Advertising", "Reserved for future ad partners such as Google AdSense, including personalized or non-personalized ads."],
                  ] as const).map(([key, label, description]) => (
                    <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-xs text-white/60">{description}</p>
                        </div>
                        <button
                          type="button"
                          aria-pressed={consent[key]}
                          onClick={() => setConsent((prev) => ({ ...prev, [key]: !prev[key] }))}
                          className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${consent[key] ? "justify-end bg-[#00C8FF]" : "justify-start bg-white/20"}`}
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
                  <Button size="sm" onClick={() => save(buildConsent({ analytics: consent.analytics, marketing: consent.marketing }))} className={`bg-[#00C8FF] text-black hover:bg-[#00C8FF]/90 ${buttonClassName}`}>
                    Save choices
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useCookieConsent() {
  return { getConsent: readCookieConsent, hasAnalyticsConsent, hasMarketingConsent };
}
