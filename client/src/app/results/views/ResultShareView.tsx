import type { ResultView } from "@/lib/results/resultViewModel";

/** Share preview. Headline, direction and trait line are the view model's, same as the main card. */
export function ResultShareView({
  view,
  onBack,
  onShare,
}: {
  view: ResultView;
  onBack: () => void;
  onShare: (source?: string) => void;
}) {
  return (
    <section>
      <div className="detail-head">
        <button className="back back-to-results" data-testid="back-to-results-top" onClick={onBack}>← Back to my results</button>
        <div><h2>Share</h2><p>Export a polished result card as an image or PDF, then send by text or email.</p></div>
      </div>
      <div className="detail-card">
        <div className="share-preview">
          <div className="eyebrow">Instant Portrait</div>
          <h2>{view.headline}</h2>
          <p>“{view.whyLine}”</p>
          <div className="role-card">
            <small>{view.shareEyebrow}</small>
            <h2>{view.shareTitle}</h2>
            <p>{view.shareMeta}</p>
          </div>
          <p className="share-disclaimer" data-testid="share-disclaimer" style={{ margin: "12px 0 0", fontSize: 12, lineHeight: 1.4, color: "#29495c" }}>A reflection starting point, not a diagnosis or prediction.</p>
        </div>
      </div>
      <div className="detail-card">
        <h3>Share options</h3>
        <p data-testid="share-contents-note">This card shows your result type and direction only. It does not include your answers or any personal information. It ends with a link to <b>knowyourole.com</b>.</p>
        <div className="share-actions">
          <button className="share-btn primary" onClick={() => onShare("image_action")}>Image</button>
          <button className="share-btn primary" onClick={() => onShare("pdf_action")}>PDF</button>
          <button className="share-btn" onClick={() => onShare("text_action")}>Text</button>
          <button className="share-btn" onClick={() => onShare("email_action")}>Email</button>
        </div>
      </div>
    </section>
  );
}
