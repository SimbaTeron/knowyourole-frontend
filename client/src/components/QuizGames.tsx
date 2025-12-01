import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, Heart, Sparkles, Gift, Map, Wrench, BookOpen } from "lucide-react";

type AgeTier = "7-12" | "13-18" | "19-25" | "25plus";

interface SuperpowerChoice {
  id: string;
  icon: typeof Zap;
  label: string;
  description: string;
  color: string;
  glowColor: string;
  weights: {
    mbti?: Partial<Record<"E" | "I" | "S" | "N" | "T" | "F" | "J" | "P", number>>;
    disc?: Partial<Record<"D" | "I" | "S" | "C", number>>;
    bigFive?: Partial<Record<"O" | "C" | "E" | "A" | "N", number>>;
  };
}

interface MysteryBoxChoice {
  id: string;
  icon: typeof Map;
  label: string;
  description: string;
  color: string;
  weights: {
    mbti?: Partial<Record<"E" | "I" | "S" | "N" | "T" | "F" | "J" | "P", number>>;
    disc?: Partial<Record<"D" | "I" | "S" | "C", number>>;
    bigFive?: Partial<Record<"O" | "C" | "E" | "A" | "N", number>>;
  };
}

const SUPERPOWER_CHOICES: Record<AgeTier, SuperpowerChoice[]> = {
  "7-12": [
    {
      id: "speed",
      icon: Zap,
      label: "Super Speed",
      description: "Zoom everywhere like lightning!",
      color: "from-amber-400 to-orange-500",
      glowColor: "shadow-amber-400/50",
      weights: { mbti: { E: 2, S: 1 }, disc: { D: 2 }, bigFive: { E: 2 } }
    },
    {
      id: "thoughts",
      icon: Brain,
      label: "Read Thoughts",
      description: "Know what everyone is thinking!",
      color: "from-violet-400 to-purple-600",
      glowColor: "shadow-violet-400/50",
      weights: { mbti: { I: 1, N: 2 }, disc: { C: 1 }, bigFive: { O: 2 } }
    },
    {
      id: "heal",
      icon: Heart,
      label: "Healing Touch",
      description: "Make anyone feel better instantly!",
      color: "from-rose-400 to-pink-500",
      glowColor: "shadow-rose-400/50",
      weights: { mbti: { F: 2, E: 1 }, disc: { S: 2, I: 1 }, bigFive: { A: 3 } }
    }
  ],
  "13-18": [
    {
      id: "speed",
      icon: Zap,
      label: "Super Speed",
      description: "Never be late, finish everything fast",
      color: "from-amber-400 to-orange-500",
      glowColor: "shadow-amber-400/50",
      weights: { mbti: { E: 2, S: 1, P: 1 }, disc: { D: 2 }, bigFive: { E: 2 } }
    },
    {
      id: "thoughts",
      icon: Brain,
      label: "Mind Reading",
      description: "Understand what people really mean",
      color: "from-violet-400 to-purple-600",
      glowColor: "shadow-violet-400/50",
      weights: { mbti: { I: 1, N: 2, T: 1 }, disc: { C: 2 }, bigFive: { O: 2 } }
    },
    {
      id: "heal",
      icon: Heart,
      label: "Healing Touch",
      description: "Help friends through tough times",
      color: "from-rose-400 to-pink-500",
      glowColor: "shadow-rose-400/50",
      weights: { mbti: { F: 2, E: 1 }, disc: { S: 2, I: 1 }, bigFive: { A: 3 } }
    }
  ],
  "19-25": [
    {
      id: "speed",
      icon: Zap,
      label: "Super Speed",
      description: "Maximize productivity, seize every moment",
      color: "from-amber-400 to-orange-500",
      glowColor: "shadow-amber-400/50",
      weights: { mbti: { E: 2, S: 1, J: 1 }, disc: { D: 2 }, bigFive: { E: 2, C: 1 } }
    },
    {
      id: "thoughts",
      icon: Brain,
      label: "Mind Reading",
      description: "Navigate social dynamics effortlessly",
      color: "from-violet-400 to-purple-600",
      glowColor: "shadow-violet-400/50",
      weights: { mbti: { I: 1, N: 2, T: 1 }, disc: { C: 2, I: 1 }, bigFive: { O: 2 } }
    },
    {
      id: "heal",
      icon: Heart,
      label: "Healing Touch",
      description: "Be the one people turn to in crisis",
      color: "from-rose-400 to-pink-500",
      glowColor: "shadow-rose-400/50",
      weights: { mbti: { F: 2, E: 1 }, disc: { S: 2, I: 1 }, bigFive: { A: 3, E: 1 } }
    }
  ],
  "25plus": [
    {
      id: "speed",
      icon: Zap,
      label: "Super Speed",
      description: "Master time, achieve more with less",
      color: "from-amber-400 to-orange-500",
      glowColor: "shadow-amber-400/50",
      weights: { mbti: { E: 1, S: 1, J: 2 }, disc: { D: 2 }, bigFive: { E: 1, C: 2 } }
    },
    {
      id: "thoughts",
      icon: Brain,
      label: "Mind Reading",
      description: "Understand motivations, lead with insight",
      color: "from-violet-400 to-purple-600",
      glowColor: "shadow-violet-400/50",
      weights: { mbti: { I: 1, N: 2, T: 1 }, disc: { C: 2, D: 1 }, bigFive: { O: 2, C: 1 } }
    },
    {
      id: "heal",
      icon: Heart,
      label: "Healing Touch",
      description: "Guide others through life's challenges",
      color: "from-rose-400 to-pink-500",
      glowColor: "shadow-rose-400/50",
      weights: { mbti: { F: 2, E: 1 }, disc: { S: 2, I: 1 }, bigFive: { A: 3, E: 1 } }
    }
  ]
};

