import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

export const metadata: Metadata = {
  title: "Page not found | KnowYouRole",
  description: "We couldn't find that page.",
  alternates: { canonical: null },
  openGraph: null,
  twitter: { card: "summary", title: "Page not found | KnowYouRole", description: "We couldn't find that page.", images: [] },
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: "#f8f3e8", color: "#12263a" }}>
      <AppHeader />
      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="w-full max-w-lg text-center">
          <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "#315f74" }}>Error 404</p>
          <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(34px, 8vw, 52px)", lineHeight: 1.05, margin: "12px 0 14px" }}>We couldn&apos;t find that page</h1>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: "#456174", margin: "0 auto 28px", maxWidth: 420 }}>The link may be old or mistyped. You can head home or take the free quiz.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/quiz" data-testid="notfound-quiz" style={{ display: "inline-flex", alignItems: "center", minHeight: 48, padding: "0 22px", borderRadius: 999, background: "#12263a", color: "#f8f3e8", fontWeight: 800, textDecoration: "none", boxShadow: "3px 3px 0 #ffca42" }}>Take the quiz</Link>
            <Link href="/" data-testid="notfound-home" style={{ display: "inline-flex", alignItems: "center", minHeight: 48, padding: "0 22px", borderRadius: 999, border: "1px solid rgba(18,38,58,.3)", background: "#fffdf8", color: "#12263a", fontWeight: 800, textDecoration: "none" }}>Home</Link>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
