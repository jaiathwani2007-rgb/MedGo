CREATE TABLE public.medicines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  generic_name text,
  brand_name text,
  price numeric(10, 2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  requires_prescription boolean NOT NULL DEFAULT false,
  is_otc_whitelisted boolean NOT NULL DEFAULT false,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Public can read medicines
CREATE POLICY "Medicines are viewable by everyone."
  ON public.medicines FOR SELECT
  USING ( true );

-- Note: Admin writes will be performed using the Supabase Service Role Key 
-- from server actions, bypassing RLS, because admin auth uses a shared password.
