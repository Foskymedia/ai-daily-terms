-- Migration 005: Add onboarding_completed to profiles
-- Tracks whether a user has seen the welcome onboarding flow

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