const MYSTERY_BOX_CHOICES: Record<AgeTier, MysteryBoxChoice[]> = {
  "7-12": [
    {
      id: "map",
      icon: Map,
      label: "A Magic Map",
      description: "Shows you secret places to explore!",
      color: "from-emerald-400 to-teal-500",
      weights: { mbti: { N: 2, P: 1 }, disc: { D: 1 }, bigFive: { O: 3 } }
    },
    {
      id: "tool",
      icon: Wrench,
      label: "A Fix-It Tool",
      description: "Can repair anything that's broken!",
      color: "from-sky-400 to-blue-500",
      weights: { mbti: { S: 2, T: 1 }, disc: { C: 2 }, bigFive: { C: 2 } }
    },
    {
      id: "book",
      icon: BookOpen,
      label: "A Magic Book",
      description: "Answers any question you ask!",
      color: "from-indigo-400 to-violet-500",
      weights: { mbti: { I: 1, N: 1, T: 2 }, disc: { C: 2 }, bigFive: { O: 2, C: 1 } }
    }
  ],
  "13-18": [
    {
      id: "map",
      icon: Map,
      label: "A Map to Unknown",
      description: "Reveals hidden opportunities ahead",
      color: "from-emerald-400 to-teal-500",
      weights: { mbti: { N: 2, P: 1, E: 1 }, disc: { D: 1, I: 1 }, bigFive: { O: 3 } }
    },
    {
      id: "tool",
      icon: Wrench,
      label: "The Perfect Tool",
      description: "Solves any practical problem",
      color: "from-sky-400 to-blue-500",
      weights: { mbti: { S: 2, T: 1, J: 1 }, disc: { C: 2, D: 1 }, bigFive: { C: 3 } }
    },
    {
      id: "book",
      icon: BookOpen,
      label: "Book of Answers",
      description: "Contains wisdom for any situation",
      color: "from-indigo-400 to-violet-500",
      weights: { mbti: { I: 1, N: 1, T: 2 }, disc: { C: 2 }, bigFive: { O: 2, C: 1 } }
    }
  ],
  "19-25": [
    {
      id: "map",
      icon: Map,
      label: "A Map to Unknown",
      description: "Navigate uncharted career paths",
      color: "from-emerald-400 to-teal-500",
      weights: { mbti: { N: 2, P: 1, E: 1 }, disc: { D: 2, I: 1 }, bigFive: { O: 3 } }
    },
    {
      id: "tool",
      icon: Wrench,
      label: "Universal Problem-Solver",
      description: "Fix any challenge systematically",
      color: "from-sky-400 to-blue-500",
      weights: { mbti: { S: 2, T: 2, J: 1 }, disc: { C: 2, D: 1 }, bigFive: { C: 3 } }
    },
    {
      id: "book",
      icon: BookOpen,
      label: "Book of All Knowledge",
      description: "Deep understanding of everything",
      color: "from-indigo-400 to-violet-500",
      weights: { mbti: { I: 2, N: 1, T: 2 }, disc: { C: 2 }, bigFive: { O: 2, C: 2 } }
    }
  ],
  "25plus": [
    {
      id: "map",
      icon: Map,
      label: "A Map to Purpose",
      description: "Reveals your true path forward",
      color: "from-emerald-400 to-teal-500",
      weights: { mbti: { N: 2, P: 1 }, disc: { D: 2, I: 1 }, bigFive: { O: 3 } }
    },
    {
      id: "tool",
      icon: Wrench,
      label: "Master's Tool",
      description: "Shape outcomes with precision",
      color: "from-sky-400 to-blue-500",
      weights: { mbti: { S: 2, T: 2, J: 2 }, disc: { C: 2, D: 1 }, bigFive: { C: 3 } }
    },
    {
      id: "book",
      icon: BookOpen,
      label: "Wisdom Codex",
      description: "Timeless insights for complex decisions",
      color: "from-indigo-400 to-violet-500",
      weights: { mbti: { I: 2, N: 2, T: 1 }, disc: { C: 2 }, bigFive: { O: 3, C: 1 } }
    }
  ]
};

