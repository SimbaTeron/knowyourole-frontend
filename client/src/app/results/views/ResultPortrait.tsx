import type { CSSProperties } from "react";
import type { ResultView } from "@/lib/results/resultViewModel";

function headlineScale(headline: string): CSSProperties {
  if (headline.length >= 22) return { fontSize: "clamp(34px, 10vw, 58px)", lineHeight: 0.92, letterSpacing: "-0.068em" };
  if (headline.length >= 17) return { fontSize: "clamp(38px, 11vw, 64px)", lineHeight: 0.9, letterSpacing: "-0.072em" };
  return { fontSize: "clamp(42px, 13vw, 74px)" };
}

/** Main result card copy. Every string comes from the view model. */
export function ResultPortrait({ view }: { view: ResultView }) {
  const lightLeans = new Set(view.lightLeanLetters);
  const words = view.headline.trim().split(/\s+/).filter(Boolean);
  return (
    <>
      <div className="glass-tile">
        <div className="type-chip" data-testid="mbti-type-chip">
          {view.emoji}{" "}
          <span className="mbti-letters">
            {view.mbtiType.split("").map((letter, index) => (
              <span key={index} className={lightLeans.has(letter) ? "mbti-letter light-lean" : "mbti-letter"} title={lightLeans.has(letter) ? "light lean" : undefined}>{letter}</span>
            ))}
          </span>
          {view.typeBadge ? <span className="type-badge" data-testid="mbti-confidence-badge">{view.typeBadge}</span> : null}{" "}
          <small>{view.chipSuffix}</small>
        </div>
        {view.clarity === "broad" ? (
          <h1 className="orb-h1" style={{ fontSize: "clamp(34px, 10vw, 58px)", lineHeight: 0.92, letterSpacing: "-0.068em" }} data-testid="broad-headline">
            <span>A broad,</span><span>balanced</span><span>pattern</span>
          </h1>
        ) : (
          <h1 className="orb-h1" style={headlineScale(view.headline)}>
            {words.length > 1 ? words.map((word) => <span key={word}>{word}</span>) : view.headline}
          </h1>
        )}
      </div>
      <div className="shareline"><b>Snapshot</b><p>“{view.whyLine}”</p></div>
      {view.direction.kind === "sample" ? (
        <div className="role-card" data-testid="broad-directions">
          <small>{view.direction.eyebrow}</small>
          <h2>{view.direction.title}</h2>
          <p>{view.direction.body}</p>
          <div className="direction-examples" data-testid="broad-alt-roles">
            <b>{view.direction.exploreLabel}</b>
            {view.direction.titles.map((title) => <span key={title}>• {title}</span>)}
          </div>
        </div>
      ) : (
        <div className="role-card">
          <small>{view.direction.eyebrow}</small>
          <h2>{view.direction.title}</h2>
          <p>{view.direction.rationale}</p>
          {view.direction.examples.length > 0 && (
            <div className="direction-examples">
              <b>{view.direction.examplesHeader}</b>
              {view.direction.examples.map((title) => <span key={title}>• {title}</span>)}
            </div>
          )}
          {view.direction.alsoExplore.length > 0 && (
            <div className="lane-preview" aria-label="Your additional work direction">
              {view.direction.alsoExplore.map((label) => <span key={label}>Also explore: {label}</span>)}
            </div>
          )}
        </div>
      )}
      {view.nextSteps.length > 0 && (
        <div className="role-card next-steps-card" data-testid="next-steps">
          <small>Next steps</small>
          <ul className="next-steps-list">{view.nextSteps.map((step) => <li key={step}>{step}</li>)}</ul>
        </div>
      )}
      <div className="mini-stats">
        <div className="stat"><small>Mind</small><strong>{view.mbtiType}</strong><span>{view.mindCaption}</span></div>
        <div className="stat"><small>Work style</small><strong>{view.discCode}</strong><span>{view.discLabel}</span></div>
        <div className="stat"><small>{view.lead.statLabel}</small><strong>{view.lead.statBand}</strong><span>{view.lead.caption}</span></div>
      </div>
      {view.typeNote && <p className="mbti-confidence-note" data-testid="mbti-confidence-note">{view.typeNote}</p>}
      <div className={`clarity-note clarity-${view.clarityNote.kind}`} role="note" data-testid="result-clarity">
        <b>{view.clarityNote.heading}</b>
        <p>{view.clarityNote.body}</p>
      </div>
      {view.stressSecondary && <p className="mbti-confidence-note" data-testid="stress-secondary-note">{view.stressSecondary.text}</p>}
    </>
  );
}
