import { useState } from "react";
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

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>
      <AppHeader />

      {/* Hero */}
      <div style={{ padding: "clamp(80px, 15vw, 140px) clamp(16px, 4vw, 64px) 48px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 900, marginBottom: 16, letterSpacing: "-0.03em", fontFamily: "'Outfit',sans-serif" }}>
          Frequently Asked <span style={{ background: "linear-gradient(90deg, #00C8FF, #7800FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Questions</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>Everything you need to know about KnowYouRole.</p>
      </div>

      {/* Accordion */}
      <div style={{ padding: "0 clamp(16px, 4vw, 64px) 80px", maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {FAQS.map((faq, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: open === i ? "1px solid rgba(0,200,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: open === i ? "0 0 20px rgba(0,200,255,0.1)" : "none",
              transition: "all 0.25s ease",
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Outfit',sans-serif", paddingRight: 16 }}>{faq.q}</span>
              <span style={{ fontSize: 22, color: "#00C8FF", fontWeight: 300, flexShrink: 0, transform: open === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.25s ease" }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, paddingTop: 16 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div style={{ textAlign: "center", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Still have questions?</p>
        <a href="mailto:hello@knowyourole.com" style={{ display: "inline-block", padding: "12px 32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 50, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>
          Get in touch
        </a>
      </div>

      <AppFooter />
    </div>
  );
}
