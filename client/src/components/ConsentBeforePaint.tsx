/** Same storage key as CookieConsentBanner. Kept here so the head script does not import the client banner. */
const COOKIE_CONSENT_KEY = "kyr_cookie_consent";

/** One row at 392px and up. Below that the line and the buttons wrap. */
export const CONSENT_BAR_HEIGHT_PX = 61;
export const CONSENT_BAR_WRAPPED_HEIGHT_PX = 88;
export const CONSENT_BAR_WRAP_MAX_PX = 391;

/**
 * Runs in the document head, before first paint. The quiz screen shrinks to
 * leave room for the bar only after `data-kyr-consent` is set; doing that
 * from React was after first paint and shifted the welcome card.
 * A stored choice leaves the attribute unset, so the bar stays hidden.
 */
export function consentBeforePaintScript(): string {
  return `(function(){try{if(localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_KEY)}))return;var narrow=window.matchMedia("(max-width: ${CONSENT_BAR_WRAP_MAX_PX}px)").matches;var px=narrow?${CONSENT_BAR_WRAPPED_HEIGHT_PX}:${CONSENT_BAR_HEIGHT_PX};var root=document.documentElement;root.setAttribute("data-kyr-consent","open");root.style.setProperty("--kyr-consent-bar","calc("+px+"px + env(safe-area-inset-bottom, 0px))");}catch(e){}})();`;
}

export function ConsentBeforePaint() {
  return <script dangerouslySetInnerHTML={{ __html: consentBeforePaintScript() }} />;
}
