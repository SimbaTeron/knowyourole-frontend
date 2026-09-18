# Result-sharing referral experiment specification

## Purpose
Determine whether a concise invitation after a completed KnowYouRole result increases voluntary sharing without changing access to any result, collecting more personal data, or making unsupported claims.

## Hypothesis
A clear, first-class **Save or share your result** action can increase voluntary result-sharing initiation because it makes the existing export/share capability easier to find.

## Scope
- Population: completed-result visitors only.
- Surface: the existing result footer and existing share modal.
- Variant: the released terracotta primary share action versus the prior low-emphasis footer action.
- No referral reward, leaderboard, gating, account requirement, or recipient tracking.
- No answers, scores, traits, result labels, session IDs, result IDs, email addresses, or raw URLs are included in analytics events.

## Primary metric
**Share-modal opens per completed result view**

`share_modal_opened / result_viewed`

Both events already use consent-gated, aggregate-safe analytics. Evaluate only visitors who opted into analytics.

## Guardrails
- Preserve full free access whether a visitor shares or not.
- Preserve the existing native image, PDF, text, and email share destinations.
- Do not infer successful downstream delivery from a modal open.
- Do not add a tracking parameter, referral code, or user identifier without a separate privacy review.
- Keep a clear rollback path: revert the scoped result-footer style block in `ResultsPageClient.tsx`.

## Decision rule
Run only after a sufficient consented result-view sample is available. Compare the primary metric against the prior baseline for at least one full weekly cycle. Ship no follow-on referral mechanic unless the metric improves without elevated feedback/privacy complaints or export failures.

## Status
Specification complete. The visual prerequisite—the primary result-share CTA—is released. No additional referral mechanic is enabled.
