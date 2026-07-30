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
    ? "mx-auto max-w-md rounded-2xl border border-[#12263a]/20 bg-[#fffdf8]/95 p-3 text-[#12263a] shadow-2xl backdrop-blur-xl pointer-events-auto max-h-[42dvh] overflow-y-auto sm:max-h-[min(72dvh,420px)] sm:p-5"
    : "mx-auto max-w-2xl rounded-2xl border border-[#12263a]/20 bg-[#fffdf8]/95 p-5 text-[#12263a] shadow-2xl backdrop-blur-xl pointer-events-auto";

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
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dcedf0] text-[#315f74] sm:h-10 sm:w-10">
                    <ShieldCheck className="h-5 w-5" />
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
                          className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b64d35] ${consent[key] ? "justify-end bg-[#315f74]" : "justify-start bg-[#9eb3bd]"}`}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useCookieConsent() {
  return { getConsent: readCookieConsent, hasAnalyticsConsent, hasMarketingConsent };
}
