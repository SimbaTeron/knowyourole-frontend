import { useState } from 'react';
import { useLocation } from 'wouter';
import { PageContainer } from '@/components/layout/PageContainer';
import { CompactHeader } from '@/components/layout/CompactHeader';
import { GlassCard } from '@/components/glass/GlassCard';
import { NeonButton } from '@/components/glass/NeonButton';

const moods = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#FBBF24' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#60A5FA' },
  { id: 'curious', emoji: '🤔', label: 'Curious', color: '#A78BFA' },
  { id: 'determined', emoji: '💪', label: 'Determined', color: '#F87171' },
  { id: 'creative', emoji: '🎨', label: 'Creative', color: '#F472B6' },
  { id: 'social', emoji: '🤝', label: 'Social', color: '#34D399' },
];

export default function MoodMixerPage() {
  const [, setLocation] = useLocation();
  const [selectedMoods, setSelectedMoods] = useState<Record<string, number>>({});

  const toggleMood = (id: string) => {
    setSelectedMoods(prev => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      // Max 3 moods
      if (Object.keys(prev).length >= 3) return prev;
      return { ...prev, [id]: 50 };
    });
  };

  const handleSliderChange = (id: string, value: number) => {
    setSelectedMoods(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    alert('Mood blend saved!');
    setLocation('/');
  };

  return (
    <PageContainer padded={false}>
      <CompactHeader
        title="Mood Mixer"
        onBack={() => setLocation('/')}
        onMenu={() => {}}
      />

      {/* Page content */}
      <div className="min-h-screen pt-20 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          {/* Title + subtitle */}
          <div className="mb-8">
            <h1
              className="text-white font-display font-bold mb-2"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              Create Your Mood Blend
            </h1>
            <p className="text-white/50 text-sm" style={{ maxWidth: 320 }}>
              Select up to 3 moods to blend into your unique mix.
            </p>
          </div>

          {/* 2x3 mood grid */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {moods.map(mood => {
              const isSelected = selectedMoods[mood.id] !== undefined;
              const pct = selectedMoods[mood.id] ?? 50;

              return (
                <div
                  key={mood.id}
                  onClick={() => toggleMood(mood.id)}
                  className="cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `2px solid ${isSelected ? mood.color : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 16,
                    padding: '24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isSelected
                      ? `0 0 20px ${mood.color}40, 0 0 40px ${mood.color}20`
                      : 'none',
                    transform: 'translateY(0)',
                  }}
                >
                  {/* Emoji */}
                  <span
                    className="text-4xl select-none"
                    style={{ filter: isSelected ? 'none' : 'grayscale(30%)' }}
                  >
                    {mood.emoji}
                  </span>

                  {/* Mood name */}
                  <span
                    className="text-sm font-bold text-white"
                    style={{ opacity: isSelected ? 1 : 0.7 }}
                  >
                    {mood.label}
                  </span>

                  {/* Percentage badge (always visible on selected) */}
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: mood.color,
                      opacity: isSelected ? 1 : 0,
                      transition: 'opacity 0.3s',
                    }}
                  >
                    {pct}%
                  </span>

                  {/* Slider — only shown when selected */}
                  {isSelected && (
                    <div className="w-full mt-2 flex flex-col items-center gap-1">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={pct}
                        onChange={e => {
                          e.stopPropagation();
                          handleSliderChange(mood.id, Number(e.target.value));
                        }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: '100%',
                          accentColor: mood.color,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  )}

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: mood.color, color: '#000' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: 1 column override */}
          <style>{`
            @media (max-width: 480px) {
              .mood-grid-inner { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-8"
        style={{
          paddingTop: 20,
          background: 'linear-gradient(to top, rgba(3,4,14,0.95), rgba(3,4,14,0.8), transparent)',
        }}
      >
        <div
          className="max-w-lg mx-auto flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '16px 20px',
          }}
        >
          {/* Left: Your Blend */}
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm font-semibold">Your Blend:</span>
            <div className="flex items-center gap-1">
              {Object.keys(selectedMoods).length === 0 ? (
                <span className="text-white/30 text-sm">Select moods above</span>
              ) : (
                Object.entries(selectedMoods).map(([id, pct]) => {
                  const mood = moods.find(m => m.id === id);
                  if (!mood) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                      style={{ background: `${mood.color}20`, border: `1px solid ${mood.color}60` }}
                    >
                      <span>{mood.emoji}</span>
                      <span style={{ color: mood.color }} className="font-semibold">
                        {pct}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Save Blend */}
          <NeonButton
            variant="success"
            disabled={Object.keys(selectedMoods).length === 0}
            onClick={handleSave}
            style={{ whiteSpace: 'nowrap' }}
          >
            Save Blend →
          </NeonButton>
        </div>
      </div>
    </PageContainer>
  );
}
