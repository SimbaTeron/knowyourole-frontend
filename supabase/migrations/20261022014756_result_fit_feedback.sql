-- Optional one-tap "Did this fit you?" answers.
-- Each row belongs to one quiz result. Deleting that result or its session
-- removes the row. Anonymous rows are also deleted once they are 30 days old.
-- Apply this file on the production database yourself. Do not run it from a
-- preview, CI, or local environment against the hosted project.

BEGIN;

CREATE TABLE public.result_fit_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id text NOT NULL,
  session_id text NOT NULL,
  user_id text,
  result_type text NOT NULL,
  scoring_version text NOT NULL,
  fit text NOT NULL,
  rating smallint,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT result_fit_feedback_result_id_fkey
    FOREIGN KEY (result_id) REFERENCES public.quiz_results (id) ON DELETE CASCADE,
  CONSTRAINT result_fit_feedback_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES public.quiz_sessions (id) ON DELETE CASCADE,
  CONSTRAINT result_fit_feedback_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT result_fit_feedback_one_per_result UNIQUE (result_id),
  CONSTRAINT result_fit_feedback_fit_check CHECK (fit IN ('yes', 'somewhat', 'no')),
  CONSTRAINT result_fit_feedback_rating_check CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  CONSTRAINT result_fit_feedback_comment_check CHECK (comment IS NULL OR (char_length(comment) >= 1 AND char_length(comment) <= 500)),
  CONSTRAINT result_fit_feedback_result_type_check CHECK (char_length(result_type) >= 1 AND char_length(result_type) <= 32),
  CONSTRAINT result_fit_feedback_scoring_version_check CHECK (char_length(scoring_version) >= 1 AND char_length(scoring_version) <= 80)
);

CREATE INDEX result_fit_feedback_session_id_idx
  ON public.result_fit_feedback (session_id);
CREATE INDEX result_fit_feedback_type_version_idx
  ON public.result_fit_feedback (result_type, scoring_version);
CREATE INDEX result_fit_feedback_anonymous_created_at_idx
  ON public.result_fit_feedback (created_at)
  WHERE user_id IS NULL;

ALTER TABLE public.result_fit_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.result_fit_feedback FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.result_fit_feedback TO service_role;

