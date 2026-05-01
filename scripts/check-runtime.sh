#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-5173}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CANONICAL_APP="$REPO_ROOT/client"

fail() {
  echo "❌ $*" >&2
  exit 1
}

ok() {
  echo "✅ $*"
}

info() {
  echo "ℹ️  $*"
}

info "Repo root: $REPO_ROOT"
info "Canonical app: $CANONICAL_APP"
info "Checking localhost:$PORT"

[[ -d "$CANONICAL_APP" ]] || fail "Canonical app directory missing: $CANONICAL_APP"
[[ -f "$CANONICAL_APP/package.json" ]] || fail "Canonical app package.json missing"

LISTEN_LINE="$(ss -ltnp 2>/dev/null | grep ":$PORT " | head -1 || true)"
[[ -n "$LISTEN_LINE" ]] || fail "No process is listening on port $PORT"

PID="$(printf '%s\n' "$LISTEN_LINE" | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p' | head -1)"
[[ -n "$PID" ]] || fail "Could not determine PID for port $PORT: $LISTEN_LINE"

CMDLINE="$(tr '\0' ' ' < "/proc/$PID/cmdline" 2>/dev/null || true)"
CWD="$(readlink -f "/proc/$PID/cwd" 2>/dev/null || true)"

info "PID: $PID"
info "CWD: ${CWD:-unknown}"
info "CMD: ${CMDLINE:-unknown}"

case "$CWD" in
  "$CANONICAL_APP"|"$CANONICAL_APP"/*)
    ok "Port $PORT process is running from canonical app"
    ;;
  *)
    fail "Port $PORT is NOT running from canonical app. Expected cwd under $CANONICAL_APP, got ${CWD:-unknown}"
    ;;
esac

HOME_STATUS="$(curl --max-time 10 -sS -o /tmp/kyr-runtime-home.html -w '%{http_code}' "http://localhost:$PORT/" || true)"
[[ "$HOME_STATUS" == "200" ]] || fail "GET / returned HTTP $HOME_STATUS"
ok "GET / returned HTTP 200"

if grep -q 'href="/quiz"' /tmp/kyr-runtime-home.html; then
  fail "Home page still contains direct /quiz links; quiz entry should go through /quiz-gateway"
fi
if ! grep -q 'href="/quiz-gateway"' /tmp/kyr-runtime-home.html; then
  fail "Home page is missing /quiz-gateway quiz entry links"
fi
ok "Home quiz entry links route through /quiz-gateway"

GATEWAY_STATUS="$(curl --max-time 10 -sS -o /tmp/kyr-runtime-gateway.html -w '%{http_code}' "http://localhost:$PORT/quiz-gateway" || true)"
[[ "$GATEWAY_STATUS" == "200" ]] || fail "GET /quiz-gateway returned HTTP $GATEWAY_STATUS"
ok "GET /quiz-gateway returned HTTP 200"

for label in 'Adults (25+)' 'Young Adults (18-25)' 'Teens (13-17)'; do
  if ! grep -q "$label" /tmp/kyr-runtime-gateway.html; then
    fail "Rendered /quiz-gateway is missing expected tier: $label"
  fi
done
ok "Rendered /quiz-gateway contains the 3 active tiers"

if grep -qiE 'Kids|Mini Explorer|7-12|12 & under|12 and under' /tmp/kyr-runtime-gateway.html; then
  fail "Rendered /quiz-gateway still contains Kids/7-12 copy"
fi
ok "Rendered /quiz-gateway has no Kids/7-12 copy"

STATUS="$(curl --max-time 10 -sS -o /tmp/kyr-runtime-check.html -w '%{http_code}' "http://localhost:$PORT/quiz" || true)"
[[ "$STATUS" == "200" ]] || fail "GET /quiz returned HTTP $STATUS"
ok "GET /quiz returned HTTP 200"

if grep -qiE 'Kids|Mini Explorer|7-12|12 & under|12 and under' /tmp/kyr-runtime-check.html; then
  fail "Rendered /quiz HTML still contains Kids/7-12 copy"
fi
ok "Rendered /quiz HTML has no Kids/7-12 copy"

if grep -qiE 'Teens|13-18|13-17' /tmp/kyr-runtime-check.html; then
  ok "Rendered /quiz HTML contains active teen tier copy"
else
  info "Teen tier copy not found in initial HTML; verify in browser if route is client-rendered"
fi

ok "Runtime check passed"
