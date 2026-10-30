"use client";

import { useId, useState, type ReactNode } from "react";
import { FrameworkReference, type FrameworkMbtiAxis } from "@/components/results/FrameworkReference";
import { ResultDecisionBrief } from "@/components/results/ResultDecisionBrief";
import {
  RESULT_DISCLOSURE_LABELS,
  RESULT_SECTION_HEADINGS,
  leanBand,
  type ResultView,
} from "@/lib/results/resultViewModel";
import type { ResultDTO } from "@/lib/results/buildResultDTO";

type DiscScores = { D: number; I: number; S: number; C: number };
type BigFiveScores = { O: number; C: number; E: number; A: number; N: number };

export type SummaryMbtiAxis = {
  label: string;
  leftLetter: string;
  rightLetter: string;
  dominant: string;
  words: Record<string, string>;
  pct: number;
  light: boolean;
};

type ResultSummaryProps = {
  view: ResultView;
  notice: ReactNode;
  bigFive: BigFiveScores;
  disc: DiscScores;
  primaryDisc: string;
  discRows: ReadonlyArray<{ key: string; label: string; band: string }>;
  mbtiAxes: readonly SummaryMbtiAxis[];
  discDesc?: string;
  decisionBrief: {
    result?: ResultDTO;
    directionTitle: string;
    rationale: string;
    examples: Array<{ title: string; reasoning?: string }>;
    starterMove: string;
    watchOut: string;
    onExploreRole: () => void;
  };
  onOpenFramework: (framework: "mbti" | "disc" | "big_five") => void;
};

const MBTI_SIDE: Record<string, string> = {
  E: "Processes through interaction and external engagement.",
  I: "Processes internally and restores energy through reflection.",
  S: "Notices concrete facts and proven methods.",
  N: "Notices patterns, possibilities, and what could change.",
  T: "Prioritizes analysis, consistency, and trade-offs.",
  F: "Prioritizes values, people impact, and alignment.",
  J: "Prefers structure, closure, and planned progress.",
  P: "Prefers flexibility and adapting as new information appears.",
};

