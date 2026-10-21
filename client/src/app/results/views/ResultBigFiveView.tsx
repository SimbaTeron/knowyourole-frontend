import type { CSSProperties } from "react";
import { FrameworkReference } from "@/components/results/FrameworkReference";
import type { ResultView } from "@/lib/results/resultViewModel";

type BigFiveScores = { O: number; C: number; E: number; A: number; N: number };

/** Big Five tab. The lead sentence, stress line and clarity line come from the same view as the main card. */
export function ResultBigFiveView({
  view,
  bigFive,
  onBack,
  onOpenFramework,
}: {
  view: ResultView;
  bigFive: BigFiveScores;
  onBack: () => void;
  onOpenFramework: () => void;
}) {
  return (
    <section>
      <div className="detail-head">
        <button className="back back-to-results" data-testid="back-to-results-top" onClick={onBack}>← Back to my results</button>
        <div><h2>Big Five</h2><p>Your trait climate: what reliably pulls, drains, stabilizes, or amplifies you.</p></div>
      </div>
      <div className="detail-card">
        <h3>Trait gravity</h3>
        <div className="meter-list">
          {view.traitMeters.map((trait) => (
            <div key={trait.key}>
              <div className="meter-top"><span>{trait.label}</span><span>{trait.band}</span></div>
              <div className="bar"><div className="fill" style={{ "--v": `${trait.score}%` } as CSSProperties} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="detail-card">
        <h3>What it means</h3>
        <p>{view.bigFiveLead}</p>
        {view.stressSupport && <p className="clarity-inline" data-testid="stress-support-note">{view.stressSupport.text}</p>}
        <p className="clarity-inline" data-testid="result-clarity-inline"><b>{view.clarityNote.heading}{view.clarityNote.kind === "flat" ? "" : "."}</b> {view.clarityNote.body}</p>
        <div className="analogy"><b>Analogy</b>Big Five is your climate report. MBTI is route preference; DISC is driving behavior; Big Five is the weather system you operate inside.</div>
      </div>
      <div className="detail-card">
        <FrameworkReference kind="bigFive" bigFive={bigFive} onOpen={onOpenFramework} />
      </div>
    </section>
  );
}
