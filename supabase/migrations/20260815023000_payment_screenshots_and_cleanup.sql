-- 1. Add payment_screenshot_path to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_path text;

-- 2. Create 'payments' storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payments', 'payments', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for payments bucket
-- Users can insert their own payment screenshots
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Everyone can view payments (since it's a public bucket, or we can restrict to admins)
-- Actually, the URL will be public, so just allow select
CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payments');

-- 3. Set up pg_cron to automatically delete orders older than 30 days
-- Note: Requires pg_cron extension which is enabled by default on Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run daily at midnight
SELECT cron.schedule(
  'delete-old-orders',
  '0 0 * * *', 
  $$ DELETE FROM public.orders WHERE created_at < NOW() - INTERVAL '30 days'; $$
);
