-- Migration: 002_add_feedback_columns
-- Adds all rich feedback form fields to the feedback table
-- to match what the feedback form at knowyourole-feedback.vercel.app sends

ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS first_reaction TEXT,
  ADD COLUMN IF NOT EXISTS first_reaction_text TEXT,
  ADD COLUMN IF NOT EXISTS accuracy_score INTEGER,
  ADD COLUMN IF NOT EXISTS accuracy_surprise TEXT,
  ADD COLUMN IF NOT EXISTS personality_rating INTEGER,
  ADD COLUMN IF NOT EXISTS career_rating INTEGER,
  ADD COLUMN IF NOT EXISTS mood_lab_rating INTEGER,
  ADD COLUMN IF NOT EXISTS visual_rating INTEGER,
  ADD COLUMN IF NOT EXISTS share_card_rating INTEGER,
  ADD COLUMN IF NOT EXISTS most_valuable_feature TEXT,
  ADD COLUMN IF NOT EXISTS retake_quiz TEXT,
  ADD COLUMN IF NOT EXISTS shared_results TEXT,
  ADD COLUMN IF NOT EXISTS nps_score INTEGER,
  ADD COLUMN IF NOT EXISTS career_relevance INTEGER,
  ADD COLUMN IF NOT EXISTS feels_designed_for_you TEXT,
  ADD COLUMN IF NOT EXISTS college_suggestions TEXT,
  ADD COLUMN IF NOT EXISTS bugs_issues TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS anything_else TEXT,
  ADD COLUMN IF NOT EXISTS quiz_type TEXT;

-- Drop unused old columns (optional - keeping them for backward compat)
-- ALTER TABLE public.feedback DROP COLUMN IF EXISTS useful_app;
-- ALTER TABLE public.feedback DROP COLUMN IF EXISTS results_accurate;
-- ALTER TABLE public.feedback DROP COLUMN IF EXISTS questions_engaging;
-- ALTER TABLE public.feedback DROP COLUMN IF EXISTS would_share;
