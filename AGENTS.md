# AGENTS.md

Short on purpose. Anything that can be a check should be a check, not a line here.

- **App:** Next.js in `client/`. Verify with `cd client && npm run lint && npm run test:unit && npm run build`. CI runs the same.
- **One task, one worktree.** Never share a checkout between parallel agents:
  ```bash
  cd /workspace/kyr && git fetch origin
  git worktree add -b <branch> /workspace/wt/<branch> origin/main   # new branch
  git worktree add /workspace/wt/<branch> <branch>                  # existing branch
  # done (after merge or abandon):
  git worktree remove /workspace/wt/<branch>
  ```
  Use `/` → `-` in the folder name (`feat/x` → `/workspace/wt/feat-x`).
- **After a box wipe:** `client/scripts/box-bootstrap.sh` (add `--serve` for a local server on :3100, `PORT=` to change it).
- **Database:** dev, CI, box servers and previews must not use the hosted Supabase project. `src/lib/env/dbGuard.mjs` enforces this. The only override is `KYR_ALLOW_REAL_DB=1`, and only with the owner's OK.
- **Tests:** no `Math.random` in tests. Use a seeded RNG (see `makeRng` in `tests/unit/personaHarness.test.mjs`).
- **Result copy** is built only in `buildResultView` (`client/src/lib/results/resultViewModel.ts`). Pages render that object.
- **Never merge PRs or change production data without the owner's explicit approval.**
