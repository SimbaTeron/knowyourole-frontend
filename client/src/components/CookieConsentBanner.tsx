"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CONSENT_BAR_HEIGHT_PX,
  CONSENT_BAR_WRAP_MAX_PX,
  CONSENT_BAR_WRAPPED_HEIGHT_PX,
} from "@/components/ConsentBeforePaint";

export const COOKIE_CONSENT_KEY = "kyr_cookie_consent";
export const COOKIE_CONSENT_EVENT = "kyr-cookie-consent-updated";
export const COOKIE_PREFERENCES_EVENT = "kyr-open-cookie-preferences";
export const COOKIE_BAR_LINE = "We use optional analytics cookies.";

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

export type CookieBannerPlacement = "bottom-bar";

/** Quiz is included. Onboarding still hides the banner so it cannot cover that overlay. */
export function shouldShowCookieBanner(input: { showBanner: boolean; onboardingActive: boolean }): boolean {
  return input.showBanner && !input.onboardingActive;
}

/** One fixed bar on every route, including home, quiz, and results. */
export function cookieBannerPlacement(_pathname: string): CookieBannerPlacement {
  return "bottom-bar";
}

/** Accept turns on analytics only. Reject keeps essential storage and sends nothing to analytics. */
export function consentFromChoice(choice: "accept" | "reject", now = new Date().toISOString()): CookieConsentState {
  return {
    necessary: true,
    analytics: choice === "accept",
    marketing: false,
    timestamp: now,
    version: 1,
  };
}

type FocusableMain = {
  tabIndex: number;
  focus: (options?: { preventScroll?: boolean }) => void;
};

/** Move focus to the page's main content without scrolling. */
export function focusMainContent(
  doc: { querySelector: (selector: string) => unknown },
  view: { scrollY: number; scrollTo: (x: number, y: number) => void },
): boolean {
  const y = view.scrollY;
  const main = doc.querySelector("main, [data-kyr-focus-root]") as FocusableMain | null;
  if (!main || typeof main.focus !== "function") return false;
  if (typeof main.tabIndex !== "number" || main.tabIndex < 0) main.tabIndex = -1;
  main.focus({ preventScroll: true });
  if (view.scrollY !== y) view.scrollTo(0, y);
  return true;
}

