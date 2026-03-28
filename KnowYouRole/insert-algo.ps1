$f = "C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
$content = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

$algo = @"
// ─── MOOD SHIFT ALGORITHM ────────────────────────────────────────────────────
type TraitKey = "focus" | "emotion" | "creative" | "social" | "resilience";

interface TraitShift {
  key: TraitKey;
  label: string;
  emoji: string;
  delta: number;
  direction: "boost" | "nudge" | "dampen";
}

interface MoodVector {
  focus: number; emotion: number; creative: number; social: number; resilience: number;
}

const MOOD_VECTORS: Record<string, MoodVector> = {
  focused:    { focus: 9,  emotion: 2,  creative: 5,  social: -2, resilience: 7 },
  creative:   { focus: 4,  emotion: 1,  creative: 9,  social: 6,  resilience: 3 },
  calm:       { focus: 2,  emotion: 9,  creative: 4,  social: -2, resilience: 5 },
  energetic:  { focus: 3,  emotion: -3, creative: 5,  social: 9,  resilience: 7 },
  curious:    { focus: 6,  emotion: 5,  creative: 8,  social: 4,  resilience: 3 },
  determined: { focus: 8,  emotion: 3,  creative: 3,  social: 2,  resilience: 9 },
  social:     { focus: 2,  emotion: 7,  creative: 4,  social: 9,  resilience: 4 },
  reflective: { focus: 3,  emotion: 8,  creative: 7,  social: 1,  resilience: 5 },
};

const TRAIT_LABELS: Record<TraitKey, { label: string; emoji: string }> = {
  focus:     { label: "Focus Depth",        emoji: "🎯" },
  emotion:   { label: "Emotional Balance",  emoji: "💎" },
  creative:  { label: "Creative Vision",    emoji: "🎨" },
  social:    { label: "Social Magnetism",    emoji: "🤝" },
  resilience:{ label: "Resilience",         emoji: "⚡" },
};

function getMoodShiftData(mood1Id: string, mood2Id: string): TraitShift[] {
  const v1 = MOOD_VECTORS[mood1Id] ?? { focus: 0, emotion: 0, creative: 0, social: 0, resilience: 0 };
  const v2 = MOOD_VECTORS[mood2Id] ?? { focus: 0, emotion: 0, creative: 0, social: 0, resilience: 0 };
  const traits: TraitKey[] = ["focus", "emotion", "creative", "social", "resilience"];
  const combined = traits.map(t => ({ key: t, delta: Math.round((v1[t] + v2[t]) / 2) }));
  const top3 = [...combined].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3);
  return top3.map(({ key, delta }) => {
    const abs = Math.abs(delta);
    const direction: TraitShift["direction"] = abs <= 2 ? "nudge" : delta > 0 ? "boost" : "dampen";
    return { key, label: TRAIT_LABELS[key].label, emoji: TRAIT_LABELS[key].emoji, delta, direction };
  });
}
"@

$idx = $content.IndexOf("// ─── RESULT CARD")
if ($idx -eq -1) {
    Write-Host "NOT FOUND"
} else {
    $result = $content.Insert($idx, $algo + "`n")
    [System.IO.File]::WriteAllText($f, $result, [System.Text.Encoding]::UTF8)
    Write-Host "Inserted at $idx"
}