interface FloatingOrbProps {
  choice: SuperpowerChoice;
  index: number;
  isSelected: boolean;
  isOtherSelected: boolean;
  onSelect: () => void;
}

function FloatingOrb({ choice, index, isSelected, isOtherSelected, onSelect }: FloatingOrbProps) {
  const Icon = choice.icon;
  const positions = [
    { x: 0, y: -80 },
    { x: -70, y: 50 },
    { x: 70, y: 50 }
  ];
  
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isOtherSelected ? 0.6 : 1, 
        opacity: isOtherSelected ? 0.3 : 1,
        x: isSelected ? 0 : positions[index].x,
        y: isSelected ? 0 : positions[index].y,
      }}
      whileHover={!isSelected && !isOtherSelected ? { scale: 1.15 } : {}}
      whileTap={!isSelected && !isOtherSelected ? { scale: 0.95 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: isSelected ? 0 : index * 0.1 
      }}
      onClick={onSelect}
      disabled={isOtherSelected}
      className={`absolute w-28 h-28 rounded-full flex flex-col items-center justify-center
        bg-gradient-to-br ${choice.color} shadow-2xl ${choice.glowColor}
        ${isSelected ? 'z-20 w-36 h-36' : 'cursor-pointer'}
        ${isOtherSelected ? 'pointer-events-none' : ''}
        transition-shadow duration-300`}
      style={{ 
        left: '50%', 
        top: '50%',
        marginLeft: isSelected ? '-72px' : '-56px',
        marginTop: isSelected ? '-72px' : '-56px'
      }}
      data-testid={`orb-${choice.id}`}
    >
      <motion.div
        animate={!isSelected ? { 
          y: [0, -5, 0],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          delay: index * 0.5 
        }}
        className="flex flex-col items-center"
      >
        <Icon className={`${isSelected ? 'w-12 h-12' : 'w-10 h-10'} text-white mb-1`} />
        <span className={`${isSelected ? 'text-sm' : 'text-xs'} font-bold text-white text-center px-2 leading-tight`}>
          {choice.label}
        </span>
      </motion.div>
      
      {!isSelected && !isOtherSelected && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
        />
      )}
    </motion.button>
  );
}

interface RevealItemProps {
  choice: MysteryBoxChoice;
  index: number;
  isSelected: boolean;
  isOtherSelected: boolean;
  onSelect: () => void;
  isRevealed: boolean;
}

