# Phase 4 — Results usefulness, role depth, and uncertainty record

**Date:** 2026-07-27  
**Scope:** Active client only: `/home/sim/projects/knowyourole-rebuild/client`  
**Status:** Implemented and locally verified with stated browser-fixture qualification.

## Objective

Make the active result landing surface useful within 30 seconds without making it more deterministic than the evidence supports.

## Implemented surface

Created `src/components/results/ResultDecisionBrief.tsx` and mounted it in the active `OrbitalGlassV2Results` landing state.

The brief provides, in order:

1. Direction title.
2. Evidence/uncertainty state.
3. Why the direction surfaced.
4. One practical experiment for this week.
5. Adjacent role examples to compare.
6. A career-context caveat.
7. A visible action into role detail.

It consumes the canonical `ResultDTO` when present. Evidence states are deliberately bounded:

- **Clearer signal** — current signals align; direction is still a compass, not a prediction or prescription.
- **Mixed evidence** — close/hybrid or weak signals mean several work patterns remain plausible.
- **Early signal** — low confidence or several weak signals; sample possibilities rather than commit.
- **Exploratory read** — fallback/demo state with no canonical result record.

No score calculation, question, role matching, or ResultDTO schema was changed.

## Canonical wiring

`ResultsPageClient.tsx` now passes the active `canonicalResult` through `OrbitalGlassV2Results` into `ResultDecisionBrief`.

The decision brief uses canonical career direction, examples, audit confidence, weak signals, hybrid dimensions, and growth-plan action when available. Its fallback copy is explicitly exploratory rather than pretending local/demo data is persisted evidence.

## Validation

Passed on 2026-07-27:

```text
npm run lint -- --pretty false
npm run build
node scripts/audit-result-dto-career-parity.cjs
node scripts/audit-work-lane-role-fit.cjs
node scripts/audit-role-direction-personas.cjs
node scripts/audit-shortform-v2-server-authority.cjs
git diff --check
```

Results:

```text
TypeScript: PASS
Production build: PASS (125 static pages)
ResultDTO/career parity: PASS
Work-lane role fit: PASS (15/15)
Direction-role relevance: PASS (20/20)
Server authority regression: PASS
```

Local production browser verification at `http://localhost:5180/results?demo=true` confirmed:

- visible result card and decision brief;
- explicit `Exploratory read` state in demo/fallback mode;
- rationale, starter move, adjacent examples, caveat, and role-detail CTA render;
- role-detail CTA transitions to `?page=role`;
- no application console errors observed;
- no horizontal overflow at the available desktop viewport.

## Qualification

The available browser environment blocks storage mutation through automation. A purpose-built canonical low/mixed browser fixture could not be injected, so rendered low/mixed state capture is not claimed. The component has deterministic branches and a dedicated source-level audit, but this remains a real browser-fixture follow-up before launch.

The user explicitly deferred Supabase connectivity and persisted-row evidence until the approved knowyourole.com live deployment phase. This phase neither attempted nor claims that proof.

## Files changed in this phase

```text
client/src/components/results/ResultDecisionBrief.tsx
client/src/app/results/ResultsPageClient.tsx
client/scripts/audit-result-decision-brief.cjs
client/docs/plans/2026-07-27-phase-4-results-usefulness-record.md
```
