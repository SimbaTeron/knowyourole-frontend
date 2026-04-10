-- KnowYouRole — Initial Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor, or: supabase db push

-- Drop existing tables first (safe to run even if they don't exist)
DROP TABLE IF EXISTS quiz_sessions CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_feedback CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS job_roles CASCADE;
DROP TABLE IF EXISTS premium_subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users (mirrors Auth0 user ID) ─────────────────────────────────────────
CREATE TABLE public.users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE,
  first_name  TEXT,
  last_name   TEXT,
  avatar_url  TEXT,
  is_premium  BOOLEAN DEFAULT FALSE,
  premium_purchased_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Quiz Sessions ────────────────────────────────────────────────────────────
CREATE TABLE public.quiz_sessions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  tier        TEXT NOT NULL,
  mood        TEXT DEFAULT 'neutral',
  fun_mode    BOOLEAN DEFAULT FALSE,
  landmark    TEXT,
  theme       TEXT DEFAULT 'compass',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Quiz Results ────────────────────────────────────────────────────────────
CREATE TABLE public.quiz_results (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  session_id            TEXT REFERENCES public.quiz_sessions(id) ON DELETE SET NULL,
  tier                  TEXT NOT NULL,
  mood                  TEXT,
  fun_mode              BOOLEAN DEFAULT FALSE,
  landmark              TEXT,
  mbti_type             TEXT NOT NULL,
  mbti_blend            TEXT,
  disc_style            TEXT NOT NULL,
  primary_role_title     TEXT,
  secondary_role_title   TEXT,
  big_five_o            INTEGER NOT NULL,
  big_five_c            INTEGER NOT NULL,
  big_five_e            INTEGER NOT NULL,
  big_five_a            INTEGER NOT NULL,
  big_five_n            INTEGER NOT NULL,
  critical_thinking     INTEGER,
  first_principles      INTEGER,
  total_questions       INTEGER,
  avg_response_time     NUMERIC(6,2),
  engagement_score      INTEGER,
  responses             JSONB,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Trait Vibes ─────────────────────────────────────────────────────────────
CREATE TABLE public.trait_vibes (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  trait       TEXT NOT NULL,
  quartile    TEXT NOT NULL,
  score_min   INTEGER NOT NULL,
  score_max   INTEGER NOT NULL,
  vibe_title  TEXT NOT NULL,
  vibe_desc   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Trait Combinations ───────────────────────────────────────────────────────
CREATE TABLE public.trait_combinations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  trait_1         TEXT NOT NULL,
  trait_1_level   TEXT NOT NULL,
  trait_2         TEXT NOT NULL,
  trait_2_level   TEXT NOT NULL,
  combo_title     TEXT NOT NULL,
  combo_desc     TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Premium Insights ─────────────────────────────────────────────────────────
CREATE TABLE public.premium_insights (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  archetype       TEXT NOT NULL,
  side_hustles    JSONB,
  blindspots      JSONB,
  career_paths    JSONB,
  growth_tips     JSONB,
  strengths       JSONB,
  communication   JSONB,
  environments    JSONB,
  relationships   JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Job Roles ────────────────────────────────────────────────────────────────
CREATE TABLE public.job_roles (
  role_number   SERIAL PRIMARY KEY,
  role_name     TEXT UNIQUE NOT NULL,
  category      TEXT,
  description   TEXT,
  mbti_best     TEXT[],
  mbti_avoid    TEXT[],
  disc_prefs    TEXT[],
  big_five_avg  JSONB,
  salary_min    INTEGER,
  salary_max    INTEGER,
  growth_rate   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Feedback ────────────────────────────────────────────────────────────────
CREATE TABLE public.feedback (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id      TEXT,
  useful_app      TEXT,
  results_accurate TEXT,
  questions_engaging TEXT,
  would_share     TEXT,
  suggestions     TEXT,
  mbti_type       TEXT,
  disc_style      TEXT,
  primary_role    TEXT,
  tier            TEXT,
  mood            TEXT,
  fun_mode        BOOLEAN,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (true);

CREATE POLICY "quiz_results_insert_any" ON public.quiz_results FOR INSERT WITH CHECK (true);
CREATE POLICY "quiz_results_select_any" ON public.quiz_results FOR SELECT USING (true);

CREATE POLICY "sessions_insert_any" ON public.quiz_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_select_any" ON public.quiz_sessions FOR SELECT USING (true);

CREATE POLICY "feedback_insert_any" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "feedback_select_any" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "job_roles_select_any" ON public.job_roles FOR SELECT TO anon USING (true);
CREATE POLICY "trait_vibes_select_any" ON public.trait_vibes FOR SELECT TO anon USING (true);
CREATE POLICY "premium_insights_select_any" ON public.premium_insights FOR SELECT TO anon USING (true);