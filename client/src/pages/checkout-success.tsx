import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle, Crown, ArrowRight, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";

interface CheckoutSession {
  status: string;
  customer_email?: string;
  amount_total?: number;
}

export default function CheckoutSuccess() {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get('session_id');
  const quizSession = searchParams.get('quiz_session');
  const isDonation = searchParams.get('donation') === 'true';

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/stripe/checkout/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSession(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);
  
  const handleContinueToResults = () => {
    setLocation('/quiz?donation_return=true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (isDonation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-teal-50 to-white dark:from-teal-900/10 dark:to-gray-900">
        <Card className="max-w-md w-full border-2 border-teal-200 dark:border-teal-700">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 mb-6"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-warm-gray dark:text-soft-cream mb-2">
                Thank You for Your Support!
              </h1>
              <p className="text-warm-gray/70 dark:text-soft-cream/60 mb-6">
                Your donation helps us build something great. Premium features are now unlocked!
              </p>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-8"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-left">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="text-sm text-teal-800 dark:text-teal-200">Premium insights unlocked</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-left">
                <Crown className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="text-sm text-teal-800 dark:text-teal-200">Deep personality analysis ready</span>
              </div>
            </motion.div>

            <Button 
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold"
              onClick={handleContinueToResults}
              data-testid="button-continue-results"
            >
              Continue to Premium Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {session?.customer_email && (
              <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40 mt-4">
                Confirmation sent to {session.customer_email}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-900">
      <Card className="max-w-md w-full border-2 border-amber-200 dark:border-amber-700">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-warm-gray dark:text-soft-cream mb-2">
              Welcome to KnowRole Pro!
            </h1>
            <p className="text-warm-gray/70 dark:text-soft-cream/60 mb-6">
              Thank you for supporting indie development. Your upgrade is now active.
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 mb-8"
          >
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-left">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-800 dark:text-amber-200">+2 Extra Role Matches unlocked</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-left">
              <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-800 dark:text-amber-200">Deep Dive Analysis ready</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-left">
              <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-800 dark:text-amber-200">Arc Tracker & Retest Versions enabled</span>
            </div>
          </motion.div>

          <Link href="/">
            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              data-testid="button-continue-home"
            >
              Continue to KnowRole
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          {session?.customer_email && (
            <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40 mt-4">
              Confirmation sent to {session.customer_email}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
