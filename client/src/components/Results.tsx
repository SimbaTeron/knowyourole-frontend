"use client";

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
import { UnlockInsightsModal } from "./UnlockInsightsModal";
import { celebrateAchievement } from "@/lib/confetti";
import { HYBRID_HINTS, getHybridKey, type BlendInfo } from "./MoodAlchemyLab";
import { useAuth } from "@/hooks/useAuth";
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

  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [focusedTraitIndex, setFocusedTraitIndex] = useState<number>(-1);
  const { teamName, cityName, stateName, isLocalitySet } = useLocalityTheme();
  const localeInsight = cityName ? getLocaleInsight(cityName, stateName || undefined) : null;

  const isTestPremium = new URLSearchParams(window.location.search).get('test_premium') === 'true';
  const [dashboardStage, setDashboardStage] = useState<"teaser" | "full">(isTestPremium ? "full" : "teaser");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(isTestPremium || startOnPremiumPage);

  const isMiniExplorer = tier === "7-12";
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
  const [currentResultsPage, setCurrentResultsPage] = useState<1 | 2 | 3>(startOnPremiumPage ? 3 : 1);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const { user, isAuthenticated, isLoading: isAuthLoading, isPremium } = useAuth();

  const [moodBlendInfo, setMoodBlendInfo] = useState<BlendInfo | null>(null);
  const [moodBlendKey, setMoodBlendKey] = useState<string>("");
  const [isMasterAlchemist, setIsMasterAlchemist] = useState(false);
  const [uniqueBlendsCount, setUniqueBlendsCount] = useState(0);

  const traitButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();

  useEffect(() => {
    const calculated = calculateResult(scores);
    if (apiScales) calculated.scales = apiScales;
    setResult(calculated);
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
    if (isTestPremium) console.log('[DEV MODE] Premium features unlocked for testing via ?test_premium=true');
  }, [scores, apiScales, isTestPremium]);

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
    const storedBlend = sessionStorage.getItem("kyr_mood_blend");
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
        if (topResponse.ok) { const topData = await topResponse.json(); if (topData.success && topData.match) setTopJobMatch(topData.match); }
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

  const DEV_BYPASS_PAYMENT = import.meta.env.DEV;

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
    <div className="min-h-screen pb-36 bg-white dark:bg-[#0A0A0F]">
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

      <header className={`${isTestPremium ? 'pt-6' : 'pt-10'} pb-6 px-4 text-center`}>
        <motion.div initial={shouldReduceMotion ? {} : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-dusty-blue mb-3">
          <Trophy className="w-8 h-8 text-soft-cream" aria-hidden="true" />
        </motion.div>
        <motion.h1 initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-display font-bold text-warm-gray dark:text-[#F8FAFC] mb-2" data-testid="text-result-title">
          {isFull ? "Your Personality Map" : "Your Quick Glimpse"}
        </motion.h1>
        <motion.p initial={shouldReduceMotion ? {} : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
          Based on your {scores.responses.length} path choices
        </motion.p>
      </header>

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
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-sm border border-gray-200 dark:border-[#A78BFA]/10 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Your results are processed locally and not stored on our servers</span>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 bg-white dark:bg-[#0A0A0F] border-t border-gray-200 dark:border-[#A78BFA]/20">
        <div className="max-w-md mx-auto flex gap-2">
          {currentResultsPage > 1 && (
            <Button variant="outline" size="icon" onClick={() => setCurrentResultsPage((currentResultsPage - 1) as 1 | 2 | 3)} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={onRestart} data-testid="button-restart">
            <RefreshCw className="w-4 h-4 mr-1" />Restart
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setShowSharePDFModal(true)} data-testid="button-download-pdf">
            <Share2 className="w-4 h-4 mr-1" />Share
          </Button>
          {currentResultsPage === 1 && (
            <Button className="flex-1 bg-terracotta hover:bg-terracotta/90" onClick={() => { setDashboardStage("full"); setCurrentResultsPage(2); }} data-testid="button-more-details">
              Details<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {currentResultsPage === 2 && (
            <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" onClick={() => { if (isPremiumUnlocked) setCurrentResultsPage(3); else setShowUnlockModal(true); }} data-testid="button-learn-more">
              {isPremiumUnlocked ? (<><Sparkles className="w-4 h-4 mr-1" />View Insights</>) : (<>Want to Know More?<ChevronRight className="w-4 h-4 ml-1" /></>)}
            </Button>
          )}
        </div>
      </footer>

      {result && (
        <SharePDFModal isOpen={showSharePDFModal} onClose={() => setShowSharePDFModal(false)} sessionId={sessionId || ""} result={{ mbtiType: result.mbtiType, discStyle: result.discStyle, bigFiveProfile: result.bigFiveProfile, title: result.primaryRole.title, spark: result.spark }} mood={mood} tier={tier} />
      )}
    </div>
  );
}