CREATE POLICY result_fit_feedback_service_role_all
  ON public.result_fit_feedback
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Account erasure removes fit feedback with the rest of that account's data.
CREATE OR REPLACE FUNCTION public.delete_account_data(p_user_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owned_session_ids TEXT[];
BEGIN
  SELECT COALESCE(array_agg(id), ARRAY[]::TEXT[]) INTO owned_session_ids FROM quiz_sessions WHERE user_id = p_user_id;
  DELETE FROM result_email_leads WHERE user_id = p_user_id OR session_id::TEXT = ANY(owned_session_ids);
  DELETE FROM feedback WHERE user_id = p_user_id OR session_id = ANY(owned_session_ids);
  DELETE FROM result_fit_feedback WHERE user_id = p_user_id OR session_id = ANY(owned_session_ids);
  DELETE FROM anonymous_result_capabilities WHERE session_id = ANY(owned_session_ids);
  DELETE FROM quiz_results WHERE user_id = p_user_id OR session_id = ANY(owned_session_ids);
  DELETE FROM quiz_sessions WHERE user_id = p_user_id;
  DELETE FROM user_privacy_preferences WHERE user_id = p_user_id;
  DELETE FROM users WHERE id = p_user_id;
END; $$;

-- On-request deletion of an anonymous result removes its fit feedback too.
CREATE OR REPLACE FUNCTION public.delete_anonymous_result_data(p_session_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM 1 FROM quiz_sessions s
   WHERE s.id = p_session_id AND s.user_id IS NULL
     AND NOT EXISTS (SELECT 1 FROM quiz_results r WHERE r.session_id = s.id AND r.user_id IS NOT NULL)
     AND NOT EXISTS (SELECT 1 FROM feedback f WHERE f.session_id = s.id AND f.user_id IS NOT NULL)
     AND NOT EXISTS (SELECT 1 FROM result_fit_feedback rf WHERE rf.session_id = s.id AND rf.user_id IS NOT NULL)
     AND NOT EXISTS (SELECT 1 FROM result_email_leads l WHERE l.session_id::TEXT = s.id AND l.user_id IS NOT NULL)
   FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  DELETE FROM result_email_leads WHERE session_id::TEXT = p_session_id AND user_id IS NULL;
  DELETE FROM feedback WHERE session_id = p_session_id AND user_id IS NULL;
  DELETE FROM result_fit_feedback WHERE session_id = p_session_id AND user_id IS NULL;
  DELETE FROM quiz_results WHERE session_id = p_session_id AND user_id IS NULL;
  DELETE FROM quiz_sessions WHERE id = p_session_id AND user_id IS NULL;
  RETURN TRUE;
END; $$;

-- Nightly purge: fit feedback leaves with the anonymous result, and any
-- anonymous fit row older than 30 days is removed even if it was orphaned.
CREATE OR REPLACE FUNCTION public.purge_expired_anonymous_result_data()
RETURNS TABLE(deleted_sessions BIGINT, deleted_results BIGINT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_count BIGINT; session_count BIGINT;
BEGIN
  WITH candidates AS (
    SELECT s.id FROM quiz_sessions s WHERE s.user_id IS NULL AND s.created_at < NOW() - INTERVAL '30 days'
      AND NOT EXISTS (SELECT 1 FROM quiz_results r WHERE r.session_id=s.id AND r.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM feedback f WHERE f.session_id=s.id AND f.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM result_fit_feedback rf WHERE rf.session_id=s.id AND rf.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM result_email_leads l WHERE l.session_id::TEXT=s.id AND l.user_id IS NOT NULL)
  ), removed_results AS (
    DELETE FROM quiz_results r USING candidates c WHERE r.session_id=c.id AND r.user_id IS NULL RETURNING r.id
  ) SELECT COUNT(*) INTO result_count FROM removed_results;
  WITH candidates AS (
    SELECT s.id FROM quiz_sessions s WHERE s.user_id IS NULL AND s.created_at < NOW() - INTERVAL '30 days'
      AND NOT EXISTS (SELECT 1 FROM quiz_results r WHERE r.session_id=s.id AND r.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM feedback f WHERE f.session_id=s.id AND f.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM result_fit_feedback rf WHERE rf.session_id=s.id AND rf.user_id IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM result_email_leads l WHERE l.session_id::TEXT=s.id AND l.user_id IS NOT NULL)
  ), removed_leads AS (
    DELETE FROM result_email_leads l USING candidates c WHERE l.session_id::TEXT=c.id AND l.user_id IS NULL RETURNING l.id
  ), removed_feedback AS (
    DELETE FROM feedback f USING candidates c WHERE f.session_id=c.id AND f.user_id IS NULL RETURNING f.id
  ), removed_fit AS (
    DELETE FROM result_fit_feedback rf USING candidates c WHERE rf.session_id=c.id AND rf.user_id IS NULL RETURNING rf.id
  ), removed_sessions AS (
    DELETE FROM quiz_sessions s USING candidates c WHERE s.id=c.id AND s.user_id IS NULL RETURNING s.id
  ) SELECT COUNT(*) INTO session_count FROM removed_sessions;
  DELETE FROM result_fit_feedback
   WHERE user_id IS NULL
     AND created_at < NOW() - INTERVAL '30 days';
  RETURN QUERY SELECT session_count, result_count;
END; $$;

REVOKE ALL ON FUNCTION public.delete_account_data(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_anonymous_result_data(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_expired_anonymous_result_data() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_account_data(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_anonymous_result_data(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_anonymous_result_data() TO service_role;

COMMIT;
