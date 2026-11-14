import { publicPages } from "@/lib/seo";

/** Shown when /og is called without a known page title and path. */
export const OG_DEFAULT_TITLE = "Discover your work style";
export const OG_DEFAULT_PATH = "/";

/**
 * Same cleaning as ogImagePath in seo.ts.
 * Kept here so the route can check the query string against the page registry
 * without rendering attacker-controlled text.
 */
export function cleanOgTitle(title: string): string {
  return title.replace(/\s*\|\s*What Career Fits\s*$/, "").replace(/\s*\|\s*/g, " · ").trim();
}

/**
 * Cards whose open-graph title is not the publicPages title.
 * These match noIndexMetadata / results layout calls.
 */
const EXTRA_OG_CARDS: readonly { path: string; title: string }[] = [
  { path: "/results", title: "My career-fit starting point" },
  { path: "/auth", title: "Auth | What Career Fits" },
  { path: "/callback", title: "Auth Callback | What Career Fits" },
  { path: "/checkout-cancel", title: "Checkout Cancelled | What Career Fits" },
  { path: "/checkout-success", title: "Checkout Success | What Career Fits" },
  { path: "/profile", title: "Profile | What Career Fits" },
];

function cardAllowlist(): Map<string, Set<string>> {
  const cards = new Map<string, Set<string>>();
  const add = (path: string, title: string) => {
    const cleaned = cleanOgTitle(title);
    if (!path.startsWith("/") || !cleaned) return;
    const titles = cards.get(path) ?? new Set<string>();
    titles.add(cleaned);
    cards.set(path, titles);
  };
  for (const page of publicPages) add(page.path, page.title);
  for (const card of EXTRA_OG_CARDS) add(card.path, card.title);
  return cards;
}

const cards = cardAllowlist();

export type OgCardInput = { title: string; path: string; accepted: boolean };

/**
 * Accept only a known page path paired with that page's cleaned title.
 * Anything else (arbitrary text, a real title on the wrong path, a result id)
 * falls back to the default card.
 */
export function resolveOgCardInput(searchParams: Pick<URLSearchParams, "get">): OgCardInput {
  const title = cleanOgTitle(searchParams.get("title") ?? "");
  const path = (searchParams.get("path") ?? "").trim();
  const allowed = cards.get(path);
  if (title && allowed?.has(title)) {
    return { title, path, accepted: true };
  }
  return { title: OG_DEFAULT_TITLE, path: OG_DEFAULT_PATH, accepted: false };
}
