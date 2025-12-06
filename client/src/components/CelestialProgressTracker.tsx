import { motion } from "framer-motion";
import { Star, Trophy } from "lucide-react";

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

export default function CelestialProgressTracker({ 
  currentQuestion, 
  totalQuestions, 
}: CelestialProgressTrackerProps) {
  const progress = (currentQuestion / totalQuestions) * 100;
  const isComplete = currentQuestion >= totalQuestions;
  const isStarted = currentQuestion > 0;
  
  return (
    <div className="relative w-full max-w-md mx-auto px-2" data-testid="celestial-progress">
      <div className="relative h-10 flex items-center">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative z-10 flex items-center justify-center"
          >
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                isStarted 
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{
                boxShadow: isStarted ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none'
              }}
            >
              <Star className={`w-3 h-3 ${isStarted ? 'text-white' : 'text-gray-400'}`} />
            </div>
          </motion.div>
          
          <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(90deg, rgba(251,191,36,0.3) 0%, rgba(244,114,182,0.3) 50%, rgba(16,185,129,0.3) 100%)'
              }}
            />
            
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, #FBBF24 0%, #F472B6 50%, #10B981 100%)',
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            
            {progress > 5 && progress < 95 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg border-2 border-pink-400"
                style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex items-center justify-center"
          >
            <motion.div 
              className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                isComplete 
                  ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{
                boxShadow: isComplete ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
              }}
              animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: isComplete ? Infinity : 0 }}
            >
              <Trophy className={`w-3 h-3 ${isComplete ? 'text-white' : 'text-gray-400'}`} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
