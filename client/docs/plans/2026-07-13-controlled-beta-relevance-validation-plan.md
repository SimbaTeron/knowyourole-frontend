# Controlled Beta Relevance Validation Plan

> **For Hermes:** Execute only after Sim explicitly approves the relevant batch. Keep this a controlled 15-person study; do not convert it into a public-growth campaign or change scoring based on one loud respondent.

**Goal:** Collect trustworthy, attributable-to-a-result feedback from 15 adults who complete the live 28-question KnowYouRole quiz naturally, then use aggregated evidence to identify and fix the three highest-impact recurring relevance failures.

**Architecture:** Recruit deliberately by life stage, assign a non-identifying participant code, let each participant complete the existing public quiz without answer coaching, and collect structured feedback linked to the persisted quiz session/result. Store only the minimum data needed to analyze usefulness by displayed career direction, MBTI-style output, DISC, confidence, and participant segment. Review aggregate patterns first; use open-text feedback to explain, never replace, the pattern.

**Tech Stack:** Live Next.js app at `https://knowyourole.com`, Supabase `quiz_results` and `feedback`, existing `POST /api/feedback`, `DirectionFeedbackCard.tsx`, controlled-beta analytics events, a short post-result feedback form, and deterministic release audits under `client/scripts/`.

---

## Decision made before recruitment

### Scope: adults only for this first round

Recruit **18+ only**. This includes college students but excludes high-school minors.

**Reason:** The product may eventually serve high-school users, but recruiting minors adds parental consent, school approval, and data-handling complexity. Mixing that into the first 15-person relevance study would produce weaker evidence and needless operational risk. Run a separate, appropriately approved student-minor study later if that audience becomes a priority.

### What this round can prove

- Which displayed directions feel useful, too generic, too senior, narrow, or off-base.
- Which result explanations feel credible to actual users.
- Which segments report recurring mismatches.
- Whether the result page gives enough value for a participant to describe one concrete next step.

### What this round cannot prove

- Clinical validity, psychometric validation, hiring suitability, or diagnostic accuracy.
- Population-level conversion rates or SEO performance.
- That a single role title is objectively correct for a person.

Use the language **“controlled product feedback study”**, not “validated assessment,” “research study,” or “scientific validation.”

---

## Success criteria and stop rules

### Primary success metrics

Use 15 completions as the minimum complete cohort. Do not analyze a partial cohort as final evidence.

1. **Usefulness:** at least 11/15 (73%) select `Very useful` for work direction.
2. **Direction relevance:** at least 12/15 (80%) describe the direction as relevant or mostly relevant.
3. **No recurring severe defect:** no repeated severe mismatch affecting 2+ participants with the same direction, role family, or result pattern.
4. **Role seniority:** no more than 1/15 reports that the visible role example is implausibly senior without accepting the broader direction.
5. **Comprehension:** at least 12/15 can name one clear strength, likely work environment, or next experiment after reading the result.
6. **Data completeness:** 15/15 have a participant code, quiz session/result linkage, segment, displayed output dimensions, core rating, and text rationale.

### Severity rubric

- **Severe:** participant says the central work direction or identity is wrong, harmful, absurdly senior, or unrelated to their preferences; they cannot identify any useful next action.
- **Moderate:** direction is plausible but generic, role examples are poor, or important nuance is missing.
- **Minor:** copy, terminology, layout, or preference-level criticism without rejecting the core direction.

### Stop rule

If the first 5 participants produce the same severe mismatch twice, pause recruitment, inspect that result family, and decide whether to patch before continuing. Do not knowingly collect 10 more versions of the same failure for the aesthetics of a sample size.

---

## Cohort design

Assign each person one **primary segment** at recruitment, even if they could fit more than one.

