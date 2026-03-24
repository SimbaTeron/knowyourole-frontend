import { useState } from 'react';
import { Link } from 'wouter';
import { NeonButton } from '../glass/NeonButton';

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener
  if (typeof window !== 'undefined' && !scrolled) {
    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 20);
    }, { once: true });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/60 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="container flex-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white">KnowYouRole</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/quiz" className="text-white/60 hover:text-white text-sm font-medium transition-colors no-underline">Quiz</Link>
          <Link href="/about" className="text-white/60 hover:text-white text-sm font-medium transition-colors no-underline">About</Link>
          <Link href="/faq" className="text-white/60 hover:text-white text-sm font-medium transition-colors no-underline">FAQ</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <NeonButton variant="ghost" className="text-sm">Sign In</NeonButton>
          <NeonButton variant="primary" className="text-sm">Start Free</NeonButton>
        </div>
      </div>
    </header>
  );
}
