import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  X, 
  Crown,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  Check,
  Loader2
} from "lucide-react";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  prices: Array<{
    id: string;
    unit_amount: number;
    currency: string;
  }>;
}

export function PremiumUpgradeModal({ 
  isOpen, 
  onClose,
  sessionId
}: PremiumUpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: productsData } = useQuery<{ products: StripeProduct[] }>({
    queryKey: ["/api/stripe/products"],
    enabled: isOpen,
  });

  const handleUpgrade = async (priceId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          priceId,
          sessionId: sessionId || undefined,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const proProduct = productsData?.products?.find(p => 
    p.name.toLowerCase().includes("pro") || p.name.toLowerCase().includes("premium")
  );
  const price = proProduct?.prices?.[0];
  const displayPrice = price ? `$${(price.unit_amount / 100).toFixed(0)}` : "$9";

  const features = [
    { icon: TrendingUp, title: "Career Path Insights", desc: "Personalized career recommendations" },
    { icon: Target, title: "Blindspot Analysis", desc: "Know your growth areas" },
    { icon: Lightbulb, title: "Side Hustle Ideas", desc: "Income opportunities matched to you" },
    { icon: Sparkles, title: "Deep Personality Dive", desc: "Advanced trait analysis" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        data-testid="modal-premium-upgrade"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#12121A] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[rgba(251,191,36,0.3)]"
          style={{
            boxShadow: "0 0 60px rgba(251, 191, 36, 0.15)"
          }}
        >
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              data-testid="button-close-premium-modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Unlock KnowRole Pro</h2>
              <p className="text-white/80 text-sm">
                Get personalized insights to level up your life
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A24] border border-[rgba(148,163,184,0.1)]"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#F8FAFC]">{feature.title}</p>
                    <p className="text-xs text-[#94A3B8]">{feature.desc}</p>
                  </div>
                  <Check className="w-4 h-4 text-green-400" />
                </div>
              ))}
            </div>

            <div className="text-center py-2">
              <span className="text-3xl font-bold text-white">{displayPrice}</span>
              <span className="text-[#94A3B8] ml-2">one-time</span>
              <p className="text-xs text-[#64748B] mt-1">Lifetime access, no subscription</p>
            </div>

            <Button
              onClick={() => price && handleUpgrade(price.id)}
              disabled={isProcessing || !price}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-bold py-6 text-lg"
              data-testid="button-upgrade-premium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1A24]"
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
          </div>

          <div className="px-6 pb-6">
            <p className="text-xs text-center text-[#64748B]">
              Secure payment powered by Stripe
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
