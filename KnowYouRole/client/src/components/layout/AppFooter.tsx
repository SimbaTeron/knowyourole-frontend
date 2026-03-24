import { Link } from 'wouter';

export function AppFooter() {
  return (
    <footer className="relative z-10 bg-black/40 border-t border-white/6 px-6 py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <span className="font-display font-bold text-white">KnowYouRole</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed">
              Personality science made accessible, fun, and genuinely useful.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <div className="space-y-3">
              <Link href="/quiz" className="block text-white/40 text-sm hover:text-white transition no-underline">Free Assessment</Link>
              <Link href="/about" className="block text-white/40 text-sm hover:text-white transition no-underline">How It Works</Link>
              <Link href="/careers" className="block text-white/40 text-sm hover:text-white transition no-underline">Career Matching</Link>
              <Link href="/results" className="block text-white/40 text-sm hover:text-white transition no-underline">Premium Features</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <div className="space-y-3">
              <Link href="/about" className="block text-white/40 text-sm hover:text-white transition no-underline">About</Link>
              <Link href="/about" className="block text-white/40 text-sm hover:text-white transition no-underline">Science</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <div className="space-y-3">
              <Link href="/privacy" className="block text-white/40 text-sm hover:text-white transition no-underline">Privacy Policy</Link>
              <Link href="/terms" className="block text-white/40 text-sm hover:text-white transition no-underline">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/30 text-sm">© 2026 KnowYouRole. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white/30 hover:text-white transition">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
