import { useState } from "react";
import { Link } from "wouter";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

const FAQS = [
  { q: "How long does the quiz take?", a: "Most people complete it in 3-5 minutes. It's designed to be quick, engaging, and insightful." },
  { q: "Is my data private?", a: "100%. We never sell your data, share it with third parties, or use it for anything you haven't explicitly agreed to." },
  { q: "What personality model do you use?", a: "We use the Big Five (OCEAN) model — the most scientifically validated personality framework in psychology." },
  { q: "Is this free?", a: "Yes! The core assessment is completely free. Premium features are available for those who want deeper insights." },
  { q: "Can I retake the quiz?", a: "Absolutely. Your personality may evolve over time, and we encourage revisiting the quiz as you grow." },
  { q: "How accurate are the results?", a: "Our algorithm is based on decades of personality research and maps closely to clinical assessments." },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{``}</style>

      <AppHeader />

      {/* Hero */}
      <div style={{ paddingTop: 140, paddingBottom: 48, textAlign: "center", padding: "140px 24px 48px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
          Everything you need to know about KnowYouRole.
        </p>
      </div>

      {/* FAQ */}
      <div style={{ padding: "0 24px 80px", maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: open === i ? "1px solid rgba(0,200,255,0.3)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", transition: "all 0.25s" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-answer-${i}`}
              style={{ width: "100%", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", gap: 16 }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>{faq.q}</span>
              <span style={{ fontSize: 22, color: open === i ? "#00C8FF" : "rgba(255,255,255,0.3)", transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "rotate(0deg)", flexShrink: 0 }}>+</span>
            </button>
            {open === i && (
              <div id={`faq-answer-${i}`} style={{ padding: "0 24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, fontFamily: "'Outfit',sans-serif" }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "0 24px 100px" }}>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Still have questions?</p>
        <Link href="/quiz" style={{ textDecoration: "none" }}>
          <button style={{ padding: "14px 32px", background: "linear-gradient(90deg, #00C8FF, #7800FF)", border: "none", borderRadius: 50, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
            Take the Quiz →
          </button>
        </Link>
      </div>

      <AppFooter />
    </div>
  );
}
