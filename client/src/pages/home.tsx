import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass, Brain, Briefcase, Gift, UserCheck, ClipboardList, BarChart3, FlaskConical, Quote, Shield, User, Target, TrendingUp, Lightbulb, Eye } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import KnowRoleHeader from "@/components/KnowRoleHeader";
import AgeTierSelector from "@/components/AgeTierSelector";
import { ThemeMode } from "@/components/ThemeToggle";

const ROTATING_TAGLINES = [
  { text: "What career fits your brain?", icon: "compass" },
  { text: "What makes you... you?", icon: "sparkle" },
  { text: "Discover your hidden traits", icon: "compass" },
  { text: "Find your hidden superpowers", icon: "sparkle" },
];

const FEATURES = [
  { icon: Brain, label: "3 Test Types", description: "Big Five, MBTI & DISC", color: "text-[#A78BFA]" },
  { icon: Briefcase, label: "Career Matching", description: "150+ matched roles", color: "text-[#67E8F9]" },
  { icon: Gift, label: "100% Free", description: "No sign-up required", color: "text-[#34D399]" },
];

const STEPS = [
  { icon: UserCheck, step: "1", title: "Choose Your Age", description: "Pick the tier that fits you" },
  { icon: ClipboardList, step: "2", title: "Take the Quiz", description: "Answer fun, quick questions" },
  { icon: BarChart3, step: "3", title: "Get Results", description: "Explore your personality & careers" },
];

const TESTIMONIALS = [
  {
    quote: "I had no idea my personality traits pointed toward UX design. This tool helped me see a career path I never would have considered on my own.",
    author: "Jordan, 22",
    role: "College Senior",
    icon: UserCheck,
  },
  {
    quote: "At 34, I was stuck in accounting and miserable. My results showed high Openness and Extraversion — now I'm exploring product management. Wish I'd found this sooner.",
    author: "Marcus, 34",
    role: "Career Changer",
    icon: TrendingUp,
  },
  {
    quote: "My 15-year-old took the quiz and it opened up a real conversation about her strengths. She's already looking into the career paths it suggested.",
    author: "Maria, Parent",
    role: "of a teenager",
    icon: User,
  },
  {
    quote: "The DISC breakdown was spot on. I shared my results with my study group and now we actually understand why we clash on projects.",
    author: "Priya, 20",
    role: "Engineering Student",
    icon: Target,
  },
];

