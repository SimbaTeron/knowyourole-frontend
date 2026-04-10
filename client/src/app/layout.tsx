import type { Metadata } from "next";
import "../index.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "KnowYouRole",
  description: "Discover your personality path — science-backed quiz combining MBTI, DISC, and Big Five into one powerful personality profile.",
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
      <body className="dark" style={{ background: "#050510", minHeight: "100vh" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
