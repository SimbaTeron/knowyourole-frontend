"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/components/CookieConsentBanner";
import { analyticsCollectionAllowed, buildMeasurementConfig, type AnalyticsRuntime } from "@/lib/analytics/collectionGate";
import { analyticsHitLocation, BARE_CAMPAIGN_QUERY_KEYS } from "@/lib/analytics/internalLink";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-QGQ9STMV74";

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
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled || !GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
    const runtime = runtimeAnalyticsInput();
    if (!analyticsCollectionAllowed(runtime)) return;

    const hit = analyticsHitLocation(window.location.href);
    const decision = buildMeasurementConfig({ ...runtime, ...hit, page_title: document.title });
    if (!decision.load) return;

    window.gtag("config", GA_MEASUREMENT_ID, decision.config);
  }, [enabled, pathname, searchParams]);

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

  const bareCampaignKeys = JSON.stringify(BARE_CAMPAIGN_QUERY_KEYS);

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
          var pageUrl = new URL(window.location.href);
          ${bareCampaignKeys}.forEach(function (key) {
            Array.from(pageUrl.searchParams.keys()).forEach(function (present) {
              if (present.toLowerCase() === key) pageUrl.searchParams.delete(present);
            });
          });
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: pageUrl.pathname + pageUrl.search,
            page_location: pageUrl.origin + pageUrl.pathname + pageUrl.search + pageUrl.hash,
            page_title: document.title,
            anonymize_ip: true
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView enabled={enabled} />
      </Suspense>
    </>
  );
}
