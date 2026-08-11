-- Migration to switch to Custom Cookie Authentication
-- Run this in your Supabase SQL Editor

-- 1. Alter profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash text;

-- Generate new UUIDs for future rows (if not already set)
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Disable Row Level Security (RLS) on all tables
-- Since we are moving to Server-Side actions with secure cookies, we will use the Service Role Key for database ops, making RLS unnecessary.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines DISABLE ROW LEVEL SECURITY;

-- 3. Update Storage Policies for public uploads
-- Drop the restrictive RLS policies for prescriptions
DROP POLICY IF EXISTS "Users can insert their own prescription" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own prescription" ON storage.objects;

-- Allow public inserts to 'prescriptions' bucket
CREATE POLICY "Public can upload prescriptions" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'prescriptions' );

-- Allow public read of prescriptions (needed for admin dashboard and user tracking)
CREATE POLICY "Public can read prescriptions" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'prescriptions' );