| Segment | Target | Eligibility definition | Why it matters |
|---|---:|---|---|
| College students | 4 | Age 18+, currently in college/trade school or graduating within 12 months | Tests exploration, starter-path, and clarity language |
| Early-career adults | 4 | 0–3 years into first post-education role | Tests job-fit translation without senior-title fantasy |
| Career-switchers | 4 | Actively considering or pursuing a move into a different field/role | Tests whether direction helps an actual decision |
| Established working adults | 3 | 5+ years of work experience and not primarily in another segment | Tests relevance beyond entry-level assumptions |

### Balance targets

- Aim for at least 6 participants who do not personally know Sim.
- Aim for at least 5 participants whose current work is not technology/design/startup work.
- Do not screen people by presumed personality type, desired career, race, gender, health, politics, or income.
- Record only age band (`18–24`, `25–34`, `35–44`, `45+`) if needed for analysis; do not collect date of birth.

---

## Recruitment channel plan

### Channel priority

1. **Warm, individually invited network — 5 seats**
   - Highest completion rate and best operational control.
   - Invite people who fit the four target segments; do not select only people likely to flatter the product.
   - Use one-to-one invitations, not a broadcast that pressures friends.

2. **LinkedIn — 4–6 seats**
   - Best for early-career adults, switchers, and working professionals.
   - Publish one transparent volunteer post from a personal profile.
   - Send tightly targeted individual invitations only after a person expresses interest; do not mass-DM strangers.
   - Useful communities: alumni networks, professional associations, career-change communities, local professional groups.

3. **College/trade-school organizations — 3–4 seats**
   - Ask a student club leader, career center contact, alumni group, or professor to share a short invitation.
   - This is materially better than spamming student forums with a survey link.
   - Restrict to adults 18+ for this round.

4. **Reddit and Discord/Slack communities — 2–4 seats**
   - Use only communities that explicitly permit feedback requests, surveys, or self-promotion.
   - Before posting, check each community’s current rules and request moderator approval if rules are unclear.
   - Candidate Reddit communities to evaluate immediately before outreach: `r/SampleSize` (paid adult survey recruitment), `r/betatests` (product beta testers), `r/AlphaAndBetaUsers` (structured product feedback), `r/findapath` (career-change relevance; moderator approval required), and `r/careerguidance` (career relevance; moderator approval required). The first three are likely to skew technically savvy; the last two are closer to the target use case but commonly restrict self-promotion. Do not treat this list as permission to post.
   - Good *categories* to investigate beyond Reddit: career-change, college-career, work-advice, and city/professional communities. Do not assume a named community permits recruitment because rules change frequently.
   - Make one transparent post per approved community; do not cross-post identical promotional copy everywhere.

5. **Paid panel fallback — only if needed**
   - If the cohort is not filled within 10 days, recruit the remaining seats through Prolific or User Interviews with explicit adult segment screeners and a fixed incentive.
   - Do not use a generic low-cost click farm. It produces fast answers, not relevant evidence.

### Recommended incentive

Offer **$15 digital gift card or equivalent** for a completed quiz plus feedback review taking approximately 12–15 minutes.

- Pay for completion, not for positive feedback.
- State that candid criticism is valuable and expected.
- Do not make payment conditional on sharing, providing an email, or granting marketing permission.

### LinkedIn post copy

> I’m running a small private beta of KnowYouRole, a 28-question personality and work-style quiz that turns Big Five, MBTI-style, and DISC signals into a practical work-direction result.
>
> I’m looking for 15 adults across college, early career, career change, and established work. You’ll take the quiz naturally, review your result, and give candid feedback on whether the direction feels useful, too generic, or off-base. It takes about 12–15 minutes. Participants receive a $15 thank-you gift card.
>
> This is product feedback, not a clinical assessment or a hiring tool. I especially want honest criticism. Comment or message me if you are interested, and I’ll send the short eligibility form.

### Reddit/Discord post copy

> Moderator-approved feedback request: I’m testing a new 28-question personality/work-style quiz and need a small number of adult volunteers for candid product feedback. It is free, takes about 12–15 minutes, and includes a $15 thank-you for completed feedback. This is not a clinical test or career guarantee. I’m specifically trying to learn where the work-direction result feels useful, generic, too senior, or wrong. Reply or use the eligibility form if this community permits it.

