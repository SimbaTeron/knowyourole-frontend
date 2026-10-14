-- Phase 7: identity ownership, account erasure, and 30-day anonymous retention.
-- This migration is deliberately self-contained for the privacy tables it uses.
BEGIN;

CREATE TABLE IF NOT EXISTS public.user_privacy_preferences (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  data_collection BOOLEAN NOT NULL DEFAULT TRUE,
  analytics BOOLEAN NOT NULL DEFAULT TRUE,
  marketing BOOLEAN NOT NULL DEFAULT FALSE,
  data_retention TEXT NOT NULL DEFAULT 'active',
  ccpa_opt_out BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (data_retention IN ('active', '30days', '90days', 'deleted'))
);

CREATE TABLE IF NOT EXISTS public.result_email_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL,
  session_id UUID NULL,
  result_id UUID NULL,
  mbti_type TEXT NULL,
  disc_style TEXT NULL,
  primary_role_title TEXT NULL,
  source TEXT NOT NULL DEFAULT 'results_page',
  consent_result_summary BOOLEAN NOT NULL DEFAULT TRUE,
  consent_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_requested BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_status TEXT NOT NULL DEFAULT 'not_sent',
  user_agent TEXT NULL,
  referrer TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT result_email_leads_normalized_email_check CHECK (normalized_email = lower(trim(email))),
  CONSTRAINT result_email_leads_delivery_status_check CHECK (delivery_status IN ('not_sent', 'queued', 'sent', 'failed'))
);
ALTER TABLE public.result_email_leads ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS feedback_session_id_idx ON public.feedback (session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS result_email_leads_user_id_idx ON public.result_email_leads (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS result_email_leads_session_id_idx ON public.result_email_leads (session_id);
CREATE INDEX IF NOT EXISTS quiz_sessions_anonymous_created_at_idx ON public.quiz_sessions (created_at) WHERE user_id IS NULL;

CREATE TABLE IF NOT EXISTS public.anonymous_result_capabilities (
  session_id TEXT PRIMARY KEY REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS anonymous_result_capabilities_expires_at_idx ON public.anonymous_result_capabilities (expires_at);
ALTER TABLE public.anonymous_result_capabilities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.anonymous_result_capabilities FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.delete_account_data(p_user_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owned_session_ids TEXT[];
BEGIN
  SELECT COALESCE(array_agg(id), ARRAY[]::TEXT[]) INTO owned_session_ids FROM quiz_sessions WHERE user_id = p_user_id;
  DELETE FROM result_email_leads WHERE user_id = p_user_id OR session_id::TEXT = ANY(owned_session_ids);
  DELETE FROM feedback WHERE user_id = p_user_id OR session_id = ANY(owned_session_ids);
  DELETE FROM anonymous_result_capabilities WHERE session_id = ANY(owned_session_ids);
  DELETE FROM quiz_results WHERE user_id = p_user_id OR session_id = ANY(owned_session_ids);
  DELETE FROM quiz_sessions WHERE user_id = p_user_id;
  DELETE FROM user_privacy_preferences WHERE user_id = p_user_id;
  DELETE FROM users WHERE id = p_user_id;
END; $$;

CREATE OR REPLACE FUNCTION public.delete_anonymous_result_data(p_session_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Lock and prove anonymous eligibility before touching any dependent data.
  PERFORM 1 FROM quiz_sessions s
   WHERE s.id = p_session_id AND s.user_id IS NULL
     AND NOT EXISTS (SELECT 1 FROM quiz_results r WHERE r.session_id = s.id AND r.user_id IS NOT NULL)
     AND NOT EXISTS (SELECT 1 FROM feedback f WHERE f.session_id = s.id AND f.user_id IS NOT NULL)
     AND NOT EXISTS (SELECT 1 FROM result_email_leads l WHERE l.session_id::TEXT = s.id AND l.user_id IS NOT NULL)
   FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  DELETE FROM result_email_leads WHERE session_id::TEXT = p_session_id AND user_id IS NULL;
  DELETE FROM feedback WHERE session_id = p_session_id AND user_id IS NULL;
  DELETE FROM quiz_results WHERE session_id = p_session_id AND user_id IS NULL;
  DELETE FROM quiz_sessions WHERE id = p_session_id AND user_id IS NULL;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.purge_expired_anonymous_result_data()
RETURNS TABLE(deleted_sessions BIGINT, deleted_results BIGINT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_count BIGINT; session_count BIGINT;
BEGIN
  WITH candidates AS (
    SELECT s.id FROM quiz_sessions s WHERE s.user_id IS NULL AND s.created_at < NOW() - INTERVAL '30 days'
      AND NOT EXISTS (SELECT 1 FROM quiz_results r WHERE r.session_id=s.id AND r.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM feedback f WHERE f.session_id=s.id AND f.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM result_email_leads l WHERE l.session_id::TEXT=s.id AND l.user_id IS NOT NULL)
  ), removed_results AS (
    DELETE FROM quiz_results r USING candidates c WHERE r.session_id=c.id AND r.user_id IS NULL RETURNING r.id
  ) SELECT COUNT(*) INTO result_count FROM removed_results;
  WITH candidates AS (
    SELECT s.id FROM quiz_sessions s WHERE s.user_id IS NULL AND s.created_at < NOW() - INTERVAL '30 days'
      AND NOT EXISTS (SELECT 1 FROM quiz_results r WHERE r.session_id=s.id AND r.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM feedback f WHERE f.session_id=s.id AND f.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM result_email_leads l WHERE l.session_id::TEXT=s.id AND l.user_id IS NOT NULL)
  ), removed_leads AS (
    DELETE FROM result_email_leads l USING candidates c WHERE l.session_id::TEXT=c.id AND l.user_id IS NULL RETURNING l.id
  ), removed_feedback AS (
    DELETE FROM feedback f USING candidates c WHERE f.session_id=c.id AND f.user_id IS NULL RETURNING f.id
  ), removed_sessions AS (
    DELETE FROM quiz_sessions s USING candidates c WHERE s.id=c.id AND s.user_id IS NULL RETURNING s.id
  ) SELECT COUNT(*) INTO session_count FROM removed_sessions;
  RETURN QUERY SELECT session_count, result_count;
END; $$;

REVOKE ALL ON FUNCTION public.delete_account_data(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_anonymous_result_data(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_expired_anonymous_result_data() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_account_data(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_anonymous_result_data(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_anonymous_result_data() TO service_role;
COMMIT;
