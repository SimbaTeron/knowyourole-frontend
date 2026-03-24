import { useState } from "react";
import { Link } from "wouter";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: string;
  description: string;
  icon: string;
}

const JOB_OPENINGS: JobOpening[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    type: "Full-time",
    description: "Build beautiful, accessible user interfaces using React and TypeScript. Work on our personality quiz platform serving thousands of daily users.",
    icon: "⚙",
  },
  {
    id: "2",
    title: "Product Designer",
    department: "Design",
    type: "Full-time",
    description: "Shape the visual identity and user experience of KnowYouRole. Create intuitive interfaces that make personality discovery fun and engaging.",
    icon: "🎨",
  },
  {
    id: "3",
    title: "Psychology Research Lead",
    department: "Research",
    type: "Full-time",
    description: "Lead research initiatives to improve our personality assessment algorithms. Collaborate with clinical psychologists to ensure scientific validity.",
    icon: "🧠",
  },
  {
    id: "4",
    title: "Marketing Manager",
    department: "Growth",
    type: "Part-time",
    description: "Drive user acquisition and brand awareness for our personality platform. Develop content strategies that resonate with our target audience.",
    icon: "📈",
  },
];

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
};

const getGlowColor = (index: number) => (index % 2 === 0 ? "rgba(0,200,255,0.2)" : "rgba(120,0,255,0.2)");
const getAccentColor = (index: number) => (index % 2 === 0 ? "#00C8FF" : "#7800FF");

export default function CareersPage() {
  const [formData, setFormData] = useState({ name: "", email: "", role: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      <AppHeader />

      {/* Hero */}
      <div style={{ padding: "clamp(100px, 15vw, 140px) 24px 60px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>
          Join Our Mission
        </h1>
        <p style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)", color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7, fontFamily: "'Outfit',sans-serif" }}>
          Help us build the future of personality discovery. We&apos;re a small team passionate about helping people understand themselves better.
        </p>
      </div>

      {/* Job Listings */}
      <div style={{ padding: "0 24px 80px", maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        {JOB_OPENINGS.map((job, index) => (
          <div
            key={job.id}
            style={{
              ...glassCard,
              padding: "clamp(20px, 4vw, 32px)",
              borderColor: getGlowColor(index),
              boxShadow: `0 0 30px ${getGlowColor(index)}`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px ${getGlowColor(index)}`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${getGlowColor(index)}`;
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{job.icon}</span>
                  <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", fontWeight: 700, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>{job.title}</h3>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: getAccentColor(index), fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>{job.department}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>•</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit',sans-serif" }}>{job.type}</span>
                </div>
              </div>
              <button
                style={{
                  padding: "10px 24px",
                  background: "transparent",
                  border: `1px solid ${getAccentColor(index)}`,
                  borderRadius: 50,
                  color: getAccentColor(index),
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                  transition: "all 0.2s",
                  boxShadow: `0 0 12px ${getGlowColor(index)}`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = getAccentColor(index);
                  (e.currentTarget as HTMLButtonElement).style.color = "#000";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = getAccentColor(index);
                }}
              >
                Apply Now
              </button>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontFamily: "'Outfit',sans-serif" }}>{job.description}</p>
          </div>
        ))}

        {/* Open Application */}
        <div
          style={{
            ...glassCard,
            padding: "clamp(24px, 5vw, 40px)",
            textAlign: "center" as const,
            border: "1px solid rgba(0,200,255,0.2)",
            boxShadow: "0 0 40px rgba(0,200,255,0.1)",
          }}
        >
          <h3 style={{ fontSize: "clamp(1.1rem, 3vw, 1.4rem)", fontWeight: 800, marginBottom: 10, color: "#00C8FF", fontFamily: "'Outfit',sans-serif" }}>
            Don&apos;t see a perfect fit?
          </h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28, lineHeight: 1.6, fontFamily: "'Outfit',sans-serif" }}>
            We&apos;re always looking for talented people. Send us your info and tell us how you&apos;d like to contribute.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
              <input
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ ...inputStyle }}
              />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ ...inputStyle }}
              />
              <input
                name="role"
                type="text"
                placeholder="What role are you interested in?"
                value={formData.role}
                onChange={handleChange}
                style={{ ...inputStyle }}
              />
              <textarea
                name="message"
                placeholder="Tell us about yourself..."
                value={formData.message}
                onChange={handleChange}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" as const, minHeight: 100 }}
              />
              <button
                type="submit"
                style={{
                  padding: "15px",
                  background: "linear-gradient(90deg, #00C8FF, #7800FF)",
                  border: "none",
                  borderRadius: 14,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                  boxShadow: "0 0 30px rgba(0,200,255,0.3)",
                  marginTop: 4,
                }}
              >
                Send Open Application
              </button>
            </form>
          ) : (
            <div style={{ padding: "24px", background: "rgba(0,200,255,0.1)", borderRadius: 16, border: "1px solid rgba(0,200,255,0.3)" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#00C8FF", marginBottom: 6 }}>Application sent!</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit',sans-serif" }}>We&apos;ll be in touch if there&apos;s a good fit.</p>
            </div>
          )}
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "'Outfit',sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00C8FF")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  color: "#fff",
  fontSize: 15,
  outline: "none",
  fontFamily: "'Outfit',sans-serif",
  boxSizing: "border-box" as const,
};
