// Opt out of static prerendering — page relies on sessionStorage/URL params
export const dynamic = 'force-dynamic';

import ResultsPageClient from './ResultsPageClient';

export default function ResultsPage() {
  return <ResultsPageClient />;
}
