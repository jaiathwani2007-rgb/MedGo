-- Add category column to medicines table
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General';
