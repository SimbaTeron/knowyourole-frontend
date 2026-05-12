'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateHeader = () => {
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - lastScrollY.current;

      setScrolled(currentY > 16);

      if (currentY < 80) {
        setHidden(false);
      } else if (delta > 8) {
        setHidden(true);
      } else if (delta < -8) {
        setHidden(false);
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    };

    updateHeader();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      aria-label="Primary site navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: 'calc(10px + env(safe-area-inset-top, 0px)) clamp(14px, 4vw, 24px) 0',
        transform: hidden ? 'translateY(calc(-100% - 18px))' : 'translateY(0)',
        transition: 'transform 260ms ease, opacity 260ms ease',
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          minHeight: scrolled ? 52 : 56,
          padding: scrolled ? '8px 10px 8px 14px' : '10px 10px 10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          borderRadius: scrolled ? 999 : 24,
          background: scrolled ? 'rgba(5,5,16,0.72)' : 'rgba(5,5,16,0.18)',
          border: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled ? '0 18px 60px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          transition: 'min-height 260ms ease, padding 260ms ease, border-radius 260ms ease, background 260ms ease, border-color 260ms ease, box-shadow 260ms ease',
        }}
      >
        <Link href="/" aria-label="KnowYouRole home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}>
          <div
            aria-hidden="true"
            style={{
              width: scrolled ? 32 : 36,
              height: scrolled ? 32 : 36,
              borderRadius: scrolled ? 999 : 12,
              background: 'linear-gradient(135deg, #00C8FF, #7800FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 28px rgba(0,200,255,0.28)',
              transition: 'width 260ms ease, height 260ms ease, border-radius 260ms ease',
              flex: '0 0 auto',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <span
            style={{
              fontSize: scrolled ? 16 : 18,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#fff',
              fontFamily: "'Outfit',sans-serif",
              whiteSpace: 'nowrap',
              transition: 'font-size 260ms ease',
            }}
          >
            KnowYouRole
          </span>
        </Link>

        <Link
          href="/quiz-gateway"
          aria-label="Start the free KnowYouRole quiz"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 40,
            padding: '10px clamp(14px, 4vw, 22px)',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: '-0.01em',
            background: 'linear-gradient(90deg, #00C8FF, #7800FF)',
            color: '#fff',
            cursor: 'pointer',
            textDecoration: 'none',
            fontFamily: "'Outfit',sans-serif",
            boxShadow: scrolled ? '0 0 26px rgba(0,200,255,0.34)' : '0 0 18px rgba(0,200,255,0.24)',
            border: '1px solid rgba(255,255,255,0.16)',
            whiteSpace: 'nowrap',
            transition: 'box-shadow 260ms ease, transform 180ms ease',
          }}
        >
          Take Quiz
        </Link>
      </div>
    </header>
  );
}
