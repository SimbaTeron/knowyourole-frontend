import {
  Building2, Film, Building, Landmark, Sparkles, Palmtree, TowerControl,
  Castle, Mountain, CircleDot, Waves, Crown, Trees, Clock, Trophy,
  Umbrella, Church, Theater, Train, Milestone, Gem,
  Ship, TreePine
} from "lucide-react";

const iconMap: Record<string, typeof Building2> = {
  Building2, Film, Building, Landmark, Sparkles, Palmtree, TowerControl,
  Castle, Mountain, CircleDot, Waves, Crown, Trees, Clock, Trophy,
  Umbrella, Church, Theater, Train, Milestone, Gem,
  Ship, TreePine, Tower: TowerControl
};

interface LandmarkBadgeProps {
  landmark: string;
  lucideIcon?: string;
  themeClass: string;
  city?: string;
}

export default function LandmarkBadge({ landmark, lucideIcon, themeClass, city }: LandmarkBadgeProps) {
  const IconComponent = lucideIcon ? iconMap[lucideIcon] : Building2;
  
  return (
    <div 
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-full text-white text-sm font-medium ${themeClass}`}
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)'
      }}
    >
      <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
        {IconComponent && <IconComponent className="w-4 h-4" />}
      </div>
      <span className="font-medium">{city ? `${city} · ${landmark}` : landmark}</span>
    </div>
  );
}
