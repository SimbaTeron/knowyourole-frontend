'use client';

import { AppHeader } from "@/components/layout/AppHeader";

export default function Home() {
  return (
    <div className="kyr-home-page">
      <style>{`
        .kyr-home-page {
          min-height: 100vh;
          overflow-x: hidden;
          background: #03040d;
          color: #f8fbff;
          font-family: 'IBM Plex Sans', Arial, sans-serif;
        }

        .kyr-home-page * { box-sizing: border-box; }

        /* Reuse the deployed Workday production palette when its theme layer is active. */
        html.kyr-workday .kyr-home-page .trust-section,
        html.kyr-workday .kyr-home-page .final-section {
          background: var(--workday-paper) !important;
          border-color: var(--workday-line) !important;
        }
        html.kyr-workday .kyr-home-page .trust-title,
        html.kyr-workday .kyr-home-page .final-title {
          color: var(--workday-ink) !important;
          font-family: var(--font-serif) !important;
        }
        html.kyr-workday .kyr-home-page .trust-copy,
        html.kyr-workday .kyr-home-page .final-copy,
        html.kyr-workday .kyr-home-page .quiz-facts,
        html.kyr-workday .kyr-home-page .method-link {
          color: var(--workday-muted) !important;
        }
        html.kyr-workday .kyr-home-page .final-panel {
          background: var(--workday-surface) !important;
          border-color: var(--workday-line) !important;
          box-shadow: var(--workday-shadow) !important;
        }
        html.kyr-workday .kyr-home-page .final-panel .primary-cta {
          color: var(--workday-paper) !important;
        }

        .home-shell { width: min(1120px, calc(100% - 40px)); margin: 0 auto; }

        .hero-section {
          position: relative;
          isolation: isolate;
          padding: clamp(96px, 10vw, 132px) 0 clamp(54px, 7vw, 86px);
        }

        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 18%, rgba(70, 216, 255, 0.18), transparent 31%),
            radial-gradient(circle at 78% 22%, rgba(139, 92, 255, 0.20), transparent 34%),
            linear-gradient(135deg, #06131b 0%, #050712 45%, #10051a 100%);
        }

        .hero-section::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          opacity: 0.28;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 76px 76px;
          mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.65) 72%, transparent 100%);
        }

        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 0.78fr);
          align-items: center;
          gap: clamp(32px, 6vw, 74px);
        }

        .eyebrow {
          margin: 0 0 14px;
          color: #aeefff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .hero-title {
          max-width: 690px;
          margin: 0;
          color: #f8fbff !important;
          font-size: clamp(3.15rem, 6vw, 5.55rem);
          line-height: 0.9;
          letter-spacing: -0.076em;
          font-weight: 950;
        }

        .hero-subtitle {
          max-width: 580px;
          margin: 20px 0 0;
          color: rgba(248,251,255,0.76);
          font-size: clamp(1rem, 1.5vw, 1.15rem);
          line-height: 1.52;
          font-weight: 620;
          letter-spacing: -0.018em;
        }

        .primary-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          margin-top: 24px;
          padding: 0 30px;
          border-radius: 999px;
          background: linear-gradient(135deg, #48dcff, #7657ff 58%, #ff5de4);
          color: #fff;
          text-decoration: none;
          font-size: 15.5px;
          font-weight: 950;
          letter-spacing: -0.01em;
          box-shadow: 0 18px 48px rgba(70,216,255,0.22), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .primary-cta:hover { transform: translateY(-2px); box-shadow: 0 22px 58px rgba(139,92,255,0.32), inset 0 1px 0 rgba(255,255,255,0.44); }
        .primary-cta:focus-visible, .method-link:focus-visible, .footer-links a:focus-visible { outline: 3px solid #8deaff; outline-offset: 4px; }

        .quiz-facts {
          margin: 14px 0 0;
          color: rgba(248,251,255,0.62);
          font-size: 13px;
          font-weight: 750;
          letter-spacing: -0.01em;
        }

        .result-preview { min-width: 0; }
        .preview-label {
          display: block;
          margin: 0 0 10px;
          color: rgba(174,239,255,0.88);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .sample-card {
          position: relative;
          overflow: hidden;
          padding: clamp(18px, 2.6vw, 26px);
          border: 1px solid rgba(255,255,255,0.17);
          border-radius: 30px;
          background:
            radial-gradient(circle at 88% 8%, rgba(70,216,255,0.22), transparent 31%),
            radial-gradient(circle at 2% 96%, rgba(255,93,228,0.14), transparent 37%),
            linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045));
          box-shadow: 0 30px 100px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16);
          backdrop-filter: blur(26px);
        }

        .sample-card > * { position: relative; z-index: 1; }
        .sample-type {
          display: inline-flex;
          padding: 7px 11px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 999px;
          background: rgba(255,255,255,0.07);
          color: rgba(248,251,255,0.72);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .sample-title {
          margin: 16px 0 18px;
          color: #fff;
          font-size: clamp(2.5rem, 4.8vw, 3.65rem);
          line-height: 0.88;
          letter-spacing: -0.075em;
          font-weight: 950;
        }

        .role-preview {
          padding: 16px;
          border-radius: 20px;
          background: rgba(246,227,198,0.92);
          color: #15100d;
        }

        .role-preview small {
          display: block;
          color: rgba(74,54,28,0.64);
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .role-preview h3 { margin: 5px 0 7px; color: #15100d; font-size: clamp(1.2rem, 2vw, 1.45rem); line-height: 1; letter-spacing: -0.04em; font-weight: 950; }
        .role-preview p { margin: 0; color: rgba(21,16,13,0.72); font-size: 12px; line-height: 1.4; font-weight: 720; }

        .result-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin: 14px 0 0;
          padding: 0;
          list-style: none;
        }
        .result-list li {
          padding: 9px 10px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          background: rgba(3,4,13,0.28);
          color: rgba(248,251,255,0.78);
          font-size: 11px;
          line-height: 1.28;
          font-weight: 760;
        }

        .trust-section {
          padding: clamp(48px, 7vw, 84px) 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(180deg, #03040d, #070817 52%, #03040d);
        }
        .trust-panel {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(260px, 0.58fr);
          gap: clamp(28px, 6vw, 76px);
          align-items: end;
        }
        .trust-title { max-width: 620px; margin: 0; color: #fff; font-size: clamp(2rem, 4vw, 3.65rem); line-height: 0.94; letter-spacing: -0.06em; font-weight: 950; }
        .trust-copy { margin: 0; color: rgba(248,251,255,0.66); font-size: 15px; line-height: 1.58; font-weight: 650; }
        .method-link { display: inline-flex; margin-top: 16px; color: #aeefff; font-size: 14px; font-weight: 900; text-underline-offset: 4px; }

        .final-section { padding: clamp(48px, 7vw, 82px) 0; background: #03040d; }
        .final-panel {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: clamp(24px, 4vw, 42px);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(70,216,255,0.12), rgba(139,92,255,0.10), rgba(255,93,228,0.10));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);
        }
        .final-title { margin: 0; color: #fff; font-size: clamp(1.75rem, 3.5vw, 3rem); line-height: 0.96; letter-spacing: -0.06em; font-weight: 950; }
        .final-copy { margin: 9px 0 0; color: rgba(248,251,255,0.67); font-size: 14px; line-height: 1.45; font-weight: 650; }
        .final-panel .primary-cta { margin: 0; flex: 0 0 auto; }

        .home-footer { padding: 24px 0; border-top: 1px solid rgba(255,255,255,0.08); color: rgba(248,251,255,0.46); font-size: 12px; }
        .footer-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px 18px; }
        .footer-links { display: flex; flex-wrap: wrap; gap: 14px; }
        .footer-links a { color: rgba(248,251,255,0.52); text-decoration: none; }
        .footer-links a:hover { color: #8deaff; }

        @media (max-width: 860px) {
          .hero-grid, .trust-panel { grid-template-columns: 1fr; }
          .hero-section { padding-top: 94px; }
          .result-preview { max-width: 560px; }
        }

        @media (max-width: 640px) {
          .home-shell { width: min(100% - 28px, 1120px); }
          .hero-section { padding: 86px 0 48px; }
          .hero-title { font-size: clamp(2.78rem, 13.5vw, 3.8rem); }
          .hero-subtitle { font-size: 0.98rem; }
          .primary-cta { width: 100%; }
          .quiz-facts { line-height: 1.55; }
          .sample-card { border-radius: 24px; }
          .result-list { grid-template-columns: 1fr; }
          .trust-section, .final-section { padding: 46px 0; }
          .final-panel { align-items: stretch; border-radius: 24px; }
          .final-panel .primary-cta { width: 100%; }
        }
      `}</style>

      <AppHeader />

      <main>
        <section className="hero-section" aria-labelledby="home-hero-title">
          <div className="home-shell hero-grid">
            <div>
              <p className="eyebrow">Free personality quiz for work style &amp; career fit</p>
              <h1 id="home-hero-title" className="hero-title">
                Discover your work style, uncover your strengths, and find career paths to explore next.
              </h1>
              <p className="hero-subtitle">
                A private, 28-question personality quiz that combines Big Five traits, MBTI-style patterns, and DISC work behavior into one practical result.
              </p>
              <a className="primary-cta" href="/quiz">Take the free quiz</a>
              <p className="quiz-facts">28 questions · Private by default · No account required</p>
            </div>

            <aside className="result-preview" aria-label="Example KnowYouRole result">
              <span className="preview-label">An example of your result</span>
              <div className="sample-card">
                <span className="sample-type">INTJ-style pattern</span>
                <h2 className="sample-title">Systems<br />Builder</h2>
                <div className="role-preview">
                  <small>Best-fit role direction</small>
                  <h3>Strategic Analyst</h3>
                  <p>Explore the environments, problems, and working patterns that may fit you best.</p>
                </div>
                <ul className="result-list" aria-label="Result contents">
                  <li>Your work style and strengths</li>
                  <li>Likely friction points</li>
                  <li>Roles and environments to explore</li>
                  <li>One next experiment to try</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="trust-section model-section" aria-labelledby="trust-title">
          <div className="home-shell trust-panel">
            <div>
              <p className="eyebrow">Grounded in multiple lenses</p>
              <h2 id="trust-title" className="trust-title section-title">A practical read, not a verdict on who you are.</h2>
            </div>
            <div>
              <p className="trust-copy section-copy">
                KnowYouRole brings together Big Five trait language, familiar MBTI-style patterns, and DISC-style work behavior. It is built for reflection and role exploration—not diagnosis, hiring, or predicting your future.
              </p>
              <a className="method-link" href="/methodology">Read the methodology</a>
            </div>
          </div>
        </section>

        <section className="final-section testimonial-section" aria-labelledby="final-title">
          <div className="home-shell">
            <div className="final-panel testimonial-card">
              <div>
                <h2 id="final-title" className="final-title section-title">Get a useful starting point in 28 questions.</h2>
                <p className="final-copy section-copy">Private by default. No account required.</p>
              </div>
              <a className="primary-cta" href="/quiz">Take the free quiz</a>
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
