interface GlassTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function GlassTabs({ tabs, activeTab, onChange }: GlassTabsProps) {
  return (
    <div className="tab-list">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab-item ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
