import { useState } from 'react';
import { Link } from 'wouter';

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== 'undefined' && !scrolled) {
    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 20);
    }, { once: true });
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(0,0,0,0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00C8FF, #7800FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>KnowYouRole</span>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="/quiz" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: "'Outfit',sans-serif", transition: 'color 0.2s' }}>Quiz</a>
          <a href="/about" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: "'Outfit',sans-serif", transition: 'color 0.2s' }}>About</a>
          <a href="/faq" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: "'Outfit',sans-serif", transition: 'color 0.2s' }}>FAQ</a>
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/auth" style={{
            padding: '10px 20px', borderRadius: 50, fontWeight: 600, fontSize: 14,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', cursor: 'pointer', textDecoration: 'none', fontFamily: "'Outfit',sans-serif",
          }}>
            Sign In
          </a>
          <a href="/quiz" style={{
            padding: '10px 20px', borderRadius: 50, fontWeight: 700, fontSize: 14,
            background: 'linear-gradient(90deg, #00C8FF, #7800FF)', border: 'none',
            color: '#fff', cursor: 'pointer', textDecoration: 'none', fontFamily: "'Outfit',sans-serif",
            boxShadow: '0 0 20px rgba(0,200,255,0.3)',
          }}>
            Start Free
          </a>
        </div>
      </div>
    </header>
  );
}
