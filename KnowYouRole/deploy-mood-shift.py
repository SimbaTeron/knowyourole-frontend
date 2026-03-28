import subprocess, codecs

# ── Step 1: Get raw LF-only bytes from git ───────────────────────────────────
git_data = subprocess.check_output(
    ['git', 'cat-file', '-p', 'bbb6966:KnowYouRole/client/src/pages/mood-mixer.tsx'],
    cwd=r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole'
)
out_path = r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx'
with open(out_path, 'wb') as f:
    f.write(git_data)
text = git_data.decode('utf-8')

# ── Step 2: Find the "// ─── RESULT CARD ─────..." comment line ───────────────
rc_text_idx = text.find('RESULT CARD')
if rc_text_idx == -1:
    print("RESULT CARD not found!")
    exit(1)

# Find the full line boundaries
line_start = text.rfind('\n', 0, rc_text_idx) + 1
line_end = text.find('\n', rc_text_idx)
rc_comment_start = line_start
rc_comment_end = line_end + 1

# Next line after comment is "function ResultCard"
func_keyword_abs = rc_comment_end

# Find ( parameters ) { pattern to locate function body opening brace
params_idx = text.find(')', func_keyword_abs)
brace_abs = text.find('{', params_idx)

# Count braces to find closing } of the function
bc = 1
i = brace_abs + 1
in_str = False
str_char = None
while i < len(text) and bc > 0:
    c = text[i]
    if not in_str:
        if c in '"\'':
            in_str = True
            str_char = c
        elif c == '{':
            bc += 1
        elif c == '}':
            bc -= 1
    else:
        if c == str_char and text[i-1] != '\\':
            in_str = False
    i += 1

func_end = i

print(f"Comment: line {line_start}-{line_end}, func body brace at {brace_abs}, closes at {func_end}")
print(f"Replacing {func_end - brace_abs} char function with new ResultCard + algorithm")

# ── Step 3: Build new code ────────────────────────────────────────────────────
NEW_SECTION = """// ─── MOOD SHIFT ALGORITHM ────────────────────────────────────────────────────
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
  focus:     { label: "Focus Depth",        emoji: "\\uD83C\\uDFAF" },
  emotion:   { label: "Emotional Balance",  emoji: "\\uD83D\\uDC8E" },
  creative:  { label: "Creative Vision",    emoji: "\\uD83C\\uDFA8" },
  social:    { label: "Social Magnetism",   emoji: "\\uD83E\\uDD1D" },
  resilience:{ label: "Resilience",          emoji: "\\u26A1" },
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

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
function ResultCard({ mood1, mood2, onContinue, onReset }: {
  mood1: typeof MOODS[0];
  mood2: typeof MOODS[0];
  onContinue: () => void;
  onReset: () => void;
}) {
  const blendName = getBlendName(mood1.id, mood2.id);
  const shifts = getMoodShiftData(mood1.id, mood2.id);

  const tagStyle = (dir: TraitShift["direction"]): React.CSSProperties => {
    if (dir === "boost") return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0, background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)" };
    if (dir === "nudge") return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0, background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" };
    return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0, background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" };
  };

  const tagLabel = (dir: TraitShift["direction"]) => {
    if (dir === "boost") return "\\u21b7 Strong Boost";
    if (dir === "nudge") return "\\u21b7 Light Nudge";
    return "\\u21b9 Dampens";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 70, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 22, delay: 0.08 }}
      style={{
        background: "rgba(8,5,24,0.92)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1.5px solid rgba(255,255,255,0.13)",
        borderRadius: 32,
        padding: "clamp(28px, 6vw, 48px)",
        textAlign: "center",
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        boxShadow: `0 0 80px ${mood1.color}25, 0 0 120px ${mood2.color}16, 0 30px 80px rgba(0,0,0,0.65)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", inset: -1,
        borderRadius: 33,
        background: `linear-gradient(135deg, ${mood1.color}32, transparent 40%, transparent 60%, ${mood2.color}32)`,
        zIndex: -1,
      }} />

      <div style={{ position: "absolute", top: 16, right: 20 }}>
        <Sparkles size={20} color="#FBBF24" style={{ filter: "drop-shadow(0 0 6px #FBBF24)" }} />
      </div>
      <div style={{ position: "absolute", top: 22, left: 22 }}>
        <Sparkles size={14} color={mood1.color} style={{ filter: `drop-shadow(0 0 6px ${mood1.color})` }} />
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.22 }}
        style={{
          fontSize: "4rem",
          marginBottom: 16,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          filter: `drop-shadow(0 0 18px ${mood1.color}68)`,
        }}
      >
        <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0 }}>{mood1.emoji}</motion.span>
        <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.25 }}>{mood2.emoji}</motion.span>
      </motion.div>

      <div style={{
        fontSize: "clamp(1.5rem, 6vw, 2.4rem)",
        fontWeight: 900,
        letterSpacing: "-0.03em",
        background: `linear-gradient(90deg, ${mood1.color}, ${mood2.color})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontFamily: "'Outfit',sans-serif",
        marginBottom: 14,
        lineHeight: 1.2,
      }}>
        {blendName}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}>
        <span style={{
          background: `${mood1.color}16`,
          border: `1px solid ${mood1.color}42`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood1.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood1.label}</span>
        <span style={{ color: "rgba(255,255,255,0.26)", fontSize: 14 }}>*</span>
        <span style={{
          background: `${mood2.color}16`,
          border: `1px solid ${mood2.color}42`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood2.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood2.label}</span>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginBottom: 16 }}>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          marginBottom: 12,
        }}>
          How your moods shape your result
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shifts.map(shift => (
            <div key={shift.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: 130, flexShrink: 0 }}>
                <span style={{ fontSize: "1rem" }}>{shift.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{shift.label}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={tagStyle(shift.direction)}>{tagLabel(shift.direction)}</div>
              </div>
              <div style={{
                width: 44,
                textAlign: "right",
                fontSize: 11,
                fontWeight: 800,
                flexShrink: 0,
                color: shift.delta > 0 ? "#4ade80" : shift.delta < 0 ? "#f87171" : "rgba(255,255,255,0.3)",
              }}>
                {shift.delta > 0 ? "+" : ""}{shift.delta}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={{
        fontSize: 14,
        color: "rgba(255,255,255,0.47)",
        fontFamily: "'Outfit',sans-serif",
        maxWidth: 330,
        margin: "0 auto 26px",
        lineHeight: 1.65,
      }}>
        {getBlendDescription(mood1.id, mood2.id)}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "17px 32px",
            background: `linear-gradient(90deg, ${mood1.color}, ${mood2.color})`,
            border: "none",
            borderRadius: 50,
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            boxShadow: `0 0 45px ${mood1.color}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            letterSpacing: "0.01em",
          }}
        >
          Continue with Your Blend
          <ArrowRight size={19} />
        </motion.button>

        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          <RotateCcw size={14} />
          Try different moods
        </button>
      </div>
    </motion.div>
  );
}

"""

