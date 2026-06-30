'use client';

import { AppHeader } from "@/components/layout/AppHeader";

const MODEL_CARDS = [
  {
    eyebrow: "Trait backbone",
    title: "Big Five",
    description:
      "Shows your underlying tendencies across openness, follow-through, social energy, cooperativeness, and emotional steadiness.",
    bullets: ["Stable trait language", "Strengths and watchouts", "Plain-English percentages"],
    accent: "#46d8ff",
  },
  {
    eyebrow: "Pattern lens",
    title: "MBTI-style",
    description:
      "Turns your preferences into a familiar personality pattern without pretending a four-letter type explains your whole life.",
    bullets: ["Thinking and decision style", "Energy and attention patterns", "Useful type-style summary"],
    accent: "#8b5cff",
  },
  {
    eyebrow: "Behavior lens",
    title: "DISC",
    description:
      "Highlights how you tend to communicate, move, lead, collaborate, and respond when the work gets messy.",
    bullets: ["Work-style signal", "Team communication clues", "Practical role fit"],
    accent: "#ff5de4",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The report gave me language for how I work without boxing me into a cartoon personality type.",
    name: "Maya R.",
    role: "Product team lead",
  },
  {
    quote:
      "I liked that it connected traits to roles and team behavior. It felt practical instead of mystical.",
    name: "Jordan K.",
    role: "Career switcher",
  },
  {
    quote:
      "The result was easy to share with my team because it explained strengths, friction points, and next moves clearly.",
    name: "Ari S.",
    role: "Founder",
  },
];

