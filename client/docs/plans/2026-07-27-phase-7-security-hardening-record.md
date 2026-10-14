# Phase 7 — Security, privacy, and performance hardening record

**Date:** 2026-07-27  
**Scope:** active local `client/` source only  
**Status:** partial hardening implemented; **Phase 7 exit gate remains open**

## Implemented

1. Added baseline response hardening in `next.config.ts`:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
2. Removed wildcard CORS and preflight support from `POST /api/results/compute`.
   - The canonical compute endpoint returns individualized results and is now same-origin only.
   - Responses specify `Cache-Control: no-store`.
   - Existing client uses a same-origin relative fetch, so the change preserves active behavior.
3. Re-ran authoritative-score regression validation.

## Verified

```text
npm run lint -- --pretty false: PASS
node scripts/audit-shortform-v2-server-authority.cjs: PASS
npm run build: PASS (125 static pages)
git diff --check: PASS
```

The scoring audit proves exactly 28 known responses are required; duplicate, missing, unknown, and invalid-choice answers are rejected; identical answers produce deterministic calibrated scores and a valid ResultDTO.

## Authorized Supabase verification — 2026-07-28

Against the active KnowYourRole project (`rflvyrcoczhrmmpkowch`), using a unique `phase7-security-verification-*` marker:

```text
Service-boundary quiz_sessions access: PASS (HTTP 200)
Service-boundary quiz_results access:  PASS (HTTP 200)
Anonymous direct read of quiz_sessions: BLOCKED (HTTP 401)
Anonymous direct read of quiz_results:  BLOCKED (HTTP 401)
Canonical 28-answer completion:         PASS (HTTP 200; persistence true)
Duplicate same-session completion:       PASS (same persisted result ID)
Synthetic session rows before cleanup:   1
Synthetic result rows before cleanup:    1
Synthetic rows after cleanup:            0 sessions / 0 results
```

Initial verification exposed a duplicate-result defect (`1 session / 2 results`). The compute endpoint now checks for an existing `quiz_results.session_id` and returns its existing result ID on sequential retry. It was rebuilt and reverified against the live project.

## Phase 7 closeout attempt — 2026-07-29

### Completed and verified locally

1. **Production dependency remediation**
   - Removed unused direct `react-router-dom` and its unused `react-router` dependency after source-import review.
   - Added exact npm overrides: `qs@6.15.3`, `next > postcss@8.5.18`, and `next > sharp@0.35.3`.
   - `qs` satisfies its parent range. The two Next-scoped overrides are a tested temporary compatibility exception: Next 16.2.12 pins `postcss@8.4.31` and declares optional `sharp@^0.34.5`; no newer stable Next release was available at verification time.
   - Current `npm audit --omit=dev --json`: **0 critical / 0 high / 0 moderate**.
   - Production build, TypeScript check, and server-authority audit passed with those resolutions.

2. **Legacy CORS contract review**
   - Reviewed all 15 active routes advertising `Access-Control-Allow-Origin: *`.
   - No documented cross-origin consumer was found; first-party callers use same-origin relative requests.
   - Removed wildcard allow-origin headers from all reviewed routes, including sensitive feedback, email-lead, session, scoring, and personalization endpoints.
   - A current-build local server test sent `Origin: https://untrusted.example` to representative sensitive and public endpoints; every tested response omitted `Access-Control-Allow-Origin`.
   - Method/header declarations remain only as non-permissive response metadata. No reflected-origin behavior was added.

3. **Local performance baseline**
   - Production build: `53.84s`, peak RSS `2,766,972 KB`; 125 static pages generated.
   - Warm local response baseline (three samples) and static asset footprint:

```text
route                warm TTFB      HTML       Next JS      CSS       total static assets
/                    4.9–5.7 ms     49 KB      1.27 MB      235 KB    1.51 MB
/quiz                19.2–24.4 ms   32 KB      2.36 MB      235 KB    2.59 MB
/results?demo=true   15.8–18.7 ms   19 KB      1.73 MB      235 KB    1.97 MB
/privacy             3.8–6.0 ms     28 KB      not sampled  not sampled  not sampled
```

   - This is a localhost server/asset baseline only. It is not Core Web Vitals, mobile-device, Lighthouse, LCP, CLS, or INP evidence. Browser route/accessibility/consent coverage is recorded below, but it does not substitute for field-performance data.

