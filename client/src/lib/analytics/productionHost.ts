import { CANONICAL_ANALYTICS_HOST, normalizeAnalyticsHost } from "./collectionGate";

const WWW_HOST = "www.knowyourole.com";

export type CanonicalHostRedirect = {
  source: string;
  has: [{ type: "host"; value: typeof WWW_HOST }];
  destination: string;
  permanent: true;
};

/** www is not a second analytics host. It redirects to the apex before the page loads. */
export function canonicalHostRedirect(hostname: string, pathname: string, search = ""): string | null {
  if (normalizeAnalyticsHost(hostname) !== WWW_HOST) return null;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  return `https://${CANONICAL_ANALYTICS_HOST}${path}${query}`;
}

export function canonicalHostRedirects(): CanonicalHostRedirect[] {
  const has: CanonicalHostRedirect["has"] = [{ type: "host", value: WWW_HOST }];
  return [
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
  ];
}