### Invitation guardrails

- Never promise a participant a “correct” career answer.
- Never coach them toward answer choices, a personality type, or a career direction.
- Do not ask for raw quiz answers by message.
- Do not use their result, quote, name, image, or employer publicly without a separate explicit written release.

---

## Participant flow

### Step 1: eligibility and allocation

Use a short form or a manually managed intake sheet with:

- preferred first name or pseudonym
- contact method for logistics/payment only
- confirmation of age 18+
- primary segment
- age band (optional)
- current work/study situation (one sentence, optional)
- confirmation that they can complete the quiz in one sitting
- consent to participate in product feedback

Assign a code immediately: `CB-001` through `CB-015`.

Keep contact/payment data in a separate private tracker from analysis data. The analysis sheet uses the participant code only.

### Step 2: participant instructions

Send the same instructions to every participant:

> Please take the quiz once, alone, and answer based on how you usually are—not who you want the result to say you are. There are no right answers. Do not ask us how to answer or retake it to chase a different result. Once your result appears, spend at least two minutes reading the main result and Role Fit section before completing the feedback form. We want candid feedback, including “this missed.”

Include:

- quiz URL: `https://knowyourole.com/quiz?beta=CB-001`
- a short unique participant code
- support contact for technical failure only
- no pre-result explanation of Big Five, MBTI-style, DISC, or likely career outputs

### Step 3: completion and result review

Participant completes the real 28-question quiz once.

Required review path:

1. Read Instant Portrait/main result.
2. Open `Role Fit`.
3. Open at least one of `MBTI-style`, `Big Five`, or `DISC`.
4. Submit the compact in-result usefulness check-in.
5. Open the linked structured beta feedback form.

### Step 4: structured feedback form

The final form must be short enough to complete: target 4–6 minutes. Required questions:

1. **Overall work-direction usefulness**
   - Very useful / Somewhat useful / Not useful
2. **Does the work direction feel relevant to you?**
   - Yes, strongly / Mostly / A little / No
3. **What was most accurate?**
   - Free text, max 500 characters
4. **What felt wrong, generic, or missing?**
   - Free text, max 500 characters
5. **Did any role example feel implausibly senior, narrow, or off-base?**
   - No / Yes — too senior / Yes — too narrow / Yes — off-base / Other
   - Conditional free-text detail
6. **After reading the result, what is one work or career experiment you would consider?**
   - Free text; this is the comprehension/actionability check
7. **How clear were the results?**
   - 1–5
8. **Did you encounter a bug, confusing step, or layout issue?**
   - Optional text
9. **May we contact you for one 10-minute follow-up?**
   - Yes / No

Do **not** request raw answers, sensitive health data, or a public testimonial.

### Step 5: optional 10-minute follow-up interview

Invite only participants with a severe or especially informative moderate mismatch. Use a consistent prompt:

- “Walk me through the moment the result stopped feeling like you.”
- “Which wording or example caused that reaction?”
- “What alternative direction would have felt more useful, and why?”
- “Was the problem the quiz answer options, the result interpretation, the role example, or the missing context?”

Record notes by participant code. Do not record calls by default.

---

## Implementation plan: make collection analyzable before recruiting

### Task 1: audit the existing beta feedback path

**Objective:** Confirm exactly what the existing result-page card captures and where it lands.

**Files:**
- Inspect: `client/src/components/results/DirectionFeedbackCard.tsx`
- Inspect: `client/src/app/api/feedback/route.ts`
- Inspect: `supabase/migrations/001_initial_schema.sql`
- Inspect: `supabase/migrations/002_add_feedback_columns.sql`
- Test: `client/scripts/audit-controlled-beta-feedback.cjs`

