/**
 * Tag install must not emit a page_view. Each navigation emits exactly one,
 * including the first load and later client-side route changes.
 */

let lastPageViewKey: string | null = null;

export function installTagConfig(): { anonymize_ip: true; send_page_view: false } {
  return { anonymize_ip: true, send_page_view: false };
}

/** True the first time `pageLocation` is seen since the previous claim. Repeating the same location does not send again; returning to it later does. */
export function claimNavigationPageView(pageLocation: string): boolean {
  if (lastPageViewKey === pageLocation) return false;
  lastPageViewKey = pageLocation;
  return true;
}

export function resetNavigationPageViews(): void {
  lastPageViewKey = null;
}
