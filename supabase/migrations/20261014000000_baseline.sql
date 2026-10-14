-- Baseline of live kyr database captured 2026-10-14 from the catalog.
-- Reference baseline: verify with 'supabase db pull' before relying on it (table order may need adjusting for FKs).

CREATE TABLE IF NOT EXISTS public.anonymous_result_capabilities (  session_id text NOT NULL,   token_hash text NOT NULL,   expires_at timestamp with time zone NOT NULL,   created_at timestamp with time zone NOT NULL DEFAULT now(), CONSTRAINT anonymous_result_capabilities_check CHECK ((expires_at > created_at)), CONSTRAINT anonymous_result_capabilities_pkey PRIMARY KEY (session_id), CONSTRAINT anonymous_result_capabilities_session_id_fkey FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS public.big_five_responses (  id uuid NOT NULL DEFAULT gen_random_uuid(),   session_id uuid,   user_id uuid,   openness numeric,   conscientiousness numeric,   extraversion numeric,   agreeableness numeric,   neuroticism numeric,   created_at timestamp with time zone DEFAULT now(), CONSTRAINT big_five_responses_pkey PRIMARY KEY (id), CONSTRAINT big_five_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.career_matches (  id uuid NOT NULL DEFAULT gen_random_uuid(),   user_id uuid,   big_five_type text,   mbti_type text,   disc_type text,   career_title text,   match_score numeric,   created_at timestamp with time zone DEFAULT now(), CONSTRAINT career_matches_pkey PRIMARY KEY (id), CONSTRAINT career_matches_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS public.disc_responses (  id uuid NOT NULL DEFAULT gen_random_uuid(),   session_id uuid,   user_id uuid,   dominance numeric,   influence numeric,   steadiness numeric,   compliance numeric,   disc_type text,   created_at timestamp with time zone DEFAULT now(), CONSTRAINT disc_responses_pkey PRIMARY KEY (id), CONSTRAINT disc_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.feedback (  id text NOT NULL DEFAULT (gen_random_uuid())::text,   session_id text,   useful_app text,   results_accurate text,   questions_engaging text,   would_share text,   suggestions text,   mbti_type text,   disc_style text,   primary_role text,   tier text,   mood text,   fun_mode boolean,   created_at timestamp with time zone DEFAULT now(),   first_reaction text,   first_reaction_text text,   accuracy_score integer,   accuracy_surprise text,   personality_rating integer,   career_rating integer,   mood_lab_rating integer,   visual_rating integer,   share_card_rating integer,   most_valuable_feature text,   retake_quiz text,   shared_results text,   nps_score integer,   career_relevance integer,   feels_designed_for_you text,   college_suggestions text,   bugs_issues text,   email text,   anything_else text,   quiz_type text,   user_id text, CONSTRAINT feedback_pkey PRIMARY KEY (id), CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.job_roles (  role_number integer NOT NULL DEFAULT nextval('job_roles_role_number_seq'::regclass),   role_name text NOT NULL,   category text,   description text,   mbti_best text[],   mbti_avoid text[],   disc_prefs text[],   big_five_avg jsonb,   salary_min integer,   salary_max integer,   growth_rate text,   created_at timestamp with time zone DEFAULT now(), CONSTRAINT job_roles_pkey PRIMARY KEY (role_number), CONSTRAINT job_roles_role_name_key UNIQUE (role_name));
CREATE TABLE IF NOT EXISTS public.mbti_responses (  id uuid NOT NULL DEFAULT gen_random_uuid(),   session_id uuid,   user_id uuid,   ie_score numeric,   ns_score numeric,   tf_score numeric,   jp_score numeric,   mbti_type text,   created_at timestamp with time zone DEFAULT now(), CONSTRAINT mbti_responses_pkey PRIMARY KEY (id), CONSTRAINT mbti_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.pilot_direction_feedback (  id uuid NOT NULL DEFAULT gen_random_uuid(),   result_id text NOT NULL,   session_id text NOT NULL,   user_id text,   direction_title text NOT NULL,   accuracy_rating smallint NOT NULL,   most_useful_recommendation text,   least_useful_recommendation text,   improvement_note text,   source text NOT NULL DEFAULT 'shortform_v2_controlled_pilot'::text,   submitted_at timestamp with time zone NOT NULL DEFAULT now(),   created_at timestamp with time zone NOT NULL DEFAULT now(), CONSTRAINT pilot_direction_feedback_accuracy_rating_check CHECK (((accuracy_rating >= 1) AND (accuracy_rating <= 5))), CONSTRAINT pilot_direction_feedback_direction_title_check CHECK (((char_length(direction_title) >= 1) AND (char_length(direction_title) <= 180))), CONSTRAINT pilot_direction_feedback_distinct_recommendations CHECK (((most_useful_recommendation IS NULL) OR (least_useful_recommendation IS NULL) OR (most_useful_recommendation <> least_useful_recommendation))), CONSTRAINT pilot_direction_feedback_improvement_note_check CHECK ((char_length(improvement_note) <= 500)), CONSTRAINT pilot_direction_feedback_least_useful_recommendation_check CHECK ((char_length(least_useful_recommendation) <= 180)), CONSTRAINT pilot_direction_feedback_most_useful_recommendation_check CHECK ((char_length(most_useful_recommendation) <= 180)), CONSTRAINT pilot_direction_feedback_one_per_result UNIQUE (result_id), CONSTRAINT pilot_direction_feedback_pkey PRIMARY KEY (id), CONSTRAINT pilot_direction_feedback_result_id_fkey FOREIGN KEY (result_id) REFERENCES quiz_results(id) ON DELETE CASCADE, CONSTRAINT pilot_direction_feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE, CONSTRAINT pilot_direction_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.premium_insights (  id text NOT NULL DEFAULT (gen_random_uuid())::text,   archetype text NOT NULL,   side_hustles jsonb,   blindspots jsonb,   career_paths jsonb,   growth_tips jsonb,   strengths jsonb,   communication jsonb,   environments jsonb,   relationships jsonb,   created_at timestamp with time zone DEFAULT now(), CONSTRAINT premium_insights_pkey PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS public.profiles (  id uuid NOT NULL,   email text,   created_at timestamp with time zone DEFAULT now(),   updated_at timestamp with time zone DEFAULT now(), CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE, CONSTRAINT profiles_pkey PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS public.quiz_results (  id text NOT NULL,   user_id text,   session_id text,   responses jsonb NOT NULL,   created_at timestamp with time zone DEFAULT now(),   updated_at timestamp with time zone DEFAULT now(),   deleted boolean DEFAULT false,   primary_role text NOT NULL,   secondary_role text NOT NULL,   mbti text NOT NULL,   disc text NOT NULL,   big_five text NOT NULL,   q1 smallint NOT NULL,   q2 smallint NOT NULL,   q3 smallint NOT NULL,   q4 smallint NOT NULL,   q5 smallint NOT NULL,   q6 smallint NOT NULL,   q7 smallint NOT NULL,   q8 smallint NOT NULL,   q9 smallint NOT NULL,   q10 smallint NOT NULL,   q11 smallint NOT NULL,   q12 smallint NOT NULL,   q13 smallint NOT NULL,   q14 smallint NOT NULL,   q15 smallint NOT NULL,   q16 smallint NOT NULL,   q17 smallint NOT NULL,   q18 smallint NOT NULL,   q19 smallint NOT NULL,   q20 smallint NOT NULL,   q21 smallint NOT NULL,   q22 smallint NOT NULL,   q23 smallint NOT NULL,   q24 smallint NOT NULL,   q25 smallint NOT NULL,   q26 smallint NOT NULL,   q27 smallint NOT NULL,   q28 smallint NOT NULL,   quiz_started_at timestamp with time zone,   quiz_completed_at timestamp with time zone,   quiz_duration_seconds integer, CONSTRAINT quiz_results_canonical_dto_check CHECK (((jsonb_typeof(responses) = 'object'::text) AND (jsonb_typeof((responses -> 'dto'::text)) = 'object'::text) AND (jsonb_typeof((((responses -> 'dto'::text) -> 'raw'::text) -> 'responses'::text)) = 'array'::text) AND (jsonb_typeof(((responses -> 'dto'::text) -> 'scores'::text)) = 'object'::text) AND (jsonb_typeof(((responses -> 'dto'::text) -> 'careerMatches'::text)) = 'array'::text))), CONSTRAINT quiz_results_fixed_answer_cells_check CHECK ((((q1 >= 1) AND (q1 <= 4)) AND ((q2 >= 1) AND (q2 <= 4)) AND ((q3 >= 1) AND (q3 <= 4)) AND ((q4 >= 1) AND (q4 <= 4)) AND ((q5 >= 1) AND (q5 <= 4)) AND ((q6 >= 1) AND (q6 <= 4)) AND ((q7 >= 1) AND (q7 <= 4)) AND ((q8 >= 1) AND (q8 <= 4)) AND ((q9 >= 1) AND (q9 <= 4)) AND ((q10 >= 1) AND (q10 <= 4)) AND ((q11 >= 1) AND (q11 <= 4)) AND ((q12 >= 1) AND (q12 <= 4)) AND ((q13 >= 1) AND (q13 <= 4)) AND ((q14 >= 1) AND (q14 <= 4)) AND ((q15 >= 1) AND (q15 <= 4)) AND ((q16 >= 1) AND (q16 <= 4)) AND ((q17 >= 1) AND (q17 <= 4)) AND ((q18 >= 1) AND (q18 <= 4)) AND ((q19 >= 1) AND (q19 <= 4)) AND ((q20 >= 1) AND (q20 <= 4)) AND ((q21 >= 1) AND (q21 <= 4)) AND ((q22 >= 1) AND (q22 <= 4)) AND ((q23 >= 1) AND (q23 <= 4)) AND ((q24 >= 1) AND (q24 <= 4)) AND ((q25 >= 1) AND (q25 <= 4)) AND ((q26 >= 1) AND (q26 <= 4)) AND ((q27 >= 1) AND (q27 <= 4)) AND ((q28 >= 1) AND (q28 <= 4)))), CONSTRAINT quiz_results_pkey PRIMARY KEY (id), CONSTRAINT quiz_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE SET NULL, CONSTRAINT quiz_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.quiz_sessions (  id text NOT NULL DEFAULT (gen_random_uuid())::text,   user_id text,   tier text NOT NULL,   mood text DEFAULT 'neutral'::text,   fun_mode boolean DEFAULT false,   landmark text,   theme text DEFAULT 'compass'::text,   created_at timestamp with time zone DEFAULT now(),   started_at timestamp with time zone,   completed_at timestamp with time zone, CONSTRAINT quiz_sessions_pkey PRIMARY KEY (id), CONSTRAINT quiz_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.result_email_leads (  id uuid NOT NULL DEFAULT gen_random_uuid(),   email text NOT NULL,   normalized_email text NOT NULL,   session_id uuid,   result_id uuid,   mbti_type text,   disc_style text,   primary_role_title text,   source text NOT NULL DEFAULT 'results_page'::text,   consent_result_summary boolean NOT NULL DEFAULT true,   consent_marketing boolean NOT NULL DEFAULT false,   delivery_requested boolean NOT NULL DEFAULT true,   delivery_status text NOT NULL DEFAULT 'not_sent'::text,   user_agent text,   referrer text,   created_at timestamp with time zone NOT NULL DEFAULT now(),   updated_at timestamp with time zone NOT NULL DEFAULT now(),   deleted boolean NOT NULL DEFAULT false,   user_id text, CONSTRAINT result_email_leads_delivery_status_check CHECK ((delivery_status = ANY (ARRAY['not_sent'::text, 'queued'::text, 'sent'::text, 'failed'::text]))), CONSTRAINT result_email_leads_normalized_email_check CHECK ((normalized_email = lower(TRIM(BOTH FROM email)))), CONSTRAINT result_email_leads_pkey PRIMARY KEY (id), CONSTRAINT result_email_leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.trait_combinations (  id text NOT NULL DEFAULT (gen_random_uuid())::text,   trait_1 text NOT NULL,   trait_1_level text NOT NULL,   trait_2 text NOT NULL,   trait_2_level text NOT NULL,   combo_title text NOT NULL,   combo_desc text NOT NULL,   created_at timestamp with time zone DEFAULT now(), CONSTRAINT trait_combinations_pkey PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS public.trait_vibes (  id text NOT NULL DEFAULT (gen_random_uuid())::text,   trait text NOT NULL,   quartile text NOT NULL,   score_min integer NOT NULL,   score_max integer NOT NULL,   vibe_title text NOT NULL,   vibe_desc text NOT NULL,   created_at timestamp with time zone DEFAULT now(), CONSTRAINT trait_vibes_pkey PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS public.user_privacy_preferences (  user_id text NOT NULL,   data_collection boolean NOT NULL DEFAULT true,   analytics boolean NOT NULL DEFAULT true,   marketing boolean NOT NULL DEFAULT false,   data_retention text NOT NULL DEFAULT 'active'::text,   ccpa_opt_out boolean NOT NULL DEFAULT false,   created_at timestamp with time zone NOT NULL DEFAULT now(),   updated_at timestamp with time zone NOT NULL DEFAULT now(), CONSTRAINT user_privacy_preferences_data_retention_check CHECK ((data_retention = ANY (ARRAY['active'::text, '30days'::text, '90days'::text, 'deleted'::text]))), CONSTRAINT user_privacy_preferences_pkey PRIMARY KEY (user_id), CONSTRAINT user_privacy_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS public.users (  id text NOT NULL,   email text,   first_name text,   last_name text,   avatar_url text,   is_premium boolean DEFAULT false,   premium_purchased_at timestamp with time zone,   created_at timestamp with time zone DEFAULT now(),   updated_at timestamp with time zone DEFAULT now(), CONSTRAINT users_email_key UNIQUE (email), CONSTRAINT users_pkey PRIMARY KEY (id));
ALTER TABLE public.anonymous_result_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.big_five_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disc_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mbti_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_direction_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_email_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trait_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trait_vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own big_five" ON public.big_five_responses AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own big_five" ON public.big_five_responses AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own careers" ON public.career_matches AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own careers" ON public.career_matches AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own disc" ON public.disc_responses AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own disc" ON public.disc_responses AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY feedback_select_service_role ON public.feedback AS PERMISSIVE FOR SELECT TO service_role USING (true);
CREATE POLICY feedback_insert_any ON public.feedback AS PERMISSIVE FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);
CREATE POLICY job_roles_select_any ON public.job_roles AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can view own mbti" ON public.mbti_responses AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own mbti" ON public.mbti_responses AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY pilot_direction_feedback_service_role_all ON public.pilot_direction_feedback AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY premium_insights_select_service_role ON public.premium_insights AS PERMISSIVE FOR SELECT TO service_role USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = id));
CREATE POLICY "Users can insert own profile" ON public.profiles AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can view own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));
CREATE POLICY quiz_results_service_role_all ON public.quiz_results AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY quiz_sessions_service_role_all ON public.quiz_sessions AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY result_email_leads_service_role_all ON public.result_email_leads AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY trait_combinations_select_any ON public.trait_combinations AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY trait_vibes_select_any ON public.trait_vibes AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY users_service_role_all ON public.users AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE OR REPLACE VIEW public.quiz_results_reporting WITH (security_invoker = true) AS  SELECT created_at,
    updated_at,
    quiz_started_at,
    quiz_completed_at,
    quiz_duration_seconds,
    primary_role,
    secondary_role,
    mbti,
    disc,
    big_five,
    id,
    user_id,
    session_id,
    responses,
    deleted,
    q1,
    q2,
    q3,
    q4,
    q5,
    q6,
    q7,
    q8,
    q9,
    q10,
    q11,
    q12,
    q13,
    q14,
    q15,
    q16,
    q17,
    q18,
    q19,
    q20,
    q21,
    q22,
    q23,
    q24,
    q25,
    q26,
    q27,
    q28
   FROM quiz_results
  ORDER BY quiz_completed_at DESC NULLS LAST, created_at DESC;
CREATE INDEX anonymous_result_capabilities_expires_at_idx ON public.anonymous_result_capabilities USING btree (expires_at);
CREATE INDEX feedback_session_id_idx ON public.feedback USING btree (session_id) WHERE (session_id IS NOT NULL);
CREATE INDEX feedback_user_id_idx ON public.feedback USING btree (user_id) WHERE (user_id IS NOT NULL);
CREATE INDEX idx_result_email_leads_created_at ON public.result_email_leads USING btree (created_at DESC);
CREATE INDEX idx_result_email_leads_normalized_email ON public.result_email_leads USING btree (normalized_email);
CREATE INDEX idx_result_email_leads_session_id ON public.result_email_leads USING btree (session_id);
CREATE INDEX pilot_direction_feedback_session_id_idx ON public.pilot_direction_feedback USING btree (session_id);
CREATE INDEX pilot_direction_feedback_submitted_at_idx ON public.pilot_direction_feedback USING btree (submitted_at DESC);
CREATE INDEX quiz_results_completed_at_desc_idx ON public.quiz_results USING btree (quiz_completed_at DESC) WHERE (deleted = false);
CREATE INDEX quiz_results_disc_idx ON public.quiz_results USING btree (disc) WHERE (deleted = false);
CREATE INDEX quiz_results_mbti_idx ON public.quiz_results USING btree (mbti) WHERE (deleted = false);
CREATE UNIQUE INDEX quiz_results_one_result_per_session_idx ON public.quiz_results USING btree (session_id) WHERE (session_id IS NOT NULL);
CREATE INDEX quiz_results_primary_role_idx ON public.quiz_results USING btree (primary_role) WHERE (deleted = false);
CREATE INDEX quiz_results_user_history_idx ON public.quiz_results USING btree (user_id, created_at DESC) WHERE (user_id IS NOT NULL);
CREATE INDEX quiz_sessions_anonymous_created_at_idx ON public.quiz_sessions USING btree (created_at) WHERE (user_id IS NULL);
CREATE INDEX result_email_leads_session_id_idx ON public.result_email_leads USING btree (session_id);
CREATE INDEX result_email_leads_user_id_idx ON public.result_email_leads USING btree (user_id) WHERE (user_id IS NOT NULL);
