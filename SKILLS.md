# SKILLS.md — KnowYouRole Local Maintenance Notes

**Version:** 2.0
**Last updated:** 2026-05-01

This file is a project-local operating note for `/home/sim/projects/knowyourole-rebuild`.

The durable Hermes skill source of truth is:

```txt
knowyourole-project-operations
```

Load that skill before KnowYouRole development, cleanup, deployment, QA, Supabase, quiz/results, or Vercel work.

---

## Core operating mode

Sim prefers cleanup/refactor work in explicit approved batches:

```txt
1. Audit/classify scope.
2. Make only approved changes.
3. Verify TypeScript/lint/runtime/build where relevant.
4. Review git status/staged files.
5. Commit only focused scope when approved.
6. Summarize concisely.
7. Recommend exactly one next batch.
8. Wait for approval.
```

Do not broad-commit the repo. Dirty protected/unrelated files are common.

---

## Active project facts

```txt
Repo:       /home/sim/projects/knowyourole-rebuild
Active app: /home/sim/projects/knowyourole-rebuild/client
Runtime:    Next.js 16 App Router
Local URL:  http://localhost:5173
Prod URL:   https://ummout.com
API root:   client/src/app/api/
```

Archived/non-active root runtime:

```txt
_archive/legacy-runtime/api/
_archive/legacy-runtime/server/
_archive/legacy-runtime/.replit
_archive/legacy-runtime/vite.config.ts
_archive/assets/attached_assets/
```

Protected legacy reference:

```txt
KnowYouRole/client/
```

Never touch protected legacy without explicit Sim approval.

---

## Standard verification

From `client/`:

```txt
npx tsc --noEmit --pretty false
npm run lint -- --pretty false
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

From repo root:

```txt
bash scripts/check-runtime.sh
git diff --check
git diff --cached --check
```

Runtime checker validates:

```txt
- localhost:5173 is running
- process CWD is under client/
- / returns HTTP 200
- home quiz CTAs route through /quiz-gateway
- /quiz-gateway returns HTTP 200
- active tier copy is present
- Kids/7-12 copy is absent
- /quiz returns HTTP 200
```

---

## Safe git workflow

Before staging:

```txt
git status --short
git diff --stat
```

Stage explicit paths only:

```txt
git add -- path/one path/two
```

Never use broad root staging unless the repo has been proven clean:

```txt
git add -A   # avoid by default
```

Before commit:

```txt
git diff --cached --name-status | sort
git diff --cached --stat
git diff --cached --check
```

Guard against accidentally staging:

```txt
KnowYouRole/client/
Engineering_MEMORY.md unless the batch explicitly handles it
.env*
client/.next/
node_modules/
```

---

## Common task playbooks

### Cleanup/refactor batch

1. Load `knowyourole-project-operations`.
2. Read `references/cleanup-audit-2026-05-01.md`.
3. Confirm active app path and current git status.
4. Modify only approved scope.
5. Run verification appropriate to scope.
6. Commit only approved files.
7. Update the cleanup audit reference if the result changes future workflow.

### API route work

Active route files are under:

```txt
client/src/app/api/
```

Do not create or edit root `api/` for active behavior; root API is archived under `_archive/`.

For admin/sensitive routes, use:

```txt
client/src/app/api/_lib/admin-guard.ts
```

Public feedback POST can remain public; admin GETs/exports/seeds must stay guarded.

### Quiz/results work

Important files:

```txt
client/src/app/quiz/QuizPageClient.tsx
client/src/app/results/ResultsPageClient.tsx
client/src/components/Quiz.tsx
client/src/components/results/resultsData.ts
client/src/lib/results/buildResultDTO.ts
client/src/app/api/results/compute/route.ts
```

Rules:

- All quiz completions must persist to Supabase `quiz_results`.
- ResultDTO is the canonical target shape.
- Keep legacy fallback paths until real quiz and dev randomize are both verified.
- “Results pages” means only Page 1, Page 2, Page 3 after quiz completion.

### Feedback work

Important files:

```txt
client/src/app/feedback/page.tsx
client/src/app/api/feedback/route.ts
supabase/migrations/002_add_feedback_columns.sql
```

`POST /api/feedback` is public. `GET /api/feedback` must stay admin-protected.

### Deployment work

Use the Vercel workflow skill if deploying.

Before deploy:

```txt
cd client
npx tsc --noEmit --pretty false
npm run lint -- --pretty false
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cd ..
bash scripts/check-runtime.sh
```

Then verify production directly at `ummout.com` after deploy.

---

## Current cleanup state

Recent focused commits:

```txt
86875dc0 chore: checkpoint cleanup and API hardening
b19a2b54 chore: quarantine legacy runtime artifacts
0e1eb8b5 feat: checkpoint results engine and feedback flow
```

As of this docs refresh:

- Root Express/Replit/API artifacts are archived.
- Results Engine/ResultDTO checkpoint is committed.
- Feedback page/migration is committed.
- Runtime checker is committed.
- `Engineering_MEMORY.md` is removed in favor of current `PROJECT.md`, `SKILLS.md`, and Hermes skill references.

Remaining likely batches:

1. Active UI/tier/layout dirty files checkpoint or cleanup.
2. Protected legacy `KnowYouRole/client/` decision.
3. Archive/Vite finalization decision.
4. Security/premium hardening pass.
5. Large component refactor pass.

---

## Communication format

Sim prefers concise, direct technical reports:

```txt
- What changed
- Verification
- What was intentionally excluded
- Commit hash if committed
- One recommended next action
```

No fluff. Sarcasm is allowed when the repo deserves it, which it often does.
