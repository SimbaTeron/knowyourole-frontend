import { useState } from "react";
import { useLocation } from "wouter";

const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy", color: "#FBBF24" },
  { id: "calm", emoji: "😌", label: "Calm", color: "#60A5FA" },
  { id: "curious", emoji: "🤔", label: "Curious", color: "#A78BFA" },
  { id: "determined", emoji: "💪", label: "Determined", color: "#F87171" },
  { id: "creative", emoji: "🎨", label: "Creative", color: "#F472B6" },
  { id: "social", emoji: "🤝", label: "Social", color: "#34D399" },
];

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "0",
};

export default function MoodMixer() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<Record<string, number>>({});

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      if (Object.keys(prev).length < 3) {
        return { ...prev, [id]: 50 };
      }
      return prev;
    });
  };

  const update = (id: string, val: number) => {
    setSelected(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = () => {
    setLocation("/crossroads");
  };

  const selectedList = Object.entries(selected);

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => history.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 20, padding: 8 }}>←</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#00C8FF" }}>Mood Mixer</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Content */}
      <div style={{ paddingTop: 80, padding: "clamp(80px, 15vw, 100px) clamp(16px, 4vw, 48px) 160px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ maxWidth: 700, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>Create Your Mood Blend</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)" }}>Select up to 3 moods. Adjust how strongly each one affects you.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {MOODS.map((mood) => {
              const isSelected = selected[mood.id] !== undefined;
              return (
                <div
                  key={mood.id}
                  onClick={() => toggle(mood.id)}
                  style={{
                    ...glassCard,
                    padding: "24px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    border: isSelected ? `2px solid ${mood.color}` : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isSelected ? `0 0 20px ${mood.color}40` : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 8 }}>{mood.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: "'Outfit',sans-serif", color: isSelected ? mood.color : "#fff" }}>{mood.label}</div>
                  {isSelected && (
                    <div style={{ marginTop: 12 }}>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={selected[mood.id]}
                        onChange={(e) => { e.stopPropagation(); update(mood.id, parseInt(e.target.value)); }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "100%",
                          accentColor: mood.color,
                          cursor: "pointer",
                        }}
                      />
                      <div style={{ fontSize: 12, color: mood.color, marginTop: 4, fontWeight: 600 }}>{selected[mood.id]}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px clamp(16px, 4vw, 48px)", background: "rgba(5,5,16,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Your Blend:</span>
            {selectedList.length === 0 ? (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Select moods above</span>
            ) : (
              selectedList.map(([id, val]) => {
                const m = MOODS.find(m => m.id === id)!;
                return (
                  <span key={id} style={{ fontSize: 20 }}>{m.emoji}</span>
                );
              })
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={selectedList.length === 0}
            style={{
              padding: "12px 28px",
              background: selectedList.length > 0 ? "#39FF14" : "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: 50,
              color: selectedList.length > 0 ? "#000" : "rgba(255,255,255,0.3)",
              fontWeight: 700,
              fontSize: 14,
              cursor: selectedList.length > 0 ? "pointer" : "not-allowed",
              fontFamily: "'Outfit',sans-serif",
              boxShadow: selectedList.length > 0 ? "0 0 20px rgba(57,255,20,0.4)" : "none",
            }}
          >
            Save Blend →
          </button>
        </div>
      </div>
    </div>
  );
}
