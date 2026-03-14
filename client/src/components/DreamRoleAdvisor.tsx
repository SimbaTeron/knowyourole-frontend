import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Sparkles, ThumbsUp, ThumbsDown, Lightbulb, 
  Search, X, Loader2, TrendingUp, AlertCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RoleAnalysis {
  dreamRole: string;
  matchScore: number;
  pros: string[];
  cons: string[];
  tips: string[];
  verdict: string;
}

interface DreamRoleAdvisorProps {
  bigFive: { O: number; C: number; E: number; A: number; N: number };
  mbtiType: string;
  discStyle: string;
}

export function DreamRoleAdvisor({ bigFive, mbtiType, discStyle }: DreamRoleAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dreamRole, setDreamRole] = useState("");
  const [analysis, setAnalysis] = useState<RoleAnalysis | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest('POST', '/api/analyze-role-fit', {
        dreamRole: role,
        bigFive,
        mbtiType,
        discStyle
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAnalysis(data.analysis);
      }
    }
  });

  const handleAnalyze = () => {
    if (dreamRole.trim()) {
      analyzeMutation.mutate(dreamRole.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (score >= 50) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-rose-100 dark:bg-rose-900/30";
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setDreamRole("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetAnalysis();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:border-amber-300"
          data-testid="button-dream-role-advisor"
        >
          <Target className="w-4 h-4 text-amber-600" />
          Dream Role Advisor
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Dream Role Advisor
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60">
                Enter your dream job or role and see how well your personality matches!
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Nurse, Developer, Teacher..."
                  value={dreamRole}
                  onChange={(e) => setDreamRole(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  data-testid="input-dream-role"
                />
                <Button 
                  onClick={handleAnalyze}
                  disabled={!dreamRole.trim() || analyzeMutation.isPending}
                  data-testid="button-analyze-role"
                >
                  {analyzeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {analyzeMutation.isError && (
                <p className="text-sm text-rose-600 dark:text-rose-400" data-testid="text-dream-role-error">
                  Something went wrong. Please try again.
                </p>
              )}

              <div className="text-xs text-warm-gray/50 dark:text-soft-cream/40">
                <p className="font-medium mb-1">Popular roles to try:</p>
                <div className="flex flex-wrap gap-1">
                  {['Nurse', 'Developer', 'Teacher', 'Manager', 'Artist', 'Entrepreneur'].map(role => (
                    <button
                      key={role}
                      onClick={() => setDreamRole(role)}
                      className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{analysis.dreamRole}</h3>
                <Button variant="ghost" size="sm" onClick={resetAnalysis}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className={`p-4 rounded-xl ${getScoreBg(analysis.matchScore)} text-center`}>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.matchScore)}`}>
                  {analysis.matchScore}%
                </div>
                <div className="text-sm font-medium mt-1">{analysis.verdict}</div>
              </div>

              <div className="space-y-3">
                {analysis.pros.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                      <ThumbsUp className="w-4 h-4" />
                      Your Strengths
                    </h4>
                    <ul className="space-y-1">
                      {analysis.pros.map((pro, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="text-sm text-warm-gray/80 dark:text-soft-cream/70 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700"
                        >
                          {pro}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.cons.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Growth Areas
                    </h4>
                    <ul className="space-y-1">
                      {analysis.cons.map((con, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          className="text-sm text-warm-gray/80 dark:text-soft-cream/70 pl-4 border-l-2 border-amber-300 dark:border-amber-700"
                        >
                          {con}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.tips.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      <Lightbulb className="w-4 h-4" />
                      Tips for Success
                    </h4>
                    <ul className="space-y-1">
                      {analysis.tips.map((tip, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="text-sm text-warm-gray/80 dark:text-soft-cream/70 pl-4 border-l-2 border-blue-300 dark:border-blue-700"
                        >
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button 
                onClick={resetAnalysis} 
                variant="outline" 
                className="w-full"
                data-testid="button-try-another-role"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Try Another Role
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
