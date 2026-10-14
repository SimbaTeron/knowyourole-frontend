'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/** Primary public navigation. The compact shape is intentional: it stays useful
 * without competing with the page’s editorial headline. */
export function AppHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateHeader = () => {
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastScrollY.current;
      setScrolled(y > 16);
      setHidden(y >= 80 && delta > 8);
      if (y < 80 || delta < -8) setHidden(false);
      lastScrollY.current = y;
      ticking.current = false;
    };
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    };
    updateHeader();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      aria-label="Primary site navigation"
      className={`workday-header${scrolled ? ' is-scrolled' : ''}${hidden ? ' is-hidden' : ''}`}
    >
      <div className="workday-header__bar">
        <Link href="/" aria-label="KnowYouRole home" className="workday-header__brand">
          <span className="workday-header__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 3.5v17M3.5 12h17" />
            </svg>
          </span>
          <span>KnowYouRole</span>
        </Link>
        <nav className="workday-header__links" aria-label="Explore KnowYouRole">
          <Link href="/careers">Career paths</Link>
          <Link href="/learn">Learn</Link>
          <Link href="/methodology">Method</Link>
        </nav>
        <Link href="/quiz" className="workday-header__cta" aria-label="Start the free KnowYouRole quiz">
          Take the quiz <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
