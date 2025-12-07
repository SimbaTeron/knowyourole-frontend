import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles, Zap, Brain, Heart, Users, Target, Lightbulb, Flame, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MoodOrb {
  id: string;
  label: string;
  color: string;
  glowColor: string;
  icon: typeof Sparkles;
  boosts: { trait: string; amount: string; color: string }[];
  sampleQuestion: string;
}

const MOOD_ORBS: MoodOrb[] = [
  { 
    id: "happy", 
    label: "Happy", 
    color: "#FBBF24", 
    glowColor: "rgba(251, 191, 36, 0.5)",
    icon: Sparkles,
    boosts: [
      { trait: "Extraversion", amount: "+3%", color: "#FBBF24" },
      { trait: "Agreeableness", amount: "+3%", color: "#34D399" }
    ],
    sampleQuestion: "What brings a smile to your day?"
  },
  { 
    id: "calm", 
    label: "Calm", 
    color: "#60A5FA", 
    glowColor: "rgba(96, 165, 250, 0.5)",
    icon: Heart,
    boosts: [
      { trait: "Emotional Stability", amount: "+5%", color: "#60A5FA" },
      { trait: "Conscientiousness", amount: "+3%", color: "#14B8A6" }
    ],
    sampleQuestion: "How do you find peace in busy moments?"
  },
  { 
    id: "curious", 
    label: "Curious", 
    color: "#A78BFA", 
    glowColor: "rgba(167, 139, 250, 0.5)",
    icon: Brain,
    boosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "First Principles", amount: "+5%", color: "#F472B6" }
    ],
    sampleQuestion: "What mystery would you love to solve?"
  },
  { 
    id: "determined", 
    label: "Determined", 
    color: "#F87171", 
    glowColor: "rgba(248, 113, 113, 0.5)",
    icon: Target,
    boosts: [
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What goal keeps you pushing forward?"
  },
  { 
    id: "creative", 
    label: "Creative", 
    color: "#F472B6", 
    glowColor: "rgba(244, 114, 182, 0.5)",
    icon: Lightbulb,
    boosts: [
      { trait: "Openness", amount: "+10%", color: "#A78BFA" },
      { trait: "First Principles", amount: "+8%", color: "#F472B6" }
    ],
    sampleQuestion: "If you could invent anything, what would it be?"
  },
  { 
    id: "social", 
    label: "Social", 
    color: "#34D399", 
    glowColor: "rgba(52, 211, 153, 0.5)",
    icon: Users,
    boosts: [
      { trait: "Extraversion", amount: "+10%", color: "#FBBF24" },
      { trait: "Agreeableness", amount: "+5%", color: "#34D399" }
    ],
    sampleQuestion: "Who energizes you the most?"
  },
  { 
    id: "focused", 
    label: "Focused", 
    color: "#14B8A6", 
    glowColor: "rgba(20, 184, 166, 0.5)",
    icon: Target,
    boosts: [
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What helps you stay in the zone?"
  },
  { 
    id: "adventurous", 
    label: "Bold", 
    color: "#F97316", 
    glowColor: "rgba(249, 115, 22, 0.5)",
    icon: Flame,
    boosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+5%", color: "#FBBF24" }
    ],
    sampleQuestion: "What's the boldest thing you've done?"
  },
];

export interface BlendInfo {
  title: string;
  desc: string;
  emoji: string;
  combinedBoosts: { trait: string; amount: string; color: string }[];
  sampleQuestion: string;
}

