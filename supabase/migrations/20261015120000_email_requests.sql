-- Optional "Email me my results" feature.
-- Separate from quiz_results on purpose: no foreign keys, no result/session ids.
-- Only people who ticked "occasional updates" get a row. One-time sends store nothing
-- (only hashed, short-lived rate-limit counters).

create table if not exists public.email_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 6 and 254),
  -- HMAC-SHA256 of the normalized email (server secret). Lookup key for
  -- confirm / unsubscribe / delete links, which are stateless signed tokens,
  -- so no unsubscribe token itself is stored.
  email_hash text not null unique check (email_hash ~ '^[a-f0-9]{64}$'),
  send_only boolean not null default false,
  updates boolean not null default false,
  age_gate_passed boolean not null check (age_gate_passed = true),
  consent_text_version text not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

create index if not exists email_requests_unconfirmed_idx
  on public.email_requests (created_at) where confirmed_at is null;

alter table public.email_requests enable row level security;
alter table public.email_requests force row level security;
-- No policies: anon/authenticated can do nothing. Server routes use the service role.
revoke all on table public.email_requests from anon, authenticated;

create table if not exists public.email_rate_limits (
  bucket text not null check (char_length(bucket) <= 80),
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, window_start)
);

alter table public.email_rate_limits enable row level security;
alter table public.email_rate_limits force row level security;
revoke all on table public.email_rate_limits from anon, authenticated;

create or replace function public.email_rate_limit_hit(p_bucket text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n integer;
begin
  insert into public.email_rate_limits as r (bucket, window_start, hits)
  values (p_bucket, w, 1)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning hits into n;
  delete from public.email_rate_limits where window_start < now() - interval '2 days';
  return n <= p_max;
end;
$$;

revoke all on function public.email_rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.email_rate_limit_hit(text, integer, integer) to service_role;
