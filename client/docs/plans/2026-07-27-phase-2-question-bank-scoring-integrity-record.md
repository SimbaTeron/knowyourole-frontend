# Phase 2 — question-bank and scoring-integrity record

**Date:** July 27, 2026  
**Active bank:** `src/data/shortformV2Questions.ts`  
**Scoring version:** `shortform-v2-fixed-28`  
**Scope:** fixed 28-question Shortform V2 only; no clinical-validity claim.

## Item-quality review

Review criteria: grammar, single primary construct, answer mutual distinction, social-desirability pressure, leading language, timeframe/context clarity, duplicate coverage, and score-map appropriateness. “Keep” means the item has a clear primary construct and no copy/weight change was justified by this review. This is content QA, not psychometric validation.

| ID | Key | Primary construct | Review | Decision |
|---:|---|---|---|---|
| 1 | recharge-pattern | recovery preference | Clear post-demand context; distinct solitude, connection, practical, and creative options. | Keep |
| 2 | information-lens | initial problem attention | Concrete, pattern, human-impact, and action lenses are distinguishable. | Keep |
| 3 | decision-standard | decision criterion | Logic, human effect, measurable progress, and adaptability are distinct standards. | Keep |
| 4 | planning-style | planning reflex | Fixed three-week scenario avoids vague future language; four operationally distinct approaches. | Keep |
| 5 | communication-processing | processing mode | Serious-conversation frame is sufficiently specific; options are not moralized. | Keep |
| 6 | novelty-proven-path | novelty/proof tradeoff | Clear comparative condition; options separate proof, novelty, efficiency, and adoption. | Keep |
| 7 | closure-preference | work-session reward | Single reflective construct; no duplicate wording with planning item. | Keep |
| 8 | thinking-depth | chosen task energy | Equal-pay/equal-importance condition limits prestige bias. | Keep |
| 9 | follow-through-friction | persistence under boredom | Direct behavioral frame; options cover distinct persistence mechanisms. | Keep |
| 10 | detail-tolerance | error response | Concrete stakes and four distinct error-management choices. | Keep |
| 11 | curiosity-driver | learning attraction | Avoids credentials/prestige; practical, system, novel, and lived learning are distinct. | Keep |
| 12 | social-energy-level | preferred energy setting | Uses setting rather than a global self-judgment. | Keep |
| 13 | cooperation-style | group contribution | Third-party framing reduces self-description inflation; options are behaviorally distinct. | Keep |
| 14 | conflict-pattern | first response to disagreement | Explicitly asks for first instinct, reducing ideal-response pressure. | Keep |
| 15 | stress-response | initial pressure pattern | First-pattern framing limits hindsight; balanced answer valence. | Keep |
| 16 | feedback-response | condition for using feedback | Blunt-feedback scenario is clear; no answer is socially mandated. | Keep |
| 17 | team-stuck-moment | leadership reflex | Deadline context is necessary and clear; action, energy, stability, and checking are distinct. | Keep |
| 18 | influence-style | persuasion approach | Story, evidence, momentum, and trust are distinct mechanisms. | Keep |
| 19 | pace-preference | best work rhythm | “Best work” focuses on performance rather than thrill-seeking alone. | Keep |
| 20 | standards-vs-momentum | execution tradeoff | Concrete “good but not perfect” condition produces a real decision tradeoff. | Keep |
| 21 | responsibility-style | preferred ownership | Each option identifies a separable responsibility, not a status title. | Keep |
| 22 | work-material-preference | recurring work material | Direct career-vector item with four readable material families. | Keep |
| 23 | six-month-energy | sustainable work energy | Six-month horizon gives useful timeframe; answer options remain concrete. | Keep |
| 24 | environment-preference | preferred environment | Each environment names work conditions rather than job titles. | Keep |
| 25 | motivation-driver | durable work reward | Explicit post-novelty framing reduces short-term excitement bias. | Keep |
| 26 | tradeoff-tolerance | acceptable career friction | Balanced tradeoffs; each option names both cost and desired return. | Keep |
| 27 | strength-mirror | self/other-recognized contribution | Guidance previously disclosed calibration mechanics and primed convergence. | **Copy repaired; weights unchanged.** |
| 28 | anti-fit-warning | frustrating work condition | Guidance previously asserted an unsupported predictive claim. | **Copy repaired; weights unchanged.** |

## Score-map and authority audit

### Authority rule

```text
Exactly 28 answer records (known question ID + option 0–3)
→ validate uniqueness and full coverage
→ recompute MBTI, DISC, Big Five, and career-vector raw totals from the versioned bank
→ apply the same opportunity/variance calibration used by the client
→ build ResultDTO
→ persist only through /api/results/compute
```

The browser-provided framework totals are now ignored at the compute boundary. They may be present for UI transition compatibility, but they cannot determine a server result.

### Repairs

| Repair | Before | After | Evidence |
|---|---|---|---|
| Server answer authority | `/api/results/compute` accepted client totals and shallow response data. | Route requires exactly 28 unique known response IDs and choices; server rebuilds totals and canonical response metadata. | `audit-shortform-v2-server-authority.cjs` rejects missing, duplicate, unknown, and invalid-choice sets. |
| Client/server parity seam | Client had an incremental accumulator separate from the server boundary. | Both final client scoring and server computation use `lib/quiz/shortformV2Scoring.ts` plus the same calibration function. | Identical fixture answers produce byte-equal calibrated score maps. |
| Duplicate active persistence path | Active completion called `/api/quiz/score` and `/api/results/compute`; both could insert. | Active fixed-28 completion calls only `/api/results/compute`. | Source-level completion flow has one persistence call. |
| Persistence analytics | A successful compute with failed persistence still emitted `quiz_result_persisted`. | Event is `quiz_result_computed_unpersisted` unless `persistence.ok === true`. | Source-level branch reviewed and typechecked. |
| Adult tier parity | `25+` became `unknown` in ResultDTO. | `25+` normalizes to `25plus`. | Authority audit builds a valid DTO with `raw.tier === "25plus"`. |
| Multi-axis MBTI fallback | Every `X` replacement used the first ambiguous axis. | Replacement uses the matched character index in both scoring copies. | Typecheck plus source review. |

## Known limitations retained deliberately

- This is deterministic product scoring, not clinical validation or population norming.
- Result persistence still depends on the deployed Supabase schema and environment availability. A future schema migration should enforce an idempotency/completion key at the database level; client double-submission is removed from the active flow, but a database uniqueness guarantee is stronger than application intent.
- Raw answer payloads in legacy result URLs remain a privacy/URL-size concern. Replacing them with an opaque result reference requires a separate retrieval/migration seam and is not silently bundled into this scoring-integrity phase.
- Career-direction examples are deterministic exploratory directions, not job prescriptions.

## Required validation commands

```bash
node scripts/audit-shortform-v2-questions.cjs
node scripts/audit-shortform-v2-balance.cjs
node scripts/audit-shortform-v2-personas.cjs
node scripts/audit-shortform-v2-server-authority.cjs
node scripts/audit-result-dto-career-parity.cjs
node scripts/audit-work-lane-role-fit.cjs
node scripts/audit-role-direction-personas.cjs
npm run lint -- --pretty false
npm run build
git diff --check
```