**Steps:**
1. Run `node scripts/audit-controlled-beta-feedback.cjs` from `client/`.
2. Confirm the result card currently sends `session_id`, career relevance, direction title, MBTI type, DISC style, optional note, and beta quiz type.
3. Compare required study fields to actual Supabase `feedback` columns.
4. Write a field map in `client/docs/controlled-beta-field-map.md` before modifying code.

**Exit criteria:** The team can state exactly how a participant result is linked to one feedback row without using contact information as the join key.

### Task 2: define the controlled-beta data contract

**Objective:** Add only the fields required to answer the study questions.

**Files:**
- Create: `supabase/migrations/005_controlled_beta_feedback_fields.sql`
- Modify: `client/src/app/api/feedback/route.ts`
- Create: `client/src/lib/controlledBeta.ts`
- Test: `client/scripts/audit-controlled-beta-feedback.cjs`

**Required persisted fields:**

```ts
type ControlledBetaFeedback = {
  participantCode: string; // CB-001..CB-015; not a name/email
  participantSegment: "college" | "early_career" | "career_switcher" | "established";
  directionRelevance: 1 | 2 | 3 | 4;
  mostAccurate: string | null;
  feltWrongOrMissing: string | null;
  roleExampleIssue: "none" | "too_senior" | "too_narrow" | "off_base" | "other" | null;
  roleExampleIssueDetail: string | null;
  nextExperiment: string | null;
  clarityRating: 1 | 2 | 3 | 4 | 5 | null;
  betaCohort: "controlled-15-2026-07";
};
```

**Constraints:**

- Validate participant-code format server-side: `^CB-(00[1-9]|0[1-9][0-9]|1[0-5])$`.
- Accept only the four defined segments.
- Enforce maximum text length of 500 characters for each response field.
- Rate-limit repeated submissions for the same session/code pair if the existing API layer supports it; otherwise use a unique database constraint on `(session_id, participant_code, beta_cohort)`.
- Do not permit public feedback reads. Preserve existing RLS posture.

**Test-first steps:**
1. Add a script-level test fixture for a valid payload and each invalid enum/code/length case.
2. Run it and confirm failures before changing the route.
3. Add validation and parameterized insert mapping in the API route.
4. Run tests, TypeScript, and the existing controlled-beta regression script.

**Exit criteria:** One valid request persists; malformed participant code, invalid segment, overlong text, and duplicate submission are rejected predictably.

### Task 3: replace the optional-note-only beta card with a short structured form

**Objective:** Capture the required evidence immediately after the result, without turning the reward moment into a survey wall.

**Files:**
- Modify: `client/src/components/results/DirectionFeedbackCard.tsx`
- Modify: `client/src/app/results/ResultsPageClient.tsx` only if new result/session props are needed
- Modify: `client/src/lib/analytics.ts` only for aggregate-safe events
- Test: `client/scripts/audit-controlled-beta-feedback.cjs`

**Interaction design:**

1. Retain the three-button usefulness choice as the first tap.
2. After selection, reveal only four compact follow-ups:
   - relevance (four choices)
   - most accurate (optional short text)
   - wrong/generic/missing (optional short text)
   - role-example issue (single choice; conditional detail)
3. Put the `next experiment` and `clarity rating` in the linked final form, not the result page.
4. Label the card `Private beta check-in`; state: “Candid criticism is useful. This does not change your result.”
5. Preserve a skip option. Do not gate result details, sharing, or navigation.

**Analytics:**

Track only aggregate-safe events:

- `controlled_beta_feedback_prompted`
- `controlled_beta_feedback_started`
- `controlled_beta_feedback_submitted`
- `controlled_beta_feedback_skipped`

Allowed parameters: `participant_segment`, `mbti_type`, `primary_disc`, `direction_title`, rating categories, and `has_open_text`. Never send participant code, session ID, raw text, email, or raw quiz answers to analytics.

**Exit criteria:** At 375px width, the card does not create horizontal overflow, all controls have 44px minimum touch height, and a participant can submit in under two minutes.

