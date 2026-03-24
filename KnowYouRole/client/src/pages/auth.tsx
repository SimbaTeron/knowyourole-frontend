import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth0 } from '@auth0/auth0-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { NeonButton } from '@/components/glass/NeonButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  if (isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin + '/callback',
        },
      });
    } catch {
      // Auth0 will handle errors
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin + '/callback',
          connection: 'google-oauth2',
        },
      });
    } catch {
      // Auth0 will handle errors
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <AnimatedBackground />

      {/* LEFT: Branding Panel */}
      <div className="hidden md:flex w-1/2 relative z-10 flex-col items-center justify-center p-12">
        <div className="text-3xl font-black tracking-tight mb-6">
          Know<span className="text-gradient">You</span>Role
        </div>

        <p className="text-lg text-white/50 mb-12 text-center">
          Your personality, decoded.
        </p>

        {/* Animated Preview Circle */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, rgba(123,47,255,0.1) 50%, transparent 70%)',
            border: '1px solid rgba(255,255,255,0.08)',
            animation: 'pulseRing 3s ease-in-out infinite',
          }}
        >
          <style>{`
            @keyframes pulseRing {
              0%, 100% { box-shadow: 0 0 0 0 rgba(0,212,255,0.3), 0 0 40px rgba(123,47,255,0.1); }
              50% { box-shadow: 0 0 0 20px rgba(0,212,255,0), 0 0 60px rgba(123,47,255,0.2); }
            }
          `}</style>
          <div
            className="flex flex-col items-center justify-center"
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-4xl font-black text-gradient" style={{ fontFamily: 'Syne, sans-serif' }}>
              INTJ
            </span>
            <span className="text-sm text-white/40 font-medium">The Architect</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-12 mt-12">
          {[
            { val: '2.4M+', label: 'Quizzes Taken' },
            { val: '4.9★', label: 'Average Rating' },
            { val: '3 min', label: 'Average Quiz' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-gradient">{val}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Auth Form */}
      <div className="w-full md:w-1/2 relative z-10 flex items-center justify-center p-6 md:p-12">
        <GlassCard className="w-full max-w-md p-8 md:p-10">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <div className="text-2xl font-black tracking-tight">
              Know<span className="text-gradient">You</span>Role
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-2 p-1 rounded-full mb-8 glass">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-semibold transition-all border-0 cursor-pointer ${
                  mode === m
                    ? 'text-black shadow-lg'
                    : 'text-white/40 hover:text-white/70'
                }`}
                style={mode === m ? {
                  background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
                  boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
                } : {}}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <GlassInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <GlassInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full mt-6 flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl transition-all border cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#fff" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#fff" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#fff" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#fff" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            {/* Or Divider */}
            <div className="flex items-center gap-3 my-6 text-white/30 text-xs">
              <div className="flex-1 h-px bg-white/10" />
              <span>or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <NeonButton type="submit" fullWidth size="lg" disabled={isLoading}>
              {mode === 'signin' ? 'Sign In' : 'Get Started →'}
            </NeonButton>
          </form>

          {mode === 'signin' && (
            <Link
              href="#"
              className="block text-center mt-4 text-sm font-semibold"
              style={{ color: '#00D4FF' }}
            >
              Forgot password?
            </Link>
          )}

          <p className="text-center text-xs text-white/30 mt-5 leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="hover:underline" style={{ color: '#00D4FF' }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="hover:underline" style={{ color: '#00D4FF' }}>
              Privacy Policy
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
