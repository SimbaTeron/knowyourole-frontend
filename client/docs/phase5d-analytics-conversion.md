# Phase 5D Analytics & Conversion Audit

Generated: 2026-06-20T18:59:51.780Z

Result: 11 / 11 PASS

- PASS — GA remains consent-gated and mounted through the global component
- PASS — Analytics helper prefixes KYR events and exposes a local verification sink
- PASS — Quiz start is tracked
- PASS — Quiz progress milestones are tracked for drop-off analysis
- PASS — Quiz abandonment is tracked on unload/hidden tab
- PASS — Quiz completion and processing handoff are tracked
- PASS — Result persistence success/failure is tracked without sending raw answers
- PASS — Result page views and navigation clicks are tracked
- PASS — Share modal and share actions are tracked
- PASS — Email lead API is present and writes to result_email_leads
- PASS — Supabase quiz_results persistence code path includes lifecycle fields

Tracked conversion surface:
- quiz_started
- quiz_progress_milestone
- quiz_abandoned
- quiz_completed
- quiz_completion_processing_started
- quiz_result_persisted
- quiz_result_persist_failed
- conversion_results_handoff
- result_viewed
- result_section_clicked
- share_modal_opened
- share_action_clicked

Privacy guardrail:
- Events use aggregate metadata only: tier, counts, page/section labels, result type labels, and success/failure booleans.
- Raw quiz answers and email addresses are not sent through analytics events.
