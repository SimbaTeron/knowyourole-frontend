import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Sparkles,
  User,
  Shield,
  Zap
} from "lucide-react";

interface AccountCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest?: () => void;
}

export function AccountCreationModal({ 
  isOpen, 
  onClose,
  onContinueAsGuest 
}: AccountCreationModalProps) {
  
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        data-testid="modal-account-creation"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#12121A] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[rgba(167,139,250,0.3)]"
          style={{
            boxShadow: "0 0 60px rgba(167, 139, 250, 0.15)"
          }}
        >
          <div className="relative bg-gradient-to-r from-[#A78BFA] to-[#67E8F9] p-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              data-testid="button-close-account-modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Unlock Your Full Potential</h2>
              <p className="text-white/80 text-sm">
                Sign in to access premium personality insights
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A24] border border-[rgba(148,163,184,0.1)]">
                <div className="w-10 h-10 rounded-full bg-[#A78BFA]/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F8FAFC]">Premium Insights</p>
                  <p className="text-xs text-[#94A3B8]">Career paths, blindspots, and growth tips</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A24] border border-[rgba(148,163,184,0.1)]">
                <div className="w-10 h-10 rounded-full bg-[#67E8F9]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#67E8F9]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F8FAFC]">Save Your Results</p>
                  <p className="text-xs text-[#94A3B8]">Access your personality profile anytime</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A24] border border-[rgba(148,163,184,0.1)]">
                <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#34D399]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F8FAFC]">Secure & Private</p>
                  <p className="text-xs text-[#94A3B8]">Your data is encrypted and protected</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-[#A78BFA] to-[#67E8F9] hover:opacity-90 text-white font-bold py-6 text-lg"
              data-testid="button-sign-in-replit"
            >
              <User className="w-5 h-5 mr-2" />
              Sign In to Continue
            </Button>

            {onContinueAsGuest && (
              <Button
                variant="ghost"
                onClick={onContinueAsGuest}
                className="w-full text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1A24]"
                data-testid="button-continue-guest"
              >
                Continue as Guest
              </Button>
            )}
          </div>

          <div className="px-6 pb-6">
            <p className="text-xs text-center text-[#64748B]">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
