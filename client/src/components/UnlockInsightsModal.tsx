"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  Heart,
  User,
  ArrowLeft,
  Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UnlockInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedFree: () => void;
  onDonate: (amount: number) => void;
}

export function UnlockInsightsModal({ 
  isOpen, 
  onClose,
  onProceedFree,
  onDonate,
}: UnlockInsightsModalProps) {
  const [view, setView] = useState<"main" | "donate">("main");
  const [customAmount, setCustomAmount] = useState(0);
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const features = [
    { icon: TrendingUp, title: "Career Path Insights", desc: "Personalized career recommendations" },
    { icon: Target, title: "Blindspot Analysis", desc: "Know your growth areas" },
    { icon: Lightbulb, title: "Side Hustle Ideas", desc: "Income opportunities matched to you" },
    { icon: Sparkles, title: "Deep Personality Dive", desc: "Advanced trait analysis" },
  ];

  const handleSignIn = () => {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/api/login?returnTo=${returnTo}`;
  };

  const resetAndClose = () => {
    setView("main");
    setCustomAmount(0);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={(e) => e.target === e.currentTarget && resetAndClose()}
        data-testid="modal-unlock-insights"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#12121A] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[rgba(167,139,250,0.3)]"
          style={{ boxShadow: "0 0 60px rgba(167, 139, 250, 0.15)" }}
        >
          <AnimatePresence mode="wait">
            {view === "main" ? (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative bg-gradient-to-r from-[#A78BFA] to-[#67E8F9] p-8 text-white">
                  <button
                    onClick={resetAndClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                    data-testid="button-close-unlock-modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex flex-col items-center text-center">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4"
                      initial={{ rotate: -10, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                    >
                      <Sparkles className="w-8 h-8" />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Unlock Premium Insights</h2>
                    <p className="text-white/80 text-sm">
                      We're building something special. Enjoy free access while we grow!
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="space-y-2.5">
                    {features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A24] border border-[rgba(148,163,184,0.1)]"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#A78BFA]/20 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-4 h-4 text-[#A78BFA]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#F8FAFC]">{feature.title}</p>
                          <p className="text-xs text-[#94A3B8]">{feature.desc}</p>
                        </div>
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-6 text-lg"
                    onClick={() => {
                      resetAndClose();
                      onProceedFree();
                    }}
                    data-testid="button-proceed-free"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Proceed to Results
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-semibold py-5"
                      onClick={() => setView("donate")}
                      data-testid="button-donate-support"
                    >
                      <Heart className="w-4 h-4 mr-1.5" />
                      Donate
                    </Button>

                    {!isAuthenticated && (
                      <Button
                        variant="outline"
                        className="flex-1 border-[#A78BFA]/50 text-[#A78BFA] hover:bg-[#A78BFA]/10 font-semibold py-5"
                        onClick={handleSignIn}
                        data-testid="button-sign-in-save"
                      >
                        <User className="w-4 h-4 mr-1.5" />
                        Save Results
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-center text-[#64748B]">
                    {isAuthenticated 
                      ? "Your results are saved to your account" 
                      : "Sign in to save your results for later"}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="donate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
                  <button
                    onClick={resetAndClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                    data-testid="button-close-donate-view"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex flex-col items-center text-center">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                    >
                      <Heart className="w-8 h-8 fill-current" />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Support KnowRole</h2>
                    <p className="text-white/80 text-sm">
                      Your donation helps us keep building and improving!
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-5 text-lg"
                      onClick={() => onDonate(500)}
                      data-testid="button-donate-5"
                    >
                      $5
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-5 text-lg"
                      onClick={() => onDonate(1000)}
                      data-testid="button-donate-10"
                    >
                      $10
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-5 text-lg"
                      onClick={() => onDonate(2000)}
                      data-testid="button-donate-20"
                    >
                      $20
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-5 text-lg"
                      onClick={() => onDonate(5000)}
                      data-testid="button-donate-50"
                    >
                      $50
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Custom ($)"
                      value={customAmount || ""}
                      onChange={(e) => setCustomAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      min="1"
                      className="flex-1 px-4 py-2.5 border-2 border-amber-500/30 rounded-md bg-[#1A1A24] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      data-testid="input-custom-donation"
                    />
                    <Button
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold px-6"
                      onClick={() => customAmount > 0 && onDonate(customAmount * 100)}
                      disabled={customAmount <= 0}
                      data-testid="button-donate-custom"
                    >
                      Donate
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1A24]"
                    onClick={() => setView("main")}
                    data-testid="button-back-to-main"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
