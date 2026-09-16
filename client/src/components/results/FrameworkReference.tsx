'use client';

import { useEffect, useState, type CSSProperties } from "react";

export type FrameworkDiscProfile = { D: number; I: number; S: number; C: number };
export type FrameworkBigFiveProfile = { O: number; C: number; E: number; A: number; N: number };

export type FrameworkMbtiAxis = {
  label: string;
  leftLetter: string;
  rightLetter: string;
  leftWord: string;
  rightWord: string;
  leftDescription: string;
  rightDescription: string;
  dominant: string;
  leftPct: number;
  rightPct: number;
  isClose: boolean;
};

type FrameworkReferenceProps = {
  kind: "mbti" | "disc" | "bigFive";
  primaryDisc?: string;
  disc?: FrameworkDiscProfile;
  bigFive?: FrameworkBigFiveProfile;
  mbtiAxes?: FrameworkMbtiAxis[];
  onOpen?: () => void;
};

const T = {
  ink: "#12263a",
  muted: "#456174",
  dim: "#637b8a",
  teal: "#315f74",
  tealSoft: "rgba(49, 95, 116, 0.08)",
  coral: "#c95f46",
  gold: "#9b650d",
  paper: "rgba(255, 253, 248, 0.72)",
  line: "rgba(18, 38, 58, 0.16)",
  lineStrong: "rgba(18, 38, 58, 0.26)",
} as const;

const discColors: Record<string, string> = { D: "#c95f46", I: "#b7791f", S: "#3b7f62", C: "#315f74" };

