import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOOD_ORBS = [
  { id: "happy", label: "Happy", color: "#FBBF24", glowColor: "rgba(251, 191, 36, 0.5)" },
  { id: "calm", label: "Calm", color: "#60A5FA", glowColor: "rgba(96, 165, 250, 0.5)" },
  { id: "curious", label: "Curious", color: "#A78BFA", glowColor: "rgba(167, 139, 250, 0.5)" },
  { id: "determined", label: "Determined", color: "#F87171", glowColor: "rgba(248, 113, 113, 0.5)" },
  { id: "creative", label: "Creative", color: "#F472B6", glowColor: "rgba(244, 114, 182, 0.5)" },
  { id: "social", label: "Social", color: "#34D399", glowColor: "rgba(52, 211, 153, 0.5)" },
];

const HYBRID_HINTS: Record<string, { title: string; desc: string }> = {
  "happy+calm": { title: "Peaceful Optimist", desc: "You bring steady sunshine to every situation" },
  "happy+curious": { title: "Wonder Seeker", desc: "You find joy in learning new things" },
  "happy+determined": { title: "Driven Enthusiast", desc: "You chase goals with a smile" },
  "happy+creative": { title: "Joyful Creator", desc: "You make beautiful things with positive energy" },
  "happy+social": { title: "Life of the Party", desc: "Your energy lights up every room" },
  "calm+curious": { title: "Thoughtful Explorer", desc: "You ponder deeply before diving in" },
  "calm+determined": { title: "Steady Achiever", desc: "You reach goals without breaking a sweat" },
  "calm+creative": { title: "Serene Artist", desc: "You create from a place of peace" },
  "calm+social": { title: "Gentle Connector", desc: "You build lasting bonds through patience" },
  "curious+determined": { title: "Knowledge Hunter", desc: "You won't stop until you understand" },
  "curious+creative": { title: "Inventive Mind", desc: "You see possibilities others miss" },
  "curious+social": { title: "People Watcher", desc: "You love understanding what makes others tick" },
  "determined+creative": { title: "Ambitious Maker", desc: "You turn visions into reality" },
  "determined+social": { title: "Team Leader", desc: "You inspire others to reach their potential" },
  "creative+social": { title: "Collaborative Artist", desc: "You bring out creativity in everyone" },
};

