import { motion } from "framer-motion";
import { Star, Zap, Gift, HelpCircle, Trophy } from "lucide-react";

interface Milestone {
  id: string;
  label: string;
  questionIndex: number;
  type: "start" | "mid1" | "superpower" | "mystery" | "mid2" | "finish";
  icon: typeof Star;
  color: string;
  glowColor: string;
}

interface CelestialProgressTrackerProps {
  currentQuestion: number;
  totalQuestions: number;
  tier: string;
  completedPhases: {
    mid1: boolean;
    superpower: boolean;
    mystery: boolean;
    mid2: boolean;
  };
}

function getQuizMilestones(tier: string, totalQuestions: number): Milestone[] {
  const tierConfigs: Record<string, { mid1: number; superpower?: number; mystery?: number; mid2?: number }> = {
    "12-under": { mid1: 6, superpower: 11, mystery: 16 },
    "13-18": { mid1: 8, superpower: 15, mystery: 22, mid2: 28 },
    "19-25": { mid1: 9, superpower: 18, mystery: 27, mid2: 35 },
    "25+": { mid1: 10, superpower: 20, mystery: 30, mid2: 39 }
  };
  
  const config = tierConfigs[tier] || tierConfigs["19-25"];
  
  const milestones: Milestone[] = [
    {
      id: "start",
      label: "Begin",
      questionIndex: 0,
      type: "start",
      icon: Star,
      color: "#FBBF24",
      glowColor: "rgba(251, 191, 36, 0.6)"
    },
    {
      id: "mid1",
      label: "Energy Check",
      questionIndex: config.mid1,
      type: "mid1",
      icon: Zap,
      color: "#A78BFA",
      glowColor: "rgba(167, 139, 250, 0.6)"
    }
  ];
  
  if (config.superpower) {
    milestones.push({
      id: "superpower",
      label: "Superpower",
      questionIndex: config.superpower,
      type: "superpower",
      icon: Zap,
      color: "#F472B6",
      glowColor: "rgba(244, 114, 182, 0.6)"
    });
  }
  
  if (config.mystery) {
    milestones.push({
      id: "mystery",
      label: "Mystery",
      questionIndex: config.mystery,
      type: "mystery",
      icon: Gift,
      color: "#14B8A6",
      glowColor: "rgba(20, 184, 166, 0.6)"
    });
  }
  
  if (config.mid2) {
    milestones.push({
      id: "mid2",
      label: "Challenge",
      questionIndex: config.mid2,
      type: "mid2",
      icon: HelpCircle,
      color: "#60A5FA",
      glowColor: "rgba(96, 165, 250, 0.6)"
    });
  }
  
  milestones.push({
    id: "finish",
    label: "Results",
    questionIndex: totalQuestions,
    type: "finish",
    icon: Trophy,
    color: "#F97316",
    glowColor: "rgba(249, 115, 22, 0.6)"
  });
  
  return milestones;
}

export default function CelestialProgressTracker({ 
  currentQuestion, 
  totalQuestions, 
  tier,
  completedPhases 
}: CelestialProgressTrackerProps) {
  const milestones = getQuizMilestones(tier, totalQuestions);
  const progress = (currentQuestion / totalQuestions) * 100;
  
  const isMilestoneReached = (milestone: Milestone) => {
    if (milestone.type === "start") return true;
    if (milestone.type === "mid1") return completedPhases.mid1;
    if (milestone.type === "superpower") return completedPhases.superpower;
    if (milestone.type === "mystery") return completedPhases.mystery;
    if (milestone.type === "mid2") return completedPhases.mid2;
    if (milestone.type === "finish") return currentQuestion >= totalQuestions;
    return currentQuestion >= milestone.questionIndex;
  };
  
  const isMilestoneActive = (milestone: Milestone) => {
    const reached = isMilestoneReached(milestone);
    const nextMilestone = milestones.find(m => !isMilestoneReached(m));
    return !reached && nextMilestone?.id === milestone.id;
  };

  return (
    <div className="relative w-full max-w-md mx-auto" data-testid="celestial-progress">
      <div className="relative h-16 flex items-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#F472B6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
            <filter id="celestialGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <path
            d="M 20 32 Q 100 20, 200 32 T 380 32"
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 4"
            className="opacity-40"
          />
          
          <motion.path
            d="M 20 32 Q 100 20, 200 32 T 380 32"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            filter="url(#celestialGlow)"
          />
          
          <motion.circle
            cx={20 + (360 * progress / 100)}
            cy={32 + Math.sin((progress / 100) * Math.PI) * -12}
            r="4"
            fill="#FBBF24"
            filter="url(#celestialGlow)"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
        
        <div className="relative w-full flex justify-between items-center px-2 z-10">
          {milestones.map((milestone, index) => {
            const reached = isMilestoneReached(milestone);
            const active = isMilestoneActive(milestone);
            const xPos = (milestone.questionIndex / totalQuestions) * 100;
            const Icon = milestone.icon;
            
            return (
              <motion.div
                key={milestone.id}
                className="relative flex flex-col items-center"
                style={{ 
                  position: 'absolute',
                  left: `${Math.min(95, Math.max(5, xPos))}%`,
                  transform: 'translateX(-50%)'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: reached ? 1 : active ? 1.1 : 0.85,
                  opacity: 1
                }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <motion.div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    reached 
                      ? 'shadow-lg' 
                      : active 
                        ? 'shadow-md' 
                        : 'opacity-50'
                  }`}
                  style={{
                    background: reached 
                      ? `linear-gradient(135deg, ${milestone.color}, ${milestone.color}dd)` 
                      : active
                        ? `linear-gradient(135deg, ${milestone.color}66, ${milestone.color}44)`
                        : 'rgba(156, 163, 175, 0.3)',
                    boxShadow: reached 
                      ? `0 0 20px ${milestone.glowColor}` 
                      : active
                        ? `0 0 12px ${milestone.glowColor}`
                        : 'none'
                  }}
                  animate={active ? {
                    scale: [1, 1.15, 1],
                    boxShadow: [
                      `0 0 12px ${milestone.glowColor}`,
                      `0 0 24px ${milestone.glowColor}`,
                      `0 0 12px ${milestone.glowColor}`
                    ]
                  } : reached ? {
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{
                    duration: active ? 2 : 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  data-testid={`milestone-${milestone.id}`}
                >
                  <Icon 
                    className={`w-4 h-4 ${reached || active ? 'text-white' : 'text-gray-400'}`}
                  />
                  
                  {reached && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${milestone.color}` }}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                  )}
                </motion.div>
                
                {(reached || active) && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute -bottom-5 text-[10px] font-medium whitespace-nowrap ${
                      reached 
                        ? 'text-warm-gray dark:text-soft-cream' 
                        : 'text-warm-gray/60 dark:text-soft-cream/60'
                    }`}
                  >
                    {milestone.label}
                  </motion.span>
                )}
                
                {active && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{ backgroundColor: milestone.color }}
                        initial={{ 
                          x: 0, 
                          y: 0,
                          opacity: 0.8,
                          scale: 1
                        }}
                        animate={{ 
                          x: [0, (Math.random() - 0.5) * 40],
                          y: [0, -20 - Math.random() * 20],
                          opacity: [0.8, 0],
                          scale: [1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-6 px-1">
        <span className="text-xs text-warm-gray/60 dark:text-soft-cream/60">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <div className="flex items-center gap-1">
          <motion.div
            className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
      </div>
    </div>
  );
}
