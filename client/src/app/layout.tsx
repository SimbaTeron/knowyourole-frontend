import type { Metadata } from "next";
import "@/styles/fonts";
import "../index.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { BaseJsonLd } from "@/components/seo/BaseJsonLd";
import { QUIZ_CONSENT_RESERVE_CSS, quizConsentReserveScript } from "@/lib/analytics/consentReserve";
import { publicPageMetadata } from "@/lib/seo";

// Home robots live on page.tsx. Leaving them here also stamps index,follow onto the 404,
// which Next already marks noindex, so the missing page shipped two robots tags.
const { robots: _homeRobots, ...rootMetadata } = publicPageMetadata("/");
void _homeRobots;
export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="kyr-workday" suppressHydrationWarning>
      <body className="kyr-page">
        <script id="kyr-consent-reserve" dangerouslySetInnerHTML={{ __html: quizConsentReserveScript() }} />
        <style id="kyr-consent-reserve-css" dangerouslySetInnerHTML={{ __html: QUIZ_CONSENT_RESERVE_CSS }} />
        <GoogleAnalytics />
        <BaseJsonLd />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
