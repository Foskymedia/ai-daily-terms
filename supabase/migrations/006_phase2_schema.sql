-- Migration 006: Phase 2 — streak tracking, levels, milestones, confidence, spaced repetition

-- Streak + level columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_streak int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date date,
  ADD COLUMN IF NOT EXISTS level int NOT NULL DEFAULT 1;

-- Confidence rating + spaced-repetition date on user_progress
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS confidence int CHECK (confidence BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS next_review_date date;

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text      NOT NULL,
  achieved_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_type)
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON public.milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);
