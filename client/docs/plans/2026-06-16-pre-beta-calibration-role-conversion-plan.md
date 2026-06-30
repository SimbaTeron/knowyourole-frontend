# KnowYouRole Pre-Beta Calibration, Career Match, and Result Friction Plan

> **For Hermes:** Implement this plan one approved batch at a time. Do not deploy until each batch passes local verification and Sim explicitly approves deployment.

**Goal:** Make KnowYouRole safe and useful enough for controlled user sharing by improving result calibration, career-match usefulness, and result-page conversion clarity.

**Architecture:** Build evidence first, then tune scoring and data, then simplify user-facing result flow. Avoid speculative redesign. Every improvement must be regression-tested against seeded personas, browser-verified on local results pages, and checked on the iPhone 13 mini baseline.

**Tech Stack:** Next.js app under `client/`, TypeScript/React, Supabase persistence, Vercel deployment, local audit scripts in `client/scripts/`, result data under `client/src/data/`, scoring/API logic under `client/src/lib/` and `client/src/app/api/`.

---

## Executive Strategy

The three priorities are interdependent, so the implementation order matters:

1. **Measurement foundation:** create a stronger seeded persona audit so we can prove results improved instead of guessing.
2. **Calibration hardening:** fix DISC and Big Five wobble exposed by realistic 45-question simulations.
3. **Career-match usefulness:** make role output safer, less seniority-inflated, and more actionable.
4. **Result-page friction reduction:** make the first 30 seconds of the result clearer and make save/share actions less cluttered.
5. **Final pre-beta gate:** run five persona simulations plus browser QA and decide whether private sharing is acceptable.

No broad launch until the final gate passes.

---

## Success Criteria

### Result relevance

- Five core persona simulations average **8.5 / 10** or better.
- No core persona receives an obviously wrong dominant Big Five trait.
- Warm/social persona does not land as cold/technical by default.
- Creative/social persona does not get mislabeled as Dominant unless directness evidence is clearly stronger than enthusiasm/social energy.
- Strategic analytical persona resolves toward Conscientious/analytical when D/C is close.

### Career usefulness

- Each result provides:
  - role family,
  - starter role/path,
  - stretch role/path,
  - may-not-fit warning,
  - first real-world experiment.
- Senior titles are gated or translated into practical beginner tests.
- Teen/college/early-career users do not receive absurdly senior recommendations as their primary action.

### Result-page friction

- A user can understand the result in **30 seconds**.
- Top page answers:
  - What am I like?
  - Where do I fit?
  - What should I try next?
  - What should I watch out for?
- Share/save flow has one clear primary action.
- iPhone 13 mini has no horizontal overflow or cramped modal/action-bar failure.

---

## Phase 0 — Safety, Baseline, and Scope Lock

**Objective:** Freeze the current state and prevent random scope creep.

**Files:**
- Inspect: `client/src/lib/scoring.ts`
- Inspect: `client/src/app/api/_lib/scoring.ts`
- Inspect: `client/src/app/api/results/compute/route.ts`
- Inspect: `client/src/data/questions.json`
- Inspect: `client/src/data/roles.json`
- Inspect: `client/src/app/results/ResultsPageClient.tsx`
- Inspect: `client/src/lib/analytics.ts`
- Inspect: current untracked migrations under `client/supabase/migrations/`

**Steps:**

1. Check branch and dirty state.
2. Confirm whether the two Supabase migration files should be included in the eventual commit.
3. Do not edit unrelated legacy/protected folders.
4. Run current baseline checks:
   - `node scripts/audit-phase5d-analytics-conversion.mjs`
   - `node scripts/audit-phase4-disc-role-calibration.mjs --markdown docs/phase4-disc-role-calibration.md`
   - `node scripts/audit-quiz-validity-personas.mjs --markdown docs/quiz-validity-phase1.md`
   - `npx tsc --noEmit --pretty false`
   - `npm run lint -- --pretty false`
   - `NODE_OPTIONS=--max-old-space-size=4096 npm run build`
   - repo-root `bash scripts/check-runtime.sh`

**Exit criteria:**

- Known dirty files documented.
- Current audits pass or known failures are captured.
- No deployment.

---

## Phase 1 — Build the Realistic Persona Calibration Harness

**Objective:** Replace vibe-based review with a repeatable audit that simulates realistic 45-question users across multiple seeds.

**Why first:** Without this, tuning scoring is just personality astrology wearing a TypeScript hat.

**Files:**
- Create: `client/scripts/audit-prebeta-persona-calibration.mjs`
- Create: `client/docs/prebeta-persona-calibration.md`
- Possibly read/reuse: `client/scripts/audit-quiz-validity-personas.mjs`
- Possibly read/reuse: `client/src/data/questions.json`
- Possibly read/reuse: `client/src/app/api/_lib/scoring.ts`

