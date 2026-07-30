'use client';

import type { ResultDTO } from "@/lib/results/buildResultDTO";

type ResultDecisionBriefProps = {
  result?: ResultDTO;
  fallback: {
    directionTitle: string;
    rationale: string;
    examples: Array<{ title: string; reasoning?: string }>;
    starterMove: string;
    watchOut: string;
  };
  onExploreRole: () => void;
};

type EvidenceState = {
  label: string;
  title: string;
  body: string;
  color: string;
};

function getEvidenceState(result?: ResultDTO): EvidenceState {
  if (!result) {
    return {
      label: "Exploratory read",
      title: "Use this as a starting hypothesis",
      body: "This preview does not include the canonical result record. Compare this direction against your energy, skills, and real-world feedback before treating it as a strong fit.",
      color: "#315f74",
    };
  }

  const confidence = result.audit.overallConfidence;
  const weakSignals = result.scores.adaptive.weakSignals;
  const hybridCount = result.audit.scoringAudit?.hybridDimensions.length ?? 0;
  if (confidence < 55 || weakSignals.length >= 3) {
    return {
      label: "Early signal",
      title: "The pattern is still broad",
      body: "Several signals were close or light. Treat the direction as a set of possibilities to sample, not a recommendation to commit to.",
      color: "#c95f46",
    };
  }
  if (weakSignals.length > 0 || hybridCount >= 2) {
    return {
      label: "Mixed evidence",
      title: "More than one work pattern is plausible",
      body: "Your answers support this direction, but close signals leave room for adjacent paths. Compare the examples through a small project, conversation, or shadowing opportunity.",
      color: "#9b650d",
    };
  }
  return {
    label: "Clearer signal",
    title: "A useful direction to test",
    body: "Your strongest current signals align around this work direction. It is still a compass, not a prediction or a fixed career prescription.",
    color: "#2f7b87",
  };
}

export function ResultDecisionBrief({ result, fallback, onExploreRole }: ResultDecisionBriefProps) {
  const direction = result?.careerDirection;
  const roles = direction?.examples.map((role) => ({ title: role.title, reasoning: role.reasoning })) ?? fallback.examples;
  const action = result?.growthPlan.recommendedActions[0];
  const evidence = getEvidenceState(result);
  const cautions = direction?.examples.flatMap((role) => role.cautions ?? []).filter(Boolean) ?? [];
  const watchOut = cautions[0] || fallback.watchOut;
  const starterMove = action ? `${action.title}: ${action.description}` : fallback.starterMove;

  return (
    <section aria-labelledby="decision-brief-title" style={shellStyle}>
      <div style={eyebrowStyle}>Your practical decision brief</div>
      <h2 id="decision-brief-title" style={titleStyle}>{direction?.title || fallback.directionTitle}</h2>
      <p style={introStyle}>A work direction is useful only if it gives you a next test—not a new label to live inside.</p>

      <div style={{ ...evidenceStyle, borderColor: `${evidence.color}55` }}>
        <div style={{ ...smallLabelStyle, color: evidence.color }}>{evidence.label}</div>
        <strong style={cardTitleStyle}>{evidence.title}</strong>
        <p style={bodyStyle}>{evidence.body}</p>
      </div>

      <div style={gridStyle}>
        <article style={cardStyle}>
          <div style={smallLabelStyle}>Why it surfaced</div>
          <p style={bodyStyle}>{direction?.rationale || fallback.rationale}</p>
        </article>
        <article style={cardStyle}>
          <div style={smallLabelStyle}>Try this week</div>
          <p style={bodyStyle}>{starterMove}</p>
        </article>
      </div>

      <article style={cardStyle}>
        <div style={smallLabelStyle}>Adjacent examples to compare</div>
        <div style={roleListStyle}>
          {roles.slice(0, 3).map((role) => <span key={role.title} style={rolePillStyle}>{role.title}</span>)}
        </div>
        <p style={{ ...bodyStyle, marginTop: 10 }}>Compare the day-to-day work, entry route, and conditions—not just the title.</p>
      </article>

      <article style={{ ...cardStyle, borderColor: "rgba(201,95,70,.32)", background: "#fff3ed" }}>
        <div style={{ ...smallLabelStyle, color: "#a94635" }}>Career-context caveat</div>
        <p style={bodyStyle}>{watchOut}</p>
      </article>

      <button type="button" onClick={onExploreRole} style={buttonStyle}>Explore role fit and examples <span aria-hidden="true">→</span></button>
    </section>
  );
}

const shellStyle = { marginTop: 14, border: "1px solid rgba(18,38,58,.20)", borderRadius: 4, padding: 16, background: "#fffdf8", boxShadow: "5px 5px 0 rgba(18,38,58,.10)" } as const;
const eyebrowStyle = { color: "#315f74", fontSize: 10, fontWeight: 950, letterSpacing: ".15em", textTransform: "uppercase" } as const;
const titleStyle = { margin: "7px 0 6px", color: "#12263a", fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(25px, 7vw, 34px)", lineHeight: 1.02, letterSpacing: "-.045em" } as const;
const introStyle = { margin: 0, color: "#456174", fontSize: 12.5, lineHeight: 1.48 } as const;
const evidenceStyle = { marginTop: 14, border: "1px solid", borderRadius: 3, padding: 12, background: "#eaf5f6" } as const;
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9, marginTop: 9 } as const;
const cardStyle = { marginTop: 9, border: "1px solid rgba(18,38,58,.16)", borderRadius: 3, padding: 12, background: "#fffdf8" } as const;
const smallLabelStyle = { color: "#315f74", fontSize: 9, fontWeight: 950, letterSpacing: ".11em", textTransform: "uppercase", marginBottom: 5 } as const;
const cardTitleStyle = { display: "block", color: "#12263a", fontSize: 14, lineHeight: 1.25 } as const;
const bodyStyle = { margin: 0, color: "#405f72", fontSize: 12, lineHeight: 1.48 } as const;
const roleListStyle = { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 } as const;
const rolePillStyle = { border: "1px solid rgba(18,38,58,.18)", borderRadius: 999, padding: "6px 8px", color: "#12263a", background: "#fff0c8", fontSize: 11, fontWeight: 850, lineHeight: 1.2 } as const;
const buttonStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", marginTop: 12, border: "1px solid #12263a", borderRadius: 3, padding: "12px 13px", color: "#fffdf8", background: "#12263a", cursor: "pointer", fontSize: 12, fontWeight: 950, textAlign: "left" as const } as const;