function getHybridKey(id1: string, id2: string): string {
  return [id1, id2].sort().join("+");
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface MagneticOrbitMixerProps {
  onMoodBrewed?: () => void;
}

export default function MagneticOrbitMixer({ onMoodBrewed }: MagneticOrbitMixerProps) {
  const [selectedOrbs, setSelectedOrbs] = useState<string[]>([]);
  const [hybridResult, setHybridResult] = useState<{ title: string; desc: string } | null>(null);
  const [isColliding, setIsColliding] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [orbPositions, setOrbPositions] = useState<Record<string, { angle: number; pulled: boolean }>>({});

  const centerX = 140;
  const centerY = 140;
  const orbitRadius = 100;

  useEffect(() => {
    const initialPositions: Record<string, { angle: number; pulled: boolean }> = {};
    MOOD_ORBS.forEach((orb, idx) => {
      initialPositions[orb.id] = {
        angle: (idx * 60) * (Math.PI / 180),
        pulled: false
      };
    });
    setOrbPositions(initialPositions);
  }, []);

  useEffect(() => {
    if (selectedOrbs.length === 0) return;
    
    const interval = setInterval(() => {
      setOrbPositions(prev => {
        const updated = { ...prev };
        MOOD_ORBS.forEach(orb => {
          if (!selectedOrbs.includes(orb.id) && updated[orb.id]) {
            updated[orb.id] = {
              ...updated[orb.id],
              angle: updated[orb.id].angle + 0.02
            };
          }
        });
        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [selectedOrbs]);

  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  const createParticleBurst = useCallback((color1: string, color2: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: i % 2 === 0 ? color1 : color2,
        size: 4 + Math.random() * 6,
        life: 1
      });
    }
    setParticles(newParticles);
  }, []);

  const handleOrbClick = (orbId: string) => {
    if (selectedOrbs.length >= 2 || selectedOrbs.includes(orbId) || isColliding) return;
    
    if (navigator.vibrate) navigator.vibrate(30);
    
    setOrbPositions(prev => ({
      ...prev,
      [orbId]: { ...prev[orbId], pulled: true }
    }));
    
    const newSelected = [...selectedOrbs, orbId];
    setSelectedOrbs(newSelected);
    
    if (newSelected.length === 2) {
      setTimeout(() => {
        setIsColliding(true);
        if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
        
        const orb1 = MOOD_ORBS.find(o => o.id === newSelected[0]);
        const orb2 = MOOD_ORBS.find(o => o.id === newSelected[1]);
        if (orb1 && orb2) {
          createParticleBurst(orb1.color, orb2.color);
        }
        
        setTimeout(() => {
          const key = getHybridKey(newSelected[0], newSelected[1]);
          setHybridResult(HYBRID_HINTS[key] || { title: "Unique Blend", desc: "A one-of-a-kind personality mix!" });
          setIsColliding(false);
          if (onMoodBrewed) onMoodBrewed();
        }, 600);
      }, 500);
    }
  };

  const handleReset = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    setSelectedOrbs([]);
    setHybridResult(null);
    setIsColliding(false);
    setParticles([]);
    
    const resetPositions: Record<string, { angle: number; pulled: boolean }> = {};
    MOOD_ORBS.forEach((orb, idx) => {
      resetPositions[orb.id] = {
        angle: (idx * 60) * (Math.PI / 180),
        pulled: false
      };
    });
    setOrbPositions(resetPositions);
  };

  const getOrbPosition = (orbId: string) => {
    const pos = orbPositions[orbId];
    if (!pos) return { x: centerX, y: centerY };
    
    if (pos.pulled) {
      return { x: centerX, y: centerY };
    }
    
    return {
      x: centerX + Math.cos(pos.angle) * orbitRadius,
      y: centerY + Math.sin(pos.angle) * orbitRadius
    };
  };

  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      <svg 
        viewBox="0 0 280 280" 
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}
      >
        <defs>
          {MOOD_ORBS.map(orb => (
            <radialGradient key={`grad-${orb.id}`} id={`grad-${orb.id}`}>
              <stop offset="0%" stopColor={orb.color} stopOpacity="1" />
              <stop offset="100%" stopColor={orb.color} stopOpacity="0.7" />
            </radialGradient>
          ))}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={orbitRadius} 
          fill="none" 
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="text-warm-gray dark:text-soft-cream"
        />
        
        <circle 
          cx={centerX} 
          cy={centerY} 
          r="30" 
          fill="currentColor"
          fillOpacity="0.05"
          className="text-warm-gray dark:text-soft-cream"
        />
        
        {particles.map(particle => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size * particle.life}
            fill={particle.color}
            opacity={particle.life}
          />
        ))}
        
        {MOOD_ORBS.map(orb => {
          const pos = getOrbPosition(orb.id);
          const isSelected = selectedOrbs.includes(orb.id);
          const isAvailable = selectedOrbs.length < 2 && !isSelected && !isColliding;
          
          if (isColliding && isSelected) {
            return null;
          }
          
          return (
            <motion.g
              key={orb.id}
              initial={false}
              animate={{
                x: pos.x - centerX,
                y: pos.y - centerY,
                scale: isSelected ? 0.8 : 1,
                opacity: isSelected && !isColliding ? 0 : 1
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              style={{ cursor: isAvailable ? 'pointer' : 'default' }}
              onClick={() => isAvailable && handleOrbClick(orb.id)}
              data-testid={`orb-${orb.id}`}
            >
              <circle
                cx={centerX}
                cy={centerY}
                r="28"
                fill={`url(#grad-${orb.id})`}
                filter="url(#glow)"
                style={{
                  boxShadow: `0 0 20px ${orb.glowColor}`,
                }}
              />
              <text
                x={centerX}
                y={centerY + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="600"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                {orb.label}
              </text>
            </motion.g>
          );
        })}
        
        <AnimatePresence>
          {isColliding && selectedOrbs.length === 2 && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <circle
                cx={centerX}
                cy={centerY}
                r="35"
                fill="url(#grad-collision)"
              />
              <defs>
                <linearGradient id="grad-collision" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={MOOD_ORBS.find(o => o.id === selectedOrbs[0])?.color} />
                  <stop offset="100%" stopColor={MOOD_ORBS.find(o => o.id === selectedOrbs[1])?.color} />
                </linearGradient>
              </defs>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <AnimatePresence>
        {hybridResult && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-700/30"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
            >
              {hybridResult.title}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-purple-600/80 dark:text-purple-400/70 mt-1"
            >
              {hybridResult.desc}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedOrbs.length > 0 && !isColliding && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800"
            data-testid="button-reset-mixer"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
