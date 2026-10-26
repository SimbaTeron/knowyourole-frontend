/**
 * Google Analytics collection gate.
 * Local hosts and non-production runtimes must not load the tag or call gtag.
 * `traffic_type=internal` is the label for a GA4 internal-traffic filter if a
 * hit from a blocked context is ever sent.
 */

export const INTERNAL_TRAFFIC_TYPE = "internal";

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

/**
 * Production means a Vercel production deployment, or a non-Vercel production
 * build. Preview, development, test, and an unset environment do not qualify.
 * An empty Vercel env is treated as unset so local production builds still
 * fall through to NODE_ENV (the host gate then blocks localhost).
 */
export function isProductionAnalyticsEnv(env: Pick<AnalyticsRuntime, "nodeEnv" | "vercelEnv">): boolean {
  const vercelEnv = clean(env.vercelEnv);
  if (vercelEnv) return vercelEnv === "production";
  const nodeEnv = clean(env.nodeEnv);
  return nodeEnv === "production";
}

export function analyticsCollectionAllowed(input: AnalyticsRuntime): boolean {
  if (input.hostname && isLocalAnalyticsHost(input.hostname)) return false;
  return isProductionAnalyticsEnv(input);
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
      };
    } {
  const fallback = internalTrafficFallback(input);
  if (fallback) return { load: false, traffic_type: fallback.traffic_type };
  const config: {
    page_path?: string;
    page_location?: string;
    page_title?: string;
    anonymize_ip: true;
  } = { anonymize_ip: true };
  if (input.page_path) config.page_path = input.page_path;
  if (input.page_location) config.page_location = input.page_location;
  if (input.page_title) config.page_title = input.page_title;
  return { load: true, config };
}
