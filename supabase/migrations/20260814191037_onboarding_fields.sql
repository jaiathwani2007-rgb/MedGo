-- Add alternate_phone and onboarding_completed to profiles

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS alternate_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
