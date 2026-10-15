"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { EMAIL_PAGE_CSS } from "@/components/email/emailPageCss";

type Purpose = "confirm" | "unsubscribe" | "delete";

const COPY: Record<Purpose, { eyebrow: string; title: string; body: string; button: string; done: string; doneBody: string }> = {
  confirm: {
    eyebrow: "Occasional updates",
    title: "Confirm your updates",
    body: "You asked for occasional KnowYouRole updates (about monthly). Confirm below so we know it was really you.",
    button: "Yes, confirm updates",
    done: "You're confirmed",
    doneBody: "Thanks. You'll get an update about once a month. Every email has a one-click unsubscribe.",
  },
  unsubscribe: {
    eyebrow: "Email preferences",
    title: "Unsubscribe from updates",
    body: "Stop all KnowYouRole update emails to this address. Your results copy is unaffected.",
    button: "Unsubscribe",
    done: "You're unsubscribed",
    doneBody: "You won't get any more update emails. Want your address removed completely? Use the “Delete my email” link in the email.",
  },
  delete: {
    eyebrow: "Your data",
    title: "Delete my email",
    body: "Permanently remove this email address and your email choices from KnowYouRole's records.",
    button: "Delete my email",
    done: "Your email is deleted",
    doneBody: "We've removed this address and your email choices. If it was never stored (one-time copies aren't), there was nothing to remove.",
  },
};

export function EmailActionPage({ purpose }: { purpose: Purpose }) {
  const copy = COPY[purpose];
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("t"));
  }, []);

  const submit = async () => {
    if (!token) return;
    setStatus("working");
    setError("");
    try {
      const res = await fetch(`/api/email/${purpose}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.error || "Something went wrong. Please try again.");
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <div className="workday-simple-page min-h-screen bg-soft-cream text-warm-gray">
      <AppHeader />
      <main className="workday-simple-wrap max-w-xl px-6 py-32">
        <div className="kyr-email-panel" data-testid={`email-${purpose}-page`}>
          <p className="kyr-email-eyebrow">{copy.eyebrow}</p>
          <h1 className="kyr-email-title">{status === "done" ? copy.done : copy.title}</h1>
          <p className="kyr-email-body" role={status === "done" ? "status" : undefined}>{status === "done" ? copy.doneBody : copy.body}</p>
          {status !== "done" && (
            token === null || token === "" ? (
              <p className="kyr-email-error">This link is missing its code. Please use the link from your email.</p>
            ) : (
              <button type="button" className="kyr-email-primary" onClick={submit} disabled={status === "working"}>
                {status === "working" ? "One moment…" : copy.button}
              </button>
            )
          )}
          {status === "error" && <p className="kyr-email-error" role="alert">{error}</p>}
          <p className="kyr-email-foot"><a href="/">Back to KnowYouRole</a> · <a href="/privacy">Privacy</a></p>
        </div>
      </main>
      <style>{EMAIL_PAGE_CSS}</style>
    </div>
  );
}

