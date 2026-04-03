import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Crown, Calendar, Trophy, ChevronRight,
  LogOut, History, Star, Sparkles, Target, RefreshCw,
  Mail, Shield, Download, Trash2, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArcTracker } from "@/components/ArcTracker";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";

interface QuizResult {
  id: string;
  createdAt: string;
  mbtiType: string;
  discStyle: string;
  bigFive: { O: number; C: number; E: number; A: number; N: number };
  primaryRole: string;
}

interface QuizHistoryResponse {
  success: boolean;
  results: QuizResult[];
  arcData: {
    totalQuizzes: number;
    firstQuizDate: string;
    latestQuizDate: string;
  } | null;
}

const MBTI_COLORS: Record<string, string> = {
  "INTJ": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  "INTP": "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  "ENTJ": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "ENTP": "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  "INFJ": "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  "INFP": "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  "ENFJ": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "ENFP": "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  "ISTJ": "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
  "ISFJ": "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  "ESTJ": "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "ESFJ": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  "ISTP": "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300",
  "ISFP": "bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300",
  "ESTP": "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  "ESFP": "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300",
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, isPremium } = useAuth();
  const [, setLocation] = useLocation();
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const { data: historyData, isLoading: isHistoryLoading } = useQuery<QuizHistoryResponse>({
    queryKey: ['/api/user/quiz-history'],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    window.location.href = '/api/logout';
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-cream via-white to-sage-green/10 dark:from-[#0a0a0f] dark:via-[#12121A] dark:to-[#1a1a2e] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-cream via-white to-sage-green/10 dark:from-[#0a0a0f] dark:via-[#12121A] dark:to-[#1a1a2e] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-warm-gray/70 dark:text-soft-cream/60 mb-6">
              Please sign in to view your profile and quiz history.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => { window.location.href = '/api/login?returnTo=%2Fprofile'; }}
                data-testid="button-profile-sign-in"
              >
                Sign In
              </Button>
              <Button variant="outline" onClick={() => setLocation('/')} data-testid="button-go-home">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quizHistory = historyData?.results || [];
  const displayHistory = showAllHistory ? quizHistory : quizHistory.slice(0, 3);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-cream via-white to-sage-green/10 dark:from-[#0a0a0f] dark:via-[#12121A] dark:to-[#1a1a2e]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-terracotta via-dusty-blue to-sage-green" />
            <CardContent className="relative pt-0 pb-6 px-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={user.profileImageUrl ?? undefined} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-terracotta to-dusty-blue text-white">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-warm-gray dark:text-soft-cream">
                      {user.firstName} {user.lastName}
                    </h1>
                    {isPremium && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 gap-1">
                        <Crown className="w-3 h-3" />
                        Pro
                      </Badge>
                    )}
                  </div>
                  {user.email && (
                    <p className="text-sm text-warm-gray/60 dark:text-soft-cream/50 flex items-center justify-center sm:justify-start gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold text-warm-gray dark:text-soft-cream">
                  {quizHistory.length}
                </p>
                <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
                  Quizzes Taken
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-violet-500" />
                <p className="text-2xl font-bold text-warm-gray dark:text-soft-cream">
                  {quizHistory.length > 0 ? quizHistory[0].mbtiType : '—'}
                </p>
                <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
                  Latest Type
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <p className="text-2xl font-bold text-warm-gray dark:text-soft-cream">
                  {historyData?.arcData?.firstQuizDate 
                    ? new Date(historyData.arcData.firstQuizDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                    : '—'}
                </p>
                <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
                  Member Since
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-sky-500" />
                <p className="text-2xl font-bold text-warm-gray dark:text-soft-cream">
                  {isPremium ? 'Pro' : 'Free'}
                </p>
                <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
                  Account Type
                </p>
              </CardContent>
            </Card>
          </div>

          {!isPremium && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      Upgrade to Pro
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Unlock deep insights, career analysis & more
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500"
                  onClick={() => setLocation('/')}
                  data-testid="button-upgrade-cta"
                >
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          )}

          <ArcTracker />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-dusty-blue" />
                Quiz History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-dusty-blue" />
                </div>
              ) : quizHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-warm-gray/60 dark:text-soft-cream/50">
                    No quizzes completed yet
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setLocation('/')}
                    data-testid="button-take-quiz"
                  >
                    Take Your First Quiz
                  </Button>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {displayHistory.map((result, idx) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-300">
                          #{quizHistory.length - idx}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={MBTI_COLORS[result.mbtiType] || "bg-gray-100"}>
                              {result.mbtiType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.discStyle}
                            </Badge>
                          </div>
                          <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mt-1">
                            {result.primaryRole} • {formatDate(result.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex gap-1">
                          {Object.entries(result.bigFive).slice(0, 3).map(([trait, val]) => (
                            <div 
                              key={trait}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                              style={{
                                background: `hsl(${val * 2.4}, 70%, 90%)`,
                                color: `hsl(${val * 2.4}, 70%, 30%)`,
                              }}
                            >
                              {trait}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {quizHistory.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="w-full justify-center gap-2"
                      data-testid="button-toggle-history"
                    >
                      {showAllHistory ? 'Show Less' : `Show All (${quizHistory.length})`}
                      <ChevronRight className={`w-4 h-4 transition-transform ${showAllHistory ? 'rotate-90' : ''}`} />
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="gap-2"
              data-testid="button-new-quiz"
            >
              <Sparkles className="w-4 h-4" />
              Take New Quiz
            </Button>
          </div>

          {/* GDPR / CCPA Privacy Section */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
                <Shield className="w-5 h-5" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                You have the right to access, export, and delete your personal data under GDPR and CCPA.
              </p>

              {/* Export My Data */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  window.open('/api/user/export', '_blank');
                  toast({
                    title: "Export started",
                    description: "Your data download will begin shortly.",
                  });
                }}
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Export My Data (JSON)</span>
              </Button>

              {/* Do Not Sell */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  toast({
                    title: "Do Not Sell",
                    description: "We do not sell your personal data. Learn more in our Privacy Policy.",
                  });
                }}
              >
                <Shield className="w-4 h-4 text-sky-500" />
                <span>Do Not Sell My Information (CCPA)</span>
              </Button>

              {/* Delete My Data */}
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete My Account & Data</span>
                </Button>
              ) : (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-red-700 dark:text-red-300">
                        Are you sure?
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        This will permanently delete your account, all quiz results, and all personal data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/user/delete', { method: 'POST' });
                          if (res.ok) {
                            toast({
                              title: "Account deleted",
                              description: "All your data has been permanently removed.",
                            });
                            setTimeout(() => {
                              window.location.href = '/api/logout';
                            }, 1500);
                          } else {
                            toast({
                              title: "Error",
                              description: "Failed to delete account. Please try again.",
                              variant: "destructive",
                            });
                          }
                        } catch {
                          toast({
                            title: "Error",
                            description: "Failed to delete account. Please try again.",
                            variant: "destructive",
                          });
                        }
                        setShowDeleteConfirm(false);
                      }}
                    >
                      Yes, Delete Forever
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