**Implementation details:**

Create a script that:

1. Defines the five core personas:
   - Strategic Systems Architect
   - Warm Team Connector
   - Creative Explorer
   - Methodical Support Specialist
   - Hands-on Fast Operator
2. Defines expected ranges:
   - acceptable MBTI types,
   - acceptable DISC primary/secondary,
   - expected top Big Five trait(s),
   - acceptable role families,
   - unacceptable failure modes.
3. Selects 45 questions deterministically by seed using the same active-tier/filtering assumptions as the quiz.
4. Chooses answers based on question psych metadata and persona preference rules.
5. Runs each persona across at least **5 seeds**.
6. Produces:
   - per-run result summary,
   - MBTI match score,
   - DISC match score,
   - Big Five match score,
   - role usefulness score,
   - overall score out of 10,
   - failure reasons.
7. Fails the process if:
   - average score below target,
   - any persona has severe mismatch,
   - responses length is not 45,
   - result payload lacks critical fields.

**Acceptance thresholds for first version:**

- Do not require it to pass initially.
- It should truthfully report current failures.
- It must be deterministic.

**Verification:**

```bash
cd /home/sim/projects/knowyourole-rebuild/client
node scripts/audit-prebeta-persona-calibration.mjs --markdown docs/prebeta-persona-calibration.md
```

Expected initial outcome:

- Audit runs cleanly.
- Some persona scores may fail. That is the point.

---

## Phase 2 — DISC and Big Five Calibration Hardening

**Objective:** Fix the result dimensions that currently wobble: Dominant over-selection, Conscientious misfires, and wrong Big Five primary trait for warm/social/action users.

**Files:**
- Modify: `client/src/lib/scoring.ts`
- Modify: `client/src/app/api/_lib/scoring.ts`
- Possibly modify: `client/src/data/questions.json`
- Modify or extend: `client/scripts/audit-phase4-disc-role-calibration.mjs`
- Re-run: `client/scripts/audit-prebeta-persona-calibration.mjs`

**Subphase 2A — DISC tie-breaker refinement**

Implement rules:

- Close `D/C` + introverted + high structure/follow-through + lower social energy → `Conscientious`.
- Close `D/I` + high social energy + high openness + lower/moderate structure → `Influential`.
- Clear high `D` stays `Dominant`.
- Supportive structured users should not collapse into `Conscientious` if Agreeableness/Steady evidence is stronger.

**Subphase 2B — Big Five dominant-trait reliability**

Implement rules:

- Do not select dominant Big Five trait from one noisy dimension if multiple traits are close.
- Add close-score uncertainty when top traits are within a small margin.
- Prefer composite interpretation when useful:
  - People Focus = Agreeableness + Social Energy
  - Strategic Builder = Openness + Follow-through
  - Action Catalyst = Social Energy + low hesitation/directness
  - Careful Support = Follow-through + Agreeableness
- Keep raw values visible internally, but avoid overclaiming one trait in user-facing copy when evidence is close.

**Subphase 2C — Question-bank separators only if needed**

Only if audit failures persist, tune or add questions that separate:

- supportiveness vs compliance,
- leadership/directness vs social enthusiasm,
- creative exploration vs practical action,
- structure-for-care vs structure-for-control,
- optimism/social warmth vs abstract openness.

**Guardrails:**

- Do not rewrite the whole scoring engine.
- Do not add fake validation claims.
- Do not hide uncertainty; show it plainly.
- Do not degrade the Methodical Support Specialist, which is currently strong.

**Verification commands:**

```bash
cd /home/sim/projects/knowyourole-rebuild/client
node scripts/audit-phase4-disc-role-calibration.mjs --markdown docs/phase4-disc-role-calibration.md
node scripts/audit-prebeta-persona-calibration.mjs --markdown docs/prebeta-persona-calibration.md
node scripts/audit-quiz-validity-personas.mjs --markdown docs/quiz-validity-phase1.md
npx tsc --noEmit --pretty false
npm run lint -- --pretty false
```

**Exit criteria:**

- Five persona seeded audit average >= **8.5 / 10**.
- Warm Team Connector gets Influential or Steady-style communication, not Conscientious by default.
- Creative Explorer gets Influential when social/novelty evidence beats direct-command evidence.
- Strategic Systems Architect resolves to Conscientious or clearly explains D/C close-call uncertainty.
- No Big Five dominant trait is absurd for the persona.

---

## Phase 3 — Career Match Safety and Usefulness Pass

**Objective:** Stop giving career matches that are merely plausible; make them useful, age-appropriate, and actionable.

