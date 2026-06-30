import type { Metadata } from "next";
import "../index.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "KnowYouRole",
  description: "Discover your personality path — a practical self-reflection quiz combining Big Five traits, MBTI-style patterns, DISC-style communication, and career-fit guidance.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dark kyr-page" style={{ background: "linear-gradient(#050510 0%, #020024 50%, #000 100%)" }}>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