export function CookieConsentBanner() {
  const pathname = usePathname() ?? "";
  const placement = cookieBannerPlacement(pathname);
  const barRef = useRef<HTMLDivElement>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isQuizOnboardingActive, setIsQuizOnboardingActive] = useState(false);
  const visible = shouldShowCookieBanner({ showBanner, onboardingActive: isQuizOnboardingActive });

  useLayoutEffect(() => {
    if (!readCookieConsent()) setShowBanner(true);
  }, []);

  useEffect(() => {
    const openPreferences = () => setShowBanner(true);
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

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      // The head script reserves the bar before paint. Clearing that here,
      // before React has decided to show the bar, flashes the quiz full-height.
      if (readCookieConsent()) {
        root.style.removeProperty("--kyr-consent-bar");
        root.removeAttribute("data-kyr-consent");
      }
      return;
    }
    const bar = barRef.current;
    if (!bar) return;
    const apply = () => {
      const height = Math.ceil(bar.getBoundingClientRect().height);
      const reserved = Math.ceil(parseFloat(getComputedStyle(root).getPropertyValue("--kyr-consent-bar")) || 0);
      if (reserved !== height) root.style.setProperty("--kyr-consent-bar", `${height}px`);
      if (root.getAttribute("data-kyr-consent") !== "open") root.setAttribute("data-kyr-consent", "open");
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(bar);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [visible]);

  const choose = (choice: "accept" | "reject") => {
    const y = window.scrollY;
    persistConsent(consentFromChoice(choice));
    focusMainContent(document, window);
    setShowBanner(false);
    if (window.scrollY !== y) window.scrollTo(0, y);
  };

  return (
    <>
      <style>{`
        html[data-kyr-consent="open"] {
          scroll-padding-bottom: calc(var(--kyr-consent-bar, 0px) + 12px);
        }
        html[data-kyr-consent="open"] body {
          padding-bottom: var(--kyr-consent-bar, 0px);
        }
        html[data-kyr-consent="open"] .primary-cta,
        html[data-kyr-consent="open"] .shortform-v2-answer-button,
        html[data-kyr-consent="open"] .quiz-welcome-card button {
          scroll-margin-bottom: calc(var(--kyr-consent-bar, 0px) + 12px);
        }
        @media (max-width: 414px) {
          html[data-kyr-consent="open"]:has(.quiz-question-screen) body,
          html[data-kyr-consent="open"]:has(.quiz-welcome-screen) body {
            padding-bottom: 0;
            overflow: hidden;
          }
          html[data-kyr-consent="open"] .quiz-question-screen,
          html[data-kyr-consent="open"] .quiz-welcome-screen {
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            height: calc(100dvh - var(--kyr-consent-bar, 0px)) !important;
            min-height: 0 !important;
            max-height: calc(100dvh - var(--kyr-consent-bar, 0px)) !important;
            overflow: hidden !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen > main {
            flex: 1 1 auto;
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
            max-height: 100% !important;
            overflow: hidden !important;
            padding-bottom: 10px !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-layout {
            flex: 1 1 auto;
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-question-card,
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-question-body {
            min-height: 0 !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-question-card {
            flex: 1 1 auto;
            overflow: hidden;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-answer-grid {
            flex: 0 0 auto;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-answer-button {
            min-height: 0 !important;
          }
        }
        @media (max-width: 414px) and (max-height: 740px) {
          html[data-kyr-consent="open"] .quiz-question-screen > main {
            padding-top: 46px !important;
            padding-bottom: 6px !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-layout {
            gap: 6px !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-question-card {
            padding: 8px !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-question-title {
            font-size: 1.05rem !important;
            line-height: 1.05 !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-answer-grid {
            gap: 6px !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-answer-button {
            padding: 6px 8px !important;
          }
          html[data-kyr-consent="open"] .quiz-question-screen .shortform-v2-answer-button h2 {
            font-size: 0.9rem !important;
            line-height: 1.15 !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-screen {
            padding-top: 12px !important;
            padding-bottom: 8px !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card {
            flex: 1 1 auto;
            min-height: 0;
            overflow: hidden;
          }
        }
        @media (max-width: 414px) and (max-height: 740px) {
          html[data-kyr-consent="open"] .quiz-welcome-card {
            padding: 12px !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card h2 {
            margin-top: 8px !important;
            font-size: 1.35rem !important;
            line-height: 1.05 !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card p,
          html[data-kyr-consent="open"] .quiz-welcome-card li {
            margin-top: 8px !important;
            font-size: 12px !important;
            line-height: 1.35 !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card ul {
            margin-top: 8px !important;
            gap: 6px !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card li {
            padding: 8px !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card button {
            margin-top: 10px !important;
          }
        }
        @media (max-width: ${CONSENT_BAR_WRAP_MAX_PX}px) {
          html[data-kyr-consent="open"] .quiz-welcome-screen {
            justify-content: center !important;
            padding-top: 12px !important;
            padding-bottom: 8px !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card {
            padding: 12px !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card h2 {
            margin-top: 8px !important;
            font-size: 1.35rem !important;
            line-height: 1.05 !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card p,
          html[data-kyr-consent="open"] .quiz-welcome-card li {
            margin-top: 8px !important;
            font-size: 12px !important;
            line-height: 1.35 !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card ul {
            margin-top: 8px !important;
            gap: 6px !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card li {
            padding: 8px !important;
          }
          html[data-kyr-consent="open"] .quiz-welcome-card button {
            margin-top: 10px !important;
          }
        }
        .kyr-cookie-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9000;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          box-sizing: border-box;
          height: calc(${CONSENT_BAR_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px));
          padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid rgba(18, 38, 58, 0.22);
          background: #fffdf8;
          color: #12263a;
          overflow: hidden;
          overflow-anchor: none;
          font: 600 14px/1.35 Manrope, Inter, system-ui, sans-serif;
        }
        @media (max-width: ${CONSENT_BAR_WRAP_MAX_PX}px) {
          .kyr-cookie-bar { height: calc(${CONSENT_BAR_WRAPPED_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px)); }
        }
        .kyr-cookie-line { margin: 0; flex: 1 1 180px; }
        .kyr-cookie-line a { color: #1f5e78; font-weight: 750; }
        .kyr-cookie-actions { display: flex; flex: 1 1 180px; gap: 8px; }
        .kyr-cookie-choice {
          flex: 1 1 0;
          min-width: 0;
          min-height: 44px;
          border: 1px solid #12263a;
          border-radius: 4px;
          background: #fffdf8;
          color: #12263a;
          cursor: pointer;
          font: 800 14px/1 Manrope, Inter, system-ui, sans-serif;
        }
        .kyr-cookie-choice:focus-visible,
        .kyr-cookie-line a:focus-visible {
          outline: 3px solid #12263a;
          outline-offset: 2px;
        }
      `}</style>
      {visible && placement === "bottom-bar" && (
        <div ref={barRef} className="kyr-cookie-bar" role="region" aria-label="Cookie consent">
          <p className="kyr-cookie-line">
            {COOKIE_BAR_LINE}{" "}
            <Link href="/privacy">Privacy</Link>
          </p>
          <div className="kyr-cookie-actions">
            <button type="button" className="kyr-cookie-choice" onClick={() => choose("reject")}>
              Reject
            </button>
            <button type="button" className="kyr-cookie-choice" onClick={() => choose("accept")}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function useCookieConsent() {
  return { getConsent: readCookieConsent, hasAnalyticsConsent, hasMarketingConsent };
}
