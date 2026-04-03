import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import AuthErrorBoundary from '../components/AuthErrorBoundary';
import AuthFormEmbedded from '../components/AuthFormEmbedded';

// -------------------------------------------------------------------
// Root -- wraps everything in the error boundary
// -------------------------------------------------------------------
export default function AuthPage() {
  return (
    <AuthErrorBoundary>
      <AuthPageChrome />
    </AuthErrorBoundary>
  );
}

// -------------------------------------------------------------------
// Page chrome -- header + footer + background
// -------------------------------------------------------------------
function AuthPageChrome() {
  return (
    <div className='auth-page-root'>
      {/* Background effects */}
      <div className='bg-gradient-ball' />
      <div className='bg-gradient-ball-2' />
      <div className='bg-grid-overlay' />

      {/* Header */}
      <header className='site-header' style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className='header-inner'>
          <a href='/' className='header-logo-link'>
            <div className='logo-text'>KnowYourRole<span className='logo-dot'>.</span></div>
          </a>
          <nav className='header-nav'>
            <a href='/' className='nav-link'>Home</a>
            <a href='/about' className='nav-link'>About</a>
            <a href='/faq' className='nav-link'>FAQ</a>
            <a href='/feedback' className='nav-link'>Feedback</a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <AuthFormEmbedded />
      </main>

      <style>{`
        .auth-page-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #050510;
          position: relative;
          overflow: hidden;
        }
        .bg-gradient-ball {
          position: fixed;
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(120,0,255,0.15) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .bg-gradient-ball-2 {
          position: fixed;
          bottom: -250px; right: -150px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .bg-grid-overlay {
          position: fixed; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }
        .site-header {
          position: relative; z-index: 10;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .header-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 0 24px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .header-logo-link { text-decoration: none; }
        .logo-text {
          font-family: 'Outfit', sans-serif; font-size: 20px;
          font-weight: 800; color: #fff; letter-spacing: -0.3px;
        }
        .logo-dot { color: #7800FF; }
        .header-nav { display: flex; align-items: center; gap: 28px; }
        .nav-link {
          font-family: 'Outfit', sans-serif; font-size: 14px;
          font-weight: 500; color: rgba(255,255,255,0.5);
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: rgba(255,255,255,0.85); }
      `}</style>
    </div>
  );
}