function Disclosure({
  id,
  title,
  testId,
  children,
}: {
  id: string;
  title: string;
  testId: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const reactId = useId();
  const buttonId = `${reactId}-${id}-button`;
  const panelId = `${reactId}-${id}-panel`;
  return (
    <section className="result-disclosure">
      <h2 className="result-disclosure-heading">
        <button
          type="button"
          id={buttonId}
          className="result-disclosure-button"
          data-testid={testId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span>{title}</span>
          <span aria-hidden="true">{open ? "–" : "+"}</span>
        </button>
      </h2>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}>
        {open ? <div className="result-disclosure-panel">{children}</div> : null}
      </div>
    </section>
  );
}

function frameworkAxes(axes: readonly SummaryMbtiAxis[]): FrameworkMbtiAxis[] {
  return axes.map((axis) => ({
    label: axis.label,
    leftLetter: axis.leftLetter,
    rightLetter: axis.rightLetter,
    leftWord: axis.words[axis.leftLetter] ?? axis.leftLetter,
    rightWord: axis.words[axis.rightLetter] ?? axis.rightLetter,
    leftDescription: MBTI_SIDE[axis.leftLetter] ?? "",
    rightDescription: MBTI_SIDE[axis.rightLetter] ?? "",
    dominant: axis.dominant,
    leftPct: axis.dominant === axis.leftLetter ? axis.pct : 100 - axis.pct,
    rightPct: axis.dominant === axis.rightLetter ? axis.pct : 100 - axis.pct,
    isClose: axis.pct < 60 || axis.light,
  }));
}

/** Simplified results body. Every open-section string comes from the view model. */
export function ResultSummary({
  view,
  notice,
  bigFive,
  disc,
  primaryDisc,
  discRows,
  mbtiAxes,
  discDesc,
  decisionBrief,
  onOpenFramework,
}: ResultSummaryProps) {
  const lightLeans = new Set(view.lightLeanLetters);
  const extraRoles = view.direction.kind === "sample" ? view.direction.titles : view.direction.examples;
  const also = view.direction.kind === "focused" ? view.direction.alsoExplore : [];
  return (
    <div className="result-simple">
      <header className="result-hero">
        <p className="result-kicker">Your result</p>
        <h1 data-testid="result-name">{view.emoji} {view.headline}</h1>
        <p className="result-summary" data-testid="result-summary">{view.page.summary}</p>
        {notice}
      </header>

      <section className="result-section" data-testid="section-work" aria-labelledby="how-you-work">
        <h2 id="how-you-work">{RESULT_SECTION_HEADINGS.work}</h2>
        <p>{view.page.workBest}</p>
      </section>

      <section className="result-section" data-testid="section-careers" aria-labelledby="good-fit-careers">
        <h2 id="good-fit-careers">{RESULT_SECTION_HEADINGS.careers}</h2>
        <div className="result-fields">
          {view.page.careers.map((field) => (
            <article key={field.name} className="result-field">
              <h3>{field.name}</h3>
              <p>{field.reason}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="result-section" data-testid="section-week" aria-labelledby="try-this-week">
        <h2 id="try-this-week">{RESULT_SECTION_HEADINGS.week}</h2>
        <ul className="result-steps">
          {view.page.thisWeek.map((step) => <li key={step}>{step}</li>)}
        </ul>
      </section>

      {view.page.watch ? (
        <section className="result-section" data-testid="section-watch" aria-labelledby="one-thing-to-watch">
          <h2 id="one-thing-to-watch">{RESULT_SECTION_HEADINGS.watch}</h2>
          <p>{view.page.watch}</p>
        </section>
      ) : null}

      <div className="result-disclosures">
        <Disclosure id="labels" testId="disclosure-style" title={RESULT_DISCLOSURE_LABELS.labels}>
          <p className="result-detail-type" data-testid="style-label-type">
            <span className="mbti-letters">
              {view.mbtiType.split("").map((letter, index) => (
                <span key={`${letter}-${index}`} className={lightLeans.has(letter) ? "mbti-letter light-lean" : "mbti-letter"}>{letter}</span>
              ))}
            </span>
            {view.typeBadge ? <span className="type-badge">{view.typeBadge}</span> : null}
            <span>{view.chipSuffix}</span>
          </p>
          <div className="mini-stats">
            <div className="stat"><small>Mind</small><strong>{view.mbtiType}</strong><span>{view.mindCaption}</span></div>
            <div className="stat"><small>Work style</small><strong>{view.discCode}</strong><span>{view.discLabel}</span></div>
            <div className="stat"><small>{view.lead.statLabel}</small><strong>{view.lead.statBand}</strong><span>{view.lead.caption}</span></div>
          </div>
        </Disclosure>

        <Disclosure id="scores" testId="disclosure-scores" title={RESULT_DISCLOSURE_LABELS.scores}>
          <div className="meter-list">
            {view.traitMeters.map((trait) => (
              <div key={trait.key}>
                <div className="meter-top"><span>{trait.label}</span><span>{trait.band}</span></div>
                <div className="bar"><div className="fill" style={{ ["--v" as string]: `${trait.score}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="meter-list" style={{ marginTop: 16 }}>
            {mbtiAxes.map((axis) => (
              <div key={axis.label}>
                <div className="meter-top">
                  <span>{axis.label} · {axis.words[axis.dominant] ?? axis.dominant}</span>
                  <span>{axis.light ? "Light lean" : leanBand(axis.pct)}</span>
                </div>
                <div className="bar"><div className="fill" style={{ ["--v" as string]: `${axis.pct}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="disc-grid">
            {discRows.map((row) => (
              <div className={`quad ${primaryDisc === row.key ? "active" : ""}`} key={row.key}>
                <b>{row.key}</b>
                <span>{row.label} · {row.band}</span>
              </div>
            ))}
          </div>
        </Disclosure>

        {extraRoles.length > 0 || also.length > 0 ? (
          <Disclosure id="roles" testId="disclosure-roles" title={RESULT_DISCLOSURE_LABELS.roles}>
            <ul className="result-steps">
              {extraRoles.map((title) => <li key={title}>{title}</li>)}
            </ul>
            {also.length > 0 ? <p className="result-also">Also explore: {also.join(", ")}</p> : null}
          </Disclosure>
        ) : null}

        <Disclosure id="method" testId="disclosure-method" title={RESULT_DISCLOSURE_LABELS.method}>
          <p><b>{view.clarityNote.heading}{view.clarityNote.kind === "flat" ? "" : "."}</b> {view.clarityNote.body}</p>
          {view.typeNote ? <p>{view.typeNote}</p> : null}
          {view.stressSecondary ? <p>{view.stressSecondary.text}</p> : null}
          {view.stressSupport ? <p>{view.stressSupport.text}</p> : null}
          {discDesc ? <p>{discDesc}</p> : null}
          <p>{view.bigFiveLead}</p>
          <ResultDecisionBrief
            result={decisionBrief.result}
            clarityLevel={view.clarity}
            hideRepeats
            fallback={{
              directionTitle: decisionBrief.directionTitle,
              rationale: decisionBrief.rationale,
              examples: decisionBrief.examples,
              starterMove: decisionBrief.starterMove,
              watchOut: decisionBrief.watchOut,
            }}
            onExploreRole={decisionBrief.onExploreRole}
          />
          <FrameworkReference
            kind="mbti"
            mbtiAxes={frameworkAxes(mbtiAxes)}
            onOpen={() => onOpenFramework("mbti")}
          />
          <FrameworkReference
            kind="disc"
            primaryDisc={primaryDisc}
            disc={disc}
            onOpen={() => onOpenFramework("disc")}
          />
          <FrameworkReference
            kind="bigFive"
            bigFive={bigFive}
            onOpen={() => onOpenFramework("big_five")}
          />
        </Disclosure>
      </div>
      <style>{RESULT_SIMPLE_CSS}</style>
    </div>
  );
}

const RESULT_SIMPLE_CSS = `
.result-simple { display: grid; gap: 14px; color: #12263a; }
.result-hero { padding: 4px 2px 2px; }
.result-kicker { margin: 0 0 6px; color: #315f74; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.result-simple h1 { margin: 0; font-family: Fraunces, Georgia, serif; font-size: clamp(34px, 9vw, 58px); line-height: .96; letter-spacing: -.045em; overflow-wrap: break-word; text-wrap: balance; }
.result-summary { margin: 10px 0 0; font-size: clamp(17px, 4.4vw, 20px); line-height: 1.45; font-weight: 650; text-wrap: pretty; }
.result-simple .result-disclaimer { margin: 12px 0 0; text-align: left; }
.result-section, .result-disclosure { border: 1px solid rgba(18,38,58,.16); border-radius: 4px; background: #fffdf8; box-shadow: 4px 4px 0 rgba(18,38,58,.08); }
.result-section { padding: 16px; }
.result-section h2, .result-field h3 { margin: 0 0 8px; font-family: Fraunces, Georgia, serif; letter-spacing: -.03em; line-height: 1.15; }
.result-section h2 { font-size: clamp(22px, 5vw, 28px); }
.result-section p, .result-field p, .result-disclosure-panel p { margin: 0; color: #29495c; font-size: 16px; line-height: 1.45; font-weight: 600; }
.result-fields { display: grid; gap: 10px; }
.result-field { padding: 12px; border-radius: 4px; background: #fff7e4; border: 1px solid rgba(18,38,58,.12); }
.result-field h3 { font-size: clamp(18px, 4.5vw, 22px); }
.result-steps { margin: 0; padding-left: 1.2em; display: grid; gap: 8px; color: #12263a; font-size: 16px; line-height: 1.4; font-weight: 650; }
.result-disclosures { display: grid; gap: 10px; }
.result-disclosure-heading { margin: 0; font-size: 17px; font-weight: 700; line-height: 1.3; }
.result-disclosure-button { display: flex; width: 100%; min-height: 48px; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border: 0; background: transparent; color: #12263a; text-align: left; cursor: pointer; font: 700 17px/1.3 Manrope, Inter, system-ui, sans-serif; }
.result-disclosure-button span:last-child { flex: 0 0 auto; }
.result-disclosure-button:focus-visible { outline: 3px solid #12263a; outline-offset: 2px; }
.result-disclosure-panel { padding: 0 14px 14px; display: grid; gap: 12px; }
.result-detail-type { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.result-also { margin-top: 8px; }
@media (min-width: 760px) {
  .result-fields { grid-template-columns: 1fr 1fr; }
}
`;