const SCIENCE_HIGHLIGHTS = [
  {
    icon: Brain,
    title: "Big Five (OCEAN)",
    description: "The gold standard in personality psychology, backed by decades of peer-reviewed research."
  },
  {
    icon: Compass,
    title: "MBTI-Inspired",
    description: "Understand your cognitive preferences through 16 personality types rooted in Jungian theory."
  },
  {
    icon: Briefcase,
    title: "DISC Behavioral",
    description: "Professional-grade behavioral insights used in career coaching and team development."
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [ageTier, setAgeTier] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
      return stored === "light" ? "light" : "dark";
    }
    return "dark";
  });
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    if (theme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
    }, 1970);
    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("knowrole-theme", newTheme);
    
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  };

  const handleTierSelect = (tierId: string) => {
    setAgeTier(tierId);
  };

  const handleConfirmJourney = () => {
    if (!ageTier) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("knowrole-") && key !== "knowrole-theme") {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("knowrole-")) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    sessionStorage.setItem("knowrole-tier", ageTier);
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    setLocation("/mood-mixer");
  };

  const getThemeClass = () => {
    return theme === "dark" ? "dark-mysterious" : "light-clinical";
  };

  return (
    <div className={`min-h-screen grain-overlay ${getThemeClass()}`}>
      <PathCanvas />
      <KnowRoleHeader 
        theme={theme} 
        onThemeChange={handleThemeChange} 
      />
      <main className="relative z-10 flex flex-col items-center px-5 pt-16 pb-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8"
          >
            <h1
              className="text-[1.75rem] md:text-4xl font-display font-bold text-warm-gray dark:text-[#F8FAFC] mb-2 md:mb-3 leading-tight"
              data-testid="text-hero-headline"
            >
              Discover Your <span className="italic text-terracotta dark:text-[#A78BFA]">True</span> Potential
            </h1>
            <p
              className="text-sm md:text-base text-warm-gray/70 dark:text-[#94A3B8]"
              data-testid="text-hero-subtext"
            >
              Science-backed personality insights and career matching in minutes
            </p>
          </motion.div>

          <div className="text-center mb-6 md:mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="h-[44px] md:h-[52px] flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={taglineIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex items-center justify-center gap-2.5"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="flex-shrink-0"
                    >
                      {ROTATING_TAGLINES[taglineIndex].icon === "sparkle" ? (
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-terracotta dark:text-[#A78BFA]" />
                      ) : (
                        <Compass className="w-4 h-4 md:w-5 md:h-5 text-sage-green dark:text-[#67E8F9]" />
                      )}
                    </motion.div>
                    <p
                      className="text-base md:text-xl font-medium text-warm-gray dark:text-soft-cream"
                      data-testid="text-subtitle"
                    >
                      {ROTATING_TAGLINES[taglineIndex].text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center gap-6 md:gap-8 mb-8 md:mb-10"
            data-testid="section-feature-highlights"
          >
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center text-center flex-1"
                data-testid={`feature-${feature.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-warm-gray/5 dark:bg-white/5 flex items-center justify-center mb-1.5">
                  <feature.icon className={`w-4 h-4 md:w-5 md:h-5 ${feature.color}`} />
                </div>
                <span className="text-[11px] md:text-xs font-semibold text-warm-gray dark:text-[#F8FAFC] leading-tight">
                  {feature.label}
                </span>
                <span className="text-[10px] md:text-[11px] text-warm-gray/60 dark:text-[#64748B] leading-tight mt-0.5">
                  {feature.description}
                </span>
              </div>
            ))}
          </motion.div>

          <div className="floating-card">
            <div className="premium-card rounded-2xl p-5 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key="tier"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AgeTierSelector
                    selectedTier={ageTier}
                    onSelect={handleTierSelect}
                    onConfirm={handleConfirmJourney}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6"
            data-testid="section-how-it-works"
          >
            <p className="text-xs uppercase tracking-widest text-center text-warm-gray/50 dark:text-[#64748B] font-semibold mb-3">
              How it works
            </p>
            <div className="flex items-start justify-between gap-2">
              {STEPS.map((step, index) => (
                <div key={step.step} className="flex flex-col items-center text-center flex-1 relative">
                  <div className="w-9 h-9 rounded-full bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/20 flex items-center justify-center mb-1.5">
                    <step.icon className="w-4 h-4 text-terracotta dark:text-[#A78BFA]" />
                  </div>
                  <span className="text-xs font-semibold text-warm-gray dark:text-[#F8FAFC] leading-tight">
                    {step.title}
                  </span>
                  <span className="text-[11px] text-warm-gray/60 dark:text-[#64748B] leading-tight mt-0.5">
                    {step.description}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className="absolute top-4 -right-1 w-2 flex items-center" style={{ visibility: "visible" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-warm-gray/20 dark:text-[#A78BFA]/30">
                        <path d="M1 1L5 4L1 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-lg mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            data-testid="section-our-science"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FlaskConical className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
                <p className="text-xs uppercase tracking-widest text-warm-gray/50 dark:text-[#64748B] font-semibold">
                  Our Science
                </p>
              </div>
              <h2 className="text-xl md:text-2xl font-display font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">
                Research-Informed Assessments
              </h2>
              <p className="text-sm text-warm-gray/60 dark:text-[#94A3B8] max-w-sm mx-auto">
                Built on three well-established psychological frameworks used by researchers and professionals worldwide.
              </p>
            </div>

            <div className="space-y-3">
              {SCIENCE_HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 p-4 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/8 dark:border-[#A78BFA]/10"
                  data-testid={`science-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-terracotta/10 dark:bg-[#A78BFA]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-terracotta dark:text-[#A78BFA]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-warm-gray dark:text-[#F8FAFC] mb-0.5">{item.title}</h3>
                    <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-terracotta/5 dark:bg-[#A78BFA]/5 border border-terracotta/10 dark:border-[#A78BFA]/15 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-terracotta dark:text-[#A78BFA]" />
                <span className="text-xs font-semibold text-warm-gray dark:text-[#F8FAFC]">Research-Informed</span>
              </div>
              <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8]">
                Our assessments draw on decades of published personality research. Age-appropriate content for every tier.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-lg mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            data-testid="section-testimonials"
          >
            <div className="text-center mb-6">
              <p className="text-xs uppercase tracking-widest text-warm-gray/50 dark:text-[#64748B] font-semibold">
                What People Say
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TESTIMONIALS.map((testimonial, index) => {
                const AvatarIcon = testimonial.icon;
                return (
                  <div
                    key={index}
                    className="relative p-5 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/8 dark:border-[#A78BFA]/10"
                    data-testid={`testimonial-${index}`}
                  >
                    <Quote className="w-5 h-5 text-terracotta/30 dark:text-[#A78BFA]/30 mb-2" />
                    <p className="text-sm text-warm-gray/80 dark:text-[#E2E8F0] leading-relaxed mb-3 italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-terracotta/10 dark:bg-[#A78BFA]/15 flex items-center justify-center flex-shrink-0">
                        <AvatarIcon className="w-4 h-4 text-terracotta dark:text-[#A78BFA]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-warm-gray dark:text-[#F8FAFC]">{testimonial.author}</p>
                        <p className="text-[11px] text-warm-gray/50 dark:text-[#64748B]">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-lg mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            data-testid="section-results-teaser"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-terracotta dark:text-[#A78BFA]" />
                <p className="text-xs uppercase tracking-widest text-warm-gray/50 dark:text-[#64748B] font-semibold">
                  Preview
                </p>
              </div>
              <h2 className="text-xl md:text-2xl font-display font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">
                What You'll Discover
              </h2>
              <p className="text-sm text-warm-gray/60 dark:text-[#94A3B8] max-w-sm mx-auto">
                Complete the quiz to unlock your personalized insights
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: Brain,
                  title: "Your Blended Personality Profile",
                  description: "See how traits like Openness and Dominance combine to reveal types like Strategic Innovator or Empathic Leader.",
                },
                {
                  icon: Briefcase,
                  title: "Top Career Matches from 150+",
                  description: "Roles like Product Manager, Counselor, Entrepreneur, and more — matched to your unique trait blend.",
                },
                {
                  icon: TrendingUp,
                  title: "Strengths & Growth Areas",
                  description: "Discover what you're naturally good at and where targeted effort can unlock the most growth.",
                },
                {
                  icon: Lightbulb,
                  title: "Everyday Tips & Insights",
                  description: "Practical advice for work, communication, and relationships based on your personality style.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 p-4 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/8 dark:border-[#A78BFA]/10"
                  data-testid={`teaser-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-terracotta/10 dark:bg-[#A78BFA]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-terracotta dark:text-[#A78BFA]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-warm-gray dark:text-[#F8FAFC] mb-0.5">{item.title}</h3>
                    <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-warm-gray/10 dark:border-[#A78BFA]/10 py-8 px-5 mt-8" data-testid="section-footer">
        <div className="max-w-lg mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <Link href="/about" className="text-sm text-warm-gray/60 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-footer-about">
              About
            </Link>
            <span className="text-warm-gray/20 dark:text-[#64748B]/50">|</span>
            <Link href="/about" className="text-sm text-warm-gray/60 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-footer-science">
              Our Science
            </Link>
            <span className="text-warm-gray/20 dark:text-[#64748B]/50">|</span>
            <Link href="/faq" className="text-sm text-warm-gray/60 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-footer-faq">
              FAQ
            </Link>
            <span className="text-warm-gray/20 dark:text-[#64748B]/50">|</span>
            <Link href="/privacy" className="text-sm text-warm-gray/60 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-footer-privacy">
              Privacy
            </Link>
            <span className="text-warm-gray/20 dark:text-[#64748B]/50">|</span>
            <Link href="/terms" className="text-sm text-warm-gray/60 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-footer-terms">
              Terms
            </Link>
            <span className="text-warm-gray/20 dark:text-[#64748B]/50">|</span>
            <Link href="/careers" className="text-sm text-warm-gray/60 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-footer-careers">
              Careers
            </Link>
            <span className="text-warm-gray/20 dark:text-[#64748B]/50">|</span>
            <a href="mailto:info@knowyourole.com" className="text-sm text-warm-gray/60 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-footer-contact">
              Contact
            </a>
          </div>
          <p className="text-xs text-center text-warm-gray/40 dark:text-[#64748B]">
            KnowYouRole — Science-backed personality insights for every age.
          </p>
        </div>
      </footer>
    </div>
  );
}