export const HYBRID_HINTS: Record<string, BlendInfo> = {
  "calm+happy": { 
    title: "Peaceful Optimist", 
    desc: "You bring steady sunshine to every situation",
    emoji: "🌅",
    combinedBoosts: [
      { trait: "Emotional Stability", amount: "+5%", color: "#60A5FA" },
      { trait: "Extraversion", amount: "+3%", color: "#FBBF24" },
      { trait: "Agreeableness", amount: "+3%", color: "#34D399" }
    ],
    sampleQuestion: "When you pause and reflect, what brings you the most joy?"
  },
  "curious+happy": { 
    title: "Wonder Seeker", 
    desc: "You find joy in learning new things",
    emoji: "✨",
    combinedBoosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+3%", color: "#FBBF24" },
      { trait: "First Principles", amount: "+5%", color: "#F472B6" }
    ],
    sampleQuestion: "What discovery made you happiest recently?"
  },
  "determined+happy": { 
    title: "Driven Enthusiast", 
    desc: "You chase goals with a smile",
    emoji: "🚀",
    combinedBoosts: [
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "Extraversion", amount: "+3%", color: "#FBBF24" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What goal excites you most right now?"
  },
  "creative+happy": { 
    title: "Joyful Creator", 
    desc: "You make beautiful things with positive energy",
    emoji: "🎨",
    combinedBoosts: [
      { trait: "Openness", amount: "+10%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+3%", color: "#FBBF24" },
      { trait: "First Principles", amount: "+8%", color: "#F472B6" }
    ],
    sampleQuestion: "What would you create if anything was possible?"
  },
  "happy+social": { 
    title: "Life of the Party", 
    desc: "Your energy lights up every room",
    emoji: "🎉",
    combinedBoosts: [
      { trait: "Extraversion", amount: "+13%", color: "#FBBF24" },
      { trait: "Agreeableness", amount: "+8%", color: "#34D399" }
    ],
    sampleQuestion: "How do you bring joy to the people around you?"
  },
  "focused+happy": { 
    title: "Productive Optimist", 
    desc: "You tackle tasks with a cheerful mindset",
    emoji: "⚡",
    combinedBoosts: [
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "Extraversion", amount: "+3%", color: "#FBBF24" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What task brings you satisfaction when completed?"
  },
  "adventurous+happy": { 
    title: "Thrill Seeker", 
    desc: "You find joy in new experiences",
    emoji: "🌟",
    combinedBoosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+8%", color: "#FBBF24" },
      { trait: "Agreeableness", amount: "+3%", color: "#34D399" }
    ],
    sampleQuestion: "What adventure are you dreaming of?"
  },
  "calm+curious": { 
    title: "Thoughtful Explorer", 
    desc: "You ponder deeply before diving in",
    emoji: "🔮",
    combinedBoosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Emotional Stability", amount: "+5%", color: "#60A5FA" },
      { trait: "First Principles", amount: "+5%", color: "#F472B6" }
    ],
    sampleQuestion: "What question do you find yourself pondering?"
  },
  "calm+determined": { 
    title: "Steady Achiever", 
    desc: "You reach goals without breaking a sweat",
    emoji: "🏔️",
    combinedBoosts: [
      { trait: "Conscientiousness", amount: "+11%", color: "#14B8A6" },
      { trait: "Emotional Stability", amount: "+5%", color: "#60A5FA" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "How do you stay calm under pressure?"
  },
  "calm+creative": { 
    title: "Serene Artist", 
    desc: "You create from a place of peace",
    emoji: "🎭",
    combinedBoosts: [
      { trait: "Openness", amount: "+10%", color: "#A78BFA" },
      { trait: "Emotional Stability", amount: "+5%", color: "#60A5FA" },
      { trait: "First Principles", amount: "+8%", color: "#F472B6" }
    ],
    sampleQuestion: "What inspires your most peaceful creations?"
  },
  "calm+social": { 
    title: "Gentle Connector", 
    desc: "You build lasting bonds through patience",
    emoji: "🤝",
    combinedBoosts: [
      { trait: "Extraversion", amount: "+10%", color: "#FBBF24" },
      { trait: "Emotional Stability", amount: "+5%", color: "#60A5FA" },
      { trait: "Agreeableness", amount: "+8%", color: "#34D399" }
    ],
    sampleQuestion: "How do you nurture your closest relationships?"
  },
  "calm+focused": { 
    title: "Zen Master", 
    desc: "You maintain clarity in any situation",
    emoji: "🧘",
    combinedBoosts: [
      { trait: "Conscientiousness", amount: "+11%", color: "#14B8A6" },
      { trait: "Emotional Stability", amount: "+5%", color: "#60A5FA" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What helps you find your center?"
  },
  "adventurous+calm": { 
    title: "Cool Explorer", 
    desc: "You embrace the unknown with composure",
    emoji: "🧭",
    combinedBoosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Emotional Stability", amount: "+5%", color: "#60A5FA" },
      { trait: "Extraversion", amount: "+5%", color: "#FBBF24" }
    ],
    sampleQuestion: "What unknown territory calls to you?"
  },
  "curious+determined": { 
    title: "Knowledge Hunter", 
    desc: "You won't stop until you understand",
    emoji: "🔍",
    combinedBoosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "First Principles", amount: "+5%", color: "#F472B6" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What topic could you research for hours?"
  },
  "curious+creative": { 
    title: "Inventive Mind", 
    desc: "You see possibilities others miss",
    emoji: "💡",
    combinedBoosts: [
      { trait: "Openness", amount: "+18%", color: "#A78BFA" },
      { trait: "First Principles", amount: "+13%", color: "#F472B6" }
    ],
    sampleQuestion: "What impossible idea do you secretly believe in?"
  },
  "curious+social": { 
    title: "People Watcher", 
    desc: "You love understanding what makes others tick",
    emoji: "👀",
    combinedBoosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+10%", color: "#FBBF24" },
      { trait: "Agreeableness", amount: "+5%", color: "#34D399" },
      { trait: "First Principles", amount: "+5%", color: "#F472B6" }
    ],
    sampleQuestion: "What fascinates you most about people?"
  },
  "curious+focused": { 
    title: "Deep Diver", 
    desc: "You concentrate intensely on what interests you",
    emoji: "🌊",
    combinedBoosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "First Principles", amount: "+5%", color: "#F472B6" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What topic deserves your deep focus?"
  },
  "adventurous+curious": { 
    title: "Pioneer Spirit", 
    desc: "You explore uncharted territory with wonder",
    emoji: "🗺️",
    combinedBoosts: [
      { trait: "Openness", amount: "+16%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+5%", color: "#FBBF24" },
      { trait: "First Principles", amount: "+5%", color: "#F472B6" }
    ],
    sampleQuestion: "What frontier would you love to explore?"
  },
  "creative+determined": { 
    title: "Ambitious Maker", 
    desc: "You turn visions into reality",
    emoji: "🛠️",
    combinedBoosts: [
      { trait: "Openness", amount: "+10%", color: "#A78BFA" },
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "First Principles", amount: "+8%", color: "#F472B6" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What big project are you building?"
  },
  "determined+social": { 
    title: "Team Leader", 
    desc: "You inspire others to reach their potential",
    emoji: "👑",
    combinedBoosts: [
      { trait: "Extraversion", amount: "+10%", color: "#FBBF24" },
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "Agreeableness", amount: "+5%", color: "#34D399" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "How do you bring out the best in your team?"
  },
  "determined+focused": { 
    title: "Unstoppable Force", 
    desc: "Nothing distracts you from your mission",
    emoji: "🎯",
    combinedBoosts: [
      { trait: "Conscientiousness", amount: "+16%", color: "#14B8A6" },
      { trait: "Critical Thinking", amount: "+10%", color: "#F87171" }
    ],
    sampleQuestion: "What mission are you fully committed to?"
  },
  "adventurous+determined": { 
    title: "Trailblazer", 
    desc: "You push boundaries to achieve great things",
    emoji: "⛰️",
    combinedBoosts: [
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "Extraversion", amount: "+5%", color: "#FBBF24" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What boundary are you ready to push?"
  },
  "creative+social": { 
    title: "Collaborative Artist", 
    desc: "You bring out creativity in everyone",
    emoji: "🎪",
    combinedBoosts: [
      { trait: "Openness", amount: "+10%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+10%", color: "#FBBF24" },
      { trait: "Agreeableness", amount: "+5%", color: "#34D399" },
      { trait: "First Principles", amount: "+8%", color: "#F472B6" }
    ],
    sampleQuestion: "What would you create with your dream team?"
  },
  "creative+focused": { 
    title: "Master Craftsperson", 
    desc: "You perfect your art with dedication",
    emoji: "🏆",
    combinedBoosts: [
      { trait: "Openness", amount: "+10%", color: "#A78BFA" },
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "First Principles", amount: "+8%", color: "#F472B6" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What skill are you mastering?"
  },
  "adventurous+creative": { 
    title: "Wild Innovator", 
    desc: "You create bold new things without fear",
    emoji: "🌋",
    combinedBoosts: [
      { trait: "Openness", amount: "+18%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+5%", color: "#FBBF24" },
      { trait: "First Principles", amount: "+8%", color: "#F472B6" }
    ],
    sampleQuestion: "What wild idea are you ready to try?"
  },
  "focused+social": { 
    title: "Relationship Builder", 
    desc: "You invest deeply in meaningful connections",
    emoji: "💎",
    combinedBoosts: [
      { trait: "Extraversion", amount: "+10%", color: "#FBBF24" },
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "Agreeableness", amount: "+5%", color: "#34D399" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "Who deserves more of your focused attention?"
  },
  "adventurous+social": { 
    title: "Social Butterfly", 
    desc: "You thrive meeting new people everywhere",
    emoji: "🦋",
    combinedBoosts: [
      { trait: "Extraversion", amount: "+15%", color: "#FBBF24" },
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Agreeableness", amount: "+5%", color: "#34D399" }
    ],
    sampleQuestion: "Where would you love to meet new people?"
  },
  "adventurous+focused": { 
    title: "Goal Crusher", 
    desc: "You pursue ambitious dreams with laser focus",
    emoji: "💪",
    combinedBoosts: [
      { trait: "Conscientiousness", amount: "+8%", color: "#14B8A6" },
      { trait: "Openness", amount: "+8%", color: "#A78BFA" },
      { trait: "Extraversion", amount: "+5%", color: "#FBBF24" },
      { trait: "Critical Thinking", amount: "+5%", color: "#F87171" }
    ],
    sampleQuestion: "What ambitious goal are you laser-focused on?"
  },
};

export function getHybridKey(id1: string, id2: string): string {
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

interface SwirlParticle {
  id: number;
  angle: number;
  radius: number;
  color: string;
  size: number;
  speed: number;
}

interface MoodAlchemyLabProps {
  onMoodBrewed?: (mood1: string, mood2: string, blendName: string) => void;
  onSkip?: () => void;
}

export default function MoodAlchemyLab({ onMoodBrewed, onSkip }: MoodAlchemyLabProps) {
  const [selectedOrbs, setSelectedOrbs] = useState<string[]>([]);
  const [hybridResult, setHybridResult] = useState<BlendInfo | null>(null);
  const [isColliding, setIsColliding] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [swirlParticles, setSwirlParticles] = useState<SwirlParticle[]>([]);
  const [orbPositions, setOrbPositions] = useState<Record<string, { angle: number; pulled: boolean }>>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const centerX = 180;
  const centerY = 180;
  const orbitRadius = 130;

  useEffect(() => {
    const initialPositions: Record<string, { angle: number; pulled: boolean }> = {};
    MOOD_ORBS.forEach((orb, idx) => {
      initialPositions[orb.id] = {
        angle: (idx * 45) * (Math.PI / 180),
        pulled: false
      };
    });
    setOrbPositions(initialPositions);
  }, []);


  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.08,
            life: p.life - 0.025
          }))
          .filter(p => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  useEffect(() => {
    if (swirlParticles.length === 0) return;
    
    const interval = setInterval(() => {
      setSwirlParticles(prev => 
        prev.map(p => ({
          ...p,
          angle: p.angle + p.speed,
          radius: Math.max(5, p.radius - 0.8)
        })).filter(p => p.radius > 5)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [swirlParticles.length]);

  const createSwirlEffect = useCallback((color1: string, color2: string) => {
    const newParticles: SwirlParticle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: Date.now() + i,
        angle: (Math.PI * 2 * i) / 15,
        radius: 60 + Math.random() * 40,
        color: i % 2 === 0 ? color1 : color2,
        size: 3 + Math.random() * 4,
        speed: 0.08 + Math.random() * 0.06
      });
    }
    setSwirlParticles(newParticles);
  }, []);

  const createParticleBurst = useCallback((color1: string, color2: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const speed = 2.5 + Math.random() * 3;
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

  const [lastTapTime, setLastTapTime] = useState<Record<string, number>>({});
  const [draggedOrb, setDraggedOrb] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Tap-based interaction: first tap shows details, second tap selects
  const handleOrbTap = (orbId: string, event: React.MouseEvent | React.PointerEvent) => {
    if (selectedOrbs.length >= 2 || selectedOrbs.includes(orbId) || isColliding) return;
    
    if (navigator.vibrate) navigator.vibrate(15);
    
    // If tooltip is already showing for this orb, select it (second tap)
    if (showTooltip === orbId) {
      setShowTooltip(null);
      selectOrb(orbId);
    } else {
      // First tap - show tooltip with details
      setShowTooltip(orbId);
      const rect = (event.target as Element).getBoundingClientRect();
      setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    }
  };
  
  const selectOrb = (orbId: string) => {
    if (selectedOrbs.length >= 2 || selectedOrbs.includes(orbId) || isColliding) return;
    
    if (navigator.vibrate) navigator.vibrate(30);
    setShowTooltip(null);
    
    setOrbPositions(prev => ({
      ...prev,
      [orbId]: { ...prev[orbId], pulled: true }
    }));
    
    const newSelected = [...selectedOrbs, orbId];
    setSelectedOrbs(newSelected);
    
    if (newSelected.length === 1) {
      const orb = MOOD_ORBS.find(o => o.id === orbId);
      if (orb) {
        createSwirlEffect(orb.color, orb.color);
      }
    }
    
    if (newSelected.length === 2) {
      setTimeout(() => {
        setIsColliding(true);
        if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
        
        const orb1 = MOOD_ORBS.find(o => o.id === newSelected[0]);
        const orb2 = MOOD_ORBS.find(o => o.id === newSelected[1]);
        if (orb1 && orb2) {
          createSwirlEffect(orb1.color, orb2.color);
          setTimeout(() => createParticleBurst(orb1.color, orb2.color), 400);
        }
        
        setTimeout(() => {
          const key = getHybridKey(newSelected[0], newSelected[1]);
          const result = HYBRID_HINTS[key] || { 
            title: "Unique Blend", 
            desc: "A one-of-a-kind personality mix!",
            emoji: "✨",
            combinedBoosts: [],
            sampleQuestion: "What makes you uniquely you?"
          };
          setHybridResult(result);
          setIsColliding(false);
          
          const storedMood = `${newSelected[0]}|${newSelected[1]}`;
          sessionStorage.setItem("knowrole-mood-blend", storedMood);
          sessionStorage.setItem("knowrole-blend-name", result.title);
          
          if (onMoodBrewed) onMoodBrewed(newSelected[0], newSelected[1], result.title);
        }, 700);
      }, 400);
    }
  };
  
  const handleDragEnd = (orbId: string, offsetX: number, offsetY: number) => {
    const pos = getOrbPosition(orbId);
    const finalX = pos.x + offsetX;
    const finalY = pos.y + offsetY;
    const distanceToCenter = Math.sqrt((finalX - centerX) ** 2 + (finalY - centerY) ** 2);
    
    if (distanceToCenter < 60) {
      selectOrb(orbId);
    }
    
    setDraggedOrb(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleOrbHover = (orbId: string, event: React.MouseEvent) => {
    if (selectedOrbs.length >= 2 || isColliding) return;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setShowTooltip(orbId);
  };

  const handleReset = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    setSelectedOrbs([]);
    setHybridResult(null);
    setIsColliding(false);
    setParticles([]);
    setSwirlParticles([]);
    setShowTooltip(null);
    
    sessionStorage.removeItem("knowrole-mood-blend");
    sessionStorage.removeItem("knowrole-blend-name");
    
    const resetPositions: Record<string, { angle: number; pulled: boolean }> = {};
    MOOD_ORBS.forEach((orb, idx) => {
      resetPositions[orb.id] = {
        angle: (idx * 45) * (Math.PI / 180),
        pulled: false
      };
    });
    setOrbPositions(resetPositions);
  };

  const handleSkipNeutral = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    sessionStorage.setItem("knowrole-mood-blend", "neutral");
    sessionStorage.setItem("knowrole-blend-name", "Balanced Explorer");
    if (onSkip) onSkip();
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

  const tooltipOrb = showTooltip ? MOOD_ORBS.find(o => o.id === showTooltip) : null;

  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      <AnimatePresence>
        {tooltipOrb && !selectedOrbs.includes(tooltipOrb.id) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-50 w-64 p-3 rounded-xl bg-white/95 dark:bg-gray-800/95 shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <button 
              onClick={() => setShowTooltip(null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: tooltipOrb.color }}
              >
                <tooltipOrb.icon className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{tooltipOrb.label}</span>
            </div>
            <div className="space-y-1.5">
              {tooltipOrb.boosts.map((boost, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Zap className="w-3 h-3" style={{ color: boost.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{boost.trait}</span>
                  <span className="font-medium" style={{ color: boost.color }}>{boost.amount}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-xs italic text-gray-500 dark:text-gray-400 mb-2">
                "{tooltipOrb.sampleQuestion}"
              </p>
              <Button
                size="sm"
                className="w-full text-xs"
                style={{ backgroundColor: tooltipOrb.color }}
                onClick={() => {
                  setShowTooltip(null);
                  selectOrb(tooltipOrb.id);
                }}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Select {tooltipOrb.label}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg 
        viewBox="0 0 360 360" 
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}
      >
        <defs>
          {MOOD_ORBS.map(orb => (
            <radialGradient key={`grad-${orb.id}`} id={`grad-${orb.id}`}>
              <stop offset="0%" stopColor={orb.color} stopOpacity="1" />
              <stop offset="70%" stopColor={orb.color} stopOpacity="0.85" />
              <stop offset="100%" stopColor={orb.color} stopOpacity="0.6" />
            </radialGradient>
          ))}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={orbitRadius + 15} 
          fill="none" 
          stroke="url(#alchemyRing)"
          strokeWidth="2"
          strokeOpacity="0.3"
          className="text-warm-gray dark:text-soft-cream"
        />
        <defs>
          <linearGradient id="alchemyRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
        
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={orbitRadius} 
          fill="none" 
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="1"
          strokeDasharray="6 6"
          className="text-warm-gray dark:text-soft-cream"
        />
        
        <circle 
          cx={centerX} 
          cy={centerY} 
          r="55" 
          fill="url(#cauldronGradient)"
          fillOpacity="0.15"
          filter="url(#innerGlow)"
        />
        <circle 
          cx={centerX} 
          cy={centerY} 
          r="45" 
          fill="url(#cauldronInner)"
          fillOpacity="0.1"
        />
        <defs>
          <radialGradient id="cauldronGradient">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="cauldronInner">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        
        {swirlParticles.map(particle => (
          <motion.circle
            key={particle.id}
            cx={centerX + Math.cos(particle.angle) * particle.radius}
            cy={centerY + Math.sin(particle.angle) * particle.radius}
            r={particle.size * (particle.radius / 100)}
            fill={particle.color}
            opacity={0.7}
          />
        ))}
        
        {particles.map(particle => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size * particle.life}
            fill={particle.color}
            opacity={particle.life * 0.8}
          />
        ))}
        
        {MOOD_ORBS.map(orb => {
          const pos = getOrbPosition(orb.id);
          const isSelected = selectedOrbs.includes(orb.id);
          const isAvailable = selectedOrbs.length < 2 && !isSelected && !isColliding;
          const isDragging = draggedOrb === orb.id;
          
          if (isColliding && isSelected) {
            return null;
          }
          
          const animateX = isDragging ? pos.x - centerX + dragOffset.x : pos.x - centerX;
          const animateY = isDragging ? pos.y - centerY + dragOffset.y : pos.y - centerY;
          
          return (
            <motion.g
              key={orb.id}
              initial={false}
              animate={{
                x: pos.x - centerX,
                y: pos.y - centerY,
                scale: isSelected ? 0.7 : 1,
                opacity: isSelected && !isColliding ? 0 : 1
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 18
              }}
              style={{ 
                cursor: isAvailable ? 'pointer' : 'default',
                touchAction: 'manipulation'
              }}
              onClick={(e) => isAvailable && handleOrbTap(orb.id, e)}
              data-testid={`orb-${orb.id}`}
            >
              <motion.circle
                cx={centerX}
                cy={centerY}
                r={isAvailable ? 44 : 40}
                fill="transparent"
                animate={isAvailable && !isDragging ? { r: [44, 46, 44] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <circle
                cx={centerX}
                cy={centerY}
                r="40"
                fill={`url(#grad-${orb.id})`}
                filter="url(#glow)"
              />
              
              <motion.circle
                cx={centerX}
                cy={centerY}
                r="40"
                fill="none"
                stroke="white"
                strokeWidth={isDragging ? 3 : 2}
                strokeOpacity={isDragging ? 0.7 : isAvailable ? 0.3 : 0}
                animate={isAvailable && !isDragging ? { strokeOpacity: [0.2, 0.4, 0.2] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              <text
                x={centerX}
                y={centerY + 5}
                textAnchor="middle"
                fill="white"
                fontSize="13"
                fontWeight="600"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)', pointerEvents: 'none' }}
              >
                {orb.label}
              </text>
              
              {isAvailable && !isDragging && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.5 }}
                >
                  <circle
                    cx={centerX + 28}
                    cy={centerY - 28}
                    r="8"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  <Info 
                    x={centerX + 22}
                    y={centerY - 34}
                    width={12}
                    height={12}
                    className="text-gray-500"
                  />
                </motion.g>
              )}
            </motion.g>
          );
        })}
        
        <AnimatePresence>
          {isColliding && selectedOrbs.length === 2 && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <circle
                cx={centerX}
                cy={centerY}
                r="55"
                fill="url(#grad-collision)"
                filter="url(#glow)"
              />
              <motion.circle
                cx={centerX}
                cy={centerY}
                r="55"
                fill="none"
                stroke="white"
                strokeWidth="3"
                initial={{ strokeOpacity: 0.8, r: 55 }}
                animate={{ strokeOpacity: 0, r: 80 }}
                transition={{ duration: 0.8 }}
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
        
        {draggedOrb && (
          <motion.circle
            cx={centerX}
            cy={centerY}
            r="60"
            fill="none"
            stroke="url(#alchemyRing)"
            strokeWidth="3"
            strokeDasharray="8 4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
        
        {selectedOrbs.length === 0 && !draggedOrb && (
          <>
            <motion.text
              x={centerX}
              y={centerY - 4}
              textAnchor="middle"
              fill="currentColor"
              fillOpacity="0.5"
              fontSize="11"
              fontWeight="500"
              className="text-warm-gray dark:text-soft-cream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Tap orb for details
            </motion.text>
            <motion.text
              x={centerX}
              y={centerY + 12}
              textAnchor="middle"
              fill="currentColor"
              fillOpacity="0.4"
              fontSize="11"
              fontWeight="600"
              className="text-warm-gray dark:text-soft-cream"
            >
              Drag here to select
            </motion.text>
          </>
        )}
        
        {draggedOrb && (
          <motion.text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            fill="url(#alchemyRing)"
            fontSize="14"
            fontWeight="700"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3, scale: { repeat: Infinity, duration: 1 } }}
          >
            Drop to Brew!
          </motion.text>
        )}
        
        {selectedOrbs.length === 1 && !draggedOrb && (
          <motion.text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            fill="currentColor"
            fillOpacity="0.5"
            fontSize="11"
            fontWeight="500"
            className="text-warm-gray dark:text-soft-cream"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Drag one more orb here
          </motion.text>
        )}
      </svg>

      <AnimatePresence>
        {hybridResult && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-pink-50/90 dark:from-purple-900/40 dark:to-pink-900/40 border border-purple-200/50 dark:border-purple-700/30 shadow-lg"
          >
            <div className="text-center mb-3">
              <motion.span 
                className="text-3xl"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                {hybridResult.emoji}
              </motion.span>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold mt-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
              >
                {hybridResult.title}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-purple-600/80 dark:text-purple-400/70 mt-1"
              >
                {hybridResult.desc}
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 pt-3 border-t border-purple-200/30 dark:border-purple-700/30"
            >
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Trait Boosts
              </p>
              <div className="flex flex-wrap gap-2">
                {hybridResult.combinedBoosts.map((boost, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-white/60 dark:bg-gray-800/60"
                    style={{ color: boost.color, borderColor: boost.color, borderWidth: 1 }}
                  >
                    {boost.trait} {boost.amount}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4 pt-3 border-t border-purple-200/30 dark:border-purple-700/30"
            >
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Sample Question
              </p>
              <p className="text-sm italic text-gray-600 dark:text-gray-400 bg-white/40 dark:bg-gray-800/40 rounded-lg p-2">
                "{hybridResult.sampleQuestion}"
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-col items-center gap-2">
        {selectedOrbs.length > 0 && !isColliding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800"
              data-testid="button-reset-mixer"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Try Different Moods
            </Button>
          </motion.div>
        )}

        {selectedOrbs.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipNeutral}
              className="text-sm text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              data-testid="button-skip-neutral"
            >
              Skip — I'm feeling balanced today
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
