import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, ThumbsUp, Lightbulb, 
  Search, Loader2, TrendingUp, AlertCircle, RotateCcw, Briefcase
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const POPULAR_ROLES = ['Nurse', 'Developer', 'Teacher', 'Manager', 'Artist', 'Entrepreneur'];

export function DreamRoleAdvisor({ bigFive, mbtiType, discStyle }: DreamRoleAdvisorProps) {
  const [dreamRole, setDreamRole] = useState("");
  const [analysis, setAnalysis] = useState<RoleAnalysis | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (analysis && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [analysis]);

  const handleAnalyze = (role?: string) => {
    const roleToAnalyze = role || dreamRole.trim();
    if (roleToAnalyze) {
      if (role) setDreamRole(role);
      analyzeMutation.mutate(roleToAnalyze);
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

  const getScoreRingColor = (score: number) => {
    if (score >= 70) return "border-emerald-400 dark:border-emerald-500";
    if (score >= 50) return "border-amber-400 dark:border-amber-500";
    return "border-rose-400 dark:border-rose-500";
  };

  const getScoreBgGlow = (score: number) => {
    if (score >= 70) return "bg-emerald-50 dark:bg-emerald-900/20";
    if (score >= 50) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-rose-50 dark:bg-rose-900/20";
  };

  const getVerdictBadgeColor = (score: number) => {
    if (score >= 70) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (score >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setDreamRole("");
    analyzeMutation.reset();
  };

  return (
    <Card 
      className="border-2 border-amber-300/60 dark:border-amber-600/40 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/40 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 relative"
      data-testid="card-dream-role-advisor"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/15 to-transparent rounded-tr-full pointer-events-none" />
      
      <CardContent className="p-6 relative z-10">
        <div className="text-center mb-5">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-3"
          >
            <Briefcase className="w-7 h-7 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Dream Role Advisor
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h3>
          <p className="text-sm text-amber-800/70 dark:text-amber-200/60 mt-1">
            Enter your dream job and see how your personality matches
          </p>
        </div>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder="e.g., Nurse, Developer, Teacher..."
            value={dreamRole}
            onChange={(e) => setDreamRole(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white/80 dark:bg-black/20 border-amber-200 dark:border-amber-700 focus:border-amber-400"
            data-testid="input-dream-role"
          />
          <Button 
            onClick={() => handleAnalyze()}
            disabled={!dreamRole.trim() || analyzeMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white min-w-[44px]"
            data-testid="button-analyze-role"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2 justify-center">
          {POPULAR_ROLES.map(role => (
            <button
              key={role}
              onClick={() => handleAnalyze(role)}
              disabled={analyzeMutation.isPending}
              className="px-3 py-1 text-xs rounded-full bg-amber-100/80 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200/60 dark:border-amber-700/40 hover-elevate transition-colors disabled:opacity-50"
              data-testid={`button-popular-role-${role.toLowerCase()}`}
            >
              {role}
            </button>
          ))}
        </div>

        {analyzeMutation.isError && (
          <p className="text-sm text-rose-600 dark:text-rose-400 text-center mt-2" data-testid="text-dream-role-error">
            Something went wrong. Please try again.
          </p>
        )}

        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              ref={resultsRef}
              key="results"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-5 pt-5 border-t border-amber-200/50 dark:border-amber-700/30"
              data-testid="section-role-analysis"
            >
              <div className="flex flex-col items-center mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className={`w-24 h-24 rounded-full border-4 ${getScoreRingColor(analysis.matchScore)} ${getScoreBgGlow(analysis.matchScore)} flex flex-col items-center justify-center mb-3`}
                >
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.matchScore)}`}>
                    {analysis.matchScore}%
                  </span>
                </motion.div>
                <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100 capitalize">
                  {analysis.dreamRole}
                </h4>
                <span className={`mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${getVerdictBadgeColor(analysis.matchScore)}`}>
                  {analysis.verdict}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {analysis.pros.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/30"
                  >
                    <h5 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                      <ThumbsUp className="w-4 h-4" />
                      Strengths
                    </h5>
                    <ul className="space-y-1.5">
                      {analysis.pros.map((pro, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.08 }}
                          className="text-xs text-emerald-800/80 dark:text-emerald-200/70 leading-relaxed"
                        >
                          {pro}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {analysis.cons.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-amber-50/80 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/30"
                  >
                    <h5 className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Growth Areas
                    </h5>
                    <ul className="space-y-1.5">
                      {analysis.cons.map((con, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + idx * 0.08 }}
                          className="text-xs text-amber-800/80 dark:text-amber-200/70 leading-relaxed"
                        >
                          {con}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {analysis.tips.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-50/80 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/30"
                  >
                    <h5 className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      <Lightbulb className="w-4 h-4" />
                      Tips for Success
                    </h5>
                    <ul className="space-y-1.5">
                      {analysis.tips.map((tip, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.08 }}
                          className="text-xs text-blue-800/80 dark:text-blue-200/70 leading-relaxed"
                        >
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              <Button 
                onClick={resetAnalysis} 
                variant="outline" 
                className="w-full border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200"
                data-testid="button-try-another-role"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Another Role
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
