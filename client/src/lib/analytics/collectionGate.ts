/**
 * Google Analytics collection gate.
 * The tag loads only on the canonical production hostname. Build environment
 * is not a gate: production *.vercel.app URLs, preview hosts, www (it
 * redirects to the apex), localhost, and LAN addresses never collect.
 * `traffic_type=internal` is the label for a GA4 internal-traffic filter if a
 * hit from a blocked context is ever sent.
 */

export const INTERNAL_TRAFFIC_TYPE = "internal";

/** Apex host that may collect. www.knowyourole.com redirects here. */
export const CANONICAL_ANALYTICS_HOST = "knowyourole.com";

export type AnalyticsRuntime = {
  hostname?: string | null;
  nodeEnv?: string;
  vercelEnv?: string | null;
};

function clean(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** Hostname as the browser reports it: no port, no trailing dot, no IPv6 brackets. */
export function normalizeAnalyticsHost(hostname: string): string {
  let host = clean(hostname);
  if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1);
  if (host.endsWith(".")) host = host.slice(0, -1);
  return host;
}

export function isLocalAnalyticsHost(hostname: string): boolean {
  const host = normalizeAnalyticsHost(hostname);
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  if (host.endsWith(".localhost")) return true;
  if (host.endsWith(".local")) return true;
  return false;
}

export function isCanonicalAnalyticsHost(hostname: string | null | undefined): boolean {
  return normalizeAnalyticsHost(hostname ?? "") === CANONICAL_ANALYTICS_HOST;
}

/** Production and preview deployments are also served on *.vercel.app. */
export function isVercelAppHost(hostname: string | null | undefined): boolean {
  const host = normalizeAnalyticsHost(hostname ?? "");
  return host === "vercel.app" || host.endsWith(".vercel.app");
}

/**
 * RFC1918 private ranges and IPv4 link-local. IPv6 unique-local (fc00::/7)
 * and link-local (fe80::/10) count too. Localhost stays in `isLocalAnalyticsHost`.
 */
export function isLanAnalyticsHost(hostname: string | null | undefined): boolean {
  const host = normalizeAnalyticsHost(hostname ?? "");
  const mapped = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  const ipv4 = parseIpv4(mapped ? mapped[1] : host);
  if (ipv4) {
    const [a, b] = ipv4;
    if (a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }
  if (!host.includes(":")) return false;
  if (host.startsWith("fe80:") || host.startsWith("fe8") || host.startsWith("fe9") || host.startsWith("fea") || host.startsWith("feb")) {
    return true;
  }
  return host.startsWith("fc") || host.startsWith("fd");
}

function parseIpv4(host: string): [number, number, number, number] | null {
  const parts = host.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => (/^\d{1,3}$/.test(part) ? Number(part) : NaN));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return null;
  return octets as [number, number, number, number];
}

export function analyticsCollectionAllowed(input: AnalyticsRuntime): boolean {
  const host = normalizeAnalyticsHost(input.hostname ?? "");
  if (!host || isLocalAnalyticsHost(host) || isLanAnalyticsHost(host) || isVercelAppHost(host)) return false;
  return host === CANONICAL_ANALYTICS_HOST;
}

export function internalTrafficFallback(input: AnalyticsRuntime): { traffic_type: typeof INTERNAL_TRAFFIC_TYPE } | null {
  if (analyticsCollectionAllowed(input)) return null;
  return { traffic_type: INTERNAL_TRAFFIC_TYPE };
}

export function buildMeasurementConfig(input: AnalyticsRuntime & {
  page_path?: string;
  page_location?: string;
  page_title?: string;
}):
  | { load: false; traffic_type: typeof INTERNAL_TRAFFIC_TYPE }
  | {
      load: true;
      config: {
        page_path?: string;
        page_location?: string;
        page_title?: string;
        anonymize_ip: true;
        send_page_view: true;
      };
    } {
  const fallback = internalTrafficFallback(input);
  if (fallback) return { load: false, traffic_type: fallback.traffic_type };
  const config: {
    page_path?: string;
    page_location?: string;
    page_title?: string;
    anonymize_ip: true;
    send_page_view: true;
  } = { anonymize_ip: true, send_page_view: true };
  if (input.page_path) config.page_path = input.page_path;
  if (input.page_location) config.page_location = input.page_location;
  if (input.page_title) config.page_title = input.page_title;
  return { load: true, config };
}
