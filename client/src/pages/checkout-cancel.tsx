import { motion, useReducedMotion } from "framer-motion";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function CheckoutCancel() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
      <Card className="max-w-md w-full border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6"
          >
            <XCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-xl font-bold text-warm-gray dark:text-soft-cream mb-2">
              Checkout Cancelled
            </h1>
            <p className="text-warm-gray/70 dark:text-soft-cream/60 mb-6">
              No worries! Your free results are still waiting for you.
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Link href="/">
              <Button 
                className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-semibold"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to KnowRole
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-start gap-3 text-left">
              <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Changed your mind?
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  You can upgrade anytime from your results page. The Pro features will always be there when you're ready.
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
