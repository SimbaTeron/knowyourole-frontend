import codecs, re

f = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
out = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\replace-resultcard-out.txt"

with codecs.open(f, 'r', encoding='utf-8') as fh:
    content = fh.read()

# Find "function ResultCard" - match until the ) { that opens the function body
func_match = re.search(r'function ResultCard\([^{]*\)\s*\{', content)
if not func_match:
    with codecs.open(out, 'w', encoding='utf-8') as rh:
        rh.write("Function not found\n")
    exit(1)

func_start = func_match.end()  # points to the opening { of function BODY
# brace_count starts at 1 (we're inside the function body)
brace_count = 1
in_string = False
string_char = None
i = func_start

while i < len(content) and brace_count > 0:
    c = content[i]
    if not in_string:
        if c in '"\'':
            in_string = True
            string_char = c
        elif c == '{':
            brace_count += 1
        elif c == '}':
            brace_count -= 1
    else:
        if c == string_char and content[i-1] != '\\':
            in_string = False
    i += 1

func_end = i  # exclusive end

with codecs.open(out, 'w', encoding='utf-8') as rh:
    rh.write(f"func_start: {func_start}, func_end: {func_end}, diff: {func_end - func_start}\n")

NEW_RC = '''function ResultCard({ mood1, mood2, onContinue, onReset }: {
  mood1: typeof MOODS[0];
  mood2: typeof MOODS[0];
  onContinue: () => void;
  onReset: () => void;
}) {
  const blendName = getBlendName(mood1.id, mood2.id);
  const shifts = getMoodShiftData(mood1.id, mood2.id);

  const tagStyle = (dir: TraitShift["direction"]): React.CSSProperties => {
    if (dir === "boost") return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" as const, flex: "0 0 auto" as const, background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)" };
    if (dir === "nudge") return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" as const, flex: "0 0 auto" as const, background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" };
    return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" as const, flex: "0 0 auto" as const, background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" };
  };

  const tagLabel = (dir: TraitShift["direction"]) => {
    if (dir === "boost") return "↗ Strong Boost";
    if (dir === "nudge") return "↗ Light Nudge";
    return "↙ Dampens";
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
        <span style={{ color: "rgba(255,255,255,0.26)", fontSize: 14 }}>✦</span>
        <span style={{
          background: `${mood2.color}16`,
          border: `1px solid ${mood2.color}42`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood2.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood2.label}</span>
      </div>

      {/* Mood Shift Data */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginBottom: 16 }}>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase" as const,
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
'''

result = content[:func_start] + NEW_RC + content[func_end:]

with codecs.open(f, 'w', encoding='utf-8') as fh:
    fh.write(result)

with codecs.open(out, 'w', encoding='utf-8') as rh:
    rh.write(f"Done! Replaced {func_end - func_start} chars with {len(NEW_RC)} chars\n")
    rh.write(f"New file length: {len(result)}\n")
    # Check function is still valid
    import re
    m = re.search(r'function ResultCard', result)
    rh.write(f"ResultCard still present: {m is not None}\n")
    m2 = re.search(r'getMoodShiftData', result)
    rh.write(f"getMoodShiftData reference: {m2 is not None}\n")
