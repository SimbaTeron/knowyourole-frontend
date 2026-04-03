import LandmarkBadge from "../LandmarkBadge";

export default function LandmarkBadgeExample() {
  return (
    <div className="p-6 bg-soft-cream dark:bg-deep-cream rounded-xl space-y-4">
      <div className="flex flex-wrap gap-3 justify-center">
        <LandmarkBadge landmark="Empire State" icon="🏢" themeClass="skyline-glow" city="New York" />
        <LandmarkBadge landmark="Taj Mahal" icon="🕌" themeClass="ivory-dome" city="Agra" />
        <LandmarkBadge landmark="Eiffel Tower" icon="🗼" themeClass="iron-lace" city="Paris" />
        <LandmarkBadge landmark="Tokyo Tower" icon="🗼" themeClass="neon-tokyo" city="Tokyo" />
        <LandmarkBadge landmark="City Center" icon="🏙️" themeClass="global-city" />
      </div>
    </div>
  );
}
