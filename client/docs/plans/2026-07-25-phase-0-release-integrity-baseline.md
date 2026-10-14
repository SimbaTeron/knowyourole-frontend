# Phase 0 — Release integrity baseline

**Date:** 2026-07-25  
**Status:** Complete as a baseline and build-repair phase. Security remediation remains intentionally deferred pending separate authorization.

## Scope honored

- Active implementation scope: `/home/sim/projects/knowyourole-rebuild/client/`
- No deployment, staging, commit, push, dependency install, dependency upgrade, database migration, or scoring change occurred.
- Protected legacy tree `/home/sim/projects/knowyourole-rebuild/KnowYouRole/client/` was not edited by this phase. It already contained unrelated modified files before Phase 0:
  - `src/components/DevToolPanel.tsx`
  - `src/components/ShareableResultCard.tsx`
  - `src/pages/auth.tsx`

## Repair applied

### Build failure

The Next production build was blocked because root-mounted `ThemeReviewController` calls `useSearchParams()` without a Suspense boundary. It propagated prerender failures to static routes.

### Minimal repair

`client/src/app/layout.tsx` now imports `Suspense` and isolates review-only query-driven UI:

```tsx
<Suspense fallback={null}>
  <ThemeReviewController />
</Suspense>
```

This does not change quiz scoring, result DTO/API behavior, navigation, persistence, production configuration, or visual theme selection behavior.

## Verification results

| Gate | Result | Evidence |
|---|---|---|
| Production build | PASS | `npm run build` completed successfully; 125 static pages generated. |
| TypeScript check | PASS | `npm run lint -- --pretty false` exited 0. The current `lint` script runs `tsc --noEmit`; it is not an independent ESLint-style check. |
| Fixed-28 question audit | PASS | 28 questions across core style, Big Five, DISC, career-fit, and calibration groups. |
| Random-balance audit | PASS | 5,000 deterministic runs; all 16 MBTI types appeared; MBTI/DISC/Big Five spread checks passed. |
| Persona audit | PASS | 10/10 personas passed. |
| Role-direction audit | PASS | 20/20 direction-relevance personas passed. |
| Work-lane role-fit audit | PASS | 15/15 practical/knowledge/person/service profiles passed. |
| ResultDTO/career parity | PASS | `RESULT_DTO_CAREER_PARITY_PASS`. |
| Controlled-beta feedback regression | PASS | `CONTROLLED_BETA_FEEDBACK_REGRESSION_PASS`. |
| Diff whitespace check | PASS | `git diff --check` exited 0. |
| Production-mode local rendering | PASS | `next start -p 5180` served `/` and `/?design=workday`; no browser JS errors were recorded. |
| Local design-review control | PASS | `?design=workday` rendered the review switcher after the Suspense repair. |

## Local production-render notes

The local `next start` server was verified at:

```text
http://localhost:5180/
http://localhost:5180/?design=workday
```

The local development panel appears on `localhost` by design. Source inspection confirms `DevToolPanel` only renders when the hostname is `localhost`, `127.0.0.1`, or a `192.168.*` LAN address. It is therefore a local QA concern, not evidence that the panel renders on `knowyourole.com`.

## Security audit — classified, not remediated

`npm audit --omit=dev --json` reported:

```text
0 critical
6 high
1 moderate
7 total
```

### High-severity packages

| Package | Direct? | Observed installed path | Recommended approved remediation path |
|---|---:|---|---|
| `next@16.2.4` | Yes | Root dependency | Upgrade to a version that resolves the current Next advisories (audit reports fixes through the 16.2.11 boundary); then build and route-test. |
| `postcss@8.5.13` | Yes | Root dev dependency; separate nested `8.4.31` under Next | Upgrade direct PostCSS to a non-vulnerable version and reevaluate the nested copy after Next is upgraded. |
| `react-router-dom@7.13.2` / `react-router@7.13.2` | Yes | Root dependency | No active source imports were found under `client/src`; remove the unused direct package rather than carrying an avoidable high-severity surface. |
| `sharp@0.34.5` | No, optional via Next | `next@16.2.4` | Reevaluate after the Next upgrade; do not separately force an incompatible binary dependency. |
| `ws@8.20.0` | No, via Supabase realtime | `@supabase/supabase-js@2.100.0` | Upgrade the direct Supabase package within a dedicated compatibility-tested dependency batch. |

### Moderate-severity package

| Package | Path | Recommended remediation path |
|---|---|---|
| `qs@6.15.1` | `googleapis@171.4.0` → `googleapis-common` | Upgrade the direct Google API client in the dedicated dependency batch, then inspect resolved `qs`. |

### Security decision

Security remediation is a launch blocker, but it was not performed because this approved phase explicitly excluded dependency upgrades. The correct next step is a dedicated approved dependency/security batch, not `npm audit fix` roulette.

## Remaining broad-launch blockers

1. **Security:** six high and one moderate dependency findings remain unresolved.
2. **Result authority:** project state still identifies client-trusted totals, competing result computation paths, and risk of duplicate completion writes.
3. **Role coverage:** current exact role-key coverage remains incomplete; output quality must be expanded based on active scorer reachability, not decorative UI.
4. **E2E coverage:** audit scripts are valuable domain regressions but are not a full browser E2E suite for quiz completion, persistence, accessibility, and error recovery.
5. **Real-user evidence:** deterministic audits support controlled quality checks, not broad claims of psychometric validation or career accuracy.

## Phase 0 conclusion

The prior production-build blocker is resolved. The active client can now create a local optimized production build, and all maintained domain audits currently pass. **KnowYouRole is not launch-ready** because unresolved high-severity dependency issues and the identified result-authority/real-user-validation gaps remain.

The recommended next authorized phase remains **Phase 1 — Trust, legal clarity, and measurement transparency**. A dedicated dependency remediation batch should be approved before Phase 7 rather than silently folded into visual or content work.
