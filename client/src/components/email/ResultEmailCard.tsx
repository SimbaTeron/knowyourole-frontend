"use client";

import { FormEvent, useId, useState } from "react";
import {
  EMAIL_CARD_COPY,
  getAgeGateState,
  isValidEmail,
  type AgeAnswer,
  type ResultEmailSummary,
} from "@/lib/email/emailRequestCore";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Optional "Email me my results" card. Rendered BELOW the results; never gates them.
 * No name field, no pre-checked boxes, no tracking pixels.
 */
export function ResultEmailCard({ summary, onDownloadPdf }: { summary: ResultEmailSummary; onDownloadPdf: () => void }) {
  const id = useId();
  const [age, setAge] = useState<AgeAnswer>("unanswered");
  const [email, setEmail] = useState("");
  const [updates, setUpdates] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [copied, setCopied] = useState(false);
  const gate = getAgeGateState(age);

  const onAge = (next: AgeAnswer) => {
    setAge(next);
    if (next !== "yes") {
      // Under-13: drop anything typed so nothing can be sent or stored.
      setEmail("");
      setUpdates(false);
      setFieldError("");
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!gate.ageGatePassed) return;
    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address, like name@example.com.");
      return;
    }
    setFieldError("");
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/email/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, updates, ageGatePassed: true, website, summary }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.error || "We couldn't send that email. Please try again.");
      setStatus("sent");
      setMessage(
        data?.updatesPendingConfirmation
          ? "Check your inbox. Your results are on the way, with a link to confirm updates."
          : "Check your inbox. Your results are on the way.",
      );
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "We couldn't send that email.");
    }
  };

  const copyResults = async () => {
    const text = `My KnowYouRole result: ${summary.identity} (${summary.mbtiType} · ${summary.discLabel}). Best-fit direction: ${summary.roleTitle}. “${summary.snapshot}” Take it at knowyourole.com`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="kyr-ec" aria-labelledby={`${id}-title`} data-testid="email-results-card">
      <style>{CARD_CSS}</style>
      <div className="kyr-ec-head">
        <span className="kyr-ec-icon" aria-hidden="true">✉</span>
        <div>
          <p className="kyr-ec-eyebrow">Optional</p>
          <h3 id={`${id}-title`} className="kyr-ec-title">{EMAIL_CARD_COPY.title}</h3>
        </div>
      </div>

      {status === "sent" ? (
        <div className="kyr-ec-success" role="status" data-testid="email-results-success">
          <strong>Sent!</strong> {message}
          <button type="button" className="kyr-ec-link" onClick={() => { setStatus("idle"); setEmail(""); setUpdates(false); setMessage(""); }}>Send to a different address</button>
        </div>
      ) : (
        <>
          <fieldset className="kyr-ec-age">
            <legend className="kyr-ec-label">{EMAIL_CARD_COPY.ageQuestion}</legend>
            <div className="kyr-ec-seg">
              {(["yes", "no"] as const).map((value) => (
                <label key={value} className={`kyr-ec-segopt ${age === value ? "is-on" : ""}`}>
                  <input type="radio" name={`${id}-age`} value={value} checked={age === value} onChange={() => onAge(value)} />
                  <span>{value === "yes" ? "Yes" : "No"}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {gate.showUnder13Help && (
            <div className="kyr-ec-under13" data-testid="email-results-under13">
              <p><strong>{EMAIL_CARD_COPY.under13}.</strong> You can also keep a copy yourself:</p>
              <div className="kyr-ec-actions">
                <button type="button" className="kyr-ec-secondary" onClick={copyResults}>{copied ? "Copied ✓" : "Copy results"}</button>
                <button type="button" className="kyr-ec-secondary" onClick={() => window.print()}>Print</button>
                <button type="button" className="kyr-ec-secondary" onClick={onDownloadPdf}>Download PDF</button>
              </div>
              <span className="kyr-ec-live" role="status">{copied ? "Results copied to clipboard" : ""}</span>
            </div>
          )}

          {gate.showEmailField && (
            <form className="kyr-ec-form" onSubmit={submit} noValidate>
              <label className="kyr-ec-label" htmlFor={`${id}-email`}>Email address</label>
              <input
                id={`${id}-email`}
                className="kyr-ec-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? `${id}-err` : `${id}-note`}
                onChange={(e) => { setEmail(e.target.value); if (fieldError) setFieldError(""); }}
                maxLength={254}
                required
              />
              {fieldError && <p id={`${id}-err`} className="kyr-ec-field-error">{fieldError}</p>}
              <div className="kyr-ec-hp" aria-hidden="true">
                <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" /></label>
              </div>
              <label className="kyr-ec-check">
                <input type="checkbox" checked={updates} onChange={(e) => setUpdates(e.target.checked)} />
                <span>{EMAIL_CARD_COPY.updatesLabel}</span>
              </label>
              <button type="submit" className="kyr-ec-primary" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Email me my results"}
              </button>
              <p id={`${id}-note`} className="kyr-ec-note">
                {updates ? "We'll keep your address only for updates, after you confirm by email." : EMAIL_CARD_COPY.sendOnlyNote}{" "}
                <a href="/privacy">Privacy</a>
              </p>
              {status === "error" && <p className="kyr-ec-error" role="alert">{message}</p>}
            </form>
          )}
        </>
      )}
    </section>
  );
}

const CARD_CSS = `
.kyr-ec { margin:14px 0 11px; padding:18px 17px; border:1px solid rgba(18,38,58,.18); border-radius:4px; background:#fffdf8; color:#12263a; box-shadow:4px 4px 0 rgba(18,38,58,.09); font-family:Manrope,Inter,system-ui,sans-serif; }
.kyr-ec-head { display:flex; gap:12px; align-items:center; margin-bottom:14px; }
.kyr-ec-icon { flex:0 0 44px; height:44px; display:grid; place-items:center; border-radius:4px; background:#dcedf0; border:1px solid rgba(18,38,58,.16); font-size:20px; color:#315f74; }
.kyr-ec-eyebrow { margin:0 0 4px; font-size:10px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; color:#315f74; }
.kyr-ec-title { margin:0; font-family:Fraunces,Georgia,serif; font-size:21px; line-height:1.12; letter-spacing:-.02em; color:#12263a; }
.kyr-ec-age { border:0; margin:0 0 12px; padding:0; min-width:0; }
.kyr-ec-label { display:block; margin:0 0 7px; padding:0; font-size:14px; font-weight:800; color:#12263a; }
.kyr-ec-seg { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.kyr-ec-segopt { position:relative; display:flex; align-items:center; justify-content:center; min-height:46px; border:1px solid rgba(18,38,58,.28); border-radius:4px; background:#fffdf8; font-size:15px; font-weight:800; color:#12263a; cursor:pointer; }
.kyr-ec-segopt input { position:absolute; opacity:0; inset:0; margin:0; cursor:pointer; }
.kyr-ec-segopt.is-on { background:#12263a; color:#fffdf8; border-color:#12263a; }
.kyr-ec-segopt:focus-within { outline:3px solid #315f74; outline-offset:2px; }
.kyr-ec-form { display:grid; gap:10px; }
.kyr-ec-form .kyr-ec-label { margin-bottom:-3px; }
.kyr-ec-input { width:100%; min-height:48px; border:1px solid rgba(18,38,58,.32); border-radius:4px; background:#fff; color:#12263a; padding:0 13px; font-size:16px; font-family:inherit; }
.kyr-ec-input::placeholder { color:#7d909c; }
.kyr-ec-input:focus { outline:3px solid rgba(49,95,116,.35); border-color:#315f74; }
.kyr-ec-input[aria-invalid="true"] { border-color:#a3402b; }
.kyr-ec-field-error, .kyr-ec-error { margin:0; color:#8a2f1d; font-size:13px; font-weight:700; }
.kyr-ec-error { padding:10px 12px; border-radius:4px; background:#fdecea; border:1px solid #e9b4a8; }
.kyr-ec-check { display:flex; gap:10px; align-items:flex-start; font-size:14px; line-height:1.45; color:#29495c; cursor:pointer; }
.kyr-ec-check input { flex:0 0 20px; width:20px; height:20px; margin:1px 0 0; accent-color:#315f74; }
.kyr-ec-primary { min-height:50px; border:1px solid #9d3e2b; border-radius:4px; padding:12px 16px; background:linear-gradient(135deg,#c95f46,#a84732); color:#fffdf8; font:800 15px/1.2 Manrope,Inter,system-ui,sans-serif; cursor:pointer; box-shadow:4px 4px 0 rgba(18,38,58,.18); }
.kyr-ec-primary:hover:not(:disabled) { transform:translate(-1px,-1px); box-shadow:5px 5px 0 rgba(18,38,58,.2); }
.kyr-ec-primary:disabled { opacity:.72; cursor:wait; }
.kyr-ec-primary:focus-visible, .kyr-ec-secondary:focus-visible { outline:3px solid #315f74; outline-offset:2px; }
.kyr-ec-note { margin:0; font-size:12.5px; line-height:1.45; color:#456174; } .kyr-ec-note a { color:#315f74; text-decoration:underline; }
.kyr-ec-hp { position:absolute; left:-10000px; width:1px; height:1px; overflow:hidden; }
.kyr-ec-under13 { padding:14px; border-radius:4px; background:#eaf5f6; border:1px solid rgba(18,38,58,.14); }
.kyr-ec-under13 p { margin:0 0 11px; font-size:14px; line-height:1.5; color:#29495c; } .kyr-ec-under13 strong { color:#12263a; }
.kyr-ec-actions { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.kyr-ec-secondary { min-height:46px; border:1px solid rgba(18,38,58,.28); border-radius:4px; background:#fffdf8; color:#12263a; font:800 13px/1.2 Manrope,Inter,system-ui,sans-serif; cursor:pointer; padding:8px 6px; }
.kyr-ec-secondary:hover { background:#fff3d7; }
.kyr-ec-live { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); }
.kyr-ec-success { padding:14px; border-radius:4px; background:#e7f4ec; border:1px solid #a9d3b8; color:#1d4a2f; font-size:14px; line-height:1.5; }
.kyr-ec-link { display:block; margin-top:8px; padding:0; border:0; background:none; color:#315f74; font:700 13px/1.4 inherit; text-decoration:underline; cursor:pointer; }
@media print { .kyr-ec { display:none; } }
`;
