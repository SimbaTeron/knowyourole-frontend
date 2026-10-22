import type { Metadata } from "next";
import "@/styles/fonts";
import "../index.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { FontSwapFit } from "@/components/fonts/FontSwapFit";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { BaseJsonLd } from "@/components/seo/BaseJsonLd";
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
    <html lang="en" className="kyr-workday font-lock" suppressHydrationWarning>
      <body className="kyr-page">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{["500","600","700"].forEach(function(w){document.fonts.load(w+' 16px "Space Grotesk"')});["400","500","600","700"].forEach(function(w){document.fonts.load(w+' 16px "IBM Plex Sans"')})}catch(e){}`,
          }}
        />
        <script src="/font-swap-fit.js" defer />
        <FontSwapFit />
        <GoogleAnalytics />
        <BaseJsonLd />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
