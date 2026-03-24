import { Link } from "wouter";
import { PageContainer } from "../components/layout/PageContainer";
import { AppHeader } from "../components/layout/AppHeader";
import { GlassCard } from "../components/glass/GlassCard";
import { NeonButton } from "../components/glass/NeonButton";
import { GlassBadge } from "../components/glass/GlassBadge";
import { useAuth } from "../hooks/useAuth";

const FEATURES = [
  {
    emoji: "🎯",
    title: "Precision Insights",
    description: "Deep psychological analysis based on the Big Five model — the gold standard in personality science.",
  },
  {
    emoji: "🧠",
    title: "Mood Alchemy Lab",
    description: "Track how your emotions shift and blend across different situations and environments.",
  },
  {
    emoji: "💼",
    title: "Career Compass",
    description: "Discover roles where your natural traits translate into satisfaction and success.",
  },
  {
    emoji: "🎮",
    title: "Quizzes That Don't Suck",
    description: "Say goodbye to boring quizzes. Ours are engaging, beautiful, and actually fun.",
  },
  {
    emoji: "🔒",
    title: "Privacy First",
    description: "Your results are yours. Always. We never sell data or share anything without permission.",
  },
  {
    emoji: "⚡",
    title: "Instant Results",
    description: "Get your full personality breakdown in under 10 minutes. No waiting, no surveys.",
  },
];

const TESTIMONIALS = [
  {
    name: "Jordan M.",
    role: "Software Engineer at Stripe",
    quote: "Finally a quiz that actually gets me. The career suggestions were spot-on.",
    initials: "JM",
    color: "from-[#00D4FF] to-[#7B2FFF]",
  },
  {
    name: "Aaliyah T.",
    role: "Product Designer at Figma",
    quote: "The mood tracking is addictive. I've learned so much about myself.",
    initials: "AT",
    color: "from-[#7B2FFF] to-[#FF00E5]",
  },
  {
    name: "Marcus R.",
    role: "Medical Student, NYU",
    quote: "Took it for fun, stayed for the science. Incredibly accurate.",
    initials: "MR",
    color: "from-[#FF00E5] to-[#00D4FF]",
  },
];