**Files:**
- Modify: `client/src/data/roles.json`
- Modify: role selection helpers, likely under one or more of:
  - `client/src/lib/resultsData.ts`
  - `client/src/app/api/results/compute/route.ts`
  - `client/src/app/api/_lib/*`
  - `client/src/app/results/ResultsPageClient.tsx`
- Create or extend: `client/scripts/audit-career-match-usefulness.mjs`
- Create: `client/docs/career-match-usefulness.md`

**New role output model:**

Each role recommendation should expose:

1. **Role family**
   - e.g. Strategy & Systems, People Development, Creative Innovation, Operations & Support, Sales & Action.
2. **Starter path**
   - realistic first step for high school / college / early career / adult transition.
3. **Stretch path**
   - aspirational but not presented as immediate identity.
4. **Why this fits**
   - tied to MBTI-style + DISC + Big Five evidence.
5. **May not fit if**
   - honest mismatch condition.
6. **Try this next**
   - one concrete experiment.

**Seniority guardrails:**

Penalize or translate titles such as:

- CTO
- Director
- Founder
- Architect
- Senior Consultant
- Executive
- Principal

unless the profile strongly supports leadership, technical/system scope, and maturity/seniority assumptions.

For younger/default users, translate:

- `Sales Director` → `Sales or Partnerships Track` + starter experiment.
- `Innovation Consultant` → `Creative Problem-Solving Track` + project test.
- `Impact Strategy Consultant` → `Strategy and Research Track` + starter portfolio artifact.
- `Registered Nurse` → `Care and Support Track` + shadow/interview/checklist experiment.

**Age/tier logic:**

Use quiz tier if available:

- `13-18`: exploration/starter/project language.
- `19-25`: internship, major, portfolio, early role language.
- `26+`: transition, career track, leadership/stretch language.

If tier unavailable, default to non-senior language.

**Audit requirements:**

Create a career audit that checks:

- no primary result overuses senior titles without starter translation,
- every exact role entry has required fields,
- every persona gets a plausible role family,
- `whyThisFits`, `starterPath`, `mayNotFit`, and `tryThisNext` are present and concise,
- no unexplained acronyms,
- no fake certainty words such as “guaranteed,” “proves,” or “destined.”

**Verification:**

```bash
cd /home/sim/projects/knowyourole-rebuild/client
node scripts/audit-career-match-usefulness.mjs --markdown docs/career-match-usefulness.md
node scripts/audit-results-readability.mjs --markdown docs/results-readability-phase-b.md
node scripts/audit-prebeta-persona-calibration.mjs --markdown docs/prebeta-persona-calibration.md
npx tsc --noEmit --pretty false
npm run lint -- --pretty false
```

**Exit criteria:**

- Five persona role ratings average >= **8.5 / 10**.
- No persona receives a role that feels comically senior as the main recommendation.
- Every role result gives a practical next experiment.
- Role page feels like guidance, not a fortune cookie with a job title.

---

## Phase 4 — Result Page Friction Reduction

**Objective:** Make the result immediately understandable and make save/share actions obvious.

**Files:**
- Modify: `client/src/app/results/ResultsPageClient.tsx`
- Modify: share modal component if separate, likely under `client/src/components/`
- Modify: PDF/share helpers if needed.
- Possibly modify: `client/src/lib/analytics.ts` only if new events are added.
- Create or extend: `client/scripts/audit-result-conversion-friction.mjs`
- Create: `client/docs/result-conversion-friction.md`

**Subphase 4A — “Your result in 30 seconds” block**

Add a compact top block before deep accordions:

- Your best-fit pattern
- Best-fit environment
- Watch-out
- Try this next

This must use existing result data where possible. Do not create another giant copy system unless absolutely necessary.

**Subphase 4B — Role-first usefulness card**

Make the role card answer:

- Best-fit role family
- Starter path
- Stretch direction
- Why it fits
- What could be wrong
- First experiment

**Subphase 4C — Simplify share/save modal**

Recommended hierarchy:

1. Primary: `Share result card`
2. Secondary: `Save PDF`
3. Lower weight: `Copy link/text`
4. Optional or hidden under More: email/text/social variants

The modal should not feel like an airplane cockpit designed by a committee with caffeine poisoning.

**Subphase 4D — One strong post-result CTA**

Pick one primary conversion action:

- `Send this result to yourself`, or
- `Compare with a friend`, or
- `Save your role map`.

My recommendation: **Send this result to yourself** because it is lower-friction and supports returning users.

**Analytics events:**

Track only aggregate event names:

- `kyr_result_summary_cta_clicked`
- `kyr_role_experiment_clicked`
- `kyr_share_primary_clicked`
- `kyr_pdf_save_clicked`

