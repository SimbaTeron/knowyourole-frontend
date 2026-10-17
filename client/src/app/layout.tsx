import type { Metadata } from "next";
import "@/styles/fonts";
import "../index.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { BaseJsonLd } from "@/components/seo/BaseJsonLd";
import { publicPageMetadata } from "@/lib/seo";
import Providers from "./providers";

export const metadata: Metadata = publicPageMetadata("/");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="kyr-workday" suppressHydrationWarning>
      <body className="kyr-page">
        <GoogleAnalytics />
        <BaseJsonLd />
        <Providers>{children}</Providers>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
