import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Trophy, Target, Brain, Heart, Users, RefreshCw, Share2, 
  Briefcase, TrendingUp, ChevronRight, ChevronDown, Zap, Award, MapPin, Lightbulb, Flame,
  MessageCircle, Frown, Meh, Smile, Lock, Crown, Star, Gift, BookOpen,
  Rocket, Timer, CheckCircle2, Calendar, ArrowRight, ArrowLeft, Shield, Compass, 
  Mountain, Sunrise, CircleDot, Play, Building2, DollarSign, PartyPopper
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { RadarChart, Radar, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuizScores } from "./Quiz";
import { useToast } from "@/hooks/use-toast";
import { useLocalityTheme } from "@/contexts/LocalityThemeContext";
import { getLocaleInsight, getPersonalizedInsight, type LocaleInsight } from "@/data/localeInsights";
import { getRegionalSalary, shouldShowSalary } from "@/data/regionalSalaries";
import { PremiumCardDeck } from "./PremiumCardDeck";
import { SharePDFModal } from "./SharePDFModal";
import { UnlockInsightsModal } from "./UnlockInsightsModal";
import { ArcTracker } from "./ArcTracker";
import { DreamRoleAdvisor } from "./DreamRoleAdvisor";
import { PersonalityEvolutionTimeline } from "./PersonalityEvolutionTimeline";
import { celebrateAchievement } from "@/lib/confetti";
import { HYBRID_HINTS, getHybridKey, type BlendInfo } from "./MoodAlchemyLab";
import { MOOD_PROXY_BOOSTS } from "@/lib/proxyCalculations";
import { useAuth } from "@/hooks/useAuth";
import {
  type JobMatch, type PersonalityResult, type ResultsProps, type AdventureArchetype,
  calculatePercentile, getPercentileLabel, calculateResult,
  TRAIT_COLORS, TRAIT_ICONS, TRAIT_LABELS, TRAIT_QUARTILE_DESCRIPTIONS,
  getQuartileKey, FUN_MODE_ROASTS, FUN_MODE_DISC, FUN_MODE_TITLES,
  HYBRID_TYPE_DESCRIPTIONS, TRAIT_QUESTS, GROWTH_QUESTS,
  getWeakestTrait, getWeaknessBlindspots, CAREER_SIMULATOR, SIDE_HUSTLES, LEARNING_STYLES,
} from "./results/resultsData";

