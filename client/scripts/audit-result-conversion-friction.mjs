#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const resultsPath = path.join(root, 'src/app/results/ResultsPageClient.tsx');
const analyticsPath = path.join(root, 'src/lib/analytics.ts');

const results = fs.readFileSync(resultsPath, 'utf8');
const analytics = fs.readFileSync(analyticsPath, 'utf8');

const checks = [
  {
    id: '30-second-summary-section',
    label: 'Full Portrait has a visible 30-second summary before deep accordions',
    pass: /Your result in 30 seconds/.test(results) && results.indexOf('Your result in 30 seconds') < results.indexOf('<PortraitAccordion'),
  },
  {
    id: 'summary-four-prompts',
    label: 'Summary answers pattern, environment, watch-out, and next experiment',
    pass: ['Best-fit pattern', 'Best-fit environment', 'Watch-out', 'Try this next'].every(text => results.includes(text)),
  },
  {
    id: 'summary-primary-cta',
    label: 'Top summary has one clear preservation CTA',
    pass: results.includes('Send this result to yourself') && results.includes('result_summary_cta_clicked'),
  },
  {
    id: 'role-experiment-cta',
    label: 'Role Match includes a concrete role experiment CTA',
    pass: results.includes('Test this role in the Role Lab') && results.includes('role_experiment_clicked'),
  },
  {
    id: 'email-capture-form',
    label: 'Result page includes email preservation form wired to email-lead API',
    pass: results.includes('id="result-email-capture"') && results.includes('/api/results/email-lead') && results.includes('consentResultSummary'),
  },
  {
    id: 'share-modal-one-primary',
    label: 'Share modal elevates Share result card as the primary action',
    pass: results.includes('Share result card') && results.includes('Primary action: a clean visual card') && results.includes('share_primary_clicked'),
  },
  {
    id: 'pdf-secondary-event',
    label: 'Save PDF is secondary and separately tracked',
    pass: results.includes('pdf_save_clicked') && results.includes('Save PDF'),
  },
  {
    id: 'aggregate-analytics-only',
    label: 'Batch 4 analytics are aggregate event names, not raw answers or emails',
    pass: ['result_summary_cta_clicked', 'role_experiment_clicked', 'share_primary_clicked', 'pdf_save_clicked'].every(name => results.includes(name))
      && !/trackKyrEvent\([^\)]*email\s*[:=]/.test(results)
      && !/trackKyrEvent\([^\)]*responses\s*[:=]/.test(results)
      && analytics.includes('window.__kyrAnalyticsEvents'),
  },
  {
    id: 'mobile-touch-targets',
    label: 'New CTA controls use mobile-safe 42px+ touch targets',
    pass: ['minHeight: 46', 'minHeight: 42', 'minHeight: 54'].every(text => results.includes(text)),
  },
  {
    id: 'batch4-scope-unchanged',
    label: 'Batch 4 friction controls remain present after later readiness work',
    pass: fs.existsSync(path.join(root, 'docs/prebeta-readiness-report.md'))
      ? results.includes('Your result in 30 seconds') && results.includes('Share result card')
      : true,
  },
];

const passed = checks.filter(check => check.pass).length;
const failed = checks.filter(check => !check.pass);

function markdown() {
  const lines = [
    '# Result Conversion Friction Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Result: **${passed} / ${checks.length} PASS**`,
    '',
    '## Checks',
    '',
    ...checks.flatMap(check => [
      `- ${check.pass ? 'PASS' : 'FAIL'} — ${check.label}`,
      `  - id: \`${check.id}\``,
    ]),
    '',
    '## Notes',
    '',
    '- This audit checks static product/UI guardrails for Batch 4 only.',
    '- Browser QA is still required for actual modal fit, event firing, and mobile overflow.',
    '- No Batch 5 readiness verdict is produced here.',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

const mdIndex = process.argv.indexOf('--markdown');
if (mdIndex !== -1) {
  const outPath = process.argv[mdIndex + 1];
  if (!outPath) {
    console.error('Missing markdown output path');
    process.exit(2);
  }
  fs.mkdirSync(path.dirname(path.join(root, outPath)), { recursive: true });
  fs.writeFileSync(path.join(root, outPath), markdown());
}

console.log(`Result conversion friction audit: ${passed} / ${checks.length} PASS`);
for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id} — ${check.label}`);
}

if (failed.length) process.exit(1);
