#!/usr/bin/env bash
# Rebuild a working checkout after a box wipe, then optionally start a safe local server.
# Safe to rerun. Never points at the hosted Supabase project.
#
# Usage (from any worktree):
#   client/scripts/box-bootstrap.sh            # npm ci + playwright browsers
#   client/scripts/box-bootstrap.sh --serve    # ...then build and serve on :3100 (dead DB)
#   PORT=3200 client/scripts/box-bootstrap.sh --serve
set -euo pipefail

CLIENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3100}"
cd "$CLIENT_DIR"
echo "== checkout: $(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD) in $CLIENT_DIR"

# Dead database address: anything that tries to reach Supabase fails fast.
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9
export NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-offline-key
export SUPABASE_SERVICE_ROLE_KEY=
unset KYR_ALLOW_REAL_DB || true

if [ -f .env.local ] && grep -Eq 'supabase\.(co|com)' .env.local; then
  echo "WARNING: .env.local names a hosted Supabase project. Next.js loads it, and the DB guard will refuse to start."
  echo "         Rename it (mv .env.local .env.local.disabled) for box work."
fi

echo "== npm ci"
npm ci --no-audit --no-fund
echo "== playwright chromium"
npx playwright install chromium

if [ "${1:-}" = "--serve" ]; then
  echo "== build + serve on :$PORT (dead DB)"
  fuser -k "$PORT/tcp" 2>/dev/null || true
  npm run build
  if grep -rqE '[a-z0-9]{20}\.supabase\.co' .next/static 2>/dev/null; then
    echo "ABORT: hosted Supabase URL found in the client bundle"; exit 1
  fi
  nohup npx next start -p "$PORT" > "/tmp/kyr-$PORT.log" 2>&1 &
  echo "started pid $! (log /tmp/kyr-$PORT.log)"
fi
echo "== done"