export default function Results({ scores, tier, mood, funMode, landmark, theme, sessionId, apiScales, earnedBadges = [], hybridTypes = [], startOnPremiumPage = false, onRestart, onShare, onDownloadPDF }: ResultsProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [focusedTraitIndex, setFocusedTraitIndex] = useState<number>(-1);
  const { teamName, cityName, stateName, isLocalitySet } = useLocalityTheme();
  
  const localeInsight = cityName ? getLocaleInsight(cityName, stateName || undefined) : null;
  
  const isTestPremium = new URLSearchParams(window.location.search).get('test_premium') === 'true';
  const [dashboardStage, setDashboardStage] = useState<"teaser" | "full">(isTestPremium ? "full" : "teaser");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(isTestPremium || startOnPremiumPage);
  
  // Mini Explorer (ages 12 and under) - Adventure Archetype instead of job roles
  const isMiniExplorer = tier === "7-12";
  const [adventureArchetype, setAdventureArchetype] = useState<AdventureArchetype | null>(null);
  
  // Job Matches from API (for non-Youth tiers)
  const [topJobMatch, setTopJobMatch] = useState<JobMatch | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [jobMatchLoading, setJobMatchLoading] = useState(false);
  
  const [showJustKidding, setShowJustKidding] = useState(false);
  const [showDonationTiers, setShowDonationTiers] = useState(false);
  const [customDonationAmount, setCustomDonationAmount] = useState(0);
  
  // Post-quiz validation before premium unlock
  const [showValidation, setShowValidation] = useState(false);
  const [validationStep, setValidationStep] = useState(0);
  const [validationAnswers, setValidationAnswers] = useState<string[]>([]);
  const [mbtiMatchAnswer, setMbtiMatchAnswer] = useState<string>("");
  const [opennessRating, setOpennessRating] = useState<number>(0);
  const [showRefinedMessage, setShowRefinedMessage] = useState(false);
  const [adjustedBigFive, setAdjustedBigFive] = useState<{ O: number; C: number; E: number; A: number; N: number } | null>(null);
  
  // Feedback modal state - now triggered in Premium section
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackCompleted, setFeedbackCompleted] = useState(() => {
    return sessionStorage.getItem("knowrole-feedback-completed") === "true";
  });
  const [pendingCrossroads, setPendingCrossroads] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [usefulApp, setUsefulApp] = useState<string>("");
  const [resultsAccurate, setResultsAccurate] = useState<string>("");
  const [questionsEngaging, setQuestionsEngaging] = useState<string>("");
  const [wouldShare, setWouldShare] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Premium feature states
  const [selectedQuestWeek, setSelectedQuestWeek] = useState<1 | 2 | 3 | 4>(1);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  
  // Share PDF Modal state
  const [showSharePDFModal, setShowSharePDFModal] = useState(false);
  
  // Paginated results state (Page 1 = Summary, Page 2 = Details, Page 3 = Premium)
  const [currentResultsPage, setCurrentResultsPage] = useState<1 | 2 | 3>(startOnPremiumPage ? 3 : 1);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  // Authentication state
  const { user, isAuthenticated, isLoading: isAuthLoading, isPremium } = useAuth();
  
  // Mood Blend Badge state
  const [moodBlendInfo, setMoodBlendInfo] = useState<BlendInfo | null>(null);
  const [moodBlendKey, setMoodBlendKey] = useState<string>("");
  const [isMasterAlchemist, setIsMasterAlchemist] = useState(false);
  const [uniqueBlendsCount, setUniqueBlendsCount] = useState(0);
  
  const traitButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();

  useEffect(() => {
    const calculated = calculateResult(scores);
    if (apiScales) {
      calculated.scales = apiScales;
    }
    setResult(calculated);
    
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
    
    if (isTestPremium) {
      console.log('[DEV MODE] Premium features unlocked for testing via ?test_premium=true');
    }
  }, [scores, apiScales, isTestPremium]);

  // Save quiz results to user account when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user || !result || !sessionId) return;
    
    const saveKey = `knowrole-saved-result-${sessionId}`;
    if (sessionStorage.getItem(saveKey)) return; // Already saved
    
    const saveQuizResult = async () => {
      try {
        const response = await fetch('/api/quiz-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            sessionId,
            tier,
            mood,
            mbtiType: result.mbtiType,
            discStyle: result.discStyle,
            bigFiveScores: result.bigFiveProfile,
            roleRecommendations: result.primaryRole ? [result.primaryRole.title] : [],
            responses: scores.responses,
          }),
        });
        
        if (response.ok) {
          sessionStorage.setItem(saveKey, 'true');
          console.log('[Results] Quiz results saved to user account');
        }
      } catch (error) {
        console.error('Failed to save quiz results:', error);
      }
    };
    
    saveQuizResult();
  }, [isAuthenticated, user, result, sessionId, tier, mood, scores.responses]);

  // Process Mood Blend for Mood Alchemist badge
  useEffect(() => {
    const storedBlend = sessionStorage.getItem("knowrole-mood-blend");
    if (!storedBlend || storedBlend === "neutral") return;
    
    // Parse the mood blend (format: "mood1+mood2" or just "mood1")
    const moods = storedBlend.toLowerCase().split('+').map(m => m.trim());
    if (moods.length < 2) return; // Only award for actual blends
    
    const blendKey = getHybridKey(moods[0], moods[1]);
    const blendInfo = HYBRID_HINTS[blendKey];
    
    if (blendInfo) {
      setMoodBlendInfo(blendInfo);
      setMoodBlendKey(blendKey);
      
      // Track unique blends in localStorage for Master Alchemist badge
      const STORAGE_KEY = "knowrole-unique-blends";
      try {
        const existingBlends = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
        if (!existingBlends.includes(blendKey)) {
          const updatedBlends = [...existingBlends, blendKey];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBlends));
          setUniqueBlendsCount(updatedBlends.length);
          
          // Award Master Alchemist after 3 unique blends
          if (updatedBlends.length >= 3) {
            setIsMasterAlchemist(true);
          }
        } else {
          setUniqueBlendsCount(existingBlends.length);
          setIsMasterAlchemist(existingBlends.length >= 3);
        }
      } catch (e) {
        console.error("Error tracking unique blends:", e);
      }
    }
  }, []);

  // Fetch Adventure Archetype for all tiers
  useEffect(() => {
    if (!result) return;
    
    const fetchArchetype = async () => {
      try {
        const response = await fetch('/api/adventure-archetype', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            openness: result.bigFiveProfile.O,
            conscientiousness: result.bigFiveProfile.C,
            extraversion: result.bigFiveProfile.E,
            agreeableness: result.bigFiveProfile.A,
            neuroticism: result.bigFiveProfile.N,
            mbtiType: result.mbtiType,
            discStyle: result.discStyle,
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch archetype');
        const archetype = await response.json();
        setAdventureArchetype(archetype);
      } catch (error) {
        console.error('Failed to fetch adventure archetype:', error);
        // Fallback archetype
        setAdventureArchetype({
          name: "The Explorer",
          superpower: "You discover what others miss!",
          description: "You're always curious and asking 'why?' You love learning new things.",
          mission: "Find something new to explore today!",
          badgeColor: "#10B981",
        });
      }
    };
    
    fetchArchetype();
  }, [result]);

  // Fetch Job Matches for non-Youth tiers
  useEffect(() => {
    if (!result || isMiniExplorer) return;
    
    const fetchJobMatches = async () => {
      setJobMatchLoading(true);
      try {
        const requestBody = {
          mbti: {
            E: scores.mbti.E, I: scores.mbti.I,
            S: scores.mbti.S, N: scores.mbti.N,
            T: scores.mbti.T, F: scores.mbti.F,
            J: scores.mbti.J, P: scores.mbti.P,
          },
          disc: {
            D: scores.disc.D, I: scores.disc.I,
            S: scores.disc.S, C: scores.disc.C,
          },
          bigFive: {
            O: result.bigFiveProfile.O,
            C: result.bigFiveProfile.C,
            E: result.bigFiveProfile.E,
            A: result.bigFiveProfile.A,
            N: result.bigFiveProfile.N,
          },
        };
        
        // Fetch top job match for basic display
        const topResponse = await fetch('/api/job-match/top', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        if (topResponse.ok) {
          const topData = await topResponse.json();
          if (topData.success && topData.match) {
            setTopJobMatch(topData.match);
          }
        }
        
        // Fetch top 3 job matches for premium display
        const matchesResponse = await fetch('/api/job-matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...requestBody, limit: 3, diversityBoost: true }),
        });
        
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          if (matchesData.success && matchesData.matches) {
            const seen = new Set<string>();
            const unique = (matchesData.matches as JobMatch[]).filter(m => {
              const key = m.roleName.toLowerCase().trim();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            setJobMatches(unique);
          }
        }
      } catch (error) {
        console.error('Failed to fetch job matches:', error);
      } finally {
        setJobMatchLoading(false);
      }
    };
    
    fetchJobMatches();
  }, [result, isMiniExplorer, scores]);

  // DEV MODE: Set to true to show Just Kidding page before premium unlock
  const DEV_BYPASS_PAYMENT = true;
  
  // Handle validation submission with proxy adjustments
  const handleValidationSubmit = () => {
    if (!mbtiMatchAnswer || opennessRating === 0) return;
    
    // Store responses in localStorage
    const validationResponses = {
      mbtiMatch: mbtiMatchAnswer,
      opennessRating: opennessRating,
      mbtiType: result?.mbtiType || "",
      originalOpenness: result?.bigFiveProfile.O || 50,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('knowrole-validation-responses', JSON.stringify(validationResponses));
    
    // Apply proxy adjustments based on feedback
    let adjustedProfile = { ...result!.bigFiveProfile };
    
    // If MBTI mismatch (No/Somewhat), reduce MBTI quota by 5% and boost Big Five by 5%
    if (mbtiMatchAnswer === "no" || mbtiMatchAnswer === "somewhat") {
      // Boost all Big Five scores by 5%
      adjustedProfile = {
        O: Math.min(100, Math.round(adjustedProfile.O * 1.05)),
        C: Math.min(100, Math.round(adjustedProfile.C * 1.05)),
        E: Math.min(100, Math.round(adjustedProfile.E * 1.05)),
        A: Math.min(100, Math.round(adjustedProfile.A * 1.05)),
        N: Math.min(100, Math.round(adjustedProfile.N * 1.05)),
      };
      console.log('[Validation] MBTI mismatch detected, Big Five boosted by 5%');
    }
    
    // If Openness rating < 3, tweak Openness score by -/+5% based on direction
    if (opennessRating < 3) {
      // User thinks Openness is inaccurate - adjust down if high, up if low
      const currentO = adjustedProfile.O;
      if (currentO > 50) {
        // Openness was rated high but user disagrees - reduce by 5%
        adjustedProfile.O = Math.max(5, Math.round(currentO * 0.95));
        console.log('[Validation] Openness adjusted down from', currentO, 'to', adjustedProfile.O);
      } else {
        // Openness was rated low but user disagrees - increase by 5%
        adjustedProfile.O = Math.min(95, Math.round(currentO * 1.05));
        console.log('[Validation] Openness adjusted up from', currentO, 'to', adjustedProfile.O);
      }
    }
    
    setAdjustedBigFive(adjustedProfile);
    
    // Store adjusted values
    const adjustedResponses = {
      ...validationResponses,
      adjustedOpenness: adjustedProfile.O,
      adjustedProfile: adjustedProfile
    };
    localStorage.setItem('knowrole-validation-responses', JSON.stringify(adjustedResponses));
    
    console.log('[Validation] Responses:', adjustedResponses);
    
    // Show refined message briefly, then proceed
    setShowValidation(false);
    setShowRefinedMessage(true);
    
    // After 2 seconds, show Just Kidding
    setTimeout(() => {
      setShowRefinedMessage(false);
      setShowJustKidding(true);
    }, 2500);
  };
  
  // Legacy validation handler (kept for compatibility)
  const handleValidationAnswer = (answer: string) => {
    const newAnswers = [...validationAnswers, answer];
    setValidationAnswers(newAnswers);
    
    if (validationStep < 1) {
      setValidationStep(validationStep + 1);
    } else {
      // Validation complete, show Just Kidding
      setShowValidation(false);
      setShowJustKidding(true);
      console.log('[Validation] Answers:', newAnswers);
    }
  };
  
  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    // Show validation questions first, then Just Kidding
    if (DEV_BYPASS_PAYMENT) {
      console.log('[DEV MODE] Showing validation questions before premium unlock');
      setShowValidation(true);
      setValidationStep(0);
      setValidationAnswers([]);
      setIsCheckingOut(false);
      return;
    }
    
    try {
      const productsRes = await fetch('/api/stripe/products');
      const productsData = await productsRes.json();
      
      const proProduct = productsData.products?.find((p: any) => 
        p.metadata?.tier === 'pro' || p.name === 'KnowRole Pro'
      );
      
      if (!proProduct || !proProduct.prices?.length) {
        throw new Error('Pro product not found');
      }
      
      const priceId = proProduct.prices[0].id;
      
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId,
          sessionId: sessionId || undefined,
        }),
      });
      
      const checkoutData = await checkoutRes.json();
      
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  const allFeedbackAnswered = usefulApp !== "" && resultsAccurate !== "" && questionsEngaging !== "" && wouldShare !== "";

  // 30-second timer for feedback in Premium section
  useEffect(() => {
    if (isPremiumUnlocked && !feedbackCompleted) {
      feedbackTimerRef.current = setTimeout(() => {
        setShowFeedbackModal(true);
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [isPremiumUnlocked, feedbackCompleted]);

  // Handle Crossroads click - show feedback first if not completed
  const handleCrossroadsClick = () => {
    if (!feedbackCompleted) {
      setPendingCrossroads(true);
      setShowFeedbackModal(true);
    } else {
      window.location.href = "/crossroads";
    }
  };

  // Submit feedback from modal
  const handleFeedbackSubmit = async () => {
    if (!allFeedbackAnswered || isSubmittingFeedback || feedbackCompleted) return;
    
    setIsSubmittingFeedback(true);
    
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    const feedbackData = {
      sessionId: sessionId || null,
      usefulApp,
      resultsAccurate,
      questionsEngaging,
      wouldShare,
      suggestions,
      mbtiType: result?.mbtiType || null,
      discStyle: result?.discStyle || null,
      primaryRole: result?.primaryRole.title || null,
      tier,
      mood,
      funMode,
      timestamp: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      if (!response.ok) throw new Error("Server error");
      console.log("Feedback saved successfully:", feedbackData);
    } catch (error) {
      console.error("Failed to save feedback:", error);
      setIsSubmittingFeedback(false);
      toast({
        title: "Oops",
        description: "Could not save feedback. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setFeedbackCompleted(true);
    sessionStorage.setItem("knowrole-feedback-completed", "true");
    setShowFeedbackModal(false);
    
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    
    if (pendingCrossroads) {
      setPendingCrossroads(false);
      window.location.href = "/crossroads";
    }
  };

  // Go directly to full results without feedback (now the default)
  const handleShowFullResults = () => {
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    setDashboardStage("full");
  };

  const handleTraitSelect = (trait: string, index: number) => {
    setSelectedTrait(selectedTrait === trait ? null : trait);
    setFocusedTraitIndex(index);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handleTraitKeyDown = (e: React.KeyboardEvent, trait: string, index: number) => {
    const traitKeys = Object.keys(result?.bigFiveProfile || {});
    
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTraitSelect(trait, index);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % traitKeys.length;
      setFocusedTraitIndex(nextIndex);
      traitButtonsRef.current[nextIndex]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + traitKeys.length) % traitKeys.length;
      setFocusedTraitIndex(prevIndex);
      traitButtonsRef.current[prevIndex]?.focus();
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0F]">
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full"
          role="status"
          aria-label="Loading results"
        />
      </div>
    );
  }

  const sortedBigFive = Object.entries(result.bigFiveProfile)
    .sort((a, b) => b[1] - a[1]);
  const topTwoTraits = sortedBigFive.slice(0, 2);
  const topTrait = sortedBigFive[0];

  const discColorMap: Record<string, string> = {
    terracotta: "bg-terracotta text-white",
    amber: "bg-amber-500 text-black",
    "sage-green": "bg-sage-green text-white",
    "dusty-blue": "bg-dusty-blue text-white",
  };

  const traitKeys = Object.keys(result.bigFiveProfile);
  const isFull = dashboardStage === "full";

  const getQuests = () => {
    const quests: string[] = [];
    sortedBigFive.slice(0, 3).forEach(([trait, value]) => {
      const questData = TRAIT_QUESTS[trait];
      if (questData) {
        quests.push(value > 50 ? questData.high : questData.low);
      }
    });
    return quests;
  };

  const ToggleButton = ({ 
    value, 
    currentValue, 
    onChange, 
    variant = "default",
    children,
    testId 
  }: { 
    value: string; 
    currentValue: string; 
    onChange: (v: string) => void;
    variant?: "no" | "middle" | "yes" | "default";
    children: React.ReactNode;
    testId: string;
  }) => {
    const isSelected = currentValue === value;
    const baseClasses = "flex-1 py-1.5 px-1.5 rounded-md text-[10px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1";
    
    const variantClasses = {
      no: isSelected 
        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 ring-2 ring-red-400" 
        : "bg-gray-100 dark:bg-[#1E1E2E] text-gray-600 dark:text-[#94A3B8] hover:bg-red-50 dark:hover:bg-red-900/20",
      middle: isSelected 
        ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400" 
        : "bg-gray-100 dark:bg-[#1E1E2E] text-gray-600 dark:text-[#94A3B8] hover:bg-amber-50 dark:hover:bg-amber-900/20",
      yes: isSelected 
        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-2 ring-green-400" 
        : "bg-gray-100 dark:bg-[#1E1E2E] text-gray-600 dark:text-[#94A3B8] hover:bg-green-50 dark:hover:bg-green-900/20",
      default: isSelected 
        ? "bg-terracotta/20 text-terracotta ring-2 ring-terracotta" 
        : "bg-gray-100 dark:bg-[#1E1E2E] text-gray-600 dark:text-[#94A3B8] hover:bg-terracotta/10",
    };

    return (
      <button
        type="button"
        onClick={() => {
          onChange(value);
          if (navigator.vibrate) navigator.vibrate(20);
        }}
        className={`${baseClasses} ${variantClasses[variant]}`}
        aria-pressed={isSelected}
        data-testid={testId}
      >
        {children}
      </button>
    );
  };

  const handleProceedToResults = () => {
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    setShowJustKidding(false);
    setIsPremiumUnlocked(true);
    // Celebrate premium unlock with confetti
    setTimeout(() => {
      celebrateAchievement('premium');
    }, 300);
  };

  const handleDonateClick = () => {
    setShowDonationTiers(true);
  };
  
  const handleDonationTierSelect = async (amount: number) => {
    console.log('[Donation] Starting checkout for amount:', amount);
    try {
      // Save quiz state to localStorage before redirecting to Stripe
      // This allows us to restore the state when the user returns from Stripe
      const donationState = {
        scores,
        tier,
        mood,
        funMode,
        landmark,
        theme,
        sessionId,
        apiScales,
        earnedBadges,
        hybridTypes,
        timestamp: Date.now(),
      };
      localStorage.setItem('knowrole-donation-state', JSON.stringify(donationState));
      console.log('[Donation] Saved state to localStorage before Stripe redirect');
      
      const checkoutRes = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, sessionId: sessionId || undefined }),
      });
      
      console.log('[Donation] Response status:', checkoutRes.status);
      const checkoutData = await checkoutRes.json();
      console.log('[Donation] Response data:', checkoutData);
      
      if (!checkoutRes.ok) {
        toast({
          title: "Donation Error",
          description: checkoutData.error || "Failed to create checkout session",
          variant: "destructive",
        });
        return;
      }
      
      if (checkoutData.url) {
        console.log('[Donation] Redirecting to:', checkoutData.url);
        window.location.href = checkoutData.url;
      } else {
        console.error('[Donation] No URL in response:', checkoutData);
        toast({
          title: "Donation Error",
          description: "Failed to get checkout URL. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[Donation] Error:', error);
      toast({
        title: "Donation Error",
        description: "Unable to process donation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-36 bg-white dark:bg-[#0A0A0F]">
      {/* Validation Questions Overlay - 2 quick questions before premium unlock */}
      <AnimatePresence>
        {showValidation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            data-testid="overlay-validation"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-900/90 dark:via-purple-900/80 dark:to-indigo-800/90 rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl border-2 border-indigo-200 dark:border-indigo-700"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              
              <p className="text-xs uppercase tracking-wider text-indigo-500 dark:text-indigo-300 mb-2 text-center">
                Quick Validation
              </p>
              <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-200 mb-6 text-center">
                Help us refine your insights
              </p>
              
              {/* Question 1: MBTI Match */}
              <div className="mb-6">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-3">
                  1. Does this MBTI type ({result?.mbtiType || "XXXX"}) match you?
                </p>
                <div className="flex gap-2 justify-center">
                  {["no", "somewhat", "yes"].map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMbtiMatchAnswer(option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                        mbtiMatchAnswer === option
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "bg-white dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-200 border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-700/50"
                      }`}
                      data-testid={`radio-mbti-${option}`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Question 2: Openness Star Rating */}
              <div className="mb-6">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-3">
                  2. Rate the accuracy of your Openness score ({result?.bigFiveProfile.O || 50}%)
                </p>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setOpennessRating(star)}
                      className="p-1 transition-all"
                      data-testid={`star-rating-${star}`}
                    >
                      <Star
                        className={`w-8 h-8 transition-all ${
                          star <= opennessRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-indigo-300 dark:text-indigo-600"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-indigo-400/70 dark:text-indigo-400/50 mt-1 text-center">
                  {opennessRating === 0 && "Tap to rate"}
                  {opennessRating === 1 && "Very inaccurate"}
                  {opennessRating === 2 && "Somewhat inaccurate"}
                  {opennessRating === 3 && "Neutral"}
                  {opennessRating === 4 && "Mostly accurate"}
                  {opennessRating === 5 && "Very accurate"}
                </p>
              </div>
              
              <Button
                onClick={handleValidationSubmit}
                disabled={!mbtiMatchAnswer || opennessRating === 0}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-validation-submit"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Submit & Continue
              </Button>
              
              <p className="text-xs text-indigo-400/70 dark:text-indigo-400/50 mt-4 text-center">
                Helps personalize your premium insights
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Refined Message Overlay */}
      <AnimatePresence>
        {showRefinedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            data-testid="overlay-refined"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-900/90 dark:via-teal-900/80 dark:to-emerald-800/90 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-2 border-emerald-200 dark:border-emerald-700"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-emerald-700 dark:text-emerald-200 mb-2"
              >
                Thanks!
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-emerald-600/80 dark:text-emerald-300/70"
              >
                We've refined your insights based on your input.
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Just Kidding Interstitial Overlay */}
      <AnimatePresence>
        {showJustKidding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            data-testid="overlay-just-kidding"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-900/90 dark:via-cyan-900/80 dark:to-teal-800/90 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-2 border-teal-200 dark:border-teal-700"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                className="text-[28px] font-bold text-teal-700 dark:text-teal-200 mb-2"
              >
                Premium is Free!
              </motion.p>
              <p className="text-sm text-teal-600/80 dark:text-teal-300/70 mb-6">
                We're testing! Your two cents (literally $0.02) helps us build something great.
              </p>
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={handleProceedToResults}
                  data-testid="button-proceed-results"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Proceed to Results
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-2 border-teal-400 text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/50 font-semibold py-4"
                  onClick={handleDonateClick}
                  data-testid="button-donate-kidding"
                >
                  <Heart className="w-4 h-4 mr-2 fill-current" />
                  Donate (Help us build)
                </Button>
              </div>
              
              <p className="text-xs text-teal-500/60 dark:text-teal-400/50 mt-4">
                All features unlocked free during testing
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Donation Tiers Overlay */}
      <AnimatePresence>
        {showDonationTiers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowDonationTiers(false)}
            data-testid="overlay-donation-tiers"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-900/90 dark:via-orange-900/80 dark:to-amber-800/90 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-2 border-amber-200 dark:border-amber-700"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Heart className="w-10 h-10 text-white fill-current" />
              </motion.div>
              
              <p className="text-xl font-bold text-amber-700 dark:text-amber-200 mb-2">
                Support KnowRole
              </p>
              <p className="text-sm text-amber-600/80 dark:text-amber-300/70 mb-6">
                Your donation helps us keep building and improving!
              </p>
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={() => handleDonationTierSelect(1000)}
                  data-testid="button-donate-10"
                >
                  $10
                </Button>
                
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={() => handleDonationTierSelect(2000)}
                  data-testid="button-donate-20"
                >
                  $20
                </Button>

                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Enter custom amount ($)"
                    value={customDonationAmount}
                    onChange={(e) => setCustomDonationAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    min="1"
                    className="w-full px-4 py-2 border-2 border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-amber-900/30 text-warm-gray dark:text-soft-cream focus:outline-none focus:ring-2 focus:ring-amber-400"
                    data-testid="input-custom-donation"
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-4 text-lg shadow-lg"
                    onClick={() => customDonationAmount > 0 && handleDonationTierSelect(customDonationAmount * 100)}
                    disabled={customDonationAmount <= 0}
                    data-testid="button-donate-custom"
                  >
                    Donate ${customDonationAmount}
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full border-2 border-amber-400 text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/50 font-semibold py-4"
                  onClick={() => setShowDonationTiers(false)}
                  data-testid="button-back-donation"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Feedback Modal Overlay - Triggered after 30s in Premium or before Crossroads */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            data-testid="overlay-feedback-modal"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-[#12121A] rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-terracotta/30 dark:border-terracotta/50 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-5">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-amber-500 flex items-center justify-center mx-auto mb-3"
                >
                  <MessageCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-warm-gray dark:text-[#F8FAFC] mb-1">
                  Quick Feedback
                </h3>
                <p className="text-sm text-warm-gray/60 dark:text-[#64748B]">
                  Help us improve KnowRole in 30 seconds
                </p>
              </div>

              <div className="space-y-4">
                <fieldset className="space-y-2">
                  <Label asChild>
                    <legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">
                      Useful App?
                    </legend>
                  </Label>
                  <div className="flex justify-between w-full gap-2" role="radiogroup">
                    <ToggleButton value="no" currentValue={usefulApp} onChange={setUsefulApp} variant="no" testId="modal-toggle-useful-no">No</ToggleButton>
                    <ToggleButton value="somewhat" currentValue={usefulApp} onChange={setUsefulApp} variant="middle" testId="modal-toggle-useful-somewhat">Somewhat</ToggleButton>
                    <ToggleButton value="yes" currentValue={usefulApp} onChange={setUsefulApp} variant="yes" testId="modal-toggle-useful-yes">Yes</ToggleButton>
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <Label asChild>
                    <legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">
                      Results feel accurate?
                    </legend>
                  </Label>
                  <div className="flex justify-between w-full gap-2" role="radiogroup">
                    <ToggleButton value="no" currentValue={resultsAccurate} onChange={setResultsAccurate} variant="no" testId="modal-toggle-accurate-no">No</ToggleButton>
                    <ToggleButton value="somewhat" currentValue={resultsAccurate} onChange={setResultsAccurate} variant="middle" testId="modal-toggle-accurate-somewhat">Somewhat</ToggleButton>
                    <ToggleButton value="yes" currentValue={resultsAccurate} onChange={setResultsAccurate} variant="yes" testId="modal-toggle-accurate-yes">Yes</ToggleButton>
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <Label asChild>
                    <legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">
                      Questions engaging?
                    </legend>
                  </Label>
                  <div className="flex justify-between w-full gap-2" role="radiogroup">
                    <ToggleButton value="no" currentValue={questionsEngaging} onChange={setQuestionsEngaging} variant="no" testId="modal-toggle-engaging-no">No</ToggleButton>
                    <ToggleButton value="somewhat" currentValue={questionsEngaging} onChange={setQuestionsEngaging} variant="middle" testId="modal-toggle-engaging-somewhat">Somewhat</ToggleButton>
                    <ToggleButton value="yes" currentValue={questionsEngaging} onChange={setQuestionsEngaging} variant="yes" testId="modal-toggle-engaging-yes">Yes</ToggleButton>
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <Label asChild>
                    <legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">
                      Would share with a friend?
                    </legend>
                  </Label>
                  <div className="flex justify-between w-full gap-2" role="radiogroup">
                    <ToggleButton value="no" currentValue={wouldShare} onChange={setWouldShare} variant="no" testId="modal-toggle-share-no">No</ToggleButton>
                    <ToggleButton value="yes" currentValue={wouldShare} onChange={setWouldShare} variant="yes" testId="modal-toggle-share-yes">Yes</ToggleButton>
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <Label htmlFor="modal-suggestions" className="text-sm font-medium text-warm-gray dark:text-[#F8FAFC]">
                    Suggestions for improvement?
                  </Label>
                  <Textarea
                    id="modal-suggestions"
                    placeholder="Share your thoughts..."
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    maxLength={2000}
                    rows={2}
                    className="resize-none text-sm"
                    data-testid="modal-textarea-suggestions"
                  />
                </div>

                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={!allFeedbackAnswered || isSubmittingFeedback}
                  className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed min-h-12 text-base font-semibold"
                  data-testid="button-submit-feedback"
                >
                  {isSubmittingFeedback ? (
                    "Submitting..."
                  ) : allFeedbackAnswered ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {pendingCrossroads ? "Submit & Start Adventure" : "Submit Feedback"}
                    </>
                  ) : (
                    "Complete all fields to continue"
                  )}
                </Button>
                
                {!allFeedbackAnswered && (
                  <p className="text-center text-xs text-warm-gray/50 dark:text-[#64748B]">
                    All fields required
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Persistent Test Mode Premium Banner */}
      {isTestPremium && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="sticky top-0 z-50 shadow-lg"
          data-testid="banner-test-premium"
        >
          <div className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 px-4 pt-4 pb-5">
            <div className="max-w-md mx-auto text-center">
              <p className="text-2xl font-bold text-white italic mb-3" style={{ fontFamily: "'Georgia', serif", textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                Just Kidding!
              </p>
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-2 shadow-md">
                <Crown className="w-7 h-7 text-teal-500" />
              </div>
              <p className="text-lg font-bold text-teal-700 mb-1">Premium Unlocked</p>
              <p className="text-sm text-gray-600">Welcome to your full personality journey</p>
            </div>
          </div>
          <Button
            className="w-full rounded-none bg-teal-500 hover:bg-teal-600 text-white text-lg font-bold py-6 h-auto shadow-md"
            onClick={handleDonateClick}
            data-testid="button-donate-here"
          >
            <Heart className="w-5 h-5 mr-2 fill-current" />
            DONATE HERE
          </Button>
        </motion.div>
      )}
      <header className={`${isTestPremium ? 'pt-6' : 'pt-10'} pb-6 px-4 text-center`}>
        <motion.div
          initial={shouldReduceMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-dusty-blue mb-3"
        >
          <Trophy className="w-8 h-8 text-soft-cream" aria-hidden="true" />
        </motion.div>
        
        <motion.h1
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-display font-bold text-warm-gray dark:text-[#F8FAFC] mb-2"
          data-testid="text-result-title"
        >
          {isFull ? "Your Personality Map" : "Your Quick Glimpse"}
        </motion.h1>
        
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-warm-gray/70 dark:text-[#94A3B8]"
        >
          Based on your {scores.responses.length} path choices
        </motion.p>
      </header>
      <main className="px-4 max-w-md mx-auto space-y-6">
        {/* ==================== PAGE 1: SUMMARY ==================== */}
        <AnimatePresence mode="wait">
          {currentResultsPage === 1 && (
            <motion.div
              key="page-1-summary"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
        {/* TIER 1: PRE-FEEDBACK (TEASER) - Always visible */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Mini Explorer: Adventure Archetype Display */}
          {isMiniExplorer ? (
            adventureArchetype ? (
            <Card className="overflow-hidden border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <motion.div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: adventureArchetype.badgeColor }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-300 font-medium mb-1 tracking-wide uppercase">Your Adventure Type</p>
                <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-200 mb-2" data-testid="text-adventure-archetype">
                  {adventureArchetype.name}
                </h3>
                <div className="mb-4 px-4 py-2 rounded-xl bg-white/50 dark:bg-[#12121A]/50 border border-purple-200 dark:border-purple-700">
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-300">
                    {adventureArchetype.superpower}
                  </p>
                </div>
                <p className="text-sm text-purple-700/80 dark:text-purple-200/80 leading-relaxed max-w-sm mx-auto mb-4">
                  {adventureArchetype.description}
                </p>
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Your Mission</p>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    {adventureArchetype.mission}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Loading state for Mini Explorer while adventure archetype loads */
            <Card className="overflow-hidden border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-purple-200 dark:bg-purple-700 flex items-center justify-center mb-4"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Star className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                  </motion.div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Discovering your adventure type...</p>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          /* Regular Role Display for Teen/Adult tiers */
          <Card className="overflow-hidden border-2 border-terracotta/30 bg-gradient-to-br from-terracotta/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-terracotta font-medium mb-1 tracking-wide uppercase">Your Primary Role Match</p>
                {jobMatchLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-terracotta/20 rounded w-48 mx-auto mb-2" />
                    <div className="h-4 bg-terracotta/10 rounded w-64 mx-auto" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-warm-gray dark:text-[#F8FAFC] mb-2" data-testid="text-primary-role">
                      {topJobMatch ? topJobMatch.roleName : result.primaryRole.title}
                    </h3>
                    {/* Match Score Badge - Show when job match is available */}
                    {topJobMatch && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta mb-3">
                        <Target className="w-3 h-3" />
                        <span className="text-sm font-semibold">{topJobMatch.matchScore}% Match</span>
                      </div>
                    )}
                    {/* Salary - Only show for premium users */}
                    {isPremiumUnlocked && (() => {
                      const roleTitle = topJobMatch ? topJobMatch.roleName : result.primaryRole.title;
                      const regionalInfo = getRegionalSalary(roleTitle, cityName || undefined, stateName || undefined);
                      const displaySalary = regionalInfo.hasRegionalData ? regionalInfo.salary : result.primaryRole.salary;
                      return (
                        <div className="space-y-1 mb-3">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sage-green/10 text-sage-green">
                            {regionalInfo.hasRegionalData ? <DollarSign className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                            <span className="text-sm font-semibold">{displaySalary}</span>
                            {regionalInfo.hasRegionalData && cityName && (
                              <span className="text-xs opacity-70">in {cityName}</span>
                            )}
                          </div>
                          <p className="text-xs text-warm-gray/60 dark:text-[#64748B]">
                            {regionalInfo.growthOutlook}
                          </p>
                        </div>
                      );
                    })()}
                    {/* Personalized explanation from job matching API */}
                    <p className="text-sm text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
                      {topJobMatch ? topJobMatch.explanation : (
                        `${result.primaryRole.desc}: ${result.mbtiType.includes('E') 
                          ? "Your natural energy and communication style make you well-suited for collaborative environments." 
                          : "Your thoughtful, focused approach brings unique depth and precision to this field."} 
                        ${result.discStyle === 'D' ? " As a natural leader, you thrive when given autonomy and clear goals." 
                          : result.discStyle === 'I' ? " Your enthusiasm and persuasive abilities help you connect with diverse people." 
                          : result.discStyle === 'S' ? " Your steady reliability makes you a trusted anchor in team settings." 
                          : " Your attention to detail ensures high-quality outcomes in everything you do."} 
                        ${topTrait[1] > 60 
                          ? ` With ${TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]} as your strongest trait, you bring a distinctive edge to your work.`
                          : ` You have a balanced personality profile that adapts well across different situations.`}`
                      )}
                    </p>
                    {/* Trait Highlights - Show when job match is available */}
                    {topJobMatch && topJobMatch.traitHighlights && topJobMatch.traitHighlights.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {topJobMatch.traitHighlights.slice(0, 3).map((trait, i) => (
                          <span 
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-dusty-blue/10 text-dusty-blue"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              
              <div className="grid grid-cols-3 gap-2 mt-6">
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center px-2 py-4 rounded-xl bg-terracotta/8 dark:bg-terracotta/15 border border-terracotta/20"
                >
                  <Brain className="w-5 h-5 text-terracotta mx-auto mb-1.5" />
                  <p className="text-sm font-bold text-terracotta mb-0.5 leading-tight line-clamp-2" data-testid="text-mbti-teaser">
                    {funMode && FUN_MODE_TITLES[result.mbtiType] 
                      ? FUN_MODE_TITLES[result.mbtiType]
                      : result.mbtiLabel}
                  </p>
                  <p className="text-[10px] text-terracotta/60 font-mono">
                    ({result.mbtiType})
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center px-2 py-4 rounded-xl bg-sage-green/8 dark:bg-sage-green/15 border border-sage-green/20"
                >
                  <Award className="w-5 h-5 text-sage-green mx-auto mb-1.5" />
                  <p className="text-[10px] font-bold text-sage-green mb-0.5 leading-tight" data-testid="text-disc-teaser">
                    {funMode && FUN_MODE_DISC[result.discStyle] 
                      ? FUN_MODE_DISC[result.discStyle].nickname
                      : result.discLabel}
                  </p>
                  <p className="text-[9px] text-sage-green/60 font-mono">
                    ({result.discStyle}-type)
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center px-2 py-4 rounded-xl bg-dusty-blue/8 dark:bg-dusty-blue/15 border border-dusty-blue/20"
                >
                  {(() => {
                    const topTraitKey = topTrait[0] as keyof typeof TRAIT_ICONS;
                    const TopIcon = TRAIT_ICONS[topTraitKey];
                    const topValue = topTrait[1];
                    return (
                      <>
                        <TopIcon className="w-5 h-5 text-dusty-blue mx-auto mb-1.5" />
                        <p className={`font-bold text-dusty-blue mb-0.5 leading-tight ${
                          TRAIT_LABELS[topTraitKey].length > 12 ? 'text-[10px]' : 'text-sm'
                        }`} data-testid="text-bigfive-teaser">
                          {TRAIT_LABELS[topTraitKey]}
                        </p>
                        <p className="text-[10px] text-dusty-blue/60 font-mono">
                          ({topValue}%)
                        </p>
                      </>
                    );
                  })()}
                </motion.div>
              </div>
              
              {/* Adventure Type for Teen/Adult - Compact Display */}
              {!isMiniExplorer && adventureArchetype && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6 pt-5 border-t border-terracotta/20"
                >
                  <div className="flex items-center justify-center gap-3">
                    <motion.div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: adventureArchetype.badgeColor }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Compass className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="text-left">
                      <p className="text-[10px] text-terracotta/60 font-medium uppercase tracking-wide">Adventure Type</p>
                      <p className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC]">{adventureArchetype.name}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        )}
        </motion.div>
          
          {/* Premium Job Matches Card - Top 3 diverse matches (for Teen+ tiers, premium only) */}
          {!isMiniExplorer && isPremiumUnlocked && jobMatches.length > 0 && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="overflow-hidden border-2 border-sage-green/30 bg-gradient-to-br from-sage-green/5 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="w-5 h-5 text-sage-green" />
                    <span className="text-warm-gray dark:text-[#F8FAFC]">Your Top Career Matches</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobMatches.map((match, index) => (
                    <div 
                      key={match.roleNumber}
                      className={`p-4 rounded-xl border ${
                        index === 0 
                          ? 'bg-sage-green/10 border-sage-green/30' 
                          : 'bg-warm-gray/5 dark:bg-[#1E1E2A] border-warm-gray/10 dark:border-[#2A2A3A]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              index === 0 
                                ? 'bg-sage-green text-white' 
                                : 'bg-warm-gray/20 dark:bg-[#2A2A3A] text-warm-gray dark:text-[#94A3B8]'
                            }`}>
                              #{index + 1}
                            </span>
                            <span className="text-xs text-warm-gray/60 dark:text-[#64748B] capitalize">
                              {match.jobCollar} collar
                            </span>
                          </div>
                          <h4 className="font-bold text-warm-gray dark:text-[#F8FAFC] mb-1">
                            {match.roleName}
                          </h4>
                          <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed">
                            {match.explanation}
                          </p>
                          {match.traitHighlights && match.traitHighlights.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {match.traitHighlights.map((trait, i) => (
                                <span 
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full bg-dusty-blue/10 text-dusty-blue"
                                >
                                  {trait}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            index === 0 ? 'text-sage-green' : 'text-dusty-blue'
                          }`}>
                            {match.matchScore}%
                          </div>
                          <div className="text-[10px] text-warm-gray/50 dark:text-[#64748B]">match</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Phase 2.2: Badges & Hybrid Types Section */}
          {(earnedBadges.length > 0 || hybridTypes.length > 0) && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-4"
            >
              {/* Hybrid Types - Tappable with explanations */}
              {hybridTypes.length > 0 && (
                <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200/50 dark:border-indigo-700/50 mb-3">
                  <CardContent className="p-4">
                    <p className="text-xs text-center text-indigo-600 dark:text-indigo-300 font-medium mb-3 uppercase tracking-wide">
                      Your Unique Blend
                    </p>
                    <div className="space-y-2">
                      {hybridTypes.map((type, i) => {
                        const hybridInfo = HYBRID_TYPE_DESCRIPTIONS[type] || { 
                          short: type, 
                          description: "You have a balanced approach in this area." 
                        };
                        return (
                          <motion.details
                            key={type}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + i * 0.1 }}
                            className="group"
                          >
                            <summary className="flex items-center justify-between cursor-pointer list-none px-3 py-2.5 rounded-xl bg-white/60 dark:bg-[#12121A]/60 border border-indigo-200/50 dark:border-indigo-700/30 hover:bg-white/80 dark:hover:bg-[#1E1E2E]/60 transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-indigo-700 dark:text-indigo-300">{type}</span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-indigo-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="mt-2 px-3 py-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border-l-3 border-indigo-400">
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-1">
                                {hybridInfo.short}
                              </p>
                              <p className="text-sm text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed">
                                {hybridInfo.description}
                              </p>
                            </div>
                          </motion.details>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mood Alchemist Badge - Highlights mood blend influence */}
              {moodBlendInfo && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.0, type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Card className="bg-gradient-to-br from-purple-50/80 to-fuchsia-50/80 dark:from-purple-900/30 dark:to-fuchsia-900/30 border-purple-200/60 dark:border-purple-700/50 mb-3 overflow-hidden">
                    <CardContent className="p-4 relative">
                      {/* Animated sparkle background */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                          className="absolute top-2 right-4 w-2 h-2 bg-purple-400/60 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute bottom-3 left-6 w-1.5 h-1.5 bg-fuchsia-400/60 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                        />
                        <motion.div
                          className="absolute top-1/2 right-8 w-1 h-1 bg-pink-400/60 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
                        />
                      </div>
                      
                      {/* Badge Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-300/30 dark:shadow-purple-900/30"
                          initial={{ rotate: -15, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ delay: 1.1, type: "spring", stiffness: 300 }}
                        >
                          <Flame className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                              Mood Alchemist
                            </span>
                            {isMasterAlchemist && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.3, type: "spring" }}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold"
                              >
                                MASTER
                              </motion.span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                            {moodBlendInfo.title}
                          </p>
                        </div>
                      </div>
                      
                      {/* Blend Effects */}
                      <div className="space-y-2">
                        <p className="text-xs text-purple-700/80 dark:text-purple-200/80 leading-relaxed">
                          Your <span className="font-semibold">{moodBlendInfo.title}</span> mix unlocked deeper insights!
                        </p>
                        
                        {/* Trait Boosts Display */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {moodBlendInfo.combinedBoosts.slice(0, 3).map((boost, i) => (
                            <motion.div
                              key={boost.trait}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 1.2 + i * 0.1 }}
                              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${boost.color}20`,
                                color: boost.color,
                                border: `1px solid ${boost.color}40`
                              }}
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>{boost.trait}</span>
                              <span className="font-bold">{boost.amount}</span>
                            </motion.div>
                          ))}
                        </div>

                        {/* Proxy Impact Note */}
                        {(() => {
                          const moods = moodBlendKey.split('+');
                          let criticalBoost = 0;
                          let fpBoost = 0;
                          moods.forEach(m => {
                            const boosts = MOOD_PROXY_BOOSTS[m] || { critical: 0, firstPrinciples: 0 };
                            criticalBoost += boosts.critical;
                            fpBoost += boosts.firstPrinciples;
                          });
                          const hasProxyBoost = criticalBoost > 0 || fpBoost > 0;
                          
                          return hasProxyBoost && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.4 }}
                              className="mt-2 pt-2 border-t border-purple-200/50 dark:border-purple-700/50"
                            >
                              <p className="text-[11px] text-purple-600/70 dark:text-purple-300/70 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>
                                  Proxy boost:{" "}
                                  {criticalBoost > 0 && <span className="font-semibold">Critical +{criticalBoost}%</span>}
                                  {criticalBoost > 0 && fpBoost > 0 && ", "}
                                  {fpBoost > 0 && <span className="font-semibold">First Principles +{fpBoost}%</span>}
                                </span>
                              </p>
                            </motion.div>
                          );
                        })()}
                        
                        {/* Master Alchemist Progress */}
                        {!isMasterAlchemist && uniqueBlendsCount > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="mt-2 pt-2 border-t border-purple-200/50 dark:border-purple-700/50"
                          >
                            <p className="text-[10px] text-purple-500/70 dark:text-purple-400/70 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span>{uniqueBlendsCount}/3 unique blends toward Master Alchemist</span>
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Earned Badges */}
              {earnedBadges.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {earnedBadges.map((badge, i) => (
                    <motion.div
                      key={badge.name}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1.0 + i * 0.15, type: "spring" }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700"
                      data-testid={`badge-${badge.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Trophy className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                        {badge.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
            </motion.div>
          )}

          {/* ==================== PAGE 2: DETAILS ==================== */}
          {currentResultsPage === 2 && (
            <motion.div
              key="page-2-details"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
        {/* TIER 2: POST-FEEDBACK (FULL) - Unified Personality Profile Card */}
        {isFull && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white dark:bg-[#12121A] border border-gray-200 dark:border-[#A78BFA]/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#A78BFA]/20 bg-gray-50/50 dark:bg-[#12121A]/50">
                  <h3 className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-terracotta" />
                    Your Personality Profile
                  </h3>
                  <p className="text-xs text-warm-gray/50 dark:text-[#64748B] mt-0.5">Tap each to learn more</p>
                </div>
                
                {/* MBTI Row */}
                <details className="group border-b border-gray-100 dark:border-[#A78BFA]/20">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E2E]/30 transition-colors list-none">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-terracotta" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-warm-gray/50 dark:text-[#64748B] uppercase tracking-wide">Thinking Style</p>
                      <p className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC] leading-tight" data-testid="text-mbti">
                        {funMode && FUN_MODE_TITLES[result.mbtiType] 
                          ? FUN_MODE_TITLES[result.mbtiType]
                          : result.mbtiLabel}
                        <span className="text-xs font-mono text-terracotta ml-1.5">({result.mbtiType})</span>
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed pl-[52px]">
                      {result.mbtiDesc}
                    </p>
                  </div>
                </details>

                {/* DISC Row */}
                <details className="group border-b border-gray-100 dark:border-[#A78BFA]/20">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E2E]/30 transition-colors list-none">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage-green/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-sage-green" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-warm-gray/50 dark:text-[#64748B] uppercase tracking-wide">Work Style</p>
                      <p className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC] leading-tight" data-testid="text-disc">
                        {funMode && FUN_MODE_DISC[result.discStyle] 
                          ? FUN_MODE_DISC[result.discStyle].nickname 
                          : result.discLabel}
                        <span className="text-xs font-mono text-sage-green ml-1.5">({result.discStyle}-type)</span>
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed pl-[52px]">
                      {result.discDesc}
                    </p>
                  </div>
                </details>

                {/* Big Five Row */}
                {(() => {
                  const Icon = TRAIT_ICONS[topTrait[0] as keyof typeof TRAIT_ICONS];
                  const colors = TRAIT_COLORS[topTrait[0] as keyof typeof TRAIT_COLORS];
                  const quartileKey = getQuartileKey(topTrait[1]);
                  const quartileData = TRAIT_QUARTILE_DESCRIPTIONS[topTrait[0]]?.[quartileKey];
                  return (
                    <details className="group">
                      <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E2E]/30 transition-colors list-none">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg}/10 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-warm-gray/50 dark:text-[#64748B] uppercase tracking-wide">Core Strength</p>
                          <p className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC] leading-tight" data-testid="text-bigfive">
                            {TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]}
                            <span className={`text-xs font-mono ml-1.5 ${colors.text}`}>({topTrait[1]}%)</span>
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed pl-[52px]">
                          <span className="font-semibold">{quartileData?.vibe}:</span> {quartileData?.description}
                        </p>
                      </div>
                    </details>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isFull && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Card className="bg-white dark:bg-[#12121A] border border-gray-200 dark:border-[#A78BFA]/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-terracotta" aria-hidden="true" />
                  DISC Work Style Breakdown
                </CardTitle>
                <p className="text-xs text-warm-gray/60 dark:text-[#64748B] mt-1">
                  How your behavioral traits compare across work styles
                </p>
              </CardHeader>
              <CardContent className="pb-4 space-y-3">
                {(() => {
                  const discScores = {
                    D: scores.disc.D,
                    I: scores.disc.I,
                    S: scores.disc.S,
                    C: scores.disc.C,
                  };
                  const total = Object.values(discScores).reduce((sum, v) => sum + Math.abs(v), 0) || 1;
                  const discItems = [
                    { key: "D", label: "Dominance", color: "bg-terracotta", textColor: "text-terracotta", desc: "Direct, decisive, competitive" },
                    { key: "I", label: "Influence", color: "bg-amber-500", textColor: "text-amber-500", desc: "Enthusiastic, optimistic, collaborative" },
                    { key: "S", label: "Steadiness", color: "bg-sage-green", textColor: "text-sage-green", desc: "Patient, reliable, team-oriented" },
                    { key: "C", label: "Conscientiousness", color: "bg-dusty-blue", textColor: "text-dusty-blue", desc: "Analytical, precise, systematic" },
                  ];
                  const dominant = discItems.reduce((best, item) =>
                    Math.abs(discScores[item.key as keyof typeof discScores]) > Math.abs(discScores[best.key as keyof typeof discScores]) ? item : best
                  );

                  return discItems.map((item) => {
                    const raw = Math.abs(discScores[item.key as keyof typeof discScores]);
                    const pct = Math.round((raw / total) * 100);
                    const isDominant = item.key === dominant.key;

                    return (
                      <div key={item.key} className={`rounded-xl p-3 transition-all ${isDominant ? "bg-gray-50 dark:bg-[#1E1E2E]/50 ring-1 ring-gray-200 dark:ring-[#A78BFA]/20" : ""}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isDominant ? item.textColor : "text-warm-gray dark:text-[#F8FAFC]"}`}>
                              {item.label}
                            </span>
                            {isDominant && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta font-medium" data-testid="badge-disc-dominant">
                                Dominant
                              </span>
                            )}
                          </div>
                          <span className={`text-sm font-bold ${item.textColor}`} data-testid={`text-disc-pct-${item.key.toLowerCase()}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-[#1E1E2E] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-[11px] text-warm-gray/50 dark:text-[#64748B] mt-1">
                          {item.desc}
                        </p>
                      </div>
                    );
                  });
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Locale Insights Card - shows personalized insights based on location */}
        {isFull && localeInsight && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Card className="bg-gradient-to-br from-dusty-blue/10 to-sage-green/10 dark:from-dusty-blue/20 dark:to-sage-green/20 border-dusty-blue/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-dusty-blue/20 dark:bg-dusty-blue/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-dusty-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC]">
                        Your {localeInsight.city} Edge
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-dusty-blue/10 text-dusty-blue">
                        {localeInsight.metro}
                      </span>
                    </div>
                    <p className="text-sm text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed mb-3">
                      {getPersonalizedInsight(
                        cityName,
                        stateName,
                        result.mbtiType.startsWith('E'),
                        result.mbtiType.includes('T') || result.discStyle === 'C'
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {localeInsight.opportunities.slice(0, 4).map((opp) => (
                        <span 
                          key={opp}
                          className="text-xs px-2 py-1 rounded-full bg-sage-green/10 text-sage-green"
                        >
                          {opp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isFull && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-terracotta/10 via-amber-50 to-orange-50 dark:from-terracotta/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-lg border-2 border-terracotta/30 dark:border-terracotta/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center mb-4">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-amber-500 flex items-center justify-center mb-4 shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-warm-gray dark:text-[#F8FAFC] text-[22px]">
                    View Your Complete Results
                  </h3>
                  <p className="text-warm-gray/60 dark:text-[#64748B] mt-2 text-base max-w-xs">
                    See your full personality profile, Big Five traits, and personalized insights
                  </p>
                </div>

                <Button
                  onClick={handleShowFullResults}
                  className="w-full bg-terracotta hover:bg-terracotta/90 min-h-14 text-lg font-bold shadow-lg"
                  data-testid="button-show-full-results"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  See Full Results
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

            <AnimatePresence>
              {isFull && (
                <>
                  <motion.div
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="overflow-hidden bg-white dark:bg-[#12121A]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-terracotta" aria-hidden="true" />
                      Your Big Five Profile
                    </CardTitle>
                    <p className="text-xs text-warm-gray/60 dark:text-[#64748B] mt-1">
                      Tap any trait to learn more about what it means for you
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-3">
                    <div className="w-full flex justify-center mb-2" data-testid="chart-bigfive-radar">
                      <ResponsiveContainer width="100%" height={260}>
                        <RadarChart
                          data={Object.entries(result.bigFiveProfile).map(([key, val]) => ({
                            trait: TRAIT_LABELS[key as keyof typeof TRAIT_LABELS],
                            value: val,
                            fullMark: 100,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                        >
                          <PolarGrid stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                          <PolarAngleAxis
                            dataKey="trait"
                            tick={{ fill: 'currentColor', fontSize: 11, className: 'text-warm-gray/70 dark:text-[#94A3B8]' }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fontSize: 9, fill: 'currentColor', className: 'text-warm-gray/40 dark:text-[#64748B]' }}
                            tickCount={5}
                          />
                          <Radar
                            name="Big Five"
                            dataKey="value"
                            stroke="rgb(139, 92, 246)"
                            fill="rgba(139, 92, 246, 0.25)"
                            fillOpacity={1}
                            strokeWidth={2}
                            dot={{
                              r: 4,
                              fill: 'rgb(139, 92, 246)',
                              stroke: '#fff',
                              strokeWidth: 1.5,
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    {traitKeys.map((trait, index) => {
                      const Icon = TRAIT_ICONS[trait as keyof typeof TRAIT_ICONS];
                      const colors = TRAIT_COLORS[trait as keyof typeof TRAIT_COLORS];
                      const isSelected = selectedTrait === trait;
                      const value = result.bigFiveProfile[trait as keyof typeof result.bigFiveProfile];
                      const quartileKey = getQuartileKey(value);
                      const quartileData = TRAIT_QUARTILE_DESCRIPTIONS[trait]?.[quartileKey];
                      
                      return (
                        <div key={trait} className="space-y-2">
                          <button
                            ref={el => traitButtonsRef.current[index] = el}
                            onClick={() => handleTraitSelect(trait, index)}
                            onKeyDown={(e) => handleTraitKeyDown(e, trait, index)}
                            tabIndex={focusedTraitIndex === -1 ? (index === 0 ? 0 : -1) : (focusedTraitIndex === index ? 0 : -1)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                              isSelected 
                                ? `${colors.bg} text-white shadow-lg` 
                                : `bg-gray-50 dark:bg-[#1E1E2E]/50 hover:bg-gray-100 dark:hover:bg-[#1E1E2E]`
                            }`}
                            aria-pressed={isSelected}
                            aria-expanded={isSelected}
                            aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} ${value}%. ${isSelected ? "Selected, tap to collapse" : "Tap to learn more"}`}
                            data-testid={`button-trait-${trait.toLowerCase()}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-white/20' : colors.bg
                              }`}>
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white'}`} aria-hidden="true" />
                              </div>
                              <div>
                                <span className={`font-semibold ${isSelected ? 'text-white' : 'text-warm-gray dark:text-[#F8FAFC]'}`}>
                                  {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]}
                                </span>
                                {!isSelected && quartileData && (
                                  <p className={`text-xs ${colors.text} opacity-80`}>
                                    {quartileData.vibe}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className={`text-lg font-bold ${isSelected ? 'text-white' : colors.text}`}>
                                  {value}%
                                </span>
                                {(() => {
                                  const percentile = calculatePercentile(value, trait);
                                  const pLabel = getPercentileLabel(percentile);
                                  return (
                                    <p className={`text-[10px] ${isSelected ? 'text-white/80' : pLabel.color}`}>
                                      Top {100 - percentile}%
                                    </p>
                                  );
                                })()}
                              </div>
                              <ChevronDown className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-180 text-white' : 'text-warm-gray/40 dark:text-[#64748B]'}`} />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {isSelected && quartileData && (
                              <motion.div
                                initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div 
                                  className="p-4 rounded-xl bg-gray-50 dark:bg-[#1E1E2E]/50 border-l-4"
                                  style={{ borderColor: colors.border }}
                                  role="region"
                                  aria-live="polite"
                                  aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} details`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-sm font-bold ${colors.text}`}>
                                      {quartileData.vibe}
                                    </span>
                                    <span className="text-xs text-warm-gray/50 dark:text-[#64748B]">
                                      ({value <= 25 ? '0-25%' : value <= 50 ? '26-50%' : value <= 75 ? '51-75%' : '76-100%'})
                                    </span>
                                  </div>
                                  <p className="text-sm text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed mb-3">
                                    {quartileData.description}
                                  </p>
                                  {/* Percentile comparison */}
                                  {(() => {
                                    const percentile = calculatePercentile(value, trait);
                                    const pLabel = getPercentileLabel(percentile);
                                    return (
                                      <div className="flex items-center gap-2 pt-2 border-t border-warm-gray/10 dark:border-white/5">
                                        <TrendingUp className="w-3 h-3 text-warm-gray/40" />
                                        <span className={`text-xs font-medium ${pLabel.color}`}>
                                          {pLabel.label}
                                        </span>
                                        <span className="text-xs text-warm-gray/50 dark:text-[#64748B]">
                                          — You score higher than {percentile}% of people
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Growth Quests moved to Premium tier */}

              {funMode && FUN_MODE_ROASTS[result.mbtiType] && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <Card className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 border-violet-200 dark:border-violet-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">Fun Mode Roast</span>
                      </div>
                      <p className="text-sm text-violet-900 dark:text-violet-100 italic">
                        "{FUN_MODE_ROASTS[result.mbtiType]}"
                      </p>
                    </CardContent>
                  </Card>
                  
                  {FUN_MODE_DISC[result.discStyle] && (
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Your Vibe Check</span>
                        </div>
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          {FUN_MODE_DISC[result.discStyle].vibe}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Thinking Scales moved to Premium tier as combined "Analytical Thinking" */}


              {landmark && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="bg-dusty-blue/10 dark:bg-dusty-blue/20 border-dusty-blue/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-dusty-blue" />
                      <p className="text-sm text-dusty-blue">
                        Your journey started near <span className="font-semibold">{landmark}</span>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
                </>
              )}
            </AnimatePresence>
            </motion.div>
          )}

          {/* ==================== PAGE 3: PREMIUM ==================== */}
          {currentResultsPage === 3 && (
            <motion.div
              key="page-3-premium"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {isFull && (
                <>
                  {isPremiumUnlocked ? (
                    <motion.div
                      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-4"
                    >
                  {/* Premium Badge */}
                  <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/20 border-2 border-emerald-400 dark:border-emerald-600 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-bl-full" />
                    <CardContent className="p-5 text-center relative z-10">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg mb-3"
                      >
                        <Crown className="w-7 h-7 text-white" />
                      </motion.div>
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-1 text-[26px]">
                        Premium Unlocked
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Swipe through your personalized insights below
                      </p>
                    </CardContent>
                  </Card>

                  {/* Dream Role Advisor - Prominent Inline Section */}
                  <DreamRoleAdvisor 
                    bigFive={result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 }}
                    mbtiType={result?.mbtiType || "INTJ"}
                    discStyle={result?.discStyle || "C"}
                  />

                  {/* Interactive Premium Card Deck */}
                  <PremiumCardDeck 
                    result={result ? {
                      mbtiType: result.mbtiType,
                      mbtiLabel: result.mbtiLabel,
                      discStyle: result.discStyle,
                      discLabel: result.discLabel,
                      primaryRole: result.primaryRole,
                      secondaryRole: result.secondaryRole,
                      bigFiveProfile: result.bigFiveProfile,
                      scales: result.scales,
                    } : {
                      mbtiType: "INTJ",
                      mbtiLabel: "Architect",
                      discStyle: "C",
                      discLabel: "Conscientious",
                      primaryRole: { title: "Analyst", salary: "$60K-90K", desc: "A great fit for your analytical nature." },
                      secondaryRole: { title: "Strategist", salary: "$70K-100K", desc: "Your secondary strength lies in strategic thinking." },
                      bigFiveProfile: { O: 50, C: 50, E: 50, A: 50, N: 50 },
                      scales: undefined,
                    }}
                    topTrait={topTrait}
                    weakestTrait={getWeakestTrait(result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 })}
                    getWeaknessBlindspots={getWeaknessBlindspots}
                    CAREER_SIMULATOR={CAREER_SIMULATOR}
                    SIDE_HUSTLES={SIDE_HUSTLES}
                    LEARNING_STYLES={LEARNING_STYLES}
                    GROWTH_QUESTS={GROWTH_QUESTS}
                    TRAIT_LABELS={TRAIT_LABELS}
                    onCrossroadsClick={handleCrossroadsClick}
                  />

                  {/* Phase 3 & 4: Advanced Features */}
                  <div className="space-y-4 mt-6">
                    {/* Personality Evolution Timeline */}
                    <PersonalityEvolutionTimeline 
                      mbtiType={result?.mbtiType || "INTJ"}
                      bigFiveProfile={result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 }}
                      tier={tier}
                    />
                    
                    {/* Personality Arc Tracker */}
                    <ArcTracker />
                  </div>

                </motion.div>
              ) : (
                /* COMPELLING CTA - Locked State */
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 border-2 border-amber-400/50 dark:border-amber-600/50 overflow-hidden relative">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-300/20 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-300/20 to-transparent rounded-tr-full" />
                    
                    <CardContent className="p-6 relative z-10">
                      {/* Premium badge */}
                      <div className="text-center mb-5">
                        <motion.div 
                          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-400 shadow-lg shadow-orange-500/30 mb-4"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Crown className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1 text-[26px]">
                          Unlock Your Full Potential
                        </h4>
                      </div>
                      
                      {/* Feature list - 3 features only */}
                      <div className="space-y-3 mb-5">
                        {[
                          { icon: BookOpen, title: "Deep Dive", desc: "Full analysis" },
                          { icon: Gift, title: "Role Matches", desc: "More career paths" },
                          { icon: Target, title: "Blindspots", desc: "Personalized blindspots and solutions" },
                        ].map((feature, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-[#12121A]/40 border border-amber-200/50 dark:border-amber-700/50"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                              <feature.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-amber-900 dark:text-amber-100 text-[22px]">{feature.title}</p>
                              <p className="text-amber-600 dark:text-amber-400 text-[15px]">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* One Large CTA Button with Price */}
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-8 shadow-lg shadow-orange-500/30 transition-all flex flex-col items-center justify-center gap-1"
                        onClick={handleUpgrade}
                        disabled={isCheckingOut}
                        data-testid="button-upgrade"
                      >
                        {isCheckingOut ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold flex items-center gap-2 text-[22px]">
                              <Rocket className="w-5 h-5" />
                              Unlock Premium Now
                              <ArrowRight className="w-5 h-5" />
                            </span>
                            <span className="font-normal opacity-90 text-[15px]">Lifetime access. No Subscription. Ever.</span>
                          </>
                        )}
                      </Button>
                      
                      {/* Trust badges */}
                      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-amber-600/70 dark:text-amber-400/70">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Secure checkout
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          Support indie dev
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
          </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Unified Unlock Insights Modal */}
      <UnlockInsightsModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onProceedFree={() => {
          setIsPremiumUnlocked(true);
          setCurrentResultsPage(3);
        }}
        onDonate={(amount) => handleDonationTierSelect(amount)}
      />

      {/* Privacy Badge */}
      <div className="fixed bottom-[68px] left-0 right-0 z-30 flex justify-center pointer-events-none" data-testid="privacy-badge">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-sm border border-gray-200 dark:border-[#A78BFA]/10 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Your results are processed locally and not stored on our servers</span>
        </div>
      </div>

      {/* Dynamic Footer based on current page */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 bg-white dark:bg-[#0A0A0F] border-t border-gray-200 dark:border-[#A78BFA]/20">
        <div className="max-w-md mx-auto flex gap-2">
          {/* Back Button - Pages 2 and 3 */}
          {currentResultsPage > 1 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentResultsPage((currentResultsPage - 1) as 1 | 2 | 3)}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRestart}
            data-testid="button-restart"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Restart
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowSharePDFModal(true)}
            data-testid="button-download-pdf"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
          
          {/* Forward Navigation Button */}
          {currentResultsPage === 1 && (
            <Button
              className="flex-1 bg-terracotta hover:bg-terracotta/90"
              onClick={() => {
                setDashboardStage("full");
                setCurrentResultsPage(2);
              }}
              data-testid="button-more-details"
            >
              Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {currentResultsPage === 2 && (
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              onClick={() => {
                if (isPremiumUnlocked) {
                  setCurrentResultsPage(3);
                } else {
                  setShowUnlockModal(true);
                }
              }}
              data-testid="button-learn-more"
            >
              {isPremiumUnlocked ? (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  View Insights
                </>
              ) : (
                <>
                  Want to Know More?
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
      
      {/* Share PDF Modal */}
      {result && (
        <SharePDFModal
          isOpen={showSharePDFModal}
          onClose={() => setShowSharePDFModal(false)}
          sessionId={sessionId || ""}
          result={{
            mbtiType: result.mbtiType,
            discStyle: result.discStyle,
            bigFiveProfile: result.bigFiveProfile,
            title: result.primaryRole.title,
            spark: result.spark,
          }}
          mood={mood}
          tier={tier}
        />
      )}
      
    </div>
  );
}
