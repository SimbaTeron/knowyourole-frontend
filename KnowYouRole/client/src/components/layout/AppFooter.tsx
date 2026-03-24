import { Link } from 'wouter';

export function AppFooter() {
  const linkStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    marginBottom: 12,
    textDecoration: 'none',
    fontFamily: "'Outfit',sans-serif",
    transition: 'color 0.2s',
  };

  const hoverLinkStyle: React.CSSProperties = {
    ...linkStyle,
    color: 'rgba(255,255,255,0.9)',
  };

  return (
    <footer style={{
      position: 'relative', zIndex: 10,
      background: 'rgba(0,0,0,0.4)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: 'clamp(40px, 8vw, 64px) clamp(16px, 4vw, 48px)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 48,
          marginBottom: 48,
        }}>
          {/* Logo & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #00C8FF, #7800FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>KnowYouRole</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, fontFamily: "'Outfit',sans-serif" }}>
              Personality science made accessible, fun, and genuinely useful.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14, fontFamily: "'Outfit',sans-serif" }}>Product</h4>
            <div>
              <Link href="/quiz" style={linkStyle} activeClassName="" onMouseEnter={e => Object.assign((e.target as HTMLElement).style, hoverLinkStyle)} onMouseLeave={e => Object.assign((e.target as HTMLElement).style, linkStyle)}>Free Assessment</Link>
              <Link href="/about" style={linkStyle} activeClassName="" onMouseEnter={e => Object.assign((e.target as HTMLElement).style, hoverLinkStyle)} onMouseLeave={e => Object.assign((e.target as HTMLElement).style, linkStyle)}>How It Works</Link>
              <Link href="/careers" style={linkStyle} activeClassName="" onMouseEnter={e => Object.assign((e.target as HTMLElement).style, hoverLinkStyle)} onMouseLeave={e => Object.assign((e.target as HTMLElement).style, linkStyle)}>Career Matching</Link>
              <Link href="/results" style={linkStyle} activeClassName="" onMouseEnter={e => Object.assign((e.target as HTMLElement).style, hoverLinkStyle)} onMouseLeave={e => Object.assign((e.target as HTMLElement).style, linkStyle)}>Premium Features</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14, fontFamily: "'Outfit',sans-serif" }}>Company</h4>
            <div>
              <Link href="/about" style={linkStyle} activeClassName="" onMouseEnter={e => Object.assign((e.target as HTMLElement).style, hoverLinkStyle)} onMouseLeave={e => Object.assign((e.target as HTMLElement).style, linkStyle)}>About</Link>
              <Link href="/about" style={linkStyle} activeClassName="" onMouseEnter={e => Object.assign((e.target as HTMLElement).style, hoverLinkStyle)} onMouseLeave={e => Object.assign((e.target as HTMLElement).style, linkStyle)}>Science</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14, fontFamily: "'Outfit',sans-serif" }}>Legal</h4>
            <div>
              <Link href="/privacy" style={linkStyle} activeClassName="" onMouseEnter={e => Object.assign((e.target as HTMLElement).style, hoverLinkStyle)} onMouseLeave={e => Object.assign((e.target as HTMLElement).style, linkStyle)}>Privacy Policy</Link>
              <Link href="/terms" style={linkStyle} activeClassName="" onMouseEnter={e => Object.assign((e.target as HTMLElement).style, hoverLinkStyle)} onMouseLeave={e => Object.assign((e.target as HTMLElement).style, linkStyle)}>Terms of Service</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 32,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit',sans-serif" }}>© 2026 KnowYouRole. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s', display: 'flex' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
