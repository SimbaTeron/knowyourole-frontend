interface LandmarkBadgeProps {
  landmark: string;
  icon: string;
  themeClass: string;
  city?: string;
}

export default function LandmarkBadge({ landmark, icon, themeClass, city }: LandmarkBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg ${themeClass}`}>
      <span className="text-lg">{icon}</span>
      <span>{city ? `${city} • ${landmark}` : landmark}</span>
    </div>
  );
}
