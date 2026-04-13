-- Migration 007: Learning system — daily session tracking + quiz attempt log
-- Extends existing schema; does not modify any existing columns.

-- ── daily_progress ────────────────────────────────────────────────────────────
-- Tracks the 3-step daily session per user per calendar day.
-- A day is "complete" when term_viewed AND (flashcard_done OR quiz_done).

CREATE TABLE IF NOT EXISTS public.daily_progress (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date           date        NOT NULL,
  term_viewed    boolean     NOT NULL DEFAULT false,
  flashcard_done boolean     NOT NULL DEFAULT false,
  quiz_done      boolean     NOT NULL DEFAULT false,
  completed_at   timestamptz,                    -- set when first qualifying combo is hit
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own daily_progress"
  ON public.daily_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── quiz_attempts ─────────────────────────────────────────────────────────────
-- Stores one row per quiz answer for accuracy tracking and weak-area analysis.

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term_id    uuid        NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  correct    boolean     NOT NULL,
  category   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own quiz_attempts"
  ON public.quiz_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast per-user accuracy lookups
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON public.quiz_attempts (user_id);
