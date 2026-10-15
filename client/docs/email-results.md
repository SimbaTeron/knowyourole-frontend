# Optional "Email me my results"

Card lives below the results (`src/components/email/ResultEmailCard.tsx`); results are never gated.

## Flow
1. Neutral "Are you 13 or older?" Yes/No. Nothing shows until answered.
2. **No** → email field hidden; "Ask a parent or teacher to email it" + Copy results / Print / Download PDF (opens the existing share modal). No request is made, nothing stored.
3. **Yes** → email field + one UNCHECKED "Also send me occasional updates…" box + hidden honeypot.

## Storage decision
- **Send-only (default): nothing is stored.** The address is used in memory to send once. Only hashed rate-limit counters (`email_rate_limits`, keyed HMAC of IP / email, cleared after ~2 days) are written.
- **Updates ticked:** one row in `public.email_requests` (no link to `quiz_results`, no result/session ids). `confirmed_at` stays null until the double opt-in link is clicked; unconfirmed rows are deleted after 7 days (pruned on each new request).
- Confirm / unsubscribe / delete links are **stateless HMAC tokens** over `purpose + email_hash`, so no token is stored (the table keeps `email_hash` instead of an `unsubscribe_token` column). Pages require a button click (POST) so link scanners can't trigger them; `List-Unsubscribe` + `List-Unsubscribe-Post` headers give RFC 8058 one-click unsubscribe via `POST /api/email/unsubscribe?t=…`.
- "Private link back to results": results live in browser storage and can't be reloaded by URL, so the email links to `/my-result?s=…`, a signed, non-indexed snapshot of the summary only (no email, no answers).

## Abuse protection
Email validation (client + server), honeypot (silent fake success), rate limits: 5/hour per IP, 3/day per email (in-memory + Postgres `email_rate_limit_hit`, service-role only).

## Env vars
| Var | Needed | Notes |
|---|---|---|
| `RESEND_API_KEY` | prod | Missing in preview/dev → emails are logged, not sent. Missing in production → API returns 503 and the card shows a friendly fallback. |
| `RESULT_EMAIL_FROM` | prod | e.g. `KnowYouRole <results@mail.knowyourole.com>` (domain verified in Resend) |
| `EMAIL_TOKEN_SECRET` | prod | ≥32 random chars. Signs links. Rotating it invalidates old links. |
| `EMAIL_MAILING_ADDRESS` | prod | Physical mailing address for the footer (CAN-SPAM). Placeholder shown until set. |
| `RESULT_EMAIL_REPLY_TO` | optional | |
| `SUPABASE_SERVICE_ROLE_KEY` | already set | Used for the table + RPC. |

Migration: `supabase/migrations/20261015120000_email_requests.sql`.

The older `/api/results/email-lead` route + `result_email_leads` table belong to the unused legacy `Page1FullPortrait` view and are untouched.