const STATS = [
  { num: "2M+", label: "Assessments" },
  { num: "4.9★", label: "Avg Rating" },
  { num: "3 min", label: "Avg Quiz" },
  { num: "100%", label: "Private" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        
        .font-outfit * {
          font-family: 'Outfit', sans-serif;
        }
        
        .hero-gradient {
          background: linear-gradient(90deg, #00C8FF, #7800FF, #FF00E5);
          background-size: 400% 400%;
          animation: gradientShift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 200, 255, 0.3);
          transform: translateY(-4px);
        }
      `}</style>

      <PageContainer padded={false} className="font-outfit">
        <AppHeader />

        {/* Hero Section */}
        <section
          className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-24 pb-16"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(120,0,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,200,255,0.1) 0%, transparent 50%)",
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left: Hero Content */}
              <div className="flex-1 max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-[rgba(0,200,255,0.1)] border border-[rgba(0,200,255,0.3)] px-4 py-1.5 rounded-full text-xs font-semibold text-[#00C8FF] mb-6">
                  ✦ 100% Free — No Account Needed
                </div>

                {/* Headline */}
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.95] tracking-[-0.04em] mb-6"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Find out
                  <br />
                  who you{" "}
                  <span className="hero-gradient">really</span>
                  <br />
                  are.
                </h1>

                {/* Subtitle */}
                <p
                  className="text-base sm:text-lg text-white/60 leading-relaxed mb-8 max-w-lg"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  The Gen Z personality quiz. Combined Big Five, MBTI, and DISC into one
                  wild ride. Know yourself. Own your energy.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3">
                  <NeonButton
                    variant="primary"
                    size="lg"
                    onClick={() => (window.location.href = "/quiz")}
                    className="rounded-2xl"
                    style={{
                      background: "linear-gradient(90deg, #00C8FF, #7800FF)",
                      boxShadow: "0 0 30px rgba(0,200,255,0.4)",
                    }}
                  >
                    Take the Quiz — It's Free →
                  </NeonButton>
                  <NeonButton
                    variant="secondary"
                    size="lg"
                    onClick={() => (window.location.href = "/about")}
                    className="rounded-2xl"
                  >
                    Learn More
                  </NeonButton>
                </div>
              </div>

              {/* Right: Phone Stack */}
              <div className="flex-1 flex justify-center lg:justify-end">
                <div className="relative w-[260px] sm:w-[280px]">
                  {/* Phone Card 1 */}
                  <div className="relative bg-[rgba(255,255,255,0.06)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-6 z-10"
                    style={{ transform: "rotate(3deg)" }}>
                    <p className="text-xs font-bold text-white/60 mb-1">Your Type</p>
                    <p
                      className="text-4xl font-black hero-gradient mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      INTJ-A
                    </p>
                    <p className="text-sm font-bold text-[#00C8FF]">The Architect</p>
                    <p className="text-xs text-white/40 mt-1">12.4% of population</p>
                  </div>

                  {/* Phone Card 2 */}
                  <div
                    className="absolute top-4 -right-2 sm:top-5 sm:-right-4 bg-[rgba(255,255,255,0.06)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-6 z-9"
                    style={{ transform: "rotate(-2deg)" }}
                  >
                    <p className="text-xs font-bold text-white/60 mb-1">Big Five</p>
                    <p className="text-sm font-black text-white leading-tight">
                      O: 78% C: 85%
                      <br />
                      E: 42% A: 61%
                      <br />
                      N: 28%
                    </p>
                    <p className="text-xs text-white/40 mt-2 leading-tight">
                      Openness, Conscientiousness
                      <br />
                      Extraversion, Agreeableness
                      <br />
                      Neuroticism
                    </p>
                  </div>

                  {/* Phone Card 3 */}
                  <div
                    className="absolute top-8 -right-4 sm:top-10 sm:-right-8 bg-[rgba(255,255,255,0.06)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-6 z-8"
                    style={{ transform: "rotate(1deg)" }}
                  >
                    <p className="text-xs font-bold text-white/60 mb-1">DISC Profile</p>
                    <p
                      className="text-3xl font-black hero-gradient mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      DC
                    </p>
                    <p className="text-sm font-bold text-[#00C8FF]">The Challenger</p>
                    <p className="text-xs text-white/40 mt-1">
                      High dominance, high conscientiousness
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section
          className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10 border-y border-white/10"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center py-8 sm:py-10 px-4">
              <p
                className="text-2xl sm:text-3xl lg:text-4xl font-black hero-gradient mb-1"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {stat.num}
              </p>
              <p className="text-xs text-white/40 font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-14">
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase text-[#00C8FF] mb-3"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Why KnowYouRole
              </p>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-white"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Not your average personality quiz.
              </h2>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature) => (
                <GlassCard
                  key={feature.title}
                  variant="interactive"
                  className="cursor-pointer"
                  glowColor="blue"
                >
                  <div
                    className="w-12 h-12 rounded-2xl bg-[rgba(0,200,255,0.15)] border border-[rgba(0,200,255,0.2)] flex items-center justify-center text-2xl mb-4"
                  >
                    {feature.emoji}
                  </div>
                  <h3
                    className="text-lg font-bold text-white mb-2"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm text-white/50 leading-relaxed"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {feature.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12"
          style={{ background: "linear-gradient(180deg, transparent, rgba(120,0,255,0.05))" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase text-[#00C8FF] mb-3"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                What People Say
              </p>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-white"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Real people, real insights.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <GlassCard key={t.name} variant="default">
                  <p
                    className="text-sm text-white/60 leading-relaxed mb-6 italic"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold text-white"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-xs text-white/40"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {t.role}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Stop scrolling.
              <br />
              <span className="hero-gradient">Start knowing.</span>
            </h2>
            <p
              className="text-base text-white/50 mb-10"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              2.4 million people already know who they are. Your turn.
            </p>
            <NeonButton
              variant="primary"
              size="lg"
              onClick={() => (window.location.href = "/quiz")}
              style={{
                background: "linear-gradient(90deg, #00C8FF, #7800FF)",
                padding: "16px 36px",
                fontSize: "1rem",
                borderRadius: "16px",
                boxShadow: "0 0 40px rgba(0,200,255,0.4)",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Take the Free Quiz →
            </NeonButton>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="px-6 lg:px-12 py-8 border-t border-white/10 flex flex-wrap gap-3 justify-between text-xs text-white/30"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <span>© 2026 KnowYouRole</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/60 transition-colors no-underline">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white/60 transition-colors no-underline">
              Terms
            </Link>
            <span>·</span>
            <Link href="/faq" className="hover:text-white/60 transition-colors no-underline">
              FAQ
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-white/60 transition-colors no-underline">
              About
            </Link>
          </div>
        </footer>
      </PageContainer>
    </>
  );
}