No raw answers, email addresses, or result payloads in analytics metadata.

**Mobile QA:**

Verify on:

- 375 × 812 iPhone 13 mini baseline
- 390 × 844
- 430 × 932
- desktop

Check:

- fixed nav does not cover content,
- share modal fits,
- accordions are readable,
- CTA is visible without hunting,
- horizontal overflow equals 0.

**Verification:**

```bash
cd /home/sim/projects/knowyourole-rebuild/client
node scripts/audit-result-conversion-friction.mjs --markdown docs/result-conversion-friction.md
node scripts/audit-phase5d-analytics-conversion.mjs
npx tsc --noEmit --pretty false
npm run lint -- --pretty false
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cd /home/sim/projects/knowyourole-rebuild
bash scripts/check-runtime.sh
```

Browser verification:

- `/results?test=true&page=1`
- `/results?test=true&page=roles` if route exists
- share modal open/close
- primary share action click
- email/save CTA if implemented
- iPhone 13 mini viewport overflow probe

**Exit criteria:**

- Result comprehension in first 30 seconds is materially better.
- Modal has one dominant primary action.
- No mobile overflow.
- Existing analytics still pass.

---

## Phase 5 — End-to-End Pre-Beta Readiness Gate

**Objective:** Decide whether the site is ready for controlled sharing after the three improvements.

**Files:**
- Create: `client/docs/prebeta-readiness-report.md`
- Use: all audit docs generated above.

**Run full verification:**

```bash
cd /home/sim/projects/knowyourole-rebuild/client
node scripts/audit-prebeta-persona-calibration.mjs --markdown docs/prebeta-persona-calibration.md
node scripts/audit-career-match-usefulness.mjs --markdown docs/career-match-usefulness.md
node scripts/audit-result-conversion-friction.mjs --markdown docs/result-conversion-friction.md
node scripts/audit-phase5d-analytics-conversion.mjs
node scripts/audit-phase4-disc-role-calibration.mjs --markdown docs/phase4-disc-role-calibration.md
node scripts/audit-results-readability.mjs --markdown docs/results-readability-phase-b.md
npx tsc --noEmit --pretty false
npm run lint -- --pretty false
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cd /home/sim/projects/knowyourole-rebuild
bash scripts/check-runtime.sh
```

Browser QA:

- Homepage
- Quiz gateway
- Mood Mixer transition
- Quiz first screen
- Full 45-question completion, at least one persona
- Results page
- Share/save modal
- Mobile iPhone 13 mini viewport

Production readiness only after local approval:

1. Deploy to Vercel.
2. Verify `knowyourole.com`.
3. Verify `/api/results/compute` returns 200.
4. Confirm actual row in `quiz_results`.
5. Verify analytics local sink on production result page.
6. Verify no console errors or horizontal overflow.

**Final decision labels:**

- **Green:** ready for 10–25 private testers.
- **Yellow:** usable internally only; one specific blocker remains.
- **Red:** do not share; result relevance or persistence failed.

---

## Recommended Implementation Order for Sim Approval

### Batch 1 — Measurement harness only

Build the seeded pre-beta persona calibration audit.

Why: safest first step. It tells us what is broken with evidence.

### Batch 2 — DISC and Big Five calibration

Tune scoring using Batch 1 data.

Why: result relevance is the product’s spine.

### Batch 3 — Career-match usefulness

Add role family/starter/stretch/mismatch/experiment structure and seniority guardrails.

Why: career guidance is the memorability and shareability layer.

### Batch 4 — Result-page friction reduction

Add 30-second summary, simplify share/save, strengthen one CTA.

Why: after results become trustworthy, users need to understand and act on them.

### Batch 5 — Full pre-beta QA and deploy decision

Run all audits, browser QA, optional Vercel deploy, and final report.

---

## Risks

- Scoring changes can improve one persona while hurting another; that is why the multi-seed audit comes first.
- Role data changes can become huge; keep the initial pass focused on high-impact fields and seniority guardrails.
- Result-page simplification can accidentally hide useful depth; keep depth in accordions/tabs, but improve the top summary.
- Overfitting to five personas is possible; use them as a launch gate, not as the entire truth.

---

## Non-Goals

Do not do these during this plan:

- no new public pages,
- no ads,
- no fake scientific validation claims,
- no broad redesign,
- no dependency audit fix unless separately approved,
- no commit/push/deploy unless Sim explicitly approves.

---

## My Recommended First Build Step

Start with **Batch 1: Measurement harness only**.

If we do not build the audit first, every later calibration decision is guesswork dressed up as engineering. Build the measuring stick, then fix what it proves is broken.
