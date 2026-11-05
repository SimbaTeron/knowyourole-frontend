/**
 * Tag install must not emit a page_view. Each real navigation emits exactly one.
 * Query-only updates (results `replaceState`, result tab switches) are the same page.
 */

declare global {
  interface Window {
    __kyrSendPageView?: () => void;
  }
}

let lastPageViewKey: string | null = null;

export function installTagConfig(): { anonymize_ip: true; send_page_view: false } {
  return { anonymize_ip: true, send_page_view: false };
}

/** Pathname only. Query strings and hashes are not navigations. */
export function navigationPagePath(pageLocation: string): string {
  try {
    return new URL(pageLocation).pathname || "/";
  } catch {
    const path = pageLocation.split(/[?#]/, 1)[0] ?? pageLocation;
    return path || "/";
  }
}

/** True the first time this pathname is seen since the previous claim. Repeating it, including a query-only change, does not send again. Leaving and returning does. */
export function claimNavigationPageView(pageLocation: string): boolean {
  const key = navigationPagePath(pageLocation);
  if (lastPageViewKey === key) return false;
  lastPageViewKey = key;
  return true;
}

/** Funnel flushes call this first so a queued event never precedes that page's page_view. */
export function sendRegisteredPageView(browser: Window): void {
  browser.__kyrSendPageView?.();
}

export function resetNavigationPageViews(): void {
  lastPageViewKey = null;
}
