# PROJECT.md — KnowYouRole Rebuild

**Version:** 2.0
**Last updated:** 2026-05-01
**Active repo:** `/home/sim/projects/knowyourole-rebuild`
**Active app:** `/home/sim/projects/knowyourole-rebuild/client`

---

## Current truth

KnowYouRole is currently a **Next.js 16 App Router app** served from `client/`.

The old root Express/Replit/Vite runtime is **not active**. It was quarantined to `_archive/` in cleanup Batch 7 and checkpointed in Batch 8.

Canonical local runtime:

```txt
cd /home/sim/projects/knowyourole-rebuild/client
npm run dev
http://localhost:5173
```

Canonical runtime verification:

```txt
cd /home/sim/projects/knowyourole-rebuild
bash scripts/check-runtime.sh
```

Do not trust `localhost:5173` unless the runtime checker confirms the process CWD is under `client/`.

---

## Stack

### App/runtime

- Framework: Next.js 16 App Router
- Language: TypeScript
- Styling: Tailwind CSS + Radix/shadcn-style components
- State: Zustand for dev/runtime toggles where used
- Local active port: `5173`
- Production domain: `ummout.com`
- Deployment target: Vercel project rooted at `client/`

### API

Active API routes live under:

```txt
client/src/app/api/
```

Important active route groups:

```txt
client/src/app/api/quiz/
client/src/app/api/results/
client/src/app/api/premium/
client/src/app/api/feedback/
client/src/app/api/stripe/
client/src/app/api/admin/
client/src/app/api/export/
client/src/app/api/user/
client/src/app/api/traits/
```

Root-level historical API/runtime artifacts are archived only:

```txt
_archive/legacy-runtime/api/
_archive/legacy-runtime/server/
_archive/legacy-runtime/.replit
_archive/legacy-runtime/vite.config.ts
_archive/assets/attached_assets/
```

### Database/persistence

- Primary persistence target: Supabase
- All quiz completions must save to `quiz_results`
- Result persistence path is moving toward the canonical ResultDTO pipeline:

```txt
quiz completion
→ /api/results/compute
→ client/src/lib/results/buildResultDTO.ts
→ Supabase quiz_sessions + quiz_results
→ results UI consumes ResultDTO when available
```

Relevant schema files:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_add_feedback_columns.sql
```

Never expose `.env*` values, API keys, Supabase service-role keys, Stripe secrets, or vault contents.

---

## Folder map

```txt
/home/sim/projects/knowyourole-rebuild/
├── client/                         # ACTIVE Next.js app
│   ├── src/app/                     # App Router pages and API routes
│   │   ├── api/                     # Active server routes
│   │   ├── quiz/                    # Quiz page/client flow
│   │   ├── quiz-gateway/            # Tier gateway
│   │   ├── results/                 # Results pages
│   │   ├── feedback/                # Rich feedback page
│   │   ├── mood-mixer/              # Mood mixer flow
│   │   └── ...                      # Static/product pages
│   ├── src/components/              # UI components
│   ├── src/components/results/      # Results-specific UI/data helpers
│   ├── src/data/                    # Questions, roles, static data
│   ├── src/lib/                     # Shared app utilities
│   ├── src/lib/results/             # Canonical ResultDTO engine
│   └── src/stores/                  # Zustand stores
├── scripts/check-runtime.sh         # Canonical local runtime guard
├── supabase/migrations/             # Supabase schema migrations
├── _archive/                        # Quarantined legacy/root runtime artifacts
├── KnowYouRole/client/              # PROTECTED legacy/reference app; do not touch without Sim approval
├── PROJECT.md                       # Current project truth
└── SKILLS.md                        # Local maintenance workflow notes
```

---

## Protected and archived areas

### Protected legacy reference

Do not modify unless Sim explicitly approves:

```txt
KnowYouRole/client/
```

This folder currently has unrelated dirty changes and is intentionally excluded from cleanup/checkpoint commits.

### Archived legacy runtime

Quarantined, not active:

```txt
_archive/legacy-runtime/api/
_archive/legacy-runtime/server/
_archive/legacy-runtime/.replit
_archive/legacy-runtime/vite.config.ts
_archive/assets/attached_assets/
```

Keep archived files for reference until Sim approves hard deletion or external backup.

---

## Active quiz/results flow

Expected product flow:

```txt
/                  # home CTAs route to quiz gateway
/quiz-gateway      # active tier selection only
/mood-mixer        # mood setup before quiz where applicable
/quiz              # active quiz
/results           # 3 results pages after completion
```

“Results pages” means only these three pages after quiz completion:

```txt
Page 1: Quick Glimpse
Page 2: Full Portrait
Page 3: Premium Nexus
```

Do not confuse results pages with home preview cards, quiz questions, mood mixer, or gateway.

Active tier copy should not include Kids/7-12 in runtime UI.

---

## Verification commands

Run from repo root unless noted.

```txt
cd /home/sim/projects/knowyourole-rebuild/client
npx tsc --noEmit --pretty false
npm run lint -- --pretty false
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

Runtime:

```txt
cd /home/sim/projects/knowyourole-rebuild
bash scripts/check-runtime.sh
```

Git hygiene before committing:

```txt
git status --short
git diff --check
git diff --cached --name-only | sort
git diff --cached --check
```

Avoid broad `git add -A` at repo root because protected and unrelated dirty files often exist.

---

## Cleanup checkpoints

Recent focused commits:

```txt
86875dc0 chore: checkpoint cleanup and API hardening
b19a2b54 chore: quarantine legacy runtime artifacts
0e1eb8b5 feat: checkpoint results engine and feedback flow
```

Batch status:

- Batch 1: TypeScript/lint/build baseline fixed.
- Batch 2: safe dormant/generated artifacts removed.
- Batch 3: admin/feedback security lockdown.
- Batch 4: API hardening/CORS/export/smoke protections.
- Batch 5: checkpoint commit.
- Batch 6: audit/classification only.
- Batch 7: root legacy runtime artifacts quarantined to `_archive/`.
- Batch 8: quarantine checkpoint commit.
- Batch 9: ResultDTO/results engine + feedback flow checkpoint commit.
- Batch 10: docs truth cleanup replacing stale root docs and removing `Engineering_MEMORY.md`.

---

## Known remaining cleanup areas

Do not batch these together blindly; keep Sim-approved focused batches.

1. Active UI/tier/layout dirty files under `client/src/app`, `client/src/components`, and `client/src/stores`.
2. Generated `client/next-env.d.ts` drift.
3. Protected legacy dirty state under `KnowYouRole/client/`.
4. Decide final fate of `client/vite.config.ts` and pure Vite local shim after Next-only runtime is confirmed.
5. Decide final fate of `_archive/` after backup/confirmation.
6. Security follow-up: wildcard CORS remains on some individual public routes; premium bypass/auth/payment gates need dedicated review.
7. Refactor large files gradually: `ResultsPageClient.tsx`, `Quiz.tsx`, `MoodMixer.tsx`, `PremiumCardDeck.tsx`, `questions.json`, `resultsData.ts`.

---

## Rules for future work

- Work in explicit Sim-approved batches.
- Complete, verify, summarize, then recommend exactly one next batch.
- Do not modify `KnowYouRole/client/` without explicit approval.
- Do not expose secrets from env files or `lockandkey.md`.
- Prefer focused commits with reviewed staged file lists.
- When changing quiz completion, verify Supabase `quiz_results` persistence.
- When changing quiz tier/flow, run `scripts/check-runtime.sh`.
- When changing results data/scoring, verify both real quiz completion and dev randomize flow where relevant.
