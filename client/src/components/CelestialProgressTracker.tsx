import { motion } from "framer-motion";
import { Star, Zap, Gift, Target, Trophy, Sparkles } from "lucide-react";

interface Milestone {
  id: string;
  label: string;
  questionIndex: number;
  type: "start" | "superpower" | "checkpoint1" | "checkpoint2" | "energy" | "mystery" | "finish";
  icon: typeof Star;
  color: string;
  glowColor: string;
}

interface CelestialProgressTrackerProps {
  currentQuestion: number;
  totalQuestions: number;
  tier: string;
  completedPhases: {
    energy: boolean;
    superpower: boolean;
    mystery: boolean;
    checkpoint1: boolean;
    checkpoint2: boolean;
  };
}

function getQuizMilestones(tier: string, totalQuestions: number): Milestone[] {
  const tierConfigs: Record<string, { 
    superpower: number; 
    checkpoint1?: number; 
    checkpoint2?: number; 
    energy: number; 
    mystery: number;
  }> = {
    "12-under": { superpower: 6, energy: 12, mystery: 18 },
    "7-12": { superpower: 6, energy: 12, mystery: 18 },
    "13-18": { superpower: 6, checkpoint1: 11, energy: 16, mystery: 21 },
    "19-25": { superpower: 11, checkpoint1: 11, checkpoint2: 21, energy: 27, mystery: 32 },
    "25+": { checkpoint1: 10, checkpoint2: 20, superpower: 25, energy: 30, mystery: 35 },
    "25plus": { checkpoint1: 10, checkpoint2: 20, superpower: 25, energy: 30, mystery: 35 }
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
    }
  ];
  
  const orderedMilestones: { question: number; milestone: Milestone }[] = [];
  
  orderedMilestones.push({
    question: config.superpower,
    milestone: {
      id: "superpower",
      label: "Superpower",
      questionIndex: config.superpower,
      type: "superpower",
      icon: Sparkles,
      color: "#F472B6",
      glowColor: "rgba(244, 114, 182, 0.6)"
    }
  });
  
  if (config.checkpoint1) {
    orderedMilestones.push({
      question: config.checkpoint1,
      milestone: {
        id: "checkpoint1",
        label: "Checkpoint",
        questionIndex: config.checkpoint1,
        type: "checkpoint1",
        icon: Target,
        color: "#A78BFA",
        glowColor: "rgba(167, 139, 250, 0.6)"
      }
    });
  }
  
  if (config.checkpoint2) {
    orderedMilestones.push({
      question: config.checkpoint2,
      milestone: {
        id: "checkpoint2",
        label: "Checkpoint",
        questionIndex: config.checkpoint2,
        type: "checkpoint2",
        icon: Target,
        color: "#60A5FA",
        glowColor: "rgba(96, 165, 250, 0.6)"
      }
    });
  }
  
  orderedMilestones.push({
    question: config.energy,
    milestone: {
      id: "energy",
      label: "Energy Check",
      questionIndex: config.energy,
      type: "energy",
      icon: Zap,
      color: "#F97316",
      glowColor: "rgba(249, 115, 22, 0.6)"
    }
  });
  
  orderedMilestones.push({
    question: config.mystery,
    milestone: {
      id: "mystery",
      label: "Mystery",
      questionIndex: config.mystery,
      type: "mystery",
      icon: Gift,
      color: "#14B8A6",
      glowColor: "rgba(20, 184, 166, 0.6)"
    }
  });
  
  orderedMilestones.sort((a, b) => a.question - b.question);
  
  orderedMilestones.forEach(m => milestones.push(m.milestone));
  
  milestones.push({
    id: "finish",
    label: "Results",
    questionIndex: totalQuestions,
    type: "finish",
    icon: Trophy,
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.6)"
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
    if (milestone.type === "superpower") return completedPhases.superpower;
    if (milestone.type === "checkpoint1") return completedPhases.checkpoint1;
    if (milestone.type === "checkpoint2") return completedPhases.checkpoint2;
    if (milestone.type === "energy") return completedPhases.energy;
    if (milestone.type === "mystery") return completedPhases.mystery;
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
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-between px-4">
          {milestones.map((milestone, index) => {
            const isReached = isMilestoneReached(milestone);
            const isActive = isMilestoneActive(milestone);
            const Icon = milestone.icon;
            const xPosition = milestone.questionIndex === 0 
              ? 5 
              : (milestone.questionIndex / totalQuestions) * 90 + 5;
            
            return (
              <motion.div
                key={milestone.id}
                className="absolute"
                style={{ left: `${xPosition}%`, transform: 'translateX(-50%)' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isActive ? 1.2 : 1, 
                  opacity: 1,
                  y: isActive ? -4 : 0
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  delay: index * 0.1
                }}
              >
                <motion.div
                  className="relative flex flex-col items-center"
                  animate={isActive ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: milestone.glowColor }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  
                  <motion.div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300`}
                    style={{
                      backgroundColor: isReached ? milestone.color : 'rgba(156, 163, 175, 0.3)',
                      boxShadow: isReached ? `0 0 12px ${milestone.glowColor}` : 'none'
                    }}
                  >
                    <Icon 
                      className={`w-4 h-4 transition-colors duration-300 ${
                        isReached ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  </motion.div>
                  
                  <motion.span
                    className={`text-[9px] font-medium mt-1 whitespace-nowrap transition-colors duration-300 ${
                      isReached 
                        ? 'text-warm-gray dark:text-soft-cream' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                    animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {milestone.label}
                  </motion.span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <motion.div
        className="absolute left-4 -bottom-1"
        style={{ 
          left: `${(currentQuestion / totalQuestions) * 90 + 5}%`,
          transform: 'translateX(-50%)'
        }}
        animate={{ 
          y: [0, -3, 0],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-terracotta to-dusty-blue shadow-lg" />
      </motion.div>
    </div>
  );
}