export default function Home() {
  return (
    <div className="kyr-home-page">
      <style>{`
        .kyr-home-page {
          min-height: 100vh;
          background: #03040d;
          color: #f8fbff;
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }

        .kyr-home-page * { box-sizing: border-box; }

        .home-shell {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .hero-section {
          position: relative;
          min-height: min(820px, 90svh);
          padding: clamp(82px, 8vw, 104px) 0 clamp(32px, 5vw, 58px);
          display: flex;
          align-items: center;
          isolation: isolate;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 18%, rgba(70, 216, 255, 0.18), transparent 31%),
            radial-gradient(circle at 78% 22%, rgba(139, 92, 255, 0.22), transparent 34%),
            radial-gradient(circle at 78% 82%, rgba(255, 93, 228, 0.10), transparent 30%),
            linear-gradient(135deg, #06131b 0%, #050712 42%, #10051a 100%);
        }

        .hero-section::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          opacity: 0.34;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.68) 70%, transparent 100%);
        }

        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(330px, 0.76fr);
          gap: clamp(24px, 4vw, 52px);
          align-items: center;
        }

        .selected-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #bdeeff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .selected-pill::before {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: linear-gradient(135deg, #46d8ff, #8b5cff);
          box-shadow: 0 0 22px rgba(70,216,255,0.8);
        }

        .hero-title {
          margin: 0;
          max-width: 670px;
          font-size: clamp(3rem, 5.8vw, 5.15rem);
          line-height: 0.91;
          letter-spacing: -0.072em;
          font-weight: 950;
        }

        .hero-subtitle {
          max-width: 610px;
          margin: 16px 0 0;
          color: rgba(248,251,255,0.74);
          font-size: clamp(1rem, 1.55vw, 1.18rem);
          line-height: 1.5;
          font-weight: 650;
          letter-spacing: -0.018em;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          margin-top: 16px;
        }

        .primary-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 230px;
          min-height: 50px;
          padding: 0 32px;
          border-radius: 999px;
          background: linear-gradient(135deg, #48dcff, #7657ff 58%, #ff5de4);
          color: #fff;
          text-decoration: none;
          font-size: 15.5px;
          font-weight: 950;
          letter-spacing: -0.01em;
          box-shadow: 0 18px 48px rgba(70, 216, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .primary-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 58px rgba(139, 92, 255, 0.32), inset 0 1px 0 rgba(255,255,255,0.44);
        }

        .hero-facts {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
        }

        .hero-fact {
          display: inline-flex;
          align-items: center;
          min-height: 31px;
          padding: 0 12px;
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 999px;
          background: rgba(255,255,255,0.055);
          color: rgba(248,251,255,0.78);
          font-size: 12px;
          font-weight: 850;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .how-card {
          margin-top: 26px;
          width: min(620px, 100%);
        }

        .section-break-card {
          margin: 0 0 12px;
          padding: 15px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(70,216,255,0.13), rgba(139,92,255,0.08), rgba(255,93,228,0.08));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 46px rgba(0,0,0,0.16);
        }

        .section-break-card strong { display: block; color: #fff; font-size: 20px; line-height: 1.02; letter-spacing: -0.045em; font-weight: 950; }
        .section-break-card span { display: block; margin-top: 6px; color: rgba(248,251,255,0.66); font-size: 12.5px; line-height: 1.38; font-weight: 650; }

        .section-kicker {
          margin: 0 0 10px;
          color: rgba(248,251,255,0.82);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .how-list {
          display: grid;
          gap: 0;
          margin: 0;
          padding: 0;
          list-style: none;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(5,8,18,0.36);
        }

        .how-step {
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr);
          align-items: flex-start;
          gap: 11px;
          min-height: 58px;
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          color: rgba(248,251,255,0.82);
          font-size: 13px;
          font-weight: 850;
          backdrop-filter: blur(18px);
        }

        .how-step:last-child { border-bottom: 0; }
        .step-copy strong { display: block; color: #fff; font-size: 13.5px; line-height: 1.12; letter-spacing: -0.02em; font-weight: 900; }
        .step-copy span { display: block; margin-top: 4px; color: rgba(248,251,255,0.56); font-size: 12px; line-height: 1.34; font-weight: 650; }

        .step-number {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border-radius: 14px;
          border: 1px solid rgba(70,216,255,0.25);
          background: rgba(70,216,255,0.13);
          color: #c7f8ff;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 0 18px rgba(70,216,255,0.18);
        }

        .result-wrap {
          position: relative;
          min-height: 458px;
        }

        .mock-labels {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 0 0 12px;
          color: rgba(159,238,255,0.88);
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }
        .mock-labels span:last-child { padding: 6px 9px; border: 1px solid rgba(255,255,255,0.13); border-radius: 999px; background: rgba(255,255,255,0.06); color: rgba(248,251,255,0.60); }

        .sample-card {
          position: relative;
          width: 100%;
          min-height: 438px;
          padding: clamp(14px, 2.2vw, 18px);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 30px;
          background:
            radial-gradient(circle at 84% 8%, rgba(70,216,255,0.20), transparent 32%),
            radial-gradient(circle at 4% 92%, rgba(255,214,130,0.13), transparent 35%),
            linear-gradient(150deg, rgba(255,255,255,0.105), rgba(255,255,255,0.04));
          box-shadow: 0 34px 120px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.16);
          backdrop-filter: blur(26px);
          overflow: hidden;
        }

        .sample-card::before {
          content: '';
          position: absolute;
          inset: -32% -22% auto auto;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(70,216,255,0.24), transparent 62%);
          filter: blur(6px);
        }

        .sample-card::after {
          content: '';
          position: absolute;
          inset: auto auto -34% -24%;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,93,228,0.15), transparent 64%);
          filter: blur(8px);
        }

        .sample-inner { position: relative; z-index: 1; }

        .mini-type-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.07);
          color: rgba(248,251,255,0.68);
          font-size: 11px;
          font-weight: 900;
        }

        .sample-title-box {
          margin-top: 14px;
          padding: clamp(15px, 2.4vw, 20px);
          min-height: 104px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          background: rgba(5,8,18,0.56);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.11);
        }

        .sample-title {
          margin: 8px 0 0;
          font-size: clamp(2.25rem, 4.8vw, 3.35rem);
          line-height: 0.88;
          letter-spacing: -0.075em;
          font-weight: 950;
          color: rgba(255,255,255,0.92);
        }

        .share-line { margin: 12px 0 10px; }
        .share-line-label { display: block; margin-bottom: 5px; color: #ffd66b; font-size: 9.5px; font-weight: 950; letter-spacing: 0.17em; text-transform: uppercase; }
        .share-line-text { margin: 0; color: rgba(255,255,255,0.78); font-size: clamp(0.9rem, 1.5vw, 1.02rem); line-height: 1.38; font-weight: 650; letter-spacing: -0.018em; }

        .role-preview {
          padding: 12px;
          border-radius: 20px;
          background: rgba(246, 227, 198, 0.82);
          color: #15100d;
        }

        .role-preview h3 {
          margin: 4px 0 6px;
          color: #15100d;
          font-size: clamp(1.12rem, 1.9vw, 1.35rem);
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 950;
        }
        .role-preview small { display: block; color: rgba(74,54,28,0.62); font-size: 9px; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; }

        .role-preview p {
          margin: 0;
          color: rgba(21,16,13,0.72);
          font-size: 11px;
          line-height: 1.32;
          font-weight: 750;
        }

        .sample-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .metric-box {
          min-height: 58px;
          padding: 9px;
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 17px;
          background: rgba(4,5,14,0.34);
        }

        .metric-label {
          display: block;
          color: #8deaff;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .metric-value {
          display: block;
          margin-top: 4px;
          color: rgba(255,255,255,0.9);
          font-size: 17px;
          font-weight: 950;
          line-height: 1;
        }

        .metric-detail {
          display: block;
          margin-top: 4px;
          color: rgba(255,255,255,0.48);
          font-size: 10px;
          font-weight: 800;
        }

        .full-results-note {
          margin-top: 12px;
          padding: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 22px;
          background: rgba(255,255,255,0.055);
          backdrop-filter: blur(22px);
        }

        .note-title {
          margin: 0 0 6px;
          color: rgba(255,255,255,0.86);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .note-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }

        .note-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          color: rgba(255,255,255,0.68);
          font-size: 11px;
          line-height: 1.18;
          font-weight: 750;
        }

        .model-section,
        .testimonial-section {
          padding: clamp(38px, 5.5vw, 64px) 0;
          position: relative;
        }

        .model-section {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.055), rgba(255,255,255,0.012)),
            radial-gradient(circle at 50% 0%, rgba(70,216,255,0.075), transparent 34%),
            linear-gradient(180deg, #03040d, #060713 48%, #03040d);
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .section-heading {
          display: grid;
          grid-template-columns: minmax(0, 0.78fr) minmax(280px, 0.72fr);
          gap: clamp(20px, 4vw, 46px);
          align-items: end;
          margin-bottom: clamp(20px, 4vw, 30px);
        }

        .eyebrow {
          margin: 0 0 12px;
          color: #8deaff;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .section-title {
          margin: 0;
          color: #fff;
          font-size: clamp(1.9rem, 3.6vw, 3.45rem);
          line-height: 0.94;
          letter-spacing: -0.06em;
          font-weight: 950;
        }

        .section-copy {
          margin: 0;
          color: rgba(248,251,255,0.58);
          font-size: 15px;
          line-height: 1.5;
          font-weight: 700;
        }

        .model-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .model-card,
        .testimonial-card {
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.045);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(22px);
        }

        .model-card {
          position: relative;
          min-height: 268px;
          padding: clamp(18px, 2.4vw, 24px);
          border-radius: 24px;
          overflow: hidden;
        }

        .model-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 22% 0%, var(--accent-glow), transparent 45%);
          pointer-events: none;
        }

        .model-content { position: relative; z-index: 1; }

        .model-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          margin-bottom: 12px;
          border-radius: 14px;
          border: 1px solid color-mix(in srgb, var(--accent) 55%, transparent);
          background: color-mix(in srgb, var(--accent) 17%, transparent);
          color: var(--accent);
          font-size: 13px;
          font-weight: 950;
        }

        .model-eyebrow {
          margin: 0 0 8px;
          color: var(--accent);
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .model-title {
          margin: 0 0 12px;
          color: #fff;
          font-size: 27px;
          line-height: 0.98;
          letter-spacing: -0.045em;
          font-weight: 950;
        }

        .model-description {
          margin: 0 0 16px;
          color: rgba(248,251,255,0.60);
          font-size: 14px;
          line-height: 1.55;
          font-weight: 700;
        }

        .model-bullets {
          display: grid;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .model-bullets li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(248,251,255,0.74);
          font-size: 12px;
          font-weight: 850;
        }

        .model-bullets li::before {
          content: '';
          width: 6px;
          height: 6px;
          flex: 0 0 auto;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 16px var(--accent);
        }

        .testimonial-section {
          background: linear-gradient(180deg, #03040d, #080611 70%, #03040d);
        }

        .testimonial-header {
          max-width: 760px;
          margin-bottom: clamp(20px, 4vw, 30px);
        }

        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .testimonial-card {
          min-height: 208px;
          padding: clamp(18px, 2.4vw, 24px);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .stars {
          color: #ffd66b;
          font-size: 14px;
          letter-spacing: 0.12em;
          margin-bottom: 18px;
        }

        .testimonial-quote {
          margin: 0;
          color: rgba(248,251,255,0.84);
          font-size: clamp(1.02rem, 1.5vw, 1.22rem);
          line-height: 1.44;
          letter-spacing: -0.02em;
          font-weight: 850;
        }

        .testimonial-person {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          border-radius: 999px;
          background: linear-gradient(135deg, #46d8ff, #8b5cff 52%, #ff5de4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 0 28px rgba(139,92,255,0.24);
        }

        .person-name {
          margin: 0;
          color: #fff;
          font-size: 14px;
          font-weight: 950;
        }

        .person-role {
          margin: 2px 0 0;
          color: rgba(248,251,255,0.42);
          font-size: 12px;
          font-weight: 700;
        }

        .home-footer {
          padding: 24px 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          color: rgba(248,251,255,0.46);
          font-size: 12px;
        }

        .footer-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px 18px;
          align-items: center;
          justify-content: space-between;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .footer-links a {
          color: rgba(248,251,255,0.46);
          text-decoration: none;
        }

        .footer-links a:hover { color: #8deaff; }

        @media (max-width: 980px) {
          .hero-section { align-items: flex-start; min-height: auto; }
          .hero-grid,
          .section-heading {
            grid-template-columns: 1fr;
          }
          .result-wrap { min-height: auto; }
          .model-grid,
          .testimonial-grid {
            grid-template-columns: 1fr;
          }
          .model-card,
          .testimonial-card { min-height: auto; }
        }

        @media (max-width: 640px) {
          .home-shell { width: min(100% - 28px, 1180px); }
          .hero-section { padding-top: 86px; padding-bottom: 34px; }
          .hero-title { font-size: clamp(2.72rem, 13.6vw, 3.82rem); }
          .hero-subtitle { font-size: 0.98rem; font-weight: 620; }
          .primary-cta { width: 100%; }
          .hero-facts { width: 100%; }
          .hero-fact { flex: 1 1 auto; justify-content: center; }
          .sample-card { min-height: auto; border-radius: 28px; }
          .sample-title-box { min-height: 118px; }
          .sample-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
          .metric-box { min-height: 60px; padding: 8px; }
          .metric-value { font-size: 14px; }
          .metric-detail { font-size: 9px; }
          .model-section,
          .testimonial-section { padding: 34px 0; }
          .section-heading { gap: 12px; margin-bottom: 16px; }
          .section-title { font-size: clamp(1.85rem, 9vw, 2.55rem); }
          .section-copy { font-size: 13.5px; font-weight: 620; }
          .model-grid { gap: 9px; }
          .model-card { display: grid; grid-template-columns: 42px minmax(0,1fr); gap: 10px; padding: 12px; border-radius: 20px; min-height: auto; }
          .model-content { display: contents; }
          .model-number { margin: 0; }
          .model-eyebrow { margin: 0 0 4px; font-size: 9px; }
          .model-title { margin: 0 0 5px; font-size: 17px; }
          .model-description { margin: 0; font-size: 12px; line-height: 1.35; font-weight: 620; }
          .model-bullets { display: none; }
          .note-grid { grid-template-columns: 1fr; }
          .mock-labels { font-size: 9px; }
          .how-step { align-items: flex-start; padding: 10px; }
        }
      `}</style>

      <AppHeader />

      <main>
        <section className="hero-section" aria-labelledby="home-hero-title">
          <div className="home-shell hero-grid">
            <div>
              <div className="selected-pill">Results Plus / selected direction</div>
              <h1 id="home-hero-title" className="hero-title">
                A personality quiz built for real decisions.
              </h1>
              <p className="hero-subtitle">
                A short quiz that combines Big Five, MBTI-style patterns, and DISC into one practical result.
              </p>

              <div className="hero-actions">
                <a className="primary-cta" href="/quiz">Take the free quiz</a>
              </div>

              <div className="hero-facts" aria-label="Quiz facts">
                <span className="hero-fact">28 questions</span>
                <span className="hero-fact">Private by default</span>
                <span className="hero-fact">Trait + role report</span>
              </div>

              <div className="how-card" aria-labelledby="how-it-works-title">
                <div className="section-break-card">
                  <h2 id="how-it-works-title" className="section-kicker">How it works</h2>
                  <strong>Three steps. No personality cosplay.</strong>
                  <span>A quieter separator gives the homepage clear chapters instead of one endless glass-card pile.</span>
                </div>
                <ol className="how-list">
                  <li className="how-step"><span className="step-number">1</span><span className="step-copy"><strong>Answer grounded questions</strong><span>Compact prompts around choices, pressure, and work preferences.</span></span></li>
                  <li className="how-step"><span className="step-number">2</span><span className="step-copy"><strong>Score the trait signals</strong><span>Personality, behavior, and career-fit vectors are scored together.</span></span></li>
                  <li className="how-step"><span className="step-number">3</span><span className="step-copy"><strong>Use the result</strong><span>Get role direction, communication clues, and practical next moves.</span></span></li>
                </ol>
              </div>
            </div>

            <div className="result-wrap" aria-label="Generic sample result preview">
              <div className="mock-labels">
                <span>Sample result</span>
                <span>Preview only</span>
              </div>

              <div className="sample-card">
                <div className="sample-inner">
                  <div className="sample-title-box">
                    <span className="mini-type-pill">✦ INTJ-style pattern</span>
                    <h2 className="sample-title">Systems<br />Builder</h2>
                  </div>

                  <div className="share-line">
                    <span className="share-line-label">What you’ll learn</span>
                    <p className="share-line-text">Your answers become a plain-English portrait: work style, role direction, strengths, and friction points.</p>
                  </div>

                  <div className="role-preview">
                    <small>Best-fit role direction</small>
                    <h3>Strategic Analyst</h3>
                    <p>
                      A quick snapshot of the kinds of environments, problems, and work patterns that may fit you best.
                    </p>
                  </div>

                  <div className="sample-metrics">
                    <div className="metric-box">
                      <span className="metric-label">Trait lens</span>
                      <span className="metric-value">INTJ</span>
                      <span className="metric-detail">Pattern</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Work style</span>
                      <span className="metric-value">C/D</span>
                      <span className="metric-detail">Precise + direct</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Top trait</span>
                      <span className="metric-value">85%</span>
                      <span className="metric-detail">Follow-through</span>
                    </div>
                  </div>

                  <aside className="full-results-note" aria-label="Full result features">
                    <p className="note-title">Also inside the full result</p>
                    <div className="note-grid">
                      <div className="note-item"><span>🧠</span><span>Trait breakdowns with plain-English meaning</span></div>
                      <div className="note-item"><span>💼</span><span>Role-fit suggestions and career direction</span></div>
                      <div className="note-item"><span>🤝</span><span>Team communication and friction points</span></div>
                      <div className="note-item"><span>⚡</span><span>Action tips for better decisions</span></div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="model-section" aria-labelledby="models-title">
          <div className="home-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">The three lenses</p>
                <h2 id="models-title" className="section-title">Big Five depth, MBTI-style patterns, DISC behavior.</h2>
              </div>
              <p className="section-copy">
                One model alone can be too narrow. KnowYouRole blends trait depth, familiar pattern language, and work-style behavior so the result is easier to understand and more useful in real decisions.
              </p>
            </div>

            <div className="model-grid">
              {MODEL_CARDS.map((model, index) => (
                <article
                  key={model.title}
                  className="model-card"
                  style={{
                    "--accent": model.accent,
                    "--accent-glow": `${model.accent}25`,
                  } as React.CSSProperties}
                >
                  <div className="model-content">
                    <span className="model-number">0{index + 1}</span>
                    <p className="model-eyebrow">{model.eyebrow}</p>
                    <h3 className="model-title">{model.title}</h3>
                    <p className="model-description">{model.description}</p>
                    <ul className="model-bullets">
                      {model.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="testimonial-section" aria-labelledby="testimonials-title">
          <div className="home-shell">
            <div className="testimonial-header">
              <p className="eyebrow">What people notice</p>
              <h2 id="testimonials-title" className="section-title">Useful enough to actually talk about.</h2>
            </div>

            <div className="testimonial-grid">
              {TESTIMONIALS.map((item) => (
                <figure key={item.name} className="testimonial-card">
                  <div>
                    <div className="stars" aria-label="Five star rating">★★★★★</div>
                    <blockquote className="testimonial-quote">“{item.quote}”</blockquote>
                  </div>
                  <figcaption className="testimonial-person">
                    <span className="avatar">{item.name.split(" ").map((part) => part[0]).join("")}</span>
                    <span>
                      <p className="person-name">{item.name}</p>
                      <p className="person-role">{item.role}</p>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-shell footer-row">
          <span>© 2026 KnowYouRole</span>
          <nav className="footer-links" aria-label="Footer links">
            <a href="/privacy">Privacy</a>
            <a href="/privacy#cookie-preferences">Cookie Settings</a>
            <a href="/methodology">Methodology</a>
            <a href="/terms">Terms</a>
            <a href="/faq">FAQ</a>
            <a href="/about">About</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
