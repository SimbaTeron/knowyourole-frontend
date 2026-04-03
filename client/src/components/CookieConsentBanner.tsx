import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

const COOKIE_CONSENT_KEY = "kyr_cookie_consent";

interface CookieConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: CookieConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    setConsent(fullConsent);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const minimalConsent: CookieConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    setConsent(minimalConsent);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(minimalConsent));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const prefConsent: CookieConsentState = {
      necessary: true,
      analytics: consent.analytics,
      marketing: consent.marketing,
      timestamp: new Date().toISOString(),
    };
    setConsent(prefConsent);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefConsent));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key: keyof Pick<CookieConsentState, "analytics" | "marketing">) => {
    setConsent((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getConsentSummary = () => {
    if (consent.analytics && consent.marketing) return "all";
    if (!consent.analytics && !consent.marketing) return "necessary";
    return "some";
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-[#A78BFA]/30 rounded-2xl shadow-2xl p-6 pointer-events-auto">
            {!showPreferences ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 dark:bg-[#A78BFA]/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-warm-gray dark:text-[#F8FAFC] mb-1">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed">
                      We use cookies to improve your experience. By continuing, you agree to our{" "}
                      <Link href="/privacy" className="text-terracotta dark:text-[#A78BFA] underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreferences(true)}
                    className="text-xs"
                  >
                    Manage Preferences
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="text-xs"
                  >
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="text-xs bg-terracotta hover:bg-terracotta/90 dark:bg-[#A78BFA] dark:hover:bg-[#A78BFA]/90"
                  >
                    Accept All
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-warm-gray dark:text-[#F8FAFC] mb-4">
                  Cookie Preferences
                </h3>

                <div className="space-y-3 mb-4">
                  {/* Necessary - always on, can't toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-sm text-warm-gray dark:text-[#F8FAFC]">Necessary</p>
                      <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8]">
                        Required for the quiz to function. Cannot be disabled.
                      </p>
                    </div>
                    <div className="w-10 h-6 rounded-full bg-terracotta dark:bg-[#A78BFA] flex items-center justify-end p-1">
                      <div className="w-4 h-4 rounded-full bg-white" />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-sm text-warm-gray dark:text-[#F8FAFC]">Analytics</p>
                      <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8]">
                        Help us understand how visitors use our site.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange("analytics")}
                      className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${
                        consent.analytics
                          ? "bg-terracotta dark:bg-[#A78BFA] justify-end"
                          : "bg-gray-300 dark:bg-gray-600 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow" />
                    </button>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-sm text-warm-gray dark:text-[#F8FAFC]">Marketing</p>
                      <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8]">
                        Used to deliver relevant ads (we don't run ads now, but may in the future).
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange("marketing")}
                      className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${
                        consent.marketing
                          ? "bg-terracotta dark:bg-[#A78BFA] justify-end"
                          : "bg-gray-300 dark:bg-gray-600 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreferences(false)}
                    className="text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePreferences}
                    className="text-xs bg-terracotta hover:bg-terracotta/90 dark:bg-[#A78BFA] dark:hover:bg-[#A78BFA]/90"
                  >
                    Save Preferences
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
  const getConsent = (): CookieConsentState | null => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as CookieConsentState;
    } catch {
      return null;
    }
  };

  const hasAnalyticsConsent = () => {
    const consent = getConsent();
    return consent?.analytics ?? false;
  };

  const hasMarketingConsent = () => {
    const consent = getConsent();
    return consent?.marketing ?? false;
  };

  return { getConsent, hasAnalyticsConsent, hasMarketingConsent };
}
