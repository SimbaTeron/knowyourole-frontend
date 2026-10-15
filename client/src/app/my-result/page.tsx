import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { EMAIL_PAGE_CSS } from "@/components/email/emailPageCss";
import { getEmailTokenSecret, verifySummaryToken } from "@/app/api/_lib/emailTokens";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your result summary | KnowYouRole", robots: { index: false, follow: false } };

export default async function MyResultPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s } = await searchParams;
  const secret = getEmailTokenSecret();
  const summary = secret ? verifySummaryToken(s, secret) : null;
  return (
    <div className="workday-simple-page min-h-screen bg-soft-cream text-warm-gray">
      <AppHeader />
      <main className="workday-simple-wrap max-w-xl px-6 py-32">
        <div className="kyr-email-panel" data-testid="my-result-page">
          {summary ? (
            <>
              <p className="kyr-email-eyebrow">Your result summary</p>
              <h1 className="kyr-email-title">{summary.identity}</h1>
              <p className="kyr-email-body">“{summary.snapshot}”</p>
              <div className="kyr-sum-role"><small>Best-fit direction</small><strong>{summary.roleTitle}</strong></div>
              <div className="kyr-sum-stats">
                <div><small>Mind</small><strong>{summary.mbtiType}</strong></div>
                <div><small>Work style</small><strong>{summary.discLabel}</strong></div>
                <div><small>Top trait</small><strong>{summary.topTraits}</strong></div>
              </div>
              {summary.clarityHeading && <p className="kyr-email-body" style={{ marginTop: 12 }}>{summary.clarityHeading}</p>}
              <p className="kyr-email-body" style={{ fontSize: 13 }}>Approximate leanings, not a diagnosis or a label. <a href="/methodology" style={{ color: "#315f74", textDecoration: "underline" }}>How this works</a></p>
              <a className="kyr-email-primary" href="/quiz" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>Retake the quiz</a>
            </>
          ) : (
            <>
              <p className="kyr-email-eyebrow">Result summary</p>
              <h1 className="kyr-email-title">We couldn't open this summary</h1>
              <p className="kyr-email-body">The link may be incomplete. Try copying the full link from your email, or take the quiz again.</p>
              <a className="kyr-email-primary" href="/quiz" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>Take the quiz</a>
            </>
          )}
        </div>
      </main>
      <style>{EMAIL_PAGE_CSS + `
.kyr-sum-role { margin:4px 0 14px; padding:16px; border-radius:3px; background:linear-gradient(135deg,#ffca42,#f8df9a); box-shadow:5px 5px 0 #c95f46; }
.kyr-sum-role small, .kyr-sum-stats small { display:block; font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:#5a4320; margin-bottom:6px; }
.kyr-sum-role strong { font-family:Fraunces,Georgia,serif; font-size:22px; color:#12263a; }
.kyr-sum-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.kyr-sum-stats div { background:#12263a; color:#fffdf8; border-radius:3px; padding:11px 9px; }
.kyr-sum-stats small { color:#9fd8e6; } .kyr-sum-stats strong { font-size:14px; }
`}</style>
    </div>
  );
}
