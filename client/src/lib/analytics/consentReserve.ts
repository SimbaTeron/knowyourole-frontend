/**
 * Runs before hydration on a direct /quiz visit so the answer area is already
 * shortened when the consent banner appears. Other routes are left alone.
 * Kept out of the client banner module so the root layout can inline it.
 */
export const COOKIE_CONSENT_STORAGE_KEY = "kyr_cookie_consent";

export function quizConsentReserveScript(storageKey = COOKIE_CONSENT_STORAGE_KEY): string {
  const key = JSON.stringify(storageKey);
  return `(function(){try{var p=location.pathname||"";var quiz=p==="/quiz"||p.indexOf("/quiz/")===0;if(quiz&&!localStorage.getItem(${key})){document.documentElement.setAttribute("data-kyr-consent","pending");}}catch(e){}})();`;
}

/** Inlined in the document so the quiz strip exists on first paint, not after the deferred stylesheet. */
export const QUIZ_CONSENT_RESERVE_CSS = `
html[data-kyr-consent="pending"] {
  --kyr-consent-reserve: calc(17rem + env(safe-area-inset-bottom, 0px));
}
@media (min-width: 768px) {
  html[data-kyr-consent="pending"] {
    --kyr-consent-reserve: calc(12.5rem + env(safe-area-inset-bottom, 0px));
  }
}
html[data-kyr-consent="pending"] [data-kyr-quiz-root] {
  height: calc(100dvh - var(--kyr-consent-reserve));
  max-height: calc(100dvh - var(--kyr-consent-reserve));
  min-height: 0;
  overflow: auto;
}
html[data-kyr-consent="pending"] body::after {
  content: "";
  position: fixed;
  z-index: 8500;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--kyr-consent-reserve);
  background: #fffdf8;
  pointer-events: none;
}
.kyr-cookie-quiz-dock {
  height: var(--kyr-consent-reserve, calc(17rem + env(safe-area-inset-bottom, 0px)));
  background: #fffdf8;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
`;
