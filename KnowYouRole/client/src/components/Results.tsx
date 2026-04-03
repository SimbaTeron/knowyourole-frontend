import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Trophy, Heart, RefreshCw, Share2,
  ChevronRight, Crown, Shield, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizScores } from "./Quiz";
import { useToast } from "@/hooks/use-toast";
import { useLocalityTheme } from "@/contexts/LocalityThemeContext";
import { getLocaleInsight } from "@/data/localeInsights";
import { SharePDFModal } from "./SharePDFModal";
import { ShareableResultCard } from "./ShareableResultCard";
import { UnlockInsightsModal } from "./UnlockInsightsModal";
import { celebrateAchievement } from "@/lib/confetti";
import { HYBRID_HINTS, getHybridKey, type BlendInfo } from "./MoodAlchemyLab";
import { useAuth } from "@/hooks/useAuth";
import careerReasoningData from "@/data/careerReasoning.json";
import { isTestMode, isTestForcePremium, getFakeScores, getFakeMBTIType, getFakeDiscStyle } from "@/utils/devTest";
import {
  type JobMatch, type PersonalityResult, type ResultsProps, type AdventureArchetype,
  calculateResult,
} from "./results/resultsData";
import { ResultsOverlays, type OverlayState } from "./results/ResultsOverlays";
import { ResultsPage1 } from "./results/ResultsPage1";
import { ResultsPage2 } from "./results/ResultsPage2";
import { ResultsPage3 } from "./results/ResultsPage3";
import type { ResultsState } from "./results/ResultsTypes";

