// Opt out of static prerendering — page relies on sessionStorage/URL params
export const dynamic = 'force-dynamic';

import ResultsPageClient from './ResultsPageClient';
import { buildPreviewResults } from './previewResults';

type Search = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const test = firstParam(params.test) === "true";
  const demo = firstParam(params.demo) === "true";
  // Paint the explicit preview in the first HTML so its text is not waiting on the client bundle.
  const initialResults = test || demo
    ? buildPreviewResults({ demo, tier: firstParam(params.tier) })
    : null;
  return <ResultsPageClient initialResults={initialResults} />;
}