4. **Browser/mobile accessibility and consent harness**
   - Added Playwright + axe coverage in `playwright.config.ts` and `tests/e2e/public-surface.spec.ts`.
   - Installed Chromium test runtime and ran `npm run test:e2e`: **18 passed** across desktop, 375px mobile, and 768px tablet viewports.
   - Verified no horizontal overflow on `/`, `/quiz`, `/results?demo=true`, and `/privacy`; keyboard focus reaches an interactive element; homepage has zero serious/critical WCAG 2 A/AA axe violations; Google Analytics is absent before consent and requested only after explicit analytics opt-in.
   - Browser inspection exposed a production-mounted `DevToolPanel` with fake-data/storage controls. `src/app/providers.tsx` now mounts it only when `NODE_ENV === "development"`; browser coverage confirms `KYR DEV` is absent from the production build.

5. **Database concurrency protection applied and verified**
   - Created and applied `supabase/migrations/005_enforce_one_result_per_session.sql`, adding the verified unique partial index `quiz_results_one_result_per_session_idx` on non-null `quiz_results.session_id`.
   - Initial Supabase CLI authentication failed because the valid vault Management PAT was Markdown-escaped and not loaded into the WSL shell. On 2026-07-29, the PAT was safely normalized in memory, transiently used, and verified against the Management API; it can see the active target `rflvyrcoczhrmmpkowch`.
   - The Supabase Management `database/query` endpoint was proven with a read-only `SELECT 1` (HTTP 201), so no Postgres database password was required for the authorized migration path.
   - Migration 005 initially exposed two historical duplicate session groups. The unambiguous deployment-smoke group (`deploy-smoke-quiz-time-6b5fc295`, two rows) was deleted. With explicit authorization, the anonymous three-row group `ab588cf4-d527-4abb-9c8a-4401e8695780` was deduplicated by retaining its earliest row and deleting two later duplicates. Pre-index verification confirmed one retained canonical row and zero duplicate non-null session groups.
   - The first simultaneous canonical completion proof established database integrity (one persisted result) but exposed an application recovery defect: the losing request returned a persistence fallback after the expected unique violation. `src/app/api/results/compute/route.ts` now identifies collisions on `quiz_results_one_result_per_session_idx`, re-reads the winning row, and returns its canonical result ID.
   - Final local-production proof used two simultaneous `POST /api/results/compute` calls with one marked synthetic session and a valid 28-answer fixture: both returned HTTP 200 and `persistence.ok: true`, both returned the same canonical result ID, and the database held exactly one result row. The marked result and session were deleted afterward; cleanup verification returned zero rows. No credential values were printed or persisted.

### Privacy-control audit findings

- Profile export/delete UI uses the project cookie-based `useAuth` flow, while `/api/user/export` and `/api/user/delete` require an Auth0 bearer token. The UI does not provide that token; these user controls are not proven usable.
- Account deletion currently omits `result_email_leads`; export omits `quiz_sessions`, email leads, and feedback.
- Anonymous canonical results have `user_id: null`, so the current account-delete path cannot delete them by session/result identifier.
- Browser cookie consent defaults optional categories off and gates Google Analytics rendering, but its localStorage model is disconnected from the server privacy-preference model.

## Exit decision

Phase 7 is **not closed**. Security hardening, dependency remediation, CORS removal, database concurrency integrity, and local browser evidence are complete; the following mandatory exit evidence remains unavailable or requires a product/identity decision:

1. Define one end-to-end identity contract for profile privacy controls, then prove export/delete behavior with a disposable identity.
2. Extend the approved export/deletion scope to cover the data categories the product claims to handle, including an explicit anonymous-result process.
3. Add browser/device performance tooling and measure Core Web Vitals or equivalent on target viewports.

No production deployment, domain/configuration change, commit, or push occurred. Public launch remains **NO-GO**.