### Task 4: provide a linked final feedback form and completion confirmation

**Objective:** Collect the remaining fields after the participant has absorbed the result.

**Files:**
- Create: `client/src/app/beta-feedback/page.tsx`
- Create: `client/src/app/beta-feedback/layout.tsx`
- Modify: `client/src/components/results/DirectionFeedbackCard.tsx` to link with participant code/session through a signed or server-associated mechanism
- Test: `client/scripts/audit-controlled-beta-feedback.cjs`

**Route rules:**

- `beta-feedback` must be `noindex, nofollow`.
- Prefill only participant code/segment/session linkage from trusted session state or a signed short-lived token; do not place a raw session ID in a shareable URL.
- Show the remaining study questions and a completion page that tells the participant how to claim their incentive without making their answers public.
- Never use the generic legacy `/feedback` page as the primary controlled-study form; it is too long and captures unrelated legacy product fields.

**Exit criteria:** A participant can complete the short post-result form, see confirmation, and the code/session linkage survives a normal route transition.

### Task 5: create the analysis export and acceptance report

**Objective:** Convert 15 feedback rows into a decision, not a spreadsheet cemetery.

**Files:**
- Create: `client/scripts/audit-controlled-beta-cohort.cjs`
- Create: `client/docs/controlled-beta-analysis-template.md`
- Optionally modify: `client/src/app/api/export/sheets/full/route.ts` only if a restricted admin export is safer than direct Supabase access

**Required report cuts:**

- cohort completion count by participant segment
- usefulness distribution
- direction relevance distribution
- severe/moderate/minor issue counts
- role-example issue counts
- rating and issue breakdown by:
  - `careerDirection.title`
  - MBTI-style type
  - primary DISC
  - career-confidence bucket
  - participant segment
- every open-text response grouped into issue codes:
  - direction mismatch
  - too senior
  - too narrow
  - generic explanation
  - missing domain/context
  - question ambiguity
  - confusing language
  - UI/technical problem
- three highest-priority failures, ranked by: severity × recurrence × affected decision surface

**Ranking rule:** A single complaint does not trigger scoring changes. A fix candidate requires either two independent participants with the same severe/moderate coded issue, or one severe issue corroborated by deterministic audit evidence.

**Exit criteria:** Running the script produces a markdown report with an explicit verdict: `Green`, `Yellow`, or `Red`, and names at most three proposed fixes.

---

## Fieldwork operations

### Daily operating cadence

- **Day 0:** finish instrumentation and run a one-person internal dry run.
- **Day 1:** publish LinkedIn post; send five warm invitations; contact two student/professional group admins.
- **Day 2–4:** allocate respondents to open quotas, send unique codes, and resolve only technical issues.
- **Day 5:** review the first five for the stop rule; do not tune based on isolated comments.
- **Day 6–10:** fill remaining quotas; send one neutral reminder after 48 hours.
- **Day 11–12:** close enrollment, complete optional follow-ups, pay incentives.
- **Day 13–14:** run analysis, select the top three fixes, and write the cohort report.

### Tracker columns

Maintain a private, access-controlled tracker separate from Supabase product data:

- participant code
- segment
- recruitment source
- invitation date
- consent confirmed
- quiz completed
- beta feedback completed
- follow-up eligible/accepted
- incentive sent
- notes about technical failure only

Do not include raw quiz answers, result text, private feedback text, or payment information in a shareable planning document.

### Incentive operations

- Send incentive after structured feedback is submitted, regardless of rating.
- Keep a payment ledger with participant code, amount, sent date, and method—not their result.
- If using a paid panel, follow the platform’s compensation process rather than collecting payment details yourself.

---

## Analysis and remediation workflow

### Step 1: lock the cohort

Do not alter scoring, question wording, role data, or result copy while the 15-person cohort is still active, except to fix a genuine technical failure that blocks completion. Mixing product versions destroys comparability.