# ── Step 4: Reconstruct file ─────────────────────────────────────────────────
# content[:rc_comment_start] = everything before the // ─── RESULT CARD comment line
# NEW_SECTION = new algorithm + new ResultCard
# content[func_end:] = everything after the old ResultCard function
new_file = text[:rc_comment_start] + NEW_SECTION + text[func_end:]

# Write with LF line endings
with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_file)

# ── Step 5: Verify ────────────────────────────────────────────────────────────
with open(out_path, 'r', encoding='utf-8') as f:
    verify = f.read()

ok1 = 'getMoodShiftData' in verify
ok2 = 'MOOD SHIFT ALGORITHM' in verify
ok3 = 'How your moods shape your result' in verify
ok4 = 'Strong Boost' in verify
ok5 = 'function ResultCard' in verify
ok6 = 'getBlendDescription' in verify
ok7 = 'shifts.map' in verify

all_ok = all([ok1, ok2, ok3, ok4, ok5, ok6, ok7])

with codecs.open(r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\deploy-status.txt', 'w', 'utf-8') as rh:
    rh.write(f"Original text: {len(text)} chars\n")
    rh.write(f"New file: {len(new_file)} chars\n")
    rh.write(f"getMoodShiftData: {ok1}\n")
    rh.write(f"MOOD SHIFT ALGORITHM: {ok2}\n")
    rh.write(f"'How your moods shape': {ok3}\n")
    rh.write(f"Strong Boost: {ok4}\n")
    rh.write(f"function ResultCard: {ok5}\n")
    rh.write(f"getBlendDescription: {ok6}\n")
    rh.write(f"shifts.map: {ok7}\n")
    rh.write(f"ALL PASSED: {all_ok}\n")

print(f"\n{'SUCCESS - ALL CHECKS PASSED' if all_ok else 'SOME CHECKS FAILED'}")
if not all_ok:
    print("Failed checks:")
    for name, val in [('getMoodShiftData', ok1), ('MOOD SHIFT ALGORITHM', ok2),
                       ('How your moods shape', ok3), ('Strong Boost', ok4),
                       ('ResultCard', ok5), ('getBlendDescription', ok6), ('shifts.map', ok7)]:
        if not val:
            print(f"  {name}: FAIL")
