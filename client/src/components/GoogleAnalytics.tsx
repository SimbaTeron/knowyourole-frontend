"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/components/CookieConsentBanner";
import { analyticsCollectionAllowed, buildMeasurementConfig, type AnalyticsRuntime } from "@/lib/analytics/collectionGate";
import { analyticsHitLocation } from "@/lib/analytics/internalLink";
import { KYR_GTAG_READY_EVENT } from "@/lib/analytics/gtagReady";
import { claimNavigationPageView, installTagConfig } from "@/lib/analytics/pageView";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-QGQ9STMV74";
const INSTALL_CONFIG_JSON = JSON.stringify(installTagConfig());

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function runtimeAnalyticsInput(): AnalyticsRuntime {
  return {
    hostname: window.location.hostname,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || "",
  };
}

function GoogleAnalyticsPageView({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const send = () => {
      if (!enabled || !GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
      const runtime = runtimeAnalyticsInput();
      if (!analyticsCollectionAllowed(runtime)) return;

      const hit = analyticsHitLocation(window.location.href);
      const decision = buildMeasurementConfig({ ...runtime, ...hit, page_title: document.title });
      if (!decision.load || !decision.config.page_location) return;
      if (!claimNavigationPageView(decision.config.page_location)) return;

      window.gtag("config", GA_MEASUREMENT_ID, decision.config);
    };

    window.__kyrSendPageView = send;
    send();
    window.addEventListener(KYR_GTAG_READY_EVENT, send);
    return () => {
      window.removeEventListener(KYR_GTAG_READY_EVENT, send);
      if (window.__kyrSendPageView === send) delete window.__kyrSendPageView;
    };
  }, [enabled, pathname]);

  return null;
}

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(analyticsCollectionAllowed(runtimeAnalyticsInput()));
    const syncConsent = () => setEnabled(hasAnalyticsConsent());
    syncConsent();
    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  if (!GA_MEASUREMENT_ID || !enabled || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', ${INSTALL_CONFIG_JSON});
          window.dispatchEvent(new Event('${KYR_GTAG_READY_EVENT}'));
        `}
      </Script>
      <GoogleAnalyticsPageView enabled={enabled} />
    </>
  );
}