### Step 2: perform blinded first-pass coding

One reviewer codes open-text feedback without seeing the participant’s segment first. This reduces the temptation to invent a story about why a particular group “should” dislike an output.

### Step 3: identify repeated failures

Look for:

1. repeated direction mismatch in the same direction/career-vector pattern;
2. repeated seniority/narrow-title complaints;
3. repeated generic-result complaints despite apparently different result types;
4. a segment-specific failure, such as students receiving adult-seniority language;
5. low clarity paired with a specific interface or explanation issue.

### Step 4: triangulate before changing code

For each candidate failure:

1. inspect the persisted ResultDTO and raw score/career-vector evidence;
2. compare the visible direction, examples, and rationale;
3. reproduce with the nearest deterministic persona audit fixture;
4. decide whether the defect belongs in:
   - question wording/answer signals,
   - score calibration,
   - work-direction pattern order/threshold,
   - role profile/example data,
   - result confidence/uncertainty copy,
   - UI explanation;
5. choose the smallest fix that addresses the evidence.

### Step 5: release only three focused fixes

Examples of valid focused fixes:

- add a direction pattern for a repeatedly missed combination of direct career signals;
- replace a senior title with a starter-safe example while keeping the same direction;
- add confidence/uncertainty explanation for close evidence;
- rewrite one repeated generic rationale to cite the correct direct-career evidence;
- clarify an ambiguous question only if participant feedback and audit behavior converge.

Invalid response:

- rewrite the entire scoring system;
- add more SEO pages;
- change outputs because one participant wanted a different identity label;
- treat career feedback as proof of clinical validity.

### Step 6: verify every remediation

Run at minimum:

```bash
cd /home/sim/projects/knowyourole-rebuild/client
node scripts/audit-result-dto-career-parity.cjs
node scripts/audit-role-direction-personas.cjs
node scripts/audit-shortform-v2-personas.cjs
node scripts/audit-shortform-v2-balance.cjs
node scripts/audit-shortform-v2-questions.cjs
node scripts/audit-work-lane-role-fit.cjs
node scripts/audit-controlled-beta-feedback.cjs
npx tsc --noEmit --pretty false
npm run lint -- --pretty false
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cd ..
git diff --check
```

Then browser-check one practical/emergency persona and one knowledge/strategy persona through real quiz → result → beta feedback submission.

---

## Final decision matrix

### Green: expand to a 25-person round

- 15 complete linked records.
- Usefulness and relevance targets meet or exceed thresholds.
- No recurring severe mismatch.
- Top three fixes are small and have passed deterministic regressions.

### Yellow: fix one focused issue, then recruit a replacement micro-cohort

- 1–2 recurring moderate issues or one fixed, explainable technical failure.
- Hold broad outreach.
- Deploy one focused remediation only after all regression gates pass.
- Recruit 5 replacement testers concentrated in the affected segment/direction.

### Red: do not expand recruitment

- Repeated severe core-direction failures.
- Result/feedback linkage cannot be trusted.
- Participants cannot complete quiz/result/feedback reliably.
- Privacy or persistence behavior is materially inconsistent with participant-facing copy.

---

## Explicit non-goals

- No broad launch, paid acquisition, influencer campaign, or public testimonial campaign during this cohort.
- No public display of individual tester results.
- No real-email result-delivery project unless tester evidence identifies it as a bottleneck.
- No scoring changes before the cohort analysis identifies a repeated, testable problem.
- No recruiting minors in this first controlled study.

---

## Approval checkpoints

1. **Approve instrumentation batch:** Tasks 1–5 and one internal dry run.
2. **Approve recruitment start:** channel copy, incentive, cohort quotas, and the live beta-feedback route verified.
3. **Approve remediation batch:** after the cohort report identifies at most three evidence-backed failures.
4. **Approve any deployment:** only after local regression and browser gates pass.

No commit, push, migration application, recruitment post, payment, or production deployment is authorized by this plan alone.