function RevealItem({ choice, index, isSelected, isOtherSelected, onSelect, isRevealed }: RevealItemProps) {
  const Icon = choice.icon;
  
  return (
    <motion.button
      initial={{ y: 50, opacity: 0, scale: 0.5 }}
      animate={{ 
        y: isRevealed ? 0 : 50,
        opacity: isRevealed ? (isOtherSelected ? 0.3 : 1) : 0,
        scale: isSelected ? 1.1 : (isOtherSelected ? 0.8 : 1)
      }}
      whileHover={!isSelected && !isOtherSelected && isRevealed ? { scale: 1.05, y: -5 } : {}}
      whileTap={!isSelected && !isOtherSelected ? { scale: 0.95 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: isRevealed ? index * 0.15 : 0
      }}
      onClick={onSelect}
      disabled={isOtherSelected || !isRevealed}
      className={`flex flex-col items-center justify-center
        ${isSelected ? 'z-20' : 'cursor-pointer'}
        ${isOtherSelected || !isRevealed ? 'pointer-events-none' : ''}`}
      data-testid={`item-${choice.id}`}
    >
      <motion.div 
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${choice.color} shadow-xl
          flex items-center justify-center`}
        animate={isRevealed && !isSelected ? { 
          y: [0, -3, 0],
          rotate: [0, 2, -2, 0]
        } : {}}
        transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
      >
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </motion.div>
      <span className="text-xs sm:text-sm font-medium text-warm-gray dark:text-soft-cream text-center mt-2 max-w-[80px] leading-tight">
        {choice.label}
      </span>
    </motion.button>
  );
}

interface SuperpowerGameProps {
  tier: AgeTier;
  onSelect: (choice: SuperpowerChoice) => void;
}

export function SuperpowerGame({ tier, onSelect }: SuperpowerGameProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const choices = SUPERPOWER_CHOICES[tier] || SUPERPOWER_CHOICES["19-25"];
  
  const handleSelect = (choice: SuperpowerChoice) => {
    if (selectedId) return;
    setSelectedId(choice.id);
    
    setTimeout(() => {
      onSelect(choice);
    }, 800);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-amber-100 dark:from-violet-900/30 dark:to-amber-900/30 mb-4"
        >
          <Sparkles className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Choose Your Power</span>
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-warm-gray dark:text-soft-cream mb-2">
          You Wake Up With ONE Superpower
        </h2>
        <p className="text-warm-gray/60 dark:text-soft-cream/50 text-sm">
          Which would you keep?
        </p>
      </motion.div>
      
      <div className="relative w-full max-w-sm h-80 flex items-center justify-center">
        {choices.map((choice, idx) => (
          <FloatingOrb
            key={choice.id}
            choice={choice}
            index={idx}
            isSelected={selectedId === choice.id}
            isOtherSelected={selectedId !== null && selectedId !== choice.id}
            onSelect={() => handleSelect(choice)}
          />
        ))}
      </div>
      
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-lg font-medium text-warm-gray dark:text-soft-cream">
              {choices.find(c => c.id === selectedId)?.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MysteryBoxGameProps {
  tier: AgeTier;
  onSelect: (choice: MysteryBoxChoice) => void;
}

export function MysteryBoxGame({ tier, onSelect }: MysteryBoxGameProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const choices = MYSTERY_BOX_CHOICES[tier] || MYSTERY_BOX_CHOICES["19-25"];
  
  useEffect(() => {
    const timer1 = setTimeout(() => setIsOpen(true), 500);
    const timer2 = setTimeout(() => setIsRevealed(true), 1200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  const handleSelect = (choice: MysteryBoxChoice) => {
    if (selectedId) return;
    setSelectedId(choice.id);
    
    setTimeout(() => {
      onSelect(choice);
    }, 800);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 dark:from-amber-900/30 dark:to-rose-900/30 mb-4"
        >
          <Gift className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Mystery Revealed</span>
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-warm-gray dark:text-soft-cream mb-2">
          A Glowing Box Appears...
        </h2>
        <p className="text-warm-gray/60 dark:text-soft-cream/50 text-sm">
          Inside is something made just for you
        </p>
      </motion.div>
      
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ scale: 0.8, rotateX: 0 }}
          animate={{ 
            scale: isOpen ? 1 : 0.8,
            rotateX: isOpen ? -30 : 0,
            opacity: isRevealed ? 0.3 : 1
          }}
          transition={{ type: "spring", stiffness: 150 }}
          className="relative mx-auto w-fit mb-8"
        >
          <div className="w-32 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-amber-700/30 to-transparent" />
            <motion.div
              className="absolute inset-x-0 top-0 h-6 bg-gradient-to-br from-amber-300 to-amber-500 rounded-t-xl origin-bottom"
              animate={{ rotateX: isOpen ? -120 : 0 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              style={{ transformOrigin: 'top center' }}
            >
              <div className="absolute inset-x-0 top-1/2 h-3 flex justify-center">
                <div className="w-6 h-3 bg-amber-600 rounded-full" />
              </div>
            </motion.div>
            
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-white/80" />
              </motion.div>
            )}
          </div>
        </motion.div>
        
        <div className="grid grid-cols-3 gap-4 sm:gap-6 justify-items-center max-w-xs mx-auto">
          {choices.map((choice, idx) => (
            <RevealItem
              key={choice.id}
              choice={choice}
              index={idx}
              isSelected={selectedId === choice.id}
              isOtherSelected={selectedId !== null && selectedId !== choice.id}
              onSelect={() => handleSelect(choice)}
              isRevealed={isRevealed}
            />
          ))}
        </div>
      </div>
      
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-lg font-medium text-warm-gray dark:text-soft-cream">
              {choices.find(c => c.id === selectedId)?.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TimedCountdownProps {
  onComplete: () => void;
}

export function TimedCountdown({ onComplete }: TimedCountdownProps) {
  const [count, setCount] = useState(3);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (count === 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 200);
      }, 600);
      return () => clearTimeout(timer);
    }
    
    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-dusty-blue mb-4"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-warm-gray dark:text-soft-cream mb-2">
          Timed Questions Resume!
        </h3>
        <p className="text-warm-gray/60 dark:text-soft-cream/50 text-sm mb-6">
          Get ready to answer quickly
        </p>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-7xl font-black bg-gradient-to-r from-terracotta to-dusty-blue bg-clip-text text-transparent"
          >
            {count === 0 ? "GO!" : count}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

interface MultiChoiceOption {
  id: string;
  label: string;
  icon: typeof Sparkles;
  weights: {
    mbti?: Partial<Record<"E" | "I" | "S" | "N" | "T" | "F" | "J" | "P", number>>;
    disc?: Partial<Record<"D" | "I" | "S" | "C", number>>;
    bigFive?: Partial<Record<"O" | "C" | "E" | "A" | "N", number>>;
  };
}

interface SpinningWheelProps {
  options: MultiChoiceOption[];
  prompt: string;
  subtitle: string;
  onSelect: (option: MultiChoiceOption) => void;
}

export function SpinningWheel({ options, prompt, subtitle, onSelect }: SpinningWheelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const handleSelect = (option: MultiChoiceOption) => {
    if (selectedId) return;
    setSelectedId(option.id);
    setTimeout(() => onSelect(option), 600);
  };
  
  const colors = [
    "from-violet-400 to-purple-500",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-rose-400 to-pink-500"
  ];
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-sm text-warm-gray/60 dark:text-soft-cream/50 mb-2">{subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-warm-gray dark:text-soft-cream">
          {prompt}
        </h2>
      </motion.div>
      
      <div className="relative w-72 h-72">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-terracotta/20 dark:border-terracotta/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {options.map((option, idx) => {
          const Icon = option.icon;
          const angle = (idx * 360) / options.length - 90;
          const radius = 100;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const isSelected = selectedId === option.id;
          const isOther = selectedId !== null && selectedId !== option.id;
          
          return (
            <motion.button
              key={option.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isSelected ? 1.3 : (isOther ? 0.7 : 1),
                opacity: isOther ? 0.3 : 1,
                x: isSelected ? 0 : x,
                y: isSelected ? 0 : y
              }}
              whileHover={!selectedId ? { scale: 1.15 } : {}}
              whileTap={!selectedId ? { scale: 0.95 } : {}}
              transition={{ type: "spring", delay: idx * 0.1 }}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHoveredId(option.id)}
              onMouseLeave={() => setHoveredId(null)}
              disabled={!!selectedId}
              className={`absolute left-1/2 top-1/2 -ml-12 -mt-12 w-24 h-24 rounded-full
                bg-gradient-to-br ${colors[idx]} shadow-xl
                flex flex-col items-center justify-center
                ${selectedId ? '' : 'cursor-pointer'}
                transition-shadow duration-300`}
              style={{ zIndex: isSelected ? 20 : 10 }}
              data-testid={`wheel-${option.id}`}
            >
              <Icon className="w-8 h-8 text-white mb-1" />
              <span className="text-xs font-bold text-white text-center px-1 leading-tight">
                {option.label.split(' ').slice(0, 2).join(' ')}
              </span>
            </motion.button>
          );
        })}
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 rounded-full bg-terracotta/20 dark:bg-terracotta/30"
          />
        </div>
      </div>
      
      <AnimatePresence>
        {(hoveredId || selectedId) && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-lg font-medium text-warm-gray dark:text-soft-cream"
          >
            {options.find(o => o.id === (selectedId || hoveredId))?.label}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StackedCardsProps {
  options: MultiChoiceOption[];
  prompt: string;
  subtitle: string;
  onSelect: (option: MultiChoiceOption) => void;
}

export function StackedCards({ options, prompt, subtitle, onSelect }: StackedCardsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fanned, setFanned] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setFanned(true), 300);
    return () => clearTimeout(timer);
  }, []);
  
  const handleSelect = (option: MultiChoiceOption) => {
    if (selectedId) return;
    setSelectedId(option.id);
    setTimeout(() => onSelect(option), 700);
  };
  
  const colors = [
    "from-indigo-500 to-violet-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600"
  ];
  
  const patterns = [
    "bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2)_0%,_transparent_50%)]",
    "bg-[radial-gradient(circle_at_70%_70%,_rgba(255,255,255,0.2)_0%,_transparent_50%)]",
    "bg-[radial-gradient(circle_at_50%_20%,_rgba(255,255,255,0.2)_0%,_transparent_50%)]",
    "bg-[radial-gradient(circle_at_20%_80%,_rgba(255,255,255,0.2)_0%,_transparent_50%)]"
  ];
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-sm text-warm-gray/60 dark:text-soft-cream/50 mb-2">{subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-warm-gray dark:text-soft-cream">
          {prompt}
        </h2>
      </motion.div>
      
      <div className="relative w-full max-w-sm h-80 flex items-end justify-center pb-8">
        {options.map((option, idx) => {
          const Icon = option.icon;
          const isSelected = selectedId === option.id;
          const isOther = selectedId !== null && selectedId !== option.id;
          const fanAngle = fanned ? (idx - (options.length - 1) / 2) * 12 : 0;
          const fanX = fanned ? (idx - (options.length - 1) / 2) * 25 : 0;
          
          return (
            <motion.button
              key={option.id}
              initial={{ y: 100, opacity: 0, rotate: 0 }}
              animate={{ 
                y: isSelected ? -50 : 0,
                opacity: isOther ? 0.2 : 1,
                rotate: isSelected ? 0 : fanAngle,
                x: isSelected ? 0 : fanX,
                scale: isSelected ? 1.1 : 1,
                zIndex: isSelected ? 20 : options.length - idx
              }}
              whileHover={!selectedId ? { y: -20, scale: 1.05 } : {}}
              transition={{ type: "spring", stiffness: 200, delay: idx * 0.08 }}
              onClick={() => handleSelect(option)}
              disabled={!!selectedId}
              className={`absolute w-32 h-48 rounded-2xl shadow-xl cursor-pointer
                bg-gradient-to-br ${colors[idx]} ${patterns[idx]}
                flex flex-col items-center justify-center p-4
                border-2 border-white/20`}
              style={{ transformOrigin: 'bottom center' }}
              data-testid={`card-${option.id}`}
            >
              <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{idx + 1}</span>
              </div>
              
              <Icon className="w-12 h-12 text-white mb-3" />
              <span className="text-sm font-bold text-white text-center leading-tight">
                {option.label}
              </span>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40 mt-4"
      >
        Tap a card to choose
      </motion.p>
    </div>
  );
}

export type { SuperpowerChoice, MysteryBoxChoice, AgeTier, MultiChoiceOption };
