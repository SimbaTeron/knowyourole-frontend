import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Calendar, Sparkles, RefreshCw,
  ChevronRight, ArrowUpRight, ArrowDownRight, Clock, Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface TraitChange {
  trait: string;
  label: string;
  change: number;
  direction: string;
  insight: string;
}

interface ArcData {
  totalQuizzes: number;
  firstQuizDate: string;
  latestQuizDate: string;
  mbtiEvolution: {
    first: string;
    latest: string;
    changed: boolean;
  };
  significantChanges: TraitChange[];
  timeline: Array<{
    index: number;
    date: string;
    mbtiType: string;
    bigFive: { O: number; C: number; E: number; A: number; N: number };
  }>;
}

interface QuizHistoryResponse {
  success: boolean;
  results: Array<{
    id: string;
    createdAt: string;
    mbtiType: string;
    discStyle: string;
    bigFive: { O: number; C: number; E: number; A: number; N: number };
    primaryRole: string;
  }>;
  arcData: ArcData | null;
}

const TRAIT_COLORS: Record<string, string> = {
  O: "text-violet-600 dark:text-violet-400",
  C: "text-blue-600 dark:text-blue-400",
  E: "text-amber-600 dark:text-amber-400",
  A: "text-emerald-600 dark:text-emerald-400",
  N: "text-rose-600 dark:text-rose-400"
};

const TRAIT_BG_COLORS: Record<string, string> = {
  O: "bg-violet-100 dark:bg-violet-900/30",
  C: "bg-blue-100 dark:bg-blue-900/30",
  E: "bg-amber-100 dark:bg-amber-900/30",
  A: "bg-emerald-100 dark:bg-emerald-900/30",
  N: "bg-rose-100 dark:bg-rose-900/30"
};

export function ArcTracker() {
  const { isAuthenticated } = useAuth();
  const [expandedTimeline, setExpandedTimeline] = useState(false);

  const { data, isLoading, refetch } = useQuery<QuizHistoryResponse>({
    queryKey: ['/api/user/quiz-history'],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  if (!isAuthenticated) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h3 className="font-semibold text-lg mb-2">Track Your Evolution</h3>
          <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60">
            Sign in to track how your personality evolves over time
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </CardContent>
      </Card>
    );
  }

  const arcData = data?.arcData;
  const results = data?.results || [];

  if (!arcData || results.length < 2) {
    return (
      <Card className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-200 dark:border-sky-800">
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-sky-500" />
          <h3 className="font-semibold text-lg mb-2">Your Arc Begins</h3>
          <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60 mb-4">
            {results.length === 0 
              ? "Complete your first quiz to start tracking your personality evolution!"
              : "Take the quiz again to see how you've changed over time."}
          </p>
          <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40">
            {results.length === 1 ? "1 quiz completed" : `${results.length} quizzes completed`}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Your Personality Arc
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 w-8 p-0"
            data-testid="button-refresh-arc"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
          {arcData.totalQuizzes} quizzes from {formatDate(arcData.firstQuizDate)} to {formatDate(arcData.latestQuizDate)}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {arcData.mbtiEvolution.changed && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Type Evolution:</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">
                {arcData.mbtiEvolution.first}
              </span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {arcData.mbtiEvolution.latest}
              </span>
            </div>
          </motion.div>
        )}

        {arcData.significantChanges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-warm-gray/80 dark:text-soft-cream/70">
              Significant Changes
            </h4>
            {arcData.significantChanges.map((change, idx) => (
              <motion.div
                key={change.trait}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-3 rounded-lg ${TRAIT_BG_COLORS[change.trait]}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold ${TRAIT_COLORS[change.trait]}`}>
                    {change.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {change.direction === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-amber-500" />
                    )}
                    <span className={`font-bold ${change.direction === 'up' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {change.change > 0 ? '+' : ''}{change.change}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-warm-gray/70 dark:text-soft-cream/60">
                  {change.insight}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedTimeline(!expandedTimeline)}
          className="w-full justify-between"
          data-testid="button-toggle-timeline"
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            View Timeline
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform ${expandedTimeline ? 'rotate-90' : ''}`} />
        </Button>

        <AnimatePresence>
          {expandedTimeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                {arcData.timeline.map((entry, idx) => (
                  <div 
                    key={entry.index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-300">
                      {entry.index}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{entry.mbtiType}</span>
                        <span className="text-xs text-warm-gray/50 dark:text-soft-cream/40">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {Object.entries(entry.bigFive).map(([trait, val]) => (
                          <span 
                            key={trait}
                            className={`text-xs px-1.5 py-0.5 rounded ${TRAIT_BG_COLORS[trait]} ${TRAIT_COLORS[trait]}`}
                          >
                            {trait}:{val}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
