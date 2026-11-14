import { CANONICAL_ANALYTICS_HOST, normalizeAnalyticsHost } from "./collectionGate";

const WWW_HOST = "www.whatcareerfits.com";
const LEGACY_HOSTS = ["knowyourole.com", "www.knowyourole.com"] as const;
const REDIRECT_HOSTS = [WWW_HOST, ...LEGACY_HOSTS];

export type CanonicalHostRedirect = {
  source: string;
  has?: [{ type: "host"; value: string }];
  destination: string;
  permanent: true;
};

/**
 * www.whatcareerfits.com and the old knowyourole.com hosts redirect to the apex
 * in one hop. /schools on those hosts goes straight to /for-schools.
 */
export function canonicalHostRedirect(hostname: string, pathname: string, search = ""): string | null {
  const host = normalizeAnalyticsHost(hostname);
  if (!REDIRECT_HOSTS.includes(host as (typeof REDIRECT_HOSTS)[number])) return null;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  const destPath = path === "/schools" ? "/for-schools" : path;
  return `https://${CANONICAL_ANALYTICS_HOST}${destPath}${query}`;
}

export function canonicalHostRedirects(): CanonicalHostRedirect[] {
  const rules: CanonicalHostRedirect[] = [];
  for (const host of REDIRECT_HOSTS) {
    const has: CanonicalHostRedirect["has"] = [{ type: "host", value: host }];
    rules.push(
      {
        source: "/schools",
        has,
        destination: `https://${CANONICAL_ANALYTICS_HOST}/for-schools`,
        permanent: true,
      },
      {
        source: "/",
        has,
        destination: `https://${CANONICAL_ANALYTICS_HOST}`,
        permanent: true,
      },
      {
        source: "/:path*",
        has,
        destination: `https://${CANONICAL_ANALYTICS_HOST}/:path*`,
        permanent: true,
      },
    );
  }
  rules.push({
    source: "/schools",
    destination: "/for-schools",
    permanent: true,
  });
  return rules;
}
