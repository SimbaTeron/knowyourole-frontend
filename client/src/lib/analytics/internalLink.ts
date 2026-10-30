/**
 * Internal navigation must not set campaign parameters.
 * GA4 reads utm_* and the bare names source, medium, campaign, term, and
 * content as acquisition. Placement belongs in `link_location` (or the legacy
 * alias `entry_point`) instead.
 */

export const BARE_CAMPAIGN_QUERY_KEYS = ["source", "medium", "campaign", "term", "content", "campaign_id"] as const;

const BARE_CAMPAIGN_QUERY_KEY_SET = new Set<string>(BARE_CAMPAIGN_QUERY_KEYS);

/** Result and session ids must never ride along on a GA page_location or page_path. */
const PRIVATE_HIT_QUERY_KEYS = new Set(["resultid", "result_id", "sessionid", "session_id"]);

export type InternalLinkParams = Record<string, string | number | boolean | null | undefined>;

function isUtmKey(key: string): boolean {
  return key.toLowerCase().startsWith("utm_");
}

function isBareCampaignKey(key: string): boolean {
  return BARE_CAMPAIGN_QUERY_KEY_SET.has(key.toLowerCase());
}

/** Placement for app logic. Prefers the renamed param, then a legacy `source`. */
export function readLinkLocation(search: string): string | null {
  const query = search.startsWith("?") || search.length === 0 ? search : `?${search}`;
  const params = new URLSearchParams(query);
  return params.get("link_location") || params.get("entry_point") || params.get("source");
}

/**
 * Build an internal path. Drops utm_* and other campaign keys. A bare `source`
 * (or `utm_source` passed by an older caller) is kept as `link_location` so
 * existing placement checks still resolve. Inbound campaign URLs are not built
 * here; those keep utm_* on the real landing URL.
 */
export function buildInternalHref(path: string, params?: InternalLinkParams): string {
  let url: URL;
  try {
    url = new URL(path, "https://knowyourole.com");
  } catch {
    return path;
  }

  const kept = new URLSearchParams();
  let placement = url.searchParams.get("link_location") || url.searchParams.get("entry_point") || url.searchParams.get("source");

  for (const [key, value] of url.searchParams.entries()) {
    const normalized = key.toLowerCase();
    if (normalized === "link_location" || normalized === "entry_point" || normalized === "source" || isUtmKey(normalized) || isBareCampaignKey(normalized)) {
      continue;
    }
    kept.append(key, value);
  }

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    const normalized = key.toLowerCase();
    const stringValue = String(value);
    if (normalized === "link_location" || normalized === "entry_point") {
      placement = stringValue;
      continue;
    }
    if (normalized === "source" || normalized === "utm_source") {
      if (!placement) placement = stringValue;
      continue;
    }
    if (isUtmKey(normalized) || isBareCampaignKey(normalized)) continue;
    kept.set(key, stringValue);
  }

  if (placement) kept.set("link_location", placement);

  const query = kept.toString();
  const relative = `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
  if (url.origin === "https://knowyourole.com") return relative;
  return `${url.origin}${relative}`;
}

/** URL attached to a GA hit. Keeps real utm_* acquisition and drops bare campaign keys and result or session ids. */
export function analyticsHitLocation(href: string): { page_path: string; page_location: string } {
  const url = new URL(href);
  for (const key of [...url.searchParams.keys()]) {
    if (isBareCampaignKey(key) || PRIVATE_HIT_QUERY_KEYS.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  const query = url.searchParams.toString();
  const page_path = `${url.pathname}${query ? `?${query}` : ""}`;
  return {
    page_path,
    page_location: `${url.origin}${page_path}${url.hash}`,
  };
}

export function scrubCampaignParams<T extends Record<string, string | number | boolean>>(params: T): T {
  const result: Record<string, string | number | boolean> = {};
  let placement: string | number | boolean | undefined = params.link_location ?? params.entry_point;

  for (const [key, value] of Object.entries(params)) {
    const normalized = key.toLowerCase();
    if (normalized === "link_location" || normalized === "entry_point") {
      result[normalized] = value;
      continue;
    }
    if (normalized === "source") {
      if (placement === undefined) placement = value;
      continue;
    }
    if (isUtmKey(normalized) || isBareCampaignKey(normalized)) continue;
    result[key] = value;
  }

  if (placement !== undefined && result.link_location === undefined) result.link_location = placement;
  return result as T;
}
