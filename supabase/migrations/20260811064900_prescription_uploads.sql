CREATE TABLE public.prescription_uploads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid, -- Nullable initially, updated when order is submitted
  storage_path text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.prescription_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own uploads"
  ON public.prescription_uploads FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own uploads"
  ON public.prescription_uploads FOR SELECT
  USING (auth.uid() = profile_id);

-- Setup Storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the prescriptions bucket
CREATE POLICY "Users can upload own prescriptions"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own prescriptions"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);