export default function Results({ scores, tier, mood, funMode, landmark, theme, sessionId, apiScales, earnedBadges = [], hybridTypes = [], startOnPremiumPage = false, onRestart, onShare, onDownloadPDF }: ResultsProps) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── URL-based page routing ──────────────────────────────────────
  // ?page=1 → Page 1 (MBTI/DISC/Big5) — free, no auth
  // ?page=2 → Page 2 (career/locale) — auth required
  // ?page=3 → Page 3 (premium) — ?force=true bypasses paywall for testing
  const urlParams = new URLSearchParams(window.location.search);
  const urlPage = urlParams.get("page");
  const urlPageNum: 1 | 2 | 3 | null = urlPage === "2" ? 2 : urlPage === "3" ? 3 : null;
  const isUrlForcePremium = urlParams.get("force") === "true" && urlPage === "3";
  const isTestPremium = isTestMode() || isTestForcePremium() || urlParams.get("test_premium") === "true" || isUrlForcePremium;

  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [focusedTraitIndex, setFocusedTraitIndex] = useState<number>(-1);
  const { teamName, cityName, stateName, isLocalitySet } = useLocalityTheme();
  const localeInsight = cityName ? getLocaleInsight(cityName, stateName || undefined) : null;

  // ── Dev Test Mode: Inject fake scores when ?test=true ────────
  // Only active on localhost
  const testTier = isTestMode() ? (new URLSearchParams(window.location.search).get("tier") || tier) : tier;
  const effectiveScores = isTestMode() ? getFakeScores(testTier) as unknown as QuizScores : scores;
  const effectiveTier = isTestMode() ? testTier : tier;

  const [dashboardStage, setDashboardStage] = useState<"teaser" | "full">(isTestPremium ? "full" : "teaser");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(isTestPremium || startOnPremiumPage);

  const isMiniExplorer = effectiveTier === "7-12";
  const [adventureArchetype, setAdventureArchetype] = useState<AdventureArchetype | null>(null);
  const [topJobMatch, setTopJobMatch] = useState<JobMatch | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [jobMatchLoading, setJobMatchLoading] = useState(false);

  const [showJustKidding, setShowJustKidding] = useState(false);
  const [showDonationTiers, setShowDonationTiers] = useState(false);
  const [customDonationAmount, setCustomDonationAmount] = useState(0);

  const [showValidation, setShowValidation] = useState(false);
  const [validationStep, setValidationStep] = useState(0);
  const [validationAnswers, setValidationAnswers] = useState<string[]>([]);
  const [mbtiMatchAnswer, setMbtiMatchAnswer] = useState<string>("");
  const [opennessRating, setOpennessRating] = useState<number>(0);
  const [showRefinedMessage, setShowRefinedMessage] = useState(false);
  const [adjustedBigFive, setAdjustedBigFive] = useState<{ O: number; C: number; E: number; A: number; N: number } | null>(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackCompleted, setFeedbackCompleted] = useState(() => sessionStorage.getItem("knowrole-feedback-completed") === "true");
  const [pendingCrossroads, setPendingCrossroads] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [usefulApp, setUsefulApp] = useState<string>("");
  const [resultsAccurate, setResultsAccurate] = useState<string>("");
  const [questionsEngaging, setQuestionsEngaging] = useState<string>("");
  const [wouldShare, setWouldShare] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [showSharePDFModal, setShowSharePDFModal] = useState(false);
  const [showShareCardModal, setShowShareCardModal] = useState(false);
  // Start on URL-specified page, or page 3 if startOnPremiumPage, else page 1
  const [currentResultsPage, setCurrentResultsPage] = useState<1 | 2 | 3>(
    urlPageNum === 2 ? 2 : urlPageNum === 3 ? 3 : startOnPremiumPage ? 3 : 1
  );
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const { user, isAuthenticated, isLoading: isAuthLoading, isPremium } = useAuth();

  // ── Page 2 Auth Gating ─────────────────────────────────────────
  // If ?page=2 in URL and user is not authenticated, redirect to login
  // Skip if ?test=true (dev test mode bypasses auth)
  useEffect(() => {
    if (isAuthLoading) return;
    if (isTestMode()) return; // Dev test mode — skip auth
    if (urlPageNum === 2 && !isAuthenticated) {
      const returnTo = window.location.pathname + window.location.search;
      sessionStorage.setItem("knowrole-auth-returnTo", returnTo);
      window.location.href = "/auth?returnTo=" + encodeURIComponent(returnTo);
    }
  }, [isAuthLoading, isAuthenticated, urlPageNum]);

  const [moodBlendInfo, setMoodBlendInfo] = useState<BlendInfo | null>(null);
  const [moodBlendKey, setMoodBlendKey] = useState<string>("");
  const [isMasterAlchemist, setIsMasterAlchemist] = useState(false);
  const [uniqueBlendsCount, setUniqueBlendsCount] = useState(0);

  const traitButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();

  useEffect(() => {
    const calculated = calculateResult(effectiveScores);
    if (apiScales) calculated.scales = apiScales;
    // Override MBTI and DISC with deterministic fake types for test mode
    if (isTestMode()) {
      const fakeScores = getFakeScores(testTier);
      calculated.mbtiType = getFakeMBTIType(fakeScores);
      calculated.discStyle = getFakeDiscStyle(fakeScores);
    }
    setResult(calculated);
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
    if (isTestPremium) console.log('[DEV MODE] Premium features unlocked for testing via ?test=true');
  }, [effectiveScores, apiScales, isTestPremium]);

  useEffect(() => {
    if (!isAuthenticated || !user || !result || !sessionId) return;
    const saveKey = `knowrole-saved-result-${sessionId}`;
    if (sessionStorage.getItem(saveKey)) return;
    const saveQuizResult = async () => {
      try {
        const response = await fetch('/api/quiz-results', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ sessionId, tier, mood, mbtiType: result.mbtiType, discStyle: result.discStyle, bigFiveScores: result.bigFiveProfile, roleRecommendations: result.primaryRole ? [result.primaryRole.title] : [], responses: scores.responses }),
        });
        if (response.ok) { sessionStorage.setItem(saveKey, 'true'); }
      } catch (error) { console.error('Failed to save quiz results:', error); }
    };
    saveQuizResult();
  }, [isAuthenticated, user, result, sessionId, tier, mood, scores.responses]);

  useEffect(() => {
    const storedBlend = sessionStorage.getItem("knowrole-mood-blend");
    if (!storedBlend || storedBlend === "neutral") return;
    const moods = storedBlend.toLowerCase().split('+').map(m => m.trim());
    if (moods.length < 2) return;
    const blendKey = getHybridKey(moods[0], moods[1]);
    const blendInfo = HYBRID_HINTS[blendKey];
    if (blendInfo) {
      setMoodBlendInfo(blendInfo);
      setMoodBlendKey(blendKey);
      const STORAGE_KEY = "knowrole-unique-blends";
      try {
        const existingBlends = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
        if (!existingBlends.includes(blendKey)) {
          const updatedBlends = [...existingBlends, blendKey];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBlends));
          setUniqueBlendsCount(updatedBlends.length);
          if (updatedBlends.length >= 3) setIsMasterAlchemist(true);
        } else {
          setUniqueBlendsCount(existingBlends.length);
          setIsMasterAlchemist(existingBlends.length >= 3);
        }
      } catch (e) { console.error("Error tracking unique blends:", e); }
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    const fetchArchetype = async () => {
      try {
        const response = await fetch('/api/adventure-archetype', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ openness: result.bigFiveProfile.O, conscientiousness: result.bigFiveProfile.C, extraversion: result.bigFiveProfile.E, agreeableness: result.bigFiveProfile.A, neuroticism: result.bigFiveProfile.N, mbtiType: result.mbtiType, discStyle: result.discStyle }),
        });
        if (!response.ok) throw new Error('Failed to fetch archetype');
        setAdventureArchetype(await response.json());
      } catch (error) {
        console.error('Failed to fetch adventure archetype:', error);
        setAdventureArchetype({ name: "The Explorer", superpower: "You discover what others miss!", description: "You're always curious and asking 'why?' You love learning new things.", mission: "Find something new to explore today!", badgeColor: "#10B981" });
      }
    };
    fetchArchetype();
  }, [result]);

  useEffect(() => {
    if (!result || isMiniExplorer) return;
    const fetchJobMatches = async () => {
      setJobMatchLoading(true);
      try {
        const requestBody = { mbti: { E: scores.mbti.E, I: scores.mbti.I, S: scores.mbti.S, N: scores.mbti.N, T: scores.mbti.T, F: scores.mbti.F, J: scores.mbti.J, P: scores.mbti.P }, disc: { D: scores.disc.D, I: scores.disc.I, S: scores.disc.S, C: scores.disc.C }, bigFive: { O: result.bigFiveProfile.O, C: result.bigFiveProfile.C, E: result.bigFiveProfile.E, A: result.bigFiveProfile.A, N: result.bigFiveProfile.N } };
        const topResponse = await fetch('/api/job-match/top', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
        if (topResponse.ok) { const topData = await topResponse.json(); if (topData.success && topData.match) {
          const enrichedMatch = { ...topData.match };
          // Inject unique career reasoning from careerReasoning.json
          const bigFiveEntries = Object.entries(result.bigFiveProfile) as [string, number][];
          const sortedBigFive = bigFiveEntries.sort((a, b) => b[1] - a[1]);
          const topTrait = sortedBigFive[0][0].toLowerCase();
          const reasoningKey = `${result.mbtiType.toLowerCase()}-${(result.discStyle || '').toLowerCase()}-${topTrait}-high`;
          const reasoningEntry = (careerReasoningData as Record<string, { reasoning: string }>)[reasoningKey];
          if (reasoningEntry?.reasoning) {
            enrichedMatch.reason = reasoningEntry.reasoning;
          }
          setTopJobMatch(enrichedMatch);
        } }
        const matchesResponse = await fetch('/api/job-matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...requestBody, limit: 3, diversityBoost: true }) });
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          if (matchesData.success && matchesData.matches) {
            const seen = new Set<string>();
            const unique = (matchesData.matches as JobMatch[]).filter(m => { const key = m.roleName.toLowerCase().trim(); if (seen.has(key)) return false; seen.add(key); return true; });
            setJobMatches(unique);
          }
        }
      } catch (error) { console.error('Failed to fetch job matches:', error); }
      finally { setJobMatchLoading(false); }
    };
    fetchJobMatches();
  }, [result, isMiniExplorer, scores]);

  const DEV_BYPASS_PAYMENT = true;

  const handleValidationSubmit = () => {
    if (!mbtiMatchAnswer || opennessRating === 0) return;
    const validationResponses = { mbtiMatch: mbtiMatchAnswer, opennessRating, mbtiType: result?.mbtiType || "", originalOpenness: result?.bigFiveProfile.O || 50, timestamp: new Date().toISOString() };
    localStorage.setItem('knowrole-validation-responses', JSON.stringify(validationResponses));
    let adjustedProfile = { ...result!.bigFiveProfile };
    if (mbtiMatchAnswer === "no" || mbtiMatchAnswer === "somewhat") {
      adjustedProfile = { O: Math.min(100, Math.round(adjustedProfile.O * 1.05)), C: Math.min(100, Math.round(adjustedProfile.C * 1.05)), E: Math.min(100, Math.round(adjustedProfile.E * 1.05)), A: Math.min(100, Math.round(adjustedProfile.A * 1.05)), N: Math.min(100, Math.round(adjustedProfile.N * 1.05)) };
    }
    if (opennessRating < 3) {
      const currentO = adjustedProfile.O;
      adjustedProfile.O = currentO > 50 ? Math.max(5, Math.round(currentO * 0.95)) : Math.min(95, Math.round(currentO * 1.05));
    }
    setAdjustedBigFive(adjustedProfile);
    localStorage.setItem('knowrole-validation-responses', JSON.stringify({ ...validationResponses, adjustedOpenness: adjustedProfile.O, adjustedProfile }));
    setShowValidation(false);
    setShowRefinedMessage(true);
    setTimeout(() => { setShowRefinedMessage(false); setShowJustKidding(true); }, 2500);
  };

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    if (DEV_BYPASS_PAYMENT) { setShowValidation(true); setValidationStep(0); setValidationAnswers([]); setIsCheckingOut(false); return; }
    try {
      const productsRes = await fetch('/api/stripe/products');
      const productsData = await productsRes.json();
      const proProduct = productsData.products?.find((p: { metadata?: { tier?: string }; name?: string }) => p.metadata?.tier === 'pro' || p.name === 'KnowRole Pro');
      if (!proProduct || !proProduct.prices?.length) throw new Error('Pro product not found');
      const checkoutRes = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId: proProduct.prices[0].id, sessionId: sessionId || undefined }) });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) { window.location.href = checkoutData.url; } else { throw new Error('No checkout URL returned'); }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ title: "Checkout Error", description: "Unable to start checkout. Please try again.", variant: "destructive" });
      setIsCheckingOut(false);
    }
  };

  const allFeedbackAnswered = usefulApp !== "" && resultsAccurate !== "" && questionsEngaging !== "" && wouldShare !== "";

  useEffect(() => {
    if (isPremiumUnlocked && !feedbackCompleted) { feedbackTimerRef.current = setTimeout(() => setShowFeedbackModal(true), 30000); }
    return () => { if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current); };
  }, [isPremiumUnlocked, feedbackCompleted]);

  const handleCrossroadsClick = () => { if (!feedbackCompleted) { setPendingCrossroads(true); setShowFeedbackModal(true); } else { window.location.href = "/crossroads"; } };

  const handleFeedbackSubmit = async () => {
    if (!allFeedbackAnswered || isSubmittingFeedback || feedbackCompleted) return;
    setIsSubmittingFeedback(true);
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sessionId || null, usefulApp, resultsAccurate, questionsEngaging, wouldShare, suggestions, mbtiType: result?.mbtiType || null, discStyle: result?.discStyle || null, primaryRole: result?.primaryRole.title || null, tier, mood, funMode, timestamp: new Date().toISOString() }) });
      if (!response.ok) throw new Error("Server error");
    } catch (error) {
      console.error("Failed to save feedback:", error);
      setIsSubmittingFeedback(false);
      toast({ title: "Oops", description: "Could not save feedback. Please try again.", variant: "destructive" });
      return;
    }
    setFeedbackCompleted(true);
    sessionStorage.setItem("knowrole-feedback-completed", "true");
    setShowFeedbackModal(false);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (pendingCrossroads) { setPendingCrossroads(false); window.location.href = "/crossroads"; }
  };

  const handleShowFullResults = () => { if (navigator.vibrate) navigator.vibrate([30, 20, 30]); setDashboardStage("full"); };
  const handleTraitSelect = (trait: string, index: number) => { setSelectedTrait(selectedTrait === trait ? null : trait); setFocusedTraitIndex(index); if (navigator.vibrate) navigator.vibrate(30); };
  const handleTraitKeyDown = (e: React.KeyboardEvent, trait: string, index: number) => {
    const tk = Object.keys(result?.bigFiveProfile || {});
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleTraitSelect(trait, index); }
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); const n = (index + 1) % tk.length; setFocusedTraitIndex(n); traitButtonsRef.current[n]?.focus(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); const p = (index - 1 + tk.length) % tk.length; setFocusedTraitIndex(p); traitButtonsRef.current[p]?.focus(); }
  };

  const handleProceedToResults = () => { if (navigator.vibrate) navigator.vibrate([30, 20, 30]); setShowJustKidding(false); setIsPremiumUnlocked(true); setTimeout(() => celebrateAchievement('premium'), 300); };
  const handleDonateClick = () => { setShowDonationTiers(true); };
  const handleDonationTierSelect = async (amount: number) => {
    try {
      const donationState = { scores, tier, mood, funMode, landmark, theme, sessionId, apiScales, earnedBadges, hybridTypes, timestamp: Date.now() };
      localStorage.setItem('knowrole-donation-state', JSON.stringify(donationState));
      const checkoutRes = await fetch('/api/stripe/donate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, sessionId: sessionId || undefined }) });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) { toast({ title: "Donation Error", description: checkoutData.error || "Failed to create checkout session", variant: "destructive" }); return; }
      if (checkoutData.url) { window.location.href = checkoutData.url; } else { toast({ title: "Donation Error", description: "Failed to get checkout URL. Please try again.", variant: "destructive" }); }
    } catch (error) { console.error('[Donation] Error:', error); toast({ title: "Donation Error", description: "Unable to process donation. Please try again.", variant: "destructive" }); }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0F]">
        <motion.div animate={shouldReduceMotion ? {} : { rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full" role="status" aria-label="Loading results" />
      </div>
    );
  }

  const sortedBigFive = Object.entries(result.bigFiveProfile).sort((a, b) => b[1] - a[1]);
  const topTwoTraits = sortedBigFive.slice(0, 2);
  const topTrait = sortedBigFive[0];
  const traitKeys = Object.keys(result.bigFiveProfile);
  const isFull = dashboardStage === "full";

  const pageState: ResultsState = {
    result, scores, tier, mood, funMode, landmark, theme, sessionId, apiScales, earnedBadges, hybridTypes,
    isMiniExplorer, adventureArchetype, topJobMatch, jobMatches, jobMatchLoading,
    isPremiumUnlocked, setIsPremiumUnlocked, isFull, shouldReduceMotion,
    currentResultsPage, setCurrentResultsPage,
    selectedTrait, focusedTraitIndex, traitButtonsRef,
    cityName, stateName, localeInsight,
    moodBlendInfo, moodBlendKey, isMasterAlchemist, uniqueBlendsCount,
    sortedBigFive, topTwoTraits, topTrait, traitKeys,
    isCheckingOut, showUnlockModal, setShowUnlockModal,
    handleShowFullResults, handleTraitSelect, handleTraitKeyDown,
    handleUpgrade, handleCrossroadsClick, handleDonationTierSelect,
    isAuthenticated,
    onRestart,
  };

  const overlayState: OverlayState = {
    result, showValidation, mbtiMatchAnswer, setMbtiMatchAnswer,
    opennessRating, setOpennessRating, handleValidationSubmit,
    showRefinedMessage, showJustKidding,
    handleProceedToResults, handleDonateClick,
    showDonationTiers, setShowDonationTiers,
    handleDonationTierSelect, customDonationAmount, setCustomDonationAmount,
    showFeedbackModal, usefulApp, setUsefulApp,
    resultsAccurate, setResultsAccurate,
    questionsEngaging, setQuestionsEngaging,
    wouldShare, setWouldShare,
    suggestions, setSuggestions,
    allFeedbackAnswered, isSubmittingFeedback,
    feedbackCompleted, pendingCrossroads, handleFeedbackSubmit,
  };

  return (
    <div
      className="min-h-screen pb-36"
      style={{
        background: "radial-gradient(ellipse 100% 60% at 50% -20%, rgba(168, 85, 247, 0.2) 0%, transparent 60%), radial-gradient(ellipse 80% 50% at 80% 110%, rgba(34, 211, 238, 0.1) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 10% 80%, rgba(244, 114, 182, 0.08) 0%, transparent 50%), #080414",
        minHeight: "100vh",
      }}
    >
      <ResultsOverlays s={overlayState} />

      {isTestPremium && (
        <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="sticky top-0 z-50 shadow-lg" data-testid="banner-test-premium">
          <div className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 px-4 pt-4 pb-5">
            <div className="max-w-md mx-auto text-center">
              <p className="text-2xl font-bold text-white italic mb-3" style={{ fontFamily: "'Georgia', serif", textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>Just Kidding!</p>
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-2 shadow-md"><Crown className="w-7 h-7 text-teal-500" /></div>
              <p className="text-lg font-bold text-teal-700 mb-1">Premium Unlocked</p>
              <p className="text-sm text-gray-600">Welcome to your full personality journey</p>
            </div>
          </div>
          <Button className="w-full rounded-none bg-teal-500 hover:bg-teal-600 text-white text-lg font-bold py-6 h-auto shadow-md" onClick={handleDonateClick} data-testid="button-donate-here">
            <Heart className="w-5 h-5 mr-2 fill-current" />DONATE HERE
          </Button>
        </motion.div>
      )}

      {currentResultsPage === 1 && (
        <header className={`${isTestPremium ? 'pt-6' : 'pt-6'} pb-4 px-4 text-center`}>
          <motion.p initial={shouldReduceMotion ? {} : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm" style={{ color: "var(--text-muted)" }}>
            Based on your {scores.responses.length} path choices
          </motion.p>
        </header>
      )}

      <main className="px-4 max-w-md mx-auto space-y-6">
        <AnimatePresence mode="wait">
          {currentResultsPage === 1 && <ResultsPage1 s={pageState} />}
          {currentResultsPage === 2 && <ResultsPage2 s={pageState} />}
          {currentResultsPage === 3 && <ResultsPage3 s={pageState} />}
        </AnimatePresence>
      </main>

      <UnlockInsightsModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onProceedFree={() => { setIsPremiumUnlocked(true); setCurrentResultsPage(3); }}
        onDonate={(amount) => handleDonationTierSelect(amount)}
      />

      <div className="fixed bottom-[68px] left-0 right-0 z-30 flex justify-center pointer-events-none" data-testid="privacy-badge">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs"
          style={{
            background: "rgba(8,4,20,0.7)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-dim)",
          }}>
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Your results are processed locally — nothing stored on servers</span>
        </div>
      </div>

      <footer
        className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3"
        style={{
          background: "rgba(8, 4, 20, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--glass-border)",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="max-w-md mx-auto flex gap-2">
          {currentResultsPage > 1 && (
            <Button
              size="icon"
              onClick={() => setCurrentResultsPage((currentResultsPage - 1) as 1 | 2 | 3)}
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <button
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}
            onClick={onRestart}
            data-testid="button-restart"
          >
            <RefreshCw className="w-3.5 h-3.5" />Restart
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}
            onClick={() => setShowShareCardModal(true)}
            data-testid="button-share-card"
          >
            <Share2 className="w-3.5 h-3.5" />Share
          </button>
          {currentResultsPage === 1 && (
            <button
              className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border-bright)",
                color: "var(--text-muted)",
              }}
              onClick={() => {
                if (!isAuthenticated) {
                  const returnTo = window.location.pathname + "?page=2" + window.location.hash;
                  sessionStorage.setItem("knowrole-auth-returnTo", returnTo);
                  window.location.href = "/auth?returnTo=" + encodeURIComponent(returnTo);
                  return;
                }
                setDashboardStage("full");
                setCurrentResultsPage(2);
              }}
              data-testid="button-more-details"
            >
              {isAuthenticated ? (<><Sparkles className="w-3.5 h-3.5" />Full Portrait</>) : (<><Sparkles className="w-3.5 h-3.5" />Log In for More</>)}
            </button>
          )}
          {currentResultsPage === 2 && (
            <button
              className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: isPremiumUnlocked
                  ? "linear-gradient(135deg, var(--teal, #06b6d4), #0891b2)"
                  : "var(--glass-bg)",
                border: isPremiumUnlocked ? "none" : "1px solid var(--glass-border-bright)",
                color: isPremiumUnlocked ? "#022c22" : "var(--text-muted)",
                boxShadow: isPremiumUnlocked ? "0 4px 20px rgba(6,182,212,0.3)" : "none",
              }}
              onClick={() => { if (isPremiumUnlocked) setCurrentResultsPage(3); else setShowUnlockModal(true); }}
              data-testid="button-learn-more"
            >
              {isPremiumUnlocked ? (
                <><Sparkles className="w-3.5 h-3.5" />Premium</>
              ) : (
                <><Crown className="w-3.5 h-3.5" />Unlock Premium<ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          )}
        </div>
      </footer>

      {result && (
        <>
          <SharePDFModal isOpen={showSharePDFModal} onClose={() => setShowSharePDFModal(false)} sessionId={sessionId || ""} result={{ mbtiType: result.mbtiType, discStyle: result.discStyle, bigFiveProfile: result.bigFiveProfile, title: result.primaryRole.title, spark: result.spark }} mood={mood} tier={tier} />
          <ShareableResultCard
            isOpen={showShareCardModal}
            onClose={() => setShowShareCardModal(false)}
            sessionId={sessionId || undefined}
            funMode={funMode}
            result={{
              mbtiType: result.mbtiType,
              mbtiLabel: result.mbtiLabel,
              discStyle: result.discStyle,
              discLabel: result.discLabel,
              bigFiveProfile: result.bigFiveProfile,
              primaryRole: result.primaryRole,
              moodBlendTitle: moodBlendInfo?.title,
              moodBlendEmoji: moodBlendInfo?.emoji,
            }}
          />
        </>
      )}
    </div>
  );
}
