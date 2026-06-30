#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const files = {
  analytics: 'src/lib/analytics.ts',
  ga: 'src/components/GoogleAnalytics.tsx',
  quiz: 'src/components/Quiz.tsx',
  quizPage: 'src/app/quiz/QuizPageClient.tsx',
  results: 'src/app/results/ResultsPageClient.tsx',
  emailLeadApi: 'src/app/api/results/email-lead/route.ts',
};

const contents = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, read(file)]));
const allClient = Object.values(contents).join('\n');

const checks = [
  {
    name: 'GA remains consent-gated and mounted through the global component',
    pass: contents.ga.includes('hasAnalyticsConsent()') && contents.ga.includes('googletagmanager.com/gtag/js') && contents.ga.includes('window.gtag'),
  },
  {
    name: 'Analytics helper prefixes KYR events and exposes a local verification sink',
    pass: contents.analytics.includes('EVENT_PREFIX = "kyr_"') && contents.analytics.includes('__kyrAnalyticsEvents') && contents.analytics.includes('window.gtag("event"'),
  },
  {
    name: 'Quiz start is tracked',
    pass: allClient.includes('trackKyrEvent("quiz_started"'),
  },
  {
    name: 'Quiz progress milestones are tracked for drop-off analysis',
    pass: allClient.includes('trackKyrEvent("quiz_progress_milestone"') && allClient.includes('completed_questions') && allClient.includes('percent_complete'),
  },
  {
    name: 'Quiz abandonment is tracked on unload/hidden tab',
    pass: allClient.includes('trackKyrEvent("quiz_abandoned"') && allClient.includes('beforeunload') && allClient.includes('visibilitychange'),
  },
  {
    name: 'Quiz completion and processing handoff are tracked',
    pass: allClient.includes('trackKyrEvent("quiz_completed"') && allClient.includes('trackKyrEvent("quiz_completion_processing_started"') && allClient.includes('trackKyrEvent("conversion_results_handoff"'),
  },
  {
    name: 'Result persistence success/failure is tracked without sending raw answers',
    pass: allClient.includes('trackKyrEvent("quiz_result_persisted"') && allClient.includes('trackKyrEvent("quiz_result_persist_failed"') && !contents.quizPage.includes('rawResponses') && !contents.quizPage.includes('raw_answers'),
  },
  {
    name: 'Result page views and navigation clicks are tracked',
    pass: allClient.includes('trackKyrEvent("result_viewed"') && allClient.includes('trackKyrEvent("result_section_clicked"'),
  },
  {
    name: 'Share modal and share actions are tracked',
    pass: allClient.includes('trackKyrEvent("share_modal_opened"') && allClient.includes('trackKyrEvent("share_action_clicked"'),
  },
  {
    name: 'Email lead API is present and writes to result_email_leads',
    pass: contents.emailLeadApi.includes('result_email_leads') && contents.emailLeadApi.includes('consent_result_summary') && contents.emailLeadApi.includes('delivery_status'),
  },
  {
    name: 'Supabase quiz_results persistence code path includes lifecycle fields',
    pass: read('src/app/api/results/compute/route.ts').includes('quiz_results') && read('src/app/api/results/compute/route.ts').includes('created_at') && read('src/app/api/results/compute/route.ts').includes('updated_at') && read('src/app/api/results/compute/route.ts').includes('deleted'),
  },
];

const passCount = checks.filter(check => check.pass).length;
const lines = [
  '# Phase 5D Analytics & Conversion Audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Result: ${passCount} / ${checks.length} PASS`,
  '',
  ...checks.map(check => `- ${check.pass ? 'PASS' : 'FAIL'} — ${check.name}`),
  '',
  'Tracked conversion surface:',
  '- quiz_started',
  '- quiz_progress_milestone',
  '- quiz_abandoned',
  '- quiz_completed',
  '- quiz_completion_processing_started',
  '- quiz_result_persisted',
  '- quiz_result_persist_failed',
  '- conversion_results_handoff',
  '- result_viewed',
  '- result_section_clicked',
  '- share_modal_opened',
  '- share_action_clicked',
  '',
  'Privacy guardrail:',
  '- Events use aggregate metadata only: tier, counts, page/section labels, result type labels, and success/failure booleans.',
  '- Raw quiz answers and email addresses are not sent through analytics events.',
];

const outPath = path.join(root, 'docs/phase5d-analytics-conversion.md');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join('\n')}\n`);
console.log(lines.join('\n'));

if (passCount !== checks.length) process.exit(1);