const shell: CSSProperties = { marginTop: 14, borderRadius: 14, background: T.paper, border: `1px solid ${T.line}` };
const summary: CSSProperties = { listStyle: "none", cursor: "pointer", padding: "12px 13px", display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", WebkitTapHighlightColor: "transparent" };
const row: CSSProperties = { padding: "10px 11px", borderRadius: 11, background: "rgba(255,255,255,0.62)", border: `1px solid ${T.line}` };
const frameworkHintKey = "kyr_framework_hint_seen_v1";

export function FrameworkReference({ kind, primaryDisc, disc, bigFive, mbtiAxes, onOpen }: FrameworkReferenceProps) {
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(frameworkHintKey)) return;
    } catch {
      return;
    }

    const begin = window.setTimeout(() => {
      try { window.localStorage.setItem(frameworkHintKey, "1"); } catch { /* optional UI preference only */ }
      setShowNudge(true);
    }, 1200);
    const end = window.setTimeout(() => setShowNudge(false), 6400);
    const stop = () => setShowNudge(false);
    window.addEventListener("scroll", stop, { once: true, passive: true });
    window.addEventListener("pointerdown", stop, { once: true, passive: true });
    window.addEventListener("keydown", stop, { once: true });
    return () => {
      window.clearTimeout(begin);
      window.clearTimeout(end);
      window.removeEventListener("scroll", stop);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
    };
  }, []);

  const title = kind === "mbti" ? "How MBTI-style preferences work" : kind === "disc" ? "How DISC work styles work" : "How the Big Five traits work";
  const intro = kind === "mbti"
    ? "These are four preference pairs, not four boxes. A close split means both sides may feel familiar."
    : kind === "disc"
      ? "DISC describes visible work and communication tendencies. Everyone uses all four styles; this result shows your relative pattern."
      : "Big Five traits are continuums, not grades. A lower or higher score is a tendency to reflect on, not a good-or-bad verdict.";
  const discReference = [
    { key: "D", label: "Dominance", description: "Direct, decisive, and pace-oriented.", contribution: "Drives action and hard calls.", watch: "Can move before others are aligned." },
    { key: "I", label: "Influence", description: "Expressive, persuasive, and relationship-oriented.", contribution: "Builds energy and connection.", watch: "Can lean too hard on enthusiasm." },
    { key: "S", label: "Steadiness", description: "Patient, reliable, and supportive.", contribution: "Creates consistency and trust.", watch: "Can defer needed change or conflict." },
    { key: "C", label: "Conscientiousness", description: "Careful, analytical, and quality-oriented.", contribution: "Improves accuracy and standards.", watch: "Can over-analyze before acting." },
  ] as const;
  const bigFiveReference: Array<{ key: keyof FrameworkBigFiveProfile; label: string; low: string; high: string }> = [
    { key: "O", label: "Openness", low: "More practical, familiar, and proven-method oriented", high: "More curious, exploratory, and idea-oriented" },
    { key: "C", label: "Follow-through", low: "More flexible, spontaneous, and adaptable with plans", high: "More organized, deliberate, and structured" },
    { key: "E", label: "Extraversion", low: "More reserved, reflective, and lower-stimulation oriented", high: "More outwardly energized, assertive, and socially engaged" },
    { key: "A", label: "Agreeableness", low: "More candid, skeptical, and independent-minded", high: "More cooperative, trusting, and harmony-oriented" },
    { key: "N", label: "Stress Reactivity", low: "Usually steadier under pressure and less easily rattled", high: "More sensitive to stress and emotional intensity" },
  ];

  return (
    <>
      <style>{`
        @keyframes kyr-framework-nudge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(49, 95, 116, 0); border-color: rgba(18, 38, 58, 0.16); }
          48% { box-shadow: 0 0 0 5px rgba(49, 95, 116, 0.14); border-color: rgba(49, 95, 116, 0.46); }
        }
        .kyr-framework-reference--nudge { animation: kyr-framework-nudge 1.65s ease-in-out 3; }
        @media (prefers-reduced-motion: reduce) { .kyr-framework-reference--nudge { animation: none; border-color: rgba(49, 95, 116, 0.46) !important; } }
      `}</style>
      <details className={showNudge ? "kyr-framework-reference--nudge" : undefined} style={shell} onToggle={(event) => { if (event.currentTarget.open) { setShowNudge(false); onOpen?.(); } }}>
      <summary style={summary}>
        <span>
          <span style={{ display: "block", fontSize: 12, fontWeight: 900, color: T.ink, marginBottom: 3 }}>Understand the framework</span>
          <span style={{ display: "block", fontSize: 10.5, lineHeight: 1.4, color: T.muted }}>See how your result was interpreted.</span>
        </span>
        <span aria-hidden="true" style={{ color: T.teal, fontSize: 17, fontWeight: 900 }}>⌄</span>
      </summary>
      <div style={{ padding: "0 12px 12px", display: "grid", gap: 9 }}>
        <div style={{ padding: "10px 11px", borderRadius: 11, background: T.tealSoft, border: "1px solid rgba(49, 95, 116, 0.16)", fontSize: 10.8, lineHeight: 1.5, color: T.muted }}>
          <strong style={{ display: "block", color: T.ink, fontSize: 10.5, marginBottom: 3 }}>{title}</strong>
          {intro}
        </div>

        {kind === "mbti" && mbtiAxes?.map(axis => (
          <div key={axis.label} style={row}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 9, marginBottom: 8 }}>
              <strong style={{ fontSize: 11.5, color: T.ink }}>{axis.label}</strong>
              <span style={{ fontSize: 9.5, fontWeight: 900, color: axis.isClose ? T.gold : T.teal }}>{axis.isClose ? "Close balance — read both" : `${axis.dominant} leaning`}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[
                { letter: axis.leftLetter, word: axis.leftWord, description: axis.leftDescription, value: axis.leftPct },
                { letter: axis.rightLetter, word: axis.rightWord, description: axis.rightDescription, value: axis.rightPct },
              ].map(side => {
                const active = side.letter === axis.dominant;
                return <div key={side.letter} style={{ padding: "8px 8px 9px", borderRadius: 10, background: active ? T.tealSoft : "rgba(255,255,255,0.45)", border: `1px solid ${active ? "rgba(49, 95, 116, 0.28)" : T.line}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 5, alignItems: "baseline", marginBottom: 4 }}><strong style={{ fontSize: 10.5, color: active ? T.teal : T.ink }}>{side.letter} · {side.word}</strong><span style={{ fontSize: 9.5, color: active ? T.teal : T.dim }}>{side.value}%</span></div>
                  <div style={{ fontSize: 9.8, lineHeight: 1.42, color: T.muted }}>{side.description}</div>
                </div>;
              })}
            </div>
          </div>
        ))}

        {kind === "disc" && discReference.map(style => {
          const value = disc?.[style.key] ?? 0;
          const total = Math.max(1, (disc?.D ?? 0) + (disc?.I ?? 0) + (disc?.S ?? 0) + (disc?.C ?? 0));
          const share = Math.round((value / total) * 100);
          const active = style.key === primaryDisc;
          const color = discColors[style.key];
          return <div key={style.key} style={{ ...row, borderColor: active ? `${color}88` : T.lineStrong }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 9, alignItems: "baseline", marginBottom: 4 }}><strong style={{ fontSize: 11.5, color: active ? color : T.ink }}>{style.key} · {style.label}</strong><span style={{ fontSize: 10, fontWeight: 900, color: active ? color : T.dim }}>{share}%</span></div>
            <div style={{ fontSize: 10.5, lineHeight: 1.45, color: T.muted }}>{style.description}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8, fontSize: 9.6, lineHeight: 1.38 }}><span style={{ color: T.dim }}><strong style={{ color: T.ink }}>Adds:</strong> {style.contribution}</span><span style={{ color: T.dim }}><strong style={{ color: T.ink }}>Watch:</strong> {style.watch}</span></div>
          </div>;
        })}

        {kind === "bigFive" && bigFiveReference.map(trait => {
          const score = bigFive?.[trait.key] ?? 50;
          return <div key={trait.key} style={row}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 9, alignItems: "baseline", marginBottom: 7 }}><strong style={{ fontSize: 11.5, color: T.ink }}>{trait.label}</strong><span style={{ fontSize: 10, fontWeight: 900, color: T.teal }}>{score}%</span></div>
            <div style={{ height: 6, borderRadius: 999, background: "linear-gradient(90deg, rgba(201,95,70,0.36), rgba(49,95,116,0.58))", position: "relative", margin: "0 3px 8px" }}><span aria-hidden="true" style={{ position: "absolute", left: `calc(${score}% - 6px)`, top: -3, width: 12, height: 12, borderRadius: 999, background: "#fffdf8", border: `2px solid ${T.teal}`, boxShadow: "0 2px 8px rgba(18,38,58,0.22)" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 9.8, lineHeight: 1.4, color: T.muted }}><span><strong style={{ color: T.dim }}>Lower:</strong> {trait.low}</span><span><strong style={{ color: T.dim }}>Higher:</strong> {trait.high}</span></div>
          </div>;
        })}
      </div>
      </details>
    </>
  );
}
